/**
 * 订单相关API
 */

import request from '../utils/request'

/**
 * 创建金币充值订单
 */
export function createCoinOrder(data: { package_id: number }) {
  return request({
    url: '/orders/coin/create',
    method: 'post',
    data,
  })
}

/**
 * 创建支付请求
 */
export function createPayment(data: { order_no: string; payment_method_id?: number }) {
  return request({
    url: '/orders/payment/create',
    method: 'post',
    data,
  })
}

/**
 * 查询订单状态
 */
export function getOrderStatus(order_no: string) {
  return request({
    url: '/orders/status',
    method: 'get',
    params: { order_no },
  })
}

/**
 * 获取用户购买记录
 */
export function getMyOrders(page: number = 1, pageSize: number = 20) {
  return request({
    url: '/orders/my',
    method: 'get',
    params: { page, page_size: pageSize },
  })
}

