import React from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  MessageSquare, 
  Zap, 
  Shield, 
  Database,
  Network,
  Cpu,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Cloud
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'

const Dashboard = () => {
  const { systemMetrics, conversations } = useJarvis()

  const stats = [
    { icon: Activity, label: 'CPU Usage', value: `${systemMetrics.cpu}%`, change: '+2.1%', color: 'blue' },
    { icon: Database, label: 'Memory', value: `${systemMetrics.memory}%`, change: '-1.3%', color: 'green' },
    { icon: Cloud, label: 'Storage', value: `${systemMetrics.disk}%`, change: '+0.5%', color: 'purple' },
    { icon: Network, label: 'Network', value: '1.2 Gbps', change: '+15%', color: 'cyan' },
  ]

  const quickActions = [
    { icon: MessageSquare, label: 'New Chat', color: 'blue', action: 'chat' },
    { icon: Zap, label: 'Quick Task', color: 'yellow', action: 'task' },
    { icon: Shield, label: 'Security', color: 'green', action: 'security' },
    { icon: BarChart3, label: 'Analytics', color: 'purple', action: 'analytics' },
  ]

  const recentConversations = conversations.slice(0, 3)

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Tony</h1>
        <p className="text-blue-300/80">J.A.R.V.I.S. systems are operating at peak efficiency</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all hover:scale-[1.02]"
                >
                  <div className={`p-3 rounded-lg bg-${action.color}-500/10 w-fit mb-3`}>
                    <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                  </div>
                  <h3 className="text-white font-medium mb-1">{action.label}</h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300">
                    Execute command
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* System Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">System Activity</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">AI Processor</p>
                    <p className="text-gray-400 text-sm">Neural network operations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">98.7%</p>
                  <p className="text-green-400 text-sm">Optimal</p>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[98.7%]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Chats</h2>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentConversations.length > 0 ? (
                recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
                  >
                    <p className="text-white text-sm mb-2 line-clamp-2">
                      {conv.messages[0]?.text || 'No message'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 text-xs">
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {conv.messages.length} messages
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start chatting with J.A.R.V.I.S.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">System Status</h2>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'AI Core', status: 'optimal', color: 'green' },
                { label: 'Security', status: 'active', color: 'green' },
                { label: 'Network', status: 'stable', color: 'green' },
                { label: 'Database', status: 'synced', color: 'green' },
                { label: 'Backup', status: 'pending', color: 'yellow' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                    <span className="text-gray-300">{item.label}</span>
                  </div>
                  <span className={`text-${item.color}-400 text-sm`}>{item.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard