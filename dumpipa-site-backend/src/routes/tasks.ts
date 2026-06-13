/**
 * 任务路由（分站）
 * 所有任务操作都通过主站API代理
 */

import express from 'express'
import * as taskController from '../controllers/taskController'
import { authenticate, optionalAuth } from '../middleware/auth'

const router = express.Router()

// 公开路由 - 获取全站任务（通过主站API）
router.get('/', taskController.getAllTasks)

// 我的任务路由（可选认证，允许未登录用户查看空列表）
router.get('/my', optionalAuth, taskController.getMyTasks)

// 创建任务（需要认证和扣费验证）
router.post('/', authenticate, taskController.createTask)

// 参数路由（必须放在最后，更具体的路由在前）
router.get('/:id/status', taskController.getTaskDetail) // 查询任务状态（与详情相同）
router.get('/:id', taskController.getTaskDetail) // 查询任务详情
router.post('/:id/cancel', authenticate, taskController.cancelTask)
router.post('/:id/retry', authenticate, taskController.retryTask)

export default router

