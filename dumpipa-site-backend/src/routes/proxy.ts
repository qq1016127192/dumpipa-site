import express, { Request, Response } from 'express'
import { proxyRequest } from '../services/proxyService'
import { logger } from '../utils/logger'
import { success, error } from '../utils/response'

const router = express.Router()

/**
 * 获取请求域名（用于识别分站）
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
 * 代理请求处理函数（通用）
 * 安全限制：只允许GET请求，禁止POST/PUT/DELETE等写操作，防止绕过安全机制
 */
async function handleProxyRequest(req: Request, res: Response, pathPrefix: string = '') {
  try {
    // 安全限制：只允许GET请求通过代理
    // POST/PUT/DELETE等写操作必须通过分站自己的接口，这样可以添加安全验证
    if (req.method !== 'GET') {
      logger.warn(`拒绝代理${req.method}请求: ${req.originalUrl || req.url} - 只允许GET请求`)
      error(res, '此接口不支持该请求方法，请使用正确的接口', 405)
      return
    }
    
    // 获取分站域名
    const siteDomain = getSiteDomain(req)
    
    // 构建请求路径（移除/api前缀）
    let originalPath = req.originalUrl || req.url || req.path
    let path = originalPath.replace(/^\/api/, '') || '/'
    
    // 移除查询字符串部分（查询字符串会通过params传递）
    if (path.includes('?')) {
      path = path.split('?')[0]
    }
    
    // 获取请求方法和数据（只处理GET请求）
    const method = req.method
    const data = req.query
    
    // 提取用户的Authorization token（从原始请求中）
    const authHeader = req.headers.authorization || req.headers.Authorization
    const userAuthToken = Array.isArray(authHeader) ? authHeader[0] : authHeader
    
    logger.info(`代理请求: ${method} ${path} (分站: ${siteDomain || 'default'})`)
    
    // 获取分站token（如果需要）
    const { getSiteToken } = await import('../services/proxyService')
    const siteToken = await getSiteToken(siteDomain)
    
    // 代理请求到主站（传递用户token和分站token）
    const result = await proxyRequest(method, path, data, siteToken || undefined, userAuthToken)
    
    // 返回结果
    if (result.ok !== undefined) {
      // FastAdmin风格响应
      res.json(result)
    } else {
      // 标准响应
      success(res, result)
    }
  } catch (err: any) {
    logger.error('代理请求失败:', err)
    
    // 尝试解析错误响应
    if (err.response && err.response.data) {
      res.status(err.response.status || 500).json(err.response.data)
    } else {
      error(res, err.message || '请求失败', 500)
    }
  }
}

/**
 * 推荐应用API路由（直接路径，必须在通配符路由之前）
 */
router.use('/apps/recommended', (req: Request, res: Response) => {
  handleProxyRequest(req, res, '/apps/recommended')
})

/**
 * 应用数据API代理路由 - 只代理应用相关的API到主站
 * 包括：/apps/* 的所有路由（必须在特定路由之后）
 */
router.use('/apps/*', (req: Request, res: Response) => {
  handleProxyRequest(req, res, '/apps')
})

/**
 * 设备API代理路由 - 代理设备相关的API到主站
 * 包括：/devices/* 的所有路由
 */
router.use('/devices/*', (req: Request, res: Response) => {
  handleProxyRequest(req, res, '/devices')
})

/**
 * 设备API代理路由（直接路径，无通配符）
 */
router.use('/devices', (req: Request, res: Response) => {
  handleProxyRequest(req, res, '/devices')
})

export default router

