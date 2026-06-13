/**
 * 用户相关 API
 */

import request from '../utils/request'

/**
 * 获取用户列表
 */
export function getUserList(params: any) {
  return request({
    url: '/users',
    method: 'get',
    params,
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo(userId: number) {
  return request({
    url: `/users/${userId}`,
    method: 'get',
  })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(userId: number, data: any) {
  return request({
    url: `/users/${userId}`,
    method: 'put',
    data,
  })
}

