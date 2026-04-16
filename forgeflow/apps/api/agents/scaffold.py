import json
from services.llm import chat
from services.json_llm import AGENT_JSON_APPENDIX, parse_llm_json_object
from graph.state import WorkflowState

SCAFFOLD_JSON_EXTRA = (
    "Every string value must use JSON double quotes; use \\n for line breaks inside starter_code and folder_tree."
)

SYSTEM = f"""You are a senior engineer generating a project scaffold.
Return ONLY valid JSON with this exact shape:
{{
  "folder_tree": "ASCII folder/file tree as a single string",
  "key_files": [
    {{
      "path": "relative/path/to/file.ext",
      "description": "what this file does",
      "starter_code": "actual starter code content as a string"
    }}
  ],
  "env_vars": [
    {{"name": "ENV_VAR_NAME", "description": "what it's for", "example": "example_value"}}
  ],
  "setup_commands": ["npm install", "pip install -r requirements.txt", ...],
  "dev_commands": {{"frontend": "npm run dev", "backend": "uvicorn main:app --reload"}}
}}
For starter_code, write real, runnable code — not pseudocode. Include at most 4 key files (keep responses concise).
{AGENT_JSON_APPENDIX} {SCAFFOLD_JSON_EXTRA}"""

async def scaffold_agent(state: WorkflowState) -> WorkflowState:
    arch = state.get("architecture") or {}
    scope = state.get("scope") or {}
    user_msg = f"""
Architecture: {json.dumps(arch, indent=2)}
MVP scope: {json.dumps(scope, indent=2)}
Stack: {state['stack']}

Generate a complete project scaffold with real starter code.
"""
    raw = await chat(
        [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.4,
        json_mode=True,
    )

    try:
        scaffold = parse_llm_json_object(raw)
    except ValueError:
        scaffold = {"raw": raw, "parse_error": True}

    return {**state, "scaffold": scaffold, "current_step": "scaffold_done"}
