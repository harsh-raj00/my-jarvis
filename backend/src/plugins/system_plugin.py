from .base_plugin import BasePlugin
import psutil
import platform
from datetime import datetime

class SystemPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        self.name = "SystemPlugin"
        self.description = "System information and monitoring"
    
    async def can_handle(self, message: str) -> bool:
        keywords = ["system", "cpu", "memory", "disk", "status", "health"]
        return any(keyword in message.lower() for keyword in keywords)
    
    async def handle(self, message: str, **kwargs) -> str:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        response = f"""
        System Status Report:
        • CPU Usage: {cpu_percent}%
        • Memory: {memory.percent}% used ({memory.used / (1024**3):.1f} GB of {memory.total / (1024**3):.1f} GB)
        • Disk: {disk.percent}% used
        • System: {platform.system()} {platform.release()}
        • Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        All systems operational, Sir.
        """
        
        return response