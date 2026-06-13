import request from '@/utils/request'

/**
 * 获取系统设置
 */
export function getSettings() {
  return request({
    url: '/settings',
    method: 'get',
  })
}

/**
 * 更新设置
 */
export function updateSettings(type: string, data: any) {
  return request({
    url: `/settings/${type}`,
    method: 'put',
    data,
  })
}

/**
 * 测试 Alist 连接
 */
export function testAlist(data: any) {
  return request({
    url: '/settings/alist/test',
    method: 'post',
    data,
  })
}

/**
 * 获取 Apple 账号列表
 */
export function getAppleAccounts() {
  return request({
    url: '/settings/apple-accounts',
    method: 'get',
  })
}

/**
 * 添加 Apple 账号
 */
export function addAppleAccount(data: any) {
  return request({
    url: '/settings/apple-accounts',
    method: 'post',
    data,
  })
}

/**
 * 更新 Apple 账号
 */
export function updateAppleAccount(id: number, data: any) {
  return request({
    url: `/settings/apple-accounts/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除 Apple 账号
 */
export function deleteAppleAccount(id: number) {
  return request({
    url: `/settings/apple-accounts/${id}`,
    method: 'delete',
  })
}

/**
 * 获取已配置的地区列表（公开接口）
 */
export function getAvailableCountries() {
  return request({
    url: '/settings/available-countries',
    method: 'get',
  })
}

/**
 * 获取全局SEO设置（公开接口，前端用）
 */
export function getSeoSettings() {
  return request({
    url: '/settings/seo/public',
    method: 'get',
  })
}

/**
 * 验证 Apple ID 登录（使用 ipatool）
 */
export function verifyAppleId(data: {
  email: string
  password: string
  country: string
  auth_code?: string
}) {
  return request({
    url: '/settings/apple-accounts/verify',
    method: 'post',
    data,
  })
}

