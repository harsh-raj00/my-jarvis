from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.config.settings import settings
from src.api.v1.router import api_router

app = FastAPI(
    title="J.A.R.V.I.S. AI Assistant",
    description="Enterprise-grade AI personal assistant",
    version="1.0.0"
)

# CORS middleware - use dynamic origins from settings
cors_origins = [origin.strip() for origin in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "J.A.R.V.I.S. AI Assistant API",
        "status": "operational",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
# Add this so the frontend finds it at the new baseURL
@app.get("/api/v1/health")
def health_check_v1():
    return {"status": "healthy", "service": "jarvis-ai-v1"}

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=True
    )