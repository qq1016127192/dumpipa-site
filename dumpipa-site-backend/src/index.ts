import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { testDatabaseConnection } from './config/database'
import { logger } from './utils/logger'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import vipCoinRoutes from './routes/vipCoin'
import siteConfigRoutes from './routes/siteConfig'
import orderRoutes from './routes/orders'
import paymentRoutes from './routes/payment'
import taskRoutes from './routes/tasks'
import adminRoutes from './routes/admin'
import settingsRoutes from './routes/settings'
import appsRoutes from './routes/apps'
import proxyRoutes from './routes/proxy'
import announcementRoutes from './routes/announcements'
import feedbackRoutes from './routes/feedback'

const app = express()

// 中间件
app.use(helmet())
app.use(compression())
app.use(cors(config.cors))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 速率限制
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: config.nodeEnv === 'development' ? 1000 : 100,
  message: '请求过于频繁,请稍后再试',
})
app.use('/api/', limiter)

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// 分站独立业务路由（使用本地数据库）
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/vip-coin', vipCoinRoutes)
app.use('/api/site-config', siteConfigRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/apps', appsRoutes) // 应用相关路由（需要扣费验证的接口）
app.use('/api/announcements', announcementRoutes)
app.use('/api/feedback', feedbackRoutes) // 反馈路由（代理到主站）

// 应用数据API路由 - 代理到主站（必须放在最后，避免与特定路由冲突）
// 注意：proxyRoutes中已经包含了/apps/*和/devices/*等路由，但/download-url会被appsRoutes拦截
app.use('/api', proxyRoutes)

// 404 处理
app.use(notFoundHandler)

// 错误处理
app.use(errorHandler)

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      logger.error('数据库连接失败,服务器启动中止')
      process.exit(1)
    }
    
    // 启动 HTTP 服务器
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`分站后端服务器启动成功: http://0.0.0.0:${config.port}`)
      logger.info(`环境: ${config.nodeEnv}`)
      logger.info(`主站API: ${config.mainSite.apiUrl}`)
    })
    
    // 优雅关闭
    process.on('SIGTERM', () => {
      logger.info('收到 SIGTERM 信号,开始优雅关闭...')
      server.close(() => {
        logger.info('服务器已关闭')
        process.exit(0)
      })
    })
    
    process.on('SIGINT', () => {
      logger.info('收到 SIGINT 信号,开始优雅关闭...')
      server.close(() => {
        logger.info('服务器已关闭')
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 启动
startServer()

export default app

