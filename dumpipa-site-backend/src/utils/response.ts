import { Response } from 'express'

/**
 * 成功响应
 */
export function success(res: Response, data?: any, message: string = '操作成功', code: number = 200): void {
  res.status(code).json({
    ok: 1,
    msg: message,
    data: data,
  })
}

/**
 * 错误响应（FastAdmin风格）
 */
export function error(res: Response, message: string = '操作失败', code: number = 400): void {
  res.status(code).json({
    ok: 0,
    msg: message,
  })
}

