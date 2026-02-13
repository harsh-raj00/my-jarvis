export const API_ENDPOINTS = {
  CHAT: '/chat',
  SPEECH_TO_TEXT: '/speech/transcribe',
  TEXT_TO_SPEECH: '/speech/synthesize',
  PLUGINS: '/plugins',
  SYSTEM_HEALTH: '/system/health',
  SYSTEM_METRICS: '/system/metrics',
  UPLOAD: '/upload'
}

export const VOICE_COMMANDS = {
  ACTIVATE: ['hey jarvis', 'activate', 'wake up'],
  DEACTIVATE: ['go to sleep', 'deactivate', 'standby'],
  SYSTEM_CHECK: ['system status', 'how are you', 'status report'],
  WEATHER: ['weather', 'forecast', 'temperature'],
  TIME: ['what time', 'current time', 'time'],
  HELP: ['help', 'what can you do', 'commands']
}

export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  LIMITED: 'limited',
  OFFLINE: 'offline'
}

export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#0ea5e9',
  ACCENT: '#06b6d4',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#8b5cf6'
}

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
}