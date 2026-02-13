from .base_plugin import BasePlugin
from typing import Dict
import re


class SmartHomePlugin(BasePlugin):
    """Smart home control plugin — lights, thermostat, devices, scenes."""

    def __init__(self):
        super().__init__()
        self.name = "SmartHomePlugin"
        self.description = "Smart home device control and automation"
        self.priority = 7
        self.commands = [
            "turn on/off lights",
            "set temperature",
            "lock/unlock doors",
            "arm/disarm security",
            "activate scene",
        ]

        # Simulated device state
        self._devices: Dict[str, Dict] = {
            "living_room_lights": {"name": "Living Room Lights", "type": "light", "state": "off", "brightness": 80},
            "bedroom_lights": {"name": "Bedroom Lights", "type": "light", "state": "off", "brightness": 60},
            "lab_lights": {"name": "Lab Lights", "type": "light", "state": "on", "brightness": 100},
            "thermostat": {"name": "Thermostat", "type": "thermostat", "temperature": 72, "mode": "auto"},
            "front_door": {"name": "Front Door", "type": "lock", "state": "locked"},
            "garage_door": {"name": "Garage Door", "type": "lock", "state": "closed"},
            "security_system": {"name": "Security System", "type": "security", "state": "armed"},
            "jarvis_speakers": {"name": "Jarvis Speakers", "type": "speaker", "state": "on", "volume": 70},
        }

        self._scenes = {
            "movie": {"description": "Dim lights, close blinds, enable surround sound"},
            "sleep": {"description": "All lights off, thermostat to 68, lock all doors"},
            "focus": {"description": "Lab lights on, mute notifications, block calls"},
            "party": {"description": "Color lights on, music playing, thermostat to 74"},
        }

    def _has_word(self, text: str, word: str) -> bool:
        """Check if word exists as a whole word (not a substring like 'lock' in 'blockchain')."""
        return bool(re.search(r'\b' + re.escape(word) + r'\b', text))

    def _has_any_word(self, text: str, words: list) -> bool:
        """Check if any of the words exist as whole words."""
        return any(self._has_word(text, w) for w in words)

    async def can_handle(self, message: str) -> bool:
        msg = message.lower()

        # Multi-word phrases — safe from false positives
        if any(phrase in msg for phrase in ["turn on", "turn off", "smart home", "security system"]):
            return True

        # Single words — use word boundary to avoid "blockchain" -> "lock" etc.
        return self._has_any_word(msg, [
            "lights", "light", "lamp", "temperature", "thermostat",
            "lock", "unlock", "door", "heat", "cool", "dim",
            "bright", "scene", "devices",
        ])

    async def handle(self, message: str, **kwargs) -> str:
        msg = message.lower()

        # --- Lights control ---
        if self._has_any_word(msg, ["light", "lights", "lamp"]):
            if "turn on" in msg:
                room = self._detect_room(msg)
                key = f"{room}_lights"
                if key in self._devices:
                    self._devices[key]["state"] = "on"
                    return f"{self._devices[key]['name']} turned on at {self._devices[key]['brightness']}% brightness, Sir."
                for d in self._devices.values():
                    if d["type"] == "light":
                        d["state"] = "on"
                return "All lights turned on, Sir."

            if "turn off" in msg:
                room = self._detect_room(msg)
                key = f"{room}_lights"
                if key in self._devices:
                    self._devices[key]["state"] = "off"
                    return f"{self._devices[key]['name']} turned off, Sir."
                for d in self._devices.values():
                    if d["type"] == "light":
                        d["state"] = "off"
                return "All lights turned off, Sir."

            if self._has_word(msg, "dim"):
                for d in self._devices.values():
                    if d["type"] == "light":
                        d["brightness"] = 30
                        d["state"] = "on"
                return "Lights dimmed to 30%, Sir. Setting the mood."

        # --- Thermostat ---
        if self._has_any_word(msg, ["temperature", "thermostat", "heat", "cool", "warm"]):
            temp_match = re.search(r'(\d{2,3})', msg)
            if temp_match:
                temp = int(temp_match.group(1))
                self._devices["thermostat"]["temperature"] = temp
                return f"Thermostat set to {temp} degrees Fahrenheit, Sir."

            current = self._devices["thermostat"]["temperature"]
            return f"Current thermostat is set to {current}F in {self._devices['thermostat']['mode']} mode, Sir."

        # --- Locks / Doors ---
        if self._has_any_word(msg, ["lock", "unlock", "door"]):
            if self._has_word(msg, "unlock"):
                self._devices["front_door"]["state"] = "unlocked"
                return "Front door unlocked, Sir. Security remains active."
            if self._has_word(msg, "lock"):
                self._devices["front_door"]["state"] = "locked"
                self._devices["garage_door"]["state"] = "closed"
                return "All doors locked and garage secured, Sir."

        # --- Security ---
        if self._has_word(msg, "security"):
            if self._has_any_word(msg, ["arm", "enable"]):
                self._devices["security_system"]["state"] = "armed"
                return "Security system armed. Perimeter defense active, Sir."
            if self._has_any_word(msg, ["disarm", "disable"]):
                self._devices["security_system"]["state"] = "disarmed"
                return "Security system disarmed, Sir."
            state = self._devices["security_system"]["state"]
            return f"Security system is currently {state}, Sir."

        # --- Scenes ---
        if self._has_word(msg, "scene"):
            for scene_name, scene in self._scenes.items():
                if scene_name in msg:
                    return f"Activating '{scene_name}' scene: {scene['description']}. Done, Sir."
            scene_list = "\n".join(f"  - {k}: {v['description']}" for k, v in self._scenes.items())
            return f"Available scenes:\n{scene_list}\n\nSay 'activate [scene] scene' to enable one."

        # --- Device status ---
        if self._has_any_word(msg, ["status", "devices"]):
            status_lines = []
            for d in self._devices.values():
                state = d.get("state", d.get("temperature", "unknown"))
                status_lines.append(f"  - {d['name']}: {state}")
            return "Smart Home Status:\n" + "\n".join(status_lines)

        # --- Fallback ---
        return (
            "Smart home system online. Available commands:\n"
            "  - Turn on/off lights\n"
            "  - Set temperature to [X] degrees\n"
            "  - Lock/unlock doors\n"
            "  - Arm/disarm security\n"
            "  - Activate [scene] scene"
        )

    def _detect_room(self, msg: str) -> str:
        """Detect which room the user is referring to."""
        rooms = {
            "living": "living_room",
            "bedroom": "bedroom",
            "bed room": "bedroom",
            "lab": "lab",
            "workshop": "lab",
        }
        for keyword, room in rooms.items():
            if keyword in msg:
                return room
        return ""
