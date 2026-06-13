/**
 * 用户路由（分站独立数据库）
 */

import express from 'express'
import * as userController from '../controllers/userController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = express.Router()

// 获取用户列表（需要管理员权限）
router.get('/', authenticate, requireAdmin, userController.getUserList)

// 获取用户信息（需要认证）
router.get('/:id', authenticate, userController.getUserInfo)

// 创建用户（需要管理员权限）
router.post('/', authenticate, requireAdmin, userController.createUser)

// 更新用户（需要管理员权限）
router.put('/:id', authenticate, requireAdmin, userController.updateUser)

// 删除用户（需要管理员权限）
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser)

export default router
