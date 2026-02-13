from fastapi import APIRouter
from .endpoints import chat, speech, skills, system, plugins

api_router = APIRouter()

api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(speech.router, prefix="/speech", tags=["speech"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(plugins.router, prefix="/plugins", tags=["plugins"])