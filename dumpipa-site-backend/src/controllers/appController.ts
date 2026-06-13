/**
 * 应用相关控制器（分站）
 * 处理需要扣费验证的接口
 */

import { Request, Response } from 'express'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import { query } from '../config/database'
import { proxyRequest, getSiteToken } from '../services/proxyService'

/**
 * 获取下载链接（需要验证扣费记录）
 * 确保只有扣费成功的用户才能获取下载链接
 */
export async function getDownloadUrl(req: Request, res: Response): Promise<void> {
  try {
    const bundleId = req.query.bundle_id as string
    const version = req.query.version as string
    const country = (req.query.country as string) || 'cn'
    const userId = (req as any).user?.userId

    if (!bundleId || !version) {
      error(res, '缺少必要参数', 400)
      return
    }

    // 验证 version 是否为纯数字（App Store 发行号）
    if (!/^\d+$/.test(version)) {
      error(res, 'Version 必须是 App Store 发行号（纯数字），不是显示版本号', 400)
      return
    }

    if (!userId) {
      error(res, '未登录，无法获取下载链接', 401)
      return
    }

    // 验证用户是否有最近的扣费记录（最近5分钟内针对该应用的下载操作）
    // 检查 consume 类型的交易，描述格式为："下载: app_name version" 或 "下载: bundle_id version"
    // 因为扣费时使用的格式是：${actionName}: ${app_name || bundle_id} ${version}
    // 需要同时匹配 bundle_id 和 version，确保是同一个应用版本
    const recentTransactions = await query<any[]>(
      `SELECT * FROM coin_transactions 
       WHERE user_id = ? 
         AND type = 'consume' 
         AND description LIKE ?
         AND description LIKE ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, `%下载:%${bundleId}%`, `%${version}%`]
    )
    
    // 如果上面的查询没有结果，尝试更宽松的匹配（可能app_name和bundle_id不同）
    let transactions = recentTransactions
    if (!transactions || transactions.length === 0) {
      transactions = await query<any[]>(
        `SELECT * FROM coin_transactions 
         WHERE user_id = ? 
           AND type = 'consume' 
           AND (description LIKE ? OR description LIKE ?)
           AND description LIKE ?
           AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId, `%下载: %${bundleId}%`, `%download: %${bundleId}%`, `%${version}%`]
      )
    }

    // 如果没有扣费记录，检查每日使用记录（用于免费操作）
    if (!transactions || transactions.length === 0) {
      const dailyUsage = await query<any[]>(
        `SELECT * FROM daily_usage 
         WHERE user_id = ? 
           AND action_type = 'download'
           AND usage_date = CURDATE()
           AND (usage_count > 0 OR updated_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE))
         LIMIT 1`,
        [userId]
      )

      if (!dailyUsage || dailyUsage.length === 0) {
        logger.warn(`用户 ${userId} 尝试获取下载链接但无分站扣费记录: ${bundleId}/${version}`)
        error(res, '请先通过分站进行扣费操作才能获取下载链接', 403)
        return
      }

      logger.info(`用户 ${userId} 验证通过（有每日使用记录），获取下载链接: ${bundleId}/${version}`)
    } else {
      logger.info(`用户 ${userId} 验证通过（有分站扣费记录），获取下载链接: ${bundleId}/${version}`)
    }

    // 验证通过，从主站获取下载链接
    const siteToken = await getSiteToken()
    if (!siteToken) {
      error(res, '分站Token未配置，请联系管理员', 500)
      return
    }

    try {
      const downloadResult = await proxyRequest(
        'GET',
        '/api/apps/download-url',
        {
          bundle_id: bundleId,
          version: version,
          country: country
        },
        siteToken
      )

      if (downloadResult.ok === 1 && downloadResult.download_url) {
        success(res, {
          download_url: downloadResult.download_url,
          size: downloadResult.size || '未知'
        })
      } else {
        error(res, downloadResult.msg || '获取下载链接失败', 500)
      }
    } catch (err: any) {
      logger.error('从主站获取下载链接失败:', err)
      error(res, '获取下载链接失败', 500)
    }
  } catch (err: any) {
    logger.error('获取下载链接失败:', err)
    error(res, '获取下载链接失败', 500)
  }
}

