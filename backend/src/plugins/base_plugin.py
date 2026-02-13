from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePlugin(ABC):
    """Base class for all plugins"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
        self.description = "Base plugin class"
        self.enabled = True
    
    @abstractmethod
    async def can_handle(self, message: str) -> bool:
        """Check if plugin can handle the message"""
        pass
    
    @abstractmethod
    async def handle(self, message: str, **kwargs) -> str:
        """Handle the message and return response"""
        pass
    
    def get_info(self) -> Dict[str, Any]:
        """Get plugin information"""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "enabled": self.enabled
        }