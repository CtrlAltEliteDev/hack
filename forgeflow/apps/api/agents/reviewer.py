import json
from services.llm import chat
from graph.state import WorkflowState

SYSTEM = """You are a critical technical reviewer stress-testing an MVP plan.
Return ONLY valid JSON with this exact shape:
{
  "overall_assessment": "STRONG | VIABLE | NEEDS_WORK | RISKY",
  "score": 0-100,
  "gaps": [
    {"area": "auth | data | infra | ux | security | testing | ...", "issue": "what's missing", "severity": "high|medium|low"}
  ],
  "scope_concerns": ["concern about the scope being too large or too small"],
  "missing_components": ["thing that was forgotten"],
  "timeline_assessment": "Is the timeline realistic? What's at risk?",
  "recommendations": ["actionable recommendation 1", ...],
  "green_flags": ["things that look solid"]
}"""

async def reviewer_agent(state: WorkflowState) -> WorkflowState:
    context = {
        "scope": state.get("scope"),
        "architecture": state.get("architecture"),
        "scaffold": state.get("scaffold"),
        "team_size": state.get("team_size"),
        "deadline": state.get("deadline"),
    }
    user_msg = f"""
Review this MVP plan critically:
{json.dumps(context, indent=2)}
"""
    raw = await chat([
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user_msg},
    ], temperature=0.5)

    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        review = json.loads(clean)
    except Exception:
        review = {"raw": raw, "parse_error": True}

    return {**state, "review": review, "current_step": "reviewer_done"}
