from typing import Dict, List, Any, Optional
from src.plugins.base_plugin import BasePlugin
import importlib
import inspect
import pkgutil
import src.plugins as plugins_package


class PluginManager:
    """
    Manages plugin discovery, lifecycle, and message routing.
    Auto-discovers all BasePlugin subclasses in the plugins package.
    """

    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}
        self._discover_and_load()

    def _discover_and_load(self):
        """Auto-scan the plugins package for BasePlugin subclasses."""
        package_path = plugins_package.__path__
        prefix = plugins_package.__name__ + "."

        for importer, module_name, is_pkg in pkgutil.iter_modules(package_path, prefix):
            if module_name.endswith("base_plugin"):
                continue  # Skip the abstract base
            try:
                module = importlib.import_module(module_name)
                for attr_name in dir(module):
                    attr = getattr(module, attr_name)
                    if (
                        inspect.isclass(attr)
                        and issubclass(attr, BasePlugin)
                        and attr is not BasePlugin
                    ):
                        instance = attr()
                        if instance.enabled:
                            self.register(instance)
            except Exception as e:
                print(f"[WARN] Failed to load plugin module {module_name}: {e}")

    def register(self, plugin: BasePlugin):
        """Register a plugin and call its on_load hook."""
        self.plugins[plugin.name] = plugin
        try:
            plugin.on_load()
        except Exception as e:
            print(f"[WARN] Plugin {plugin.name} on_load error: {e}")
        print(f"[OK] Loaded plugin: {plugin.name} (priority={plugin.priority})")

    def unregister(self, plugin_name: str):
        """Remove a plugin and call its on_unload hook."""
        plugin = self.plugins.pop(plugin_name, None)
        if plugin:
            try:
                plugin.on_unload()
            except Exception as e:
                print(f"[WARN] Plugin {plugin_name} on_unload error: {e}")
            print(f"[X] Unloaded plugin: {plugin_name}")

    def enable_plugin(self, plugin_name: str) -> bool:
        """Enable a registered plugin."""
        plugin = self.plugins.get(plugin_name)
        if plugin:
            plugin.enabled = True
            return True
        return False

    def disable_plugin(self, plugin_name: str) -> bool:
        """Disable a registered plugin (keeps it registered but skips it)."""
        plugin = self.plugins.get(plugin_name)
        if plugin:
            plugin.enabled = False
            return True
        return False

    async def process_message(self, message: str) -> Optional[str]:
        """Route message to the highest-priority plugin that can handle it."""
        if not message:
            return None

        # Sort by priority descending
        sorted_plugins = sorted(
            self.plugins.values(),
            key=lambda p: p.priority,
            reverse=True,
        )

        for plugin in sorted_plugins:
            if not plugin.enabled:
                continue
            try:
                if await plugin.can_handle(message):
                    response = await plugin.handle(message)
                    return response
            except Exception as e:
                print(f"[WARN] Plugin {plugin.name} error: {str(e)}")

        return None

    def get_available_plugins(self) -> List[Dict[str, Any]]:
        """Return metadata for all registered plugins."""
        return [plugin.get_info() for plugin in self.plugins.values()]


# Global instance
plugin_manager = PluginManager()