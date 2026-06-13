import mysql from 'mysql2/promise'
import { config } from './index'
import { logger } from '../utils/logger'

// 创建数据库连接池
export const pool = mysql.createPool(config.database)

// 测试数据库连接
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    logger.info('分站数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    logger.error('分站数据库连接失败:', error)
    return false
  }
}

// 执行查询
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    logger.debug(`执行SQL: ${sql}, 参数:`, params)
    const [rows] = await pool.execute(sql, params || [])
    return rows as T
  } catch (error) {
    logger.error('数据库查询错误:', error)
    throw error
  }
}

// 执行事务
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool

