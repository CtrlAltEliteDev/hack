import json
from services.llm import chat
from graph.state import WorkflowState

SYSTEM = """You are a technical product analyst. Parse the user's product idea and extract structured information.
Return ONLY valid JSON with this exact shape:
{
  "product_type": "SaaS | mobile app | CLI tool | API | data platform | other",
  "core_problem": "one sentence",
  "target_users": "description of users",
  "key_features": ["feature1", "feature2", ...],
  "tech_stack": ["tech1", "tech2", ...],
  "timeline_days": number or null,
  "team_size": number,
  "constraints": ["constraint1", ...],
  "complexity": "low | medium | high"
}"""

async def intake_agent(state: WorkflowState) -> WorkflowState:
    user_msg = f"""
Product idea: {state['idea']}
Preferred stack: {state['stack']}
Team size: {state['team_size']}
Deadline: {state['deadline']}
Constraints: {state['constraints']}
"""
    raw = await chat([
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_msg},
    ], temperature=0.3)

    try:
        # strip markdown fences if present
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(clean)
    except Exception:
        parsed = {"raw": raw, "parse_error": True}

    return {**state, "parsed_input": parsed, "current_step": "intake_done"}
