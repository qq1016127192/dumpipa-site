/**
 * 解密任务 API
 */

import request from '@/utils/request'

export interface CreateTaskParams {
  bundleId: string
  appName: string
  appVersion: string
  country?: string
  priority?: number
}

export interface Task {
  id: number
  taskId: string
  bundleId: string
  appName: string
  appVersion: string
  country: string
  status: 'pending' | 'queued' | 'processing' | 'downloading' | 'uploading' | 'done' | 'failed' | 'cancelled'
  priority: number
  progress: number
  retryCount?: number
  error?: string
  ipaPath?: string
  fileSize?: number
  downloadUrl?: string
  executionTime?: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  updatedAt?: string
}

/**
 * 创建解密任务
 */
export function createDecryptTask(data: CreateTaskParams) {
  return request.post('/decrypt/tasks', data)
}

/**
 * 获取任务状态
 */
export function getTaskStatus(id: string | number) {
  return request.get(`/decrypt/tasks/${id}`)
}

/**
 * 获取任务列表
 */
export function getTaskList(params?: {
  status?: string
  page?: number
  pageSize?: number
}) {
  return request.get('/decrypt/tasks', { params })
}

/**
 * 取消任务
 */
export function cancelTask(id: string | number) {
  return request.delete(`/decrypt/tasks/${id}`)
}

/**
 * 重试任务
 */
export function retryTask(id: string | number) {
  return request.post(`/decrypt/tasks/${id}/retry`)
}

/**
 * 获取队列状态
 */
export function getQueueStatus() {
  return request.get('/decrypt/queue/status')
}

