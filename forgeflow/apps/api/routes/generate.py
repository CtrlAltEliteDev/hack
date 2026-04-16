import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from services.storage import create_project, update_project_status, update_artifacts, get_project
from graph.workflow import run_workflow

router = APIRouter(prefix="/generate", tags=["generate"])


class GenerateRequest(BaseModel):
    idea: str
    stack: str
    team_size: int = 1
    deadline: str = "5 days"
    constraints: str = ""


@router.post("/")
async def generate(req: GenerateRequest):
    """Start workflow and return project_id immediately; poll /projects/{id} for results."""
    project = create_project(
        idea=req.idea,
        stack=req.stack,
        team_size=req.team_size,
        deadline=req.deadline,
        constraints=req.constraints,
    )
    project_id = project["id"]

    # Run workflow in background
    asyncio.create_task(_run_and_store(project_id, req))
    return {"project_id": project_id, "status": "running"}


async def _run_and_store(project_id: str, req: GenerateRequest):
    update_project_status(project_id, "running")
    try:
        result = await run_workflow(
            project_id=project_id,
            idea=req.idea,
            stack=req.stack,
            team_size=req.team_size,
            deadline=req.deadline,
            constraints=req.constraints,
        )
        artifacts = {
            "parsed_input": result.get("parsed_input"),
            "scope": result.get("scope"),
            "architecture": result.get("architecture"),
            "scaffold": result.get("scaffold"),
            "review": result.get("review"),
            "delivery": result.get("delivery"),
        }
        update_artifacts(project_id, artifacts)
        update_project_status(project_id, "done")
    except Exception as e:
        update_project_status(project_id, f"error: {str(e)[:200]}")


@router.get("/stream/{project_id}")
async def stream_status(project_id: str):
    """SSE endpoint: streams status updates until done."""
    async def event_gen():
        import time
        for _ in range(120):  # max 2 min polling
            project = get_project(project_id)
            if not project:
                yield f"data: {json.dumps({'error': 'not found'})}\n\n"
                break
            status = project["status"]
            artifacts = project["artifacts"]
            payload = {"status": status, "artifacts": artifacts}
            yield f"data: {json.dumps(payload)}\n\n"
            if status == "done" or status.startswith("error"):
                break
            await asyncio.sleep(2)

    return StreamingResponse(event_gen(), media_type="text/event-stream")
