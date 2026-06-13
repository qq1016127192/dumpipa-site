<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2>用户金币和会员管理</h2>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          v-model="searchKeyword" 
          type="text"
          placeholder="搜索用户名、邮箱或ID..."
          @keyup.enter="loadUserList()"
        />
        <button @click="loadUserList()">🔍 搜索</button>
        <button @click="clearSearch" class="btn-secondary">清空</button>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div class="users-table-section">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>金币</th>
            <th>会员状态</th>
            <th>会员到期</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email || '-' }}</td>
            <td class="coins">🪙 {{ user.coins }}</td>
            <td>
              <span class="vip-badge" :class="{ 'is-vip': isVip(user) }">
                {{ isVip(user) ? '👑 会员' : '普通' }}
              </span>
            </td>
            <td>{{ isVip(user) ? formatDate(user.vip_expires_at) : '-' }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button class="btn-view" @click="viewUserDetail(user.id)">查看详情</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="userList.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">暂无用户数据</div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="loadUserList(currentPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条
        </span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="loadUserList(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div v-if="userInfo" class="user-card">
      <div class="user-header">
        <div class="user-basic">
          <h3>{{ userInfo.username }}</h3>
          <span class="user-id">ID: {{ userInfo.id }}</span>
          <span 
            class="vip-badge" 
            :class="{ 'is-vip': isUserVip }"
          >
            {{ isUserVip ? '👑 会员' : '普通用户' }}
          </span>
        </div>
        <div class="user-coins">
          <span class="emoji">🪙</span>
          <span class="amount">{{ userInfo.coins }}</span>
          <span class="label">金币</span>
        </div>
      </div>

      <div class="user-details">
        <div class="detail-item">
          <label>邮箱：</label>
          <span>{{ userInfo.email || '未设置' }}</span>
        </div>
        <div class="detail-item" v-if="isUserVip">
          <label>会员等级：</label>
          <span>{{ userInfo.vip_level }}</span>
        </div>
        <div class="detail-item" v-if="isUserVip">
          <label>会员到期：</label>
          <span>{{ formatDate(userInfo.vip_expires_at) }}</span>
        </div>
        <div class="detail-item">
          <label>注册时间：</label>
          <span>{{ formatDate(userInfo.created_at) }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn-action" @click="showRechargeDialog">
          💰 充值金币
        </button>
        <button class="btn-action" @click="showSetVipDialog">
          👑 设置会员
        </button>
        <button class="btn-action" @click="viewTransactions">
          📊 交易记录
        </button>
        <button class="btn-action" @click="viewUsage">
          📈 使用统计
        </button>
      </div>
    </div>

    <!-- 今日使用统计 -->
    <div v-if="dailyUsage && userInfo" class="usage-card">
      <h3>今日使用统计</h3>
      <div class="usage-grid">
        <div class="usage-item">
          <div class="usage-label">下载次数</div>
          <div class="usage-value">{{ dailyUsage.download_count || 0 }}</div>
        </div>
        <div class="usage-item">
          <div class="usage-label">砸壳次数</div>
          <div class="usage-value">{{ dailyUsage.dump_count || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- 交易记录 -->
    <div v-if="showTransactions && transactions.length > 0" class="transactions-section">
      <h3>金币交易记录</h3>
      <div class="transactions-list">
        <div 
          v-for="trans in transactions" 
          :key="trans.id" 
          class="transaction-item"
          :class="trans.amount > 0 ? 'income' : 'expense'"
        >
          <div class="trans-info">
            <div class="trans-type">{{ getTransactionType(trans.type) }}</div>
            <div class="trans-reason">{{ trans.reason || '-' }}</div>
            <div class="trans-time">{{ formatDateTime(trans.created_at) }}</div>
          </div>
          <div class="trans-amount">
            <span class="amount">{{ trans.amount > 0 ? '+' : '' }}{{ trans.amount }}</span>
            <span class="balance">余额: {{ trans.balance_after }}</span>
          </div>
        </div>
      </div>

      <div class="pagination">
        <button 
          :disabled="transPage === 1" 
          @click="loadTransactions(transPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ transPage }} / {{ transTotalPages }} 页</span>
        <button 
          :disabled="transPage >= transTotalPages" 
          @click="loadTransactions(transPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 充值金币对话框 -->
    <div v-if="showRecharge" class="dialog-overlay" @click.self="closeDialogs">
      <div class="dialog">
        <div class="dialog-header">
          <h3>充值金币</h3>
          <button class="btn-close" @click="closeDialogs">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>充值金额 *</label>
            <input 
              v-model.number="rechargeAmount" 
              type="number" 
              step="0.01"
              min="0"
              placeholder="请输入充值金额"
            />
          </div>
          <div class="form-group">
            <label>充值原因</label>
            <input 
              v-model="rechargeReason" 
              type="text"
              placeholder="例如：活动赠送、补偿等"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialogs">取消</button>
          <button class="btn-submit" @click="confirmRecharge">确定充值</button>
        </div>
      </div>
    </div>

    <!-- 设置会员对话框 -->
    <div v-if="showSetVip" class="dialog-overlay" @click.self="closeDialogs">
      <div class="dialog">
        <div class="dialog-header">
          <h3>设置会员</h3>
          <button class="btn-close" @click="closeDialogs">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>会员等级 *</label>
            <select v-model.number="vipLevel">
              <option :value="1">月度会员（等级1）</option>
              <option :value="2">季度会员（等级2）</option>
              <option :value="3">年度会员（等级3）</option>
            </select>
          </div>
          <div class="form-group">
            <label>有效天数 *</label>
            <input 
              v-model.number="vipDuration" 
              type="number"
              min="1"
              placeholder="30"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="closeDialogs">取消</button>
          <button class="btn-submit" @click="confirmSetVip">确定设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getUserCoinTransactions, 
  rechargeCoin, 
  setUserVip, 
  getDailyUsage 
} from '@/api/vipCoin'
import { getUserInfo, getUserList } from '@/api/user'

// 用户列表
const userList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(1)
const searchKeyword = ref('')

// 搜索
const searchUserId = ref<number | null>(null)
const userInfo = ref<any>(null)

// 今日使用统计
const dailyUsage = ref<any>(null)

// 交易记录
const showTransactions = ref(false)
const transactions = ref<any[]>([])
const transPage = ref(1)
const transTotalPages = ref(1)

// 对话框
const showRecharge = ref(false)
const showSetVip = ref(false)
const rechargeAmount = ref(0)
const rechargeReason = ref('')
const vipLevel = ref(1)
const vipDuration = ref(30)

// 计算属性
const isUserVip = ref(false)

// 加载用户列表
const loadUserList = async (page: number = 1) => {
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }

    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }

    const res = await getUserList(params)
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      userList.value = res.data?.users || res.users || []
      currentPage.value = res.data?.page || res.page || 1
      total.value = res.data?.total || res.total || 0
      totalPages.value = res.data?.total_pages || res.total_pages || 1
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载用户列表失败')
  }
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  loadUserList(1)
}

// 判断是否是会员
const isVip = (user: any) => {
  return user.is_vip && user.vip_expires_at && new Date(user.vip_expires_at) > new Date()
}

// 查看用户详情
const viewUserDetail = async (userId: number) => {
  try {
    const res = await getUserInfo(userId)
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      const user = res.data?.user || res.user
      if (user) {
        userInfo.value = user
        isUserVip.value = isVip(user)
        
        // 加载今日使用统计
        loadDailyUsage()
        
        // 滚动到详情区域
        setTimeout(() => {
          document.querySelector('.user-card')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载用户信息失败')
  }
}

// 搜索用户
const searchUser = async () => {
  if (!searchUserId.value) {
    ElMessage.warning('请输入用户ID')
    return
  }

  try {
    // 这里需要创建一个获取用户信息的API
    // 暂时模拟数据
    const res = await getUserInfo(searchUserId.value)
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      const user = res.data?.user || res.user
      if (user) {
        userInfo.value = user
        isUserVip.value = user.is_vip && 
          user.vip_expires_at && 
          new Date(user.vip_expires_at) > new Date()
        
        // 加载今日使用统计
        loadDailyUsage()
      }
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '获取用户信息失败')
  }
}

// 加载今日使用统计
const loadDailyUsage = async () => {
  if (!userInfo.value) return

  try {
    const res = await getDailyUsage(userInfo.value.id)
    if (res.ok === 1) {
      // 兼容响应格式：可能在 data 字段中，也可能直接在顶层
      dailyUsage.value = res.data?.usage || res.usage || null
    }
  } catch (err: any) {
    console.error('加载使用统计失败:', err)
  }
}

// 查看交易记录
const viewTransactions = () => {
  showTransactions.value = true
  loadTransactions(1)
}

// 加载交易记录
const loadTransactions = async (page: number) => {
  if (!userInfo.value) return

  try {
    const res = await getUserCoinTransactions(userInfo.value.id, page, 10)
    if (res.ok) {
      transactions.value = res.transactions
      transPage.value = res.page
      transTotalPages.value = res.total_pages
    }
  } catch (err: any) {
    ElMessage.error(err.msg || '加载交易记录失败')
  }
}

// 显示充值对话框
const showRechargeDialog = () => {
  rechargeAmount.value = 0
  rechargeReason.value = ''
  showRecharge.value = true
}

// 确认充值
const confirmRecharge = async () => {
  if (!userInfo.value) return
  if (rechargeAmount.value <= 0) {
    ElMessage.warning('请输入有效的充值金额')
    return
  }

  try {
    await rechargeCoin({
      user_id: userInfo.value.id,
      amount: rechargeAmount.value,
      reason: rechargeReason.value || '管理员充值'
    })
    ElMessage.success('充值成功')
    closeDialogs()
    searchUser() // 刷新用户信息
  } catch (err: any) {
    ElMessage.error(err.msg || '充值失败')
  }
}

// 显示设置会员对话框
const showSetVipDialog = () => {
  vipLevel.value = 1
  vipDuration.value = 30
  showSetVip.value = true
}

// 确认设置会员
const confirmSetVip = async () => {
  if (!userInfo.value) return
  if (vipDuration.value <= 0) {
    ElMessage.warning('请输入有效的天数')
    return
  }

  try {
    await setUserVip({
      user_id: userInfo.value.id,
      vip_level: vipLevel.value,
      duration_days: vipDuration.value
    })
    ElMessage.success('会员设置成功')
    closeDialogs()
    searchUser() // 刷新用户信息
  } catch (err: any) {
    ElMessage.error(err.msg || '设置失败')
  }
}

// 关闭对话框
const closeDialogs = () => {
  showRecharge.value = false
  showSetVip.value = false
}

// 查看使用统计
const viewUsage = () => {
  loadDailyUsage()
}

// 辅助函数
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getTransactionType = (type: string) => {
  const types: Record<string, string> = {
    'charge': '充值',
    'consume': '消费',
    'reward': '奖励',
    'refund': '退款'
  }
  return types[type] || type
}

// 页面加载时获取用户列表
onMounted(() => {
  loadUserList()
})
</script>

<style scoped lang="scss">
.user-management-container {
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

.search-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-box {
  display: flex;
  gap: 10px;
  max-width: 600px;

  input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }

  button {
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

    &.btn-secondary {
      background: #fff;
      color: #666;
      border: 1px solid #d9d9d9;

      &:hover {
        background: #fafafa;
        border-color: #40a9ff;
        color: #40a9ff;
      }
    }
  }
}

.users-table-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.users-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #fafafa;

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e8e8e8;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;

      &:hover {
        background: #fafafa;
      }
    }

    td {
      padding: 12px;
      color: #666;

      &.coins {
        font-weight: 600;
        color: #f59e0b;
      }
    }
  }
}

.vip-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #e8e8e8;
  color: #666;

  &.is-vip {
    background: #fbbf24;
    color: #78350f;
  }
}

.btn-view {
  padding: 6px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #40a9ff;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  button {
    padding: 8px 16px;
    background: #fff;
    color: #666;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(:disabled) {
      background: #fafafa;
      border-color: #40a9ff;
      color: #40a9ff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .page-info {
    color: #666;
    font-size: 14px;
  }
}

.user-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.user-basic {
  display: flex;
  align-items: center;
  gap: 15px;

  h3 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }

  .user-id {
    padding: 4px 12px;
    background: #f0f0f0;
    border-radius: 12px;
    font-size: 12px;
    color: #666;
  }

  .vip-badge {
    padding: 4px 12px;
    background: #f0f0f0;
    color: #999;
    border-radius: 12px;
    font-size: 12px;

    &.is-vip {
      background: #ec4899;
      color: white;
    }
  }
}

.user-coins {
  display: flex;
  align-items: center;
  gap: 8px;

  .emoji {
    font-size: 24px;
  }

  .amount {
    font-size: 24px;
    font-weight: bold;
    color: #fa8c16;
  }

  .label {
    font-size: 14px;
    color: #999;
  }
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  gap: 10px;

  label {
    color: #999;
    font-size: 14px;
  }

  span {
    color: #333;
    font-size: 14px;
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
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

.usage-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #333;
  }
}

.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.usage-item {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  text-align: center;

  .usage-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 10px;
  }

  .usage-value {
    font-size: 28px;
    font-weight: bold;
    color: #1890ff;
  }
}

.transactions-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #333;
  }
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 4px solid #52c41a;

  &.expense {
    border-left-color: #ff4d4f;
  }
}

.trans-info {
  .trans-type {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 5px;
  }

  .trans-reason {
    font-size: 12px;
    color: #999;
    margin-bottom: 5px;
  }

  .trans-time {
    font-size: 12px;
    color: #ccc;
  }
}

.trans-amount {
  text-align: right;

  .amount {
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: #52c41a;
  }

  .balance {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
}

.transaction-item.expense .trans-amount .amount {
  color: #ff4d4f;
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

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;

  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #333;
  }
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
  }

  input,
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel,
.btn-submit {
  padding: 8px 20px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.btn-submit {
  background: #1890ff;
  color: white;
  border-color: #1890ff;

  &:hover {
    background: #40a9ff;
  }
}

/* 移动端自适应 */
@media (max-width: 768px) {
  .user-management-container {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .search-box {
    flex-direction: column;
    
    input {
      width: 100%;
    }

    button {
      width: 100%;
    }
  }

  .users-table-section {
    padding: 16px;
    overflow-x: auto;
  }

  .users-table {
    min-width: 700px;
    
    th, td {
      padding: 8px;
      font-size: 12px;
    }
  }

  .user-card {
    padding: 16px;
  }

  .user-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .user-details {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .usage-card,
  .transactions-section {
    padding: 16px;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }

  .usage-value {
    font-size: 24px;
  }

  .dialog {
    width: 90%;
    max-width: 90%;
  }

  .dialog-body {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .user-management-container {
    padding: 8px;
  }

  .page-header h2 {
    font-size: 18px;
  }

  .users-table {
    min-width: 600px;
    
    th, td {
      padding: 6px;
      font-size: 11px;
    }
  }

  .user-card {
    padding: 12px;
  }

  .usage-card h3,
  .transactions-section h3 {
    font-size: 16px;
  }

  .usage-value {
    font-size: 20px;
  }

  .dialog {
    width: 95%;
  }

  .dialog-header {
    padding: 16px;
  }

  .dialog-header h3 {
    font-size: 16px;
  }

  .form-group label {
    font-size: 13px;
  }

  .dialog-footer {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
}
</style>

