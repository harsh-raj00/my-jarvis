import os
import sys

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from src.config.settings import settings
    print(f"Loaded API Key: {settings.gemini_api_key[:5]}...{settings.gemini_api_key[-5:] if settings.gemini_api_key else 'None'}")
    print(f"Loaded Model: {settings.gemini_model}")
except Exception as e:
    print(f"Error loading settings: {e}")

try:
    from src.services.llm_service import llm_service
    if llm_service.model:
        print("LLM Service Initialized: SUCCESS")
    else:
        print("LLM Service Initialized: FAILED (Limited Mode)")
except Exception as e:
    print(f"Error initializing LLM Service: {e}")
