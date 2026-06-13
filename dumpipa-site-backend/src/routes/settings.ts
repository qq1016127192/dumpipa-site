/**
 * 设置路由
 */

import express from 'express'
import * as settingsController from '../controllers/settingsController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = express.Router()

// 公开接口（不需要认证）
router.get('/available-countries', settingsController.getAvailableCountries)
router.get('/seo/public', settingsController.getSeoSettings)

// 系统设置接口（需要管理员权限）
router.use(authenticate, requireAdmin)
router.get('/', settingsController.getSettings)
router.put('/:type', settingsController.updateSettings)

export default router
