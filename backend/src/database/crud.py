from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict
from datetime import datetime
from src.models.database_models import Conversation


class ConversationCRUD:
    """CRUD operations for conversation history using SQLAlchemy."""

    def save_conversation(
        self,
        db: Session,
        session_id: str,
        user_message: str,
        assistant_response: str,
        plugin_used: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Conversation:
        """Save a conversation exchange to the database."""
        conv = Conversation(
            session_id=session_id,
            user_message=user_message,
            assistant_response=assistant_response,
            plugin_used=plugin_used,
            metadata=metadata,
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conv

    def get_conversations(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Conversation]:
        """Get recent conversations, newest first."""
        return (
            db.query(Conversation)
            .order_by(desc(Conversation.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_session(
        self,
        db: Session,
        session_id: str,
    ) -> List[Conversation]:
        """Get all messages in a specific session."""
        return (
            db.query(Conversation)
            .filter(Conversation.session_id == session_id)
            .order_by(Conversation.created_at)
            .all()
        )

    def delete_by_session(
        self,
        db: Session,
        session_id: str,
    ) -> int:
        """Delete all messages in a session. Returns count deleted."""
        count = (
            db.query(Conversation)
            .filter(Conversation.session_id == session_id)
            .delete()
        )
        db.commit()
        return count

    def get_count(self, db: Session) -> int:
        """Get total conversation count."""
        return db.query(Conversation).count()


# Global instance
conversation_crud = ConversationCRUD()
