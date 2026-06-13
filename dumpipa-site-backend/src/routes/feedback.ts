import express, { Request, Response } from 'express'
import { proxyRequest } from '../services/proxyService'
import { logger } from '../utils/logger'
import { success, error } from '../utils/response'
import { authenticate, optionalAuth } from '../middleware/auth'

const router = express.Router()

/**
 * 获取分站域名（用于识别分站）
 */
function getSiteDomain(req: Request): string | undefined {
  const host = req.get('host')
  const origin = req.get('origin')
  
  if (origin) {
    try {
      const url = new URL(origin)
      return url.hostname
    } catch {
      return host
    }
  }
  
  return host
}

/**
 * 检查反馈状态（GET请求，可选登录）
 * 使用optionalAuth中间件，允许未登录用户访问
 */
router.get('/check', optionalAuth, async (req: Request, res: Response) => {
  try {
    const siteDomain = getSiteDomain(req)
    
    // 构建请求路径
    const path = '/api/feedback/check'
    
    // 获取查询参数
    const data = req.query
    
    // 提取用户的Authorization token（从原始请求中）
    const authHeader = req.headers.authorization || req.headers.Authorization
    const userAuthToken = Array.isArray(authHeader) ? authHeader[0] : authHeader
    
    logger.info(`代理反馈检查请求: GET ${path} (分站: ${siteDomain || 'default'})`)
    
    // 获取分站token（如果需要）
    const { getSiteToken } = await import('../services/proxyService')
    const siteToken = await getSiteToken(siteDomain)
    
    // 代理请求到主站（传递用户token和分站token）
    // 注意：check接口使用optionalAuth，所以即使没有token也能访问
    const result = await proxyRequest('GET', path, data, siteToken || undefined, userAuthToken)
    
    // 返回结果
    if (result.ok !== undefined) {
      res.json(result)
    } else {
      success(res, result)
    }
  } catch (err: any) {
    logger.error('代理反馈检查请求失败:', err)
    
    if (err.response && err.response.data) {
      res.status(err.response.status || 500).json(err.response.data)
    } else {
      error(res, err.message || '请求失败', 500)
    }
  }
})

/**
 * 创建反馈（POST请求，需要登录）
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const siteDomain = getSiteDomain(req)
    
    // 构建请求路径
    const path = '/api/feedback'
    
    // 获取请求体数据
    const data = req.body
    
    // 提取用户的Authorization token（从原始请求中）
    const authHeader = req.headers.authorization || req.headers.Authorization
    const userAuthToken = Array.isArray(authHeader) ? authHeader[0] : authHeader
    
    logger.info(`代理创建反馈请求: POST ${path} (分站: ${siteDomain || 'default'})`)
    
    // 获取分站token（如果需要）
    const { getSiteToken } = await import('../services/proxyService')
    const siteToken = await getSiteToken(siteDomain)
    
    // 代理请求到主站（传递用户token和分站token）
    const result = await proxyRequest('POST', path, data, siteToken || undefined, userAuthToken)
    
    // 返回结果
    if (result.ok !== undefined) {
      res.json(result)
    } else {
      success(res, result)
    }
  } catch (err: any) {
    logger.error('代理创建反馈请求失败:', err)
    
    if (err.response && err.response.data) {
      res.status(err.response.status || 500).json(err.response.data)
    } else {
      error(res, err.message || '请求失败', 500)
    }
  }
})

/**
 * 获取我的反馈列表（GET请求，需要登录）
 */
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const siteDomain = getSiteDomain(req)
    
    // 构建请求路径
    const path = '/api/feedback/my'
    
    // 获取查询参数
    const data = req.query
    
    // 提取用户的Authorization token（从原始请求中）
    const authHeader = req.headers.authorization || req.headers.Authorization
    const userAuthToken = Array.isArray(authHeader) ? authHeader[0] : authHeader
    
    logger.info(`代理获取我的反馈列表请求: GET ${path} (分站: ${siteDomain || 'default'})`)
    
    // 获取分站token（如果需要）
    const { getSiteToken } = await import('../services/proxyService')
    const siteToken = await getSiteToken(siteDomain)
    
    // 代理请求到主站（传递用户token和分站token）
    const result = await proxyRequest('GET', path, data, siteToken || undefined, userAuthToken)
    
    // 返回结果
    if (result.ok !== undefined) {
      res.json(result)
    } else {
      success(res, result)
    }
  } catch (err: any) {
    logger.error('代理获取我的反馈列表请求失败:', err)
    
    if (err.response && err.response.data) {
      res.status(err.response.status || 500).json(err.response.data)
    } else {
      error(res, err.message || '请求失败', 500)
    }
  }
})

export default router

