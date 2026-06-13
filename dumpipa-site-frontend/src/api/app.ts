import request from '@/utils/request'
import type { AppInfo, AppVersion, ApiResponse } from '@/types'

/**
 * 应用相关 API
 */

// 获取热门应用列表（支持分页，按砸壳次数排序）
export const getHotApps = (params?: { page?: number; page_size?: number; limit?: number }) => {
  // 兼容旧的 limit 参数
  const pageSize = params?.page_size || params?.limit || 20
  const page = params?.page || 1
  
  return request.get<ApiResponse<{ apps: AppInfo[]; pagination?: any }>>('/apps/hot', {
    params: { 
      page,
      page_size: pageSize
    },
  })
}

// 获取推荐应用列表（支持分页，所有版本按最新时间排序）
export const getRecommendedApps = (params?: { page?: number; page_size?: number; limit?: number }) => {
  // 兼容旧的 limit 参数
  const pageSize = params?.page_size || params?.limit || 20
  const page = params?.page || 1
  
  return request.get<ApiResponse<{ apps: AppInfo[]; pagination?: any }>>('/apps/recommended', {
    params: { 
      page,
      page_size: pageSize
    },
  })
}

// 搜索应用
export const searchApps = (keyword: string, country = 'cn') => {
  return request.get<ApiResponse<{ results: any[]; total: number }>>('/apps/search', {
    params: { keyword, country },
  })
}

// 获取应用详情(包含历史版本)
export const getAppDetail = (bundleId: string, country = 'cn', limit?: number) => {
  return request.get<ApiResponse<{ app: any; versions: any[] }>>(`/apps/${bundleId}`, {
    params: {
      country,
      ...(limit ? { limit } : {}),
    },
  })
}

// 获取应用的历史版本列表
export const getAppVersions = (bundleId: string) => {
  return request.get<ApiResponse<{ versions: AppVersion[] }>>('/apps/versions', {
    params: { bundle_id: bundleId },
  })
}

// 获取应用大小
export const getAppSize = (bundleId: string, version: string, country = 'cn') => {
  return request.get<ApiResponse<{ size: string }>>('/apps/size', {
    params: { 
      bundle_id: bundleId, 
      version, 
      country 
    },
  })
}

// 获取下载链接
export const getDownloadUrl = (bundleId: string, version: string, country = 'cn') => {
  return request.get<ApiResponse<{ download_url: string; size: string }>>('/apps/download-url', {
    params: { 
      bundle_id: bundleId, 
      version, 
      country 
    },
  })
}

// 获取应用信息
export const getAppInfo = (bundleId: string, country = 'cn') => {
  return request.get('/apps/info', {
    params: { bundle_id: bundleId, country },
  })
}

// 获取ipatool历史版本列表
export const getAppHistoryVersions = (bundleId: string, country = 'cn') => {
  return request.get('/apps/history-versions', {
    params: { bundle_id: bundleId, country },
  })
}

// 检查IPA文件是否存在
export const checkIpaFile = (bundleId: string, versionId: string) => {
  return request.get('/apps/ipa/check', {
    params: { bundle_id: bundleId, version_id: versionId },
  })
}

// 下载IPA文件
export const downloadIpaVersion = (bundleId: string, versionId: string, country = 'cn') => {
  return request.post('/apps/ipa/download', {
    bundle_id: bundleId,
    version_id: versionId,
    country,
  })
}

