import request from '@/utils/request'
import type { ApiResponse } from '@/types'

/**
 * 反馈相关 API
 */

export interface CreateFeedbackParams {
  bundle_id: string
  country?: string
  app_name?: string
  type?: string
  content?: string
}

// 检查反馈状态
export const checkFeedbackStatus = (bundle_id: string, country?: string) => {
  return request.get<ApiResponse<{ has_feedback: boolean; feedback?: any }>>('/feedback/check', {
    params: {
      bundle_id,
      country: country || 'cn',
    },
  })
}

export const createFeedback = (data: CreateFeedbackParams) => {
  return request.post<ApiResponse<{ feedback_id: number }>>('/feedback', data)
}

// 获取我的反馈列表
export const getMyFeedbacks = (params?: { page?: number; page_size?: number }) => {
  return request.get<ApiResponse<{ feedbacks: any[] }>>('/feedback/my', {
    params: {
      page: params?.page || 1,
      page_size: params?.page_size || 10,
    },
  })
}

