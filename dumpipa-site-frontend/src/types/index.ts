// 用户类型
export interface User {
  id: number
  username: string
  email?: string
  avatar?: string
  role?: 'user' | 'admin'
  is_admin?: number | boolean  // 数据库中的管理员字段
}

// 应用信息类型
export interface AppInfo {
  id?: number
  bundle_id: string
  app_name: string
  icon_url: string
  version: string
  real_version?: string
  size?: string
  file_size?: string
  country: string
  release_date?: string
  category?: string
}

// 任务状态类型
export type TaskStatus = 'queued' | 'running' | 'uploading' | 'done' | 'error' | 'cancelled'

// 任务类型
export interface Task {
  id: number
  bundle_id: string
  app_name: string
  icon_url?: string
  country: string
  status: TaskStatus
  progress: number
  version: string
  real_version?: string
  size?: string
  result_path?: string
  alist_url?: string
  alist_path?: string
  upload_time?: string
  created_at: string
  updated_at?: string
  log?: string
  user_id?: number
  error_message?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  ok: 0 | 1
  msg?: string
  error?: string
  data?: T
  [key: string]: any
}

// 应用版本类型
export interface AppVersion {
  id: number
  bundle_id: string
  version: string
  file_size?: string
  upload_time?: string
  created_at: string
}

// 分页参数
export interface PaginationParams {
  page: number
  page_size: number
}

// 分页响应
export interface PaginatedResponse<T> {
  ok: 1
  data: T[]
  total: number
  page: number
  page_size: number
}

// 设备信息
export interface Device {
  id: number
  device_name: string
  device_ip: string
  status: 'online' | 'offline' | 'busy'
  last_seen?: string
}

// Alist 配置
export interface AlistConfig {
  url: string
  username: string
  password: string
  base_path: string
}

