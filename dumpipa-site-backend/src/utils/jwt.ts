import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface JwtPayload {
  userId: number
  username: string
  isAdmin: boolean
  exp?: number  // JWT过期时间（Unix时间戳）
  iat?: number  // JWT签发时间（Unix时间戳）
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  })
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 解码 JWT Token(不验证)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}

