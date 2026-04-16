from openai import AsyncOpenAI, APIStatusError, APITimeoutError
from functools import lru_cache
import os

import httpx


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


def _read_timeout_seconds() -> float:
    raw = (os.getenv("LLM_HTTP_TIMEOUT_SECONDS") or "900").strip()
    try:
        v = float(raw)
    except ValueError:
        v = 900.0
    return max(60.0, min(v, 3600.0))


def _client_params() -> tuple[str, str, str, float]:
    """Provider id, bearer token, base URL (or ""), read timeout — cache key for client."""
    groq_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if groq_key:
        return ("groq", groq_key, "", _read_timeout_seconds())
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError(
            "No LLM key: set GROQ_API_KEY (free tier, https://console.groq.com/keys) "
            "or OPENAI_API_KEY. See apps/api/.env.example."
        )
    base_url = (os.getenv("OPENAI_BASE_URL") or "").strip()
    return ("openai", api_key, base_url, _read_timeout_seconds())


def _build_timeout(read_sec: float) -> httpx.Timeout:
    return httpx.Timeout(
        connect=30.0,
        read=read_sec,
        write=min(read_sec, 600.0),
        pool=30.0,
    )


@lru_cache(maxsize=8)
def get_client(params: tuple[str, str, str, float]) -> AsyncOpenAI:
    kind, key, base, read_sec = params
    timeout = _build_timeout(read_sec)
    retries = int((os.getenv("LLM_HTTP_MAX_RETRIES") or "5").strip() or "5")
    retries = max(0, min(retries, 10))
    if kind == "groq":
        return AsyncOpenAI(
            api_key=key,
            base_url=GROQ_BASE_URL,
            timeout=timeout,
            max_retries=retries,
        )
    return AsyncOpenAI(
        api_key=key,
        base_url=base or None,
        timeout=timeout,
        max_retries=retries,
    )


def get_model() -> str:
    if (os.getenv("GROQ_API_KEY") or "").strip():
        return (os.getenv("LLM_MODEL") or "llama-3.1-8b-instant").strip()
    return (os.getenv("LLM_MODEL") or "gpt-4o-mini").strip()


async def chat(
    messages: list[dict],
    temperature: float = 0.7,
    *,
    json_mode: bool = False,
) -> str:
    client = get_client(_client_params())
    base: dict = {
        "model": get_model(),
        "messages": messages,
        "temperature": temperature,
    }
    if json_mode:
        base["response_format"] = {"type": "json_object"}
    try:
        try:
            response = await client.chat.completions.create(**base)
        except APIStatusError as e:
            if json_mode and getattr(e, "status_code", None) == 400:
                base.pop("response_format", None)
                response = await client.chat.completions.create(**base)
            else:
                raise RuntimeError(_friendly_api_error(e)) from e
    except APIStatusError as e:
        raise RuntimeError(_friendly_api_error(e)) from e
    except APITimeoutError as e:
        raise RuntimeError(
            "LLM HTTP request timed out. Increase LLM_HTTP_TIMEOUT_SECONDS in apps/api/.env "
            f"(current read cap {_read_timeout_seconds():.0f}s), or use a faster model."
        ) from e
    return response.choices[0].message.content or ""
