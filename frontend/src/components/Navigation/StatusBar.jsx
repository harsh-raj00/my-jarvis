import React, { useEffect, useState } from 'react'
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Thermometer,
  Clock
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'

const StatusBar = () => {
  const { systemMetrics } = useJarvis()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const StatusItem = ({ icon: Icon, label, value, unit = '', color = 'blue' }) => {
    const colorClasses = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400',
      purple: 'text-purple-400'
    }

    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <div className="text-right">
          <div className="text-sm text-white font-mono">
            {value}
            {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
          </div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-12 border-t border-white/10 bg-black/30 backdrop-blur-sm px-6">
      <div className="h-full flex items-center justify-between">
        {/* Left Section - System Info */}
        <div className="flex items-center space-x-2">
          <StatusItem
            icon={Cpu}
            label="CPU"
            value={`${systemMetrics.cpu.toFixed(1)}`}
            unit="%"
            color={systemMetrics.cpu > 80 ? 'red' : systemMetrics.cpu > 60 ? 'yellow' : 'green'}
          />
          
          <StatusItem
            icon={MemoryStick}
            label="Memory"
            value={`${systemMetrics.memory.toFixed(1)}`}
            unit="%"
            color={systemMetrics.memory > 85 ? 'red' : systemMetrics.memory > 70 ? 'yellow' : 'green'}
          />
          
          <StatusItem
            icon={HardDrive}
            label="Disk"
            value={`${systemMetrics.disk.toFixed(1)}`}
            unit="%"
            color={systemMetrics.disk > 90 ? 'red' : systemMetrics.disk > 75 ? 'yellow' : 'green'}
          />
          
          <StatusItem
            icon={Network}
            label="Network"
            value="1.2"
            unit="Gbps"
            color="blue"
          />
          
          <StatusItem
            icon={Thermometer}
            label="Temp"
            value={`${systemMetrics.temperature.toFixed(1)}`}
            unit="°C"
            color={systemMetrics.temperature > 75 ? 'red' : systemMetrics.temperature > 60 ? 'yellow' : 'green'}
          />
        </div>

        {/* Right Section - Time & Status */}
        <div className="flex items-center space-x-4">
          {/* Time */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-blue-400" />
            <div className="text-right">
              <div className="text-sm text-white font-mono">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>
            </div>
          </div>

          {/* System Uptime */}
          <div className="hidden lg:block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm text-white font-mono">24D 16H 32M</div>
            <div className="text-xs text-gray-500">UPTIME</div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'].map((color, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${color} animate-pulse`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-mono">ALL SYSTEMS GO</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusBar