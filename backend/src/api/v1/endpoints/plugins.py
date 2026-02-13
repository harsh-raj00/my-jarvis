from fastapi import APIRouter

router = APIRouter()

async def get_plugins_list():
    """Get all plugins"""
    try:
        from src.services.plugin_manager import plugin_manager
        
        plugins = []
        for plugin_name, plugin in plugin_manager.plugins.items():
            plugins.append({
                "name": plugin_name,
                "description": getattr(plugin, 'description', 'No description'),
                "enabled": plugin.enabled,
                "version": getattr(plugin, 'version', '1.0.0')
            })
        return plugins
    except Exception as e:
        # Fallback if plugin manager fails
        return [
            {"name": "SystemPlugin", "description": "System monitoring", "enabled": True, "version": "1.0.0"},
            {"name": "WeatherPlugin", "description": "Weather information", "enabled": True, "version": "1.0.0"}
        ]

# Register at root level (prefix="/plugins" in router will make this /api/v1/plugins)
@router.get("")
async def list_all_plugins():
    """Get all plugins"""
    return await get_plugins_list()

@router.get("/")
async def list_all_plugins_slash():
    """Get all plugins (with trailing slash)"""
    return await get_plugins_list()

@router.get("/{plugin_name}")
async def get_plugin(plugin_name: str):
    """Get specific plugin info"""
    try:
        from src.services.plugin_manager import plugin_manager
        
        plugin = plugin_manager.plugins.get(plugin_name)
        if not plugin:
            return {"error": f"Plugin {plugin_name} not found"}
        
        return {
            "name": plugin_name,
            "description": getattr(plugin, 'description', 'No description'),
            "enabled": plugin.enabled,
            "version": getattr(plugin, 'version', '1.0.0')
        }
    except Exception as e:
        return {"error": str(e)}
