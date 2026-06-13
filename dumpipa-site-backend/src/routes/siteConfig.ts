import express from 'express'
import * as siteConfigController from '../controllers/siteConfigController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = express.Router()

// 所有路由都需要管理员权限
router.use(authenticate, requireAdmin)

// 获取分站配置
router.get('/', siteConfigController.getSiteConfig)

// 更新分站配置
router.put('/', siteConfigController.updateSiteConfig)

// 获取主站Token
router.get('/main-site-token', siteConfigController.getMainSiteToken)

// 更新主站Token
router.put('/main-site-token', siteConfigController.updateMainSiteToken)

// 测试主站连接
router.get('/test-connection', siteConfigController.testMainSiteConnection)

export default router

