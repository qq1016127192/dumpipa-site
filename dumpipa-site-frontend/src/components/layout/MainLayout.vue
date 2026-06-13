<template>
  <div class="main-layout">
    <!-- Header -->
    <div class="header-app w-full">
      <div class="px-4 sm:px-6 lg:px-8 flex justify-start items-center h-16">
        <!-- LOGO -->
        <router-link to="/" class="flex items-center space-x-3 logo">
          <img 
            v-if="siteSettings.logo_url" 
            :src="siteSettings.logo_url" 
            :alt="siteSettings.site_name || 'IPA在线脱壳平台'"
            class="site-logo"
          >
          <img 
            v-else 
            src="https://www.iosr.cn/logo.jpg" 
            alt="ipa软件下载,ipa在线砸壳,ios应用砸壳,ios应用提取,ipa砸壳,ipa提取"
            class="site-logo"
          >
          <span class="site-name">{{ siteSettings.site_name || 'IPA在线脱壳平台' }}</span>
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 悬浮底部菜单 (完全复刻PHP版本) -->
    <div class="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center tabbar-mini md:hidden">
      <router-link 
        to="/" 
        id="tabbar-hot" 
        class="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-blue-600 transition-colors tabbar-link"
        :class="{ 'tabbar-active': $route.path === '/' || $route.path === '/home' }"
      >
        <i class="fa fa-fire"></i>
        <span>热门应用</span>
      </router-link>
      <router-link 
        to="/extract" 
        id="tabbar-extract" 
        class="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-blue-600 transition-colors tabbar-link"
        :class="{ 'tabbar-active': $route.path === '/extract' }"
      >
        <i class="fab fa-app-store"></i>
        <span>应用提取</span>
      </router-link>
      <router-link 
        to="/profile" 
        id="tabbar-profile" 
        class="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-blue-600 transition-colors tabbar-link"
        :class="{ 'tabbar-active': $route.path === '/profile' }"
      >
        <i class="fa fa-user-circle"></i>
        <span>我的</span>
      </router-link>
    </div>

    <!-- 版权信息 -->
    <div class="text-center text-gray-400 text-xs py-2 bg-white md:static md:mt-12" style="margin-bottom:48px;">
      &copy; 2025 {{ siteSettings.site_name || 'IPA在线脱壳平台' }}. 保留所有权利.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSeoSettings } from '@/api/settings'

const siteSettings = ref({
  logo_url: '',
  site_name: '',
})

const loadSiteSettings = async () => {
  try {
    const res = await getSeoSettings()
    if (res.ok === 1) {
      siteSettings.value = res.data?.site || { logo_url: '', site_name: '' }
    }
  } catch (error) {
    console.error('获取站点设置失败:', error)
  }
}

onMounted(() => {
  loadSiteSettings()
})
</script>

<style scoped>
/* Header 样式 */
.header-app {
  background: #fff;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-app > div {
  justify-content: flex-start !important;
}

.header-app .logo .site-logo {
  height: 38px;
}

.site-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 64px - 48px - 50px); /* header - footer - tabbar */
  background-color: #F9FAFB;
  /* 为底部菜单留出空间 */
  padding-bottom: 60px;
}

/* 移动端为主内容区域添加底部间距，避免被底部菜单遮挡 */
@media (max-width: 767px) {
  .main-content {
    padding-bottom: 60px !important;
  }
}

/* 底部菜单样式 */
.tabbar-active {
  color: #2563eb !important;
}

.tabbar-mini {
  height: 48px !important;
}

.tabbar-mini i {
  font-size: 1.1rem !important;
  margin-bottom: 0.1rem !important;
}

.tabbar-mini span {
  font-size: 11px !important;
}

.tabbar-link {
  text-decoration: none;
  user-select: none;
  /* 防止触摸高亮 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  /* 防止双击缩放 */
  touch-action: manipulation;
  /* 优化触摸响应 */
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  /* 确保点击区域足够大 */
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移动端显示底部菜单 - 全浏览器兼容优化 */
.tabbar-mini {
  display: flex !important;
  /* 固定定位,不受滚动影响 */
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  /* iOS 安全区域支持 */
  padding-bottom: constant(safe-area-inset-bottom) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  /* 开启硬件加速,提升性能 */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  /* 确保菜单在最上层，但低于弹窗 */
  z-index: 100 !important;
  /* 防止菜单被页面内容覆盖 */
  isolation: isolate;
  /* 固定高度 */
  min-height: 48px;
  /* 兼容各种浏览器 */
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}

/* PC端隐藏底部菜单 (768px以上) - Tailwind md:hidden 已经处理 */
@media (min-width: 768px) {
  /* PC端版权信息不需要底部间距 */
  .text-center.text-gray-400 {
    margin-bottom: 0 !important;
  }
  
  /* PC端主内容区不需要为底部菜单预留空间 */
  .main-content {
    min-height: calc(100vh - 64px - 48px) !important;
    padding-bottom: 0 !important;
  }
}

/* 响应式 - 移动端紧凑样式 */
@media (max-width: 600px) {
  :deep(.boxShadow) {
    box-shadow: none !important;
    border-radius: 0 !important;
    border-bottom: 1px solid #eee !important;
    padding: 4px 0 2px 6px !important;
    margin-top: 8px !important;
    margin-bottom: 8px !important;
    margin-left: 8px !important;
    margin-right: 8px !important;
  }
  
  :deep(.nut-image-round),
  :deep(.nut-img) {
    width: 24px !important;
    height: 24px !important;
    margin-right: 6px !important;
  }
  
  :deep(.nut-card-title),
  :deep(.nut-card-region),
  :deep(.nut-card-sizever),
  :deep(.content div),
  :deep(.content span) {
    font-size: 12px !important;
  }
  
  :deep(.nut-progress) {
    width: 100% !important;
    height: 6px !important;
  }
  
  :deep(.tab-content) {
    padding: 4px 0 0 0 !important;
  }
}
</style>
