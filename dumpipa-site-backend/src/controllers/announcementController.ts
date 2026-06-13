/**
 * 公告控制器（分站）
 */

import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import { query } from '../config/database'

/**
 * 获取有效公告列表
 */
export async function getAnnouncements(_req: Request, res: Response): Promise<void> {
  try {
    const announcements = await query<any[]>(
      `SELECT id, title, content, type, priority, created_at 
       FROM announcements 
       WHERE status = 1 
         AND (publish_at IS NULL OR publish_at <= NOW())
         AND (expires_at IS NULL OR expires_at >= NOW())
       ORDER BY priority DESC, created_at DESC 
       LIMIT 10`
    )
    
    success(res, { announcements })
  } catch (err: any) {
    logger.error('获取公告列表失败:', err)
    error(res, '获取公告列表失败', 500)
  }
}

/**
 * 获取所有公告（管理员）
 */
export async function getAllAnnouncements(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const offset = (Number(page) - 1) * Number(pageSize)
    
    // 获取公告列表
    const announcementsResult = await query<any[]>(
      `SELECT a.*, u.username as created_by_name 
       FROM announcements a 
       LEFT JOIN users u ON a.created_by = u.id 
       ORDER BY a.created_at DESC 
       LIMIT ${Number(pageSize)} OFFSET ${offset}`
    )
    
    // 获取总数
    const totalResult = await query<any[]>(`SELECT COUNT(*) as total FROM announcements`)
    
    const total = totalResult[0]?.total || 0
    
    success(res, {
      announcements: announcementsResult,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    })
  } catch (err: any) {
    logger.error('获取公告列表失败:', err)
    error(res, '获取公告列表失败', 500)
  }
}

/**
 * 获取公告详情
 */
export async function getAnnouncementDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    
    const announcements = await query<any[]>(
      `SELECT * FROM announcements WHERE id = ?`,
      [id]
    )
    
    if (announcements.length === 0) {
      error(res, '公告不存在', 404)
      return
    }
    
    success(res, { announcement: announcements[0] })
  } catch (err: any) {
    logger.error('获取公告详情失败:', err)
    error(res, '获取公告详情失败', 500)
  }
}

/**
 * 创建公告
 */
export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, type, priority, status, publish_at, expires_at } = req.body
    const userId = (req as any).user?.userId
    
    if (!title || !content) {
      error(res, '标题和内容不能为空', 400)
      return
    }
    
    const result = await query<any>(
      `INSERT INTO announcements (title, content, type, priority, status, publish_at, expires_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, type || 'info', priority || 0, status !== undefined ? status : 1, publish_at, expires_at, userId]
    )
    
    logger.info(`公告创建成功: ID=${result.insertId}`)
    success(res, { id: result.insertId }, '公告创建成功')
  } catch (err: any) {
    logger.error('创建公告失败:', err)
    error(res, '创建公告失败', 500)
  }
}

/**
 * 更新公告
 */
export async function updateAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { title, content, type, priority, status, publish_at, expires_at } = req.body
    
    if (!title || !content) {
      error(res, '标题和内容不能为空', 400)
      return
    }
    
    await query(
      `UPDATE announcements 
       SET title = ?, content = ?, type = ?, priority = ?, status = ?, publish_at = ?, expires_at = ? 
       WHERE id = ?`,
      [title, content, type, priority, status, publish_at, expires_at, id]
    )
    
    logger.info(`公告更新成功: ID=${id}`)
    success(res, {}, '公告更新成功')
  } catch (err: any) {
    logger.error('更新公告失败:', err)
    error(res, '更新公告失败', 500)
  }
}

/**
 * 删除公告
 */
export async function deleteAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    
    await query(`DELETE FROM announcements WHERE id = ?`, [id])
    
    logger.info(`公告删除成功: ID=${id}`)
    success(res, {}, '公告删除成功')
  } catch (err: any) {
    logger.error('删除公告失败:', err)
    error(res, '删除公告失败', 500)
  }
}

