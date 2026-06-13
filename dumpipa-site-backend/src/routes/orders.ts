/**
 * 订单路由
 */

import express from 'express'
import * as orderController from '../controllers/orderController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// 创建金币充值订单
router.post('/coin/create', authenticate, orderController.createCoinOrder)

// 创建支付请求
router.post('/payment/create', authenticate, orderController.createPayment)

// 查询订单状态
router.get('/status', authenticate, orderController.getOrderStatus)

// 获取用户购买记录
router.get('/my', authenticate, orderController.getMyOrders)

export default router

