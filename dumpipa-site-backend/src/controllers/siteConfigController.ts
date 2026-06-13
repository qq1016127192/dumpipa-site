import { Request, Response } from 'express'
import { query } from '../config/database'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'

/**
 * 获取分站配置（用于与主站对接的token等）
 */
export async function getSiteConfig(req: Request, res: Response): Promise<void> {
  try {
    const { key } = req.query
    
    if (key) {
      // 获取单个配置
      const configs = await query<any[]>(
        'SELECT config_key, config_value, description FROM site_config WHERE config_key = ?',
        [key]
      )
      
      if (configs.length === 0) {
        error(res, '配置不存在', 404)
        return
      }
      
      success(res, { config: configs[0] })
    } else {
      // 获取所有配置
      const configs = await query<any[]>(
        'SELECT config_key, config_value, description FROM site_config'
      )
      
      const configMap: any = {}
      for (const item of configs) {
        configMap[item.config_key] = {
          value: item.config_value,
          description: item.description,
        }
      }
      
      success(res, { configs: configMap })
    }
  } catch (err: any) {
    logger.error('获取分站配置失败:', err)
    error(res, '获取分站配置失败', 500)
  }
}

/**
 * 更新分站配置
 */
export async function updateSiteConfig(req: Request, res: Response): Promise<void> {
  try {
    const { key, value, description } = req.body
    
    if (!key) {
      error(res, '配置键名不能为空', 400)
      return
    }
    
    // 检查配置是否存在
    const existing = await query<any[]>(
      'SELECT id FROM site_config WHERE config_key = ?',
      [key]
    )
    
    if (existing.length > 0) {
      // 更新
      await query(
        'UPDATE site_config SET config_value = ?, description = ? WHERE config_key = ?',
        [value || null, description || null, key]
      )
    } else {
      // 插入
      await query(
        'INSERT INTO site_config (config_key, config_value, description) VALUES (?, ?, ?)',
        [key, value || null, description || null]
      )
    }
    
    success(res, { message: '配置更新成功' })
  } catch (err: any) {
    logger.error('更新分站配置失败:', err)
    error(res, '更新分站配置失败', 500)
  }
}

/**
 * 获取主站Token（用于对接）
 */
export async function getMainSiteToken(req: Request, res: Response): Promise<void> {
  try {
    // 先尝试查询包含extra_data，如果字段不存在则只查询config_value
    let configs: any[]
    try {
      configs = await query<any[]>(
        'SELECT config_value, extra_data FROM site_config WHERE config_key = ?',
        ['main_site_token']
      )
    } catch (err: any) {
      // 如果extra_data字段不存在，只查询config_value
      if (err.code === 'ER_BAD_FIELD_ERROR' && err.message?.includes('extra_data')) {
        configs = await query<any[]>(
          'SELECT config_value FROM site_config WHERE config_key = ?',
          ['main_site_token']
        )
      } else {
        throw err
      }
    }
    
    if (configs.length === 0 || !configs[0].config_value) {
      error(res, '主站Token未配置，请先在配置管理中设置', 404)
      return
    }
    
    // 返回脱敏的token（只显示前8位和后4位）
    const token = configs[0].config_value
    const maskedToken = token.length > 12
      ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
      : token.substring(0, 8) + '...'
    
    // 解析extra_data获取过期时间（如果字段存在）
    let expiresAt: string | null = null
    let isExpired = false
    try {
      if (configs[0].extra_data) {
        const extraData = JSON.parse(configs[0].extra_data)
        expiresAt = extraData.expires_at || null
        if (expiresAt) {
          isExpired = new Date(expiresAt) < new Date()
        }
      }
    } catch (err) {
      // 如果解析失败，忽略
    }
    
    // 如果没有存储的过期时间，尝试从主站API实时查询（仅在返回时查询，不更新数据库）
    if (!expiresAt) {
      try {
        const { expires_at } = await parseTokenExpiration(token)
        expiresAt = expires_at || null
        if (expiresAt) {
          isExpired = new Date(expiresAt) < new Date()
        }
      } catch (err) {
        // 查询失败时忽略
      }
    }
    
    success(res, {
      token: configs[0].config_value, // 返回完整token供使用
      token_preview: maskedToken, // 脱敏显示
      expires_at: expiresAt, // 过期时间
      is_expired: isExpired, // 是否已过期
    })
  } catch (err: any) {
    logger.error('获取主站Token失败:', err)
    error(res, '获取主站Token失败', 500)
  }
}

/**
 * 从主站API查询Token过期时间
 */
async function parseTokenExpiration(token: string): Promise<{ expires_at: string | null }> {
  try {
    // 从主站API查询Token信息
    const { proxyRequest } = await import('../services/proxyService')
    
    // 使用该Token作为Authorization头调用主站API获取Token列表
    // 主站会根据Authorization头识别用户，返回该用户的Token列表
    const result = await proxyRequest('GET', '/api/api-tokens', {}, token, undefined)
    
    if (result.ok === 1 && result.data?.tokens) {
      // 主站返回的Token列表中的token字段是脱敏的（前8位...后4位）
      // 我们需要通过token_preview来匹配
      const tokenPreview = token.length > 12
        ? `${token.substring(0, 8)}...${token.substring(token.length - 4)}`
        : token.substring(0, 8) + '...'
      
      // 查找匹配的Token（通过token_preview匹配）
      const matchedToken = result.data.tokens.find((t: any) => 
        t.token_preview === tokenPreview || t.token === tokenPreview
      )
      
      if (matchedToken && matchedToken.expires_at) {
        return { expires_at: matchedToken.expires_at }
      }
      
      // 如果没有找到完全匹配的，尝试查找包含完整token的（某些情况下主站可能返回完整token）
      const fullTokenMatch = result.data.tokens.find((t: any) => t.token === token)
      if (fullTokenMatch && fullTokenMatch.expires_at) {
        return { expires_at: fullTokenMatch.expires_at }
      }
    }
    
    // 无法从主站API获取过期时间
    return { expires_at: null }
  } catch (err: any) {
    // 如果查询失败，返回null（可能Token无效或主站API不可用）
    logger.warn('无法从主站API获取Token过期时间:', err.message || err)
    return { expires_at: null }
  }
}

/**
 * 更新主站Token
 */
export async function updateMainSiteToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.body
    
    if (!token) {
      error(res, 'Token不能为空', 400)
      return
    }
    
    // 从主站API查询Token过期时间
    const { expires_at } = await parseTokenExpiration(token)
    
    // 将过期时间存储为JSON字符串（如果存在）
    const extraData = expires_at ? JSON.stringify({ expires_at }) : null
    
    // 检查配置是否存在
    const existing = await query<any[]>(
      'SELECT id FROM site_config WHERE config_key = ?',
      ['main_site_token']
    )
    
    if (existing.length > 0) {
      // 更新（如果有extra_data字段则更新，否则只更新基本字段）
      try {
        await query(
          'UPDATE site_config SET config_value = ?, description = ?, extra_data = ? WHERE config_key = ?',
          [token, '主站API Token，用于与主站对接', extraData, 'main_site_token']
        )
      } catch (err: any) {
        // 如果extra_data字段不存在，只更新基本字段
        if (err.code === 'ER_BAD_FIELD_ERROR' && (err.message?.includes('extra_data') || err.sqlMessage?.includes('extra_data'))) {
          await query(
            'UPDATE site_config SET config_value = ?, description = ? WHERE config_key = ?',
            [token, '主站API Token，用于与主站对接', 'main_site_token']
          )
        } else {
          throw err
        }
      }
    } else {
      // 插入（如果有extra_data字段则插入，否则只插入基本字段）
      try {
        await query(
          'INSERT INTO site_config (config_key, config_value, description, extra_data) VALUES (?, ?, ?, ?)',
          ['main_site_token', token, '主站API Token，用于与主站对接', extraData]
        )
      } catch (err: any) {
        // 如果extra_data字段不存在，只插入基本字段
        if (err.code === 'ER_BAD_FIELD_ERROR' && (err.message?.includes('extra_data') || err.sqlMessage?.includes('extra_data'))) {
          await query(
            'INSERT INTO site_config (config_key, config_value, description) VALUES (?, ?, ?)',
            ['main_site_token', token, '主站API Token，用于与主站对接']
          )
        } else {
          throw err
        }
      }
    }
    
    success(res, { 
      message: '主站Token更新成功',
      expires_at: expires_at || undefined
    })
  } catch (err: any) {
    logger.error('更新主站Token失败:', err)
    error(res, '更新主站Token失败', 500)
  }
}

/**
 * 测试主站连接
 */
export async function testMainSiteConnection(req: Request, res: Response): Promise<void> {
  try {
    // 获取当前配置的Token
    const configs = await query<any[]>(
      'SELECT config_value FROM site_config WHERE config_key = ?',
      ['main_site_token']
    )
    
    if (configs.length === 0 || !configs[0].config_value) {
      error(res, '主站Token未配置，请先配置Token', 400)
      return
    }
    
    const siteToken = configs[0].config_value
    
    // 通过代理调用主站API测试连接（调用一个简单的接口，比如获取任务列表）
    const { proxyRequest } = await import('../services/proxyService')
    
    try {
      // 尝试调用主站API获取任务列表（只获取1条）
      const result = await proxyRequest(
        'GET',
        '/tasks',
        { page: 1, page_size: 1 },
        siteToken
      )
      
      // 如果成功，说明Token有效
      if (result.ok === 1 || result.data !== undefined) {
        success(res, { 
          message: '主站连接测试成功！Token有效',
          connected: true
        })
      } else {
        error(res, result.msg || '主站连接失败', 500)
      }
    } catch (proxyErr: any) {
      logger.error('测试主站连接失败:', proxyErr)
      if (proxyErr.response?.status === 401) {
        error(res, 'Token无效或已过期', 401)
      } else if (proxyErr.response?.status === 404) {
        error(res, '主站API地址可能不正确', 404)
      } else {
        error(res, proxyErr.response?.data?.msg || '连接主站失败，请检查Token和主站地址', 500)
      }
    }
  } catch (err: any) {
    logger.error('测试主站连接失败:', err)
    error(res, '测试连接失败', 500)
  }
}

