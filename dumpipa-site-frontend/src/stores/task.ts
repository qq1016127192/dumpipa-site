import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types'
import { getMyTasks, getAllTasks, getTaskStatus } from '@/api/task'

export const useTaskStore = defineStore('task', () => {
  const myTasks = ref<Task[]>([])
  const allTasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref<boolean>(false)

  // 获取我的任务列表
  const fetchMyTasks = async (page = 1, pageSize = 10) => {
    loading.value = true
    try {
      const res = await getMyTasks({ page, page_size: pageSize })
      if (res.ok === 1) {
        myTasks.value = res.tasks
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取全站任务列表
  const fetchAllTasks = async (page = 1, pageSize = 20, includeDone = true) => {
    loading.value = true
    try {
      const res = await getAllTasks({ page, page_size: pageSize, include_done: includeDone })
      if (res.ok === 1) {
        allTasks.value = res.tasks
      }
    } catch (error) {
      console.error('获取全站任务列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取任务详情
  const fetchTaskDetail = async (id: number) => {
    loading.value = true
    try {
      const res = await getTaskStatus(id)
      if (res.ok === 1) {
        currentTask.value = {
          id,
          bundle_id: '',
          app_name: '',
          country: 'cn',
          status: res.status,
          progress: res.progress,
          version: res.version || '',
          created_at: '',
          log: res.log,
          result_path: res.result_path,
          alist_url: res.alist_url,
          alist_path: res.alist_path,
          upload_time: res.upload_time,
          size: res.size,
        }
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 更新任务状态 (用于轮询)
  const updateTaskStatus = async (id: number) => {
    try {
      const res = await getTaskStatus(id)
      if (res.ok === 1) {
        // 更新 myTasks 中的任务
        const index = myTasks.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          const task = myTasks.value[index]
          if (task) {
            task.status = res.status
            task.progress = res.progress
            task.alist_url = res.alist_url
          }
        }
        
        // 如果当前任务是这个,也更新
        if (currentTask.value && currentTask.value.id === id) {
          currentTask.value.status = res.status
          currentTask.value.progress = res.progress
          currentTask.value.alist_url = res.alist_url
        }
        
        return res
      }
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }

  return {
    myTasks,
    allTasks,
    currentTask,
    loading,
    fetchMyTasks,
    fetchAllTasks,
    fetchTaskDetail,
    updateTaskStatus,
  }
})

