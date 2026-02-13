from typing import Dict, List, Any, Optional
from src.plugins.base_plugin import BasePlugin
from src.plugins.weather_plugin import WeatherPlugin
from src.plugins.system_plugin import SystemPlugin

class PluginManager:
    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}
        self.load_plugins()
    
    def load_plugins(self):
        """Load all available plugins"""
        # Manually load plugins
        try:
            plugin_instances = [
                WeatherPlugin(),
                SystemPlugin()
            ]
            
            for plugin in plugin_instances:
                if plugin.enabled:
                    self.plugins[plugin.name] = plugin
                    print(f"✓ Loaded plugin: {plugin.name}")
        except Exception as e:
            print(f"Error loading plugins: {e}")
    
    async def process_message(self, message: str) -> Optional[str]:
        """Process message through all available plugins"""
        if not message:
            return None
            
        for plugin in self.plugins.values():
            if await plugin.can_handle(message):
                try:
                    response = await plugin.handle(message)
                    return response
                except Exception as e:
                    print(f"Plugin {plugin.name} error: {str(e)}")
        return None
    
    def get_available_plugins(self) -> List[Dict[str, Any]]:
        """Get list of all available plugins"""
        return [plugin.get_info() for plugin in self.plugins.values()]

# Global instance
plugin_manager = PluginManager()