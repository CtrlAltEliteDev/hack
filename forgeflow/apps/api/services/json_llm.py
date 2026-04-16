import json
import re

# Appended to agent system prompts so models emit parseable JSON (no ``` fences or backtick strings).
AGENT_JSON_APPENDIX = (
    "Output: one JSON object only, no markdown, no backticks. "
    "Use double-quoted strings and \\n for newlines inside strings."
)


def strip_code_fences(text: str) -> str:
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE | re.MULTILINE)
    t = re.sub(r"\s*```\s*$", "", t)
    return t.strip()


def parse_llm_json_object(raw: str) -> dict:
    """Parse a single JSON object from model output (fences, leading prose, trailing junk)."""
    s = strip_code_fences(raw)
    if not s:
        raise ValueError("empty response")

    try:
        out = json.loads(s)
        if isinstance(out, dict):
            return out
    except json.JSONDecodeError:
        pass

    dec = json.JSONDecoder()
    for i, ch in enumerate(s):
        if ch != "{":
            continue
        try:
            obj, _ = dec.raw_decode(s[i:])
            if isinstance(obj, dict):
                return obj
        except json.JSONDecodeError:
            continue

    raise ValueError("no valid JSON object found")
