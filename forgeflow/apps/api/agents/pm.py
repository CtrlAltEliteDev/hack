import json
from services.llm import chat
from graph.state import WorkflowState

SYSTEM = """You are a senior product manager scoping an MVP for a hackathon or early-stage build.
Return ONLY valid JSON with this exact shape:
{
  "mvp_name": "project name",
  "one_liner": "elevator pitch in one sentence",
  "in_scope": ["feature that IS in the MVP", ...],
  "out_of_scope": ["feature deliberately excluded", ...],
  "milestones": [
    {"day": 1, "title": "milestone name", "deliverables": ["deliverable1", ...]},
    ...
  ],
  "success_metrics": ["metric1", ...],
  "risks": ["risk1", ...]
}"""

async def pm_agent(state: WorkflowState) -> WorkflowState:
    parsed = state.get("parsed_input") or {}
    user_msg = f"""
Parsed product info: {json.dumps(parsed, indent=2)}
Original idea: {state['idea']}
Deadline: {state['deadline']} days
Team size: {state['team_size']}

Define the tightest viable MVP scope and milestones.
"""
    raw = await chat([
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_msg},
    ], temperature=0.4)

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        scope = json.loads(clean)
    except Exception:
        scope = {"raw": raw, "parse_error": True}

    return {**state, "scope": scope, "current_step": "pm_done"}
