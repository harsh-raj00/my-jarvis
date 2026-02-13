import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const AudioContext = createContext()

const sounds = {
  startup: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='), // Placeholder
  notification: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='),
  click: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='),
  activate: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='),
  deactivate: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ='),
}

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
    }
  }, [])

  const playSound = useCallback((soundName) => {
    if (isMuted || !sounds[soundName]) return
    
    try {
      const sound = sounds[soundName].cloneNode()
      sound.volume = volume
      sound.play().catch(e => console.warn('Audio play failed:', e))
    } catch (error) {
      console.error('Sound error:', error)
    }
  }, [isMuted, volume])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const updateVolume = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
  }, [])

  const getAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    return average / 255
  }, [])

  return (
    <AudioContext.Provider value={{
      isMuted,
      volume,
      playSound,
      toggleMute,
      updateVolume,
      initializeAudio,
      getAudioLevel,
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}