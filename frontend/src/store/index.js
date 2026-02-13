import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // User Preferences
      preferences: {
        voiceEnabled: true,
        animations: true,
        notifications: true,
        autoSave: true,
        language: 'en-US'
      },
      setPreferences: (preferences) => set({ preferences }),

      // Conversations
      conversations: [],
      addConversation: (conversation) =>
        set(state => ({
          conversations: [conversation, ...state.conversations.slice(0, 99)]
        })),
      clearConversations: () => set({ conversations: [] }),

      // Plugins
      plugins: [],
      setPlugins: (plugins) => set({ plugins }),
      togglePlugin: (pluginId, enabled) =>
        set(state => ({
          plugins: state.plugins.map(plugin =>
            plugin.id === pluginId ? { ...plugin, enabled } : plugin
          )
        })),

      // System Settings
      settings: {
        apiKey: '',
        endpoint: import.meta.env.VITE_API_URL || 'http://localhost:8000',
        maxTokens: 1000,
        temperature: 0.7
      },
      setSettings: (settings) => set({ settings }),

      // UI State
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),

      notifications: [],
      addNotification: (notification) =>
        set(state => ({
          notifications: [...state.notifications, notification].slice(0, 5)
        })),
      removeNotification: (id) =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      // Clear all data
      clearAll: () => set({
        conversations: [],
        plugins: [],
        notifications: []
      })
    }),
    {
      name: 'jarvis-store',
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        conversations: state.conversations,
        plugins: state.plugins,
        settings: state.settings
      })
    }
  )
)

// Selectors
export const useTheme = () => useStore(state => state.theme)
export const usePreferences = () => useStore(state => state.preferences)
export const useConversations = () => useStore(state => state.conversations)
export const usePlugins = () => useStore(state => state.plugins)
export const useSettings = () => useStore(state => state.settings)
export const useIsLoading = () => useStore(state => state.isLoading)
export const useNotifications = () => useStore(state => state.notifications)


// --- ADD THIS AT THE BOTTOM OF src/store/index.js ---

/**
 * This "store" object is a bridge. 
 * It lets your api.js call .dispatch() to update your Zustand state.
 */
export const store = {
  dispatch: ({ type, payload }) => {
    // This gets the current state of your Zustand store
    const state = useStore.getState();

    // This maps the Redux-style calls to your Zustand functions
    if (type === 'SET_LOADING') {
      state.setIsLoading(payload);
    } else if (type === 'ADD_NOTIFICATION') {
      state.addNotification(payload);
    }
  }
};