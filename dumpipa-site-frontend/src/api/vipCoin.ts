/**
 * 会员和金币系统 API
 */

import request from '../utils/request'

/**
 * 获取系统配置
 */
export function getSystemConfig() {
  return request({
    url: '/vip-coin/config',
    method: 'get',
  })
}

/**
 * 更新系统配置
 */
export function updateSystemConfig(configs: Array<{key: string, value: string}>) {
  return request({
    url: '/vip-coin/config',
    method: 'put',
    data: { configs },
  })
}

/**
 * 获取会员套餐列表
 */
export function getVipPackages(includeInactive: boolean = false) {
  return request({
    url: '/vip-coin/vip-packages',
    method: 'get',
    params: { include_inactive: includeInactive },
  })
}

/**
 * 创建会员套餐
 */
export function createVipPackage(data: any) {
  return request({
    url: '/vip-coin/vip-packages',
    method: 'post',
    data,
  })
}

/**
 * 更新会员套餐
 */
export function updateVipPackage(id: number, data: any) {
  return request({
    url: `/vip-coin/vip-packages/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除会员套餐
 */
export function deleteVipPackage(id: number) {
  return request({
    url: `/vip-coin/vip-packages/${id}`,
    method: 'delete',
  })
}

/**
 * 获取金币套餐列表
 */
export function getCoinPackages(includeInactive: boolean = false) {
  return request({
    url: '/vip-coin/coin-packages',
    method: 'get',
    params: { include_inactive: includeInactive },
  })
}

/**
 * 创建金币套餐
 */
export function createCoinPackage(data: any) {
  return request({
    url: '/vip-coin/coin-packages',
    method: 'post',
    data,
  })
}

/**
 * 更新金币套餐
 */
export function updateCoinPackage(id: number, data: any) {
  return request({
    url: `/vip-coin/coin-packages/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除金币套餐
 */
export function deleteCoinPackage(id: number) {
  return request({
    url: `/vip-coin/coin-packages/${id}`,
    method: 'delete',
  })
}

/**
 * 获取用户金币交易记录
 */
export function getUserCoinTransactions(userId: number, page: number = 1, pageSize: number = 20) {
  return request({
    url: `/vip-coin/coin-transactions/${userId}`,
    method: 'get',
    params: { page, page_size: pageSize },
  })
}

/**
 * 获取所有金币交易记录（管理员）
 */
export function getAllCoinTransactions(params: {
  page?: number
  page_size?: number
  user_id?: number
  type?: string
  start_date?: string
  end_date?: string
}) {
  return request({
    url: '/vip-coin/coin-transactions',
    method: 'get',
    params,
  })
}

/**
 * 获取所有金币充值订单（管理员）
 */
export function getAllCoinOrders(params: {
  page?: number
  page_size?: number
  user_id?: number
  status?: string
  start_date?: string
  end_date?: string
}) {
  return request({
    url: '/vip-coin/coin-orders',
    method: 'get',
    params,
  })
}

/**
 * 给用户充值金币（管理员操作）
 */
export function rechargeCoin(data: { user_id: number, amount: number, reason?: string }) {
  return request({
    url: '/vip-coin/coin-recharge',
    method: 'post',
    data,
  })
}

/**
 * 获取用户每日使用统计
 */
export function getDailyUsage(userId: number, date?: string) {
  return request({
    url: `/vip-coin/daily-usage/${userId}`,
    method: 'get',
    params: { date },
  })
}

/**
 * 获取会员订单列表
 */
export function getVipOrders(params: {
  page?: number
  page_size?: number
  status?: string
  user_id?: number
}) {
  return request({
    url: '/vip-coin/vip-orders',
    method: 'get',
    params,
  })
}

/**
 * 创建会员订单
 */
export function createVipOrder(data: { package_id: number, pay_type?: string }) {
  return request({
    url: '/vip-coin/vip-orders',
    method: 'post',
    data,
  })
}

/**
 * 手动设置用户会员（管理员操作）
 */
export function setUserVip(data: { user_id: number, vip_level: number, duration_days: number }) {
  return request({
    url: '/vip-coin/set-user-vip',
    method: 'post',
    data,
  })
}

/**
 * 获取会员和金币统计数据
 */
export function getVipCoinStats() {
  return request({
    url: '/vip-coin/stats',
    method: 'get',
  })
}

/**
 * 执行下载或砸壳扣费
 * ⭐ 注意：device_id 不再需要传递，后端会自动分配可用设备
 */
export function performActionDeduct(data: {
  action: 'download' | 'dump'
  bundle_id?: string
  version?: string
  app_name?: string
  // ⚠️ size_mb 已移除：不能由用户填写传递，后端会自动从主站获取应用大小
  icon_url?: string
  country?: string
  real_version?: string
}) {
  return request({
    url: '/vip-coin/perform-action',
    method: 'post',
    data,
  })
}

/**
 * 获取大小范围配置
 */
export function getSizeConfigs(actionType: 'download' | 'dump') {
  return request({
    url: '/vip-coin/size-configs',
    method: 'get',
    params: { action_type: actionType },
  })
}

/**
 * 更新大小范围配置
 */
export function updateSizeConfigs(actionType: 'download' | 'dump', configs: Array<{
  id?: number
  min_size_mb: number
  max_size_mb: number | null
  coin_cost: number
  sort_order: number
}>) {
  return request({
    url: '/vip-coin/size-configs',
    method: 'put',
    data: { action_type: actionType, configs },
  })
}

/**
 * 根据应用大小计算金币
 */
export function calculateCoinBySize(actionType: 'download' | 'dump', sizeMB: number | null) {
  return request({
    url: '/vip-coin/calculate-coin',
    method: 'get',
    params: { action_type: actionType, size_mb: sizeMB },
  })
}

