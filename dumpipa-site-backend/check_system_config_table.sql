-- 检查并创建system_config表（如果不存在）

-- 1. 检查表是否存在，如果不存在则创建
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

-- 2. 检查是否有SEO相关的配置，如果没有则插入默认值（空值）
INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `config_group`, `config_description`) VALUES
('seo.site_title', '', 'seo', 'SEO设置: 网站标题'),
('seo.site_subtitle', '', 'seo', 'SEO设置: 副标题'),
('seo.site_description', '', 'seo', 'SEO设置: 网站描述'),
('seo.site_keywords', '', 'seo', 'SEO设置: 关键词');

-- 3. 查询当前SEO设置（用于验证）
SELECT config_key, config_value, config_group, updated_at 
FROM system_config 
WHERE config_key LIKE 'seo.%' 
ORDER BY config_key;
