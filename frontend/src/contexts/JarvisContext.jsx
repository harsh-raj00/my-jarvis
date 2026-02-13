import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { jarvisAPI } from '../services/api'
import { useAudio } from './AudioContext'
import { v4 as uuidv4 } from 'uuid'

const JarvisContext = createContext()

const initialState = {
  isInitialized: false,
  isLoading: false,
  systemStatus: 'initializing',
  activeView: 'dashboard',
  voiceActive: false,
  audioLevel: 0,
  plugins: [],
  conversations: [],
  currentConversation: null,
  notifications: [],
  systemMetrics: {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    temperature: 0,
  },
  settings: {
    voiceEnabled: true,
    animationsEnabled: true,
    theme: 'dark',
    language: 'en-US',
    responseSpeed: 'normal',
    aiModel: 'gemini-pro',
  },
  userPreferences: {
    name: 'User',
    voicePreference: 'jarvis',
    notificationSounds: true,
    autoSave: true,
  },
  connections: {
    backend: false,
    database: false,
    api: false,
    voice: false,
  }
}

const jarvisReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_SYSTEM_STATUS':
      return { ...state, systemStatus: action.payload }
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload }
    case 'SET_VOICE_ACTIVE':
      return { ...state, voiceActive: action.payload }
    case 'SET_AUDIO_LEVEL':
      return { ...state, audioLevel: action.payload }
    case 'SET_PLUGINS':
      return { ...state, plugins: action.payload }
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [action.payload, ...state.conversations.slice(0, 99)] }
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversation: action.payload }
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload].slice(0, 5)
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case 'UPDATE_SYSTEM_METRICS':
      return { ...state, systemMetrics: { ...state.systemMetrics, ...action.payload } }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'UPDATE_USER_PREFERENCES':
      return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } }
    case 'UPDATE_CONNECTIONS':
      return { ...state, connections: { ...state.connections, ...action.payload } }
    case 'RESET_STATE':
      return initialState
    default:
      return state
  }
}

export const JarvisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jarvisReducer, initialState)
  const { playSound } = useAudio()

  // Initialize J.A.R.V.I.S. Core
  const initializeJarvis = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // 1. Attempt Connection to Backend with timeout
      const healthCheckPromise = jarvisAPI.get('/system/health')
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      )
      
      try {
        const healthCheck = await Promise.race([healthCheckPromise, timeoutPromise])
        
        if (healthCheck.data.status === 'healthy' || healthCheck.data.status === 'operational') {
          dispatch({ type: 'UPDATE_CONNECTIONS', payload: { backend: true } })
          
          // 2. Load sub-systems (non-blocking - errors don't stop initialization)
          try {
            const pluginsResponse = await Promise.race([
              jarvisAPI.get('/plugins'),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ])
            dispatch({ type: 'SET_PLUGINS', payload: pluginsResponse.data || [] })
          } catch (pluginError) {
            console.warn("Plugins failed to load:", pluginError.message)
            dispatch({ type: 'SET_PLUGINS', payload: [] })
          }

          dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'operational' })
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: {
              id: uuidv4(),
              type: 'success',
              title: 'Systems Operational',
              message: 'Core systems linked and ready.'
            }
          })
        }
      } catch (healthError) {
        // Health check failed, but don't block the UI
        console.warn('Health check failed:', healthError.message)
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'operational' })
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: {
            id: uuidv4(),
            type: 'info',
            title: 'Ready',
            message: 'J.A.R.V.I.S. initialized in standalone mode.'
          }
        })
      }
    } catch (error) {
      console.error('Initialization error:', error)
      // Always set to operational so UI is usable
      dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'operational' })
    } finally {
      // 3. UNLOCK UI: These ALWAYS run to prevent black screen
      dispatch({ type: 'SET_INITIALIZED', payload: true })
      dispatch({ type: 'SET_LOADING', payload: false })
      
      // Play sound and tell index.html to hide the loading screen
      try {
        playSound('startup')
      } catch (e) {
        console.warn('Startup sound failed')
      }
      window.dispatchEvent(new Event('react-ready'))
    }
  }, [playSound])

  // Communication Handler
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return null
    
    const conversationId = uuidv4()
    const userMessage = {
      id: uuidv4(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }
    
    dispatch({ 
      type: 'ADD_CONVERSATION', 
      payload: {
        id: conversationId,
        messages: [userMessage],
        timestamp: new Date().toISOString(),
      }
    })
    
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId })
    
    try {
      const response = await jarvisAPI.post('/chat', {
        message,
        session_id: conversationId,
        use_voice: state.settings.voiceEnabled
      })
      
      const jarvisMessage = {
        id: uuidv4(),
        text: response.data.response,
        sender: 'jarvis',
        plugin: response.data.plugin_used,
        timestamp: new Date().toISOString(),
      }
      
      dispatch({ 
        type: 'ADD_CONVERSATION', 
        payload: {
          id: conversationId,
          messages: [userMessage, jarvisMessage],
          timestamp: new Date().toISOString(),
        }
      })
      
      if (state.settings.voiceEnabled) playSound('notification')
      return jarvisMessage
    } catch (error) {
      console.error('AI Processor Error:', error)
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: uuidv4(),
          type: 'error',
          title: 'Uplink Failed',
          message: 'Unable to reach AI processor.'
        }
      })
      return null
    }
  }, [state.settings.voiceEnabled, playSound])

  const toggleVoice = useCallback(() => {
    const newState = !state.voiceActive
    dispatch({ type: 'SET_VOICE_ACTIVE', payload: newState })
    if (newState) {
      playSound('activate')
    } else {
      playSound('deactivate')
    }
  }, [state.voiceActive, playSound])

  const updateAudioLevel = useCallback((level) => {
    dispatch({ type: 'SET_AUDIO_LEVEL', payload: Math.min(1, Math.max(0, level)) })
  }, [])

  const changeView = useCallback((view) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view })
    playSound('click')
  }, [playSound])

  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings })
  }, [])

  const clearNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const getConversation = useCallback((id) => {
    return state.conversations.find(conv => conv.id === id)
  }, [state.conversations])

  const runDiagnostics = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await jarvisAPI.get('/health')
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { id: uuidv4(), type: 'success', title: 'Diagnostics', message: 'All systems green.' }
      })
    } catch (e) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { id: uuidv4(), type: 'error', title: 'Diagnostics', message: 'Core link offline.' }
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const value = {
    ...state,
    initializeJarvis,
    sendMessage,
    toggleVoice,
    updateAudioLevel,
    changeView,
    updateSettings,
    clearNotification,
    getConversation,
    runDiagnostics,
  }

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  )
}

export const useJarvis = () => {
  const context = useContext(JarvisContext)
  if (!context) {
    throw new Error('useJarvis must be used within a JarvisProvider')
  }
  return context
}