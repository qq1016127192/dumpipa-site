/**
 * 分站配置API
 */

import request from '@/utils/request'

/**
 * 获取主站Token
 */
export function getMainSiteToken() {
  return request.get('/site-config/main-site-token')
}

/**
 * 更新主站Token
 */
export function updateMainSiteToken(token: string) {
  return request.put('/site-config/main-site-token', { token })
}

/**
 * 测试主站连接
 */
export function testMainSiteConnection() {
  return request.get('/site-config/test-connection')
}

/**
 * 获取分站配置
 */
export function getSiteConfig(key?: string) {
  return request.get('/site-config', {
    params: key ? { key } : {},
  })
}

/**
 * 更新分站配置
 */
export function updateSiteConfig(key: string, value: string, description?: string) {
  return request.put('/site-config', {
    key,
    value,
    description,
  })
}

