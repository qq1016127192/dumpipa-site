/**
 * 订单控制器
 */

import { Request, Response } from 'express'
import { query } from '../config/database'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import crypto from 'crypto'

/**
 * 创建金币充值订单
 */
export async function createCoinOrder(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const { package_id } = req.body

    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    if (!package_id) {
      error(res, '请选择充值套餐', 400)
      return
    }

    // 获取套餐信息
    const packages = await query<any[]>(
      `SELECT * FROM coin_packages WHERE id = ? AND is_active = 1`,
      [package_id]
    )

    if (packages.length === 0) {
      error(res, '套餐不存在或已下架', 404)
      return
    }

    const packageInfo = packages[0]
    const totalCoins = parseFloat(packageInfo.coins) + parseFloat(packageInfo.bonus_coins || 0)

    // 生成订单号
    const orderNo = `COIN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 获取一个默认的支付方式（用于创建订单，实际支付方式在创建支付时确定）
    const defaultPaymentMethods = await query<any[]>(
      `SELECT id FROM payment_methods WHERE status = 1 ORDER BY sort_order ASC, id ASC LIMIT 1`
    )
    
    let defaultPaymentMethodId = 0
    if (defaultPaymentMethods.length > 0) {
      defaultPaymentMethodId = defaultPaymentMethods[0].id
    } else {
      // 如果没有启用的支付方式，使用第一个支付方式（即使已禁用）
      const anyPaymentMethods = await query<any[]>(
        `SELECT id FROM payment_methods ORDER BY sort_order ASC, id ASC LIMIT 1`
      )
      if (anyPaymentMethods.length > 0) {
        defaultPaymentMethodId = anyPaymentMethods[0].id
      } else {
        error(res, '系统暂无可用的支付方式，请联系管理员', 400)
        return
      }
    }

    // 创建订单（分站使用orders表，product_type='coin_package'）
    const result = await query<any[]>(
      `INSERT INTO orders (user_id, order_number, product_type, product_id, amount, payment_method_id, status)
       VALUES (?, ?, 'coin_package', ?, ?, ?, 'pending')`,
      [userId, orderNo, package_id, packageInfo.price, defaultPaymentMethodId]
    )

    const orderId = (result as any).insertId

    success(res, {
      order_id: orderId,
      order_no: orderNo,
      amount: packageInfo.price,
      coins: totalCoins,
      package_name: packageInfo.name,
    })
  } catch (err) {
    logger.error('创建订单失败:', err)
    error(res, '创建订单失败', 500)
  }
}

/**
 * 创建支付请求（调用易支付）
 */
export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const { order_no, payment_method_id } = req.body

    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    if (!order_no) {
      error(res, '订单号不能为空', 400)
      return
    }

    // 获取订单信息，支持金币充值和会员订单（分站使用orders表和vip_orders表）
    let orders = await query<any[]>(
      `SELECT * FROM orders WHERE order_number = ? AND user_id = ? AND product_type = 'coin_package'`,
      [order_no, userId]
    )

    let order = null
    let orderType = 'coin' // 订单类型：coin 或 vip

    if (orders.length === 0) {
      // 如果不是金币充值订单，尝试查找会员订单
      const vipOrders = await query<any[]>(
        `SELECT * FROM vip_orders WHERE order_no = ? AND user_id = ?`,
        [order_no, userId]
      )
      
      if (vipOrders.length === 0) {
      error(res, '订单不存在', 404)
      return
    }

      orderType = 'vip'
      order = vipOrders[0]
    } else {
      order = orders[0]
      // 适配字段名（orders表使用order_number，而vip_orders使用order_no）
      order.order_no = order.order_number
      order.amount = order.amount || order.amount
    }

    if (order.status !== 'pending') {
      error(res, '订单状态异常', 400)
      return
    }

    // 获取支付方式配置
    let paymentMethodId = payment_method_id
    if (!paymentMethodId) {
      // 获取第一个启用的支付方式
      const methods = await query<any[]>(
        `SELECT id FROM payment_methods WHERE status = 1 ORDER BY sort_order ASC LIMIT 1`
      )
      if (methods.length > 0) {
        paymentMethodId = methods[0].id
      }
    }

    if (!paymentMethodId) {
      error(res, '暂无可用的支付方式', 400)
      return
    }

    // 获取支付方式信息
    const paymentMethods = await query<any[]>(
      `SELECT * FROM payment_methods WHERE id = ?`,
      [paymentMethodId]
    )

    if (paymentMethods.length === 0) {
      error(res, '支付方式不存在', 404)
      return
    }

    const paymentMethod = paymentMethods[0]

    // 获取支付配置
    const configs = await query<any[]>(
      `SELECT config_key, config_value FROM payment_configs WHERE payment_method_id = ?`,
      [paymentMethodId]
    )

    const configMap: Record<string, string> = {}
    configs.forEach((config) => {
      configMap[config.config_key] = config.config_value
    })

    if (!configMap.epay_url || !configMap.epay_pid || !configMap.epay_key) {
      error(res, '支付方式配置不完整', 400)
      return
    }

    // 更新订单支付方式
    if (orderType === 'vip') {
      await query(
        `UPDATE vip_orders SET payment_method_id = ? WHERE order_no = ?`,
        [paymentMethodId, order_no]
      )
    } else {
    await query(
      `UPDATE orders SET payment_method_id = ? WHERE order_number = ?`,
      [paymentMethodId, order_no]
    )
    }

    // 根据支付方式code确定支付类型
    let payType = 'alipay'
    if (paymentMethod.code === 'wechat' || paymentMethod.code === 'wxpay') {
      payType = 'wxpay'
    } else if (paymentMethod.code === 'alipay') {
      payType = 'alipay'
    }

    // 获取用户IP
    const clientip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''

    // 构建易支付请求参数（空值不参与签名）
    const params: Record<string, any> = {
      pid: configMap.epay_pid,
      type: payType,
      out_trade_no: order_no,
      notify_url: `${req.protocol}://${req.get('host')}/api/payment/notify`,
      return_url: `${req.protocol}://${req.get('host')}/payment/success`,
      name: orderType === 'vip' ? '会员开通' : '金币充值',
      money: parseFloat(order.amount || order.price).toFixed(2),
    }

    // 添加可选参数（如果配置中有）
    if (clientip) {
      params.clientip = Array.isArray(clientip) ? clientip[0] : clientip.split(',')[0].trim()
    }
    if (configMap.device) {
      params.device = configMap.device
    } else {
      params.device = 'pc' // 默认为pc
    }
    if (configMap.param) {
      params.param = configMap.param
    }
    if (configMap.channel_id) {
      params.channel_id = configMap.channel_id
    }

    // 生成签名（按照易支付文档的签名算法）
    // 1. 过滤空值和签名参数
    const signParams: Record<string, any> = {}
    for (const key in params) {
      const value = params[key]
      if (value !== '' && value !== null && value !== undefined && key !== 'sign' && key !== 'sign_type') {
        signParams[key] = String(value)
      }
    }

    // 2. 按照参数名ASCII码从小到大排序
    const sortedKeys = Object.keys(signParams).sort()

    // 3. 拼接成URL键值对格式
    const signString = sortedKeys.map((key) => `${key}=${signParams[key]}`).join('&')

    // 4. 拼接商户密钥并进行MD5加密（结果为小写）
    const sign = crypto.createHash('md5').update(signString + configMap.epay_key).digest('hex')
    
    params.sign = sign
    params.sign_type = 'MD5'

    // 构建API地址（确保格式正确）
    let apiUrl = configMap.epay_url
    if (!apiUrl.endsWith('/xpay/epay/mapi.php') && !apiUrl.endsWith('mapi.php')) {
      // 如果配置的URL不是完整路径，则拼接
      apiUrl = apiUrl.replace(/\/$/, '') + '/xpay/epay/mapi.php'
    }

    // 调用易支付接口
    try {
      const axios = require('axios')
      
      // 使用URLSearchParams构建表单数据
      const formData = new URLSearchParams()
      for (const key in params) {
        if (params[key] !== null && params[key] !== undefined) {
          formData.append(key, String(params[key]))
        }
      }

      const response = await axios.post(apiUrl, formData.toString(), {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      })

      // 处理响应（可能是JSON字符串或对象）
      let responseData = response.data
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData)
        } catch (e) {
          logger.error('支付接口返回格式错误:', responseData)
          error(res, '支付接口返回格式异常', 500)
          return
        }
      }

      // 处理返回结果
      if (responseData.code === 1) {
        // 成功，返回支付URL、二维码或小程序跳转URL
        // 注意：payurl、qrcode、urlscheme三个参数只会返回其中一个
        success(res, {
          pay_url: responseData.payurl || '',
          qrcode: responseData.qrcode || '',
          urlscheme: responseData.urlscheme || '', // 小程序跳转URL
          trade_no: responseData.trade_no || '',
          money: responseData.money || (order.amount || order.price),
        })
      } else {
        error(res, responseData.msg || '创建支付失败', 400)
      }
    } catch (err: any) {
      logger.error('调用支付接口失败:', err)
      if (err.response) {
        logger.error('支付接口响应:', err.response.data)
      }
      error(res, err.message || '调用支付接口失败', 500)
    }
  } catch (err) {
    logger.error('创建支付失败:', err)
    error(res, '创建支付失败', 500)
  }
}

/**
 * 查询订单状态
 */
export async function getOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const { order_no } = req.query

    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    if (!order_no) {
      error(res, '订单号不能为空', 400)
      return
    }

    // 先尝试查找金币充值订单（分站使用orders表）
    let orders = await query<any[]>(
      `SELECT * FROM orders WHERE order_number = ? AND user_id = ? AND product_type = 'coin_package'`,
      [order_no, userId]
    )

    let order = null
    if (orders.length === 0) {
      // 如果不是金币充值订单，尝试查找会员订单
      const vipOrders = await query<any[]>(
        `SELECT * FROM vip_orders WHERE order_no = ? AND user_id = ?`,
        [order_no, userId]
      )
      
      if (vipOrders.length === 0) {
      error(res, '订单不存在', 404)
      return
    }

      order = vipOrders[0]
    } else {
      order = orders[0]
      // 适配字段名
      order.order_no = order.order_number
      order.amount = order.amount || order.amount
    }

    success(res, {
      order_no: order.order_no,
      status: order.status,
      amount: order.amount || order.price,
      paid_at: order.paid_at,
    })
  } catch (err) {
    logger.error('查询订单状态失败:', err)
    error(res, '查询订单状态失败', 500)
  }
}

/**
 * 获取用户购买记录
 */
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.userId
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.page_size as string) || 20
    const offset = (page - 1) * pageSize

    if (!userId) {
      error(res, '未登录', 401)
      return
    }

    // 分站使用orders表，product_type='coin_package'表示金币充值订单
    const orders = await query<any[]>(
      `SELECT o.*, 
       o.product_id as package_id
       FROM orders o
       WHERE o.user_id = ? AND o.product_type = 'coin_package'
       ORDER BY o.created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      [userId]
    )

    // 适配字段名
    for (const order of orders) {
      order.order_no = order.order_number
    }

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

    const totalResult = await query<any[]>(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = ? AND product_type = 'coin_package'`,
      [userId]
    )
    const total = totalResult[0]?.total || 0

    success(res, {
      orders,
      page,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize),
    })
  } catch (err) {
    logger.error('获取购买记录失败:', err)
    error(res, '获取购买记录失败', 500)
  }
}

