import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { error } from '../utils/response'

/**
 * 404 处理
 */
export function notFoundHandler(_req: Request, res: Response): void {
  error(res, '接口不存在', 404)
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 安全地记录错误信息（避免循环引用）
  logger.error('请求错误:', {
    message: err.message || '未知错误',
    stack: err.stack,
    statusCode: err.statusCode || err.status,
    code: err.code,
  })
  
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || '服务器处理请求时发生错误，请稍后重试'
  
  error(res, message, statusCode)
}

