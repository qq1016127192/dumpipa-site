/**
 * 用户控制器（分站独立数据库）
 */

import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import { query } from '../config/database'
import { logger } from '../utils/logger'
import { hashPassword } from '../utils/encryption'

/**
 * 获取用户列表（管理员）
 */
export async function getUserList(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const offset = (page - 1) * pageSize
    const search = req.query.search as string || ''
    const status = req.query.status as string

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR id = ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, parseInt(search) || 0)
    }

    if (status !== undefined) {
      whereClause += ' AND status = ?'
      params.push(status)
    }

    // 获取用户列表（使用balance字段）
    const users = await query<any[]>(
      `SELECT id, username, email, balance, is_vip, vip_level, vip_expires_at, 
              is_admin, status, created_at, updated_at, last_login
       FROM users
       ${whereClause}
       ORDER BY id DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    )

    // 获取总数
    let countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = await query<any[]>(countSql, params)
    const total = countResult[0]?.total || 0

    success(res, {
      users,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    })
  } catch (err) {
    logger.error('获取用户列表失败:', err)
    error(res, '获取用户列表失败', 500)
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id)
    
    if (!userId || isNaN(userId)) {
      error(res, '用户ID无效', 400)
      return
    }
    
    // 只有本人或管理员才能查看用户信息
    const currentUser = (req as any).user
    if (currentUser?.userId !== userId && !currentUser?.isAdmin) {
      error(res, '无权限访问该用户信息', 403)
      return
    }
    
    const users = await query<any[]>(
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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin === 1,
        balance: parseFloat(user.balance?.toString() || '0'),
        coins: parseFloat(user.balance?.toString() || '0'), // 兼容前端字段名
        is_vip: isVip,
        vip_level: user.vip_level || 0,
        vip_expires_at: user.vip_expires_at,
        created_at: user.created_at,
      },
    })
  } catch (err: any) {
    logger.error('获取用户信息失败:', err)
    error(res, '获取用户信息失败', 500)
  }
}

/**
 * 创建用户（管理员）
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, email, balance, is_admin, status } = req.body

    if (!username || !password) {
      error(res, '用户名和密码不能为空', 400)
      return
    }

    // 检查用户名是否已存在
    const existingUsers = await query<any[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    )

    if (existingUsers.length > 0) {
      error(res, '用户名已存在', 400)
      return
    }

    // 检查邮箱是否已存在（如果有邮箱）
    if (email) {
      const existingEmails = await query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      )

      if (existingEmails.length > 0) {
        error(res, '邮箱已被使用', 400)
        return
      }
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password)

    // 插入新用户
    const result = await query<any>(
      `INSERT INTO users (username, password, email, balance, is_admin, status, created_at, registration_ip)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        username,
        hashedPassword,
        email || null,
        balance || 0,
        is_admin ? 1 : 0,
        status !== undefined ? status : 1,
        req.ip || null
      ]
    )

    logger.info(`管理员创建用户: ${username}`)

    success(res, {
      id: result.insertId,
      username,
      email,
    }, '用户创建成功')
  } catch (err: any) {
    logger.error('创建用户失败:', err)
    error(res, err.message || '创建用户失败', 500)
  }
}

/**
 * 更新用户（管理员）
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { username, email, password, balance, is_admin, status, is_vip, vip_level, vip_expires_at } = req.body

    // 检查用户是否存在
    const existingUsers = await query<any[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if (existingUsers.length === 0) {
      error(res, '用户不存在', 404)
      return
    }

    const updates: string[] = []
    const params: any[] = []

    // 更新用户名
    if (username !== undefined) {
      // 检查新用户名是否已被其他用户使用
      const conflictUsers = await query<any[]>(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      )
      if (conflictUsers.length > 0) {
        error(res, '用户名已被使用', 400)
        return
      }
      updates.push('username = ?')
      params.push(username)
    }

    // 更新邮箱
    if (email !== undefined) {
      // 检查新邮箱是否已被其他用户使用
      if (email) {
        const conflictEmails = await query<any[]>(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, id]
        )
        if (conflictEmails.length > 0) {
          error(res, '邮箱已被使用', 400)
          return
        }
      }
      updates.push('email = ?')
      params.push(email || null)
    }

    // 更新密码
    if (password !== undefined && password) {
      const hashedPassword = await hashPassword(password)
      updates.push('password = ?')
      params.push(hashedPassword)
    }

    // 更新余额
    if (balance !== undefined) {
      updates.push('balance = ?')
      params.push(balance)
    }

    // 更新管理员状态
    if (is_admin !== undefined) {
      updates.push('is_admin = ?')
      params.push(is_admin ? 1 : 0)
    }

    // 更新状态
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }

    // 更新VIP信息
    if (is_vip !== undefined) {
      updates.push('is_vip = ?')
      params.push(is_vip ? 1 : 0)
    }

    if (vip_level !== undefined) {
      updates.push('vip_level = ?')
      params.push(vip_level)
    }

    if (vip_expires_at !== undefined) {
      updates.push('vip_expires_at = ?')
      params.push(vip_expires_at || null)
    }

    if (updates.length === 0) {
      error(res, '没有要更新的字段', 400)
      return
    }

    updates.push('updated_at = NOW()')
    params.push(id)

    // 执行更新
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    )

    logger.info(`管理员更新用户: ${id}`)

    success(res, { message: '用户更新成功' })
  } catch (err: any) {
    logger.error('更新用户失败:', err)
    error(res, err.message || '更新用户失败', 500)
  }
}

/**
 * 删除用户（管理员）
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    // 检查用户是否存在
    const existingUsers = await query<any[]>(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    )

    if (existingUsers.length === 0) {
      error(res, '用户不存在', 404)
      return
    }

    const user = existingUsers[0]

    // 不能删除自己
    const currentUserId = (req as any).user?.userId
    if (currentUserId && parseInt(id) === currentUserId) {
      error(res, '不能删除自己的账号', 400)
      return
    }

    // 检查是否有未完成的订单
    const orders = await query<any[]>(
      `SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status NOT IN ('paid', 'cancelled')`,
      [id]
    )

    if (orders[0]?.count > 0) {
      error(res, '该用户有未完成的订单，无法删除', 400)
      return
    }

    // 删除用户
    await query('DELETE FROM users WHERE id = ?', [id])

    logger.info(`管理员删除用户: ${user.username} (ID: ${id})`)

    success(res, { message: '用户删除成功' })
  } catch (err: any) {
    logger.error('删除用户失败:', err)
    error(res, err.message || '删除用户失败', 500)
  }
}
