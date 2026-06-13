/**
 * 支付设置控制器
 */

import { Request, Response } from 'express'
import { query } from '../config/database'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'

/**
 * 获取所有支付方式
 */
export async function getPaymentMethods(_req: Request, res: Response): Promise<void> {
  try {
    const methods = await query<any[]>(
      `SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC`
    )

    // 获取每个支付方式的配置
    const methodsWithConfigs = await Promise.all(
      methods.map(async (method) => {
        const configs = await query<any[]>(
          `SELECT config_key, config_value FROM payment_configs WHERE payment_method_id = ?`,
          [method.id]
        )
        
        const configMap: Record<string, string> = {}
        configs.forEach((config) => {
          configMap[config.config_key] = config.config_value
        })

        return {
          ...method,
          configs: configMap
        }
      })
    )

    success(res, { methods: methodsWithConfigs })
  } catch (err) {
    logger.error('获取支付方式失败:', err)
    error(res, '获取支付方式失败', 500)
  }
}

/**
 * 添加支付方式
 */
export async function addPaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    const { name, code, description, status, sort_order } = req.body

    if (!name || !code) {
      error(res, '支付方式名称和代码不能为空', 400)
      return
    }

    // 检查表中是否有code列，如果没有则先添加
    try {
      await query('SELECT code FROM payment_methods LIMIT 1')
    } catch (err: any) {
      // 如果code列不存在，尝试添加
      if (err.message?.includes('code') || err.code === 'ER_BAD_FIELD_ERROR') {
        logger.warn('payment_methods表缺少code列，尝试添加...')
        try {
          await query(`
            ALTER TABLE payment_methods 
            ADD COLUMN code VARCHAR(50) NOT NULL DEFAULT '' COMMENT '支付方式代码：alipay, wechat等' AFTER name
          `)
          // 为已存在的数据设置默认code
          await query(`
            UPDATE payment_methods 
            SET code = CONCAT('payment_', id) 
            WHERE code = '' OR code IS NULL
          `)
          // 添加唯一索引
          try {
            await query('ALTER TABLE payment_methods ADD UNIQUE INDEX idx_code (code)')
          } catch (indexErr: any) {
            // 索引可能已存在，忽略错误
            logger.debug('索引可能已存在:', indexErr.message)
          }
          logger.info('已成功添加code列')
        } catch (alterErr: any) {
          logger.error('添加code列失败:', alterErr)
          error(res, '数据库表结构错误，请联系管理员', 500)
          return
        }
      } else {
        throw err
      }
    }

    // 检查代码是否已存在
    const existing = await query<any[]>(
      `SELECT id FROM payment_methods WHERE code = ?`,
      [code]
    )

    if (existing.length > 0) {
      error(res, `支付方式代码 "${code}" 已存在`, 400)
      return
    }

    // 确定支付类型（根据code推断，如果没有匹配则使用code作为type）
    let paymentType = code.toLowerCase()
    const typeMapping: Record<string, string> = {
      'alipay': 'alipay',
      'wxpay': 'wechat',
      'wechat': 'wechat',
      'qqpay': 'qqpay',
      'bank': 'bank',
      'jdpay': 'jdpay',
      'paypal': 'paypal',
    }
    paymentType = typeMapping[paymentType] || paymentType

    const result = await query<any[]>(
      `INSERT INTO payment_methods (name, code, description, type, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, code, description || '', paymentType, status ? 1 : 0, sort_order || 0]
    )

    success(res, {
      id: (result as any).insertId,
      message: '支付方式添加成功'
    })
  } catch (err: any) {
    logger.error('添加支付方式失败:', err)
    error(res, err.message || '添加支付方式失败', 500)
  }
}

/**
 * 更新支付方式
 */
export async function updatePaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { name, description, status, sort_order } = req.body

    if (!id || !name) {
      error(res, '参数不完整', 400)
      return
    }

    await query(
      `UPDATE payment_methods 
       SET name = ?, description = ?, status = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description || '', status ? 1 : 0, sort_order || 0, id]
    )

    success(res, { message: '支付方式更新成功' })
  } catch (err) {
    logger.error('更新支付方式失败:', err)
    error(res, '更新支付方式失败', 500)
  }
}

/**
 * 删除支付方式
 */
export async function deletePaymentMethod(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { force } = req.query // 强制删除参数

    if (!id) {
      error(res, '参数不完整', 400)
      return
    }

    // 检查是否有订单使用该支付方式
      // 分站使用orders表和vip_orders表
      const coinOrders = await query<any[]>(
        `SELECT COUNT(*) as count FROM orders WHERE payment_method_id = ? AND product_type = 'coin_package'`,
        [id]
      )
      const rechargeOrders = coinOrders
    const vipOrders = await query<any[]>(
      `SELECT COUNT(*) as count FROM vip_orders WHERE payment_method_id = ?`,
      [id]
    )

    const rechargeCount = rechargeOrders[0]?.count || 0
    const vipCount = vipOrders[0]?.count || 0
    const totalCount = rechargeCount + vipCount

    // 如果有关联订单且不是强制删除，则阻止删除
    if (totalCount > 0 && force !== 'true') {
      error(
        res,
        `该支付方式已被 ${totalCount} 个订单使用，无法删除。请先将相关订单处理完成或使用软删除（禁用）。如需强制删除，请传递 force=true 参数。`,
        400
      )
      return
    }

    // 如果强制删除，先将相关订单的payment_method_id更新为其他支付方式
    if (totalCount > 0 && force === 'true') {
      // 查找其他可用的支付方式
      const otherMethods = await query<any[]>(
        `SELECT id FROM payment_methods WHERE id != ? AND status = 1 ORDER BY sort_order ASC, id ASC LIMIT 1`,
        [id]
      )

      if (otherMethods.length > 0) {
        const defaultMethodId = otherMethods[0].id
        // 更新充值订单
          if (rechargeCount > 0) {
            await query(
              `UPDATE orders SET payment_method_id = ? WHERE payment_method_id = ? AND product_type = 'coin_package'`,
              [defaultMethodId, id]
            )
          }
        // 更新VIP订单
        if (vipCount > 0) {
          await query(
            `UPDATE vip_orders SET payment_method_id = ? WHERE payment_method_id = ?`,
            [defaultMethodId, id]
          )
        }
        logger.info(`强制删除支付方式 ${id}，已将 ${totalCount} 个订单的支付方式更新为 ${defaultMethodId}`)
      } else {
        // 如果没有其他支付方式，使用第一个支付方式（即使已禁用）
        const anyMethod = await query<any[]>(
          `SELECT id FROM payment_methods WHERE id != ? ORDER BY sort_order ASC, id ASC LIMIT 1`,
          [id]
        )
        if (anyMethod.length > 0) {
          const defaultMethodId = anyMethod[0].id
          if (rechargeCount > 0) {
            await query(
              `UPDATE orders SET payment_method_id = ? WHERE payment_method_id = ? AND product_type = 'coin_package'`,
              [defaultMethodId, id]
            )
          }
          if (vipCount > 0) {
            await query(
              `UPDATE vip_orders SET payment_method_id = ? WHERE payment_method_id = ?`,
              [defaultMethodId, id]
            )
          }
          logger.info(`强制删除支付方式 ${id}，已将 ${totalCount} 个订单的支付方式更新为 ${defaultMethodId}`)
        } else {
          // 如果没有任何其他支付方式，不能删除
          error(res, '无法删除：这是唯一的支付方式，且有关联订单', 400)
          return
        }
      }
    }

    // 先删除关联的配置
    await query(`DELETE FROM payment_configs WHERE payment_method_id = ?`, [id])
    
    // 删除支付方式
    await query(`DELETE FROM payment_methods WHERE id = ?`, [id])

    const message = totalCount > 0 
      ? `支付方式删除成功，已将 ${totalCount} 个订单的支付方式更新为其他支付方式`
      : '支付方式删除成功'
    success(res, { message })
  } catch (err: any) {
    logger.error('删除支付方式失败:', err)
    // 如果是外键约束错误，提供更友好的错误信息
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === '23000') {
      error(res, '该支付方式正在被使用，无法删除。如需强制删除，请传递 force=true 参数', 400)
    } else {
      error(res, err.message || '删除支付方式失败', 500)
    }
  }
}

/**
 * 更新支付配置
 */
export async function updatePaymentConfig(req: Request, res: Response): Promise<void> {
  try {
    const { payment_method_id } = req.params
    const { configs } = req.body

    if (!payment_method_id || !configs) {
      error(res, '参数不完整', 400)
      return
    }

    // 更新或插入配置项
    for (const [key, value] of Object.entries(configs)) {
      await query(
        `INSERT INTO payment_configs (payment_method_id, config_key, config_value)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE config_value = ?, updated_at = NOW()`,
        [payment_method_id, key, value as string, value as string]
      )
    }

    success(res, { message: '支付配置更新成功' })
  } catch (err) {
    logger.error('更新支付配置失败:', err)
    error(res, '更新支付配置失败', 500)
  }
}

/**
 * 获取支付统计信息
 */
export async function getPaymentStats(_req: Request, res: Response): Promise<void> {
  try {
    const totalMethodsResult = await query<any[]>(
      `SELECT COUNT(*) as count FROM payment_methods`
    )

    const enabledMethodsResult = await query<any[]>(
      `SELECT COUNT(*) as count FROM payment_methods WHERE status = 1`
    )

    const totalConfigsResult = await query<any[]>(
      `SELECT COUNT(*) as count FROM payment_configs`
    )

    success(res, {
      total_methods: totalMethodsResult[0]?.count || 0,
      enabled_methods: enabledMethodsResult[0]?.count || 0,
      total_configs: totalConfigsResult[0]?.count || 0
    })
  } catch (err) {
    logger.error('获取支付统计失败:', err)
    error(res, '获取支付统计失败', 500)
  }
}

/**
 * 支付回调通知处理（易支付异步通知）
 */
export async function handlePaymentNotify(req: Request, res: Response): Promise<void> {
  try {
    // 易支付回调可能是GET或POST请求
    const params = { ...req.query, ...req.body }
    
    logger.info('收到支付回调通知:', params)

    const {
      pid,
      trade_no,
      out_trade_no,
      type: _type,
      name: _name,
      money,
      trade_status,
      param: _param,
      sign,
      sign_type: _sign_type = 'MD5'
    } = params

    // 验证必要参数
    if (!pid || !trade_no || !out_trade_no || !trade_status || !sign) {
      logger.error('支付回调参数不完整')
      res.status(400).send('参数不完整')
      return
    }

    // 只有TRADE_SUCCESS是成功
    if (trade_status !== 'TRADE_SUCCESS') {
      logger.info(`订单 ${out_trade_no} 支付状态: ${trade_status}，不需要处理`)
      res.send('success')
      return
    }

    // 根据订单号判断是金币充值订单还是会员订单（分站使用orders表）
    const isVipOrder = (out_trade_no as string).startsWith('VIP')
    
    let orders = await query<any[]>(
      isVipOrder 
        ? `SELECT * FROM vip_orders WHERE order_no = ?`
        : `SELECT * FROM orders WHERE order_number = ? AND product_type = 'coin_package'`,
      [out_trade_no as string]
    )
    
    // 如果是金币订单，适配字段名
    if (!isVipOrder && orders.length > 0) {
      orders[0].order_no = orders[0].order_number
    }

    if (orders.length === 0) {
      logger.error(`订单不存在: ${out_trade_no}`)
      res.send('订单不存在')
      return
    }

    const order = orders[0]

    // 如果订单已经支付，直接返回success
    if (order.status === 'paid') {
      logger.info(`订单 ${out_trade_no} 已处理过`)
      res.send('success')
      return
    }

    // 获取支付方式配置用于验证签名
    const paymentMethods = await query<any[]>(
      `SELECT id FROM payment_methods WHERE id = ?`,
      [order.payment_method_id]
    )

    if (paymentMethods.length === 0) {
      logger.error(`支付方式不存在: ${order.payment_method_id}`)
      res.send('支付方式不存在')
      return
    }

    const configs = await query<any[]>(
      `SELECT config_key, config_value FROM payment_configs WHERE payment_method_id = ?`,
      [order.payment_method_id]
    )

    const configMap: Record<string, string> = {}
    configs.forEach((config) => {
      configMap[config.config_key] = config.config_value
    })

    if (!configMap.epay_pid || !configMap.epay_key) {
      logger.error('支付方式配置不完整，无法验证签名')
      res.send('配置错误')
      return
    }

    // 验证商户ID
    if (configMap.epay_pid !== String(pid)) {
      logger.error(`商户ID不匹配: ${pid} != ${configMap.epay_pid}`)
      res.send('商户ID不匹配')
      return
    }

    // 验证签名
    const crypto = require('crypto')
    const signParams: Record<string, any> = {}
    for (const key in params) {
      const value = params[key]
      if (value !== '' && value !== null && value !== undefined && key !== 'sign' && key !== 'sign_type') {
        signParams[key] = String(value)
      }
    }

    const sortedKeys = Object.keys(signParams).sort()
    const signString = sortedKeys.map((key) => `${key}=${signParams[key]}`).join('&')
    const calculatedSign = crypto.createHash('md5').update(signString + configMap.epay_key).digest('hex')

    if (calculatedSign.toLowerCase() !== String(sign).toLowerCase()) {
      logger.error(`签名验证失败: 计算签名=${calculatedSign}, 接收签名=${sign}`)
      res.send('签名验证失败')
      return
    }

    // 验证金额
    const orderAmount = parseFloat(isVipOrder ? order.price : order.amount).toFixed(2)
    const notifyAmount = parseFloat(money as string).toFixed(2)
    if (orderAmount !== notifyAmount) {
      logger.error(`金额不匹配: 订单金额=${orderAmount}, 通知金额=${notifyAmount}`)
      res.send('金额不匹配')
      return
    }

    logger.info(`开始处理订单 ${out_trade_no} 的支付成功回调`)

    // 更新订单状态
    if (isVipOrder) {
      // 会员订单处理
      await query(
        `UPDATE vip_orders SET status = 'paid', paid_at = NOW() WHERE order_no = ?`,
        [out_trade_no as string]
      )
      
      // 开通会员
      if (order.package_id && order.pay_type !== 'coin') {
        const vipPackages = await query<any[]>(
          `SELECT * FROM vip_packages WHERE id = ?`,
          [order.package_id]
        )
        
        if (vipPackages.length > 0) {
          const packageInfo = vipPackages[0]
          const { setUserVip } = await import('../services/vipCoinService')
          await setUserVip(order.user_id, packageInfo.vip_level, parseInt(order.duration))
          
          logger.info(`订单 ${out_trade_no} 支付成功，为用户 ${order.user_id} 开通会员`)
        }
      }
    } else {
      // 金币充值订单处理（分站使用orders表，product_id字段存储package_id）
    let packageId = order.product_id || null
    if (!packageId && order.trade_no && order.trade_no.startsWith('PKG_')) {
      // 兼容旧格式（如果trade_no字段中有package_id）
      packageId = parseInt(order.trade_no.replace('PKG_', ''))
      logger.info(`从订单 ${out_trade_no} 提取套餐ID: ${packageId}`)
    }

    // 更新订单状态（分站使用orders表，trade_no字段在orders表中为trade_no）
    await query(
      `UPDATE orders SET status = 'paid', trade_no = ?, updated_at = NOW() WHERE order_number = ?`,
      [trade_no as string, out_trade_no as string]
    )

    if (packageId) {
      // 获取套餐信息
      const packages = await query<any[]>(
        `SELECT * FROM coin_packages WHERE id = ?`,
        [packageId]
      )

      if (packages.length > 0) {
        const packageInfo = packages[0]
        const totalCoins = parseFloat(packageInfo.coins) + parseFloat(packageInfo.bonus_coins || 0)
        
        // 充值金币
        const { rechargeCoin } = await import('../services/vipCoinService')
        await rechargeCoin(
          order.user_id,
          totalCoins,
          `充值订单: ${out_trade_no} (套餐: ${packageInfo.name})`
        )
        
        logger.info(`订单 ${out_trade_no} 支付成功，为用户 ${order.user_id} 充值 ${totalCoins} 金币`)
      } else {
        logger.error(`套餐不存在: ${packageId}`)
      }
    } else {
      logger.error(`订单 ${out_trade_no} 未关联套餐信息`)
      }
    }

    // 返回success表示接收成功
    res.send('success')
  } catch (err: any) {
    logger.error('处理支付回调失败:', err)
    // 即使出错也要返回success，避免支付平台重复通知
    res.send('success')
  }
}

