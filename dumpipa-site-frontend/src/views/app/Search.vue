<template>
  <div class="search-page">
    <!-- 顶部导航栏 -->
    <div class="nut-navbar">
      <div class="nut-navbar__left" @click="goBack">
        <svg class="nut-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M642.973 1005.542 321.912 587.098a123.278 123.278 0 0 1 0-150.17l321.06-418.443a47.182 47.182 0 0 1 74.83 57.422l-321.088 418.47a28.994 28.994 0 0 0 0 35.3l321.088 418.47a47.155 47.155 0 0 1-74.83 57.395" fill="currentColor" fill-opacity="0.9"></path>
        </svg>
      </div>
      <div class="nut-navbar__title">
        <span class="title">AppStore应用搜索</span>
      </div>
      <div class="nut-navbar__right" style="width: 40px;"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <div class="search-box">
        <div class="search-input-wrapper">
          <el-select 
            v-model="currentCountry" 
            class="country-select"
            placeholder="选择地区"
            size="large"
          >
            <el-option
              v-for="country in countries"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            />
          </el-select>
          <input 
            v-model="searchKeyword"
            class="search-input" 
            type="text" 
            placeholder="搜索应用名称或 Bundle ID"
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch" :disabled="searching">
            <svg v-if="!searching" class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path d="M512 1024C231.131 1024 0 792.869 0 512S231.131 0 512 0s512 231.131 512 512-231.131 512-512 512zm0-936.229C277.943 87.771 87.771 277.943 87.771 512S277.943 936.229 512 936.229 936.229 746.057 936.229 512 746.057 87.771 512 87.771 277.943 87.771 512 277.943 87.771 512 277.943 87.771 746.057 277.943 936.229 512 936.229zM980.114 1024c-11.703 0-23.405-2.926-32.183-11.703L830.903 895.27c-17.554-17.555-17.554-43.886 0-61.44s43.886-17.555 61.44 0l117.028 117.028c17.555 17.554 17.555 43.886 0 61.44-5.851 8.777-17.554 11.703-29.257 11.703z" fill="currentColor"></path>
            </svg>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索示例提示 -->
    <div class="search-example">
      示例：微信、抖音、com.tencent.xin、com.ss.iphone.ugc.Aweme
    </div>

    <!-- 搜索结果区 -->
    <div class="results-container">
      <div v-if="searchResults.length > 0" class="results-stats">
        找到 {{ searchResults.length }} 个相关应用
      </div>
      
      <section id="searchSection">
        <!-- 加载中提示 -->
        <div v-if="searching" class="loading-container">
          <span class="loading-spinner"></span>
          <p>正在搜索应用...</p>
        </div>
        
        <div v-else id="resultsContainer">
          <!-- 搜索结果卡片 -->
          <div 
            v-for="(app, index) in searchResults" 
            :key="app.bundleId || app.trackId"
            class="app-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-content">
              <div class="app-icon-container">
                <img 
                  class="app-icon" 
                  :src="app.artworkUrl100 || app.artworkUrl512 || 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4b/ad/ce/4badce41-6379-92a4-26b9-6a6456abbf2b/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg'" 
                  :alt="app.trackName"
                  @error="handleImageError"
                >
              </div>
              <div class="app-info">
                <div class="app-title">{{ app.trackName }}</div>
                <div class="app-bundleid">{{ app.bundleId }}</div>
                
                <!-- 评分区域 -->
                <div class="rating-container" v-if="app.averageUserRating">
                  <div class="stars">
                    {{ generateStars(app.averageUserRating) }}
                  </div>
                  <span class="rating-count" v-if="app.userRatingCount">
                    ({{ formatNumber(app.userRatingCount) }})
                  </span>
                </div>
                <div v-else class="rating-container">
                  <span class="stars" style="color: var(--text-tertiary);">暂无评分</span>
                </div>
                
                <!-- 应用元数据 -->
                <div class="app-meta">
                  <span>{{ formatSize(app.fileSizeBytes) }}</span>
                  <span>•</span>
                  <span>版本 {{ app.version || '--' }}</span>
                  <span v-if="app.releaseDate">•</span>
                  <span v-if="app.releaseDate">{{ formatDate(app.releaseDate) }}</span>
                </div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="card-footer">
              <div class="genre-tag">{{ genreToZh(app.primaryGenreName) }}</div>
              <div class="download-btn" @click="goToDetail(app.bundleId)">
                <i class="fa fa-cloud-download-alt download-icon"></i>
                <span>提取</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无结果提示 -->
        <div v-if="showNoResults" id="noResults">
          <i class="fas fa-search"></i>
          <p>未找到相关App或暂无可用IPA</p>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { searchApps } from '@/api/app'
import { getAvailableCountries } from '@/api/settings'

const router = useRouter()

const searchKeyword = ref('')
const currentCountry = ref('cn')
const searching = ref(false)
const searchResults = ref<any[]>([])
const showNoResults = ref(false)

// 可用国家列表（从后端获取已配置的地区）
const countries = ref<Array<{ code: string; name: string }>>([
  { code: 'cn', name: '中国 🇨🇳' }, // 默认值
])

// 加载已配置的地区列表
const loadAvailableCountries = async () => {
  try {
    const res = await getAvailableCountries()
    console.log('地区API响应:', res)
    // API返回格式: { ok: 1, data: { countries: [...] } }
    const countriesList = res.countries || res.data?.countries || []
    if (res.ok === 1 && countriesList.length > 0) {
      countries.value = countriesList
      console.log('加载的地区列表:', countries.value)
      
      // 如果当前选择的地区不在可用列表中，自动切换到第一个可用地区
      const currentCountryExists = countries.value.some(c => c.code === currentCountry.value)
      if (!currentCountryExists && countries.value.length > 0 && countries.value[0]) {
        currentCountry.value = countries.value[0].code
      }
    }
  } catch (error) {
    console.error('获取可用地区失败:', error)
    // 失败时保持默认值
  }
}

const goBack = () => {
  router.back()
}

const performSearch = async () => {
  const term = searchKeyword.value.trim()
  if (!term) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  searching.value = true
  showNoResults.value = false
  searchResults.value = []
  
  try {
    const res = await searchApps(term, currentCountry.value)
    
    console.log('搜索结果:', res) // 调试日志
    
    // 检查返回数据格式
    // 注意：响应拦截器已经返回了 response.data，所以这里的 res 就是后端返回的数据
    if (res) {
      // 兼容多种返回格式
      if (res.ok === 1 && res.results && res.results.length > 0) {
        searchResults.value = res.results
        console.log('找到结果:', res.results.length, '个应用')
      } else if (res.apps && res.apps.length > 0) {
        searchResults.value = res.apps
        console.log('找到结果:', res.apps.length, '个应用')
      } else {
        console.log('没有找到结果')
        showNoResults.value = true
      }
    } else {
      console.log('响应数据为空')
      showNoResults.value = true
    }
  } catch (error: any) {
    console.error('搜索失败:', error)
    showNoResults.value = true
    
    let msg = '搜索失败，请稍后重试'
    if (error?.message?.includes('pattern')) {
      msg += ' (字符串格式错误)'
    }
    ElMessage.error(msg)
  } finally {
    searching.value = false
  }
}

const goToDetail = (bundleId: string) => {
  router.push({
    path: `/app/${bundleId}`,
    query: { country: currentCountry.value }
  })
}

const generateStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  let stars = '★'.repeat(fullStars)
  if (hasHalfStar) stars += '★'
  stars += '☆'.repeat(5 - stars.length)
  return stars
}

const formatSize = (bytes: number) => {
  if (!bytes) return '--'
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const genreToZh = (genre: string) => {
  if (!genre) return '--'
  const map: Record<string, string> = {
    'Business': '商务',
    'Utilities': '工具',
    'Productivity': '效率',
    'Education': '教育',
    'Games': '游戏',
    'Social Networking': '社交',
    'Photo & Video': '摄影与录像',
    'Music': '音乐',
    'Lifestyle': '生活',
    'Finance': '财务',
    'Health & Fitness': '健康健美',
    'Travel': '旅游',
    'Shopping': '购物',
    'News': '新闻',
    'Sports': '体育',
    'Entertainment': '娱乐',
    'Books': '图书',
    'Weather': '天气',
    'Navigation': '导航',
    'Food & Drink': '美食佳饮'
  }
  return map[genre] || genre
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4b/ad/ce/4badce41-6379-92a4-26b9-6a6456abbf2b/AppIcon-0-1x_U007emarketing-0-8-0-85-220-0.png/512x512bb.jpg'
}

// 页面加载时获取可用地区列表
onMounted(() => {
  loadAvailableCountries()
})
</script>

<style scoped>
/* 简化配色，与其他页面保持一致 */
.search-page {
  min-height: 100vh;
  background-color: #F5F7FA;
}

/* 导航栏样式 */
.nut-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.nut-navbar__left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nut-navbar__left:hover {
  background-color: #F5F7FA;
}

.nut-navbar__left .nut-icon {
  width: 22px;
  height: 22px;
  color: #4E5969;
}

.nut-navbar__title {
  flex: 1;
  text-align: center;
}

.title {
  color: #1D2129;
  font-size: 18px;
  font-weight: 600;
}

/* 搜索栏样式 */
.search-container {
  padding: 12px 16px;
  background: #FFFFFF;
}

.search-box {
  background: #F5F7FA;
  border-radius: 16px;
  padding: 4px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(59, 122, 219, 0.15);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E6EB;
  transition: all 0.3s ease;
}

.search-box:focus-within .search-input-wrapper {
  border-color: #3B7ADB;
}

.country-select {
  width: 140px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 16px;
  color: #1D2129;
  padding: 8px 4px;
  border: none;
  background: transparent;
  outline: none;
  min-width: 0;
}

.search-input::placeholder {
  color: #86909C;
  font-size: 15px;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: #3B7ADB;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.search-btn:hover:not(:disabled) {
  background: #5A91F2;
  transform: scale(1.02);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-icon {
  width: 18px;
  height: 18px;
}

.search-example {
  padding: 0 16px 12px;
  font-size: 13px;
  color: #86909C;
}

/* 结果列表样式 */
.results-container {
  padding: 8px 16px 20px;
}

.results-stats {
  font-size: 14px;
  color: #4E5969;
  padding: 0 4px 12px;
}

/* 应用卡片样式 */
.app-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.app-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.app-icon-container {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.app-card:hover .app-icon-container {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.app-card:hover .app-icon {
  transform: scale(1.1);
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-title {
  color: #1D2129;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.app-card:hover .app-title {
  color: #3B7ADB;
}

.app-bundleid {
  color: #86909C;
  font-size: 13px;
  margin-bottom: 6px;
  word-break: break-all;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.stars {
  color: #FFD700;
  font-size: 12px;
  letter-spacing: 1px;
}

.rating-count {
  font-size: 12px;
  color: #86909C;
}

.app-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #4E5969;
}

.divider {
  height: 1px;
  background: #E5E6EB;
  margin: 14px 0 10px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.genre-tag {
  font-size: 13px;
  color: #3B7ADB;
  background-color: rgba(59, 122, 219, 0.1);
  padding: 3px 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.app-card:hover .genre-tag {
  background-color: rgba(59, 122, 219, 0.2);
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  background: #3B7ADB;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(59, 122, 219, 0.2);
  cursor: pointer;
}

.download-btn:hover {
  background: #5A91F2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 122, 219, 0.3);
}

.download-icon {
  font-size: 16px;
}

/* 无结果样式 */
#noResults {
  text-align: center;
  color: #86909C;
  padding: 60px 20px;
}

#noResults i {
  font-size: 56px;
  margin-bottom: 20px;
  color: #E5E6EB;
}

#noResults p {
  font-size: 17px;
  font-weight: 500;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #4E5969;
}

.loading-container .loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(59, 122, 219, 0.2);
  border-top-color: #3B7ADB;
  margin-bottom: 16px;
}

.loading-container p {
  font-size: 15px;
  color: #86909C;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

