<p align="center">
  <img src="https://img.shields.io/badge/STARK_INDUSTRIES-000814?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeD0iNCIgeT0iMTgiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZjQ0NDQiPuKcqTwvdGV4dD48L3N2Zz4=&logoColor=ff4444" alt="Stark Industries"/>
</p>

<h1 align="center">
  <br>
  <span>⚡</span>
  <br>
  J.A.R.V.I.S.
  <br>
  <sub><sup>Just A Rather Very Intelligent System</sup></sub>
</h1>

<p align="center">
  <em>An AI-powered personal assistant with a cinematic Iron Man–inspired holographic interface</em>
</p>

<p align="center">
  <a href="https://jarvis-frontend-uj30.onrender.com"><img src="https://img.shields.io/badge/🚀_Live_Demo-jarvis--frontend-00E5B0?style=for-the-badge" alt="Live Demo"/></a>
  <a href="https://jarvis-backend-cybf.onrender.com/docs"><img src="https://img.shields.io/badge/📡_API_Docs-Swagger-blue?style=for-the-badge" alt="API Docs"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Three.js-0.158-black?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Gemini_AI-Latest-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/Voice_Enabled-SpeechAPI-FF4444?style=flat-square&logo=google-chrome&logoColor=white" alt="Voice"/>
  <img src="https://img.shields.io/badge/WebSocket-Real--Time-FF6F00?style=flat-square&logo=socketdotio&logoColor=white" alt="WebSocket"/>
  <img src="https://img.shields.io/badge/License-MIT-00E5B0?style=flat-square" alt="MIT License"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-voice-commands">Voice Commands</a> •
  <a href="#-plugin-system">Plugins</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

<br>

## 🎬 The Experience

> *"Good evening, Sir. All systems are operational."*

J.A.R.V.I.S. isn't just another chatbot — it's a **full cinematic experience**. From the moment you load the app, you're greeted by a Stark Industries boot sequence, an Arc Reactor pulsing to life, and a holographic particle sphere straight out of Tony Stark's lab.

### 🚀 Landing Page → Boot Sequence
A dramatic Avengers-themed splash screen with:
- **Animated Arc Reactor** with spinning inner rings and energy beams
- **Hexagonal grid overlay** with floating particle network
- **Terminal boot sequence** — systems initializing one by one
- **Stark Industries branding** with HUD corner decorations

### 🌐 Holographic Dashboard
Once initialized, you enter the main command center featuring:
- **Real-time 3D holographic sphere** with 8,000 particles, orbital rings, and spiral elements
- **Live system metrics** (CPU, Memory, Disk) pulled from the backend
- **Neural Link chat interface** — type or speak to J.A.R.V.I.S.
- **Voice state indicators** — visual feedback for listening, processing, and speaking

### 🔮 Siri-Like Voice Orb
When you activate voice, a stunning **full-screen popup** appears:
- **5 morphing blob layers** with multi-color gradient animations
- **Rainbow spinning halo** (conic gradient ring)
- **Audio-reactive scaling** — the orb breathes with your voice
- **Floating colored particles** orbiting the sphere
- **Color-coded states**: 🔴 Listening → 🟡 Processing → 🟢 Speaking
- Spring-physics entrance/exit animations via Framer Motion

<br>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎙️ Voice Interface
- Real-time speech recognition (Web Speech API)
- Natural text-to-speech responses
- Audio level visualization
- Siri-style animated voice popup
- Hands-free operation

</td>
<td width="50%">

### 🧠 AI Brain
- Powered by **Google Gemini AI**
- **ElevenLabs** voice synthesis (pyttsx3 fallback)
- J.A.R.V.I.S. personality prompt
- Context-aware responses
- 5 auto-discovered plugins

</td>
</tr>
<tr>
<td width="50%">

### 🌌 3D Holographics
- 8,000-particle glowing sphere
- Orbital rings with tracking spheres
- Spiral orbit animations
- Floating 3D text labels
- Custom GLSL shaders

</td>
<td width="50%">

### 📊 Real-Time Backend
- WebSocket for live bidirectional chat
- System metrics pushed every 3 seconds
- Conversation history persistence (SQLite/MySQL)
- Structured logging with request IDs
- Rate limiting & security headers

</td>
</tr>
<tr>
<td width="50%">

### 🔌 Plugin System
- **Auto-discovery** — drop a file, it loads
- Priority-based message routing
- Lifecycle hooks (on_load / on_unload)
- **System Plugin** — OS-level diagnostics
- **Weather Plugin** — Live weather data

</td>
<td width="50%">

### 🎨 Premium UI/UX
- Glassmorphism design language
- Micro-animations everywhere
- Dark mode optimized
- Responsive layout
- Orbitron + JetBrains Mono fonts

</td>
</tr>
</table>

<br>

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|:--|:--|
| **React 18** | Component architecture & state management |
| **Three.js** + React Three Fiber | 3D holographic scene rendering |
| **Framer Motion** | Spring-physics animations & transitions |
| **Vite** | Lightning-fast dev server & bundler |
| **Tailwind CSS** | Utility-first styling framework |
| **Lucide React** | Modern icon system |
| **Tone.js** | Audio synthesis & sound effects |
| **Web Speech API** | Voice recognition & text-to-speech |

### Backend
| Technology | Purpose |
|:--|:--|
| **FastAPI** | High-performance async API framework |
| **WebSocket** | Real-time bidirectional communication |
| **Google Gemini AI** | LLM for conversational intelligence |
| **SQLAlchemy** | ORM with MySQL + SQLite fallback |
| **Pydantic** | Data validation & settings management |
| **psutil** | System metrics collection |
| **Structlog** | Structured request/response logging |
| **pyttsx3** | Server-side speech synthesis |
| **Custom Middleware** | Rate limiting, security headers, error handling |

<br>

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ & npm
- **Python** 3.10+
- **MySQL** (optional — for persistent storage)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikeys))

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/harsh-raj00/my-jarvis
cd jarvis-ai
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
python -m uvicorn src.main:app --reload --port 8000
```

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4️⃣ Access J.A.R.V.I.S.

```
🌐 Frontend:  http://localhost:5173
🔧 Backend:   http://localhost:8000
📚 API Docs:  http://localhost:8000/docs
```

<br>

---

## 🏗 Architecture

```
jarvis-ai/
├── 🎨 frontend/                    # React + Three.js UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3D/                 # Three.js holographic scene
│   │   │   │   ├── JarvisScene     # Main 3D canvas (8K particles)
│   │   │   │   ├── ArcReactor      # Arc Reactor 3D model
│   │   │   │   ├── HolographicCore # Central hologram effect
│   │   │   │   ├── ParticleField   # Ambient particle system
│   │   │   │   ├── RotatingRings   # Orbital ring elements
│   │   │   │   ├── VoiceIndicator  # 3D voice visualization
│   │   │   │   ├── WaveformVisualizer
│   │   │   │   └── shaders/        # Custom GLSL shaders
│   │   │   ├── Dashboard/
│   │   │   │   └── JarvisDashboard # Main command center
│   │   │   ├── UI/
│   │   │   │   └── VoiceOrb        # Siri-like voice popup
│   │   │   └── LandingPage         # Boot sequence splash
│   │   ├── contexts/               # React context providers
│   │   ├── hooks/                  # Custom hooks (speech, audio)
│   │   ├── services/               # API client
│   │   └── styles/                 # Global CSS & design tokens
│   └── vite.config.js
│
├── backend/                         # FastAPI Python server
│   └── src/
│       ├── api/v1/                 # Versioned REST + WebSocket
│       │   └── endpoints/
│       │       ├── chat            # Chat + conversation history
│       │       ├── websocket       # Real-time WebSocket endpoint
│       │       ├── system          # Health & system metrics
│       │       ├── speech          # STT / TTS
│       │       ├── plugins         # Plugin management
│       │       └── skills          # Skill listing
│       ├── middleware/             # Custom middleware
│       │   ├── error_handler       # Global exception handling
│       │   ├── logging_config      # Structlog request logging
│       │   ├── rate_limiter        # Token-bucket rate limiting
│       │   └── security            # Security headers
│       ├── services/
│       │   ├── llm_service         # Gemini AI integration
│       │   ├── speech_service      # Text-to-speech engine
│       │   └── plugin_manager      # Auto-discovery plugin system
│       ├── plugins/                # Drop-in plugin directory
│       │   ├── system_plugin       # OS diagnostics (priority=10)
│       │   └── weather_plugin      # Weather data (priority=5)
│       ├── models/                 # SQLAlchemy models
│       ├── config/                 # Settings & env management
│       └── database/               # DB connection & CRUD
│
└── README.md
```

<br>

---

## 🎙 Voice Commands

J.A.R.V.I.S. supports natural language voice interaction. Click the **microphone button** or use keyboard shortcuts:

| Command Example | What Happens |
|:--|:--|
| *"Hey JARVIS, what's the weather?"* | Fetches live weather data via plugin |
| *"Run system diagnostics"* | Returns CPU, memory, and disk status |
| *"What time is it?"* | Responds with current time |
| *"Tell me a joke"* | Generates a witty response via Gemini |
| *"Turn on the lights"* | Controls smart home lights via plugin |
| *"Set temperature to 72"* | Adjusts thermostat |
| *"Check my inbox"* | Email plugin shows inbox summary |
| *"Set reminder to call Pepper"* | Saves a reminder |
| *"Show calendar"* | Displays calendar for current month |
| *"Activate movie scene"* | Smart home scene activation |
| Any natural question | Gemini AI processes and responds |

> 💡 **Tip:** Voice recognition works best in **Google Chrome**. Make sure to allow microphone access when prompted.

<br>

---

## 🔌 Plugin System

Plugins are **auto-discovered** — just drop a `.py` file in `backend/src/plugins/` and it loads on startup:

```python
from src.plugins.base_plugin import BasePlugin

class MyPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        self.name = "MyPlugin"
        self.description = "Does something awesome"
        self.priority = 15  # Higher = checked first
        self.commands = ["my command"]
    
    async def can_handle(self, message: str) -> bool:
        return "my command" in message.lower()
    
    async def handle(self, message: str, **kwargs) -> str:
        return "Plugin response here!"

    def on_load(self):   # Optional lifecycle hook
        print("Plugin loaded!")
```

### Built-in Plugins
| Plugin | Priority | Description |
|:--|:--|:--|
| 🖥️ **System** | 10 | CPU, memory, disk monitoring & OS commands |
| 📅 **Calendar** | 8 | Date, time, reminders, schedule management |
| 🏠 **Smart Home** | 7 | Lights, thermostat, locks, security, scenes |
| 📧 **Email** | 6 | Compose, inbox summary, draft management |
| 🌤️ **Weather** | 5 | Real-time weather data and forecasts |

<br>

---

## 🔄 WebSocket API

Connect to `ws://localhost:8000/api/v1/ws` for real-time communication:

```json
// Send a chat message
{ "type": "chat", "message": "Hello JARVIS", "session_id": "abc123" }

// Server responds with
{ "type": "chat_response", "data": { "response": "...", "session_id": "abc123" } }

// Server pushes system metrics every 3s
{ "type": "system_metrics", "data": { "cpu_usage": 12.5, "memory_usage": 45.2 } }
```

### Conversation History API
| Endpoint | Method | Description |
|:--|:--|:--|
| `/api/v1/chat` | POST | Send message (auto-saved to DB) |
| `/api/v1/chat/history` | GET | List recent conversations |
| `/api/v1/chat/history/{session_id}` | GET | Session-specific history |
| `/api/v1/chat/history/{session_id}` | DELETE | Clear session history |

<br>

---

## ⚙️ Configuration

All config is managed via environment variables in `backend/.env`:

```env
# AI Engine
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3-flash-preview

# Database (SQLite fallback if MySQL unavailable)
DATABASE_URL=mysql+mysqlconnector://root:pass@localhost:3306/jarvis_db

# Security
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
CHAT_RATE_LIMIT_PER_MINUTE=20
MAX_REQUEST_SIZE_MB=1.0

# Server
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173
```

<br>

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contribution
- 🎵 Add Spotify integration plugin
- 📧 Email management plugin
- 🏠 Smart home control (IoT)
- 📱 Mobile responsive improvements
- 🌍 Multi-language support
- 🔒 User authentication system

<br>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br>

---

<p align="center">
  <sub>Built with ❤️ and a lot of ☕ by a Tony Stark fan</sub>
  <br>
  <sub>
    <em>"Sometimes you gotta run before you can walk."</em> — Tony Stark
  </sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Operational-00E5B0?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Arc_Reactor-Online-00d4ff?style=for-the-badge" alt="Arc Reactor"/>
  <img src="https://img.shields.io/badge/Made_with-React_+_FastAPI-61DAFB?style=for-the-badge" alt="Stack"/>
</p>
