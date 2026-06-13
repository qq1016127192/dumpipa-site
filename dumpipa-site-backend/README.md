# 分站独立后端系统

## 架构说明

分站现在拥有完全独立的数据库，包括：
- 用户系统（登录、注册、用户信息）
- 金币系统
- VIP系统
- 订单系统
- 支付系统

**应用数据（App Store数据）仍然通过主站API获取**，其他业务逻辑完全独立。

## 数据库初始化

1. 创建数据库（如果不存在）：
```sql
CREATE DATABASE IF NOT EXISTS dumpipa_site DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

2. 执行初始化脚本：
```bash
mysql -u root -p dumpipa_site < init_site_database.sql
```

或者在MySQL客户端中执行：
```sql
USE dumpipa_site;
SOURCE init_site_database.sql;
```

## 环境配置

创建或更新 `.env` 文件：

```env
# 服务器端口
PORT=3001

# 数据库配置（分站独立数据库）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dumpipa_site

# JWT配置
JWT_SECRET=your-site-backend-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 主站API配置（用于获取应用数据）
MAIN_SITE_API_URL=http://localhost:3000/api
MAIN_SITE_TOKEN=your_main_site_token

# CORS配置
CORS_ORIGIN=http://localhost:5174,http://localhost:5173

# 环境
NODE_ENV=development
```

## 当前实现的功能

### ✅ 已完成
- [x] 用户注册
- [x] 用户登录
- [x] 获取当前用户信息
- [x] 用户登出
- [x] JWT认证中间件
- [x] 应用数据API代理到主站（/api/apps/*）

### ⏳ 待迁移（可选）
如果需要以下功能，需要从主站迁移相应代码：
- [ ] 用户管理（用户列表、修改等）
- [ ] 金币充值套餐管理
- [ ] VIP套餐管理
- [ ] 金币交易记录
- [ ] 订单管理
- [ ] 支付方式管理
- [ ] 每日使用统计
- [ ] 系统配置管理

## API路由说明

### 分站独立路由（使用本地数据库）
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需要认证）
- `POST /api/auth/logout` - 用户登出（需要认证）

### 代理到主站的路由（应用数据）
- `GET /api/apps/*` - 所有应用相关的API请求会代理到主站

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 注意事项

1. **数据库独立性**：分站使用独立的数据库（`dumpipa_site`），与主站数据库完全隔离
2. **应用数据**：应用相关的数据（App Store信息、历史版本等）仍然从主站API获取
3. **JWT Token**：分站有自己的JWT密钥，与主站的JWT不互通
4. **用户数据**：分站用户与主站用户完全独立，需要分别注册

