import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model_name = "models/gemini-3-flash-preview"
print(f"Attempting generation with {model_name}...")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello, system check.")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Error: {e}")
