<template>
  <div class="app-detail-page-php">
    <!-- 应用信息卡片 -->
    <div id="app-info" class="mb-8 transition-all duration-300">
      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">正在获取应用信息...</p>
      </div>

      <!-- 应用信息 -->
      <div v-else-if="appInfo" class="app-info-card">
        <div class="app-info-content">
          <div class="app-icon-container">
            <img 
              class="app-icon" 
              :src="appInfo.artworkUrl100 || 'https://www.iosr.cn/logo.jpg'" 
              :alt="appInfo.trackName || '应用图标'"
            >
          </div>
          <div class="app-details">
            <div class="app-name">{{ appInfo.trackName || bundleId }}</div>
            <div class="app-description">学术研究版本</div>
            <div class="app-meta">
              <span class="app-developer">开发者：{{ appInfo.artistName || '未知' }}</span>
              <span class="app-price" :class="appInfo.price === 0 ? 'app-price-free' : 'app-price-paid'">
                价格：{{ appInfo.price === 0 ? '免费' : (appInfo.formattedPrice || '收费') }}
              </span>
              <span class="app-region">{{ region === 'cn' ? '国区' : region.toUpperCase() }}</span>
            </div>
          </div>
        </div>
        <div class="app-info-divider"></div>
        <div class="app-security-info">
          <i class="fa fa-shield security-icon"></i>
        </div>
      </div>

      <!-- 缺少参数提示 -->
      <div v-else-if="!bundleId" class="bg-red-50 border border-red-100 rounded-xl p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <i class="fa fa-exclamation-circle text-red-500 text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-red-800">缺少必要参数</h3>
            <div class="mt-1 text-sm text-red-700">
              <p>未提供Bundle ID参数，请检查请求链接是否正确。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本列表 -->
    <div id="version-list" class="mt-6 transition-all duration-300">
      <!-- 加载中 -->
      <div v-if="loadingVersions" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="text-gray-600">正在获取版本列表...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!versions || versions.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <i class="fa fa-info-circle"></i>
        </div>
        <h3 class="empty-state-title">暂无脱壳版本</h3>
        <p class="empty-state-desc">该应用目前没有可用的脱壳版本</p>
        <a 
          :href="`/extract?bundle_id=${bundleId}&country=${region}`"
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          立即脱壳
        </a>
      </div>

      <!-- 折叠面板版本列表 -->
      <div v-else class="nut-infinite-loading">
        <div class="nut-collapse">
          <div 
            v-for="(ver, index) in versions" 
            :key="ver.version"
            class="nut-collapse-item"
          >
            <!-- 折叠标题 -->
            <div 
              class="nut-collapse-item__title"
              @click="toggleCollapse(index)"
            >
              <div class="nut-collapse-item__title-main">
                <div class="nut-collapse-item__title-main-value">
                  <div class="nut-collapse-item__title-mtitle">v{{ ver.display_version || ver.real_version || ver.version || '未知' }}</div>
                </div>
              </div>
              <div class="nut-collapse-item__title-sub">{{ ver.file_size || '未知大小' }}</div>
              <div 
                class="nut-collapse-item__title-icon"
                :class="{ 'nut-collapse-item__title-icon--expanded': expandedIndex === index }"
              >
                <svg class="nut-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path d="M128 349.867C93.867 332.8 34.133 341.333 8.533 384-8.533 418.133 0 477.867 42.667 503.467 179.2 588.8 315.733 665.6 443.733 750.933c42.667 25.6 93.867 25.6 136.534 0C716.8 665.6 853.333 588.8 981.333 503.467c42.667-25.6 51.2-76.8 25.6-119.467s-76.8-51.2-119.466-25.6C768 435.2 640 512 512 588.8 384 512 256 435.2 128 349.867" fill="currentColor" fill-opacity="0.9"></path>
                </svg>
              </div>
            </div>

            <!-- 折叠内容 -->
            <div 
              class="nut-collapse__item-wrapper"
              :style="{ height: expandedIndex === index ? contentHeights[index] + 'px' : '0px' }"
            >
              <div class="nut-collapse__item-wrapper__content" :ref="el => setContentRef(el, index)">
                <div class="version-info-row">
                  <div class="version-info-item">
                    <i class="fa fa-check-circle"></i>
                    <div>确属研究版本</div>
                  </div>
                  <div class="version-info-item">
                    <i class="fa fa-clock-o"></i>
                    <div>脱壳时间: {{ formatDate(ver.created_at) }}</div>
                  </div>
                  <div class="version-info-item">
                    <i class="fa fa-globe"></i>
                    <div>地区: {{ region === 'cn' ? '国区' : region.toUpperCase() }}</div>
                  </div>
                  <div class="button-group">
                    <button 
                      class="extract-button"
                      @click="goToExtract(bundleId, ver.version, region)"
                    >
                      <div class="extract-button-content">
                        <div class="extract-button-text">提取下载</div>
                        <svg class="extract-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                          <path d="M877.319 1024c-5.535 0-13.838 0-19.373-2.768L705.73 982.486c-11.07 5.536-22.14 8.303-27.676 11.07-52.584 16.606-107.935 27.676-166.054 27.676C229.708 1021.232 0 791.524 0 512 0 229.708 229.708 0 512 0s512 229.708 512 509.232c0 85.795-22.14 168.822-60.886 243.546-2.768 8.303-8.303 16.606-16.606 27.676l13.838 152.216c2.768 22.14-5.535 44.281-19.373 60.887-13.838 16.605-33.21 27.675-55.351 30.443h-8.303zM702.962 899.46c5.535 0 8.303 0 13.838 2.767l163.286 41.514-16.605-160.52c0-11.07 2.768-24.907 8.303-35.978 8.302-13.838 13.838-24.908 19.373-30.443 33.21-60.886 52.584-132.843 52.584-204.8 0-235.243-193.73-426.205-428.973-426.205S83.027 273.989 83.027 509.232 276.757 935.438 512 935.438c47.049 0 94.097-8.303 138.378-22.14 8.303-2.768 16.606-5.536 30.444-11.071 8.302-2.768 13.837-2.768 22.14-2.768zM514.768 678.053c-22.141 0-41.514-19.373-41.514-41.513V384.69c0-22.14 19.373-41.513 41.514-41.513s41.513 19.373 41.513 41.514V636.54c0 24.908-19.373 41.513-41.513 41.513zM512 675.286c-8.303 0-16.605-2.767-24.908-8.302l-119.006-88.562c-19.372-13.838-22.14-38.746-8.302-58.12 13.838-19.372 38.746-22.14 58.119-8.302l119.005 88.562c19.373 13.838 22.14 38.746 8.303 58.12-8.303 11.07-22.14 16.604-33.211 16.604zm5.535 0c-13.838 0-24.908-5.535-33.21-16.605-13.839-19.373-8.303-44.281 8.302-58.119L611.632 512c19.373-13.838 44.282-8.303 58.12 8.303 13.837 19.373 8.302 44.28-8.303 58.119l-119.006 88.562c-8.302 5.535-16.605 8.302-24.908 8.302z" fill="currentColor" fill-opacity="0.9"></path>
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                <!-- 自动脱壳日志区域 -->
                <div v-if="dumpingVersions[ver.version]" class="dump-log-area">
                  <div class="log-header">
                    <i class="fa fa-spinner fa-spin"></i>
                    <span>{{ dumpingVersions[ver.version]?.status || '任务处理中...' }}</span>
                  </div>
                  <pre class="log-content" v-html="dumpingVersions[ver.version]?.log || ''"></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 底部提示 -->
        <div class="nut-infinite__bottom">
          <div class="nut-infinite__bottom-tips">哎呀，这里是底部了啦</div>
        </div>
      </div>
    </div>

    <!-- 底部间距 -->
    <div style="height:70px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 数据
const bundleId = ref(route.query.bundle_id as string || route.params.bundleId as string)
const region = ref(route.query.region as string || route.query.country as string || 'cn')
const appInfo = ref<any>(null)
const versions = ref<any[]>([])
const loading = ref(true)
const loadingVersions = ref(true)
const expandedIndex = ref(-1) // 初始不展开，等数据加载完成后再展开第一个
const contentRefs = ref<Record<number, HTMLElement>>({})
const contentHeights = ref<Record<number, number>>({})

// 自动脱壳相关
const dumpingVersions = ref<Record<string, { status: string; log: string; jobId?: number }>>({})

// 设置内容引用
const setContentRef = (el: any, index: number) => {
  if (el) {
    contentRefs.value[index] = el
  }
}

// 切换折叠状态 - 单一展开
const toggleCollapse = async (index: number) => {
  if (expandedIndex.value === index) {
    // 如果点击的是已展开的，则收起
    expandedIndex.value = -1
  } else {
    // 展开新的
    expandedIndex.value = index
    
    // 计算内容高度
    await nextTick()
    if (contentRefs.value[index]) {
      contentHeights.value[index] = contentRefs.value[index].offsetHeight
    }
  }
}

// 获取应用信息 - 使用Node.js后端API
const fetchAppInfo = async () => {
  try {
    loading.value = true
    // 使用后端API获取应用信息（后端会调用iTunes API，并处理跨域和错误）
    const response = await fetch(`/api/apps/${encodeURIComponent(bundleId.value)}?country=${region.value}`)
    const data = await response.json()
    
    // 后端返回格式: { ok: 1, app: {...}, versions: [...] }
    if (data.ok === 1 && data.app) {
      appInfo.value = data.app
    } else if (data.success && data.app) {
      // 兼容其他返回格式
      appInfo.value = data.app
    } else {
      // 应用信息获取失败，显示基本信息（但不设置 trackId，避免误跳转）
      console.warn('获取应用信息失败，返回数据:', data)
      appInfo.value = {
        trackName: bundleId.value,
        artistName: '未知',
        price: -1,
        artworkUrl100: 'https://www.iosr.cn/logo.jpg'
        // 注意：不设置 trackId，这样点击提取时会提示信息不完整
      }
      ElMessage.warning('无法获取应用信息，请检查Bundle ID和地区是否正确')
    }
  } catch (error) {
    console.error('获取应用信息失败:', error)
    // 显示基本信息（但不设置 trackId）
    appInfo.value = {
      trackName: bundleId.value,
      artistName: '未知',
      price: -1,
      artworkUrl100: 'https://www.iosr.cn/logo.jpg'
      // 注意：不设置 trackId，这样点击提取时会提示信息不完整
    }
    ElMessage.error('获取应用信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取版本列表 - 使用Node.js后端API
const fetchVersions = async () => {
  try {
    loadingVersions.value = true
    
    // 使用Node.js后端API获取版本列表
    const response = await fetch(`/api/apps/versions?bundle_id=${encodeURIComponent(bundleId.value)}`)
    const data = await response.json()
    
    if (data.ok === 1 && data.versions) {
      // 处理数据格式，使用后端格式化后的size_formatted字段
      versions.value = data.versions.map((v: any) => ({
        ...v,
        file_size: v.size_formatted || v.size || '未知大小'
      }))
      
      // 等待DOM渲染完成，计算第一个的高度并展开
      if (versions.value.length > 0) {
        await nextTick()
        // 使用setTimeout确保DOM完全渲染
        setTimeout(async () => {
          if (contentRefs.value[0]) {
            contentHeights.value[0] = contentRefs.value[0].offsetHeight
            expandedIndex.value = 0 // 计算完高度后再展开
          }
        }, 100)
      }
    } else {
      versions.value = []
    }
  } catch (error) {
    console.error('获取版本列表失败:', error)
    versions.value = []
  } finally {
    loadingVersions.value = false
  }
}

// 跳转到提取页面
const goToExtract = (bid: string, version: string, reg: string) => {
  // 检查应用信息是否完整
  if (!appInfo.value?.trackId) {
    ElMessage.warning('应用信息不完整，无法跳转')
    return
  }
  
  // 构建参数：bundle_id, version, country, appid
  const queryParams: any = {
      bundle_id: bid,
      version: version,
    country: reg,
    appid: appInfo.value.trackId // trackId用于查询应用信息
    }
  
  router.push({
    path: '/app/store-extract',
    query: queryParams
  })
}

// 轮询任务状态
const pollJobStatus = async (version: string, jobId: number) => {
  try {
    const response = await fetch(`/api/ipa_crack_api.php?action=job_status&id=${jobId}`)
    const data = await response.json()
    let versionState = dumpingVersions.value[version]
    if (!versionState) {
      versionState = { status: '', log: '' }
      dumpingVersions.value[version] = versionState
    }
    
    if (!data.ok) {
      versionState.status = '查询状态失败'
      versionState.log = data.msg || '未知错误'
      return
    }
    
    // 更新状态和日志
    let statusText = ''
    switch (data.status) {
      case 'queued':
        statusText = '任务排队中...'
        break
      case 'running':
        if (data.progress <= 20) {
          statusText = '正在下载IPA文件...'
        } else if (data.progress <= 40) {
          statusText = '正在上传到设备...'
        } else if (data.progress <= 60) {
          statusText = '正在执行砸壳...'
        } else if (data.progress <= 80) {
          statusText = '正在回传文件...'
        } else {
          statusText = '正在处理文件...'
        }
        break
      case 'done':
        statusText = '砸壳完成！'
        break
      case 'error':
        statusText = '任务执行失败'
        break
      default:
        statusText = `任务状态：${data.status}`
    }
    
    versionState.status = statusText
    versionState.log = data.log ? escapeHtml(data.log) : ''
    
    // 根据状态决定是否继续轮询
    if (data.status === 'done') {
      // 任务完成
      if (data.result_path) {
        versionState.log += `\n\n<a href="${data.result_path}" target="_blank" style="color: #10B981; text-decoration: underline;">✅ 点击下载砸壳后的IPA文件</a>`
      }
      
      ElMessage.success('砸壳完成！')
      
      // 刷新版本列表
      setTimeout(() => {
        fetchVersions()
        delete dumpingVersions.value[version]
      }, 5000)
    } else if (data.status === 'error') {
      // 任务失败
      ElMessage.error('砸壳失败，请稍后重试')
      setTimeout(() => {
        delete dumpingVersions.value[version]
      }, 5000)
    } else {
      // 继续轮询
      setTimeout(() => {
        pollJobStatus(version, jobId)
      }, data.status === 'queued' ? 5000 : 3000)
    }
  } catch (error) {
    console.error('轮询任务状态失败:', error)
    // 继续重试
    setTimeout(() => {
      pollJobStatus(version, jobId)
    }, 5000)
  }
}

// HTML转义
const escapeHtml = (text: string) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  if (!bundleId.value) {
    loading.value = false
    return
  }
  fetchAppInfo()
  fetchVersions()
})
</script>

<style scoped>
/* 页面容器样式 */
.app-detail-page-php {
  min-height: 100vh;
  background-color: #F5F7FA;
  width: 100%;
  padding: 16px 16px 80px; /* 增加左右间距到 16px */
  margin: 0 auto;
  box-sizing: border-box;
}

/* 折叠面板样式 */
.nut-collapse {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 0 4px; /* 增加左右间距 */
}

.nut-collapse-item {
  border-bottom: 1px solid #f2f3f5;
}

.nut-collapse-item:last-child {
  border-bottom: none;
}

.nut-collapse-item__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  width: 100%;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nut-collapse-item__title:hover {
  background-color: #f7f8fa;
}

.nut-collapse-item__title-main {
  flex: 1;
}

.nut-collapse-item__title-mtitle {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.nut-collapse-item__title-sub {
  font-size: 14px;
  color: #909399;
  margin-right: 16px;
}

.nut-collapse-item__title-icon {
  transition: transform 0.3s;
  color: #c0c4cc;
  width: 20px;
  height: 20px;
}

.nut-collapse-item__title-icon--expanded {
  transform: rotate(180deg);
}

.nut-collapse__item-wrapper {
  overflow: hidden;
  transition: height 0.3s ease-in-out;
  height: 0;
}

.nut-collapse__item-wrapper__content {
  padding: 12px 20px;
}

/* 版本信息项样式 */
.version-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.version-info-item {
  display: flex;
  align-items: center;
  color: #999;
}

.version-info-item i {
  font-size: 16px;
  color: #1af229;
  margin-right: 6px;
}

/* 提取按钮样式 */
.extract-button {
  color: #ffffff;
  background: linear-gradient(to right, #64a4f0, #386bf6);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: rgba(73, 105, 230, 0.22) 0px 5px 6px 0px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.extract-button:hover {
  transform: translateY(-1px);
  box-shadow: rgba(73, 105, 230, 0.3) 0px 7px 8px 0px;
}

.extract-button:active {
  transform: translateY(0);
  box-shadow: rgba(73, 105, 230, 0.22) 0px 5px 6px 0px;
}

.extract-button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.extract-button-text {
  font-weight: 500;
  white-space: nowrap;
}

.extract-button-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 应用信息卡片样式 */
.app-info-card {
  position: sticky;
  top: 0;
  z-index: 9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
  margin: 0 4px 20px 4px; /* 增加左右间距 */
  overflow: hidden;
}

.app-info-content {
  display: flex;
  align-items: center;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.app-icon-container {
  flex-shrink: 0;
  margin-right: 16px;
}

.app-icon {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-name {
  color: #333;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-description {
  color: #999;
  font-size: 15px;
  margin-bottom: 8px;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.app-developer {
  font-size: 13px;
  color: #666;
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.app-price {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.app-price-free {
  color: #10b981;
  background-color: #d1fae5;
}

.app-price-paid {
  color: #f59e0b;
  background-color: #fef3c7;
}

.app-region {
  font-size: 13px;
  color: #e53e3e;
  background-color: #fed7d7;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  font-weight: 500;
}

.app-info-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0 20px;
}

.app-security-info {
  padding: 12px 20px;
  display: flex;
  align-items: center;
}

.security-icon {
  font-size: 16px;
  color: #2EA44F;
}

/* 空状态样式 */
.empty-state {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 40px 20px;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background-color: #f2f3f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-icon i {
  font-size: 24px;
  color: #c0c4cc;
}

.empty-state-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.empty-state-desc {
  color: #909399;
  margin-bottom: 24px;
}

/* 加载状态 */
.loading-state {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #537fea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部提示 */
.nut-infinite__bottom {
  padding: 16px;
  text-align: center;
}

.nut-infinite__bottom-tips {
  color: #909399;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 640px) {
  .app-info-content {
    padding: 16px;
  }
  
  .app-icon {
    width: 72px;
    height: 72px;
    border-radius: 12px;
  }
  
  .app-name {
    font-size: 18px;
  }
  
  .app-developer {
    font-size: 12px;
    padding: 1px 6px;
    max-width: 150px;
  }
  
  .app-price {
    font-size: 12px;
    padding: 1px 6px;
  }
  
  .app-region {
    font-size: 13px;
  }
}
</style>
