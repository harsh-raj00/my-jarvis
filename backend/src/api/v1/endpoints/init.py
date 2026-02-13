# Endpoints package
from .chat import router as chat_router
from .speech import router as speech_router
from .skills import router as skills_router
from .system import router as system_router

__all__ = ['chat_router', 'speech_router', 'skills_router', 'system_router']