"""Anthropic provider implementation."""
import json
from collections.abc import AsyncGenerator
from typing import Any

from app.services.ai.base import AIService


class AnthropicProvider(AIService):
    """
    Anthropic (Claude) implementation of AIService.
    Uses the anthropic Python SDK — installed separately when needed.
    """

    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022") -> None:
        self.api_key = api_key
        self.model = model
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            try:
                import anthropic
                self._client = anthropic.AsyncAnthropic(api_key=self.api_key)
            except ImportError as exc:
                raise RuntimeError(
                    "anthropic package is not installed. Run: pip install anthropic"
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
        kwargs: dict[str, Any] = {
            "model": self.model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system

        message = await client.messages.create(**kwargs)
        return message.content[0].text if message.content else ""

    async def generate_text_stream(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        client = self._get_client()

        async def _stream() -> AsyncGenerator[str, None]:
            kwargs: dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": prompt}],
            }
            if system:
                kwargs["system"] = system

            async with client.messages.stream(**kwargs) as stream:
                async for text in stream.text_stream:
                    yield text

        return _stream()

    async def generate_structured(
        self,
        prompt: str,
        schema: dict[str, Any],
        *,
        system: str | None = None,
    ) -> dict[str, Any]:
        structured_prompt = (
            f"{prompt}\n\nRespond with valid JSON matching this schema:\n{json.dumps(schema)}\n"
            "Return only the JSON object, no other text."
        )
        text = await self.generate_text(structured_prompt, system=system)
        # Strip any markdown code block wrapping
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
        return json.loads(text)
