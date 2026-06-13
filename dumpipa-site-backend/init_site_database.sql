-- 分站独立数据库初始化脚本
-- 注意：分站有自己的数据库，用户、金币、订单等数据完全独立
-- 应用数据（App Store数据）仍然通过主站API获取

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invite_code` VARCHAR(32) DEFAULT NULL,
  `inviter_id` INT DEFAULT NULL,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `device_udid` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '状态：0禁用，1启用',
  `is_admin` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否管理员',
  `remark` TEXT COMMENT '备注信息',
  `last_login` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registration_ip` VARCHAR(45) DEFAULT NULL COMMENT '注册IP地址',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `balance` DECIMAL(10,2) DEFAULT '0.00' COMMENT '金币余额',
  `agent_level` INT NOT NULL DEFAULT '0' COMMENT '代理级别',
  `agent_discount` DECIMAL(5,2) NOT NULL DEFAULT '0.00' COMMENT '代理折扣百分比',
  `is_agent` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否为代理: 0=否, 1=是',
  `is_vip` TINYINT(1) DEFAULT '0' COMMENT '是否为VIP用户',
  `vip_level` INT DEFAULT 0 COMMENT '会员等级',
  `vip_expires_at` DATETIME DEFAULT NULL COMMENT 'VIP过期时间',
  `auto_login` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '自动登录：1启用，0禁用',
  `email_notifications` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '邮箱通知：1启用，0禁用',
  `push_notifications` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '推送通知：1启用，0禁用',
  `theme` VARCHAR(20) NOT NULL DEFAULT 'light' COMMENT '主题：light,dark,auto',
  `language` VARCHAR(10) NOT NULL DEFAULT 'zh-CN' COMMENT '语言设置',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_is_admin` (`is_admin`),
  KEY `idx_is_vip` (`is_vip`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键名',
  `config_value` TEXT COMMENT '配置值',
  `config_group` VARCHAR(50) DEFAULT 'general' COMMENT '配置分组',
  `config_description` VARCHAR(255) DEFAULT NULL COMMENT '配置描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 3. VIP套餐表
CREATE TABLE IF NOT EXISTS `vip_packages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT '套餐名称',
  `vip_level` INT DEFAULT 0 COMMENT '会员等级',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格（人民币）',
  `duration` INT NOT NULL COMMENT '有效期天数',
  `coin_price` DECIMAL(10,2) COMMENT '金币价格',
  `description` TEXT COMMENT '套餐描述',
  `features` TEXT COMMENT '特权功能，JSON格式',
  `sort_order` INT DEFAULT '0' COMMENT '排序',
  `is_popular` TINYINT(1) DEFAULT '0' COMMENT '是否热门',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `status` TINYINT(1) DEFAULT '1' COMMENT '状态',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VIP套餐表';

-- 4. 金币充值套餐表
CREATE TABLE IF NOT EXISTS `coin_packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '套餐名称',
  `coins` DECIMAL(10,2) NOT NULL COMMENT '金币数量',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格（人民币）',
  `bonus_coins` DECIMAL(10,2) DEFAULT 0 COMMENT '赠送金币',
  `description` VARCHAR(500) COMMENT '套餐描述',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='金币充值套餐表';

-- 5. 金币交易记录表
CREATE TABLE IF NOT EXISTS `coin_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` ENUM('charge','consume','refund','reward') NOT NULL COMMENT '交易类型',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
  `balance_before` DECIMAL(10,2) NOT NULL COMMENT '交易前余额',
  `balance_after` DECIMAL(10,2) NOT NULL COMMENT '交易后余额',
  `description` VARCHAR(255) NOT NULL COMMENT '交易描述',
  `related_id` INT DEFAULT NULL COMMENT '关联ID(任务ID等)',
  `related_type` VARCHAR(50) DEFAULT NULL COMMENT '关联类型',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='金币交易记录表';

-- 6. 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(50) NOT NULL COMMENT '订单号',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `product_type` VARCHAR(50) NOT NULL COMMENT '产品类型：coin_package, vip_package',
  `product_id` INT NOT NULL COMMENT '产品ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  `final_price_source` VARCHAR(32) DEFAULT NULL,
  `trade_no` VARCHAR(100) DEFAULT NULL COMMENT '支付平台交易号',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `cert_id` VARCHAR(100) DEFAULT NULL COMMENT '证书ID',
  `udid` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT,
  `payment_method_id` INT DEFAULT NULL COMMENT '支付方式ID',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 7. 支付方式表
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '支付方式名称',
  `code` VARCHAR(50) NOT NULL COMMENT '支付方式代码：alipay, wechat等',
  `type` VARCHAR(50) NOT NULL COMMENT '支付类型：alipay, wechat, bank等',
  `icon` VARCHAR(255) DEFAULT NULL COMMENT '图标URL',
  `description` TEXT COMMENT '支付方式描述',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：0禁用，1启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `config` TEXT COMMENT '配置信息，JSON格式（备用）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付方式表';

-- 7.1. 支付配置表（存储支付方式的详细配置）
CREATE TABLE IF NOT EXISTS `payment_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `payment_method_id` INT NOT NULL COMMENT '支付方式ID',
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键名',
  `config_value` TEXT COMMENT '配置值',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payment_method_key` (`payment_method_id`, `config_key`),
  KEY `idx_payment_method_id` (`payment_method_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付配置表';

-- 8. 每日使用记录表（用于统计免费次数）
CREATE TABLE IF NOT EXISTS `daily_usage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型：download, dump',
  `usage_date` DATE NOT NULL COMMENT '使用日期',
  `usage_count` INT NOT NULL DEFAULT 0 COMMENT '使用次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_action_date` (`user_id`, `action_type`, `usage_date`),
  KEY `idx_usage_date` (`usage_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每日使用记录表';

-- 9. 会员订单表
CREATE TABLE IF NOT EXISTS `vip_orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `package_id` INT NOT NULL COMMENT '套餐ID',
  `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  `package_name` VARCHAR(255) DEFAULT NULL COMMENT '套餐名称',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `duration` INT DEFAULT NULL COMMENT '有效期天数',
  `pay_type` VARCHAR(50) NOT NULL COMMENT '支付方式：coin(金币), alipay(支付宝), wechat(微信)',
  `payment_method_id` INT DEFAULT NULL COMMENT '支付方式ID',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '订单状态：pending(待支付), paid(已支付), expired(已过期), cancelled(已取消)',
  `paid_at` TIMESTAMP NULL COMMENT '支付时间',
  `expire_time` DATETIME NULL COMMENT '会员到期时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员订单记录表';

-- 10. 金币充值订单表（复用orders表，使用product_type='coin_package'）
-- 订单表已创建，这里只需要说明用法

-- 11. 应用大小范围金币配置表
CREATE TABLE IF NOT EXISTS `coin_size_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `action_type` VARCHAR(20) NOT NULL COMMENT '操作类型：download=下载，dump=砸壳',
  `min_size_mb` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '最小大小（MB）',
  `max_size_mb` DECIMAL(10,2) DEFAULT NULL COMMENT '最大大小（MB），NULL表示无上限',
  `coin_cost` DECIMAL(10,2) NOT NULL COMMENT '金币消耗',
  `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_size_range` (`min_size_mb`, `max_size_mb`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用大小范围金币配置表';

-- 插入默认大小范围配置（下载）
INSERT IGNORE INTO `coin_size_config` (`action_type`, `min_size_mb`, `max_size_mb`, `coin_cost`, `sort_order`) VALUES
('download', 0, 50, 0.01, 1),
('download', 50, 100, 0.02, 2),
('download', 100, 200, 0.05, 3),
('download', 200, 500, 0.10, 4),
('download', 500, NULL, 0.20, 5);

-- 插入默认大小范围配置（砸壳）
INSERT IGNORE INTO `coin_size_config` (`action_type`, `min_size_mb`, `max_size_mb`, `coin_cost`, `sort_order`) VALUES
('dump', 0, 50, 0.01, 1),
('dump', 50, 100, 0.02, 2),
('dump', 100, 200, 0.05, 3),
('dump', 200, 500, 0.10, 4),
('dump', 500, NULL, 0.20, 5);

-- 插入系统配置默认值
INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `config_group`, `config_description`) VALUES
('coin_download_cost', '0.01', 'coin', '普通用户下载消耗金币数'),
('coin_dump_cost', '0.01', 'coin', '普通用户砸壳消耗金币数'),
('free_download_daily', '3', 'limit', '普通用户每天免费下载次数'),
('free_dump_daily', '3', 'limit', '普通用户每天免费砸壳次数'),
('vip_download_free', '1', 'vip', '会员下载是否免费（1=是，0=否）'),
('vip_dump_free', '1', 'vip', '会员砸壳是否免费（1=是，0=否）'),
('vip_free_download_daily', '20', 'vip', '会员每天免费下载次数'),
('vip_free_dump_daily', '20', 'vip', '会员每天免费砸壳次数'),
('default_user_coins', '10.00', 'coin', '新用户注册默认金币');

-- 插入默认VIP套餐
INSERT IGNORE INTO `vip_packages` (`name`, `vip_level`, `price`, `duration`, `coin_price`, `description`, `sort_order`, `is_active`) VALUES
('月度会员', 1, 9.90, 30, 100.00, '享受1个月会员特权，免费下载砸壳', 1, 1),
('季度会员', 2, 24.90, 90, 250.00, '享受3个月会员特权，更优惠', 2, 1),
('年度会员', 3, 88.00, 365, 900.00, '享受12个月会员特权，最超值', 3, 1);

-- 插入默认金币套餐
INSERT IGNORE INTO `coin_packages` (`name`, `coins`, `price`, `bonus_coins`, `description`, `sort_order`) VALUES
('10金币', 10.00, 1.00, 0.00, '新手首充', 1),
('50金币', 50.00, 5.00, 5.00, '赠送5金币', 2),
('100金币', 100.00, 10.00, 15.00, '赠送15金币', 3),
('500金币', 500.00, 50.00, 100.00, '赠送100金币', 4),
('1000金币', 1000.00, 100.00, 300.00, '赠送300金币', 5);

