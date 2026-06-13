/**
 * 支付设置路由
 */

import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import * as paymentController from '../controllers/paymentController'

const router = Router()

// 获取支付方式列表
router.get('/methods', authenticate, paymentController.getPaymentMethods)

// 获取支付统计
router.get('/stats', authenticate, paymentController.getPaymentStats)

// 添加支付方式
router.post('/methods', authenticate, paymentController.addPaymentMethod)

// 更新支付方式
router.put('/methods/:id', authenticate, paymentController.updatePaymentMethod)

// 删除支付方式
router.delete('/methods/:id', authenticate, paymentController.deletePaymentMethod)

// 更新支付配置
router.put('/configs/:payment_method_id', authenticate, paymentController.updatePaymentConfig)

// 支付回调通知（不需要认证，由支付平台调用）
router.all('/notify', paymentController.handlePaymentNotify)

export default router

