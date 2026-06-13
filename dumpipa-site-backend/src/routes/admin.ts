/**
 * 管理后台路由（分站）
 */

import express from 'express'
import * as adminController from '../controllers/adminController'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = express.Router()

// 管理后台路由
router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboardStats)
// 任务列表：分站管理员可以通过分站token获取主站任务，但需要分站管理员登录才能访问管理页面
router.get('/tasks', authenticate, requireAdmin, adminController.getAllTasks)

// 任务操作（需要认证，但权限检查在控制器和主站API中进行：管理员可操作所有任务，普通用户只能操作自己的任务）
router.post('/tasks/:id/cancel', authenticate, adminController.cancelTask)
router.delete('/tasks/:id', authenticate, adminController.deleteTask)

export default router

