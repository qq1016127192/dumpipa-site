-- 添加公告显示策略字段
ALTER TABLE announcements 
ADD COLUMN `display_strategy` VARCHAR(20) DEFAULT 'always' COMMENT '显示策略: always(每次显示), once(仅显示一次), hourly(每小时显示)',
ADD COLUMN `display_interval` INT DEFAULT NULL COMMENT '显示间隔(小时)，用于hourly策略';

-- 添加索引（如果不存在则需要手动处理）
-- CREATE INDEX idx_display_strategy ON announcements(display_strategy);
