<template>
  <div class="task-card-content">
    <!-- 上半部分：应用图标和信息 -->
    <div class="task-header">
      <div class="task-icon-container">
        <img class="task-icon" :src="task.icon_url || defaultIcon" :alt="task.app_name" />
      </div>
      <div class="task-info">
        <div class="task-name">{{ task.app_name || '未知应用' }}</div>
        <div class="task-meta-line">
          <span class="task-region">{{ getRegionFlag(task.country) }}</span>
          <span class="task-size-version">
          <span>{{ formatSize(task.size || task.file_size || task.size_formatted) || '--' }}</span>
          <span>/</span>
          <span>v{{ getDisplayVersion(task) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 下半部分：官方标识和下载按钮 -->
    <div class="task-footer">
      <div class="official-badge">
        <i class="fa fa-shield"></i>
      </div>
      <div class="download-button">
        <i class="fa fa-cloud-download"></i>
      </div>
    </div>

    <!-- 我的提取任务的操作按钮 (如果需要) -->
    <div v-if="showActions && task.alist_url" class="task-actions">
      <el-button size="small" type="primary" @click.stop="handleDownload(task.alist_url)">
        <i class="fa fa-download mr-1"></i>
        下载
      </el-button>
      <el-button size="small" @click.stop="handleCopy(task.alist_url)">
        <i class="fa fa-copy mr-1"></i>
        复制链接
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

interface Props {
  task: any
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showActions: false,
})

const defaultIcon = 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4b/ad/ce/4badce41-6379-92a4-26b9-6a6456abbf2b/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg'

const getRegionFlag = (country: string) => {
  const flags: Record<string, string> = {
    cn: '🇨🇳',
    us: '🇺🇸',
    jp: '🇯🇵',
    kr: '🇰🇷',
    hk: '🇭🇰',
    tw: '🇹🇼',
  }
  return flags[country?.toLowerCase()] || '🌐'
}

const getDisplayVersion = (task: any): string => {
  // 获取有效的版本号，过滤无效值
  const version = task.display_version || task.real_version || task.version
  if (!version) return '--'
  
  // 过滤无效的版本号值
  const invalidValues = ['unknown', '未知', 'null', 'undefined', '']
  if (invalidValues.includes(String(version).toLowerCase()) || String(version).trim() === '') {
    return '--'
  }
  
  return String(version)
}

const formatSize = (size: any) => {
  if (!size) return ''
  // 如果已经是格式化后的字符串（包含 MB、GB、KB），直接返回
  if (typeof size === 'string' && (size.includes('MB') || size.includes('GB') || size.includes('KB') || size.includes('B'))) {
    return size
  }
  // 如果是数字，进行格式化
  if (typeof size === 'number') {
    const kb = size / 1024
    const mb = kb / 1024
    const gb = mb / 1024
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`
    } else if (mb >= 1) {
      return `${mb.toFixed(2)} MB`
    } else if (kb >= 1) {
      return `${kb.toFixed(2)} KB`
    } else {
      return `${size} B`
    }
  }
  // 其他情况（如已经是字符串但不包含单位），尝试解析
  const numSize = parseFloat(size)
  if (!isNaN(numSize)) {
    const kb = numSize / 1024
    const mb = kb / 1024
    const gb = mb / 1024
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`
    } else if (mb >= 1) {
      return `${mb.toFixed(2)} MB`
    } else if (kb >= 1) {
      return `${kb.toFixed(2)} KB`
    } else {
      return `${numSize} B`
    }
  }
  return size.toString()
}

const handleDownload = (url: string) => {
  window.open(url, '_blank')
}

const handleCopy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/* 卡片内容容器 - 不添加额外padding */
.task-card-content {
  width: 100%;
}

/* 上半部分：图标和信息 */
.task-header {
  display: flex;
  align-items: center;
  padding-right: 16px;
}

.task-icon-container {
  margin-right: 12px;
  flex-shrink: 0;
}

.task-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #F3F4F6;
  object-fit: cover;
  object-position: center center;
  transition: all 0.2s ease;
}

.task-card-content:hover .task-icon {
  transform: scale(1.05);
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  color: #1F2937;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-card-content:hover .task-name {
  color: #4F46E5;
}

.task-meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.task-region {
  color: #6B7280;
  font-size: 12px;
  line-height: 1;
}

.task-size-version {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #E5E7EB;
  margin: 12px 16px 8px 0;
}

/* 下半部分：官方标识和下载按钮 */
.task-footer {
  display: flex;
  margin-top: 6px;
  align-items: center;
  margin-bottom: 6px;
  padding-right: 16px;
}

.official-badge {
  display: flex;
  align-items: center;
}

.official-badge i {
  font-size: 16px;
  color: #2EA44F;
}

.download-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  color: #496AF2;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.download-button i {
  margin-right: 6px;
  display: flex;
  align-items: center;
}

.download-button:hover {
  background-color: #F3F4F6;
}

/* 我的提取任务的操作按钮 */
.task-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .task-icon {
    width: 48px;
    height: 48px;
  }
  
  .task-name {
    font-size: 15px;
  }
  
  .download-button {
    font-size: 13px;
    padding: 4px 10px;
  }
}
</style>


