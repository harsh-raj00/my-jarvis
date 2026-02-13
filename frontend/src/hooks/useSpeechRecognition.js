import { useState, useEffect, useCallback } from 'react'

const useSpeechRecognition = (options = {}) => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const [recognition, setRecognition] = useState(null)

  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd
  } = options

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      return null
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = continuous
    recognitionInstance.interimResults = interimResults
    recognitionInstance.lang = lang

    recognitionInstance.onstart = () => {
      setIsListening(true)
      setError(null)
      onStart?.()
    }

    recognitionInstance.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)
      onResult?.(currentTranscript, interimTranscript, finalTranscript)
    }

    recognitionInstance.onerror = (event) => {
      const error = event.error
      setError(error)
      setIsListening(false)
      onError?.(error)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
      onEnd?.()
    }

    return recognitionInstance
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start()
      } catch (error) {
        setError('Failed to start speech recognition')
        console.error('Speech recognition start error:', error)
      }
    } else if (!recognition) {
      const newRecognition = initializeRecognition()
      if (newRecognition) {
        setRecognition(newRecognition)
        try {
          newRecognition.start()
        } catch (error) {
          setError('Failed to initialize speech recognition')
          console.error('Speech recognition initialization error:', error)
        }
      }
    }
  }, [recognition, isListening, initializeRecognition])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop()
      } catch (error) {
        console.error('Speech recognition stop error:', error)
      }
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  useEffect(() => {
    const recognitionInstance = initializeRecognition()
    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [initializeRecognition])

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }
}

export default useSpeechRecognition