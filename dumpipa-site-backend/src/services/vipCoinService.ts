/**
 * 会员和金币系统服务
 */

import { query } from '../config/database'
import { logger } from '../utils/logger'

/**
 * 系统配置接口
 */
interface SystemConfig {
  [key: string]: string | number
}

/**
 * 会员套餐接口
 */
interface VipPackage {
  id?: number
  name: string
  vip_level: number
  price: number
  duration: number
  coin_price?: number
  description?: string
  is_active?: number
  sort_order?: number
}

/**
 * 金币套餐接口
 */
interface CoinPackage {
  id?: number
  name: string
  coins: number
  price: number
  bonus_coins?: number
  description?: string
  is_active?: number
  sort_order?: number
}

/**
 * 获取系统配置
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const rows = await query<any[]>(
    `SELECT config_key, config_value 
     FROM system_config 
     WHERE config_group IN ('coin', 'limit', 'vip', 'system')
     ORDER BY config_key`
  )

  const config: SystemConfig = {}
  rows.forEach((row: any) => {
    // 尝试将字符串转换为数字
    const value = row.config_value
    config[row.config_key] = isNaN(Number(value)) ? value : Number(value)
  })

  return config
}

/**
 * 更新系统配置
 */
export async function updateSystemConfig(configs: Array<{key: string, value: string}>): Promise<void> {
  for (const config of configs) {
    // 先尝试更新，如果不存在则插入
    const existing = await query<any[]>(
      'SELECT id FROM system_config WHERE config_key = ?',
      [config.key]
    )
    
    if (existing.length > 0) {
      // 更新现有配置
    await query(
        'UPDATE system_config SET config_value = ? WHERE config_key = ?',
      [config.value, config.key]
    )
    } else {
      // 插入新配置（需要确定config_group）
      // 根据key推断group
      let configGroup = 'coin'
      if (config.key.includes('limit') || config.key.includes('free') && !config.key.includes('vip')) {
        configGroup = 'limit'
      } else if (config.key.includes('vip')) {
        configGroup = 'vip'
      } else if (config.key === 'site_free_mode') {
        configGroup = 'system'
      }
      
      await query(
        'INSERT INTO system_config (config_key, config_value, config_group) VALUES (?, ?, ?)',
        [config.key, config.value, configGroup]
      )
    }
  }
}

/**
 * 获取大小范围配置列表
 */
export async function getSizeConfigs(actionType: 'download' | 'dump'): Promise<Array<{
  id: number
  action_type: string
  min_size_mb: number
  max_size_mb: number | null
  coin_cost: number
  sort_order: number
}>> {
  return await query<Array<{
    id: number
    action_type: string
    min_size_mb: number
    max_size_mb: number | null
    coin_cost: number
    sort_order: number
  }>>(
    `SELECT * FROM coin_size_config WHERE action_type = ? ORDER BY sort_order ASC, min_size_mb ASC`,
    [actionType]
  )
}

/**
 * 更新大小范围配置
 */
export async function updateSizeConfigs(actionType: 'download' | 'dump', configs: Array<{
  id?: number
  min_size_mb: number
  max_size_mb: number | null
  coin_cost: number
  sort_order: number
}>): Promise<void> {
  // 先删除该类型的所有配置
  await query(`DELETE FROM coin_size_config WHERE action_type = ?`, [actionType])
  
  // 重新插入配置
  for (const config of configs) {
    await query(
      `INSERT INTO coin_size_config (action_type, min_size_mb, max_size_mb, coin_cost, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [actionType, config.min_size_mb, config.max_size_mb, config.coin_cost, config.sort_order]
    )
  }
}

/**
 * 根据应用大小计算金币消耗
 */
export async function calculateCoinBySize(actionType: 'download' | 'dump', sizeMB: number | null): Promise<number> {
  // 如果没有大小信息，使用默认配置
  if (sizeMB === null || sizeMB === undefined || isNaN(sizeMB)) {
    const config = await getSystemConfig()
    return actionType === 'download' 
      ? Number(config.coin_download_cost) 
      : Number(config.coin_dump_cost)
  }
  
  // 查找匹配的大小范围配置
  const configs = await getSizeConfigs(actionType)
  
  // 找到匹配的配置（按sort_order排序，找到第一个匹配的）
  for (const config of configs) {
    if (sizeMB >= config.min_size_mb) {
      if (config.max_size_mb === null || sizeMB < config.max_size_mb) {
        return Number(config.coin_cost)
      }
    }
  }
  
  // 如果没有找到匹配的配置，使用最后一个配置（通常是最大的范围）
  if (configs.length > 0) {
    return Number(configs[configs.length - 1].coin_cost)
  }
  
  // 如果没有任何配置，使用默认值
  const config = await getSystemConfig()
  return actionType === 'download' 
    ? Number(config.coin_download_cost) 
    : Number(config.coin_dump_cost)
}

/**
 * 获取会员套餐列表
 */
export async function getVipPackages(includeInactive: boolean = false): Promise<VipPackage[]> {
  const sql = includeInactive
    ? `SELECT * FROM vip_packages ORDER BY sort_order ASC, id ASC`
    : `SELECT * FROM vip_packages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`

  return await query<VipPackage[]>(sql)
}

/**
 * 创建会员套餐
 */
export async function createVipPackage(packageData: VipPackage): Promise<number> {
  const result = await query<any>(
    `INSERT INTO vip_packages (name, vip_level, price, duration, coin_price, description, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      packageData.name,
      packageData.vip_level,
      packageData.price,
      packageData.duration,
      packageData.coin_price || null,
      packageData.description || '',
      packageData.is_active !== undefined ? packageData.is_active : 1,
      packageData.sort_order || 0
    ]
  )
  return result.insertId
}

/**
 * 更新会员套餐
 */
export async function updateVipPackage(id: number, packageData: Partial<VipPackage>): Promise<void> {
  const fields: string[] = []
  const values: any[] = []

  if (packageData.name !== undefined) {
    fields.push('name = ?')
    values.push(packageData.name)
  }
  if (packageData.vip_level !== undefined) {
    fields.push('vip_level = ?')
    values.push(packageData.vip_level)
  }
  if (packageData.price !== undefined) {
    fields.push('price = ?')
    values.push(packageData.price)
  }
  if (packageData.duration !== undefined) {
    fields.push('duration = ?')
    values.push(packageData.duration)
  }
  if (packageData.coin_price !== undefined) {
    fields.push('coin_price = ?')
    values.push(packageData.coin_price)
  }
  if (packageData.description !== undefined) {
    fields.push('description = ?')
    values.push(packageData.description)
  }
  if (packageData.is_active !== undefined) {
    fields.push('is_active = ?')
    values.push(packageData.is_active)
  }
  if (packageData.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(packageData.sort_order)
  }

  if (fields.length === 0) {
    return
  }

  values.push(id)
  await query(`UPDATE vip_packages SET ${fields.join(', ')} WHERE id = ?`, values)
}

/**
 * 删除会员套餐
 */
export async function deleteVipPackage(id: number): Promise<void> {
  await query(`DELETE FROM vip_packages WHERE id = ?`, [id])
}

/**
 * 获取金币套餐列表
 */
export async function getCoinPackages(includeInactive: boolean = false): Promise<CoinPackage[]> {
  const sql = includeInactive
    ? `SELECT * FROM coin_packages ORDER BY sort_order ASC, id ASC`
    : `SELECT * FROM coin_packages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`

  return await query<CoinPackage[]>(sql)
}

/**
 * 创建金币套餐
 */
export async function createCoinPackage(packageData: CoinPackage): Promise<number> {
  const result = await query<any>(
    `INSERT INTO coin_packages (name, coins, price, bonus_coins, description, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      packageData.name,
      packageData.coins,
      packageData.price,
      packageData.bonus_coins || 0,
      packageData.description || '',
      packageData.is_active !== undefined ? packageData.is_active : 1,
      packageData.sort_order || 0
    ]
  )
  return result.insertId
}

/**
 * 更新金币套餐
 */
export async function updateCoinPackage(id: number, packageData: Partial<CoinPackage>): Promise<void> {
  const fields: string[] = []
  const values: any[] = []

  if (packageData.name !== undefined) {
    fields.push('name = ?')
    values.push(packageData.name)
  }
  if (packageData.coins !== undefined) {
    fields.push('coins = ?')
    values.push(packageData.coins)
  }
  if (packageData.price !== undefined) {
    fields.push('price = ?')
    values.push(packageData.price)
  }
  if (packageData.bonus_coins !== undefined) {
    fields.push('bonus_coins = ?')
    values.push(packageData.bonus_coins)
  }
  if (packageData.description !== undefined) {
    fields.push('description = ?')
    values.push(packageData.description)
  }
  if (packageData.is_active !== undefined) {
    fields.push('is_active = ?')
    values.push(packageData.is_active)
  }
  if (packageData.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(packageData.sort_order)
  }

  if (fields.length === 0) {
    return
  }

  values.push(id)
  await query(`UPDATE coin_packages SET ${fields.join(', ')} WHERE id = ?`, values)
}

/**
 * 删除金币套餐
 */
export async function deleteCoinPackage(id: number): Promise<void> {
  await query(`DELETE FROM coin_packages WHERE id = ?`, [id])
}

/**
 * 获取用户金币交易记录
 */
export async function getUserCoinTransactions(userId: number, page: number, pageSize: number) {
  const offset = (page - 1) * pageSize

  const transactions = await query<any[]>(
    `SELECT * FROM coin_transactions 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ${pageSize} OFFSET ${offset}`,
    [userId]
  )

  const [{ total }] = await query<any[]>(
    `SELECT COUNT(*) as total FROM coin_transactions WHERE user_id = ?`,
    [userId]
  )

  return {
    transactions,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize)
  }
}

/**
 * 充值金币
 */
export async function rechargeCoin(userId: number, amount: number, reason: string): Promise<void> {
  // 获取用户当前金币余额
  const [user] = await query<any[]>(`SELECT coins FROM users WHERE id = ?`, [userId])
  
  if (!user) {
    throw new Error('用户不存在')
  }

  const currentBalance = parseFloat(user.balance) || 0
  const newBalance = currentBalance + amount

  // 更新用户金币余额（使用balance字段）
  await query(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, userId])

  // 记录交易
  await query(
    `INSERT INTO coin_transactions (user_id, amount, balance_before, balance_after, type, description)
     VALUES (?, ?, ?, ?, 'charge', ?)`,
    [userId, amount, currentBalance, newBalance, reason]
  )

  logger.info(`用户 ${userId} 充值金币 ${amount}，余额: ${newBalance}`)
}

/**
 * 消费金币
 */
export async function consumeCoin(userId: number, amount: number, reason: string, relatedId?: number): Promise<boolean> {
  // 获取用户当前金币余额（使用balance字段）
  const [user] = await query<any[]>(`SELECT balance FROM users WHERE id = ?`, [userId])
  
  if (!user) {
    throw new Error('用户不存在')
  }

  const currentBalance = parseFloat(user.balance) || 0

  // 检查余额是否充足
  if (currentBalance < amount) {
    return false
  }

  const newBalance = currentBalance - amount

  // 更新用户金币余额（使用balance字段）
  await query(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, userId])

  // 记录交易
  await query(
    `INSERT INTO coin_transactions (user_id, amount, balance_before, balance_after, type, description, related_id)
     VALUES (?, ?, ?, ?, 'consume', ?, ?)`,
    [userId, -amount, currentBalance, newBalance, reason, relatedId || null]
  )

  logger.info(`用户 ${userId} 消费金币 ${amount}，余额: ${newBalance}`)
  return true
}

/**
 * 获取每日使用统计（分站使用action_type和usage_count字段）
 */
export async function getDailyUsage(userId: number, date: string) {
  const rows = await query<any[]>(
    `SELECT action_type, usage_count FROM daily_usage 
     WHERE user_id = ? AND usage_date = ?`,
    [userId, date]
  )

  // 转换为download_count和dump_count格式
  const result: any = {
    download_count: 0,
    dump_count: 0
  }

  for (const row of rows) {
    if (row.action_type === 'download') {
      result.download_count = row.usage_count || 0
    } else if (row.action_type === 'dump') {
      result.dump_count = row.usage_count || 0
    }
  }

  return result
}

/**
 * 更新每日使用次数（分站使用action_type和usage_count字段）
 */
export async function updateDailyUsage(userId: number, type: 'download' | 'dump'): Promise<void> {
  // 分站的daily_usage表使用action_type和usage_count字段
  await query(
    `INSERT INTO daily_usage (user_id, action_type, usage_date, usage_count)
     VALUES (?, ?, CURDATE(), 1)
     ON DUPLICATE KEY UPDATE usage_count = usage_count + 1`,
    [userId, type]
  )
}

/**
 * 检查用户是否可以执行操作（考虑免费次数和金币）
 */
export async function canUserPerformAction(
  userId: number, 
  action: 'download' | 'dump',
  sizeMB?: number | null
): Promise<{
  allowed: boolean
  needCoin: boolean
  coinCost: number
  reason?: string
}> {
  // 获取系统配置（先检查全站免费）
  const config = await getSystemConfig()
  
  // 检查是否开启全站免费
  if (config.site_free_mode === 1 || config.site_free_mode === '1') {
    return { allowed: true, needCoin: false, coinCost: 0 }
  }

  // 获取用户信息（使用balance字段）
  const [user] = await query<any[]>(
    `SELECT balance as coins, is_vip, vip_expires_at, vip_level FROM users WHERE id = ?`,
    [userId]
  )

  if (!user) {
    return { allowed: false, needCoin: false, coinCost: 0, reason: '用户不存在' }
  }

  // 检查是否为有效会员
  const isVip = user.is_vip && user.vip_expires_at && new Date(user.vip_expires_at) > new Date()

  // 获取今日使用次数（使用 MySQL 的 CURDATE()）
  const today = await query<any[]>('SELECT CURDATE() as today')
  const usage = await getDailyUsage(userId, today[0].today)

  const currentCount = action === 'download' ? usage.download_count : usage.dump_count

  // 获取免费次数配置
  let freeCount: number
  let actionFree: boolean

  if (isVip) {
    freeCount = action === 'download' 
      ? Number(config.vip_free_download_daily) 
      : Number(config.vip_free_dump_daily)
    actionFree = action === 'download'
      ? Number(config.vip_download_free) === 1
      : Number(config.vip_dump_free) === 1
  } else {
    freeCount = action === 'download'
      ? Number(config.free_download_daily)
      : Number(config.free_dump_daily)
    actionFree = false
  }

  // 如果会员该操作免费，直接允许
  if (isVip && actionFree) {
    return { allowed: true, needCoin: false, coinCost: 0 }
  }

  // 检查是否还有免费次数
  if (currentCount < freeCount) {
    return { allowed: true, needCoin: false, coinCost: 0 }
  }

  // 需要消费金币 - 根据应用大小动态计算
  const coinCost = await calculateCoinBySize(action, sizeMB ?? null)

  const userCoins = parseFloat(user.coins) || 0

  if (userCoins >= coinCost) {
    return { allowed: true, needCoin: true, coinCost }
  }

  return { allowed: false, needCoin: true, coinCost, reason: '金币余额不足' }
}

/**
 * 执行下载或砸壳扣费
 */
export async function performActionAndDeduct(
  userId: number, 
  action: 'download' | 'dump',
  relatedInfo?: { bundle_id?: string; version?: string; app_name?: string; size_mb?: number | null }
): Promise<{
  success: boolean
  cost: number
  isFree: boolean
  message: string
}> {
  // 检查是否允许执行操作（传入应用大小）
  const check = await canUserPerformAction(userId, action, relatedInfo?.size_mb ?? null)
  
  if (!check.allowed) {
    return {
      success: false,
      cost: 0,
      isFree: false,
      message: check.reason || '操作失败'
    }
  }

  // 更新每日使用次数
  await updateDailyUsage(userId, action)

  // 如果需要消费金币
  if (check.needCoin && check.coinCost > 0) {
    const actionName = action === 'download' ? '下载' : '砸壳'
    const reason = relatedInfo 
      ? `${actionName}: ${relatedInfo.app_name || relatedInfo.bundle_id || ''} ${relatedInfo.version || ''}`
      : actionName
    
    await consumeCoin(userId, check.coinCost, reason)
    
    return {
      success: true,
      cost: check.coinCost,
      isFree: false,
      message: `${actionName}成功，扣除 ${check.coinCost} 金币`
    }
  }

  // 免费操作
  const actionName = action === 'download' ? '下载' : '砸壳'
  return {
    success: true,
    cost: 0,
    isFree: true,
    message: `${actionName}成功（免费）`
  }
}

/**
 * 获取会员订单列表
 */
export async function getVipOrders(page: number, pageSize: number, status?: string, userId?: number) {
  const offset = (page - 1) * pageSize
  const conditions: string[] = []
  const params: any[] = []

  if (status) {
    conditions.push('vo.status = ?')
    params.push(status)
  }

  if (userId) {
    conditions.push('vo.user_id = ?')
    params.push(userId)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 使用字符串拼接而不是占位符
  const orders = await query<any[]>(
    `SELECT vo.*, u.username
     FROM vip_orders vo
     LEFT JOIN users u ON vo.user_id = u.id
     ${whereClause}
     ORDER BY vo.created_at DESC
     LIMIT ${pageSize} OFFSET ${offset}`
  )

  const totalResult = await query<any[]>(
    `SELECT COUNT(*) as total FROM vip_orders vo ${whereClause}`
  )
  
  const total = totalResult[0]?.total || 0

  return {
    orders,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize)
  }
}

/**
 * 设置用户会员
 */
export async function setUserVip(userId: number, vipLevel: number, durationDays: number): Promise<void> {
  const expireDate = new Date()
  expireDate.setDate(expireDate.getDate() + durationDays)

  await query(
    `UPDATE users 
     SET is_vip = 1, vip_level = ?, vip_expires_at = ?
     WHERE id = ?`,
    [vipLevel, expireDate.toISOString().split('T')[0], userId]
  )

  logger.info(`设置用户 ${userId} 为会员，等级: ${vipLevel}，到期: ${expireDate}`)
}

/**
 * 获取会员和金币统计数据
 */
export async function getVipCoinStats() {
  // 会员总数
  const [{ vipCount }] = await query<any[]>(
    `SELECT COUNT(*) as vipCount 
     FROM users 
     WHERE is_vip = 1 AND vip_expires_at > NOW()`
  )

  // 今日新增会员
  const [{ todayVip }] = await query<any[]>(
    `SELECT COUNT(*) as todayVip 
     FROM vip_orders 
     WHERE status = 'paid' AND DATE(paid_at) = CURDATE()`
  )

  // 金币总交易额
  const [{ totalCoinTransaction }] = await query<any[]>(
    `SELECT SUM(ABS(amount)) as totalCoinTransaction 
     FROM coin_transactions`
  )

  // 今日金币消费
  const [{ todayCoinConsume }] = await query<any[]>(
    `SELECT SUM(ABS(amount)) as todayCoinConsume 
     FROM coin_transactions 
     WHERE type = 'consume' AND DATE(created_at) = CURDATE()`
  )

  // 今日下载次数（分站使用action_type字段）
  const [{ todayDownload }] = await query<any[]>(
    `SELECT SUM(usage_count) as todayDownload 
     FROM daily_usage 
     WHERE action_type = 'download' AND usage_date = CURDATE()`
  )

  // 今日砸壳次数（分站使用action_type字段）
  const [{ todayDump }] = await query<any[]>(
    `SELECT SUM(usage_count) as todayDump 
     FROM daily_usage 
     WHERE action_type = 'dump' AND usage_date = CURDATE()`
  )

  return {
    vipCount: vipCount || 0,
    todayVip: todayVip || 0,
    totalCoinTransaction: totalCoinTransaction || 0,
    todayCoinConsume: todayCoinConsume || 0,
    todayDownload: todayDownload || 0,
    todayDump: todayDump || 0
  }
}

