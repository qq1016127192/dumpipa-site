/**
 * 会员和金币系统控制器
 */

import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import * as vipCoinService from '../services/vipCoinService'
import { logger } from '../utils/logger'
import { query } from '../config/database'
import { proxyRequest, getSiteToken } from '../services/proxyService'

/**
 * 获取系统配置
 */
export async function getSystemConfig(_req: Request, res: Response): Promise<void> {
  try {
    const config = await vipCoinService.getSystemConfig()
    success(res, { config })
  } catch (err) {
    logger.error('获取系统配置失败:', err)
    error(res, '获取系统配置失败', 500)
  }
}

/**
 * 更新系统配置
 */
export async function updateSystemConfig(req: Request, res: Response): Promise<void> {
  try {
    const configs = req.body.configs
    if (!configs || !Array.isArray(configs)) {
      error(res, '配置数据格式错误', 400)
      return
    }

    await vipCoinService.updateSystemConfig(configs)
    success(res, { message: '配置更新成功' })
  } catch (err) {
    logger.error('更新系统配置失败:', err)
    error(res, '更新系统配置失败', 500)
  }
}

/**
 * 获取会员套餐列表
 */
export async function getVipPackages(req: Request, res: Response): Promise<void> {
  try {
    const includeInactive = req.query.include_inactive === 'true'
    const packages = await vipCoinService.getVipPackages(includeInactive)
    success(res, { packages })
  } catch (err) {
    logger.error('获取会员套餐列表失败:', err)
    error(res, '获取会员套餐列表失败', 500)
  }
}

/**
 * 创建会员套餐
 */
export async function createVipPackage(req: Request, res: Response): Promise<void> {
  try {
    const packageData = req.body
    const packageId = await vipCoinService.createVipPackage(packageData)
    success(res, { id: packageId, message: '套餐创建成功' })
  } catch (err) {
    logger.error('创建会员套餐失败:', err)
    error(res, '创建会员套餐失败', 500)
  }
}

/**
 * 更新会员套餐
 */
export async function updateVipPackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const packageData = req.body
    await vipCoinService.updateVipPackage(parseInt(id), packageData)
    success(res, { message: '套餐更新成功' })
  } catch (err) {
    logger.error('更新会员套餐失败:', err)
    error(res, '更新会员套餐失败', 500)
  }
}

/**
 * 删除会员套餐
 */
export async function deleteVipPackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    await vipCoinService.deleteVipPackage(parseInt(id))
    success(res, { message: '套餐删除成功' })
  } catch (err) {
    logger.error('删除会员套餐失败:', err)
    error(res, '删除会员套餐失败', 500)
  }
}

/**
 * 获取金币套餐列表
 */
export async function getCoinPackages(req: Request, res: Response): Promise<void> {
  try {
    const includeInactive = req.query.include_inactive === 'true'
    const packages = await vipCoinService.getCoinPackages(includeInactive)
    success(res, { packages })
  } catch (err) {
    logger.error('获取金币套餐列表失败:', err)
    error(res, '获取金币套餐列表失败', 500)
  }
}

/**
 * 创建金币套餐
 */
export async function createCoinPackage(req: Request, res: Response): Promise<void> {
  try {
    const packageData = req.body
    const packageId = await vipCoinService.createCoinPackage(packageData)
    success(res, { id: packageId, message: '套餐创建成功' })
  } catch (err) {
    logger.error('创建金币套餐失败:', err)
    error(res, '创建金币套餐失败', 500)
  }
}

/**
 * 更新金币套餐
 */
export async function updateCoinPackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const packageData = req.body
    await vipCoinService.updateCoinPackage(parseInt(id), packageData)
    success(res, { message: '套餐更新成功' })
  } catch (err) {
    logger.error('更新金币套餐失败:', err)
    error(res, '更新金币套餐失败', 500)
  }
}

/**
 * 删除金币套餐
 */
export async function deleteCoinPackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    await vipCoinService.deleteCoinPackage(parseInt(id))
    success(res, { message: '套餐删除成功' })
  } catch (err) {
    logger.error('删除金币套餐失败:', err)
    error(res, '删除金币套餐失败', 500)
  }
}

/**
 * 获取用户金币交易记录
 */
export async function getUserCoinTransactions(req: Request, res: Response): Promise<void> {
  try {
    const { user_id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    
    const result = await vipCoinService.getUserCoinTransactions(parseInt(user_id), page, pageSize)
    success(res, result)
  } catch (err) {
    logger.error('获取金币交易记录失败:', err)
    error(res, '获取金币交易记录失败', 500)
  }
}

/**
 * 给用户充值金币（管理员操作）
 */
export async function rechargeCoin(req: Request, res: Response): Promise<void> {
  try {
    const { user_id, amount, reason } = req.body
    
    if (!user_id || !amount || amount <= 0) {
      error(res, '参数错误', 400)
      return
    }

    await vipCoinService.rechargeCoin(user_id, amount, reason || '管理员充值')
    success(res, { message: '充值成功' })
  } catch (err) {
    logger.error('充值金币失败:', err)
    error(res, '充值金币失败', 500)
  }
}

/**
 * 获取用户每日使用统计
 */
export async function getDailyUsage(req: Request, res: Response): Promise<void> {
  try {
    const { user_id } = req.params
    // 如果前端传入日期，使用前端日期；否则使用MySQL的CURDATE()
    const date = req.query.date as string
    
    let usage
    if (date) {
      usage = await vipCoinService.getDailyUsage(parseInt(user_id), date)
    } else {
      // 使用服务器本地日期
      const [result] = await query<any[]>('SELECT CURDATE() as today')
      usage = await vipCoinService.getDailyUsage(parseInt(user_id), result.today)
    }
    
    success(res, { usage })
  } catch (err) {
    logger.error('获取每日使用统计失败:', err)
    error(res, '获取每日使用统计失败', 500)
  }
}

/**
 * 获取会员订单列表
 */
export async function getVipOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const status = req.query.status as string
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined
    
    const result = await vipCoinService.getVipOrders(page, pageSize, status, userId)
    success(res, result)
  } catch (err) {
    logger.error('获取会员订单列表失败:', err)
    error(res, '获取会员订单列表失败', 500)
  }
}

/**
 * 手动设置用户会员（管理员操作）
 */
export async function setUserVip(req: Request, res: Response): Promise<void> {
  try {
    const { user_id, vip_level, duration_days } = req.body
    
    if (!user_id || !vip_level || !duration_days) {
      error(res, '参数错误', 400)
      return
    }

    await vipCoinService.setUserVip(user_id, vip_level, duration_days)
    success(res, { message: '会员设置成功' })
  } catch (err) {
    logger.error('设置用户会员失败:', err)
    error(res, '设置用户会员失败', 500)
  }
}

/**
 * 执行下载或砸壳扣费
 * 流程：
 * 1. 先检查分站是否可以执行操作（不扣费）
 * 2. 在分站扣费
 * 3. 调用主站的统一接口（主站会自动扣费）
 */
export async function performActionDeduct(req: Request, res: Response): Promise<void> {
  try {
    const { action, bundle_id, version, app_name, size_mb, country, icon_url, real_version } = req.body
    const userId = (req as any).user?.userId
    
    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    if (!action || (action !== 'download' && action !== 'dump')) {
      error(res, '无效的操作类型', 400)
      return
    }

    // ⚠️ 重要：size_mb 不能由用户填写传递，需要从主站获取应用大小
    // 如果用户传递了 size_mb，拒绝请求
    if (size_mb !== undefined && size_mb !== null) {
      error(res, 'size_mb 参数不能由用户填写传递，系统会自动从主站获取应用大小', 400)
      return
    }

    // 2. 获取分站token
    const siteToken = await getSiteToken()
    if (!siteToken) {
      logger.error('分站Token未配置')
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    // 3. 从主站获取应用信息（包括应用大小）
    let finalSizeMB: number | null = null
    const finalCountry = country || 'cn'
    
    try {
      logger.info(`[performActionDeduct] 从主站获取应用信息: bundle_id=${bundle_id}, country=${finalCountry}`)
      
      // 调用主站的应用详情接口获取应用大小
      const appInfoResult = await proxyRequest(
        'GET',
        `/api/apps/?bundle_id=${bundle_id}&country=${finalCountry}`,
        {},
        siteToken
      )
      
      if (appInfoResult.ok === 1 && appInfoResult.app && appInfoResult.app.fileSizeBytes) {
        finalSizeMB = parseFloat((appInfoResult.app.fileSizeBytes / 1024 / 1024).toFixed(2))
        logger.info(`[performActionDeduct] 从主站获取应用大小: ${finalSizeMB} MB (${appInfoResult.app.fileSizeBytes} 字节)`)
      } else {
        logger.warn(`[performActionDeduct] 主站未返回应用大小: bundle_id=${bundle_id}`)
      }
    } catch (appInfoError: any) {
      logger.warn(`[performActionDeduct] 从主站获取应用信息失败: ${appInfoError.message}`)
      // 继续执行，使用默认值
    }

    // 如果无法获取应用大小，返回错误
    if (!finalSizeMB || finalSizeMB <= 0) {
      error(res, '无法获取应用大小，请确保应用信息已缓存或主站可访问', 400)
      return
    }

    // 1. 先检查分站是否可以执行操作（不扣费，只检查）
    const checkResult = await vipCoinService.canUserPerformAction(
      userId,
      action,
      finalSizeMB
    )

    if (!checkResult.allowed) {
      error(res, checkResult.reason || '操作失败', 400)
      return
    }

    // 4. 先在分站扣费（分站独立扣费）
    const result = await vipCoinService.performActionAndDeduct(
      userId,
      action,
      { bundle_id, version, app_name, size_mb: finalSizeMB }
    )

    if (!result.success) {
      logger.error('分站扣费失败:', result.message)
      error(res, result.message, 400)
      return
    }

    logger.info(`分站扣费成功，action: ${action}, 分站cost: ${result.cost}`)

    // 4. 根据action类型执行后续操作（主站会自动扣费）
    if (action === 'download') {
      // 下载：直接调用主站的下载链接接口（主站会自动扣费）
      try {
        const downloadResult = await proxyRequest(
          'GET',
          '/api/apps/download-url',
          {
            bundle_id,
            version,
            country: country || 'cn'
          },
          siteToken
        )

        // 主站响应格式：{ ok: 1, download_url: '...', size: '...' }
        if (downloadResult.ok === 1 && downloadResult.download_url) {
          success(res, {
            cost: result.cost,
            is_free: result.isFree,
            message: result.message,
            download_url: downloadResult.download_url,
            size: downloadResult.size || '未知'
          })
        } else {
          // 主站返回了错误响应，传递主站的错误信息
          error(res, downloadResult.msg || '获取下载链接失败', downloadResult.ok === 0 ? 404 : 500)
        }
      } catch (downloadErr: any) {
        // 从错误响应中提取主站的错误信息
        let errorMessage = '获取下载链接失败'
        let statusCode = 500
        
        if (downloadErr.response && downloadErr.response.data) {
          const errorData = downloadErr.response.data
          errorMessage = errorData.msg || errorData.message || errorMessage
          statusCode = downloadErr.response.status || statusCode
        } else if (downloadErr.message) {
          errorMessage = downloadErr.message
        }
        
        logger.error('获取下载链接失败:', {
          message: errorMessage,
          status: statusCode,
          bundle_id,
          version,
          error: downloadErr.response?.data || downloadErr.message
        })
        
        error(res, errorMessage, statusCode)
      }
    } else if (action === 'dump') {
      // 脱壳：直接调用主站的创建任务接口（主站会自动扣费）
      // ⚠️ 注意：size_mb 不能由用户填写传递，主站会自动从缓存或 Apple API 获取
      try {
        logger.info(`[performActionDeduct] 创建脱壳任务: bundle_id=${bundle_id}, version=${version}, real_version=${real_version}`)
        
        const taskResult = await proxyRequest(
          'POST',
          '/api/tasks',
          {
            bundle_id,
            app_name,
            version,
            real_version,
            country: country || 'cn',
            icon_url,
            // ⚠️ size_mb 不再传递，主站会自动从缓存或 Apple API 获取
            // ⭐ device_id 不再传递，主站会自动分配可用设备
          },
          siteToken
        )

        // 主站响应格式：{ ok: 1, task_id: ..., bundle_id: ..., app_name: ..., msg: '...' }
        if (taskResult.ok === 1 || taskResult.task_id) {
          const mainTaskId = taskResult.task_id
          
          // 保存任务到分站数据库（必需，否则用户无法在"我的提取"中看到任务）
          try {
            const { query } = await import('../config/database')
            
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
          }
          
          success(res, {
            cost: result.cost,
            is_free: result.isFree,
            message: result.message,
            task_id: mainTaskId,
            bundle_id: taskResult.bundle_id || bundle_id,
            app_name: taskResult.app_name || app_name
          })
        } else {
          error(res, taskResult.msg || '创建任务失败', 500)
        }
      } catch (taskErr: any) {
        logger.error('创建任务失败:', taskErr)
        let errorMessage = '创建任务失败'
        let statusCode = 500
        
        if (taskErr.response && taskErr.response.data) {
          const errorData = taskErr.response.data
          errorMessage = errorData.msg || errorData.message || errorMessage
          statusCode = taskErr.response.status || statusCode
        } else if (taskErr.message) {
          errorMessage = taskErr.message
        }
        
        error(res, errorMessage, statusCode)
      }
    } else {
      // 其他情况（理论上不会到这里）
      success(res, {
        cost: result.cost,
        is_free: result.isFree,
        message: result.message
      })
    }
  } catch (err) {
    logger.error('执行扣费失败:', err)
    error(res, '执行扣费失败', 500)
  }
}

/**
 * 获取大小范围配置
 */
export async function getSizeConfigs(req: Request, res: Response): Promise<void> {
  try {
    const { action_type } = req.query
    if (!action_type || (action_type !== 'download' && action_type !== 'dump')) {
      error(res, '无效的操作类型', 400)
      return
    }
    
    const configs = await vipCoinService.getSizeConfigs(action_type as 'download' | 'dump')
    success(res, { configs })
  } catch (err) {
    logger.error('获取大小范围配置失败:', err)
    error(res, '获取大小范围配置失败', 500)
  }
}

/**
 * 更新大小范围配置
 */
export async function updateSizeConfigs(req: Request, res: Response): Promise<void> {
  try {
    const { action_type, configs } = req.body
    if (!action_type || (action_type !== 'download' && action_type !== 'dump')) {
      error(res, '无效的操作类型', 400)
      return
    }
    
    if (!configs || !Array.isArray(configs)) {
      error(res, '配置数据格式错误', 400)
      return
    }
    
    await vipCoinService.updateSizeConfigs(action_type as 'download' | 'dump', configs)
    success(res, { message: '配置更新成功' })
  } catch (err) {
    logger.error('更新大小范围配置失败:', err)
    error(res, '更新大小范围配置失败', 500)
  }
}

/**
 * 根据应用大小计算金币
 */
export async function calculateCoinBySize(req: Request, res: Response): Promise<void> {
  try {
    const { action_type, size_mb } = req.query
    if (!action_type || (action_type !== 'download' && action_type !== 'dump')) {
      error(res, '无效的操作类型', 400)
      return
    }
    
    const size = size_mb ? parseFloat(size_mb as string) : null
    const coinCost = await vipCoinService.calculateCoinBySize(action_type as 'download' | 'dump', size)
    success(res, { coin_cost: coinCost })
  } catch (err) {
    logger.error('计算金币失败:', err)
    error(res, '计算金币失败', 500)
  }
}

/**
 * 创建会员订单
 */
export async function createVipOrder(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const { package_id, pay_type } = req.body

    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    if (!package_id) {
      error(res, '请选择套餐', 400)
      return
    }

    // 获取套餐信息
    const packages = await query<any[]>(
      `SELECT * FROM vip_packages WHERE id = ? AND (is_active = 1 OR status = 1)`,
      [package_id]
    )

    if (packages.length === 0) {
      error(res, '套餐不存在或已下架', 404)
      return
    }

    const packageInfo = packages[0]
    
    // 确定支付方式和金额
    let finalPayType = pay_type || 'alipay'
    let amount = 0
    
    if (finalPayType === 'coin') {
      // 金币支付
      amount = parseFloat(packageInfo.coin_price || 0)
      
      if (amount <= 0) {
        error(res, '该套餐不支持金币支付', 400)
        return
      }
      
      // 检查用户金币是否足够（使用balance字段）
      const [user] = await query<any[]>(
        `SELECT balance FROM users WHERE id = ?`,
        [userId]
      )
      
      if (!user || parseFloat(user.balance) < amount) {
        error(res, '金币余额不足', 400)
        return
      }
    } else {
      // 现金支付
      amount = parseFloat(packageInfo.price)
    }

    // 生成订单号
    const orderNo = `VIP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 计算会员到期时间
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + parseInt(packageInfo.duration))

    // 获取一个默认的支付方式（如果使用现金支付）
    let paymentMethodId = null
    if (finalPayType !== 'coin') {
      const defaultPaymentMethods = await query<any[]>(
        `SELECT id FROM payment_methods WHERE status = 1 ORDER BY sort_order ASC, id ASC LIMIT 1`
      )
      if (defaultPaymentMethods.length > 0) {
        paymentMethodId = defaultPaymentMethods[0].id
      }
    }

    // 创建订单
    const result = await query<any[]>(
      `INSERT INTO vip_orders (user_id, order_no, package_id, package_name, price, duration, pay_type, payment_method_id, expire_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, orderNo, package_id, packageInfo.name, amount, packageInfo.duration, finalPayType, paymentMethodId, expireDate.toISOString().split('T')[0]]
    )

    const orderId = (result as any).insertId

    // 如果是金币支付，立即扣款并完成订单
    if (finalPayType === 'coin') {
      // 扣除金币（使用balance字段）
      const [beforeUser] = await query<any[]>(
        `SELECT balance FROM users WHERE id = ?`,
        [userId]
      )
      const balanceBefore = parseFloat(beforeUser.balance) || 0
      const balanceAfter = balanceBefore - amount
      
      await query(
        `UPDATE users SET balance = ? WHERE id = ?`,
        [balanceAfter, userId]
      )
      
      // 添加交易记录（使用balance_before和balance_after）
      await query(
        `INSERT INTO coin_transactions (user_id, amount, balance_before, balance_after, type, description, related_id)
         VALUES (?, ?, ?, ?, 'consume', '会员开通', ?)`,
        [userId, amount, balanceBefore, balanceAfter, orderId]
      )
      
      // 更新会员信息
      await vipCoinService.setUserVip(userId, packageInfo.vip_level, packageInfo.duration)
      
      // 更新订单状态为已支付
      await query(
        `UPDATE vip_orders SET status = 'paid', paid_at = NOW() WHERE id = ?`,
        [orderId]
      )
      
      success(res, {
        order_id: orderId,
        order_no: orderNo,
        status: 'paid',
        message: '会员开通成功'
      })
    } else {
      // 现金支付，返回订单信息供后续支付
      success(res, {
        order_id: orderId,
        order_no: orderNo,
        amount: amount,
        package_name: packageInfo.name,
        status: 'pending'
      })
    }
  } catch (err) {
    logger.error('创建会员订单失败:', err)
    error(res, '创建会员订单失败', 500)
  }
}

/**
 * 获取会员和金币统计数据
 */
export async function getVipCoinStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await vipCoinService.getVipCoinStats()
    success(res, { stats })
  } catch (err) {
    logger.error('获取统计数据失败:', err)
    error(res, '获取统计数据失败', 500)
  }
}

/**
 * 获取所有金币交易记录（管理员）
 */
export async function getAllCoinTransactions(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : null
    const type = req.query.type as string || null
    const startDate = req.query.start_date as string || null
    const endDate = req.query.end_date as string || null
    const offset = (page - 1) * pageSize

    let sql = `SELECT ct.*, u.username, u.email 
               FROM coin_transactions ct
               LEFT JOIN users u ON ct.user_id = u.id
               WHERE 1=1`
    
    const params: any[] = []
    
    if (userId) {
      sql += ` AND ct.user_id = ?`
      params.push(userId)
    }
    
    if (type) {
      sql += ` AND ct.type = ?`
      params.push(type)
    }
    
    if (startDate) {
      sql += ` AND DATE(ct.created_at) >= ?`
      params.push(startDate)
    }
    
    if (endDate) {
      sql += ` AND DATE(ct.created_at) <= ?`
      params.push(endDate)
    }
    
    // MySQL的LIMIT/OFFSET不支持参数绑定,直接拼接
    sql += ` ORDER BY ct.created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
    
    const transactions = await query<any[]>(sql, params)
    
    // 获取总数
    let countSql = `SELECT COUNT(*) as total 
                    FROM coin_transactions ct
                    WHERE 1=1`
    const countParams: any[] = []
    
    if (userId) {
      countSql += ` AND ct.user_id = ?`
      countParams.push(userId)
    }
    
    if (type) {
      countSql += ` AND ct.type = ?`
      countParams.push(type)
    }
    
    if (startDate) {
      countSql += ` AND DATE(ct.created_at) >= ?`
      countParams.push(startDate)
    }
    
    if (endDate) {
      countSql += ` AND DATE(ct.created_at) <= ?`
      countParams.push(endDate)
    }
    
    const [countResult] = await query<any[]>(countSql, countParams)
    const total = countResult?.total || 0
    
    success(res, {
      transactions,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    })
  } catch (err) {
    logger.error('获取金币交易记录失败:', err)
    error(res, '获取金币交易记录失败', 500)
  }
}

/**
 * 获取所有金币充值订单（管理员）- 分站使用orders表
 */
export async function getAllCoinOrders(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const userId = req.query.user_id ? parseInt(req.query.user_id as string) : null
    const status = req.query.status as string || null
    const startDate = req.query.start_date as string || null
    const endDate = req.query.end_date as string || null
    const offset = (page - 1) * pageSize

    // 分站使用通用的orders表，product_type='coin_package'表示金币充值订单
    let sql = `SELECT o.*, 
               o.product_id as package_id,
               u.username, u.email
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               WHERE o.product_type = 'coin_package'`
    
    const params: any[] = []
    
    if (userId) {
      sql += ` AND o.user_id = ?`
      params.push(userId)
    }
    
    if (status) {
      sql += ` AND o.status = ?`
      params.push(status)
    }
    
    if (startDate) {
      sql += ` AND DATE(o.created_at) >= ?`
      params.push(startDate)
    }
    
    if (endDate) {
      sql += ` AND DATE(o.created_at) <= ?`
      params.push(endDate)
    }
    
    // MySQL的LIMIT/OFFSET不支持参数绑定,直接拼接
    sql += ` ORDER BY o.created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
    
    const orders = await query<any[]>(sql, params)
    
    // 关联查询套餐信息
    for (const order of orders) {
      if (order.package_id) {
        const packages = await query<any[]>(
          `SELECT name, coins, bonus_coins FROM coin_packages WHERE id = ?`,
          [order.package_id]
        )
        if (packages.length > 0) {
          order.package_name = packages[0].name
          order.coins = packages[0].coins
          order.bonus_coins = packages[0].bonus_coins || 0
        }
      }
    }
    
    // 获取总数
    let countSql = `SELECT COUNT(*) as total 
                    FROM orders o
                    WHERE o.product_type = 'coin_package'`
    const countParams: any[] = []
    
    if (userId) {
      countSql += ` AND o.user_id = ?`
      countParams.push(userId)
    }
    
    if (status) {
      countSql += ` AND o.status = ?`
      countParams.push(status)
    }
    
    if (startDate) {
      countSql += ` AND DATE(o.created_at) >= ?`
      countParams.push(startDate)
    }
    
    if (endDate) {
      countSql += ` AND DATE(o.created_at) <= ?`
      countParams.push(endDate)
    }
    
    const [countResult] = await query<any[]>(countSql, countParams)
    const total = countResult?.total || 0
    
    success(res, {
      orders,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize)
    })
  } catch (err) {
    logger.error('获取充值订单失败:', err)
    error(res, '获取充值订单失败', 500)
  }
}

