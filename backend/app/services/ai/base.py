"""
AIService abstract interface.

All AI features call methods on AIService — never on a provider directly.
This decouples product code from OpenAI/Anthropic SDK specifics.
"""
from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from typing import Any


class AIService(ABC):
    """Abstract AI service — implemented by each provider."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> str:
        """Generate a single text completion."""
        ...

    @abstractmethod
    async def generate_text_stream(
        self,
        prompt: str,
        *,
        system: str | None = None,
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Stream text tokens as an async generator."""
        ...

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        schema: dict[str, Any],
        *,
        system: str | None = None,
    ) -> dict[str, Any]:
        """Generate a JSON response matching the provided schema."""
        ...
