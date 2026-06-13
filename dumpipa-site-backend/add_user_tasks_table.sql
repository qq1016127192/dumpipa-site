-- 用户任务表（分站数据库）
-- 用于记录分站用户提交的脱壳任务
CREATE TABLE IF NOT EXISTS `user_tasks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '分站用户ID',
  `main_task_id` INT NOT NULL COMMENT '主站任务ID',
  `bundle_id` VARCHAR(255) NOT NULL COMMENT '应用Bundle ID',
  `app_name` VARCHAR(255) DEFAULT NULL COMMENT '应用名称',
  `version` VARCHAR(100) DEFAULT NULL COMMENT 'App Store发行号',
  `real_version` VARCHAR(100) DEFAULT NULL COMMENT '真实版本号',
  `country` VARCHAR(10) DEFAULT 'cn' COMMENT '国家/地区',
  `icon_url` VARCHAR(500) DEFAULT NULL COMMENT '应用图标URL',
  `status` VARCHAR(50) DEFAULT 'queued' COMMENT '任务状态：queued, running, done, error',
  `progress` INT DEFAULT 0 COMMENT '进度（0-100）',
  `error` TEXT DEFAULT NULL COMMENT '错误信息',
  `download_url` VARCHAR(500) DEFAULT NULL COMMENT '下载链接',
  `alist_url` VARCHAR(500) DEFAULT NULL COMMENT 'Alist链接',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_main_task_id` (`main_task_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户任务表';

