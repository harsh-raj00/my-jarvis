import axios from 'axios'
import { store } from '../store'

// Create axios instance
// export const jarvisAPI = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   }
// })

export const jarvisAPI = axios.create({
  // Use the v1 prefix so chat, speech, and plugins work automatically
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1', 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor
jarvisAPI.interceptors.request.use(
  (config) => {
    // Add loading state
    store.dispatch({ type: 'SET_LOADING', payload: true })
    
    // Add timestamp
    config.metadata = { startTime: new Date() }
    
    // Add auth token if available
    const token = localStorage.getItem('jarvis_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    
    return config
  },
  (error) => {
    store.dispatch({ type: 'SET_LOADING', payload: false })
    return Promise.reject(error)
  }
)

// Response interceptor
jarvisAPI.interceptors.response.use(
  (response) => {
    const endTime = new Date()
    const startTime = response.config.metadata?.startTime
    const duration = startTime ? endTime - startTime : 0
    
    store.dispatch({ type: 'SET_LOADING', payload: false })
    
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, response.data)
    
    return response
  },
  (error) => {
    store.dispatch({ type: 'SET_LOADING', payload: false })
    
    const endTime = new Date()
    const startTime = error.config?.metadata?.startTime
    const duration = startTime ? endTime - startTime : 0
    
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`, error.response?.data || error.message)
    
    // Handle specific errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem('jarvis_token')
      window.location.href = '/login'
    } else if (error.response?.status === 429) {
      // Rate limited
      store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'warning',
          title: 'Rate Limited',
          message: 'Too many requests, please wait a moment'
        }
      })
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Connection Timeout',
          message: 'Request took too long to complete'
        }
      })
    } else if (!navigator.onLine) {
      // Offline
      store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Offline',
          message: 'No internet connection detected'
        }
      })
    }
    
    return Promise.reject(error)
  }
)

// WebSocket service
class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.listeners = new Map()
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const baseUrl = import.meta.env.VITE_WS_URL || 'localhost:8000'
    
    this.socket = new WebSocket(`${protocol}//${baseUrl}/ws`)
    
    this.socket.onopen = () => {
      console.log('🔗 WebSocket connected')
      this.reconnectAttempts = 0
      
      store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Real-time Connected',
          message: 'Live updates enabled'
        }
      })
    }
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit(data.type, data.payload)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    this.socket.onclose = () => {
      console.log('🔌 WebSocket disconnected')
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++
          this.reconnectDelay *= 1.5
          console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`)
          this.connect()
        }, this.reconnectDelay)
      }
    }
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  emit(type, payload) {
    const listeners = this.listeners.get(type) || []
    listeners.forEach(callback => callback(payload))
  }
  
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(callback)
  }
  
  off(type, callback) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
  
  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }))
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const wsService = new WebSocketService()

// API Functions
export const chatAPI = {
  sendMessage: (message, sessionId = null) => 
    jarvisAPI.post('/chat', { message, session_id: sessionId }),
  
  getHistory: (limit = 50) => 
    jarvisAPI.get(`/chat/history?limit=${limit}`),
  
  clearHistory: () => 
    jarvisAPI.delete('/chat/history'),
  
  streamResponse: (message, onChunk, onComplete) => {
    const eventSource = new EventSource(`${jarvisAPI.defaults.baseURL}/chat/stream?message=${encodeURIComponent(message)}`)
    
    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close()
        onComplete?.()
      } else {
        const data = JSON.parse(event.data)
        onChunk?.(data.text)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      eventSource.close()
    }
    
    return () => eventSource.close()
  }
}

export const speechAPI = {
  speechToText: (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    return jarvisAPI.post('/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  textToSpeech: (text, voice = 'jarvis') =>
    jarvisAPI.post('/speech/synthesize', { text, voice }),
  
  getVoices: () =>
    jarvisAPI.get('/speech/voices')
}

export const pluginAPI = {
  getAll: () => jarvisAPI.get('/plugins'),
  
  get: (id) => jarvisAPI.get(`/plugins/${id}`),
  
  toggle: (id, enabled) => 
    jarvisAPI.put(`/plugins/${id}/toggle`, { enabled }),
  
  install: (pluginUrl) =>
    jarvisAPI.post('/plugins/install', { url: pluginUrl }),
  
  uninstall: (id) =>
    jarvisAPI.delete(`/plugins/${id}`),
  
  updateConfig: (id, config) =>
    jarvisAPI.put(`/plugins/${id}/config`, config)
}

export const skillsAPI = {
  getAll: () => jarvisAPI.get('/skills'),
  
  get: (name) => jarvisAPI.get(`/skills/${name}`),
  
  toggle: (name, enable) => 
    jarvisAPI.post(`/skills/${name}/toggle`, { enable }),
  
  getAvailable: () => jarvisAPI.get('/skills/available')
}

export const systemAPI = {
  getHealth: () => jarvisAPI.get('/system/health'),
  
  getMetrics: () => jarvisAPI.get('/system/metrics'),
  
  getLogs: (limit = 100) => jarvisAPI.get(`/system/logs?limit=${limit}`),
  
  clearLogs: () => jarvisAPI.delete('/system/logs'),
  
  restart: () => jarvisAPI.post('/system/restart'),
  
  shutdown: () => jarvisAPI.post('/system/shutdown'),
  
  update: () => jarvisAPI.post('/system/update')
}

export const userAPI = {
  login: (credentials) => jarvisAPI.post('/auth/login', credentials),
  
  register: (userData) => jarvisAPI.post('/auth/register', userData),
  
  getProfile: () => jarvisAPI.get('/user/profile'),
  
  updateProfile: (profile) => jarvisAPI.put('/user/profile', profile),
  
  changePassword: (passwords) => 
    jarvisAPI.put('/user/password', passwords),
  
  getPreferences: () => jarvisAPI.get('/user/preferences'),
  
  updatePreferences: (preferences) =>
    jarvisAPI.put('/user/preferences', preferences)
}

// Utility functions
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return jarvisAPI.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress?.(percent)
    }
  })
}

export const downloadFile = async (url, filename) => {
  const response = await jarvisAPI.get(url, { responseType: 'blob' })
  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

export default jarvisAPI