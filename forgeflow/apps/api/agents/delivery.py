import json
from services.llm import chat
from services.json_llm import AGENT_JSON_APPENDIX, parse_llm_json_object
from graph.state import WorkflowState

DELIVERY_README_RULE = (
    "Put the full README in the readme field using \\n for newlines (no separate markdown code blocks)."
)

SYSTEM = f"""You are a technical writer and developer advocate creating the final delivery package for an MVP.
Return ONLY valid JSON with this exact shape:
{{
  "readme": "full markdown README as a string (use \\n for newlines)",
  "demo_script": [
    {{"step": 1, "action": "what to do", "expected": "what the audience sees"}}
  ],
  "build_checklist": [
    {{"item": "task", "phase": "setup|core|polish|launch", "done": false}}
  ],
  "pitch_points": ["key point to mention in a demo pitch"],
  "one_liner": "one sentence pitch"
}}
Write a thorough, realistic README with setup instructions.
{AGENT_JSON_APPENDIX} {DELIVERY_README_RULE}"""

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
    raw = await chat(
        [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.6,
        json_mode=True,
    )

    try:
        delivery = parse_llm_json_object(raw)
    except ValueError:
        delivery = {"raw": raw, "parse_error": True}

    return {**state, "delivery": delivery, "current_step": "delivery_done"}
