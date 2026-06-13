import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

type RequestInstance = {
  <T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>
  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  head<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  options<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
  post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>
  put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>
  patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>
}

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // HTTP状态码401才是真正的未授权，需要退出登录
    // 但这里不处理，交给error拦截器统一处理
    // 如果响应不是成功状态（业务错误，但HTTP状态码正常）
    if (res.ok === 0) {
      // 只有HTTP 401才退出登录，业务错误(ok:0)不退出
      if (response.status === 401) {
        // 清除token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // 延迟跳转，避免阻塞当前请求
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
        return Promise.reject(new Error('未授权,请重新登录'))
      }
      
      ElMessage.error(res.msg || res.error || '请求失败')
      return Promise.reject(new Error(res.msg || res.error || '请求失败'))
    }
    
    return res as any
  },
  async (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 401未授权，清除登录信息并跳转
          // 但如果是管理后台页面，应该跳转到管理后台登录页
          const currentPath = window.location.pathname
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // 使用setTimeout延迟，避免阻塞
          setTimeout(() => {
            ElMessage.error('未授权,请重新登录')
            if (currentPath.startsWith('/admin')) {
              window.location.href = '/admin/login'
            } else {
              window.location.href = '/login'
            }
          }, 100)
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.msg || '请求失败')
      }
    } else {
      ElMessage.error('网络错误,请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

const createDataPromise = <T>(promise: Promise<T>) => promise

const request = (<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.request<T, T, D>(config))
}) as RequestInstance

request.get = <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.get<T, T, D>(url, config))
}

request.delete = <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.delete<T, T, D>(url, config))
}

request.head = <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.head<T, T, D>(url, config))
}

request.options = <T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.options<T, T, D>(url, config))
}

request.post = <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.post<T, T, D>(url, data, config))
}

request.put = <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.put<T, T, D>(url, data, config))
}

request.patch = <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> => {
  return createDataPromise(service.patch<T, T, D>(url, data, config))
}

export default request

