import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Copy, 
  Trash2,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Hash
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'
import { useAudio } from '../../contexts/AudioContext'

const ChatInterface = () => {
  const { 
    sendMessage, 
    conversations, 
    getConversation, 
    currentConversation,
    voiceActive,
    toggleVoice,
    updateAudioLevel
  } = useJarvis()
  
  const { playSound, getAudioLevel } = useAudio()
  
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [audioVisualizer, setAudioVisualizer] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentConv = selectedConversation || 
    (currentConversation ? getConversation(currentConversation) : null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConv?.messages])

  // Audio visualization
  useEffect(() => {
    if (voiceActive) {
      const interval = setInterval(() => {
        const level = getAudioLevel?.() || Math.random() * 0.5 + 0.3
        updateAudioLevel(level)
        
        // Update visualizer bars
        setAudioVisualizer(prev => {
          const newBars = Array.from({ length: 20 }, (_, i) => 
            Math.sin(Date.now() / 100 + i * 0.5) * level * 30 + 10
          )
          return newBars
        })
      }, 100)
      
      return () => clearInterval(interval)
    } else {
      setAudioVisualizer([])
    }
  }, [voiceActive, getAudioLevel, updateAudioLevel])

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!message.trim() || isProcessing) return

    setIsProcessing(true)
    playSound('click')
    
    try {
      await sendMessage(message)
      setMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceToggle = () => {
    toggleVoice()
    playSound(voiceActive ? 'deactivate' : 'activate')
  }

  const clearConversation = () => {
    setSelectedConversation(null)
    playSound('click')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    playSound('notification')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-full flex">
      {/* Conversations Sidebar */}
      <div className="w-64 lg:w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm hidden lg:block">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-bold">Conversations</h3>
          <p className="text-gray-400 text-sm mt-1">{conversations.length} total</p>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-80px)]">
          <AnimatePresence>
            {conversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-blue-400 text-sm font-mono">
                      {conv.id.substring(0, 8)}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {formatTime(conv.timestamp)}
                  </span>
                </div>
                <p className="text-white text-sm truncate">
                  {conv.messages[0]?.text || 'New conversation'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500 text-xs">
                    {conv.messages.length} messages
                  </span>
                  <div className="flex items-center space-x-1">
                    {conv.messages.some(m => m.sender === 'jarvis') && (
                      <Bot className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          
          {conversations.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-400">No conversations yet</p>
              <p className="text-gray-500 text-sm mt-1">Start chatting with J.A.R.V.I.S.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-bold">Chat with J.A.R.V.I.S.</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm">AI Ready</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-sm">Real-time</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={clearConversation}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence>
            {currentConv ? (
              <div className="space-y-6">
                {currentConv.messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xl rounded-2xl p-4 ${
                      msg.sender === 'user'
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`p-1.5 rounded-full ${
                          msg.sender === 'user'
                            ? 'bg-blue-500/20'
                            : 'bg-green-500/20'
                        }`}>
                          {msg.sender === 'user' ? (
                            <User className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Bot className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {msg.sender === 'user' ? 'You' : 'J.A.R.V.I.S.'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.plugin && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            {msg.plugin}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-white whitespace-pre-wrap">{msg.text}</p>
                      
                      {msg.sender === 'jarvis' && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/10">
                          <button
                            onClick={() => copyToClipboard(msg.text)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            title="Copy response"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xl">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1.5 rounded-full bg-green-500/20">
                          <Bot className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-white">J.A.R.V.I.S.</span>
                        <span className="text-gray-500 text-xs">Processing...</span>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity,
                              delay: i * 0.2 
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center p-8"
              >
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-16 h-16 text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">Start a Conversation</h3>
                <p className="text-gray-400 text-center max-w-md mb-8">
                  J.A.R.V.I.S. is ready to assist you with tasks, answer questions, and help with system operations.
                </p>
                
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {[
                    "What's the system status?",
                    "Check CPU temperature",
                    "Latest security updates",
                    "Weather forecast today"
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(suggestion)}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Visualizer */}
        {voiceActive && audioVisualizer.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 bg-black/30">
            <div className="flex items-center justify-center space-x-1 h-12">
              {audioVisualizer.map((height, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                  animate={{ height: `${height}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            <p className="text-center text-blue-400 text-sm font-mono mt-2 animate-pulse">
              LISTENING... SPEAK NOW
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 lg:p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message or use voice command..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isProcessing}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    voiceActive
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                  disabled={isProcessing}
                >
                  {voiceActive ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={!message.trim() || isProcessing}
              className={`px-6 py-4 rounded-xl font-medium transition-all ${
                message.trim() && !isProcessing
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={message.trim() && !isProcessing ? { scale: 1.02 } : {}}
              whileTap={message.trim() && !isProcessing ? { scale: 0.98 } : {}}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </div>
              )}
            </motion.button>
          </form>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-gray-500 text-sm">
              Press <kbd className="px-2 py-1 bg-white/5 rounded">Enter</kbd> to send • 
              <kbd className="px-2 py-1 bg-white/5 rounded ml-2">Ctrl</kbd> + 
              <kbd className="px-2 py-1 bg-white/5 rounded">Space</kbd> for voice
            </div>
            <div className="text-gray-500 text-sm">
              {conversations.length} conversations
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface