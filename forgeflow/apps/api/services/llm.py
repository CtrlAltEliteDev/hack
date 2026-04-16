from openai import AsyncOpenAI
from functools import lru_cache
import os

@lru_cache(maxsize=1)
def get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")  # override for vLLM
    return AsyncOpenAI(api_key=api_key, base_url=base_url or None)

MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

async def chat(messages: list[dict], temperature: float = 0.7) -> str:
    client = get_client()
    response = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
    )
    return response.choices[0].message.content or ""
