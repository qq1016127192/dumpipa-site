import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { updatePageSeo } from '@/utils/seo'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: { title: '首页' },
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/app/Search.vue'),
        meta: { title: '搜索应用' },
      },
      {
        path: '/app/:bundleId',
        name: 'AppDetail',
        component: () => import('@/views/app/Detail.vue'),
        meta: { title: '应用详情', requiresAuth: true },
      },
      {
        path: '/app-detail',
        name: 'AppDetailPHP',
        component: () => import('@/views/app/AppDetail.vue'),
        meta: { title: '应用详情' },
      },
      {
        path: '/extract',
        name: 'Extract',
        component: () => import('@/views/extract/Index.vue'),
        meta: { title: '应用提取' },
      },
      {
        path: '/app/store-extract',
        name: 'AppStoreExtract',
        component: () => import('@/views/app/AppStoreExtract.vue'),
        meta: { title: '应用商店ipa提取', requiresAuth: true },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
        meta: { title: '个人中心' },
      },
      {
        path: '/docs/api',
        name: 'ApiDocs',
        component: () => import('@/views/docs/ApiDocs.vue'),
        meta: { title: 'API开发文档', requiresAuth: true },
      },
      {
        path: '/recharge/coin',
        name: 'CoinRecharge',
        component: () => import('@/views/recharge/CoinRecharge.vue'),
        meta: { title: '金币兑换', requiresAuth: true },
      },
      {
        path: '/recharge/vip',
        name: 'VipPurchase',
        component: () => import('@/views/recharge/VipPurchase.vue'),
        meta: { title: '会员开通', requiresAuth: true },
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { title: '登录' },
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue'),
        meta: { title: '注册' },
      },
    ],
  },
  // 后台管理登录页面
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/auth/AdminLogin.vue'),
    meta: { title: '后台管理登录' },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '管理后台' },
      },
      {
        path: '/admin/tasks',
        name: 'AdminTasks',
        component: () => import('@/views/admin/Tasks.vue'),
        meta: { title: '任务管理', requiresAuth: true, requiresAdmin: true },
      },
      // 注意：排除设备管理 (Devices) - 主站特有功能
      {
        path: '/admin/site-token',
        name: 'AdminSiteToken',
        component: () => import('@/views/admin/SiteToken.vue'),
        meta: { title: 'Token设置' },
      },
      // 注意：排除解密监控 (Decrypt) - 主站特有功能
      // 会员金币系统路由
      {
        path: '/admin/vip-coin-stats',
        name: 'AdminVipCoinStats',
        component: () => import('@/views/admin/VipCoinStats.vue'),
        meta: { title: '会员金币统计' },
      },
      {
        path: '/admin/vip-coin-settings',
        name: 'AdminVipCoinSettings',
        component: () => import('@/views/admin/VipCoinSettings.vue'),
        meta: { title: '会员金币配置' },
      },
      {
        path: '/admin/vip-packages',
        name: 'AdminVipPackages',
        component: () => import('@/views/admin/VipPackages.vue'),
        meta: { title: '会员套餐管理' },
      },
      {
        path: '/admin/coin-packages',
        name: 'AdminCoinPackages',
        component: () => import('@/views/admin/CoinPackages.vue'),
        meta: { title: '金币套餐管理' },
      },
      {
        path: '/admin/user-management',
        name: 'AdminUserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { title: '用户金币管理' },
      },
      {
        path: '/admin/vip-orders',
        name: 'AdminVipOrders',
        component: () => import('@/views/admin/VipOrders.vue'),
        meta: { title: '会员订单管理' },
      },
      {
        path: '/admin/coin-transactions',
        name: 'AdminCoinTransactions',
        component: () => import('@/views/admin/CoinTransactions.vue'),
        meta: { title: '金币交易记录' },
      },
      {
        path: '/admin/coin-orders',
        name: 'AdminCoinOrders',
        component: () => import('@/views/admin/CoinOrders.vue'),
        meta: { title: '金币充值订单' },
      },
      {
        path: '/admin/payment-settings',
        name: 'AdminPaymentSettings',
        component: () => import('@/views/admin/PaymentSettings.vue'),
        meta: { title: '支付设置' },
      },
      {
        path: '/admin/announcements',
        name: 'AdminAnnouncements',
        component: () => import('@/views/admin/Announcements.vue'),
        meta: { title: '公告管理' },
      },
      {
        path: '/admin/settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { title: '系统设置' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 设置默认页面标题（如果API获取失败则使用）
  const defaultTitle = to.meta.title ? `${to.meta.title} - IPA脱壳平台` : 'IPA脱壳平台'
  
  // 从API获取并更新页面SEO（异步，不阻塞路由跳转）
  updatePageSeo(defaultTitle)
  
  // 每次路由切换时，从localStorage恢复状态（防止store被重置）
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  
  // 同步恢复状态（必须在检查登录状态之前完成）
  if (storedToken && storedUser) {
    // 如果localStorage有数据，确保store中也同步（防止store被重置导致登录状态丢失）
    if (userStore.token !== storedToken || !userStore.user) {
      try {
        // 直接同步赋值，确保立即生效
        userStore.token = storedToken
        try {
          userStore.user = JSON.parse(storedUser)
          console.log('🔄 路由切换时恢复登录状态:', { hasToken: !!storedToken, hasUser: !!storedUser })
        } catch (e) {
          console.error('解析用户信息失败:', e)
          // 解析失败，清除无效数据
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      } catch (e) {
        console.error('恢复登录状态失败:', e)
      }
    }
  } else {
    // 如果localStorage没有数据，确保store也被清空
    if (userStore.token || userStore.user) {
      userStore.token = ''
      userStore.user = null
    }
  }
  
  // 检查是否需要认证（使用同步后的状态）
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('⚠️ 需要认证但未登录，跳转到登录页', { 
      hasToken: !!userStore.token, 
      hasUser: !!userStore.user,
      storedToken: !!storedToken,
      storedUser: !!storedUser 
    })
    // 如果是管理后台路由，跳转到管理后台登录页；否则跳转到普通登录页
    if (to.path.startsWith('/admin')) {
      next('/admin/login')
    } else {
      next('/login')
    }
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.user?.is_admin) {
    console.log('⚠️ 需要管理员权限，跳转到首页')
    next('/')
    return
  }
  
  next()
})

export default router

