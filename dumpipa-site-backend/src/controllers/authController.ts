import { Request, Response } from 'express'
import { query } from '../config/database'
import { hashPassword, verifyPassword } from '../utils/encryption'
import { generateToken } from '../utils/jwt'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'

interface User {
  id: number
  username: string
  password: string
  email?: string
  is_admin: number
  balance?: number
  is_vip?: number
  vip_level?: number
  vip_expires_at?: Date | null
  created_at: Date
}

/**
 * 用户注册
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, email } = req.body
    
    // 验证必填字段
    if (!username || !password) {
      error(res, '用户名和密码不能为空', 400)
      return
    }
    
    // 检查用户名是否已存在
    const existingUsers = await query<User[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )
    
    if (existingUsers.length > 0) {
      error(res, '用户名已存在', 400)
      return
    }
    
    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmails = await query<User[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      )
      
      if (existingEmails.length > 0) {
        error(res, '邮箱已被使用', 400)
        return
      }
    }
    
    // 获取默认金币数
    const defaultCoinsResult = await query<any[]>(
      "SELECT config_value FROM system_config WHERE config_key = 'default_user_coins'",
      []
    )
    const defaultCoins = defaultCoinsResult.length > 0 
      ? parseFloat(defaultCoinsResult[0].config_value || '10.00')
      : 10.00
    
    // 哈希密码
    const hashedPassword = await hashPassword(password)
    
    // 插入新用户
    const result = await query<any>(
      'INSERT INTO users (username, password, email, balance, created_at, registration_ip) VALUES (?, ?, ?, ?, NOW(), ?)',
      [username, hashedPassword, email || null, defaultCoins, req.ip || null]
    )
    
    // 如果有默认金币，记录交易记录
    if (defaultCoins > 0) {
      await query(
        `INSERT INTO coin_transactions (user_id, type, amount, balance_before, balance_after, description)
         VALUES (?, 'reward', ?, 0, ?, '新用户注册奖励')`,
        [result.insertId, defaultCoins, defaultCoins]
      )
    }
    
    logger.info(`新用户注册: ${username}`)
    
    success(res, {
      user_id: result.insertId,
      username,
    }, '注册成功')
  } catch (err: any) {
    logger.error('注册失败:', err)
    error(res, '注册失败,请稍后重试', 500)
  }
}

/**
 * 用户登录
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body
    
    // 验证必填字段
    if (!username || !password) {
      error(res, '用户名和密码不能为空', 400)
      return
    }
    
    // 查询用户
    const users = await query<User[]>(
      'SELECT id, username, password, email, is_admin, balance, is_vip, vip_level, vip_expires_at FROM users WHERE username = ? AND status = 1',
      [username]
    )
    
    logger.debug(`登录查询用户: ${username}, 找到用户数: ${users.length}`)
    
    if (users.length === 0) {
      logger.warn(`登录失败: 用户不存在或已被禁用 - ${username}`)
      error(res, '用户名或密码错误', 401)
      return
    }
    
    const user = users[0]
    logger.debug(`找到用户: ${user.username}, is_admin: ${user.is_admin}`)
    
    // 验证密码
    const isValidPassword = await verifyPassword(password, user.password)
    logger.debug(`密码验证结果: ${isValidPassword}`)
    
    if (!isValidPassword) {
      logger.warn(`登录失败: 密码错误 - ${username}`)
      error(res, '用户名或密码错误', 401)
      return
    }
    
    // 更新最后登录时间
    await query(
      'UPDATE users SET last_login = NOW(), registration_ip = ? WHERE id = ?',
      [req.ip || null, user.id]
    )
    
    // 生成 JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin === 1,
    })
    
    logger.info(`用户登录: ${username}`)
    
    // 检查VIP是否过期
    let isVip = user.is_vip === 1
    if (isVip && user.vip_expires_at) {
      const vipExpiresAt = new Date(user.vip_expires_at)
      if (vipExpiresAt < new Date()) {
        // VIP已过期，更新状态
        await query(
          'UPDATE users SET is_vip = 0, vip_level = 0, vip_expires_at = NULL WHERE id = ?',
          [user.id]
        )
        isVip = false
      }
    }
    
    success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin === 1,
        balance: parseFloat(user.balance?.toString() || '0'),
        is_vip: isVip,
        vip_level: user.vip_level || 0,
        vip_expires_at: user.vip_expires_at,
      },
    }, '登录成功')
  } catch (err: any) {
    logger.error('登录失败:', err)
    error(res, '登录失败,请稍后重试', 500)
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId
    
    if (!userId) {
      error(res, '未登录', 401)
      return
    }
    
    const users = await query<User[]>(
      'SELECT id, username, email, is_admin, balance, is_vip, vip_level, vip_expires_at, created_at FROM users WHERE id = ? AND status = 1',
      [userId]
    )
    
    if (users.length === 0) {
      error(res, '用户不存在', 404)
      return
    }
    
    const user = users[0]
    
    // 检查VIP是否过期
    let isVip = user.is_vip === 1
    if (isVip && user.vip_expires_at) {
      const vipExpiresAt = new Date(user.vip_expires_at)
      if (vipExpiresAt < new Date()) {
        // VIP已过期，更新状态
        await query(
          'UPDATE users SET is_vip = 0, vip_level = 0, vip_expires_at = NULL WHERE id = ?',
          [user.id]
        )
        isVip = false
      }
    }
    
    success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin === 1,
      balance: parseFloat(user.balance?.toString() || '0'),
      is_vip: isVip,
      vip_level: user.vip_level || 0,
      vip_expires_at: user.vip_expires_at,
      created_at: user.created_at,
    })
  } catch (err: any) {
    logger.error('获取用户信息失败:', err)
    error(res, '获取用户信息失败', 500)
  }
}

/**
 * 用户登出
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    logger.info(`用户登出: ${req.user?.username}`)
    success(res, null, '登出成功')
  } catch (err: any) {
    logger.error('登出失败:', err)
    error(res, '登出失败', 500)
  }
}

