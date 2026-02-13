from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List


class BasePlugin(ABC):
    """
    Base class for all J.A.R.V.I.S. plugins.

    Subclasses must implement:
        - can_handle(message) -> bool
        - handle(message) -> str

    Optional overrides:
        - on_load()   — called when plugin is registered
        - on_unload() — called when plugin is removed
    """

    def __init__(self):
        self.name: str = self.__class__.__name__
        self.version: str = "1.0.0"
        self.description: str = "Base plugin"
        self.enabled: bool = True
        self.priority: int = 0  # Higher = checked first
        self.commands: List[str] = []  # Example commands this plugin handles

    # --- Lifecycle hooks ---

    def on_load(self):
        """Called when the plugin is registered with the PluginManager."""
        pass

    def on_unload(self):
        """Called when the plugin is removed from the PluginManager."""
        pass

    # --- Abstract methods ---

    @abstractmethod
    async def can_handle(self, message: str) -> bool:
        """Return True if this plugin can handle the given message."""
        pass

    @abstractmethod
    async def handle(self, message: str, **kwargs) -> str:
        """Process the message and return a response string."""
        pass

    # --- Info ---

    def get_info(self) -> Dict[str, Any]:
        """Return serializable plugin metadata."""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "enabled": self.enabled,
            "priority": self.priority,
            "commands": self.commands,
        }