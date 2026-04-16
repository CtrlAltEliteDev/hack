from openai import AsyncOpenAI, APIStatusError
from functools import lru_cache
import os


def _friendly_api_error(exc: APIStatusError) -> str:
    raw = str(exc)
    code = getattr(exc, "status_code", None) or ""
    if code == 403 and "Inference Providers" in raw:
        return (
            "403: HF Inference Providers not permitted for this key. "
            "For OpenAI: delete or empty OPENAI_BASE_URL and use OPENAI_API_KEY from platform.openai.com. "
            "For HF: use a token with Inference Providers access."
        )
    return raw[:500]


GROQ_BASE_URL = "https://api.groq.com/openai/v1"


@lru_cache(maxsize=1)
def get_client() -> AsyncOpenAI:
    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if groq_key:
        return AsyncOpenAI(api_key=groq_key, base_url=GROQ_BASE_URL)

    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError(
            "No LLM key: set GROQ_API_KEY (free tier, https://console.groq.com/keys) "
            "or OPENAI_API_KEY. See apps/api/.env.example."
        )
    base_url = (os.getenv("OPENAI_BASE_URL") or "").strip() or None
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


def get_model() -> str:
    if (os.getenv("GROQ_API_KEY") or "").strip():
        return (os.getenv("LLM_MODEL") or "llama-3.1-8b-instant").strip()
    return (os.getenv("LLM_MODEL") or "gpt-4o-mini").strip()


async def chat(messages: list[dict], temperature: float = 0.7) -> str:
    client = get_client()
    try:
        response = await client.chat.completions.create(
            model=get_model(),
            messages=messages,
            temperature=temperature,
        )
    except APIStatusError as e:
        raise RuntimeError(_friendly_api_error(e)) from e
    return response.choices[0].message.content or ""
