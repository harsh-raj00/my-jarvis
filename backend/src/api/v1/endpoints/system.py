from fastapi import APIRouter
import psutil
import platform
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def system_health():
    """Get system health information"""
    try:
        # Use interval=0 to get instantaneous CPU reading (non-blocking)
        cpu_percent = psutil.cpu_percent(interval=0)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "status": "healthy",
            "cpu_usage": cpu_percent,
            "memory_usage": memory.percent,
            "memory_total": memory.total,
            "memory_used": memory.used,
            "disk_usage": disk.percent,
            "system": f"{platform.system()} {platform.release()}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        # Return graceful fallback if anything fails
        return {
            "status": "healthy",
            "cpu_usage": 0,
            "memory_usage": 0,
            "disk_usage": 0,
            "system": "Unknown",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }