/**
 * 公告系统 API
 */

import request from '../utils/request'

/**
 * 获取公告列表（公开）
 */
export function getAnnouncements() {
  return request({
    url: '/announcements',
    method: 'get',
  })
}

/**
 * 获取所有公告（管理员）
 */
export function getAllAnnouncements(page = 1, pageSize = 20) {
  return request({
    url: '/announcements/admin/all',
    method: 'get',
    params: { page, pageSize },
  })
}

/**
 * 获取公告详情
 */
export function getAnnouncementDetail(id: number) {
  return request({
    url: `/announcements/admin/${id}`,
    method: 'get',
  })
}

/**
 * 创建公告
 */
export function createAnnouncement(data: any) {
  return request({
    url: '/announcements/admin',
    method: 'post',
    data,
  })
}

/**
 * 更新公告
 */
export function updateAnnouncement(id: number, data: any) {
  return request({
    url: `/announcements/admin/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除公告
 */
export function deleteAnnouncement(id: number) {
  return request({
    url: `/announcements/admin/${id}`,
    method: 'delete',
  })
}

