import json
from services.llm import chat
from graph.state import WorkflowState

SYSTEM = """You are a senior software architect designing an MVP system.
Return ONLY valid JSON with this exact shape:
{
  "overview": "2-3 sentence system description",
  "components": [
    {"name": "component name", "role": "what it does", "technology": "tech used"}
  ],
  "db_schema": [
    {
      "table": "table_name",
      "columns": [
        {"name": "col", "type": "TEXT|INTEGER|BOOLEAN|TIMESTAMP|UUID", "notes": "PK / FK / etc"}
      ]
    }
  ],
  "api_routes": [
    {"method": "GET|POST|PUT|DELETE|PATCH", "path": "/api/...", "description": "what it does"}
  ],
  "data_flow": "brief description of how data moves through the system",
  "tech_decisions": [
    {"decision": "what was chosen", "reason": "why"}
  ]
}"""

async def architect_agent(state: WorkflowState) -> WorkflowState:
    scope = state.get("scope") or {}
    parsed = state.get("parsed_input") or {}
    user_msg = f"""
MVP Scope: {json.dumps(scope, indent=2)}
Tech stack preference: {state['stack']}
Product type: {parsed.get('product_type', 'web app')}

Design the system architecture for this MVP.
"""
    raw = await chat([
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_msg},
    ], temperature=0.3)

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        architecture = json.loads(clean)
    except Exception:
        architecture = {"raw": raw, "parse_error": True}

    return {**state, "architecture": architecture, "current_step": "architect_done"}
