import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Eye, 
  Cpu, 
  Package, 
  Settings,
  BarChart3,
  Zap,
  Server,
  Database
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'

const Sidebar = () => {
  const { activeView, changeView } = useJarvis()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'visualization', icon: Eye, label: '3D View' },
    { id: 'system', icon: Cpu, label: 'System' },
    { id: 'plugins', icon: Package, label: 'Plugins' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ]

  const systemItems = [
    { id: 'monitor', icon: Server, label: 'Monitor' },
    { id: 'database', icon: Database, label: 'Database' },
    { id: 'performance', icon: Zap, label: 'Performance' },
  ]

  return (
    <div className="w-20 lg:w-64 h-full border-r border-white/10 bg-black/30 backdrop-blur-sm flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-center lg:justify-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-white font-bold text-lg">J.A.R.V.I.S.</h2>
            <p className="text-blue-300/60 text-xs">SYSTEMS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => changeView(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* System Section */}
        <div className="mt-8 px-3">
          <p className="hidden lg:block text-gray-500 text-xs uppercase tracking-wider mb-2">
            System
          </p>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:block text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center justify-center lg:justify-start space-x-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block text-sm">Settings</span>
        </button>
        
        {/* Status Indicator */}
        <div className="mt-4 hidden lg:block">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">Systems Operational</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">All systems nominal</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar