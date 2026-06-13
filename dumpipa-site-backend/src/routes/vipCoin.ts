/**
 * 会员和金币系统路由
 */

import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth'
import * as vipCoinController from '../controllers/vipCoinController'

const router = Router()

// 系统配置（需要管理员权限）
router.get('/config', authenticate, vipCoinController.getSystemConfig)
router.put('/config', authenticate, requireAdmin, vipCoinController.updateSystemConfig)

// 会员套餐管理
router.get('/vip-packages', vipCoinController.getVipPackages)
router.post('/vip-packages', authenticate, requireAdmin, vipCoinController.createVipPackage)
router.put('/vip-packages/:id', authenticate, requireAdmin, vipCoinController.updateVipPackage)
router.delete('/vip-packages/:id', authenticate, requireAdmin, vipCoinController.deleteVipPackage)

// 金币套餐管理
router.get('/coin-packages', vipCoinController.getCoinPackages)
router.post('/coin-packages', authenticate, requireAdmin, vipCoinController.createCoinPackage)
router.put('/coin-packages/:id', authenticate, requireAdmin, vipCoinController.updateCoinPackage)
router.delete('/coin-packages/:id', authenticate, requireAdmin, vipCoinController.deleteCoinPackage)

// 金币交易记录
router.get('/coin-transactions/:user_id', authenticate, vipCoinController.getUserCoinTransactions)
router.get('/coin-transactions', authenticate, requireAdmin, vipCoinController.getAllCoinTransactions)
router.post('/coin-recharge', authenticate, requireAdmin, vipCoinController.rechargeCoin)

// 金币充值订单管理
router.get('/coin-orders', authenticate, requireAdmin, vipCoinController.getAllCoinOrders)

// 每日使用统计
router.get('/daily-usage/:user_id', authenticate, vipCoinController.getDailyUsage)

// 会员订单
router.get('/vip-orders', authenticate, requireAdmin, vipCoinController.getVipOrders)
router.post('/vip-orders', authenticate, vipCoinController.createVipOrder)
router.post('/set-user-vip', authenticate, requireAdmin, vipCoinController.setUserVip)

// 统计数据
router.get('/stats', authenticate, requireAdmin, vipCoinController.getVipCoinStats)

// 执行扣费
router.post('/perform-action', authenticate, vipCoinController.performActionDeduct)

// 大小范围配置（需要管理员权限）
router.get('/size-configs', authenticate, vipCoinController.getSizeConfigs)
router.put('/size-configs', authenticate, requireAdmin, vipCoinController.updateSizeConfigs)
router.get('/calculate-coin', vipCoinController.calculateCoinBySize)

export default router
