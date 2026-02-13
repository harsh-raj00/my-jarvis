from .base_plugin import BasePlugin
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Optional


class NewsPlugin(BasePlugin):
    """Real-time news plugin — fetches live headlines via Google News RSS."""

    def __init__(self):
        super().__init__()
        self.name = "NewsPlugin"
        self.description = "Real-time news, sports scores, and headlines"
        self.priority = 9  # High priority — catches news queries before Gemini
        self.commands = [
            "latest news",
            "cricket news",
            "sports news",
            "headlines",
            "what's happening",
        ]
        self._base_url = "https://news.google.com/rss"

    async def can_handle(self, message: str) -> bool:
        keywords = [
            "news", "headline", "cricket", "football", "sports",
            "score", "match", "latest", "trending", "happening",
            "today's news", "current events", "breaking",
            "ipl", "world cup", "premier league", "nba",
        ]
        return any(keyword in message.lower() for keyword in keywords)

    async def handle(self, message: str, **kwargs) -> str:
        msg = message.lower()

        # Determine search topic from the message
        topic = self._extract_topic(msg)

        try:
            if topic:
                articles = await self._search_news(topic)
                label = topic.title()
            else:
                articles = await self._fetch_top_headlines()
                label = "Top"

            if not articles:
                return f"I couldn't fetch live {label} news at the moment, Sir. Please check your internet connection."

            # Format the response
            lines = [f"Here are the latest {label} headlines, Sir:\n"]
            for i, article in enumerate(articles[:6], 1):
                title = article["title"]
                source = article.get("source", "")
                pub_date = article.get("pub_date", "")

                line = f"  {i}. **{title}**"
                if source:
                    line += f" ({source})"
                if pub_date:
                    line += f" - {pub_date}"
                lines.append(line)

            lines.append("\nThis is live data, Sir. Shall I look into any of these in more detail?")
            return "\n".join(lines)

        except Exception as e:
            return f"News feed temporarily unavailable, Sir. Error: {str(e)}"

    async def _fetch_top_headlines(self) -> list:
        """Fetch top headlines from Google News RSS."""
        url = f"{self._base_url}?hl=en-IN&gl=IN&ceid=IN:en"
        return await self._parse_rss(url)

    async def _search_news(self, query: str) -> list:
        """Search for specific news topic via Google News RSS."""
        import urllib.parse
        encoded_query = urllib.parse.quote(query)
        url = f"{self._base_url}/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
        return await self._parse_rss(url)

    async def _parse_rss(self, url: str) -> list:
        """Parse Google News RSS feed and return articles."""
        articles = []

        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            response.raise_for_status()

        root = ET.fromstring(response.text)
        channel = root.find("channel")
        if channel is None:
            return []

        for item in channel.findall("item"):
            title_el = item.find("title")
            source_el = item.find("source")
            pub_date_el = item.find("pubDate")

            title = title_el.text if title_el is not None else "No title"
            source = source_el.text if source_el is not None else ""
            pub_date_raw = pub_date_el.text if pub_date_el is not None else ""

            # Parse and format the date nicely
            pub_date = self._format_date(pub_date_raw)

            articles.append({
                "title": title,
                "source": source,
                "pub_date": pub_date,
            })

        return articles

    def _extract_topic(self, msg: str) -> Optional[str]:
        """Extract the news topic from the user message."""
        # Sport-specific queries
        sport_keywords = {
            "cricket": "cricket",
            "ipl": "IPL cricket",
            "football": "football soccer",
            "premier league": "Premier League",
            "nba": "NBA basketball",
            "tennis": "tennis",
            "f1": "Formula 1",
            "world cup": "World Cup",
        }
        for keyword, topic in sport_keywords.items():
            if keyword in msg:
                return topic

        # Generic topic extraction: "news about X" or "latest X news"
        if "about" in msg:
            parts = msg.split("about", 1)
            if len(parts) > 1:
                return parts[1].strip().rstrip("?.!")

        if "news" in msg:
            # Try to get the word before "news"
            words = msg.split()
            idx = words.index("news") if "news" in words else -1
            if idx > 0 and words[idx - 1] not in ["latest", "the", "me", "some", "get", "give", "show"]:
                return words[idx - 1]

        return None

    def _format_date(self, date_str: str) -> str:
        """Format RSS date string to a readable format."""
        if not date_str:
            return ""
        try:
            # RSS date format: "Thu, 13 Feb 2026 10:30:00 GMT"
            dt = datetime.strptime(date_str.strip(), "%a, %d %b %Y %H:%M:%S %Z")
            now = datetime.utcnow()
            diff = now - dt

            if diff.total_seconds() < 3600:
                mins = int(diff.total_seconds() / 60)
                return f"{mins}m ago"
            elif diff.total_seconds() < 86400:
                hours = int(diff.total_seconds() / 3600)
                return f"{hours}h ago"
            else:
                return dt.strftime("%b %d")
        except Exception:
            return ""
