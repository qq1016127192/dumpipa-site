import request from '@/utils/request'

/**
 * 获取设备列表
 */
export function getDevices() {
  return request({
    url: '/devices',
    method: 'get',
  })
}

/**
 * 获取iOS设备列表（用于脱壳）
 */
export function getIosDevices() {
  return request({
    url: '/devices',
    method: 'get',
  })
}

/**
 * 添加设备
 */
export function addDevice(data: any) {
  return request({
    url: '/devices',
    method: 'post',
    data,
  })
}

/**
 * 更新设备
 */
export function updateDevice(id: number, data: any) {
  return request({
    url: `/devices/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除设备
 */
export function deleteDevice(id: number) {
  return request({
    url: `/devices/${id}`,
    method: 'delete',
  })
}

/**
 * 测试设备连接
 */
export function testDevice(id: number) {
  return request({
    url: `/devices/${id}/test`,
    method: 'post',
  })
}

