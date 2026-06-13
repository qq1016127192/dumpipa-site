<template>
  <router-view />
</template>

<script setup lang="ts">
// UserStore 已经在初始化时从 localStorage 恢复了用户信息
// 不需要再调用 fetchUserInfo，避免不必要的 API 请求和可能的登出
</script>

<style>
/* iOS 安全区域全局样式 */
:root {
  /* 定义 CSS 变量方便使用 */
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

html, body {
  /* 防止 iOS 下拉刷新时出现空白 */
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;
}

#app {
  min-height: 100vh;
  /* iOS 设备上确保页面高度包含安全区域 */
  min-height: -webkit-fill-available;
}

/* iOS 底部安全区域修复 */
@supports (-webkit-touch-callout: none) {
  #app {
    /* iOS Safari 专用 */
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }
}
</style>
