import request from '@/utils/request'
import type { Task, ApiResponse, PaginationParams } from '@/types'

/**
 * 任务相关 API
 */

// 创建脱壳任务
export interface CreateTaskParams {
  bundle_id: string
  version: string  // ⚠️ 必须是 App Store 发行号（纯数字），不是显示版本号
  country?: string
  app_name?: string
  real_version?: string  // 显示版本号（可选，如 8.0.46）
  icon_url?: string
  device_id?: number  // 可选，建议不传，自动分配
  decrypt_mode?: string  // 砸壳模式：full（默认）或 binary
}

export const createTask = (data: CreateTaskParams) => {
  return request.post<ApiResponse<{ task_id: number }>>('/tasks', data)
}

// 查询任务状态
export const getTaskStatus = (id: number) => {
  return request.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`)
}

// 获取任务状态（用于轮询）- 兼容旧的getJobStatus调用
export const getJobStatus = (jobId: number) => {
  return request.get<ApiResponse<{ task: Task }>>(`/tasks/${jobId}`)
}

// 获取我的任务列表
export const getMyTasks = (params?: Partial<PaginationParams> & { include_done?: boolean }) => {
  return request.get<ApiResponse<{ tasks: Task[] }>>('/tasks/my', {
    params: { 
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      include_done: params?.include_done ?? true, // 默认显示所有任务（包括已完成和失败的）
    },
  })
}

// 获取全站任务列表
export const getAllTasks = (params?: Partial<PaginationParams> & { include_done?: boolean; only_mine?: boolean }) => {
  return request.get<ApiResponse<{ tasks: Task[] }>>('/tasks', {
    params: { 
      page: params?.page || 1,
      page_size: params?.page_size || 20,
      include_done: params?.include_done ?? true,
      only_mine: params?.only_mine ?? false,
    },
  })
}

// 重试任务
export const retryTask = (jobId: number) => {
  return request.post<ApiResponse>(`/tasks/${jobId}/retry`)
}

// 获取上传进度
export const getUploadProgress = (jobId: number) => {
  return request.get<ApiResponse<{ progress: any }>>(`/tasks/${jobId}/upload-progress`)
}

// 获取任务详情
export const getTaskDetail = (id: number) => {
  return request({
    url: `/tasks/${id}`,
    method: 'get',
  })
}

// 取消任务
export const cancelTask = (id: number) => {
  return request({
    url: `/tasks/${id}/cancel`,
    method: 'post',
  })
}

// 管理员：取消任务
export const adminCancelTask = (id: number) => {
  return request({
    url: `/admin/tasks/${id}/cancel`,
    method: 'post',
  })
}

// 管理员：删除任务
export const adminDeleteTask = (id: number) => {
  return request({
    url: `/admin/tasks/${id}`,
    method: 'delete',
  })
}

// 自动脱壳任务（使用Node后端API）
// ⭐ 注意：device_id 不再需要传递，后端会自动分配可用设备
// ⚠️ 注意：size_mb 不能由用户填写传递，后端会自动从缓存或 Apple API 获取
// ⚠️ 注意：version 必须是 App Store 发行号（纯数字），不是显示版本号
export interface AutoDumpParams {
  bundle_id: string
  version: string  // ⚠️ 必须是 App Store 发行号（纯数字）
  app_name?: string  // 应用名称（可选，不传则自动获取）
  real_version?: string  // 显示版本号（可选，如 8.0.46）
  country?: string
  icon_url?: string  // 应用图标URL（可选，不传则自动获取）
  device_id?: number  // 可选，建议不传，自动分配
  decrypt_mode?: string  // 砸壳模式：full（默认）或 binary
  // ⚠️ size_mb 已移除：不能由用户填写传递，后端会自动从缓存或 Apple API 获取
}

export const autoDumpWithCheck = (data: AutoDumpParams) => {
  const requestData: any = {
    bundle_id: data.bundle_id,
    version: data.version,  // ⚠️ 必须传递 App Store 发行号
    country: data.country || 'cn',
  }
  
  // 可选参数：只有提供时才传递
  if (data.app_name) requestData.app_name = data.app_name
  if (data.real_version) requestData.real_version = data.real_version
  if (data.icon_url) requestData.icon_url = data.icon_url
  if (data.device_id) requestData.device_id = data.device_id
  if (data.decrypt_mode) requestData.decrypt_mode = data.decrypt_mode
  
  // ⚠️ size_mb 不再传递，后端会自动从缓存或 Apple API 获取
  // ⚠️ app_name, icon_url 不传时，系统会自动从缓存获取
  
  return request.post<ApiResponse<{ task_id: number }>>('/tasks', requestData)
}

