import speech_recognition as sr
import pyttsx3
import base64
import io
import wave
import numpy as np
from typing import Optional, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor
import tempfile
import os

class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.engine = pyttsx3.init()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Configure TTS engine
        self.engine.setProperty('rate', 180)
        self.engine.setProperty('volume', 0.9)
        
        # Try to set J.A.R.V.I.S.-like voice
        voices = self.engine.getProperty('voices')
        for voice in voices:
            if 'english' in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                break
    
    async def speech_to_text(self, audio_data: str, language: str = "en-US") -> Tuple[str, float]:
        """Convert speech to text"""
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_data)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name
            
            # Use speech recognition
            with sr.AudioFile(temp_path) as source:
                audio = self.recognizer.record(source)
                
                # Recognize using Google Web Speech API
                text = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    lambda: self.recognizer.recognize_google(audio, language=language)
                )
                
                # For demonstration, using a fixed confidence
                confidence = 0.9
                
            # Clean up
            os.unlink(temp_path)
            
            return text, confidence
            
        except sr.UnknownValueError:
            return "Could not understand audio", 0.0
        except sr.RequestError as e:
            return f"Speech recognition error: {str(e)}", 0.0
        except Exception as e:
            return f"Error: {str(e)}", 0.0
    
    async def text_to_speech(self, text: str) -> bytes:
        """Convert text to speech and return as bytes"""
        try:
            # Save speech to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                temp_path = f.name
                self.engine.save_to_file(text, temp_path)
                self.engine.runAndWait()
            
            # Read the audio file
            with open(temp_path, 'rb') as f:
                audio_bytes = f.read()
            
            # Clean up
            os.unlink(temp_path)
            
            return audio_bytes
            
        except Exception as e:
            raise Exception(f"Text-to-speech error: {str(e)}")
    
    def speak(self, text: str):
        """Speak text immediately"""
        self.engine.say(text)
        self.engine.runAndWait()

# Create global instance
speech_service = SpeechService()