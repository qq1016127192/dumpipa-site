# DumpIPA 分站前端

DumpIPA分站前端是基于Vue 3 + Vite + TypeScript构建的现代化Web应用，提供用户界面和管理后台功能。

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

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI框架**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **语言**: TypeScript

## 📋 项目结构

```
dumpipa-site-frontend/
├── src/
│   ├── api/              # API接口
│   │   ├── admin.ts      # 管理后台API
│   │   ├── app.ts        # 应用相关API
│   │   ├── auth.ts       # 认证API
│   │   ├── settings.ts   # 设置API
│   │   ├── task.ts       # 任务API
│   │   └── ...
│   ├── components/       # 公共组件
│   │   └── layout/      # 布局组件
│   ├── views/            # 页面组件
│   │   ├── admin/        # 管理后台页面
│   │   ├── app/          # 应用相关页面
│   │   ├── auth/         # 认证页面
│   │   ├── extract/      # 提取页面
│   │   ├── home/         # 首页
│   │   ├── profile/      # 用户中心
│   │   └── recharge/     # 充值页面
│   ├── stores/           # 状态管理
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型
├── public/               # 静态资源
├── index.html            # HTML入口
├── package.json          # 依赖配置
├── vite.config.ts        # Vite配置
└── tsconfig.json         # TypeScript配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5174

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 📖 开发指南

### 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
```

### 页面说明

#### 用户页面
- `/` - 首页（热门应用）
- `/extract` - 应用提取
- `/profile` - 用户中心
- `/recharge/coin` - 金币充值
- `/recharge/vip` - VIP购买

#### 管理后台
- `/admin/dashboard` - 仪表盘
- `/admin/tasks` - 任务管理
- `/admin/users` - 用户管理
- `/admin/vip-coin` - VIP金币管理
- `/admin/orders` - 订单管理
- `/admin/settings` - 系统设置

### API配置

API地址在 `src/utils/request.ts` 中配置，默认使用环境变量 `VITE_API_BASE_URL`。

## 🔐 安全说明

### 敏感文件

以下文件已通过 `.gitignore` 排除：
- `.env` - 环境变量文件
- `node_modules/` - 依赖包
- `dist/` - 构建产物

### 生产环境建议

1. **使用HTTPS**: 生产环境必须使用HTTPS
2. **配置CORS**: 确保后端允许前端域名访问
3. **环境变量**: 不要将敏感信息提交到代码仓库

## 📄 许可证

本项目采用 MIT 许可证。

## ⚠️ 免责声明

本项目仅用于学习和研究目的。使用本项目进行任何商业活动或违反相关法律法规的行为，作者不承担任何责任。
