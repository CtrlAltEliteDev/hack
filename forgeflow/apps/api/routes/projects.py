from fastapi import APIRouter, HTTPException
from services.storage import list_projects, get_project

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/")
async def get_projects():
    return list_projects()

@router.get("/{project_id}")
async def get_project_by_id(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
