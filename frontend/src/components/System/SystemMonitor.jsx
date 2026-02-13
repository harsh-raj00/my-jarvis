import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Thermometer,
  Activity,
  Server,
  Database,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'
import { formatBytes, formatPercentage } from '../../utils/formatters'

const SystemMonitor = () => {
  const { systemMetrics, runDiagnostics } = useJarvis()
  const [diagnostics, setDiagnostics] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const systemStats = [
    {
      icon: Cpu,
      label: 'CPU',
      value: systemMetrics.cpu,
      unit: '%',
      color: 'blue',
      description: 'Processor utilization',
      thresholds: { warning: 70, critical: 85 }
    },
    {
      icon: MemoryStick,
      label: 'Memory',
      value: systemMetrics.memory,
      unit: '%',
      color: 'green',
      description: 'RAM usage',
      thresholds: { warning: 75, critical: 90 }
    },
    {
      icon: HardDrive,
      label: 'Disk',
      value: systemMetrics.disk,
      unit: '%',
      color: 'purple',
      description: 'Storage utilization',
      thresholds: { warning: 80, critical: 95 }
    },
    {
      icon: Network,
      label: 'Network',
      value: 1200,
      unit: 'Mbps',
      color: 'cyan',
      description: 'Current throughput',
      thresholds: { warning: 800, critical: 1000 }
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: systemMetrics.temperature,
      unit: '°C',
      color: 'orange',
      description: 'System temperature',
      thresholds: { warning: 65, critical: 80 }
    },
    {
      icon: Activity,
      label: 'Processes',
      value: 247,
      unit: '',
      color: 'pink',
      description: 'Active processes',
      thresholds: { warning: 300, critical: 400 }
    }
  ]

  const systemServices = [
    { name: 'AI Processor', status: 'running', icon: Zap, color: 'green' },
    { name: 'Database', status: 'running', icon: Database, color: 'green' },
    { name: 'Web Server', status: 'running', icon: Server, color: 'green' },
    { name: 'Security', status: 'warning', icon: Shield, color: 'yellow' },
    { name: 'Backup', status: 'stopped', icon: Download, color: 'red' },
    { name: 'Sync', status: 'running', icon: Upload, color: 'green' },
  ]

  const recentEvents = [
    { time: '2 min ago', message: 'CPU usage spiked to 85%', type: 'warning' },
    { time: '5 min ago', message: 'Security scan completed', type: 'info' },
    { time: '15 min ago', message: 'Database backup initiated', type: 'info' },
    { time: '30 min ago', message: 'System temperature normal', type: 'success' },
    { time: '1 hour ago', message: 'Network throughput optimized', type: 'success' },
  ]

  const handleRunDiagnostics = async () => {
    setIsRefreshing(true)
    const results = await runDiagnostics()
    setDiagnostics(results)
    setIsRefreshing(false)
  }

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-400'
    if (value >= thresholds.warning) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusIcon = (value, thresholds) => {
    if (value >= thresholds.critical) return XCircle
    if (value >= thresholds.warning) return AlertTriangle
    return CheckCircle
  }

  useEffect(() => {
    handleRunDiagnostics()
  }, [])

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">System Monitor</h2>
          <p className="text-gray-400">Real-time system metrics and diagnostics</p>
        </div>
        <button
          onClick={handleRunDiagnostics}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Running...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {systemStats.map((stat, index) => {
          const StatusIcon = getStatusIcon(stat.value, stat.thresholds)
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{stat.label}</h3>
                    <p className="text-gray-400 text-sm">{stat.description}</p>
                  </div>
                </div>
                <StatusIcon className={`w-5 h-5 ${getStatusColor(stat.value, stat.thresholds)}`} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold text-white">
                      {stat.value.toFixed(1)}
                    </span>
                    <span className="text-lg text-gray-400 ml-1">{stat.unit}</span>
                  </div>
                  <span className={`text-sm ${getStatusColor(stat.value, stat.thresholds)}`}>
                    {stat.value >= stat.thresholds.critical ? 'Critical' : 
                     stat.value >= stat.thresholds.warning ? 'Warning' : 'Normal'}
                  </span>
                </div>
                
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400 rounded-full`}
                    style={{ width: `${Math.min(100, stat.value)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0{stat.unit}</span>
                  <span>{stat.thresholds.warning}{stat.unit}</span>
                  <span>{stat.thresholds.critical}{stat.unit}</span>
                  <span>100{stat.unit}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Services & Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Services Status</h3>
            <Server className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {systemServices.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${service.color}-500/10`}>
                    <service.icon className={`w-4 h-4 text-${service.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white">{service.name}</p>
                    <p className="text-gray-400 text-sm">System service</p>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs ${
                  service.status === 'running' 
                    ? 'bg-green-500/20 text-green-400'
                    : service.status === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {service.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Last updated</span>
              <span className="text-white">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.div>

        {/* System Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Events</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white">{event.message}</p>
                  <p className="text-gray-500 text-sm mt-1">{event.time}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  event.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  event.type === 'success' ? 'bg-green-500/20 text-green-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {event.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400 text-sm">Normal</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-400 text-sm">Warning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-400 text-sm">Critical</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Diagnostics Results */}
      {diagnostics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Diagnostics Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diagnostics.map((diag, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{diag.component}</span>
                  {diag.status ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  {diag.status ? 'All checks passed' : 'Issues detected'}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">
                  Overall Status: <span className="text-green-400">Healthy</span>
                </p>
                <p className="text-gray-400 text-sm">
                  {diagnostics.filter(d => d.status).length}/{diagnostics.length} components operational
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
                View Detailed Report
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SystemMonitor