import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/admin/dashboard',
    method: 'get',
  })
}

/**
 * 获取所有任务(管理员)
 */
export function getAllTasks(params: {
  page: number
  page_size: number
  status?: string
  keyword?: string
  include_done?: boolean
}) {
  return request({
    url: '/admin/tasks',
    method: 'get',
    params,
  })
}

