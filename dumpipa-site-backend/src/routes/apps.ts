/**
 * 应用相关路由（分站）
 */

import express from 'express'
import { authenticate } from '../middleware/auth'
import * as appController from '../controllers/appController'

const router = express.Router()

// 获取下载链接（需要认证和扣费验证）
router.get('/download-url', authenticate, appController.getDownloadUrl)

export default router

