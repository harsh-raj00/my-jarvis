import React, { useState, useEffect } from 'react'
import { Cpu, Zap, MessageCircle, Settings } from 'lucide-react'

export default function SimpleDashboard() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'J.A.R.V.I.S. Core Online', sender: 'system', time: new Date().toLocaleTimeString() }
  ])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('ready')
  const [systemInfo, setSystemInfo] = useState({
    cpu: '---',
    memory: '---',
    status: '⚫ Connecting...'
  })

  // Fetch system health on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/system/health')
        const data = await response.json()
        setSystemInfo({
          cpu: `${data.cpu_usage?.toFixed(1) || '0'}%`,
          memory: `${data.memory_usage?.toFixed(1) || '0'}%`,
          status: '🟢 Online'
        })
      } catch (err) {
        console.error('Health check failed:', err)
        setSystemInfo(prev => ({ ...prev, status: '🔴 Backend Offline' }))
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStatus('thinking')

    try {
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      if (response.ok) {
        const data = await response.json()
        const jarvisMsg = {
          id: Date.now() + 1,
          text: data.response || 'I processed your message.',
          sender: 'jarvis',
          time: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, jarvisMsg])
      } else {
        throw new Error('API error')
      }
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = {
        id: Date.now() + 1,
        text: '⚠️ Backend unavailable. Please check if server is running.',
        sender: 'error',
        time: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMsg])
    }

    setStatus('ready')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-blue-950 overflow-hidden">
      {/* Header */}
      <div className="border-b border-blue-500/20 bg-black/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 tracking-wider">J.A.R.V.I.S.</h1>
              <p className="text-gray-400 text-sm">Enterprise AI Assistant v1.0</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-300 font-mono text-sm">{systemInfo.status}</p>
                <p className="text-gray-500 text-xs">CPU: {systemInfo.cpu} | MEM: {systemInfo.memory}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-blue-500/20 bg-black/30 overflow-y-auto">
          <div className="p-4 space-y-2">
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition">
              <MessageCircle size={18} />
              Chat
            </button>
            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm font-medium flex items-center gap-2 transition">
              <Cpu size={18} />
              System Monitor
            </button>
            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm font-medium flex items-center gap-2 transition">
              <Zap size={18} />
              Plugins
            </button>
            <button className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm font-medium flex items-center gap-2 transition">
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* Info Box */}
          <div className="m-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-gray-400 font-mono">
              <span className="text-blue-400">Backend:</span> http://localhost:8000
            </p>
            <p className="text-xs text-gray-400 font-mono mt-1">
              <span className="text-blue-400">Frontend:</span> http://localhost:3000
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.sender === 'error'
                      ? 'bg-red-500/20 border border-red-500/50 text-red-100'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                </div>
              </div>
            ))}
            {status === 'thinking' && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-blue-500/20 bg-black/50 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask J.A.R.V.I.S. anything..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={status === 'thinking' || !input.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-white font-medium transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-blue-500/20 bg-black/50 px-6 py-2 text-center text-xs text-gray-500">
        J.A.R.V.I.S. AI Assistant | Status: {status === 'ready' ? '🟢 Ready' : '🟡 Processing'}
      </div>
    </div>
  )
}
