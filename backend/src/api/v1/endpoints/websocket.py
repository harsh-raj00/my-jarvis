from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
import psutil
from datetime import datetime
from src.services.llm_service import llm_service

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections for real-time communication."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._metrics_task: asyncio.Task = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[OK] WebSocket client connected. Total: {len(self.active_connections)}")

        # Start metrics broadcasting if this is the first connection
        if len(self.active_connections) == 1 and self._metrics_task is None:
            self._metrics_task = asyncio.create_task(self._broadcast_metrics_loop())

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"[X] WebSocket client disconnected. Total: {len(self.active_connections)}")

        # Stop metrics broadcasting if no clients remain
        if len(self.active_connections) == 0 and self._metrics_task is not None:
            self._metrics_task.cancel()
            self._metrics_task = None

    async def send_personal(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

    async def _broadcast_metrics_loop(self):
        """Push system metrics to all clients every 3 seconds."""
        try:
            while True:
                if not self.active_connections:
                    break
                metrics = {
                    "type": "system_metrics",
                    "data": {
                        "cpu_usage": psutil.cpu_percent(interval=0),
                        "memory_usage": psutil.virtual_memory().percent,
                        "disk_usage": psutil.disk_usage('/').percent,
                        "timestamp": datetime.now().isoformat(),
                    }
                }
                await self.broadcast(metrics)
                await asyncio.sleep(3)
        except asyncio.CancelledError:
            pass


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time bidirectional communication.

    Client sends: { "type": "chat", "message": "Hello JARVIS" }
    Server sends: { "type": "chat_response", "data": { "response": "...", ... } }
    Server pushes: { "type": "system_metrics", "data": { "cpu_usage": ..., ... } }
    """
    await manager.connect(websocket)

    # Send welcome message
    await manager.send_personal({
        "type": "connected",
        "data": {
            "message": "WebSocket connection established. J.A.R.V.I.S. real-time link active.",
            "timestamp": datetime.now().isoformat(),
        }
    }, websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_personal({
                    "type": "error",
                    "data": {"message": "Invalid JSON payload."}
                }, websocket)
                continue

            msg_type = data.get("type", "")

            if msg_type == "chat":
                message = data.get("message", "").strip()
                if not message:
                    await manager.send_personal({
                        "type": "error",
                        "data": {"message": "Empty message."}
                    }, websocket)
                    continue

                # Acknowledge receipt
                await manager.send_personal({
                    "type": "chat_processing",
                    "data": {"message": message}
                }, websocket)

                # Generate AI response
                try:
                    result = await llm_service.generate_response(
                        message=message,
                        session_id=data.get("session_id")
                    )
                    await manager.send_personal({
                        "type": "chat_response",
                        "data": {
                            "response": result["response"],
                            "session_id": result["session_id"],
                            "plugin_used": result.get("plugin_used"),
                            "timestamp": datetime.now().isoformat(),
                        }
                    }, websocket)
                except Exception as e:
                    await manager.send_personal({
                        "type": "error",
                        "data": {"message": f"AI processing error: {str(e)}"}
                    }, websocket)

            elif msg_type == "ping":
                await manager.send_personal({
                    "type": "pong",
                    "data": {"timestamp": datetime.now().isoformat()}
                }, websocket)

            else:
                await manager.send_personal({
                    "type": "error",
                    "data": {"message": f"Unknown message type: {msg_type}"}
                }, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
