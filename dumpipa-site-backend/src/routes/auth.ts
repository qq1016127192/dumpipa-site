import express from 'express'
import * as authController from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// 公开路由
router.post('/register', authController.register)
router.post('/login', authController.login)

// 需要认证的路由
router.get('/me', authenticate, authController.getCurrentUser)
router.post('/logout', authenticate, authController.logout)

export default router

