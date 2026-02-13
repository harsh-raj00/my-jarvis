from fastapi import APIRouter, UploadFile, File, HTTPException
import base64
from src.models.schemas import SpeechRequest, SpeechResponse
from src.services.speech_service import SpeechService

router = APIRouter()
speech_service = SpeechService()

@router.post("/speech-to-text", response_model=SpeechResponse)
async def speech_to_text(request: SpeechRequest):
    """Convert speech to text"""
    try:
        text, confidence = await speech_service.speech_to_text(
            request.audio_data,
            request.language
        )
        return SpeechResponse(text=text, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-speech")
async def text_to_speech(request: dict):
    """Convert text to speech"""
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        audio_bytes = await speech_service.text_to_speech(text)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return {
            "audio": audio_base64,
            "format": "audio/wav"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio file for processing"""
    try:
        contents = await file.read()
        audio_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Process audio
        text, confidence = await speech_service.speech_to_text(audio_base64)
        
        return {
            "filename": file.filename,
            "text": text,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))