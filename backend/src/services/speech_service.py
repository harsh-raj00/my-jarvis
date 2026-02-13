import speech_recognition as sr
import pyttsx3
import base64
import httpx
from typing import Optional, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor
import tempfile
import os
from src.config.settings import settings


class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.executor = ThreadPoolExecutor(max_workers=4)

        # --- pyttsx3 offline TTS (fallback) ---
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 180)
            self.engine.setProperty('volume', 0.9)
            voices = self.engine.getProperty('voices')
            for voice in voices:
                if 'english' in voice.name.lower():
                    self.engine.setProperty('voice', voice.id)
                    break
        except Exception as e:
            print(f"[WARN] pyttsx3 init failed: {e}")
            self.engine = None

        # --- ElevenLabs config ---
        self.elevenlabs_api_key = getattr(settings, 'eleven_labs_api_key', None)
        self.elevenlabs_voice_id = getattr(settings, 'eleven_labs_voice_id', 'pNInz6obpgDQGcFmaJgB')  # "Adam" default
        self.elevenlabs_model = getattr(settings, 'eleven_labs_model', 'eleven_monolingual_v1')
        self.elevenlabs_available = bool(
            self.elevenlabs_api_key
            and self.elevenlabs_api_key != "your_elevenlabs_api_key_here"
        )

        if self.elevenlabs_available:
            print("[OK] ElevenLabs voice synthesis enabled")
        else:
            print("[INFO] ElevenLabs not configured, using pyttsx3 fallback")

    # ------------------------------------------------------------------
    # Speech-to-Text
    # ------------------------------------------------------------------

    async def speech_to_text(self, audio_data: str, language: str = "en-US") -> Tuple[str, float]:
        """Convert speech to text."""
        try:
            audio_bytes = base64.b64decode(audio_data)

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            with sr.AudioFile(temp_path) as source:
                audio = self.recognizer.record(source)
                text = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.recognizer.recognize_google(audio, language=language)
                )
                confidence = 0.9

            os.unlink(temp_path)
            return text, confidence

        except sr.UnknownValueError:
            return "Could not understand audio", 0.0
        except sr.RequestError as e:
            return f"Speech recognition error: {str(e)}", 0.0
        except Exception as e:
            return f"Error: {str(e)}", 0.0

    # ------------------------------------------------------------------
    # Text-to-Speech  (ElevenLabs primary, pyttsx3 fallback)
    # ------------------------------------------------------------------

    async def text_to_speech(self, text: str, use_elevenlabs: Optional[bool] = None) -> bytes:
        """
        Convert text to speech audio bytes.

        Priority:
        1. ElevenLabs API (if configured and not explicitly disabled)
        2. pyttsx3 offline engine (fallback)
        """
        should_use_elevenlabs = (
            use_elevenlabs if use_elevenlabs is not None else self.elevenlabs_available
        )

        if should_use_elevenlabs:
            try:
                return await self._elevenlabs_tts(text)
            except Exception as e:
                print(f"[WARN] ElevenLabs TTS failed ({e}), falling back to pyttsx3")

        return await self._pyttsx3_tts(text)

    async def _elevenlabs_tts(self, text: str) -> bytes:
        """Generate speech via ElevenLabs API."""
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.elevenlabs_voice_id}"

        headers = {
            "xi-api-key": self.elevenlabs_api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }

        payload = {
            "text": text,
            "model_id": self.elevenlabs_model,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.3,
                "use_speaker_boost": True,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.content

    async def _pyttsx3_tts(self, text: str) -> bytes:
        """Generate speech via pyttsx3 offline engine."""
        if not self.engine:
            raise Exception("No TTS engine available")

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            temp_path = f.name
            self.engine.save_to_file(text, temp_path)
            self.engine.runAndWait()

        with open(temp_path, 'rb') as f:
            audio_bytes = f.read()

        os.unlink(temp_path)
        return audio_bytes

    def speak(self, text: str):
        """Speak text immediately (offline only)."""
        if self.engine:
            self.engine.say(text)
            self.engine.runAndWait()

    async def get_elevenlabs_voices(self) -> list:
        """Fetch available voices from ElevenLabs API."""
        if not self.elevenlabs_available:
            return []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://api.elevenlabs.io/v1/voices",
                    headers={"xi-api-key": self.elevenlabs_api_key},
                )
                response.raise_for_status()
                data = response.json()
                return [
                    {
                        "voice_id": v["voice_id"],
                        "name": v["name"],
                        "category": v.get("category", "unknown"),
                    }
                    for v in data.get("voices", [])
                ]
        except Exception as e:
            print(f"[WARN] Failed to fetch ElevenLabs voices: {e}")
            return []


# Create global instance
speech_service = SpeechService()