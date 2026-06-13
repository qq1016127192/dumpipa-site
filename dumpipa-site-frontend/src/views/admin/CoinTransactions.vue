<template>
  <div class="coin-transactions-container">
    <div class="page-header">
      <h2>金币交易记录</h2>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>交易类型：</label>
        <select v-model="filterType" @change="loadTransactions()">
          <option value="">全部</option>
          <option value="charge">充值</option>
          <option value="consume">消费</option>
          <option value="reward">奖励</option>
          <option value="refund">退款</option>
        </select>
      </div>

      <div class="filter-item">
        <label>用户ID：</label>
        <input 
          v-model.number="filterUserId" 
          type="number"
          placeholder="输入用户ID"
          @keyup.enter="loadTransactions()"
        />
      </div>

      <div class="filter-item">
        <label>开始日期：</label>
        <input 
          v-model="filterStartDate" 
          type="date"
          @change="loadTransactions()"
        />
      </div>

      <div class="filter-item">
        <label>结束日期：</label>
        <input 
          v-model="filterEndDate" 
          type="date"
          @change="loadTransactions()"
        />
      </div>

      <button class="btn-search" @click="loadTransactions()">🔍 查询</button>
      <button class="btn-reset" @click="resetFilter">🔄 重置</button>
    </div>

    <!-- 交易记录列表 -->
    <div class="transactions-section">
      <div class="transactions-stats">
        <div class="stat-item">
          <div class="stat-label">总记录数</div>
          <div class="stat-value">{{ total }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">当前页记录</div>
          <div class="stat-value">{{ transactions.length }}</div>
        </div>
      </div>

      <div class="transactions-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>用户</th>
              <th>交易类型</th>
              <th>金币数量</th>
              <th>交易前余额</th>
              <th>交易后余额</th>
              <th>说明</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td class="tx-id">#{{ tx.id }}</td>
              <td>
                <div class="user-info">
                  <div class="username">{{ tx.username }}</div>
                  <div class="user-id">ID: {{ tx.user_id }}</div>
                </div>
              </td>
              <td>
                <span class="type-badge" :class="tx.type">
                  {{ getTypeName(tx.type) }}
                </span>
              </td>
              <td :class="tx.amount > 0 ? 'amount-positive' : 'amount-negative'">
                {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
              </td>
              <td>{{ tx.balance_before }}</td>
              <td>{{ tx.balance_after }}</td>
              <td class="description">{{ tx.description }}</td>
              <td>{{ formatDateTime(tx.created_at) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="transactions.length === 0" class="empty-state">
          <div class="empty-icon">💰</div>
          <div class="empty-text">暂无交易记录</div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="loadTransactions(currentPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button 
          :disabled="currentPage >= totalPages" 
          @click="loadTransactions(currentPage + 1)"
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
import { getAllCoinTransactions } from '@/api/vipCoin'

// 数据
const transactions = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(1)

// 筛选条件
const filterType = ref('')
const filterUserId = ref<number | null>(null)
const filterStartDate = ref('')
const filterEndDate = ref('')

// 加载交易记录列表
const loadTransactions = async (page: number = 1) => {
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }

    if (filterType.value) {
      params.type = filterType.value
    }

    if (filterUserId.value) {
      params.user_id = filterUserId.value
    }

    if (filterStartDate.value) {
      params.start_date = filterStartDate.value
    }

    if (filterEndDate.value) {
      params.end_date = filterEndDate.value
    }

    const res = await getAllCoinTransactions(params)
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      transactions.value = res.data?.transactions || res.transactions || []
      currentPage.value = res.data?.page || res.page || 1
      total.value = res.data?.total || res.total || 0
      totalPages.value = res.data?.total_pages || res.total_pages || 1
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载交易记录失败')
  }
}

// 重置筛选
const resetFilter = () => {
  filterType.value = ''
  filterUserId.value = null
  filterStartDate.value = ''
  filterEndDate.value = ''
  loadTransactions(1)
}

// 辅助函数
const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'charge': '充值',
    'consume': '消费',
    'reward': '奖励',
    'refund': '退款'
  }
  return typeMap[type] || type
}

onMounted(() => {
  loadTransactions()
})
</script>

<style scoped lang="scss">
.coin-transactions-container {
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

.transactions-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.transactions-stats {
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

.transactions-table {
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

    .tx-id {
      font-family: monospace;
      color: #1890ff;
      font-size: 12px;
    }

    .amount-positive {
      color: #52c41a;
      font-weight: 500;
    }

    .amount-negative {
      color: #ff4d4f;
      font-weight: 500;
    }

    .description {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;

  &.charge {
    background: #f6ffed;
    color: #52c41a;
  }

  &.consume {
    background: #fff1f0;
    color: #ff4d4f;
  }

  &.reward {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.refund {
    background: #e6f7ff;
    color: #1890ff;
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
  .coin-transactions-container {
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

  .transactions-section {
    padding: 16px;
  }

  .transactions-stats {
    flex-direction: column;
    gap: 12px;
  }

  .transactions-table {
    overflow-x: auto;
    
    table {
      font-size: 12px;
      min-width: 900px;

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
  .coin-transactions-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .transactions-section {
    padding: 12px;
  }

  .transactions-table table {
    font-size: 11px;
    
    th, td {
      padding: 6px;
    }
  }
}
</style>

