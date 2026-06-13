import winston from 'winston'
import path from 'path'
import fs from 'fs'
import { config } from '../config'

// 日志目录
const logDir = path.join(process.cwd(), 'logs')

// 确保日志目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 创建 Winston logger
export const logger = winston.createLogger({
  level: config.log.level || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'dumpipa-site-api' },
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 安全序列化函数（避免循环引用）
function safeStringify(obj: any, space?: number): string {
  const seen = new WeakSet()
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]'
      }
      seen.add(value)
      // 过滤掉可能导致循环引用的属性
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        }
      }
      // 过滤掉 axios 错误对象的循环引用属性
      if (value.request && value.response) {
        // 这是 axios 错误对象，提取关键信息
        const safeValue: any = {
          message: value.message,
          code: value.code,
          name: value.name,
        }
        if (value.response) {
          safeValue.response = {
            status: value.response.status,
            statusText: value.response.statusText,
            data: value.response.data,
          }
        }
        if (value.config) {
          safeValue.config = {
            method: value.config.method,
            url: value.config.url,
            baseURL: value.config.baseURL,
          }
        }
        return safeValue
      }
    }
    return value
  }, space)
}

// 开发环境添加控制台输出
if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) => {
            const metaKeys = Object.keys(meta)
            if (metaKeys.length > 0) {
              try {
                return `${timestamp} [${level}]: ${message} ${safeStringify(meta, 2)}`
              } catch (e) {
                // 如果序列化失败，只显示消息
                return `${timestamp} [${level}]: ${message} [序列化失败: ${(e as Error).message}]`
              }
            }
            return `${timestamp} [${level}]: ${message}`
          }
        )
      ),
    })
  )
}

export default logger
