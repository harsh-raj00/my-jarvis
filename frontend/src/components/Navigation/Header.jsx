import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Mic, 
  MicOff, 
  User,
  HelpCircle,
  Globe,
  Wifi,
  Battery
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'

const Header = () => {
  const { voiceActive, toggleVoice, systemStatus } = useJarvis()
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'limited': return 'text-orange-400'
      default: return 'text-red-400'
    }
  }

  return (
    <header className="h-16 border-b border-white/10 bg-black/30 backdrop-blur-sm px-6">
      <div className="h-full flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search commands, settings, or ask J.A.R.V.I.S..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Voice Control */}
          <motion.button
            onClick={toggleVoice}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              voiceActive
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {voiceActive ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="text-sm">Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="text-sm">Activate Voice</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* System Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`} />
            <span className={`text-sm ${getStatusColor()}`}>
              {systemStatus.toUpperCase()}
            </span>
          </div>

          {/* Connectivity */}
          <div className="hidden lg:flex items-center space-x-3 text-gray-400">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">100%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="w-4 h-4" />
              <span className="text-xs">Online</span>
            </div>
            <Globe className="w-4 h-4" />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Help */}
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>

          {/* User Profile */}
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm text-white">Tony Stark</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header