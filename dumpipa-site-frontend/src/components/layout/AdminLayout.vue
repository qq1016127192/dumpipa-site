<template>
  <div class="admin-layout">
    <!-- Mobile Menu Toggle -->
    <div class="mobile-menu-toggle" @click="toggleMobileMenu">
      <el-icon :size="24"><Menu /></el-icon>
    </div>

    <!-- Mobile Overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <div class="logo-icon">IPA</div>
          <span class="logo-text">管理后台</span>
        </router-link>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/tasks">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        
        <!-- 会员金币系统 -->
        <el-sub-menu index="/admin/vip-coin">
          <template #title>
            <el-icon><CreditCard /></el-icon>
            <span>会员金币</span>
          </template>
          <el-menu-item index="/admin/vip-coin-stats">
            <span>📊 统计数据</span>
          </el-menu-item>
          <el-menu-item index="/admin/vip-coin-settings">
            <span>⚙️ 系统配置</span>
          </el-menu-item>
          <el-menu-item index="/admin/vip-packages">
            <span>👑 会员套餐</span>
          </el-menu-item>
          <el-menu-item index="/admin/coin-packages">
            <span>🪙 金币套餐</span>
          </el-menu-item>
          <el-menu-item index="/admin/user-management">
            <span>👤 用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/vip-orders">
            <span>📋 会员订单</span>
          </el-menu-item>
          <el-menu-item index="/admin/coin-transactions">
            <span>💰 金币交易记录</span>
          </el-menu-item>
          <el-menu-item index="/admin/coin-orders">
            <span>💳 金币充值订单</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/payment-settings">
          <el-icon><Money /></el-icon>
          <span>支付设置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/site-token">
          <el-icon><Connection /></el-icon>
          <span>Token设置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button @click="backToHome" type="text">
          <el-icon><Back /></el-icon>
          返回首页
        </el-button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="top-bar-content">
          <div class="top-bar-left">
            <h1 class="page-title-text">{{ currentPageTitle }}</h1>
          </div>
          
          <div class="top-bar-right">
            <div class="user-info">
              <div class="user-avatar">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="user-name">{{ userStore.user?.username }}</div>
            </div>
            
            <el-dropdown @command="handleCommand" placement="bottom-end">
              <div class="more-menu-trigger">
                <el-icon :size="18"><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  List,
  Back,
  CreditCard,
  Money,
  Menu,
  MoreFilled,
  Connection,
  Bell,
  Setting,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const mobileMenuOpen = ref(false)

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  return route.meta.title as string || '管理后台'
})

const backToHome = () => {
  router.push('/')
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 路由变化时关闭移动菜单
router.afterEach(() => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--gray-50);
  position: relative;
}

/* 移动端菜单按钮 */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 1001;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

/* 移动端遮罩层 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--gray-200);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background-color: var(--primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--gray-800);
}

.sidebar-menu {
  flex: 1;
  border: none;
  padding: 20px 0;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--gray-200);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: 56px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.top-bar-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-bar-left {
  display: flex;
  align-items: center;
}

.page-title-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.more-menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.more-menu-trigger:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }

  .mobile-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 999;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    width: 100%;
  }

  .top-bar {
    padding: 0 12px 0 48px;
    height: 56px;
  }

  .page-title-text {
    font-size: 16px;
  }

  .user-name {
    display: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .more-menu-trigger {
    width: 32px;
    height: 32px;
  }

  .page-content {
    padding: 16px;
  }

  .logo-text {
    font-size: 16px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 0 8px 0 44px;
  }

  .page-title-text {
    font-size: 15px;
  }

  .page-content {
    padding: 12px;
  }

  .sidebar {
    width: 220px;
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

