/**
 * 任务管理控制器（分站）
 * 通过主站API获取任务，使用分站Token
 */

import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import { proxyRequest, getSiteToken } from '../services/proxyService'
import { query } from '../config/database'

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

/**
 * 获取我的任务列表（根据分站数据库中的main_task_id从主站批量获取任务详情）
 * 流程：
 * 1. 从分站数据库user_tasks表中查询该用户的main_task_id列表
 * 2. 使用主站的批量查询接口（/api/tasks/batch）一次性获取所有任务详情
 * 3. 分页处理后返回
 * 
 * ⭐ 为什么这样实现？
 * - 主站接口已支持管理员用户查询任何任务（通过siteToken的分站通常是管理员用户）
 * - 使用批量查询接口比逐个查询更高效，减少网络请求次数
 * - 如果批量查询失败，会自动回退到逐个查询模式（兼容性处理）
 */
export async function getMyTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    
    // ⭐ 添加详细日志用于调试
    logger.info(`[getMyTasks] 请求参数: userId=${userId}, page=${req.query.page}, page_size=${req.query.page_size}`)
    logger.info(`[getMyTasks] req.user:`, JSON.stringify(req.user || null))
    
    // 允许未登录用户查看空任务列表，不跳转登录
    if (!userId) {
      logger.info(`[getMyTasks] 用户未登录，返回空列表`)
      success(res, {
        tasks: [],
        total: 0,
        page: 1,
        page_size: 10,
      }, '获取任务列表成功')
      return
    }

    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 10
    const includeDoneStr = String(req.query.include_done || 'false')
    const includeDone = includeDoneStr === 'true' || includeDoneStr === '1'
    
    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 步骤1：从分站数据库获取用户的main_task_id列表
    try {
      const { query } = await import('../config/database')
      
      // 获取用户的所有main_task_id
      const userTasks = await query<any[]>(
        'SELECT main_task_id FROM user_tasks WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      )
      
      logger.info(`[getMyTasks] 查询到 ${userTasks.length} 条用户任务记录`)
      
      const mainTaskIds = userTasks.map(ut => ut.main_task_id)
      
      logger.info(`[getMyTasks] main_task_id列表:`, mainTaskIds)
      
      if (mainTaskIds.length === 0) {
        // 用户没有任务，直接返回空列表
        logger.info(`[getMyTasks] 用户没有任务，返回空列表`)
        success(res, {
          tasks: [],
          total: 0,
          page,
          page_size: pageSize,
        })
        return
      }
      
      // ⭐ 修复：使用主站的批量查询接口一次性获取所有任务详情
      // 这样比逐个查询更高效，且主站接口已支持管理员用户查询任何任务
      logger.info(`[getMyTasks] 从主站批量获取 ${mainTaskIds.length} 个任务的详情`)
      
      let allTasks: any[] = []
      
      try {
        // 使用批量查询接口，一次性获取所有任务
        // 主站的批量查询接口支持最多100个任务，如果超过100个，需要分批查询
        const batchSize = 100
        for (let i = 0; i < mainTaskIds.length; i += batchSize) {
          const batch = mainTaskIds.slice(i, i + batchSize)
          const taskIdsParam = batch.join(',')
          
          try {
            const batchResult = await proxyRequest(
              'GET',
              '/api/tasks/batch',
              { task_ids: taskIdsParam },
              siteToken // 使用分站token（应该是管理员用户，可以查询任何任务）
            )
            
            // 主站返回格式：{ ok: 1, tasks: [...], total: ... }
            const tasks = batchResult.tasks || batchResult.data?.tasks || []
            logger.info(`[getMyTasks] 批量查询结果: ok=${batchResult.ok}, tasks数量=${tasks.length}, 原始数据keys=${Object.keys(batchResult).join(',')}`)
            allTasks.push(...tasks)
            
            logger.info(`[getMyTasks] 批量查询成功，获取到 ${tasks.length} 个任务，当前总任务数: ${allTasks.length}`)
          } catch (batchErr: any) {
            logger.warn(`批量查询任务失败（${batch.length}个任务）:`, batchErr.message || batchErr)
            // 如果批量查询失败，回退到逐个查询（兼容性处理）
            logger.debug(`回退到逐个查询模式...`)
            for (const taskId of batch) {
              try {
                const taskResult = await proxyRequest(
                  'GET',
                  `/api/tasks/${taskId}`,
                  {},
                  siteToken
                )
                const task = taskResult.task || taskResult.data?.task || taskResult
                if (task && (task.id === taskId || task.task_id === taskId)) {
                  allTasks.push(task)
                }
              } catch (err: any) {
                logger.warn(`获取任务 ${taskId} 详情失败:`, err.message || err)
              }
            }
          }
        }
        
        logger.info(`[getMyTasks] 成功获取 ${allTasks.length} 个任务（共 ${mainTaskIds.length} 个）`)
      } catch (err: any) {
        logger.error('[getMyTasks] 从主站获取任务详情失败:', err)
        // 如果批量查询完全失败，返回空列表（而不是返回错误，让前端显示空列表）
        allTasks = []
      }
      
      // 如果需要过滤已完成的任务
      logger.info(`[getMyTasks] 过滤前任务数: ${allTasks.length}, includeDone: ${includeDone}`)
      if (!includeDone) {
        allTasks = allTasks.filter(task => task.status !== 'done' && task.status !== 'failed')
        logger.info(`[getMyTasks] 过滤后任务数: ${allTasks.length}`)
      }
      
      // 步骤3：按创建时间排序（最新的在前）
      allTasks.sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime()
        const timeB = new Date(b.created_at || 0).getTime()
        return timeB - timeA
      })
      
      // 步骤4：分页处理
      const total = allTasks.length
      const offset = (page - 1) * pageSize
      const paginatedTasks = allTasks.slice(offset, offset + pageSize)
      
      // 步骤4.5：移除 download_url 字段（安全考虑），但保留 alist_url（用户有权访问自己的任务链接）
      // 注意：这里不移除 alist_url，因为用户需要能够复制自己任务的下载链接
      const safeTasks = paginatedTasks.map(task => {
        if (!task || typeof task !== 'object') {
          return task
        }
        // 只移除 download_url，保留 alist_url
        const { download_url, ...safeTask } = task
        return safeTask
      })
      
      logger.info(`[getMyTasks] 最终返回: tasks=${safeTasks.length}, total=${total}, page=${page}, page_size=${pageSize}`)
      
      success(res, {
        tasks: safeTasks,
        total,
        page,
        page_size: pageSize,
      })
      
      // 步骤5：异步更新分站数据库中的任务状态
      if (paginatedTasks.length > 0) {
        Promise.all(
          paginatedTasks.map(async (task: any) => {
            try {
              await query(
                `UPDATE user_tasks 
                SET status = ?, progress = ?, error = ?, download_url = ?, alist_url = ?, updated_at = NOW()
                WHERE user_id = ? AND main_task_id = ?`,
                [
                  task.status || 'queued',
                  task.progress || 0,
                  task.error || null,
                  task.download_url || task.alist_url || null,
                  task.alist_url || null,
                  userId,
                  task.id || task.task_id
                ]
              )
            } catch (updateErr) {
              logger.warn(`更新任务 ${task.id || task.task_id} 状态失败:`, updateErr)
            }
          })
        ).catch(err => logger.warn('批量更新任务状态失败:', err))
      }
      
    } catch (dbErr: any) {
      // 如果表不存在，返回空列表
      if (dbErr.code === 'ER_NO_SUCH_TABLE') {
        logger.warn('user_tasks表不存在，返回空任务列表')
        success(res, {
          tasks: [],
          total: 0,
          page: 1,
          page_size: pageSize,
        })
        return
      }
      
      logger.error('从分站数据库获取用户任务ID失败:', dbErr)
      error(res, '获取任务列表失败', 500)
    }
  } catch (err: any) {
    logger.error('获取我的任务列表失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, err.message || '获取任务列表失败', 500)
  }
}

/**
 * 获取任务详情（通过主站API）
 */
export async function getTaskDetail(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.id
    const isStatusRequest = req.originalUrl?.includes('/status') || req.path.includes('/status')
    
    if (!taskId) {
      error(res, '任务ID不能为空', 400)
      return
    }

    // 提取用户的Authorization token（从原始请求中）
    const authHeader = req.headers.authorization || req.headers.Authorization
    const userAuthToken = Array.isArray(authHeader) ? authHeader[0] : authHeader

    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 通过主站API获取任务详情或状态
    // 如果是状态请求，使用 /status 路径；否则使用详情路径
    const mainSitePath = isStatusRequest 
      ? `/api/tasks/${taskId}/status`
      : `/api/tasks/${taskId}`

    try {
      const result = await proxyRequest(
        'GET',
        mainSitePath,
        {},
        siteToken,
        userAuthToken || undefined
      )
      
      // 移除下载链接字段（安全考虑）
      let safeResult = result
      if (result && typeof result === 'object') {
        if (result.task) {
          safeResult = { ...result, task: removeDownloadUrls(result.task) }
        } else if (result.data?.task) {
          safeResult = { ...result, data: { ...result.data, task: removeDownloadUrls(result.data.task) } }
        } else {
          // 如果result本身就是任务对象
          safeResult = removeDownloadUrls(result)
        }
      }
      
      success(res, safeResult)
    } catch (err: any) {
      // 安全地记录错误信息（避免循环引用）
      const errorInfo: any = {
        message: err.message || '未知错误',
        code: err.code,
        name: err.name,
      }
      
      if (err.response) {
        errorInfo.response = {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        }
        errorInfo.url = typeof err.config?.url === 'string' ? err.config.url : 'unknown'
        
        logger.error('通过主站API获取任务详情失败（响应错误）:', errorInfo)
        error(res, err.response.data?.msg || '获取任务详情失败', err.response.status || 404)
      } else if (err.request) {
        errorInfo.request = {
          message: err.message,
          code: err.code,
        }
        
        logger.error('通过主站API获取任务详情失败（请求失败）:', errorInfo)
        error(res, '无法连接到主站，请检查网络连接', 500)
      } else {
        logger.error('通过主站API获取任务详情失败（其他错误）:', errorInfo)
        error(res, err.message || '获取任务详情失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('获取任务详情失败:', {
      message: err.message || '未知错误',
      stack: err.stack,
    })
    error(res, err.message || '获取任务详情失败', 500)
  }
}

/**
 * 获取全站任务列表（通过主站API，获取全部任务）
 * 注意：前端调用不需要token，但分站后端需要使用分站token调用主站API
 * 如果主站的分站token对应用户是管理员，可以获取全部任务；否则只能获取该token用户的任务
 */
export async function getAllTasks(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 50
    const includeDoneStr = String(req.query.include_done || 'false')
    const includeDone = includeDoneStr === 'true' || includeDoneStr === '1'
    const onlyMineStr = String(req.query.only_mine || 'false')
    const onlyMine = onlyMineStr === 'true' || onlyMineStr === '1'

    logger.debug('获取全站任务列表:', { page, pageSize, includeDone, onlyMine })

    // ⭐ 全站提取任务列表：允许未登录访问
    // 不传递token，让主站API以未登录方式返回全站任务
    // 这样即使主站API使用 authenticate，也会因为未提供token而返回错误
    // 但如果主站API使用 optionalAuth，就能正常工作
    // 
    // 注意：如果主站API还在使用 authenticate，需要更新主站代码
    try {
      // 构建请求参数
      const params: any = { page, page_size: pageSize, include_done: includeDone }
      if (onlyMine) {
        params.only_mine = true
      }

      const result = await proxyRequest(
        'GET',
        '/api/tasks',
        params,
        undefined // ⭐ 明确传递 undefined，不设置 Authorization header，允许未登录访问
      )
      
      logger.debug('主站API响应（全站任务）:', {
        ok: result.ok,
        hasTasks: !!result.tasks,
        tasksLength: result.tasks?.length || result.data?.tasks?.length || 0,
        total: result.total || result.data?.total,
      })
      
      // 主站返回格式：{ ok: 1, msg: '...', data: { tasks: [...], total: ... } }
      // 分站success函数会将data直接合并到响应对象中，所以直接传递主站的data
      if (result.ok === 1) {
        // 如果主站返回有data字段，使用data；否则直接使用result（兼容不同格式）
        const responseData = result.data || result
        // 移除下载链接字段（安全考虑）
        const safeTasks = removeDownloadUrlsFromTasks(responseData.tasks || [])
        // 确保响应包含所有必要的字段
        success(res, {
          tasks: safeTasks,
          total: responseData.total || 0,
          page: responseData.page || page,
          page_size: responseData.page_size || pageSize,
          stats: responseData.stats || undefined,
        })
      } else {
        error(res, result.msg || '获取任务列表失败', 500)
      }
    } catch (err: any) {
      logger.error('通过主站API获取任务列表失败:', err)
      if (err.response) {
        error(res, err.response.data?.msg || '获取任务列表失败', err.response.status || 500)
      } else {
        error(res, '获取任务列表失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('获取任务列表失败:', err)
    error(res, '获取任务列表失败', 500)
  }
}

/**
 * 创建任务（通过主站API）
 * 安全机制：必须先通过 /api/vip-coin/perform-action 扣费，才能创建任务
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const { bundle_id, app_name, version, real_version, country, device_id, icon_url, decrypt_mode } = req.body

    if (!bundle_id) {
      error(res, 'Bundle ID 不能为空', 400)
      return
    }

    if (!version) {
      error(res, 'Version 不能为空，必须是 App Store 发行号（纯数字）', 400)
      return
    }

    // 验证 version 是否为纯数字（App Store 发行号）
    if (!/^\d+$/.test(version)) {
      error(res, 'Version 必须是 App Store 发行号（纯数字），不是显示版本号', 400)
      return
    }

    // 必须登录才能创建任务
    if (!userId) {
      error(res, '未登录，无法创建任务', 401)
      return
    }

    // 安全验证：检查用户是否有最近的扣费记录（最近5分钟内针对该应用的脱壳操作）
    // 只有通过 /api/vip-coin/perform-action 扣费后才能创建任务
    const recentTransactions = await query<any[]>(
      `SELECT * FROM coin_transactions 
       WHERE user_id = ? 
         AND type = 'consume' 
         AND description LIKE ?
         AND description LIKE ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, `%砸壳:%${bundle_id}%`, `%${version || ''}%`]
    )
    
    // 如果上面的查询没有结果，尝试更宽松的匹配
    let transactions = recentTransactions
    if (!transactions || transactions.length === 0) {
      transactions = await query<any[]>(
        `SELECT * FROM coin_transactions 
         WHERE user_id = ? 
           AND type = 'consume' 
           AND (description LIKE ? OR description LIKE ?)
           AND description LIKE ?
           AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId, `%砸壳: %${bundle_id}%`, `%dump: %${bundle_id}%`, `%${version || ''}%`]
      )
    }

    // 如果没有扣费记录，检查每日使用记录（用于免费操作）
    if (!transactions || transactions.length === 0) {
      const dailyUsage = await query<any[]>(
        `SELECT * FROM daily_usage 
         WHERE user_id = ? 
           AND action_type = 'dump'
           AND usage_date = CURDATE()
           AND (usage_count > 0 OR updated_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE))
         LIMIT 1`,
        [userId]
      )

      if (!dailyUsage || dailyUsage.length === 0) {
        logger.warn(`用户 ${userId} 尝试创建任务但无扣费记录: ${bundle_id}/${version}`)
        error(res, '请先通过扣费接口进行扣费操作才能创建任务', 403)
        return
      }

      logger.info(`用户 ${userId} 验证通过（有每日使用记录），创建任务: ${bundle_id}/${version}`)
    } else {
      logger.info(`用户 ${userId} 验证通过（有扣费记录），创建任务: ${bundle_id}/${version}`)
    }

    // 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 通过主站API创建任务（使用分站token和用户token）
    try {
      // 构建请求参数，按照API文档要求
      const taskData: any = {
        bundle_id,
        version,
        country: country || 'cn'
      }
      
      // 可选参数：只有提供时才传递
      if (app_name) taskData.app_name = app_name
      if (real_version) taskData.real_version = real_version
      if (icon_url) taskData.icon_url = icon_url
      if (device_id) taskData.device_id = device_id
      if (decrypt_mode) taskData.decrypt_mode = decrypt_mode
      
      // ⚠️ 注意：不传递 size_mb，系统会自动从缓存或Apple API获取
      // ⚠️ 注意：不传递 app_name, icon_url 时，系统会自动从缓存获取
      
      const result = await proxyRequest(
        'POST',
        '/api/tasks',
        taskData,
        siteToken,
        req.headers.authorization as string
      )
      
      // ⭐ 如果任务创建成功，保存到分站数据库（与performActionDeduct中的逻辑一致）
      if (result.ok === 1 || result.task_id) {
        const mainTaskId = result.task_id
        
        try {
          // ⭐ 确保表存在：使用CREATE TABLE IF NOT EXISTS，不依赖异常处理
          await query(`
            CREATE TABLE IF NOT EXISTS \`user_tasks\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`user_id\` INT NOT NULL COMMENT '分站用户ID',
              \`main_task_id\` INT NOT NULL COMMENT '主站任务ID',
              \`bundle_id\` VARCHAR(255) NOT NULL COMMENT '应用Bundle ID',
              \`app_name\` VARCHAR(255) DEFAULT NULL COMMENT '应用名称',
              \`version\` VARCHAR(100) DEFAULT NULL COMMENT 'App Store发行号',
              \`real_version\` VARCHAR(100) DEFAULT NULL COMMENT '真实版本号',
              \`country\` VARCHAR(10) DEFAULT 'cn' COMMENT '国家/地区',
              \`icon_url\` VARCHAR(500) DEFAULT NULL COMMENT '应用图标URL',
              \`status\` VARCHAR(50) DEFAULT 'queued' COMMENT '任务状态：queued, running, done, error',
              \`progress\` INT DEFAULT 0 COMMENT '进度（0-100）',
              \`error\` TEXT DEFAULT NULL COMMENT '错误信息',
              \`download_url\` VARCHAR(500) DEFAULT NULL COMMENT '下载链接',
              \`alist_url\` VARCHAR(500) DEFAULT NULL COMMENT 'Alist链接',
              \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
              \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
              PRIMARY KEY (\`id\`),
              KEY \`idx_user_id\` (\`user_id\`),
              KEY \`idx_main_task_id\` (\`main_task_id\`),
              KEY \`idx_status\` (\`status\`),
              KEY \`idx_created_at\` (\`created_at\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务表'
          `)
          
          // 插入用户任务记录
          await query(
            `INSERT INTO user_tasks (
              user_id, main_task_id, bundle_id, app_name, version, real_version,
              country, icon_url, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', NOW())`,
            [
              userId,
              mainTaskId,
              bundle_id,
              app_name || bundle_id,
              version || null,
              real_version || null,
              country || 'cn',
              icon_url || null
            ]
          )
          logger.info(`✅ 保存用户任务到分站数据库成功: user_id=${userId}, main_task_id=${mainTaskId}`)
        } catch (dbErr: any) {
          logger.error(`❌ 保存用户任务到分站数据库失败: ${dbErr.message}`, {
            userId,
            mainTaskId,
            bundleId: bundle_id,
            error: dbErr
          })
          // 即使保存失败，也继续返回成功（因为主站任务已创建成功）
        }
      }
      
      success(res, result)
    } catch (err: any) {
      logger.error('通过主站API创建任务失败:', err)
      if (err.response) {
        error(res, err.response.data?.msg || '创建任务失败', err.response.status || 500)
      } else {
        error(res, '创建任务失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('创建任务失败:', err)
    error(res, '创建任务失败', 500)
  }
}

/**
 * 取消任务（通过主站API）
 */
export async function cancelTask(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.id
    const userId = (req as any).user?.userId

    if (!taskId) {
      error(res, '任务ID不能为空', 400)
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
        `/api/tasks/${taskId}/cancel`,
        {},
        siteToken,
        req.headers.authorization as string
      )
      
      success(res, result)
    } catch (err: any) {
      logger.error('通过主站API取消任务失败:', err)
      if (err.response) {
        error(res, err.response.data?.msg || '取消任务失败', err.response.status || 500)
      } else {
        error(res, '取消任务失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('取消任务失败:', err)
    error(res, '取消任务失败', 500)
  }
}

/**
 * 重试任务（通过主站API）
 */
export async function retryTask(req: Request, res: Response): Promise<void> {
  try {
    const taskId = req.params.id
    const userId = (req as any).user?.userId

    if (!taskId) {
      error(res, '任务ID不能为空', 400)
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

    // 通过主站API重试任务
    try {
      const result = await proxyRequest(
        'POST',
        `/api/tasks/${taskId}/retry`,
        {},
        siteToken,
        req.headers.authorization as string
      )
      
      success(res, result)
    } catch (err: any) {
      logger.error('通过主站API重试任务失败:', err)
      if (err.response) {
        error(res, err.response.data?.msg || '重试任务失败', err.response.status || 500)
      } else {
        error(res, '重试任务失败', 500)
      }
    }
  } catch (err: any) {
    logger.error('重试任务失败:', err)
    error(res, '重试任务失败', 500)
  }
}

