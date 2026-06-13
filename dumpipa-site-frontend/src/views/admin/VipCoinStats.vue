<template>
  <div class="stats-container">
    <div class="page-header">
      <h2>会员金币系统统计</h2>
      <button class="btn-refresh" @click="loadStats(true)">
        <span>🔄 刷新数据</span>
      </button>
    </div>

    <!-- 核心统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card vip-card">
        <div class="card-icon">👑</div>
        <div class="card-content">
          <div class="card-label">当前会员总数</div>
          <div class="card-value">{{ stats.vipCount || 0 }}</div>
          <div class="card-trend">
            <span class="trend-label">今日新增：</span>
            <span class="trend-value">+{{ stats.todayVip || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card coin-card">
        <div class="card-icon">🪙</div>
        <div class="card-content">
          <div class="card-label">金币总交易额</div>
          <div class="card-value">{{ formatNumber(stats.totalCoinTransaction) }}</div>
          <div class="card-trend">
            <span class="trend-label">今日消费：</span>
            <span class="trend-value">{{ formatNumber(stats.todayCoinConsume) }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card download-card">
        <div class="card-icon">📥</div>
        <div class="card-content">
          <div class="card-label">今日下载次数</div>
          <div class="card-value">{{ stats.todayDownload || 0 }}</div>
          <div class="card-desc">用户下载 IPA 的总次数</div>
        </div>
      </div>

      <div class="stat-card dump-card">
        <div class="card-icon">🔓</div>
        <div class="card-content">
          <div class="card-label">今日砸壳次数</div>
          <div class="card-value">{{ stats.todayDump || 0 }}</div>
          <div class="card-desc">用户砸壳操作的总次数</div>
        </div>
      </div>
    </div>

    <!-- 详细统计 -->
    <div class="detailed-stats">
      <div class="stats-section">
        <h3>📊 会员统计详情</h3>
        <div class="stats-content">
          <div class="stat-row">
            <span class="stat-label">当前有效会员数</span>
            <span class="stat-value highlight-blue">{{ stats.vipCount || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">今日新增会员</span>
            <span class="stat-value highlight-green">+{{ stats.todayVip || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">会员转化率</span>
            <span class="stat-value highlight-orange">{{ calculateVipRate() }}%</span>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h3>💰 金币统计详情</h3>
        <div class="stats-content">
          <div class="stat-row">
            <span class="stat-label">累计金币交易额</span>
            <span class="stat-value highlight-yellow">{{ formatNumber(stats.totalCoinTransaction) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">今日金币消费</span>
            <span class="stat-value highlight-red">{{ formatNumber(stats.todayCoinConsume) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">平均单次消费</span>
            <span class="stat-value highlight-purple">{{ calculateAvgConsume() }}</span>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h3>📈 使用统计详情</h3>
        <div class="stats-content">
          <div class="stat-row">
            <span class="stat-label">今日下载总数</span>
            <span class="stat-value highlight-blue">{{ stats.todayDownload || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">今日砸壳总数</span>
            <span class="stat-value highlight-green">{{ stats.todayDump || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">总操作次数</span>
            <span class="stat-value highlight-orange">{{ (stats.todayDownload || 0) + (stats.todayDump || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据对比图表 -->
    <div class="chart-section">
      <h3>📊 今日操作对比</h3>
      <div class="chart-container">
        <div class="chart-bar">
          <div class="bar-item">
            <div class="bar-label">下载</div>
            <div class="bar-wrapper">
              <div 
                class="bar-fill download-bar"
                :style="{ width: getBarWidth(stats.todayDownload, stats.todayDownload + stats.todayDump) }"
              ></div>
              <span class="bar-value">{{ stats.todayDownload || 0 }}</span>
            </div>
          </div>

          <div class="bar-item">
            <div class="bar-label">砸壳</div>
            <div class="bar-wrapper">
              <div 
                class="bar-fill dump-bar"
                :style="{ width: getBarWidth(stats.todayDump, stats.todayDownload + stats.todayDump) }"
              ></div>
              <span class="bar-value">{{ stats.todayDump || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 更新时间 -->
    <div class="update-time">
      <span>最后更新：{{ updateTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getVipCoinStats } from '@/api/vipCoin'

// 统计数据
const stats = ref({
  vipCount: 0,
  todayVip: 0,
  totalCoinTransaction: 0,
  todayCoinConsume: 0,
  todayDownload: 0,
  todayDump: 0
})

const updateTime = ref('')

// 加载统计数据
const loadStats = async (showMessage = false) => {
  try {
    const res = await getVipCoinStats()
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      stats.value = res.data?.stats || res.stats || stats.value
      updateTime.value = new Date().toLocaleString('zh-CN')
      if (showMessage) {
        ElMessage.success('数据刷新成功')
      }
    }
  } catch (err: any) {
    console.error('加载统计数据失败:', err)
    ElMessage.error(err.msg || '加载统计数据失败')
  }
}

// 格式化数字
const formatNumber = (num: number | string) => {
  if (!num) return '0'
  const value = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(value)) return '0'
  return value.toFixed(2)
}

// 计算会员转化率（这里需要总用户数，暂时模拟）
const calculateVipRate = () => {
  // 假设总用户数为会员数的10倍（实际应该从API获取）
  const vipCount = Number(stats.value.vipCount) || 0
  const totalUsers = vipCount * 10 || 100
  const rate = (vipCount / totalUsers) * 100
  return rate.toFixed(2)
}

// 计算平均单次消费
const calculateAvgConsume = () => {
  const todayDownload = Number(stats.value.todayDownload) || 0
  const todayDump = Number(stats.value.todayDump) || 0
  const todayCoinConsume = Number(stats.value.todayCoinConsume) || 0
  const totalOps = todayDownload + todayDump
  if (totalOps === 0) return '0'
  const avg = todayCoinConsume / totalOps
  return avg.toFixed(4)
}

// 计算柱状图宽度
const getBarWidth = (value: number | string, total: number | string) => {
  const numValue = Number(value) || 0
  const numTotal = Number(total) || 0
  if (!numTotal) return '0%'
  return `${(numValue / numTotal) * 100}%`
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.stats-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
}

.btn-refresh {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #40a9ff;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 16px;
  border: 1px solid #e5e7eb;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    font-size: 48px;
  }

  .card-content {
    flex: 1;
  }

  .card-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .card-trend,
  .card-desc {
    font-size: 12px;
    color: #666;
  }

  .trend-value {
    color: #52c41a;
    font-weight: 500;
  }

  &.vip-card .card-value {
    color: #722ed1;
  }

  &.coin-card .card-value {
    color: #fa8c16;
  }

  &.download-card .card-value {
    color: #1890ff;
  }

  &.dump-card .card-value {
    color: #52c41a;
  }
}

.detailed-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 12px;
  }
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;

  .stat-label {
    font-size: 14px;
    color: #666;
  }

  .stat-value {
    font-size: 18px;
    font-weight: bold;

    &.highlight-blue { color: #1890ff; }
    &.highlight-green { color: #52c41a; }
    &.highlight-orange { color: #fa8c16; }
    &.highlight-yellow { color: #fadb14; }
    &.highlight-red { color: #ff4d4f; }
    &.highlight-purple { color: #722ed1; }
  }
}

.chart-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: #333;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 12px;
  }
}

.chart-container {
  padding: 20px 0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 15px;

  .bar-label {
    width: 60px;
    font-size: 14px;
    color: #666;
    text-align: right;
  }

  .bar-wrapper {
    flex: 1;
    height: 40px;
    background: #f0f0f0;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 20px;
    transition: width 0.5s ease;
    position: relative;
  }

  .download-bar {
    background: linear-gradient(90deg, #1890ff, #40a9ff);
  }

  .dump-bar {
    background: linear-gradient(90deg, #52c41a, #73d13d);
  }

  .bar-value {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
}

.update-time {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  span {
    font-size: 12px;
    color: #999;
  }
}

@media (max-width: 768px) {
  .stats-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .btn-refresh {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .detailed-stats {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;

    .card-icon {
      font-size: 36px;
    }

    .card-content {
      .card-label {
        font-size: 13px;
        margin-bottom: 6px;
    }

    .card-value {
      font-size: 24px;
        margin-bottom: 6px;
      }

      .card-trend,
      .card-desc {
        font-size: 11px;
      }
    }
  }

  .stats-section {
    padding: 16px;

    h3 {
      font-size: 15px;
      margin-bottom: 16px;
    }
  }

  .stat-row {
    padding: 10px;

    .stat-label {
      font-size: 13px;
    }

    .stat-value {
      font-size: 16px;
    }
  }

  .chart-section {
    padding: 16px;

    h3 {
      font-size: 15px;
      margin-bottom: 16px;
    }
  }

  .chart-container {
    padding: 16px 0;
  }

  .bar-item {
    gap: 10px;

    .bar-label {
      width: 50px;
      font-size: 13px;
    }

    .bar-wrapper {
      height: 32px;
    }

    .bar-value {
      font-size: 13px;
      right: 10px;
    }
  }

  .update-time {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .stats-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .stat-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;

    .card-icon {
      font-size: 32px;
    }

    .card-content .card-value {
      font-size: 20px;
    }
  }

  .stats-section {
    padding: 12px;

    h3 {
      font-size: 14px;
    }
  }

  .stat-row {
    padding: 8px;

    .stat-value {
      font-size: 14px;
    }
  }

  .chart-section {
    padding: 12px;
  }

  .bar-item .bar-wrapper {
    height: 28px;
  }
}
</style>

