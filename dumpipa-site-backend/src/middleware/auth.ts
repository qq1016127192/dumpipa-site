import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { error } from '../utils/response'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * 认证中间件
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 从 header 获取 token
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      error(res, '未提供认证令牌', 401)
      return
    }
    
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      error(res, '认证令牌无效或已过期', 401)
      return
    }
    
    // 将用户信息添加到请求对象
    req.user = payload
    next()
  } catch (err) {
    error(res, '认证失败', 401)
  }
}

/**
 * 可选认证中间件（允许未登录访问，但如果提供token则验证）
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization
    
    // ⭐ 添加详细日志用于调试
    const logger = require('../utils/logger').logger
    logger.debug(`[optionalAuth] Authorization header:`, authHeader ? authHeader.substring(0, 20) + '...' : 'undefined')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      logger.debug(`[optionalAuth] Token length:`, token.length)
      
      const payload = verifyToken(token)
      logger.debug(`[optionalAuth] Token验证结果:`, payload ? `userId=${payload.userId}` : '验证失败')
      
      if (payload) {
        req.user = payload
        logger.debug(`[optionalAuth] 设置req.user:`, JSON.stringify(payload))
      } else {
        logger.warn(`[optionalAuth] Token验证失败，可能的原因：token无效、过期或JWT_SECRET不匹配`)
      }
    } else {
      logger.debug(`[optionalAuth] 没有Authorization header或格式不正确`)
    }
    
    // 无论是否有token，都继续执行
    next()
  } catch (err) {
    // 即使认证失败也继续执行
    const logger = require('../utils/logger').logger
    logger.error(`[optionalAuth] 中间件出错:`, err)
    next()
  }
}

/**
 * 管理员权限中间件
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    error(res, '未认证', 401)
    return
  }
  
  if (!req.user.isAdmin) {
    error(res, '需要管理员权限', 403)
    return
  }
  
  next()
}

