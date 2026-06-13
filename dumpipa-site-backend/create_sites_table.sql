-- 分站配置表
CREATE TABLE IF NOT EXISTS `sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '分站名称',
  `domain` varchar(255) NOT NULL COMMENT '分站域名',
  `token` varchar(500) NOT NULL COMMENT '主站API Token',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '状态: 0=禁用, 1=启用',
  `description` text DEFAULT NULL COMMENT '分站描述',
  `contact_info` varchar(255) DEFAULT NULL COMMENT '联系方式',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_domain` (`domain`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分站配置表';

-- 插入默认分站（可选）
-- INSERT INTO `sites` (`name`, `domain`, `token`, `status`, `description`) 
-- VALUES ('默认分站', 'localhost', 'your_main_site_token_here', 1, '默认分站配置');

