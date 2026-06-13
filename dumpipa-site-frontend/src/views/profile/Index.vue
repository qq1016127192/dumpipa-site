<template>
  <div class="profile-page">
    <!-- 未登录状态 -->
    <div v-if="!userStore.isLoggedIn" class="login-prompt">
      <div class="login-prompt-content">
        <div class="login-icon">
          <i class="fa fa-user-circle"></i>
        </div>
        <h2 class="login-title">请先登录</h2>
        <p class="login-desc">登录后即可查看个人信息和任务记录</p>
        <div class="login-buttons">
          <router-link to="/login" class="btn-login">
            立即登录
          </router-link>
          <router-link to="/register" class="btn-register">
            注册账号
          </router-link>
        </div>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="profile-content">
      <div class="profile-container">
        <!-- 用户信息卡片 -->
        <div class="user-card boxShadow">
          <div class="user-header">
            <div class="user-avatar">
              {{ userStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <div class="user-name-row">
                <h2 class="user-name">{{ userStore.user?.username }}</h2>
                <span v-if="isVip" class="vip-badge">VIP</span>
              </div>
              <p class="user-email">{{ userStore.user?.email || '未设置邮箱' }}</p>
              <!-- 金币余额（全站免费时隐藏） -->
              <div v-if="!isFreeMode" class="coin-balance-row">
                <svg class="coin-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 896c200.298667 0 362.666667-152.810667 362.666667-341.333333s19.050667-192.533333-362.666667-192.533334S149.333333 366.144 149.333333 554.666667s162.368 341.333333 362.666667 341.333333z" fill="#FF5C00"></path>
                  <path d="M149.333333 490.666667a362.666667 341.333333 0 1 0 725.333334 0 362.666667 341.333333 0 1 0-725.333334 0Z" fill="#FFCC00"></path>
                  <path d="M192 480a320 288 0 1 0 640 0 320 288 0 1 0-640 0Z" fill="#FF7325"></path>
                  <path d="M213.333333 480a298.666667 266.666667 0 1 0 597.333334 0 298.666667 266.666667 0 1 0-597.333334 0Z" fill="#FFB329"></path>
                  <path d="M808.533333 512c-17.706667 132.181333-143.722667 234.666667-296.533333 234.666667s-278.826667-102.485333-296.533333-234.666667z" fill="#FF9B1A"></path>
                  <path d="M512 213.333333c108.074667 0 202.730667 51.242667 255.168 128H256.853333c52.437333-76.757333 147.093333-128 255.168-128z" fill="#FFCC00"></path>
                </svg>
                <span class="coin-amount">{{ userCoins.toFixed(2) }}</span>
                <span class="coin-label">金币</span>
              </div>
            </div>
          </div>

          <!-- 快捷操作标签 -->
          <div class="action-tags">
            <router-link v-if="!isFreeMode" to="/recharge/coin" class="action-tag tag-coin">
              <i class="fa fa-coins"></i>
              <span>金币充值</span>
            </router-link>
            <!-- 全站免费模式下隐藏会员开通按钮 -->
            <router-link v-if="!isFreeMode" to="/recharge/vip" class="action-tag tag-vip">
              <i class="fa fa-crown"></i>
              <span>会员开通</span>
              <span v-if="isVip" class="tag-vip-status">已开通</span>
            </router-link>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-card boxShadow">
          <router-link to="/extract" class="menu-item">
            <div class="menu-item-left">
              <i class="fa fa-download menu-icon icon-green"></i>
              <span class="menu-text">应用提取</span>
            </div>
            <i class="fa fa-chevron-right menu-arrow"></i>
          </router-link>

          <template v-if="userStore.isAdmin()">
            <div class="menu-divider"></div>
            <router-link to="/admin" class="menu-item">
              <div class="menu-item-left">
                <i class="fa fa-cog menu-icon icon-purple"></i>
                <span class="menu-text">管理后台</span>
              </div>
              <i class="fa fa-chevron-right menu-arrow"></i>
            </router-link>
          </template>
            </div>

        <!-- 退出登录按钮 -->
        <div class="logout-button-wrapper">
          <a href="javascript:;" @click="handleLogout" class="logout-button">
            <i class="fa fa-sign-out-alt"></i>
            <span>退出登录</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/user'
import { getSystemConfig } from '@/api/vipCoin'

const router = useRouter()
const userStore = useUserStore()

const userCoins = ref(0)
const userVipStatus = ref<any>(null)
const systemConfig = ref<any>({})
const isVip = computed(() => {
  if (!userVipStatus.value) return false
  const vipExpire = userVipStatus.value.vip_expires_at
  if (!vipExpire) return false
  return new Date(vipExpire) > new Date()
})

// 检查是否开启全站免费
const isFreeMode = computed(() => {
  return systemConfig.value.site_free_mode === 1 || systemConfig.value.site_free_mode === '1'
})

const fetchUserInfo = async () => {
  try {
    if (userStore.user?.id) {
      const res = await getUserInfo(userStore.user.id)
      if (res.ok === 1) {
        // 兼容两种响应格式：
        // 1. { ok: 1, user: {...} } - 直接返回
        // 2. { ok: 1, data: { user: {...} } } - 放在data字段中
        const userData = res.user || res.data?.user
        
        if (userData) {
          // 分站使用 balance，但也兼容 coins 字段
          userCoins.value = parseFloat(userData.coins || userData.balance || '0') || 0
          userVipStatus.value = userData
        } else {
          console.error('❌ Profile页面：用户数据为空:', res)
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const fetchSystemConfig = async () => {
  try {
    const res = await getSystemConfig()
    if (res.ok === 1 && res.config) {
      systemConfig.value = res.config
    }
  } catch (error) {
    console.error('获取系统配置失败:', error)
  }
}

onMounted(() => {
  // 确保在组件挂载时恢复登录状态
  if (localStorage.getItem('token') && localStorage.getItem('user')) {
    userStore.restoreFromStorage()
  }
  
  // 只有在确实登录时才获取详细信息
  if (userStore.isLoggedIn) {
    fetchUserInfo()
    fetchSystemConfig()
  } else {
    console.log('⚠️ Profile页面：用户未登录，显示登录提示')
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #F5F7FA;
  padding-top: 8px; /* 减小顶部间距 */
  padding-bottom: 80px;
}

/* 未登录提示 */
.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.login-prompt-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.login-icon {
  font-size: 80px;
  color: #D1D5DB;
  margin-bottom: 20px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 12px;
}

.login-desc {
  color: #6B7280;
  margin-bottom: 32px;
  font-size: 14px;
}

.login-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-login,
.btn-register {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-login {
  background: #4F46E5;
  color: white;
}

.btn-login:hover {
  background: #4338CA;
}

.btn-register {
  background: #E5E7EB;
  color: #374151;
}

.btn-register:hover {
  background: #D1D5DB;
}

/* 已登录内容 */
.profile-content {
  padding: 8px 0; /* 减小上下 padding */
}

.profile-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0; /* 移除左右 padding，贴着屏幕边缘 */
}

/* 通用卡片样式 - 与其他页面一致 */
.boxShadow {
  background: white;
  border-radius: 0; /* 贴着边缘，移除圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px; /* 减小间距 */
  overflow: hidden;
}

/* 用户信息卡片 */
.user-card {
  padding: 16px 20px; /* 减小上下 padding */
  border-radius: 0; /* 贴着边缘，移除圆角 */
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #1F2937;
  margin: 0;
}

.vip-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 12px;
  white-space: nowrap;
}

.user-email {
  color: #6B7280;
  font-size: 13px;
  margin: 0 0 12px 0;
}

.coin-balance-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.coin-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.coin-amount {
  font-size: 18px;
  font-weight: bold;
  color: #F59E0B;
}

.coin-label {
  font-size: 13px;
  color: #6B7280;
}

/* 快捷操作标签 */
.action-tags {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  overflow: visible; /* 允许标签溢出显示 */
}

.action-tag {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.tag-coin {
  background: #FFF;
  border: 1.5px solid #E5E7EB;
}

.tag-coin:hover {
  border-color: #F59E0B;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.tag-coin i {
  font-size: 18px;
  color: #F59E0B;
}

.tag-coin span {
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
}

.tag-vip {
  background: #FFF;
  border: 1.5px solid #E5E7EB;
}

.tag-vip:hover {
  border-color: #F59E0B;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.tag-vip i {
  font-size: 18px;
  color: #F59E0B;
}

.tag-vip span {
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
}

.tag-vip-status {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 9px;
  padding: 1px 5px;
  background: #10B981;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  line-height: 1.2;
}

/* 功能菜单 */
.menu-card {
  padding: 0;
  overflow: hidden;
  border-radius: 0; /* 贴着边缘，移除圆角 */
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s ease;
  cursor: pointer;
  background: white;
}

.menu-item:hover {
  background-color: #F9FAFB;
}

.menu-item:active {
  background-color: #F3F4F6;
}

.menu-divider {
  height: 1px;
  background-color: #E5E7EB;
  margin: 0 20px;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.icon-blue {
  color: #4F46E5;
}

.icon-green {
  color: #10B981;
}

.icon-yellow {
  color: #F59E0B;
}

.icon-purple {
  color: #9333EA;
}

.icon-red {
  color: #EF4444;
}

.icon-orange {
  color: #F97316;
}

.menu-text {
  font-size: 15px;
  font-weight: 500;
  color: #1F2937;
}

.vip-badge {
  font-size: 12px;
  color: #F97316;
  background: #FFF4E6;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.menu-arrow {
  font-size: 14px;
  color: #9CA3AF;
  flex-shrink: 0;
}

/* 退出登录按钮 */
.logout-button-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px;
  margin-top: 12px;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 90%;
  padding: 12px 32px;
  background: #F9FAFB;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.logout-button:hover {
  background: #E5E7EB;
  color: #4B5563;
}

.logout-button i {
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 640px) {
  .profile-container {
    padding: 0; /* 手机端也贴着边缘 */
  }

  .user-card {
    padding: 14px 16px; /* 进一步减小手机端 padding */
    border-radius: 0; /* 贴着边缘 */
  }

  .menu-card {
    border-radius: 0; /* 贴着边缘 */
  }

  .user-avatar {
    width: 56px;
    height: 56px;
    font-size: 20px;
    border-radius: 50%;
    -webkit-border-radius: 50%;
  }

  .user-name {
    font-size: 18px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-item {
    border-radius: 8px;
    -webkit-border-radius: 8px;
  }
}
</style>
