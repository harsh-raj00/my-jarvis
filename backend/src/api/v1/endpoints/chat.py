from fastapi import APIRouter, HTTPException
from typing import Optional
from src.models.schemas import MessageRequest, MessageResponse
from src.services.llm_service import llm_service

router = APIRouter()

@router.post("", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest):
    """Process chat message"""
    try:
        result = await llm_service.generate_response(
            message=request.message,
            session_id=request.session_id
        )
        
        return MessageResponse(
            response=result["response"],
            session_id=result["session_id"],
            plugin_used=result["plugin_used"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))