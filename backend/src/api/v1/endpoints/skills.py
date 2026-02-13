from fastapi import APIRouter, HTTPException
from typing import List
from src.models.schemas import PluginInfo
from src.services.plugin_manager import plugin_manager

router = APIRouter()

@router.get("/skills", response_model=List[PluginInfo])
async def get_skills():
    """Get all available skills/plugins"""
    try:
        skills = plugin_manager.get_available_plugins()
        return skills
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skills/available", response_model=List[dict])
async def get_available_skills():
    """Get list of all available skills that can be enabled"""
    try:
        skills = plugin_manager.get_available_plugins()
        return [{"name": skill["name"], "enabled": skill["enabled"], "description": skill.get("description", "")} for skill in skills]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skills/{skill_name}", response_model=PluginInfo)
async def get_skill(skill_name: str):
    """Get details of a specific skill"""
    try:
        if skill_name in plugin_manager.plugins:
            plugin = plugin_manager.plugins[skill_name]
            return plugin.get_info()
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skills/{skill_name}/toggle")
async def toggle_skill(skill_name: str, enable: bool = True):
    """Enable or disable a skill"""
    try:
        if skill_name in plugin_manager.plugins:
            plugin = plugin_manager.plugins[skill_name]
            plugin.enabled = enable
            status = "enabled" if enable else "disabled"
            return {
                "success": True,
                "message": f"Skill '{skill_name}' has been {status}",
                "skill": skill_name,
                "enabled": enable
            }
        else:
            raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))