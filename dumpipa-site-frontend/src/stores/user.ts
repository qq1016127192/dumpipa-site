import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/api/auth'
import type { LoginParams } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 从localStorage恢复token和用户信息
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')
  
  console.log('🔐 初始化UserStore:', { 
    hasToken: !!storedToken, 
    hasUser: !!storedUser,
    user: storedUser ? JSON.parse(storedUser) : null 
  })
  
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null)
  const token = ref<string>(storedToken || '')
  
  // 添加恢复状态的方法（供路由守卫调用）
  const restoreFromStorage = () => {
    const currentToken = localStorage.getItem('token')
    const currentUser = localStorage.getItem('user')
    if (currentToken && currentUser) {
      token.value = currentToken
      try {
        user.value = JSON.parse(currentUser)
      } catch (e) {
        console.error('恢复用户信息失败:', e)
        // 解析失败，清除无效数据
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        token.value = ''
        user.value = null
      }
    } else {
      // localStorage没有数据，确保store也被清空
      token.value = ''
      user.value = null
    }
  }
  
  // 使用computed而不是ref,确保响应式
  const isLoggedIn = computed(() => {
    const loggedIn = !!token.value && !!user.value
    console.log('🔐 isLoggedIn状态:', loggedIn, { token: !!token.value, user: !!user.value })
    return loggedIn
  })

  // 登录
  const login = async (params: LoginParams) => {
    const res = await loginApi(params)
    console.log('登录API响应:', res)
    if (res.ok === 1) {
      // 后端返回的数据在 res.data 中
      const loginData = res.data || res
      const userData = loginData.user
      const tokenData = loginData.token
      
      if (userData) {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData)) // 保存用户信息
      }
      
      if (tokenData) {
        token.value = tokenData
        localStorage.setItem('token', tokenData)
      }
      
      console.log('✅ 登录成功,已保存到localStorage:', {
        token: tokenData ? tokenData.substring(0, 20) + '...' : '无token',
        user: userData
      })
      return true
    }
    return false
  }

  // 登出
  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      user.value = null
      token.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user') // 清除用户信息
      console.log('✅ 已登出,清除localStorage')
    }
  }

  // 获取当前用户信息 (可选功能,目前不使用)
  const fetchUserInfo = async () => {
    if (!token.value) {
      console.log('⚠️ 无token,跳过获取用户信息')
      return
    }
    
    try {
      const res = await getCurrentUser()
      if (res.ok === 1) {
        user.value = res.user
        localStorage.setItem('user', JSON.stringify(res.user)) // 更新用户信息
        console.log('✅ 获取用户信息成功:', res.user)
      }
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error)
      // 注意: 这里不自动登出,因为localStorage中已有用户信息
      console.warn('⚠️ 使用localStorage中的用户信息')
    }
  }

  // 检查是否为管理员
  const isAdmin = (): boolean => {
    // 检查 is_admin 字段（数据库中的字段）
    return user.value?.is_admin === 1 || user.value?.is_admin === true
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
    isAdmin,
    restoreFromStorage,
  }
})

