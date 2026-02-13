import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Send, Zap } from 'lucide-react'
import config from '../../config'

export default function EnhancedDashboard() {
  const [messages, setMessages] = useState([])
  const [input, setInputVal] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0, memory: 0, disk: 0, timestamp: new Date()
  })
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [view, setView] = useState('chat')
  const messagesEndRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check backend
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

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${config.API_URL}/system/health`)
        if (res.ok) {
          const d = await res.json()
          setSystemMetrics({ cpu: d.cpu_usage, memory: d.memory_usage, disk: d.disk_usage, timestamp: new Date() })
        }
      } catch (e) {
        console.error('Metrics error:', e)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000)
    return () => clearInterval(interval)
  }, [])

  const speak = async (text) => {
    if (!audioEnabled) return
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1.2
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.error('Speech error:', e)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', text: input, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
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

      // Speak response
      await speak(response)
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: `Error: ${e.message}`, id: Date.now() + 1 }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%)',
      color: '#e2e8f0', fontFamily: 'system-ui', overflow: 'hidden'
    }}>
      {/* Header with Iron Man Logo */}
      <div style={{
        padding: '12px 24px', background: 'rgba(0,0,0,0.4)', borderBottom: '2px solid #d4af37',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Iron Man Arc Reactor Logo */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffd700, #ff6b00)',
            boxShadow: '0 0 20px rgba(255, 107, 0, 0.8), inset 0 0 15px rgba(255, 215, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={20} color="#000" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ffd700', letterSpacing: '2px' }}>
              J.A.R.V.I.S.
            </h1>
            <p style={{ margin: 0, fontSize: '10px', color: '#ff6b00', letterSpacing: '1px' }}>IRON MAN CORE</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            style={{
              padding: '6px 12px', background: audioEnabled ? '#10b981' : '#666',
              color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {audioEnabled ? 'Audio' : 'Mute'}
          </button>

          <div style={{
            padding: '6px 12px', background: backendStatus === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '4px', border: `1px solid ${backendStatus === 'online' ? '#10b981' : '#ef4444'}`
          }}>
            <span style={{ fontSize: '12px', color: backendStatus === 'online' ? '#10b981' : '#ef4444' }}>
              {backendStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', gap: '8px', padding: '8px 16px', background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        {['chat', 'metrics', '3d'].map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              padding: '6px 16px', background: view === tab ? '#ffd700' : 'transparent',
              color: view === tab ? '#000' : '#ffd700', border: `1px solid ${view === tab ? '#ffd700' : 'rgba(212, 175, 55, 0.5)'}`,
              borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px'
            }}
          >
            {tab === 'chat' && '💬 Chat'}
            {tab === 'metrics' && '📊 Metrics'}
            {tab === '3d' && '🎮 3D'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: '16px', padding: '16px' }}>
        {/* Chat View */}
        {view === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', textAlign: 'center' }}>
                  <div><div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div><p>Greetings, Sir. Ready to assist.</p></div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: '8px',
                    background: msg.role === 'user' ? '#1e40af' : msg.role === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(212, 175, 55, 0.1)',
                    color: msg.role === 'error' ? '#ef4444' : '#e2e8f0',
                    border: msg.role === 'error' ? '1px solid #ef4444' : '1px solid rgba(212, 175, 55, 0.3)'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: '#ffd700',
                        animation: 'pulse 1.5s infinite', animationDelay: `${i * 0.2}s`
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', gap: '8px' }}>
              <input
                type="text" value={input} onChange={(e) => setInputVal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                placeholder="Ask J.A.R.V.I.S..." disabled={loading || backendStatus === 'offline'}
                style={{
                  flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage} disabled={loading || backendStatus === 'offline' || !input.trim()}
                style={{
                  padding: '8px 16px', background: loading || backendStatus === 'offline' ? '#666' : '#ffd700',
                  color: loading || backendStatus === 'offline' ? '#ccc' : '#000', border: 'none', borderRadius: '4px',
                  cursor: loading || backendStatus === 'offline' ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Metrics View */}
        {view === 'metrics' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', overflowY: 'auto' }}>
            {[
              { label: 'CPU Usage', value: systemMetrics.cpu, max: 100, color: '#3b82f6' },
              { label: 'Memory Usage', value: systemMetrics.memory, max: 100, color: '#a855f7' },
              { label: 'Disk Usage', value: systemMetrics.disk, max: 100, color: '#f59e0b' },
              { label: 'Backend', value: backendStatus === 'online' ? 'Connected' : 'Offline', color: backendStatus === 'online' ? '#10b981' : '#ef4444' }
            ].map((metric, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px', padding: '16px'
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#ffd700', fontWeight: 'bold' }}>{metric.label}</p>
                {typeof metric.value === 'number' ? (
                  <>
                    <p style={{ margin: '0 0 8px 0', fontSize: '24px', color: metric.color, fontWeight: 'bold' }}>{metric.value.toFixed(1)}%</p>
                    <div style={{ background: 'rgba(0,0,0,0.5)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(metric.value, 100)}%`, height: '100%', background: metric.color, transition: 'width 0.3s' }} />
                    </div>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: '18px', color: metric.color, fontWeight: 'bold' }}>{metric.value}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3D View */}
        {view === '3d' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)',
            flexDirection: 'column', color: '#ffd700', textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔩</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>SUIT DIAGNOSTICS</p>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Arc Reactor: 100% • Systems: Nominal • Suits Active: 8</p>
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
              ▓▓▓▓▓▓▓▓▓▓  Power Cores 100%<br />
              ▓▓▓▓▓░░░░░  Armor Integrity 50%<br />
              ▓▓▓▓▓▓▓▓░░  Repulsor Charge 80%<br />
              ▓▓▓▓▓▓▓▓▓▓  Energy Stable
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
