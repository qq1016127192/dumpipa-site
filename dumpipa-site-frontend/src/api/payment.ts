/**
 * 支付设置API
 */

import request from '../utils/request'

/**
 * 获取所有支付方式
 */
export function getPaymentMethods() {
  return request({
    url: '/payment/methods',
    method: 'get',
  })
}

/**
 * 获取支付统计信息
 */
export function getPaymentStats() {
  return request({
    url: '/payment/stats',
    method: 'get',
  })
}

/**
 * 添加支付方式
 */
export function addPaymentMethod(data: {
  name: string
  code: string
  description?: string
  status?: boolean
  sort_order?: number
}) {
  return request({
    url: '/payment/methods',
    method: 'post',
    data,
  })
}

/**
 * 更新支付方式
 */
export function updatePaymentMethod(id: number, data: {
  name: string
  description?: string
  status?: boolean
  sort_order?: number
}) {
  return request({
    url: `/payment/methods/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除支付方式
 */
export function deletePaymentMethod(id: number) {
  return request({
    url: `/payment/methods/${id}`,
    method: 'delete',
  })
}

/**
 * 更新支付配置
 */
export function updatePaymentConfig(paymentMethodId: number, configs: Record<string, any>) {
  return request({
    url: `/payment/configs/${paymentMethodId}`,
    method: 'put',
    data: { configs },
  })
}

