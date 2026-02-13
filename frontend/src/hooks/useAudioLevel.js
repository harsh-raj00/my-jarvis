import { useState, useEffect, useRef } from 'react'

const useAudioLevel = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationRef = useRef(null)

  const initializeAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)

      setIsActive(true)
      startAudioAnalysis()
      
      return true
    } catch (error) {
      console.error('Error initializing audio:', error)
      setIsActive(false)
      return false
    }
  }

  const startAudioAnalysis = () => {
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateAudioLevel = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length
      const normalizedLevel = Math.min(1, average / 128)
      
      setAudioLevel(normalizedLevel)
      animationRef.current = requestAnimationFrame(updateAudioLevel)
    }
    
    updateAudioLevel()
  }

  const stopAudio = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    
    setIsActive(false)
    setAudioLevel(0)
  }

  const toggleAudio = async () => {
    if (isActive) {
      stopAudio()
    } else {
      await initializeAudio()
    }
  }

  useEffect(() => {
    return () => {
      stopAudio()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    audioLevel,
    isActive,
    initializeAudio,
    stopAudio,
    toggleAudio
  }
}

export default useAudioLevel