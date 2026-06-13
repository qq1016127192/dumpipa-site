import request from '@/utils/request'
import type { User, ApiResponse } from '@/types'

/**
 * 认证相关 API
 */

// 登录
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

export const login = (data: LoginParams) => {
  return request.post<ApiResponse<{ user: User; token?: string }>>('/auth/login', data)
}

// 注册
export interface RegisterParams {
  username: string
  password: string
  email?: string
}

export const register = (data: RegisterParams) => {
  return request.post<ApiResponse>('/auth/register', data)
}

// 登出
export const logout = () => {
  return request.post<ApiResponse>('/auth/logout')
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<ApiResponse<{ user: User }>>('/auth/me')
}

// 更新用户信息
export const updateUser = (data: Partial<User>) => {
  return request.put<ApiResponse>('/user/update', data)
}

