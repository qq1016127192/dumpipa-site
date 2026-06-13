<template>
  <div class="vip-orders-container">
    <div class="page-header">
      <h2>会员订单管理</h2>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>订单状态：</label>
        <select v-model="filterStatus" @change="loadOrders()">
          <option value="">全部</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
          <option value="expired">已过期</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>

      <div class="filter-item">
        <label>用户ID：</label>
        <input 
          v-model.number="filterUserId" 
          type="number"
          placeholder="输入用户ID"
          @keyup.enter="loadOrders()"
        />
      </div>

      <button class="btn-search" @click="loadOrders()">🔍 查询</button>
      <button class="btn-reset" @click="resetFilter">🔄 重置</button>
    </div>

    <!-- 订单列表 -->
    <div class="orders-section">
      <div class="orders-stats">
        <div class="stat-item">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">当前页订单</div>
          <div class="stat-value">{{ orders.length }}</div>
        </div>
      </div>

      <div class="orders-table">
        <table>
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户</th>
              <th>套餐</th>
              <th>金额</th>
              <th>时长(天)</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>支付时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="order-no">{{ order.order_no }}</td>
              <td>
                <div class="user-info">
                  <div class="username">{{ order.username }}</div>
                  <div class="user-id">ID: {{ order.user_id }}</div>
                </div>
              </td>
              <td>
                <div class="package-info">
                  {{ order.package_name }}
                </div>
              </td>
              <td class="amount">¥{{ order.price }}</td>
              <td>{{ order.duration }} 天</td>
              <td>
                <span class="status-badge" :class="order.status">
                  {{ getStatusName(order.status) }}
                </span>
              </td>
              <td>{{ formatDateTime(order.created_at) }}</td>
              <td>{{ formatDateTime(order.paid_at) || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="orders.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无订单数据</div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="loadOrders(currentPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button 
          :disabled="currentPage >= totalPages" 
          @click="loadOrders(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getVipOrders } from '@/api/vipCoin'

// 数据
const orders = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(1)

// 筛选条件
const filterStatus = ref('')
const filterUserId = ref<number | null>(null)

// 加载订单列表
const loadOrders = async (page: number = 1) => {
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }

    if (filterStatus.value) {
      params.status = filterStatus.value
    }

    if (filterUserId.value) {
      params.user_id = filterUserId.value
    }

    const res = await getVipOrders(params)
    if (res.ok) {
      orders.value = res.orders
      currentPage.value = res.page
      total.value = res.total
      totalPages.value = res.total_pages
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载订单列表失败')
  }
}

// 重置筛选
const resetFilter = () => {
  filterStatus.value = ''
  filterUserId.value = null
  loadOrders(1)
}

// 辅助函数
const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'expired': '已过期',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.vip-orders-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    color: #666;
  }

  input,
  select {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    min-width: 150px;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }
}

.btn-search,
.btn-reset {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-search {
  background: #1890ff;
  color: white;

  &:hover {
    background: #40a9ff;
  }
}

.btn-reset {
  background: #f0f0f0;
  color: #666;

  &:hover {
    background: #e0e0e0;
  }
}

.orders-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.orders-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;

  .stat-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #1890ff;
  }
}

.orders-table {
  overflow-x: auto;
  margin-bottom: 20px;

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    th {
      background: #fafafa;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    td {
      color: #333;
      font-size: 14px;
    }

    .order-no {
      font-family: monospace;
      color: #1890ff;
      font-size: 12px;
    }

    .amount {
      color: #ff4d4f;
      font-weight: 500;
    }
  }
}

.user-info {
  .username {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .user-id {
    font-size: 12px;
    color: #999;
  }
}

.package-info {
  font-weight: 500;
}

.pay-type-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
}

.pay-type-badge {
  &.coin {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.alipay {
    background: #e6f7ff;
    color: #1890ff;
  }

  &.wechat {
    background: #f6ffed;
    color: #52c41a;
  }
}

.status-badge {
  &.pending {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.paid {
    background: #f6ffed;
    color: #52c41a;
  }

  &.expired {
    background: #f5f5f5;
    color: #999;
  }

  &.cancelled {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 15px;
  }

  .empty-text {
    font-size: 16px;
    color: #999;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;

  button {
    padding: 8px 16px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }
  }

  span {
    color: #666;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .vip-orders-container {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .filter-section {
    flex-direction: column;
    gap: 12px;
  }

  .filter-item {
    width: 100%;

    input, select {
      width: 100%;
      min-width: auto;
    }
  }

  .btn-search,
  .btn-reset {
    width: 100%;
  }

  .orders-section {
    padding: 16px;
  }

  .orders-stats {
    flex-direction: column;
    gap: 12px;
  }

  .orders-table {
    overflow-x: auto;
    
    table {
      font-size: 12px;
      min-width: 700px;

      th,
      td {
        padding: 8px;
      }
    }
  }

  .pagination {
    flex-wrap: wrap;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .vip-orders-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .orders-section {
    padding: 12px;
  }

  .orders-table table {
    font-size: 11px;
    
    th, td {
      padding: 6px;
    }
  }
}
</style>

