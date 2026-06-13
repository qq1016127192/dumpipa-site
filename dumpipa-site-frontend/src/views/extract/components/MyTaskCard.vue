<template>
  <div class="my-task-card-content">
    <!-- 上半部分：应用图标和信息 -->
    <div class="task-header">
      <div class="task-icon-container">
        <img class="task-icon" :src="task.icon_url || defaultIcon" :alt="task.app_name" />
      </div>
      <div class="task-info">
        <div class="task-name">{{ task.app_name || task.bundle_id || '未知应用' }}</div>
        <div class="task-meta-line">
          <span class="task-region">{{ getRegionFlag(task.country) }}</span>
          <span class="task-size-version">
          <span>v{{ getDisplayVersion(task) }}</span>
          <span>/</span>
          <span>{{ formatSize(task.size || task.file_size || task.size_formatted) || '未知' }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 进度条 (仅running状态显示) -->
    <div v-if="task.status === 'running'" class="progress-container">
      <div class="progress-bar">
        <div class="progress-inner" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 下半部分：状态信息和操作按钮 -->
    <div class="task-footer">
      <div class="task-footer-left">
        <i class="fa fa-certificate official-icon"></i>
        <span class="task-number">No.{{ taskNumber }}</span>
        <span class="status-badge" :class="`status-badge-${getStatusClass(task.status)}`">
          <i :class="`fa ${getStatusIcon(task.status)} fa-sm mr-1`"></i>
          {{ getStatusText(task.status) }}
        </span>
        <!-- 已完成状态后显示时间 -->
        <span v-if="task.status === 'done' && (task.upload_time || task.updated_at)" class="task-time-inline">
          {{ formatTime(task.upload_time || task.updated_at) }}
        </span>
      </div>
      <div class="task-footer-right">
        <!-- 失败时显示重试按钮 -->
        <button v-if="task.status === 'error'" class="action-btn retry-btn" @click.stop="handleRetry">
          <i class="fa fa-refresh"></i>重试
        </button>
        <!-- 完成时显示复制链接按钮 -->
        <button v-if="task.status === 'done' && task.alist_url" class="action-btn copy-btn" @click.stop="handleCopy">
          <i class="fa fa-copy"></i>复制链接
        </button>
        <!-- 信息图标 -->
        <i class="fa fa-info-circle info-icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  task: any
  taskNumber?: number
}

const props = withDefaults(defineProps<Props>(), {
  taskNumber: 1
})

const emit = defineEmits(['retry'])

const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iMTIiIGZpbGw9IiNGNUY1RjUiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnpNMTIgMjBjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTIgNkM4LjY5IDYgNiA4LjY5IDYgMTJzMi42OSA2IDYgNiA2LTIuNjkgNi02LTIuNjktNi02LTZ6bTAgMTBjLTIuMjEgMC00LTEuNzktNC00czEuNzktNCA0LTQgNCAxLjc5IDQgNC0xLjc5IDQtNCA0eiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4KPC9zdmc+'

const progress = computed(() => {
  return Math.max(0, Math.min(100, props.task.progress || 0))
})

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

const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    queued: 'queued',
    running: 'running',
    uploading: 'running',
    done: 'done',
    error: 'error',
    failed: 'error',
  }
  return statusMap[status] || 'queued'
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    queued: 'fa-clock-o',
    running: 'fa-spinner fa-spin',
    uploading: 'fa-cloud-upload fa-spin',
    done: 'fa-check',
    error: 'fa-exclamation-circle',
    failed: 'fa-exclamation-circle',
  }
  return iconMap[status] || 'fa-clock-o'
}

const getStatusText = (status: string) => {
  // 如果是运行中状态，根据进度和日志显示详细步骤
  if (status === 'running') {
    const taskProgress = props.task.progress || 0
    const log = (props.task.log || '').toLowerCase()
    
    // 根据日志关键词优先判断当前步骤（更准确）
    if (log.includes('上传') || log.includes('alist') || log.includes('云存储') || taskProgress >= 85) {
      return '上传中'
    } else if (log.includes('脱壳') || log.includes('trolldecrypt') || log.includes('解密') || (taskProgress >= 60 && taskProgress < 85)) {
      return '脱壳中'
    } else if (log.includes('安装') || log.includes('install') || (taskProgress >= 40 && taskProgress < 60)) {
      return '安装中'
    } else if (log.includes('传输') || log.includes('上传到设备') || (taskProgress >= 30 && taskProgress < 40)) {
      return '传输中'
    } else if (log.includes('下载ipa') || log.includes('ipatool') || (taskProgress >= 10 && taskProgress < 40)) {
      return '下载原始IPA'
    } else {
      return '提取中'
    }
  }
  
  const textMap: Record<string, string> = {
    queued: '排队中',
    uploading: '下载链接生成中',
    done: '已完成',
    error: '任务失败',
    failed: '任务失败',
  }
  return textMap[status] || status
}

const handleRetry = () => {
  emit('retry', props.task.id)
}

const handleCopy = async () => {
  try {
    const url = props.task.alist_url
    if (!url) {
      ElMessage.error('链接不存在')
      return
    }
    
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      ElMessage.success('链接已复制到剪贴板')
    } else {
      // 降级方案：使用传统方法（修复移动端上滑问题）
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.width = '2em'
      textArea.style.height = '2em'
      textArea.style.padding = '0'
      textArea.style.border = 'none'
      textArea.style.outline = 'none'
      textArea.style.boxShadow = 'none'
      textArea.style.background = 'transparent'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      document.body.appendChild(textArea)
      
      // 使用 setSelectionRange 代替 select()，避免移动端页面滚动
      if (textArea.setSelectionRange) {
        textArea.setSelectionRange(0, 99999)
      } else {
        textArea.select()
      }
      
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('链接已复制到剪贴板')
    }
  } catch (error: any) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
/* 卡片内容容器 */
.my-task-card-content {
  width: 100%;
  padding: 18px 20px;
}

/* 上半部分：图标和信息 */
.task-header {
  display: flex;
  align-items: flex-start;
}

.task-icon-container {
  margin-right: 12px;
  flex-shrink: 0;
}

.task-icon {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  object-fit: cover;
  object-position: center center;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-name {
  color: #1F2937;
  font-size: 16px;
  font-weight: 600;
  padding-right: 20px;
  word-break: break-all;
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

/* 进度条 */
.progress-container {
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #10B981;
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: progress-active 1.5s ease-in-out infinite;
}

@keyframes progress-active {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #E5E7EB;
  margin: 12px 0 6px 0;
}

/* 下半部分：状态信息和操作 */
.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-footer-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
}

.official-icon {
  font-size: 20px;
  color: #10B981;
  flex-shrink: 0;
}

.task-number {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.task-time-inline {
  font-size: 12px;
  color: #6B7280;
  margin-left: 0;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge-queued {
  background-color: #FEF3C7;
  color: #92400E;
}

.status-badge-running {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.status-badge-done {
  background-color: #D1FAE5;
  color: #065F46;
}

.status-badge-error {
  background-color: #FEE2E2;
  color: #991B1B;
}

.task-footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn {
  background-color: #FEF3C7;
  color: #92400E;
}

.retry-btn:hover {
  background-color: #FDE68A;
}

.copy-btn {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.copy-btn:hover {
  background-color: #BFDBFE;
}

.info-icon {
  font-size: 16px;
  color: #6B7280;
  cursor: pointer;
}

.info-icon:hover {
  color: #4B5563;
}

@media (max-width: 768px) {
  .my-task-card-content {
    padding: 16px;
  }

  .task-icon {
    width: 48px;
    height: 48px;
  }
  
  .task-name {
    font-size: 15px;
  }
  
  .action-btn {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  /* 移动端底部信息优化 - 确保不换行 */
  .task-footer {
    flex-wrap: nowrap;
    overflow: hidden;
    font-size: clamp(10px, 2.5vw, 12px);
  }
  
  .task-footer-left {
    gap: clamp(2px, 1vw, 4px);
    font-size: clamp(10px, 2.5vw, 12px);
    overflow: hidden;
  }
  
  .official-icon {
    font-size: clamp(14px, 3.5vw, 16px);
  }
  
  .task-number {
    font-size: clamp(9px, 2.2vw, 11px);
  }
  
  .status-badge {
    padding: clamp(2px, 0.8vw, 3px) clamp(6px, 1.5vw, 8px);
    font-size: clamp(9px, 2.2vw, 11px);
  }
  
  .task-time-inline {
    font-size: clamp(9px, 2vw, 10px);
    max-width: clamp(80px, 20vw, 100px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .task-footer-right {
    gap: clamp(2px, 1vw, 4px);
    margin-left: clamp(4px, 1.2vw, 6px);
  }
  
  .action-btn {
    font-size: clamp(10px, 2.3vw, 11px);
    padding: clamp(3px, 0.8vw, 4px) clamp(6px, 1.5vw, 8px);
  }
  
  .info-icon {
    font-size: clamp(12px, 3vw, 14px);
  }
}
</style>

