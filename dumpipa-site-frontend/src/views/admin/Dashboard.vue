<template>
  <div class="admin-dashboard">
    <h1 class="page-title">管理后台总览</h1>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon">
          <i class="fa fa-tasks"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTasks }}</div>
          <div class="stat-label">总任务数</div>
          <div class="stat-trend positive">
            <i class="fa fa-arrow-up"></i> +12.5%
          </div>
        </div>
      </div>

      <div class="stat-card stat-success">
        <div class="stat-icon">
          <i class="fa fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-trend positive">
            <i class="fa fa-arrow-up"></i> +8.2%
          </div>
        </div>
      </div>

      <div class="stat-card stat-info">
        <div class="stat-icon">
          <i class="fa fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.successRate }}%</div>
          <div class="stat-label">成功率</div>
          <div class="stat-trend positive">
            <i class="fa fa-arrow-up"></i> +2.1%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表和列表 -->
    <div class="content-grid">
      <!-- 最近任务 -->
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">最近任务</h2>
          <el-button size="small" @click="$router.push('/admin/tasks')">
            查看全部
          </el-button>
        </div>
        <div class="task-list">
          <div v-for="task in recentTasks" :key="task.id" class="task-item">
            <div class="task-item-icon">
              <img :src="task.icon_url" :alt="task.app_name">
            </div>
            <div class="task-item-info">
              <div class="task-item-name">{{ task.app_name }}</div>
              <div class="task-item-meta">{{ task.bundle_id }}</div>
            </div>
            <el-tag :type="getStatusType(task.status)" size="small">
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>
          <el-empty v-if="recentTasks.length === 0" description="暂无任务" />
        </div>
      </div>

      <!-- 系统状态 -->
      <div class="content-card">
        <div class="card-header">
          <h2 class="card-title">系统状态</h2>
          <el-button size="small" @click="refreshSystemStatus">
            <i class="fa fa-sync-alt"></i>
          </el-button>
        </div>
        <div class="system-status">
          <div class="status-item">
            <div class="status-label">
              <i class="fa fa-microchip"></i>
              CPU 使用率
            </div>
            <div class="status-value">{{ systemStatus.cpu }}%</div>
            <el-progress :percentage="systemStatus.cpu" :stroke-width="8" />
          </div>
          <div class="status-item">
            <div class="status-label">
              <i class="fa fa-memory"></i>
              内存使用率
            </div>
            <div class="status-value">{{ systemStatus.memory }}%</div>
            <el-progress :percentage="systemStatus.memory" :stroke-width="8" color="#f59e0b" />
          </div>
          <div class="status-item">
            <div class="status-label">
              <i class="fa fa-hdd"></i>
              磁盘使用率
            </div>
            <div class="status-value">{{ systemStatus.disk }}%</div>
            <el-progress :percentage="systemStatus.disk" :stroke-width="8" color="#ef4444" />
          </div>
          <div class="status-item">
            <div class="status-label">
              <i class="fa fa-network-wired"></i>
              网络状态
            </div>
            <div class="status-value">
              <el-tag :type="systemStatus.network === 'online' ? 'success' : 'danger'" size="small">
                {{ systemStatus.network === 'online' ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api/admin'

const stats = ref({
  totalTasks: 0,
  activeUsers: 0,
  successRate: 0,
})

const systemStatus = ref({
  cpu: 0,
  memory: 0,
  disk: 0,
  network: 'online',
})

const recentTasks = ref<any[]>([])

const fetchDashboardData = async () => {
  try {
    const res = await getDashboardStats()
    if (res.ok === 1) {
      stats.value = res.stats || stats.value
      recentTasks.value = res.recentTasks || []
      systemStatus.value = res.systemStatus || systemStatus.value
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
  }
}

const refreshSystemStatus = () => {
  fetchDashboardData()
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    queued: 'info',
    running: 'primary',
    uploading: 'success',
    done: 'success',
    error: 'danger',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    queued: '等待中',
    running: '进行中',
    uploading: '上传中',
    done: '已完成',
    error: '失败',
  }
  return texts[status] || status
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #e5e7eb;
}

.stat-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6b7280;
}

.stat-primary .stat-icon {
  color: #3B82F6;
}

.stat-success .stat-icon {
  color: #10B981;
}

.stat-warning .stat-icon {
  color: #F59E0B;
}

.stat-info .stat-icon {
  color: #8B5CF6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #6B7280;
}

.stat-trend.positive {
  color: #10B981;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  transition: all 0.3s;
}

.task-item:hover {
  background: #F3F4F6;
}

.task-item-icon img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.task-item-info {
  flex: 1;
  min-width: 0;
}

.task-item-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-item-meta {
  font-size: 12px;
  color: #6B7280;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.status-value {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.device-item {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
}

.device-item:hover {
  background: #F3F4F6;
  transform: translateY(-2px);
}

.device-status {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 8px;
}

.device-status.status-online {
  color: #10B981;
}

.device-status.status-offline {
  color: #EF4444;
}

.device-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 24px;
  margin: 0 auto 12px;
}

.device-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.device-meta {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.device-stat {
  font-size: 12px;
  color: #3B82F6;
  font-weight: 500;
}

/* 移动端自适应 */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 12px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-trend {
    font-size: 11px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .content-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .devices-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .device-item {
    padding: 12px;
  }

  .device-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-bottom: 8px;
  }

  .device-name {
    font-size: 13px;
  }

  .device-meta,
  .device-stat {
    font-size: 11px;
  }

  .task-item {
    padding: 10px;
    gap: 10px;
  }

  .task-item-icon img {
    width: 36px;
    height: 36px;
  }

  .task-item-name {
    font-size: 13px;
  }

  .task-item-meta {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 8px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .stat-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .devices-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .device-item {
    padding: 10px;
  }

  .card-header {
    margin-bottom: 12px;
  }
}
</style>
