-- 创建公告表（分站）
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `title` VARCHAR(200) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `type` VARCHAR(20) DEFAULT 'info' COMMENT '公告类型: info(信息), warning(警告), error(错误), success(成功)',
  `priority` INT DEFAULT 0 COMMENT '优先级: 0=普通, 1=重要, 2=紧急',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
  `publish_at` DATETIME DEFAULT NULL COMMENT '发布时间（NULL表示立即发布）',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间（NULL表示永不过期）',
  `created_by` INT DEFAULT NULL COMMENT '创建者用户ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_status` (`status`),
  INDEX `idx_type` (`type`),
  INDEX `idx_publish_at` (`publish_at`),
  INDEX `idx_expires_at` (`expires_at`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

