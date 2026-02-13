from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    use_voice: bool = False

class MessageResponse(BaseModel):
    response: str
    session_id: str
    plugin_used: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class SpeechRequest(BaseModel):
    audio_data: str  # base64 encoded audio
    language: str = "en-US"

class SpeechResponse(BaseModel):
    text: str
    confidence: float

class PluginInfo(BaseModel):
    id: int
    name: str
    description: str
    version: str
    enabled: bool
    config: Optional[Dict[str, Any]] = None

class ConversationHistory(BaseModel):
    id: int
    user_message: str
    assistant_response: str
    created_at: datetime