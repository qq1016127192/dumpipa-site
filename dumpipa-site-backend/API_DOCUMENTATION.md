# 分站 API 开发文档

## 概述

本文档描述了分站后端系统的所有 API 接口。分站拥有独立的数据库，包括用户系统、金币系统、VIP系统、订单系统等。应用数据（App Store数据）通过主站API代理获取。

**基础URL**: `http://localhost:3001/api`

**认证方式**: JWT Token（Bearer Token）

---

## 通用响应格式

### 成功响应
```json
{
  "ok": 1,
  "msg": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "ok": 0,
  "msg": "错误信息"
}
```

---

## 1. 认证接口 (Auth)

### 1.1 用户注册
- **接口**: `POST /api/auth/register`
- **认证**: 无需认证
- **请求参数**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

### 1.2 用户登录
- **接口**: `POST /api/auth/login`
- **认证**: 无需认证
- **请求参数**:
```json
{
  "username": "string",
  "password": "string"
}
```

### 1.3 获取当前用户信息
- **接口**: `GET /api/auth/me`
- **认证**: 需要认证

### 1.4 用户登出
- **接口**: `POST /api/auth/logout`
- **认证**: 需要认证

---

## 2. 用户管理接口 (Users)

### 2.1 获取用户列表
- **接口**: `GET /api/users`
- **认证**: 需要管理员权限
- **参数**: page, page_size, search, status

### 2.2 获取用户信息
- **接口**: `GET /api/users/:id`
- **认证**: 需要认证（本人或管理员）

### 2.3 创建用户
- **接口**: `POST /api/users`
- **认证**: 需要管理员权限

### 2.4 更新用户
- **接口**: `PUT /api/users/:id`
- **认证**: 需要管理员权限

### 2.5 删除用户
- **接口**: `DELETE /api/users/:id`
- **认证**: 需要管理员权限

---

## 3. 任务管理接口 (Tasks)

### 3.1 获取全站任务列表
- **接口**: `GET /api/tasks`
- **认证**: 无需认证（公开）

### 3.2 获取我的任务列表
- **接口**: `GET /api/tasks/my`
- **认证**: 可选认证

### 3.3 创建任务
- **接口**: `POST /api/tasks`
- **认证**: 需要认证

### 3.4 获取任务详情
- **接口**: `GET /api/tasks/:id`
- **认证**: 无需认证

### 3.5 取消任务
- **接口**: `POST /api/tasks/:id/cancel`
- **认证**: 需要认证

### 3.6 重试任务
- **接口**: `POST /api/tasks/:id/retry`
- **认证**: 需要认证

---

## 4. 应用相关接口 (Apps)

### 4.1 获取下载链接
- **接口**: `GET /api/apps/download-url`
- **认证**: 需要认证
- **参数**: task_id

---

## 5. 订单系统接口 (Orders)

### 5.1 创建金币充值订单
- **接口**: `POST /api/orders/coin/create`
- **认证**: 需要认证
- **参数**: package_id

### 5.2 创建支付请求
- **接口**: `POST /api/orders/payment/create`
- **认证**: 需要认证
- **参数**: order_no, payment_method_id

### 5.3 获取订单状态
- **接口**: `GET /api/orders/status`
- **认证**: 需要认证
- **参数**: order_no

### 5.4 获取我的订单列表
- **接口**: `GET /api/orders/my`
- **认证**: 需要认证

---

## 6. 支付系统接口 (Payment)

### 6.1 获取支付方式列表
- **接口**: `GET /api/payment/methods`
- **认证**: 需要认证

### 6.2 添加支付方式
- **接口**: `POST /api/payment/methods`
- **认证**: 需要认证

### 6.3 更新支付方式
- **接口**: `PUT /api/payment/methods/:id`
- **认证**: 需要认证

### 6.4 删除支付方式
- **接口**: `DELETE /api/payment/methods/:id`
- **认证**: 需要认证

### 6.5 更新支付配置
- **接口**: `PUT /api/payment/configs/:payment_method_id`
- **认证**: 需要认证

### 6.6 获取支付统计
- **接口**: `GET /api/payment/stats`
- **认证**: 需要认证

### 6.7 支付回调通知
- **接口**: `POST /api/payment/notify`
- **认证**: 无需认证（支付平台调用）

---

## 7. 会员和金币系统接口 (VIP Coin)

### 7.1 获取系统配置
- **接口**: `GET /api/vip-coin/config`
- **认证**: 需要认证

### 7.2 更新系统配置
- **接口**: `PUT /api/vip-coin/config`
- **认证**: 需要管理员权限

### 7.3 获取VIP套餐列表
- **接口**: `GET /api/vip-coin/vip-packages`
- **认证**: 无需认证

### 7.4 创建VIP套餐
- **接口**: `POST /api/vip-coin/vip-packages`
- **认证**: 需要管理员权限

### 7.5 更新VIP套餐
- **接口**: `PUT /api/vip-coin/vip-packages/:id`
- **认证**: 需要管理员权限

### 7.6 删除VIP套餐
- **接口**: `DELETE /api/vip-coin/vip-packages/:id`
- **认证**: 需要管理员权限

### 7.7 获取金币充值套餐列表
- **接口**: `GET /api/vip-coin/coin-packages`
- **认证**: 无需认证

### 7.8 创建金币充值套餐
- **接口**: `POST /api/vip-coin/coin-packages`
- **认证**: 需要管理员权限

### 7.9 创建会员订单
- **接口**: `POST /api/vip-coin/create-vip-order`
- **认证**: 需要认证

### 7.10 计算所需金币
- **接口**: `POST /api/vip-coin/calculate-coin`
- **认证**: 需要认证

### 7.11 获取我的金币交易记录
- **接口**: `GET /api/vip-coin/transactions`
- **认证**: 需要认证

---

## 8. 管理后台接口 (Admin)

### 8.1 获取仪表盘统计数据
- **接口**: `GET /api/admin/dashboard`
- **认证**: 需要管理员权限

### 8.2 获取任务列表（管理员）
- **接口**: `GET /api/admin/tasks`
- **认证**: 需要管理员权限

### 8.3 取消任务
- **接口**: `POST /api/admin/tasks/:id/cancel`
- **认证**: 需要认证

### 8.4 删除任务
- **接口**: `DELETE /api/admin/tasks/:id`
- **认证**: 需要认证

---

## 9. 设置管理接口 (Settings)

### 9.1 获取可用地区列表
- **接口**: `GET /api/settings/available-countries`
- **认证**: 无需认证

### 9.2 获取SEO设置（公开）
- **接口**: `GET /api/settings/seo/public`
- **认证**: 无需认证

### 9.3 获取系统设置
- **接口**: `GET /api/settings`
- **认证**: 需要管理员权限

### 9.4 更新系统设置
- **接口**: `PUT /api/settings/:type`
- **认证**: 需要管理员权限

---

## 10. 分站配置接口 (Site Config)

### 10.1 获取分站配置
- **接口**: `GET /api/site-config`
- **认证**: 需要管理员权限

### 10.2 更新分站配置
- **接口**: `PUT /api/site-config`
- **认证**: 需要管理员权限

### 10.3 获取主站Token
- **接口**: `GET /api/site-config/main-site-token`
- **认证**: 需要管理员权限

### 10.4 更新主站Token
- **接口**: `PUT /api/site-config/main-site-token`
- **认证**: 需要管理员权限

### 10.5 测试主站连接
- **接口**: `GET /api/site-config/test-connection`
- **认证**: 需要管理员权限

---

## 11. 公告管理接口 (Announcements)

### 11.1 获取公告列表
- **接口**: `GET /api/announcements`
- **认证**: 无需认证

### 11.2 获取所有公告（管理员）
- **接口**: `GET /api/announcements/admin/all`
- **认证**: 需要管理员权限

### 11.3 创建公告
- **接口**: `POST /api/announcements/admin`
- **认证**: 需要管理员权限

### 11.4 更新公告
- **接口**: `PUT /api/announcements/admin/:id`
- **认证**: 需要管理员权限

### 11.5 删除公告
- **接口**: `DELETE /api/announcements/admin/:id`
- **认证**: 需要管理员权限

---

## 错误码说明

| HTTP状态码 | 说明 |
|-----------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或Token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证说明

### JWT Token 格式
```
Authorization: Bearer {jwt_token}
```

### Token 有效期
默认7天（可通过环境变量 `JWT_EXPIRES_IN` 配置）

---

## 注意事项

1. **分站独立性**: 分站拥有独立的数据库，用户、订单、支付等数据与主站分离
2. **主站代理**: 应用数据和任务数据通过主站API获取，需要配置有效的主站Token
3. **任务关联**: 用户创建的任务会在分站数据库 `user_tasks` 表中记录与主站任务的关联关系
4. **安全考虑**: 公开的任务列表接口已移除下载链接字段，防止未授权访问
5. **支付回调**: 支付回调接口由支付平台调用，无需认证，但会验证签名
6. **分页参数**: 所有列表接口支持分页，默认页码为1，每页数量根据接口不同有默认值

