<template>
  <div class="extract-page">
    <div class="main-container">
      <!-- 整体大卡片 -->
      <div class="main-card">
        <!-- 顶部应用商店ipa提取 -->
        <div class="top-search-bar">
          <div class="search-cell" @click="goToIpaSearch">
            <div class="search-cell__icon"><i class="fab fa-app-store text-xl"></i></div>
            <div class="search-cell__title">应用商店ipa提取</div>
            <div class="search-cell__arrow"><i class="fa fa-chevron-circle-right"></i></div>
          </div>
        </div>

        <!-- NutUI风格Tabs -->
        <div class="tabs-container">
        <!-- 标签页导航 -->
        <div class="nut-tabs__titles">
          <div 
            class="nut-tabs__titles-item" 
            :class="{ active: activeTab === 'recommend' }" 
            @click="switchTab('recommend')"
          >
            <span class="nut-tabs__titles-item__text">推荐应用</span>
            <span class="nut-tabs__titles-item__line"></span>
          </div>
          <div 
            class="nut-tabs__titles-item" 
            :class="{ active: activeTab === 'mine' }" 
            @click="switchTab('mine')"
          >
            <span class="nut-tabs__titles-item__text">我的提取</span>
            <span class="nut-tabs__titles-item__line"></span>
          </div>
          <div 
            class="nut-tabs__titles-item all-tab-item" 
            :class="{ active: activeTab === 'all' }" 
            @click="switchTab('all')"
          >
            <span 
              v-if="allTasksCount > 0" 
              class="all-tasks-count-badge"
            >
              {{ allTasksCount }}
            </span>
            <span class="nut-tabs__titles-item__text">全站提取</span>
            <span class="nut-tabs__titles-item__line"></span>
          </div>
        </div>
        
        <!-- Tab内容区 -->
        <!-- 推荐应用 -->
        <transition :name="slideDirection" mode="out-in">
        <div v-if="activeTab === 'recommend'" key="recommend" class="tab-content tab-content-recommend">
          <div class="tab-description">
            <div>最新脱壳成功的应用</div>
          </div>
          
          <div class="tasks-list">
            <el-skeleton v-if="loading" :rows="3" animated class="skeleton-item" />
            <template v-else>
              <div v-if="recommendTasks.length === 0" class="empty-state">
                <el-empty description="暂无推荐应用" />
              </div>
              <template v-else>
                <div 
                  v-for="task in recommendTasks" 
                  :key="task.id" 
                  class="boxShadow task-card"
                  @click="goToAppDetail(task.bundle_id, task.country)"
                >
                  <TaskCard :task="task" />
                </div>
                <!-- 加载更多时显示骨架屏 -->
                <div v-if="recommendLoadingMore" class="loading-more-skeleton">
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                </div>
                <div v-else-if="!recommendHasMore && recommendTasks.length > 0" class="no-more">
                  没有更多了
                </div>
              </template>
            </template>
          </div>
        </div>

            <!-- 我的提取 -->
            <div v-else-if="activeTab === 'mine'" key="mine" class="tab-content tab-content-mine">
              <div class="tab-description">
                <div>如果您提取的应用显示正在排队，可切换到全站提取查看您的应用正在第几位排队提取当中。</div>
              </div>
              
              <div class="tasks-list">
                <div v-if="!userStore.isLoggedIn" class="login-prompt-box">
                  <i class="fa fa-lock text-4xl text-gray-300 mb-4"></i>
                  <p class="text-gray-600 mb-4">请先登录查看您的提取任务</p>
                  <el-button type="primary" @click="router.push('/login')">
                    立即登录
                  </el-button>
                </div>
                <el-skeleton v-else-if="loading" :rows="3" animated class="skeleton-item" />
                <template v-else>
                  <div v-if="myTasks.length === 0" class="empty-state">
                    <el-empty description="暂无提取任务" />
                  </div>
                  <template v-else>
                    <div 
                      v-for="(task, index) in myTasks" 
                      :key="task.id" 
                      class="boxShadow task-card"
                    >
                      <MyTaskCard :task="task" :task-number="index + 1" @retry="handleRetry" />
                    </div>
                    <!-- 加载更多时显示骨架屏 -->
                    <div v-if="myLoadingMore" class="loading-more-skeleton">
                      <el-skeleton :rows="2" animated class="skeleton-item" />
                      <el-skeleton :rows="2" animated class="skeleton-item" />
                      <el-skeleton :rows="2" animated class="skeleton-item" />
                    </div>
                    <div v-else-if="!myHasMore && myTasks.length > 0" class="no-more">
                      没有更多了
                    </div>
                  </template>
                </template>
              </div>
            </div>

            <!-- 全站提取 -->
            <div v-else-if="activeTab === 'all'" key="all" class="tab-content tab-content-all">
          <div class="tab-description">
            <div>1、此处可查看全站所有人正在提取的应用，包括您提取的应用，越早提取应用越靠前</div>
            <div>2、如果您提取的应用在此处排队，请不要着急，后面您的应用也会被提取</div>
            <div>3、提取不是下载，提取完成需要再点击即可下载</div>
          </div>
          
          <div class="tasks-list">
            <el-skeleton v-if="loading" :rows="5" animated class="skeleton-item" />
            <template v-else>
              <div v-if="allTasks.length === 0" class="empty-state">
                <el-empty description="暂无提取任务" />
              </div>
              <template v-else>
                <div 
                  v-for="(task, index) in allTasks" 
                  :key="task.id" 
                  class="boxShadow task-card"
                >
                  <MyTaskCard :task="task" :task-number="index + 1" @retry="handleRetry" />
                </div>
                <!-- 加载更多时显示骨架屏 -->
                <div v-if="allLoadingMore" class="loading-more-skeleton">
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                  <el-skeleton :rows="2" animated class="skeleton-item" />
                </div>
                <div v-else-if="!allHasMore && allTasks.length > 0" class="no-more">
                  没有更多了
                </div>
              </template>
            </template>
          </div>
        </div>
        </transition>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { getRecommendedApps } from '@/api/app'
import { getMyTasks, getAllTasks, retryTask, getTaskDetail } from '@/api/task'
import TaskCard from './components/TaskCard.vue'
import MyTaskCard from './components/MyTaskCard.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('recommend')
const loading = ref(false)
const recommendTasks = ref<any[]>([])
const myTasks = ref<any[]>([])
const allTasks = ref<any[]>([])
const allTasksCount = ref(0)
const slideDirection = ref('slide-left')

// 分页状态
const recommendPage = ref(1)
const recommendHasMore = ref(true)
const recommendLoadingMore = ref(false)
const myPage = ref(1)
const myHasMore = ref(true)
const myLoadingMore = ref(false)
const allPage = ref(1)
const allHasMore = ref(true)
const allLoadingMore = ref(false)

// 页面大小
const PAGE_SIZE = 20

// 标签页索引映射
const tabIndexMap: Record<string, number> = {
  'recommend': 0,
  'mine': 1,
  'all': 2
}

let lastTabIndex = 0

let refreshInterval: any = null
let runningTasksRefreshInterval: any = null

// 更新运行中任务的进度（实时更新，无论在哪一页）
const updateRunningTasks = async () => {
  try {
    // 获取当前显示的任务列表
    let currentTasks: any[] = []
    if (activeTab.value === 'recommend') {
      currentTasks = recommendTasks.value
    } else if (activeTab.value === 'mine') {
      currentTasks = myTasks.value
    } else if (activeTab.value === 'all') {
      currentTasks = allTasks.value
    }
    
    // ⭐ 检查所有任务的状态（包括运行中的和可能已完成的）
    // 这样可以及时移除已完成的任务
    const taskIdsToCheck = currentTasks
      .filter(task => task.status === 'running' || task.status === 'queued' || task.status === 'done')
      .map(task => task.id)
    
    if (taskIdsToCheck.length === 0) {
      return // 没有需要检查的任务，不需要更新
    }
    
    // 并发获取所有任务的最新状态
    const updatePromises = taskIdsToCheck.map(async (taskId) => {
      try {
        const res: any = await getTaskDetail(taskId)
        // 检查返回格式：可能是 { ok: 1, task: {...} } 或直接是 task 对象
        const taskData = res.task || res
        if (taskData && (res.ok === 1 || taskData.id === taskId)) {
          // 更新对应任务的数据（如果任务完成，会从列表中移除）
          updateTaskInList(taskId, taskData)
        }
      } catch (error) {
        console.warn(`更新任务 ${taskId} 状态失败:`, error)
        // 如果任务不存在（可能已删除），从列表中移除
        const currentTasksList = activeTab.value === 'all' ? allTasks.value : 
                                 activeTab.value === 'mine' ? myTasks.value : 
                                 recommendTasks.value
        const taskIndex = currentTasksList.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          currentTasksList.splice(taskIndex, 1)
          if (activeTab.value === 'all') {
            allTasksCount.value = allTasks.value.length
          }
        }
      }
    })
    
    await Promise.all(updatePromises)
  } catch (error) {
    console.error('更新运行中任务失败:', error)
  }
}

// 更新列表中特定任务的数据
const updateTaskInList = (taskId: number, updatedTask: any) => {
  // ⭐ 如果任务已完成，从列表中移除（而不是更新）
  if (updatedTask.status === 'done' || updatedTask.status === 'failed') {
    // 从"我的任务"列表移除
    const myTaskIndex = myTasks.value.findIndex(t => t.id === taskId)
    if (myTaskIndex !== -1) {
      myTasks.value.splice(myTaskIndex, 1)
      // 更新总数
      if (activeTab.value === 'mine') {
        // 如果当前在"我的任务"标签页，可以更新计数
      }
    }
    
    // 从"全站任务"列表移除
    const allTaskIndex = allTasks.value.findIndex(t => t.id === taskId)
    if (allTaskIndex !== -1) {
      allTasks.value.splice(allTaskIndex, 1)
      // 更新总数
      allTasksCount.value = allTasks.value.length
    }
    
    // 从"推荐应用"列表移除（如果任务在那里）
    const recommendTaskIndex = recommendTasks.value.findIndex(t => t.id === taskId)
    if (recommendTaskIndex !== -1) {
      recommendTasks.value.splice(recommendTaskIndex, 1)
    }
    
    return // 任务已移除，不需要更新
  }
  
  // 更新"我的任务"列表
  const myTaskIndex = myTasks.value.findIndex(t => t.id === taskId)
  if (myTaskIndex !== -1) {
    // 只更新变化的字段，保留其他字段（如任务顺序等）
    myTasks.value[myTaskIndex] = {
      ...myTasks.value[myTaskIndex],
      ...updatedTask,
      // 保留原来的索引顺序
    }
  }
  
  // 更新"全站任务"列表
  const allTaskIndex = allTasks.value.findIndex(t => t.id === taskId)
  if (allTaskIndex !== -1) {
    allTasks.value[allTaskIndex] = {
      ...allTasks.value[allTaskIndex],
      ...updatedTask,
    }
  }
  
  // 更新"推荐应用"列表（如果任务在那里）
  const recommendTaskIndex = recommendTasks.value.findIndex(t => t.id === taskId)
  if (recommendTaskIndex !== -1) {
    recommendTasks.value[recommendTaskIndex] = {
      ...recommendTasks.value[recommendTaskIndex],
      ...updatedTask,
    }
  }
}

const switchTab = (tab: string) => {
  // 判断滑动方向
  const currentTabIndex = tabIndexMap[tab] ?? 0
  if (currentTabIndex > lastTabIndex) {
    slideDirection.value = 'slide-left' // 向左滑动
  } else if (currentTabIndex < lastTabIndex) {
    slideDirection.value = 'slide-right' // 向右滑动
  }
  lastTabIndex = currentTabIndex
  
  activeTab.value = tab
  loadTabData(tab)
}

const loadTabData = async (tab: string, reset = true) => {
  if (reset) {
    loading.value = true
    // 重置分页状态
    if (tab === 'recommend') {
      recommendPage.value = 1
      recommendHasMore.value = true
      recommendTasks.value = []
    } else if (tab === 'mine') {
      myPage.value = 1
      myHasMore.value = true
      myTasks.value = []
    } else if (tab === 'all') {
      allPage.value = 1
      allHasMore.value = true
      allTasks.value = []
    }
  }
  
  try {
    if (tab === 'recommend') {
      await loadRecommendTasks(reset)
    } else if (tab === 'mine') {
      if (userStore.isLoggedIn) {
        await loadMyTasks(reset)
      }
    } else if (tab === 'all') {
      await loadAllTasks(reset)
    }
  } finally {
    loading.value = false
  }
}

const loadRecommendTasks = async (reset = true) => {
  if (!recommendHasMore.value || recommendLoadingMore.value) return
  
  try {
    recommendLoadingMore.value = true
    const res = await getRecommendedApps({ page: recommendPage.value, page_size: PAGE_SIZE })
    console.log('推荐应用API返回:', res)
    if (res.ok === 1 && res.apps) {
      if (reset) {
        recommendTasks.value = res.apps
      } else {
        recommendTasks.value.push(...res.apps)
      }
      
      // 检查是否还有更多数据
      if (res.pagination) {
        recommendHasMore.value = recommendPage.value < res.pagination.total_pages
      } else {
        recommendHasMore.value = res.apps.length === PAGE_SIZE
      }
      
      if (recommendHasMore.value) {
        recommendPage.value++
      }
      
      console.log('推荐应用数据:', recommendTasks.value.length, '条')
    } else {
      console.warn('API返回数据格式不正确:', res)
      recommendHasMore.value = false
    }
  } catch (error) {
    console.error('加载推荐任务失败:', error)
    ElMessage.error('加载失败')
    recommendHasMore.value = false
  } finally {
    recommendLoadingMore.value = false
  }
}

const loadMyTasks = async (reset = true) => {
  // 未登录用户不加载任务
  if (!userStore.isLoggedIn) {
    myTasks.value = []
    myHasMore.value = false
    return
  }
  
  if (!myHasMore.value || myLoadingMore.value) return
  
  try {
    myLoadingMore.value = true
    const res = await getMyTasks({ page: myPage.value, page_size: PAGE_SIZE })
    console.log('我的任务API返回:', res)
    
    // 兼容两种响应格式：
    // 1. { ok: 1, tasks: [...] } - 直接返回
    // 2. { ok: 1, data: { tasks: [...] } } - 放在data字段中
    const tasksData = res.tasks || res.data?.tasks || []
    
    if (res.ok === 1 && tasksData.length > 0) {
      if (reset) {
        myTasks.value = tasksData
      } else {
        myTasks.value.push(...tasksData)
      }
      
      // 检查是否还有更多数据
      myHasMore.value = tasksData.length === PAGE_SIZE
      if (myHasMore.value) {
        myPage.value++
      }
      
      console.log('我的任务数据:', myTasks.value.length, '条')
    } else if (res.ok === 1 && tasksData.length === 0) {
      // API调用成功但没有数据
      if (reset) {
        myTasks.value = []
      }
      myHasMore.value = false
      console.log('我的任务数据为空')
    } else {
      console.warn('我的任务API返回格式不正确:', res)
      myHasMore.value = false
    }
  } catch (error) {
    console.error('加载我的任务失败:', error)
    ElMessage.error('加载失败')
    myHasMore.value = false
  } finally {
    myLoadingMore.value = false
  }
}

const loadAllTasks = async (reset = true) => {
  // ⭐ 如果是重置加载（第一页），允许刷新，即使 allHasMore 为 false
  // 这样可以确保已完成的任务能够从列表中移除
  if ((!reset && !allHasMore.value) || allLoadingMore.value) return
  
  try {
    allLoadingMore.value = true
    const res = await getAllTasks({ page: allPage.value, page_size: PAGE_SIZE, include_done: false })
    console.log('全站任务API返回:', res)
    
    // 兼容两种响应格式：
    // 1. { ok: 1, tasks: [...] } - 直接返回
    // 2. { ok: 1, data: { tasks: [...] } } - 放在data字段中
    const tasksData = res.tasks || res.data?.tasks || []
    
    if (res.ok === 1 && tasksData.length > 0) {
      if (reset) {
        allTasks.value = tasksData
      } else {
        allTasks.value.push(...tasksData)
      }
      
      // 更新总数
      allTasksCount.value = allTasks.value.length
      
      // 检查是否还有更多数据
      allHasMore.value = tasksData.length === PAGE_SIZE
      if (allHasMore.value) {
        allPage.value++
      }
      
      console.log('全站任务数据:', allTasks.value.length, '条')
    } else if (res.ok === 1 && tasksData.length === 0) {
      // API调用成功但没有数据
      if (reset) {
        allTasks.value = []
      }
      allHasMore.value = false
      console.log('全站任务数据为空')
    } else {
      console.warn('全站任务API返回格式不正确:', res)
      allHasMore.value = false
    }
  } catch (error) {
    console.error('加载全站任务失败:', error)
    ElMessage.error('加载失败')
    allHasMore.value = false
  } finally {
    allLoadingMore.value = false
  }
}

const goToIpaSearch = () => {
  router.push('/app/store-extract')
}

const goToAppDetail = (bundleId: string, country: string = 'cn') => {
  router.push({
    path: '/app-detail',
    query: {
      bundle_id: bundleId,
      region: country
    }
  })
}

const handleRetry = async (taskId: number) => {
  try {
    await retryTask(taskId)
    ElMessage.success('重试任务已提交')
    // 重新加载当前标签页数据（重置到第一页）
    if (activeTab.value === 'mine') {
      await loadTabData('mine', true)
    } else if (activeTab.value === 'all') {
      await loadTabData('all', true)
    }
  } catch (error) {
    console.error('重试任务失败:', error)
    ElMessage.error('重试任务失败')
  }
}

// 处理页面滚动事件 - 上滑加载更多（监听整个页面滚动）
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = window.innerHeight
  
  // 距离底部100px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    if (activeTab.value === 'recommend' && recommendHasMore.value && !recommendLoadingMore.value) {
      loadRecommendTasks(false)
    } else if (activeTab.value === 'mine' && myHasMore.value && !myLoadingMore.value && userStore.isLoggedIn) {
      loadMyTasks(false)
    } else if (activeTab.value === 'all' && allHasMore.value && !allLoadingMore.value) {
      loadAllTasks(false)
    }
  }
}

// 定期刷新任务状态（只刷新第一页数据，不触发分页）
const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    // 只在第一页时刷新，避免刷新时丢失已加载的数据
    if (activeTab.value === 'recommend' && recommendPage.value === 1) {
      loadRecommendTasks(true)
    } else if (activeTab.value === 'mine' && myPage.value === 1 && userStore.isLoggedIn) {
      loadMyTasks(true)
    } else if (activeTab.value === 'all' && allPage.value === 1) {
      loadAllTasks(true)
    }
  }, 5000) // 每5秒刷新一次
  
  // 单独实时更新运行中的任务（无论在哪一页，每2秒更新一次）
  runningTasksRefreshInterval = setInterval(() => {
    updateRunningTasks()
  }, 2000) // 每2秒更新运行中的任务
}

onMounted(() => {
  loadTabData(activeTab.value)
  startAutoRefresh()
  
  // 监听窗口滚动事件（整个页面滚动）
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (runningTasksRefreshInterval) {
    clearInterval(runningTasksRefreshInterval)
  }
  
  // 移除窗口滚动监听
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 完全复刻PHP版本的样式 */
.extract-page {
  min-height: 100vh;
  background-color: #F9FAFB;
  padding-top: 0;
  padding-bottom: 80px;
}


.search-cell {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
  transition: all 0.2s ease;
}

.search-cell__icon {
  color: #4F46E5;
  font-size: 28px;
  display: flex;
  align-items: center;
}

.search-cell__title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.search-cell__arrow {
  color: #9CA3AF;
  font-size: 20px;
  transition: all 0.2s ease;
}

.search-cell:hover .search-cell__arrow {
  transform: translateX(2px);
  color: #1D4ED8;
}

/* 主容器 */
.main-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 16px 0 24px 0;
}

/* 整体大卡片 - 包含搜索栏和Tab */
.main-card {
  background-color: white;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
  border-left: none;
  border-right: none;
}

.main-card:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 顶部搜索栏 - 现在在大卡片内 */
.top-search-bar {
  width: 100%;
  background-color: white;
  border-bottom: 1px solid #E5E7EB;
  margin: 0;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.top-search-bar:hover {
  background-color: #F9FAFB;
}

/* 标签页容器 - 现在在大卡片内 */
.tabs-container {
  background-color: white;
  border-radius: 0;
  overflow: visible;
  position: relative;
  min-height: 600px;
  transition: min-height 0.3s ease;
}

/* 标签页导航 */
.nut-tabs__titles {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  background-color: white;
  min-height: 56px;
  overflow-x: auto;
  scrollbar-width: none;
}

.nut-tabs__titles::-webkit-scrollbar {
  display: none;
}

.nut-tabs__titles-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.nut-tabs__titles-item__text {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nut-tabs__titles-item.active .nut-tabs__titles-item__text {
  color: #4F46E5;
  font-weight: 600;
}

.nut-tabs__titles-item__line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background-color: transparent;
  border-radius: 3px 3px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nut-tabs__titles-item.active .nut-tabs__titles-item__line {
  background-color: #4F46E5;
}

.all-tasks-count-badge {
  display: block;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  background: #EF4444;
  color: #fff;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  padding: 0 4px;
  transition: all 0.2s ease;
  z-index: 10;
}

.all-tasks-count-badge:hover {
  transform: translateX(-50%) scale(1.15);
}

/* 让全站提取标签相对定位并调整布局 */
.all-tab-item {
  position: relative;
  padding-top: 2px !important;
}

.all-tab-item .nut-tabs__titles-item__text {
  margin-top: 4px;
}

/* Tab内容区 */
.tab-content {
  background-color: white;
  padding: 24px 20px;
  border-radius: 0 0 16px 16px;
  margin-bottom: 24px;
  width: 100%;
  min-height: 500px;
}

/* 左滑动画 - 向左切换 */
.slide-left-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  position: absolute;
  top: 0;
  width: 100%;
  left: 0;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 右滑动画 - 向右切换 */
.slide-right-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  position: absolute;
  top: 0;
  width: 100%;
  left: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.tab-description {
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #F9FAFB;
  border-radius: 10px;
  font-size: 13px;
  color: #6B7280;
  line-height: 1.6;
}

/* 任务卡片 - 复制PHP的boxShadow样式 */
.task-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  word-break: break-all;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #F3F4F6;
  position: relative;
  overflow: hidden;
}

/* 推荐应用的任务卡片可以点击 */
.tab-content-recommend .task-card {
  cursor: pointer;
}

.tab-content-recommend .task-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-4px);
  border-color: #E5E7EB;
}

.tab-content-recommend .task-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(79, 70, 229, 0.1);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.tab-content-recommend .task-card:hover::after {
  opacity: 1;
}

/* 我的提取和全站提取的任务卡片不显示点击效果 */
.tab-content-mine .task-card,
.tab-content-all .task-card {
  cursor: default;
}

.task-card:last-child {
  margin-bottom: 0;
}

/* 登录提示框 */
.login-prompt-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

/* 骨架屏样式 */
.skeleton-item {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.skeleton-item :deep(.el-skeleton__item) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 加载更多骨架屏容器 */
.loading-more-skeleton {
  margin-top: 10px;
}

.loading-more-skeleton .skeleton-item {
  margin-bottom: 16px;
}

.loading-more-skeleton .skeleton-item:last-child {
  margin-bottom: 0;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #9CA3AF;
  font-size: 13px;
}

.tasks-list {
  /* 移除内部滚动，使用页面滚动 */
  overflow: visible;
  padding-right: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-container {
    padding: 12px 0 16px 0;
  }
  
  .nut-tabs__titles-item {
    padding: 0 16px;
  }
  
  .tab-content {
    padding: 16px;
  }
  
  /* 确保移动端任务卡片也有圆角 */
  .task-card,
  .boxShadow {
    border-radius: 16px !important;
  }
}

/* PC端样式 */
@media (min-width: 768px) {
  .main-container {
    padding: 16px 0 24px 0;
  }
}
</style>

