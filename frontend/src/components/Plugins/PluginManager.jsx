import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Power, 
  Settings, 
  Check, 
  X, 
  Download,
  Upload,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  RefreshCw,
  Star,
  Users,
  Globe,
  Lock,
  Unlock,
  Code,
  Database,
  Cpu,
  Zap
} from 'lucide-react'
import { useJarvis } from '../../contexts/JarvisContext'

const PluginManager = () => {
  const { plugins, updateSettings } = useJarvis()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [filter, setFilter] = useState('all')
  const [selectedPlugin, setSelectedPlugin] = useState(null)
  const [isInstalling, setIsInstalling] = useState(false)

  const pluginCategories = [
    { id: 'all', label: 'All Plugins', icon: Package, count: plugins.length },
    { id: 'enabled', label: 'Enabled', icon: Check, count: plugins.filter(p => p.enabled).length },
    { id: 'disabled', label: 'Disabled', icon: X, count: plugins.filter(p => !p.enabled).length },
    { id: 'system', label: 'System', icon: Cpu, count: plugins.filter(p => p.category === 'system').length },
    { id: 'utility', label: 'Utilities', icon: Zap, count: plugins.filter(p => p.category === 'utility').length },
    { id: 'integration', label: 'Integrations', icon: Globe, count: plugins.filter(p => p.category === 'integration').length },
  ]

  const marketplacePlugins = [
    {
      id: 'weather-pro',
      name: 'Weather Pro',
      description: 'Advanced weather forecasting with radar and alerts',
      author: 'Atmos Labs',
      version: '2.1.0',
      rating: 4.8,
      downloads: '12.4k',
      category: 'utility',
      price: 'Premium'
    },
    {
      id: 'stock-tracker',
      name: 'Stock Tracker',
      description: 'Real-time stock market data and analytics',
      author: 'Finance AI',
      version: '1.5.2',
      rating: 4.6,
      downloads: '8.7k',
      category: 'integration',
      price: 'Free'
    },
    {
      id: 'security-suite',
      name: 'Security Suite',
      description: 'Advanced security monitoring and threat detection',
      author: 'CyberShield',
      version: '3.0.1',
      rating: 4.9,
      downloads: '15.2k',
      category: 'system',
      price: 'Premium'
    },
    {
      id: 'voice-advanced',
      name: 'Voice Advanced',
      description: 'Enhanced voice recognition with multiple languages',
      author: 'VoiceTech',
      version: '1.8.3',
      rating: 4.7,
      downloads: '10.3k',
      category: 'system',
      price: 'Free'
    }
  ]

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'enabled' && plugin.enabled) ||
                         (filter === 'disabled' && !plugin.enabled) ||
                         plugin.category === filter
    
    return matchesSearch && matchesFilter
  })

  const handleTogglePlugin = (pluginId, enabled) => {
    // Update plugin state
    const updatedPlugins = plugins.map(plugin =>
      plugin.id === pluginId ? { ...plugin, enabled: !enabled } : plugin
    )
    
    // Update context
    updateSettings({ plugins: updatedPlugins })
  }

  const handleInstallPlugin = async (pluginId) => {
    setIsInstalling(true)
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const plugin = marketplacePlugins.find(p => p.id === pluginId)
    if (plugin) {
      const newPlugin = {
        id: pluginId,
        name: plugin.name,
        description: plugin.description,
        enabled: true,
        version: plugin.version,
        author: plugin.author,
        category: plugin.category
      }
      
      // Add to plugins list
      const updatedPlugins = [...plugins, newPlugin]
      updateSettings({ plugins: updatedPlugins })
    }
    
    setIsInstalling(false)
  }

  const PluginCard = ({ plugin, isMarketplace = false }) => {
    const isInstallingPlugin = isInstalling && isMarketplace

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className={`rounded-xl border transition-all ${
          plugin.enabled 
            ? 'border-green-500/30 bg-green-500/5' 
            : 'border-white/10 bg-white/5'
        } ${isMarketplace ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${
                plugin.enabled ? 'bg-green-500/10' : 'bg-gray-500/10'
              } ${isMarketplace ? 'bg-blue-500/10' : ''}`}>
                <Package className={`w-5 h-5 ${
                  plugin.enabled ? 'text-green-400' : 'text-gray-400'
                } ${isMarketplace ? 'text-blue-400' : ''}`} />
              </div>
              <div>
                <h3 className="text-white font-bold">{plugin.name}</h3>
                <p className="text-gray-400 text-sm">{plugin.author || 'Built-in'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isMarketplace ? (
                <>
                  <span className={`px-2 py-1 rounded text-xs ${
                    plugin.price === 'Premium' 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {plugin.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{plugin.rating}</span>
                  </div>
                </>
              ) : (
                <div className={`px-3 py-1 rounded-full text-xs ${
                  plugin.enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {plugin.enabled ? 'Active' : 'Inactive'}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-4">{plugin.description}</p>

          {/* Metadata */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Code className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">v{plugin.version}</span>
              </div>
              <div className="flex items-center space-x-1">
                {plugin.category === 'system' && <Cpu className="w-4 h-4 text-blue-400" />}
                {plugin.category === 'utility' && <Zap className="w-4 h-4 text-yellow-400" />}
                {plugin.category === 'integration' && <Globe className="w-4 h-4 text-green-400" />}
                <span className="text-gray-400 text-sm capitalize">{plugin.category}</span>
              </div>
              {isMarketplace && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{plugin.downloads}</span>
                </div>
              )}
            </div>
            
            {!isMarketplace && (
              <div className="flex items-center space-x-1">
                {plugin.enabled ? (
                  <Lock className="w-4 h-4 text-green-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {isMarketplace ? (
              <button
                onClick={() => handleInstallPlugin(plugin.id)}
                disabled={isInstallingPlugin}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                  isInstallingPlugin
                    ? 'bg-blue-500/30 text-blue-300 cursor-wait'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isInstallingPlugin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleTogglePlugin(plugin.id, plugin.enabled)}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                    plugin.enabled
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{plugin.enabled ? 'Disable' : 'Enable'}</span>
                </button>
                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
            
            {!isMarketplace && (
              <button className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg">
                <Database className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Plugin Manager</h2>
            <p className="text-gray-400">Extend J.A.R.V.I.S. functionality with plugins</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 rounded-lg">
            <Plus className="w-5 h-5" />
            <span>Add Plugin</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plugins by name or description..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 mb-6">
          <div className="flex space-x-2">
            {pluginCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === category.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Installed Plugins */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Installed Plugins</h3>
          <span className="text-gray-400">
            {plugins.length} plugins • {plugins.filter(p => p.enabled).length} active
          </span>
        </div>

        <AnimatePresence>
          {filteredPlugins.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredPlugins.map((plugin) => (
                <PluginCard key={plugin.id} plugin={plugin} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-white text-xl mb-2">No plugins found</h4>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchQuery 
                  ? `No plugins match "${searchQuery}". Try a different search term.`
                  : `No plugins in the "${filter}" category. Try a different category.`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plugin Marketplace */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Plugin Marketplace</h3>
            <p className="text-gray-400">Discover new plugins to enhance J.A.R.V.I.S.</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketplacePlugins.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} isMarketplace={true} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 border border-white/10 hover:border-blue-500/30 rounded-lg">
            Browse More Plugins
          </button>
        </div>
      </div>

      {/* Plugin Details Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlugin(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal content would go here */}
              <div className="text-center">
                <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Plugin Details
                </h3>
                <p className="text-gray-400">
                  Detailed view for {selectedPlugin.name}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PluginManager