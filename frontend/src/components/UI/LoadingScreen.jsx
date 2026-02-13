import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-blue-950 z-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            J.A.R.V.I.S.
          </h1>
          <p className="text-blue-300/80 mt-2 tracking-widest">ENTERPRISE AI SYSTEMS</p>
        </motion.div>

        {/* Loading Indicator */}
        <div className="relative">
          <div className="w-64 h-64 mx-auto mb-8">
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 border-4 border-blue-500/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle Ring */}
            <motion.div
              className="absolute inset-8 border-4 border-cyan-500/40 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner Ring */}
            <motion.div
              className="absolute inset-16 border-4 border-purple-500/50 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Central Orb */}
            <motion.div
              className="absolute inset-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Progress Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-blue-300 font-mono text-sm mb-2">INITIALIZING SYSTEMS...</p>
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>

        {/* Status Messages */}
        <div className="mt-8 space-y-2">
          {[
            "LOADING NEURAL NETWORK...",
            "CALIBRATING SENSORS...",
            "ESTABLISHING VOICE LINK...",
            "SYNCHRONIZING DATABASES...",
            "INITIALIZING 3D RENDERER..."
          ].map((text, index) => (
            <motion.p
              key={index}
              className="text-green-400/80 text-xs font-mono"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.3 }}
            >
              ✓ {text}
            </motion.p>
          ))}
        </div>

        {/* Version Info */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-gray-500 text-xs font-mono">
            MARK XLII • v1.0.0 • SYSTEMS ONLINE
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen