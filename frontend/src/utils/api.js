import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api

// Optional: global 401 handler to redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      // token invalid or expired
      // Avoid infinite loops: only redirect if not already on login
      const isLogin = typeof window !== 'undefined' && window.location.pathname.includes('/login')
      if (!isLogin) {
        // Clear token and redirect
        try { localStorage.removeItem('access_token') } catch {}
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
