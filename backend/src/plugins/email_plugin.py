from .base_plugin import BasePlugin
from datetime import datetime


class EmailPlugin(BasePlugin):
    """Email management plugin — compose, summarize, and manage emails."""

    def __init__(self):
        super().__init__()
        self.name = "EmailPlugin"
        self.description = "Email composition, summary, and management"
        self.priority = 6
        self.commands = [
            "send email",
            "compose email",
            "check email",
            "read emails",
            "draft email",
        ]
        self._drafts = []  # In-memory drafts

    async def can_handle(self, message: str) -> bool:
        keywords = [
            "email", "mail", "inbox", "send message",
            "compose", "draft", "unread",
        ]
        return any(keyword in message.lower() for keyword in keywords)

    async def handle(self, message: str, **kwargs) -> str:
        msg = message.lower()

        # --- Compose / Send email ---
        if any(w in msg for w in ["send", "compose", "write", "draft"]):
            # Parse "send email to X about Y"
            parts = message.lower()
            to_person = "recipient"
            subject = "your request"

            if " to " in parts:
                after_to = parts.split(" to ", 1)[1]
                if " about " in after_to:
                    to_person = after_to.split(" about ")[0].strip()
                    subject = after_to.split(" about ", 1)[1].strip()
                else:
                    to_person = after_to.strip().rstrip(".")

            draft = {
                "to": to_person,
                "subject": subject,
                "created": datetime.now().isoformat(),
            }
            self._drafts.append(draft)

            return (
                f"Email draft prepared:\n"
                f"  To: {to_person.title()}\n"
                f"  Subject: {subject.title()}\n\n"
                f"Draft saved. Would you like me to send it, or would you like to add a body, Sir?"
            )

        # --- Check inbox ---
        if any(w in msg for w in ["check", "inbox", "unread", "read"]):
            return (
                "Checking your inbox...\n\n"
                "  Inbox Summary:\n"
                "  - 3 unread emails\n"
                "  - 1 from Pepper Potts: \"Board Meeting Tomorrow\"\n"
                "  - 1 from Happy Hogan: \"Security Update\"\n"
                "  - 1 from Nick Fury: \"Classified - Eyes Only\"\n\n"
                "Would you like me to read any of these, Sir?"
            )

        # --- List drafts ---
        if "draft" in msg:
            if self._drafts:
                draft_list = "\n".join(
                    f"  {i+1}. To: {d['to'].title()} | Subject: {d['subject'].title()}"
                    for i, d in enumerate(self._drafts)
                )
                return f"Your email drafts:\n{draft_list}"
            return "No drafts saved, Sir."

        # --- Fallback ---
        return (
            "Email system online. You can:\n"
            "  - \"Compose email to [name] about [subject]\"\n"
            "  - \"Check my inbox\"\n"
            "  - \"Show email drafts\"\n"
            "How can I assist you, Sir?"
        )
