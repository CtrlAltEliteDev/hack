import json
from services.llm import chat
from graph.state import WorkflowState

SYSTEM = """You are a technical writer and developer advocate creating the final delivery package for an MVP.
Return ONLY valid JSON with this exact shape:
{
  "readme": "full markdown README as a string (use \\n for newlines)",
  "demo_script": [
    {"step": 1, "action": "what to do", "expected": "what the audience sees"}
  ],
  "build_checklist": [
    {"item": "task", "phase": "setup|core|polish|launch", "done": false}
  ],
  "pitch_points": ["key point to mention in a demo pitch"],
  "one_liner": "one sentence pitch"
}
Write a thorough, realistic README with setup instructions."""

async def delivery_agent(state: WorkflowState) -> WorkflowState:
    context = {
        "scope": state.get("scope"),
        "architecture": state.get("architecture"),
        "scaffold": state.get("scaffold"),
        "review": state.get("review"),
        "stack": state.get("stack"),
        "idea": state.get("idea"),
    }
    user_msg = f"""
Create the delivery package for this project:
{json.dumps(context, indent=2)}
"""
    raw = await chat([
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_msg},
    ], temperature=0.6)

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        delivery = json.loads(clean)
    except Exception:
        delivery = {"raw": raw, "parse_error": True}

    return {**state, "delivery": delivery, "current_step": "delivery_done"}
