# DumpIPA 分站系统

DumpIPA分站系统是一个独立的iOS应用脱壳平台分站，拥有独立的用户系统、金币系统、VIP系统，同时通过API对接主站获取应用数据。

## 📁 项目结构

```
dumpipa-site/
├── dumpipa-site-frontend/     # [分站] 前端 (Vue 3 + Vite + TypeScript)
├── dumpipa-site-backend/      # [后端] 分站后端 (Node.js + TypeScript + Express)
└── dumptest_2026-06-13_16-09-19_mysql_data_XRtOE.sql  # [feat] 数据库备份文件
```

## 🚀 快速开始

### 前端

```bash
cd dumpipa-site-frontend
npm install
# 创建环境变量文件
echo "VITE_API_BASE_URL=https://test.dumpipa.com/api" > .env
npm run dev
```

访问：https://test.dumpipa.com

#### 前端环境变量配置

创建 `.env` 文件并配置以下内容：

```env
VITE_API_BASE_URL=https://test.dumpipa.com/api
```

### 后端

```bash
cd dumpipa-site-backend
npm install
# 复制环境变量示例文件
cp env.plan-b.example .env
# 编辑.env文件，配置数据库和主站API地址
npm run dev
```

后端将在 `http://localhost:3001` 启动

#### 环境变量配置

创建 `.env` 文件并配置以下内容：

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 主站API地址
MAIN_SITE_API_URL=https://dump.dumpipa.com/api

# 主站Token（从 https://www.dumpipa.com/token 获取）
MAIN_SITE_TOKEN=your_token_here

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=dumptest
DB_PASSWORD=Y5bWSzTWjRS4CbB2
DB_NAME=dumptest

# JWT配置
JWT_SECRET=site-backend-secret-key
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://test.dumpipa.com,http://test.dumpipa.com

# 日志配置
LOG_LEVEL=info
```

### 管理员账号

- **用户名**: admin
- **密码**: 123456

管理员登录地址：https://test.dumpipa.com/admin/login

### API Token 申请

如需API Token，请访问：https://www.dumpipa.com/token

## 📖 详细文档

- [前端文档](./dumpipa-site-frontend/README.md)
- [后端文档](./dumpipa-site-backend/README.md)

## ✨ 功能特性

### 用户功能
- **应用搜索** - 搜索和浏览iOS应用
- **应用提取** - 提交应用脱壳任务
- **任务管理** - 查看和管理脱壳任务
- **用户中心** - 个人信息、VIP会员、金币管理
- **充值支付** - 金币充值和VIP购买

### 管理后台
- **仪表盘** - 数据统计和概览
- **任务管理** - 查看和管理脱壳任务
- **用户管理** - 用户信息和权限管理
- **VIP金币** - VIP会员和金币系统管理
- **订单管理** - 充值订单和VIP订单
- **支付设置** - 支付方式配置
- **系统设置** - 分站Logo、名称、SEO配置

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI框架**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **语言**: TypeScript

### 后端
- **运行时**: Node.js 18+
- **语言**: TypeScript
- **框架**: Express.js
- **数据库**: MySQL 5.7+
- **认证**: JWT + API Token
- **代理**: Axios (代理主站API)

## 📄 许可证

本项目采用 MIT 许可证。

## ⚠️ 免责声明

本项目仅用于学习和研究目的。使用本项目进行任何商业活动或违反相关法律法规的行为，作者不承担任何责任。
