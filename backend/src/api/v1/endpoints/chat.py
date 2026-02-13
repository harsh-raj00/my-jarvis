from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from sqlalchemy.orm import Session
from src.models.schemas import MessageRequest, MessageResponse, ConversationHistory
from src.services.llm_service import llm_service
from src.config.database import get_db
from src.database.crud import conversation_crud

router = APIRouter()


@router.post("", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest, db: Session = Depends(get_db)):
    """Process chat message and persist to database."""
    try:
        result = await llm_service.generate_response(
            message=request.message,
            session_id=request.session_id,
        )

        # Persist conversation to database
        try:
            conversation_crud.save_conversation(
                db=db,
                session_id=result["session_id"],
                user_message=request.message,
                assistant_response=result["response"],
                plugin_used=result.get("plugin_used"),
            )
        except Exception as db_err:
            # Don't fail the chat if DB write fails
            print(f"[WARN] Failed to save conversation: {db_err}")

        return MessageResponse(
            response=result["response"],
            session_id=result["session_id"],
            plugin_used=result["plugin_used"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_conversation_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Get recent conversation history."""
    try:
        conversations = conversation_crud.get_conversations(db, skip=skip, limit=limit)
        return [
            {
                "id": c.id,
                "session_id": c.session_id,
                "user_message": c.user_message,
                "assistant_response": c.assistant_response,
                "plugin_used": c.plugin_used,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in conversations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_session_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Get all messages in a specific session."""
    try:
        conversations = conversation_crud.get_by_session(db, session_id)
        if not conversations:
            return {"session_id": session_id, "messages": []}
        return {
            "session_id": session_id,
            "messages": [
                {
                    "id": c.id,
                    "user_message": c.user_message,
                    "assistant_response": c.assistant_response,
                    "plugin_used": c.plugin_used,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
                for c in conversations
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{session_id}")
async def delete_session_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Delete all messages in a session."""
    try:
        count = conversation_crud.delete_by_session(db, session_id)
        return {"deleted": count, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))