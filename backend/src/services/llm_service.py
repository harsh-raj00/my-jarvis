import google.generativeai as genai
from typing import Dict, Any, Optional
import json
from src.config.settings import settings
from src.services.plugin_manager import plugin_manager

class LLMService:
    def __init__(self):
        self.gemini_api_key = settings.gemini_api_key
        self.model = None
        
        if self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=self.gemini_api_key)
                # Try model from settings first, then fallback options
                model_options = [
                    getattr(settings, 'gemini_model', 'models/gemini-3-flash-preview'),
                    'models/gemini-3-flash-preview',
                    'models/gemini-2.0-flash',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro', 
                ]
                
                for model_name in model_options:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        print(f"Gemini AI initialized with model: {model_name}")
                        break
                    except Exception as e:
                        print(f"[ERROR] Model {model_name} failed to initialize: {e}")
                        continue
                        
                if not self.model:
                    print("All Gemini models failed. Using fallback mode.")
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")
                self.model = None
        else:
            print("Gemini API key not configured. Using fallback mode.")
            self.model = None
        
        self.plugin_manager = plugin_manager
        self.system_prompt = """
        You are Jarvis, an advanced AI assistant with a personality inspired by Iron Man's Jarvis.
        Be helpful, professional, slightly witty, and efficient.
        Always maintain a calm and composed tone.
        When appropriate, use Jarvis-style responses like addressing the user as "Sir".
        
        IMPORTANT: Always write your name as "Jarvis" (not "J.A.R.V.I.S." with dots) 
        because your responses are read aloud by text-to-speech.
        
        Respond concisely but informatively.
        """
    
    async def generate_response(
        self, 
        message: str, 
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response using Gemini API or fallback"""
        
        # Check if any plugin can handle this request
        plugin_response = await self.plugin_manager.process_message(message)
        
        if plugin_response:
            return {
                "response": plugin_response,
                "plugin_used": "plugin_system",
                "session_id": session_id or "default"
            }
        
        # If no plugin handles it and no API key, use fallback
        if not self.model:
            fallback_responses = [
                "Systems online. I'm currently operating in limited mode. For full AI capabilities, please configure the Gemini API key.",
                "All systems ready. To enable complete AI functionality, please provide API credentials in the settings.",
                "I'm here. For advanced responses, please configure the AI API key in the environment settings."
            ]
            import random
            return {
                "response": random.choice(fallback_responses),
                "plugin_used": None,
                "session_id": session_id or "default"
            }
        
        # Generate response with Gemini
        try:
            chat = self.model.start_chat(history=[])
            response = chat.send_message(
                f"{self.system_prompt}\n\nUser: {message}\n\nJ.A.R.V.I.S.:"
            )
            
            return {
                "response": response.text,
                "plugin_used": None,
                "session_id": session_id or "default"
            }
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}",
                "plugin_used": None,
                "session_id": session_id or "default"
            }

# Create global instance
llm_service = LLMService()