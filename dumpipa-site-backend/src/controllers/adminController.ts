/**
 * 管理后台控制器（分站）
 */

import { Request, Response } from 'express'
import { query } from '../config/database'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import os from 'os'
import { proxyRequest, getSiteToken } from '../services/proxyService'

/**
 * 获取仪表盘统计数据
 */
export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    // 1. 分站本地统计数据
    // 总用户数
    const totalUsers = await query<any[]>(
      'SELECT COUNT(*) as count FROM users'
    )
    
    // 活跃用户数（最近7天有订单或交易的用户）
    const activeUsers = await query<any[]>(
      `SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT user_id FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION
        SELECT user_id FROM coin_transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ) as active`
    )
    
    // 总订单数（充值订单）
    const totalOrders = await query<any[]>(
      `SELECT COUNT(*) as count FROM orders WHERE product_type = 'coin_package'`
    )
    
    // 总会员订单数
    const totalVipOrders = await query<any[]>(
      'SELECT COUNT(*) as count FROM vip_orders'
    )
    
    // 今日新增用户
    const todayUsers = await query<any[]>(
      `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()`
    )
    
    // 今日订单数（充值订单）
    const todayOrders = await query<any[]>(
      `SELECT COUNT(*) as count FROM orders 
       WHERE product_type = 'coin_package' AND DATE(created_at) = CURDATE()`
    )
    
    // 今日收入（充值订单）
    const todayRevenue = await query<any[]>(
      `SELECT COALESCE(SUM(amount), 0) as revenue FROM orders 
       WHERE product_type = 'coin_package' AND DATE(created_at) = CURDATE() AND status = 'paid'`
    )
    
    // 总会员数
    const totalVipUsers = await query<any[]>(
      `SELECT COUNT(*) as count FROM users WHERE is_vip = 1 AND vip_expires_at > NOW()`
    )
    
    // 2. 从主站获取任务统计（通过代理）
    let mainSiteStats = {
      totalTasks: 0,
      activeTaskUsers: 0,
      successRate: 0,
      recentTasks: [],
    }
    
    try {
      const siteToken = await getSiteToken()
      if (siteToken) {
        // 获取主站任务列表（只显示该分站token下的任务）
        const tasksResult = await proxyRequest(
          'GET',
          '/api/tasks',
          { page: 1, page_size: 50 },
          siteToken
        )
        
        if (tasksResult.ok === 1 && tasksResult.data) {
          const tasks = tasksResult.data || []
          mainSiteStats.totalTasks = tasksResult.pagination?.total || tasks.length
          
          // 计算成功率
          const successCount = tasks.filter((t: any) => t.status === 'done').length
          mainSiteStats.successRate = tasks.length > 0 
            ? Math.round((successCount / tasks.length) * 100)
            : 0
          
          // 活跃任务用户数（最近7天的任务）
          const activeTaskUsersSet = new Set()
          tasks.forEach((task: any) => {
            const taskDate = new Date(task.created_at)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            if (taskDate >= sevenDaysAgo && task.user_id) {
              activeTaskUsersSet.add(task.user_id)
            }
          })
          mainSiteStats.activeTaskUsers = activeTaskUsersSet.size
          
          // 最近任务（取前5个）
          mainSiteStats.recentTasks = tasks
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((task: any) => ({
              id: task.id,
              app_name: task.app_name,
              bundle_id: task.bundle_id,
              version: task.version,
              status: task.status,
              icon_url: task.icon_url,
              created_at: task.created_at
            }))
        }
      }
    } catch (err: any) {
      logger.warn('获取主站任务统计失败:', err.message)
      // 如果获取主站统计失败，不影响返回分站统计
    }
    
    // 3. 最近订单
    const recentOrders = await query<any[]>(
      `SELECT o.*, u.username, u.email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.product_type = 'coin_package'
       ORDER BY o.created_at DESC
       LIMIT 5`
    )
    
    // 4. 最近会员订单
    const recentVipOrders = await query<any[]>(
      `SELECT vo.*, u.username, u.email
       FROM vip_orders vo
       LEFT JOIN users u ON vo.user_id = u.id
       ORDER BY vo.created_at DESC
       LIMIT 5`
    )
    
    // 5. 系统状态
    const cpuUsage = Math.round(os.loadavg()[0] * 100 / os.cpus().length)
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100)
    
    success(res, {
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        activeUsers: activeUsers[0]?.count || 0,
        totalOrders: totalOrders[0]?.count || 0,
        totalVipOrders: totalVipOrders[0]?.count || 0,
        todayUsers: todayUsers[0]?.count || 0,
        todayOrders: todayOrders[0]?.count || 0,
        todayRevenue: parseFloat(todayRevenue[0]?.revenue || 0),
        totalVipUsers: totalVipUsers[0]?.count || 0,
        // 主站任务统计
        totalTasks: mainSiteStats.totalTasks,
        activeTaskUsers: mainSiteStats.activeTaskUsers,
        successRate: mainSiteStats.successRate,
      },
      recentOrders,
      recentVipOrders,
      recentTasks: mainSiteStats.recentTasks,
      systemStatus: {
        cpu: cpuUsage,
        memory: memoryUsage,
        disk: 0, // 需要额外的库来获取磁盘使用率
        network: 'online',
      },
    })
  } catch (err: any) {
    logger.error('获取仪表盘数据失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, '获取仪表盘数据失败', 500)
  }
}

/**
 * 获取所有任务列表（通过主站API，管理员）
 * 管理员可以查看所有任务
 */
/**
 * 移除任务中的下载链接字段（安全考虑）
 */
function removeDownloadUrls(task: any): any {
  if (!task || typeof task !== 'object') {
    return task
  }
  
  const { alist_url, download_url, ...safeTask } = task
  return safeTask
}

/**
 * 移除任务数组中的下载链接字段
 */
function removeDownloadUrlsFromTasks(tasks: any[]): any[] {
  if (!Array.isArray(tasks)) {
    return []
  }
  
  return tasks.map(removeDownloadUrls)
}

export async function getAllTasks(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const status = req.query.status as string
    const keyword = req.query.keyword as string

    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    logger.debug('分站任务管理：获取任务列表', { 
      page, 
      pageSize, 
      status, 
      keyword,
      hasSiteToken: !!siteToken,
      tokenPrefix: siteToken.substring(0, 20) + '...'
    })

    // 通过主站API获取任务
    try {
      const params: any = {
        page,
        page_size: pageSize,
        include_done: true, // 默认包含已完成的任务，否则只会显示进行中和等待中的任务
      }
      
      if (status) {
        params.status = status
      }
      
      if (keyword) {
        params.keyword = keyword
      }

      // 分站任务管理：使用分站token获取该分站token对应用户的任务
      // 通过 only_mine=true 参数，强制主站只返回该token用户的任务（即使token对应用户是管理员）
      params.only_mine = 'true' // 强制只返回该token用户的任务
      
      const result = await proxyRequest(
        'GET',
        '/api/tasks',
        params,
        siteToken, // 使用分站token
        undefined // 明确不传递用户token，确保使用分站token
      )
      
      // 主站返回格式（使用success函数）：{ ok: 1, msg: '...', tasks: [...], total: ..., stats: {...} }
      logger.debug('主站API响应:', {
        ok: result.ok,
        hasTasks: !!result.tasks,
        tasksLength: result.tasks?.length || 0,
        total: result.total,
        hasData: !!result.data,
        keys: Object.keys(result),
      })
      
      if (result.ok === 1) {
        // 主站的success函数使用Object.assign合并data到响应对象
        // 所以result的结构是：{ ok: 1, msg: '...', tasks: [...], total: ..., page: ..., page_size: ... }
        
        // 提取主站返回的数据（已经过滤为该token用户的任务）
        const tasks = result.tasks || []
        const total = result.total || 0
        const resultPage = result.page || page
        const resultPageSize = result.page_size || pageSize
        const stats = result.stats || undefined
        
        // 移除下载链接字段（安全考虑）
        const safeTasks = removeDownloadUrlsFromTasks(tasks)
        
        logger.debug('分站返回任务列表:', {
          tasksCount: safeTasks.length,
          total: total,
          page: resultPage,
          pageSize: resultPageSize,
        })
        
        // 分站后端直接返回主站的结果（已经是该token用户的任务，且已移除下载链接）
        success(res, {
          tasks: safeTasks,
          total: total,
          page: resultPage,
          page_size: resultPageSize,
          stats: stats,
        }, '获取任务列表成功')
      } else {
        logger.error('主站API返回失败:', result.msg || '未知错误')
        error(res, result.msg || '获取任务列表失败', 500)
      }
    } catch (err: any) {
      logger.error('通过主站API获取任务列表失败:', err.message || err)
      
      // 安全地记录错误信息（避免循环引用）
      if (err.response) {
        logger.error('主站API响应错误:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          url: typeof err.config?.url === 'string' ? err.config.url : 'unknown',
        })
        
        const errorMsg = err.response.data?.msg || err.response.data?.message || '获取任务列表失败'
        error(res, errorMsg, err.response.status || 500)
      } else if (err.request) {
        logger.error('主站API请求失败:', {
          message: err.message,
          code: err.code,
        })
        error(res, '无法连接到主站，请检查网络连接', 500)
      } else {
        error(res, err.message || '获取任务列表失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('获取任务列表失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, err.message || '获取任务列表失败', 500)
  }
}

/**
 * 取消任务（通过主站API）
 * 管理员可以取消任何任务，普通用户只能取消自己的任务
 */
export async function cancelTask(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.id
    const userId = (req as any).user?.userId
    const isAdmin = (req as any).user?.isAdmin || false

    if (!taskId) {
      error(res, '任务ID无效', 400)
      return
    }

    if (!userId) {
      error(res, '未认证', 401)
      return
    }

    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 通过主站API取消任务
    try {
      const result = await proxyRequest(
        'POST',
        `/api/admin/tasks/${taskId}/cancel`,
        {},
        siteToken,
        req.headers.authorization as string
      )
      
      success(res, result)
    } catch (err: any) {
      logger.error('通过主站API取消任务失败:', {
        message: err.message || '未知错误',
        status: err.response?.status,
        data: err.response?.data,
      })
      if (err.response) {
        error(res, err.response.data?.msg || '取消任务失败', err.response.status || 500)
      } else {
        error(res, '取消任务失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('取消任务失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, err.message || '取消任务失败', 500)
  }
}

/**
 * 删除任务（通过主站API）
 * 管理员可以删除任何任务，普通用户只能删除自己的任务
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.id
    const userId = (req as any).user?.userId
    const isAdmin = (req as any).user?.isAdmin || false

    if (!taskId) {
      error(res, '任务ID无效', 400)
      return
    }

    if (!userId) {
      error(res, '未认证', 401)
      return
    }

    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 通过主站API删除任务
    try {
      const result = await proxyRequest(
        'DELETE',
        `/api/admin/tasks/${taskId}`,
        {},
        siteToken,
        req.headers.authorization as string
      )
      
      success(res, result)
    } catch (err: any) {
      logger.error('通过主站API删除任务失败:', {
        message: err.message || '未知错误',
        status: err.response?.status,
        data: err.response?.data,
      })
      if (err.response) {
        error(res, err.response.data?.msg || '删除任务失败', err.response.status || 500)
      } else {
        error(res, '删除任务失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('删除任务失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, err.message || '删除任务失败', 500)
  }
}

