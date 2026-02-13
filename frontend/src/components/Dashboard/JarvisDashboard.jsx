import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react'
import { Volume2, VolumeX, Send, Mic, MicOff, Cpu, HardDrive, Wifi, WifiOff, Square } from 'lucide-react'
import VoiceOrb from '../UI/VoiceOrb'
import config from '../../config'

// Lazy load 3D scene
const JarvisScene = lazy(() => import('../3D/JarvisScene').catch(err => {
    console.error('Failed to load 3D scene:', err)
    return { default: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>3D View Unavailable</div> }
}))

/**
 * JarvisDashboard - Main dashboard with VOICE CONTROL
 */
const JarvisDashboard = () => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [backendStatus, setBackendStatus] = useState('checking')
    const [systemMetrics, setSystemMetrics] = useState({ cpu: 0, memory: 0, disk: 0 })
    const [audioEnabled, setAudioEnabled] = useState(true)
    const [voiceState, setVoiceState] = useState('idle') // idle, listening, processing, speaking
    const [audioLevel, setAudioLevel] = useState(0)
    const [transcript, setTranscript] = useState('')

    const messagesEndRef = useRef(null)
    const recognitionRef = useRef(null)

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = false
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                console.log('Voice recognition started')
                setVoiceState('listening')
                setTranscript('')
            }

            recognition.onresult = (event) => {
                let finalTranscript = ''
                let interimTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript
                    } else {
                        interimTranscript += result[0].transcript
                    }
                }

                if (finalTranscript) {
                    const cleanTranscript = finalTranscript.trim()

                    // Check for wake word "Jarvis"
                    if (cleanTranscript.toLowerCase().startsWith('jarvis')) {
                        // Strip wake word and process command
                        const command = cleanTranscript.substring(6).trim()
                        if (command) {
                            setTranscript(finalTranscript) // Show full transcript briefly
                            setInput(command)
                            setTimeout(() => {
                                handleVoiceSubmit(command)
                            }, 300)
                        }
                    } else {
                        console.log('Ignored: No wake word', cleanTranscript)
                        setTranscript(cleanTranscript) // Show what was heard but don't process
                    }
                } else if (interimTranscript) {
                    setTranscript(interimTranscript)
                }
            }

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setVoiceState('idle')
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access to use voice commands.')
                }
            }

            recognition.onend = () => {
                console.log('Voice recognition ended')
                if (voiceState === 'listening') {
                    setVoiceState('idle')
                }
            }

            recognitionRef.current = recognition
        } else {
            console.log('Speech Recognition not supported')
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Check backend health
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const res = await fetch(`${config.API_URL}/health`)
                setBackendStatus(res.ok ? 'online' : 'offline')
            } catch {
                setBackendStatus('offline')
            }
        }
        checkBackend()
        const interval = setInterval(checkBackend, 5000)
        return () => clearInterval(interval)
    }, [])

    // Fetch system metrics
    useEffect(() => {
        const fetchMetrics = async () => {
            if (backendStatus !== 'online') return
            try {
                const res = await fetch(`${config.API_URL}/system/health`)
                if (res.ok) {
                    const d = await res.json()
                    setSystemMetrics({ cpu: d.cpu_usage || 0, memory: d.memory_usage || 0, disk: d.disk_usage || 0 })
                }
            } catch (e) {
                console.error('Metrics error:', e)
            }
        }
        fetchMetrics()
        const interval = setInterval(fetchMetrics, 3000)
        return () => clearInterval(interval)
    }, [backendStatus])

    // Audio level animation
    useEffect(() => {
        let animationId
        const animateAudio = () => {
            if (voiceState === 'listening' || voiceState === 'speaking') {
                setAudioLevel(prev => prev + (0.3 + Math.random() * 0.7 - prev) * 0.15)
            } else {
                setAudioLevel(prev => prev * 0.85)
            }
            animationId = requestAnimationFrame(animateAudio)
        }
        animateAudio()
        return () => cancelAnimationFrame(animationId)
    }, [voiceState])

    // Text-to-Speech
    const speak = useCallback(async (text) => {
        if (!audioEnabled || !window.speechSynthesis) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        setVoiceState('speaking')
        const utterance = new SpeechSynthesisUtterance(text)

        // Try to get a good voice
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || voices[0]
        if (preferredVoice) utterance.voice = preferredVoice

        utterance.rate = 1
        utterance.pitch = 1.1
        utterance.volume = 1

        utterance.onend = () => setVoiceState('idle')
        utterance.onerror = () => setVoiceState('idle')

        window.speechSynthesis.speak(utterance)
    }, [audioEnabled])

    // Stop speaking mid-speech
    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }
        setVoiceState('idle')
    }, [])

    // Start/Stop Voice Recognition
    const toggleVoiceRecognition = () => {
        if (!recognitionRef.current) {
            alert('Voice recognition is not supported in your browser. Please use Chrome.')
            return
        }

        if (voiceState === 'listening') {
            recognitionRef.current.stop()
            setVoiceState('idle')
        } else {
            try {
                recognitionRef.current.start()
            } catch (e) {
                console.error('Failed to start recognition:', e)
            }
        }
    }

    // Handle voice submission
    const handleVoiceSubmit = async (voiceText) => {
        if (!voiceText.trim() || loading) return

        const userMsg = { role: 'user', text: voiceText, id: Date.now(), isVoice: true }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setTranscript('')
        setLoading(true)
        setVoiceState('processing')

        try {
            const res = await fetch(`${config.API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: voiceText })
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const response = data.response || data.message || 'Processing...'
            setMessages(prev => [...prev, { role: 'assistant', text: response, id: Date.now() + 1 }])
            await speak(response)
        } catch (e) {
            setMessages(prev => [...prev, { role: 'error', text: `Error: ${e.message}`, id: Date.now() + 1 }])
            setVoiceState('idle')
        } finally {
            setLoading(false)
        }
    }

    // Handle text submission
    const handleSendMessage = async (e) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = { role: 'user', text: input, id: Date.now() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch(`${config.API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            const response = data.response || data.message || 'Processing...'
            setMessages(prev => [...prev, { role: 'assistant', text: response, id: Date.now() + 1 }])
            if (audioEnabled) await speak(response)
        } catch (e) {
            setMessages(prev => [...prev, { role: 'error', text: `Error: ${e.message}`, id: Date.now() + 1 }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#000814', color: 'white', fontFamily: "'Rajdhani', monospace", display: 'flex', flexDirection: 'column' }}>

            {/* Siri-like Voice Orb Popup */}
            <VoiceOrb
                visible={voiceState !== 'idle'}
                voiceState={voiceState}
                audioLevel={audioLevel}
                transcript={transcript}
                onClose={() => {
                    if (recognitionRef.current && voiceState === 'listening') {
                        recognitionRef.current.stop()
                    }
                    setVoiceState('idle')
                    setTranscript('')
                }}
            />

            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00E5B0, #00AA77)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,229,176,0.5)' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#00FFD4', boxShadow: '0 0 15px rgba(0,255,212,0.8)' }} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', color: '#00E5B0' }}>J.A.R.V.I.S.</h1>
                        <p style={{ margin: 0, fontSize: '10px', color: '#00AA77', letterSpacing: '2px' }}>VOICE ASSISTANT ACTIVE</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Voice State Indicator */}
                    {voiceState !== 'idle' && (
                        <div style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            background: voiceState === 'listening' ? 'rgba(255,68,68,0.3)' : voiceState === 'speaking' ? 'rgba(0,229,176,0.3)' : 'rgba(255,170,0,0.3)',
                            color: voiceState === 'listening' ? '#FF4444' : voiceState === 'speaking' ? '#00E5B0' : '#FFAA00',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: `1px solid ${voiceState === 'listening' ? '#FF4444' : voiceState === 'speaking' ? '#00E5B0' : '#FFAA00'}`,
                            animation: 'pulse 1s infinite'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', animation: 'blink 0.5s infinite' }} />
                            {voiceState === 'listening' ? 'LISTENING...' : voiceState === 'speaking' ? 'SPEAKING...' : 'PROCESSING...'}
                        </div>
                    )}
                    <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', background: backendStatus === 'online' ? 'rgba(0,200,100,0.2)' : 'rgba(255,50,50,0.2)', color: backendStatus === 'online' ? '#00dd66' : '#ff4444', border: `1px solid ${backendStatus === 'online' ? 'rgba(0,200,100,0.3)' : 'rgba(255,50,50,0.3)'}` }}>
                        {backendStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {backendStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    <button onClick={() => setAudioEnabled(!audioEnabled)} style={{ padding: '8px', borderRadius: '8px', background: audioEnabled ? 'rgba(0,229,176,0.2)' : 'rgba(100,100,100,0.2)', border: 'none', color: audioEnabled ? '#00E5B0' : '#666', cursor: 'pointer' }}>
                        {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', gap: '16px', padding: '16px', minHeight: 0 }}>

                {/* Left: 3D Scene */}
                <div style={{ flex: '0 0 60%', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00E5B0' }}>Loading 3D...</div>}>
                        <JarvisScene isActive={true} voiceState={voiceState} audioLevel={audioLevel} systemMetrics={systemMetrics} />
                    </Suspense>

                    {/* Listening Transcript Overlay */}
                    {voiceState === 'listening' && transcript && (
                        <div style={{
                            position: 'absolute',
                            bottom: '70px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '12px 24px',
                            background: 'rgba(0,0,0,0.8)',
                            borderRadius: '12px',
                            border: '1px solid #FF4444',
                            fontSize: '16px',
                            color: '#FFF',
                            maxWidth: '80%',
                            textAlign: 'center'
                        }}>
                            "{transcript}"
                        </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', padding: '8px 16px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', fontSize: '10px', color: '#00E5B0', letterSpacing: '2px' }}>HOLOGRAPHIC DISPLAY</div>
                </div>

                {/* Right: Chat & Controls */}
                <div style={{ flex: '0 0 40%', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

                    {/* Chat */}
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h2 style={{ margin: 0, fontSize: '14px', color: '#00E5B0', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: voiceState !== 'idle' ? '#00E5B0' : '#333', boxShadow: voiceState !== 'idle' ? '0 0 10px #00E5B0' : 'none' }} />
                                NEURAL LINK
                            </h2>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                            {messages.length === 0 && (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                    <Mic size={32} style={{ marginBottom: '12px', opacity: 0.5, color: '#00E5B0' }} />
                                    <p style={{ margin: 0, fontSize: '14px' }}>Good evening, Sir.</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#444' }}>Click the microphone or type a command...</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ marginBottom: '12px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(0,180,140,0.6), rgba(0,120,100,0.6))' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'error' ? '#ff6666' : 'white',
                                        border: msg.role === 'error' ? '1px solid rgba(255,100,100,0.3)' : 'none'
                                    }}>
                                        {msg.isVoice && <span style={{ fontSize: '10px', color: '#00E5B0', marginRight: '8px' }}>🎤</span>}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '6px', padding: '12px' }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E5B0', animation: `bounce 0.6s ${i * 0.1}s infinite` }} />)}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Voice / Stop Button */}
                            {voiceState === 'speaking' ? (
                                <button
                                    type="button"
                                    onClick={stopSpeaking}
                                    title="Stop Jarvis"
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #FF4444, #CC0000)',
                                        color: '#FFF',
                                        border: '2px solid #FF4444',
                                        cursor: 'pointer',
                                        boxShadow: '0 0 20px rgba(255,68,68,0.5)',
                                        animation: 'pulse 1s infinite',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Square size={20} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={toggleVoiceRecognition}
                                    disabled={loading}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: voiceState === 'listening' ? 'linear-gradient(135deg, #FF4444, #CC0000)' : 'rgba(0,229,176,0.2)',
                                        color: voiceState === 'listening' ? '#FFF' : '#00E5B0',
                                        border: voiceState === 'listening' ? '2px solid #FF4444' : '2px solid transparent',
                                        cursor: 'pointer',
                                        boxShadow: voiceState === 'listening' ? '0 0 20px rgba(255,68,68,0.5)' : 'none',
                                        animation: voiceState === 'listening' ? 'pulse 1s infinite' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {voiceState === 'listening' ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                            )}
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={voiceState === 'speaking' ? 'Jarvis is speaking... click ■ to stop' : 'Speak or type a command...'}
                                disabled={loading || backendStatus === 'offline'}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', outline: 'none' }}
                            />
                            <button type="submit" disabled={loading || !input.trim()} style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #00E5B0, #00AA77)', color: '#000', border: 'none', cursor: 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'CPU', value: systemMetrics.cpu, icon: Cpu, color: '#00E5B0' },
                            { label: 'MEMORY', value: systemMetrics.memory, icon: HardDrive, color: '#AA66FF' },
                            { label: 'DISK', value: systemMetrics.disk, icon: HardDrive, color: '#FFAA00' }
                        ].map(m => (
                            <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <m.icon size={16} style={{ color: m.color, marginBottom: '8px' }} />
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(m.value)}%</div>
                                <div style={{ fontSize: '10px', color: '#666', letterSpacing: '1px' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>
        </div>
    )
}

export default JarvisDashboard
