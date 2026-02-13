from .base_plugin import BasePlugin
import httpx
from typing import Dict, Any

class WeatherPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        self.name = "WeatherPlugin"
        self.description = "Get weather information for cities"
        self.api_key = None  # You would set this from config
    
    async def can_handle(self, message: str) -> bool:
        keywords = ["weather", "temperature", "forecast", "rain", "sunny"]
        return any(keyword in message.lower() for keyword in keywords)
    
    async def handle(self, message: str, **kwargs) -> str:
        # Simplified weather response
        # In production, integrate with OpenWeatherMap API
        return "Currently, the weather is clear with a temperature of 72°F. Perfect conditions for flight, Sir."