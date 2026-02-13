from .base_plugin import BasePlugin
from datetime import datetime, timedelta
import calendar as cal


class CalendarPlugin(BasePlugin):
    """Calendar, date, time, and reminder plugin."""

    def __init__(self):
        super().__init__()
        self.name = "CalendarPlugin"
        self.description = "Date, time, calendar, and reminder management"
        self.priority = 8
        self.commands = [
            "what time is it",
            "what day is it",
            "what's the date",
            "set reminder",
            "show calendar",
            "schedule",
        ]
        self._reminders = []  # In-memory reminders (persist via DB in production)

    async def can_handle(self, message: str) -> bool:
        keywords = [
            "time", "date", "day", "calendar", "reminder",
            "schedule", "today", "tomorrow", "month", "year",
            "week", "appointment",
        ]
        return any(keyword in message.lower() for keyword in keywords)

    async def handle(self, message: str, **kwargs) -> str:
        msg = message.lower()
        now = datetime.now()

        # --- Current time ---
        if any(w in msg for w in ["what time", "current time", "time is it"]):
            return f"The current time is {now.strftime('%I:%M %p')}, Sir."

        # --- Current date ---
        if any(w in msg for w in ["what date", "today's date", "what day", "today"]):
            return f"Today is {now.strftime('%A, %B %d, %Y')}, Sir."

        # --- Tomorrow ---
        if "tomorrow" in msg:
            tomorrow = now + timedelta(days=1)
            return f"Tomorrow is {tomorrow.strftime('%A, %B %d, %Y')}, Sir."

        # --- Show calendar for current month ---
        if "calendar" in msg or "month" in msg:
            month_cal = cal.month(now.year, now.month)
            return f"Here is the calendar for {now.strftime('%B %Y')}:\n```\n{month_cal}```"

        # --- Set reminder ---
        if "remind" in msg or "reminder" in msg:
            # Extract the reminder text (simple approach)
            reminder_text = message.replace("remind me to", "").replace("set reminder", "").strip()
            if reminder_text:
                self._reminders.append({
                    "text": reminder_text,
                    "created": now.isoformat(),
                })
                return f"Reminder set: \"{reminder_text}\". I'll keep that noted, Sir."
            else:
                if self._reminders:
                    reminder_list = "\n".join(
                        f"  {i+1}. {r['text']}" for i, r in enumerate(self._reminders)
                    )
                    return f"Your active reminders:\n{reminder_list}"
                return "No active reminders, Sir. Say 'remind me to...' to set one."

        # --- Schedule / appointment ---
        if "schedule" in msg or "appointment" in msg:
            return (
                f"Your schedule for {now.strftime('%A, %B %d')}:\n"
                f"  No appointments scheduled.\n"
                f"  Your calendar is clear, Sir. Shall I add something?"
            )

        # --- Fallback ---
        return f"The current date and time is {now.strftime('%A, %B %d, %Y at %I:%M %p')}, Sir."
