from fastapi import APIRouter, UploadFile, File, HTTPException
import base64
from src.models.schemas import SpeechRequest, SpeechResponse
from src.services.speech_service import speech_service

router = APIRouter()


@router.post("/speech-to-text", response_model=SpeechResponse)
async def speech_to_text(request: SpeechRequest):
    """Convert speech to text."""
    try:
        text, confidence = await speech_service.speech_to_text(
            request.audio_data,
            request.language,
        )
        return SpeechResponse(text=text, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text-to-speech")
async def text_to_speech(request: dict):
    """
    Convert text to speech using ElevenLabs (primary) or pyttsx3 (fallback).
    
    Body: { "text": "Hello", "use_elevenlabs": true }
    """
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        use_elevenlabs = request.get("use_elevenlabs", None)
        audio_bytes = await speech_service.text_to_speech(text, use_elevenlabs=use_elevenlabs)
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        return {
            "audio": audio_base64,
            "format": "audio/mpeg" if (use_elevenlabs is not False and speech_service.elevenlabs_available) else "audio/wav",
            "engine": "elevenlabs" if (use_elevenlabs is not False and speech_service.elevenlabs_available) else "pyttsx3",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    """List available ElevenLabs voices."""
    try:
        voices = await speech_service.get_elevenlabs_voices()
        return {
            "elevenlabs_available": speech_service.elevenlabs_available,
            "voices": voices,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio file for processing."""
    try:
        contents = await file.read()
        audio_base64 = base64.b64encode(contents).decode('utf-8')

        text, confidence = await speech_service.speech_to_text(audio_base64)

        return {
            "filename": file.filename,
            "text": text,
            "confidence": confidence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))