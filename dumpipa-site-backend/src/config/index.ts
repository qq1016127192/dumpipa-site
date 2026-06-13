import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export const config = {
  // 服务器配置（分站后端端口，避免与主站8000冲突）
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 主站API配置
  mainSite: {
    apiUrl: process.env.MAIN_SITE_API_URL || 'http://localhost:3000/api', // 主站后端使用3000端口
    token: process.env.MAIN_SITE_TOKEN || '', // 分站的默认token，从数据库获取
  },
  
  // 数据库配置（分站独立数据库）
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dumpipa_site', // 分站独立数据库
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  
  // JWT配置（分站内部使用）
  jwt: {
    secret: process.env.JWT_SECRET || 'site-backend-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // CORS配置
  cors: {
    origin: (process.env.NODE_ENV || 'development') === 'production' 
      ? (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5174']) 
      : true, // 开发环境允许所有源，方便移动端访问
    credentials: true,
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
}

export default config

