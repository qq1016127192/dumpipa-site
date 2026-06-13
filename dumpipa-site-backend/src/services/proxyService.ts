import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { config } from '../config'
import { logger } from '../utils/logger'
import { query } from '../config/database'

/**
 * 获取分站的token配置（从分站自己的数据库获取）
 */
export async function getSiteToken(siteDomain?: string): Promise<string | null> {
  try {
    // 从分站自己的数据库查询主站token配置
    const configs = await query<any[]>(
      'SELECT config_value FROM site_config WHERE config_key = ?',
      ['main_site_token']
    )
    
    if (configs.length > 0 && configs[0].config_value) {
      return configs[0].config_value
    }
    
    // 如果没有配置，返回.env中的默认token
    return config.mainSite.token || null
  } catch (error) {
    logger.error('获取分站token失败:', error)
    // 如果查询失败，返回.env中的默认token
    return config.mainSite.token || null
  }
}

/**
 * 创建代理到主站的axios实例
 */
export async function createProxyClient(siteToken?: string, userAuthToken?: string): Promise<AxiosInstance> {
  // ⭐ 修改：如果明确传入 undefined，不获取token（允许未登录访问）
  // 如果传入 null 或空字符串，则从数据库获取
  let token: string | null | undefined
  if (siteToken === undefined) {
    // 明确传入 undefined，不获取token
    token = undefined
  } else if (siteToken) {
    // 传入了token，使用传入的token
    token = siteToken
  } else {
    // 传入了 null 或空字符串，从数据库获取
    token = await getSiteToken()
  }
  
  // 记录使用的token类型（用于调试）
  if (userAuthToken) {
    logger.debug('代理客户端：使用用户认证token')
  } else if (token) {
    logger.debug('代理客户端：使用分站token', { tokenPrefix: token.substring(0, 20) + '...' })
  } else {
    logger.debug('代理客户端：未设置token，将以未登录方式访问主站API')
  }
  
  const instance = axios.create({
    baseURL: config.mainSite.apiUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  // 请求拦截器：根据参数决定使用哪个token
  instance.interceptors.request.use(
    (requestConfig) => {
      // 如果明确传入了 userAuthToken，使用用户token（用于管理员操作）
      // 否则使用分站token（用于获取分站token对应用户的数据）
      if (userAuthToken) {
        requestConfig.headers.Authorization = userAuthToken.startsWith('Bearer ') 
          ? userAuthToken 
          : `Bearer ${userAuthToken}`
        logger.debug('代理请求：使用用户token', { url: requestConfig.url })
      } else if (token) {
        // 使用分站token
        requestConfig.headers.Authorization = `Bearer ${token}`
        logger.debug('代理请求：使用分站token', { url: requestConfig.url, tokenPrefix: token.substring(0, 20) + '...' })
      } else {
        // 不设置Authorization header，允许未登录访问
        logger.debug('代理请求：未设置Authorization header，将以未登录方式访问', { url: requestConfig.url })
      }
      return requestConfig
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器：统一处理错误
  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      logger.error('主站API请求失败:', error.message)
      return Promise.reject(error)
    }
  )
  
  return instance
}

/**
 * 代理请求到主站
 */
export async function proxyRequest(
  method: string,
  path: string,
  data?: any,
  siteToken?: string,
  userAuthToken?: string
): Promise<any> {
  try {
    const client = await createProxyClient(siteToken, userAuthToken)
    
    // 如果path以/api开头，移除/api前缀（因为baseURL已经包含了/api）
    let requestPath = path
    if (requestPath.startsWith('/api/')) {
      requestPath = requestPath.substring(4) // 移除 '/api'
    }
    
    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: requestPath,
    }
    
    if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
      config.params = data
    } else {
      config.data = data
    }
    
    const response = await client.request(config)
    return response.data
  } catch (error: any) {
    // 安全地记录错误信息（避免循环引用）
    const errorInfo: any = {
      message: error.message || '未知错误',
      code: error.code,
      name: error.name,
    }
    
    if (error.response) {
      errorInfo.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      }
      errorInfo.url = typeof error.config?.url === 'string' ? error.config.url : 'unknown'
      
      logger.error('代理请求失败（响应错误）:', errorInfo)
    } else if (error.request) {
      errorInfo.request = {
        message: error.message,
        code: error.code,
      }
      
      logger.error('代理请求失败（请求失败）:', errorInfo)
    } else {
      logger.error('代理请求失败（其他错误）:', errorInfo)
    }
    
    throw error
  }
}

