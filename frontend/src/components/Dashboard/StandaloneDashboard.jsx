import React, { useState, useEffect, useRef } from 'react'

export default function StandaloneDashboard() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    timestamp: new Date()
  })
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Check backend status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/health')
        if (res.ok) {
          setBackendStatus('online')
        }
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
      try {
        const res = await fetch('http://localhost:8000/api/v1/system/health')
        if (res.ok) {
          const data = await res.json()
          setSystemMetrics({
            cpu: data.cpu_usage || 0,
            memory: data.memory_usage || 0,
            disk: data.disk_usage || 0,
            timestamp: new Date()
          })
        }
      } catch (e) {
        console.error('Metrics fetch error:', e)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      const data = await res.json()
      const response = data.response || data.message || 'No response'

      setMessages(prev => [...prev, { role: 'assistant', text: response, id: Date.now() + 1 }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'error', text: `Error: ${e.message}`, id: Date.now() + 1 }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #334155',
        backgroundColor: '#1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
          J.A.R.V.I.S. Dashboard
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: backendStatus === 'online' ? '#0f766e' : '#7f1d1d',
          borderRadius: '20px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: backendStatus === 'online' ? '#10b981' : '#ef4444'
          }} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>
            {backendStatus === 'online' ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        gap: '16px',
        padding: '16px'
      }}>
        {/* Left - Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}>
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#64748b',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <p>Start a conversation with Gemini AI</p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: msg.role === 'user' ? '#1e40af' : msg.role === 'error' ? '#7f1d1d' : '#334155',
                  color: msg.role === 'error' ? '#fecaca' : '#e2e8f0',
                  wordWrap: 'break-word'
                }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#334155',
                  display: 'flex',
                  gap: '4px'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#60a5fa',
                      animation: `pulse 1.5s infinite`,
                      animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #334155',
            backgroundColor: '#0f172a',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
              placeholder="Type your message..."
              disabled={loading || backendStatus === 'offline'}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '14px',
                outline: 'none',
                cursor: backendStatus === 'offline' ? 'not-allowed' : 'text'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || backendStatus === 'offline' || !input.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: loading || backendStatus === 'offline' ? '#475569' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || backendStatus === 'offline' ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right - System Status */}
        <div style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Health Card */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
            padding: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
              📊 System Health
            </h3>

            {/* CPU */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span>CPU</span>
                <span style={{ color: '#60a5fa' }}>{systemMetrics.cpu.toFixed(1)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#0f172a',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(systemMetrics.cpu, 100)}%`,
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Memory */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span>Memory</span>
                <span style={{ color: '#a78bfa' }}>{systemMetrics.memory.toFixed(1)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#0f172a',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(systemMetrics.memory, 100)}%`,
                  backgroundColor: '#a855f7',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            {/* Disk */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                <span>Disk</span>
                <span style={{ color: '#f59e0b' }}>{systemMetrics.disk.toFixed(1)}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#0f172a',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(systemMetrics.disk, 100)}%`,
                  backgroundColor: '#f59e0b',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
            padding: '12px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>🔌 Backend</p>
            <p style={{ margin: 0, color: backendStatus === 'online' ? '#10b981' : '#ef4444' }}>
              {backendStatus === 'online' ? 'Connected ✓' : 'Offline ✗'}
            </p>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
            padding: '12px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <p style={{ margin: 0 }}>💬 {messages.length} messages</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px' }}>
              Updated: {systemMetrics.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
