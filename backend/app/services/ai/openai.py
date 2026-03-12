"""OpenAI provider implementation."""
import json
from collections.abc import AsyncGenerator
from typing import Any

from app.services.ai.base import AIService


class OpenAIProvider(AIService):
    """
    OpenAI implementation of AIService.
    Uses the openai Python SDK — installed separately when needed.
    """

    def __init__(self, api_key: str, model: str = "gpt-4o") -> None:
        self.api_key = api_key
        self.model = model
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=self.api_key)
            except ImportError as exc:
                raise RuntimeError(
                    "openai package is not installed. Run: pip install openai"
                ) from exc
        return self._client

    async def generate_text(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        client = self._get_client()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def generate_text_stream(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        client = self._get_client()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        async def _stream() -> AsyncGenerator[str, None]:
            stream = await client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta

        return _stream()

    async def generate_structured(
        self,
        prompt: str,
        schema: dict[str, Any],
        *,
        system: str | None = None,
    ) -> dict[str, Any]:
        client = self._get_client()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({
            "role": "user",
            "content": f"{prompt}\n\nRespond with valid JSON matching this schema:\n{json.dumps(schema)}",
        })

        response = await client.chat.completions.create(
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)
