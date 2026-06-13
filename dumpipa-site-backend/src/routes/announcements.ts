import express from 'express'
import * as announcementController from '../controllers/announcementController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = express.Router()

// 公开路由：获取有效公告
router.get('/', announcementController.getAnnouncements)

// 管理路由：需要认证和管理员权限
router.get('/admin/all', authenticate, requireAdmin, announcementController.getAllAnnouncements)
router.get('/admin/:id', authenticate, requireAdmin, announcementController.getAnnouncementDetail)
router.post('/admin', authenticate, requireAdmin, announcementController.createAnnouncement)
router.put('/admin/:id', authenticate, requireAdmin, announcementController.updateAnnouncement)
router.delete('/admin/:id', authenticate, requireAdmin, announcementController.deleteAnnouncement)

export default router

