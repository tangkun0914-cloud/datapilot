/**
 * Axios 请求实例 - DataMap API 层
 * baseURL 来自 VITE_API_BASE_URL，默认 http://localhost:8585/api
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8585/api'

const request = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加认证 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：提取 data，统一错误处理
request.interceptors.response.use(
  (response) => {
    // OpenMetadata API 通常返回 { data: ... }，直接返回 data 便于业务层使用
    return response.data
  },
  (error) => {
    const { response } = error
    if (response) {
      const { status, data } = response
      const message = data?.message || data?.error || `请求失败 (${status})`
      error.message = message
    }
    return Promise.reject(error)
  }
)

export default request
