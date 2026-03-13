"""
Tests for Phase 6: AI Service and Resume Generation.

Covers:
  - OpenAI provider (mocked SDK)
  - Anthropic provider (mocked SDK)
  - ProviderFactory selection logic
  - ResumeGenerationService pipeline (mocked AI)
  - POST /api/ai/generate-resume SSE endpoint
"""

from __future__ import annotations

import json
from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient

from app.config import Settings
from app.services.ai.base import AIService
from app.services.ai.factory import get_ai_service
from app.services.resume_generation import ResumeGenerationService

# ─── Helpers ─────────────────────────────────────────────────────────────────


class MockAIService(AIService):
    """In-memory AIService stub for testing without real API calls."""

    def __init__(
        self,
        text_response: str = "mock text",
        structured_response: dict[str, Any] | None = None,
    ) -> None:
        self._text = text_response
        self._structured = structured_response or {}

    async def generate_text(self, prompt: str, **kwargs: Any) -> str:
        return self._text

    async def generate_text_stream(self, prompt: str, **kwargs: Any) -> AsyncGenerator[str, None]:
        async def _gen() -> AsyncGenerator[str, None]:
            for word in self._text.split():
                yield word + " "

        return _gen()

    async def generate_structured(
        self, prompt: str, schema: dict[str, Any], **kwargs: Any
    ) -> dict[str, Any]:
        return self._structured


def _sample_experiences() -> list[dict[str, Any]]:
    return [
        {
            "id": "exp-001",
            "type": "ROLE",
            "title": "Senior Software Engineer",
            "organization": "Acme Corp",
            "start_date": "2022-01-01",
            "end_date": None,
            "description": "Led backend platform development with Python and FastAPI.",
            "impact_metrics": "Reduced API latency by 40%.",
            "tags": ["python", "fastapi", "backend"],
        },
        {
            "id": "exp-002",
            "type": "PROJECT",
            "title": "Data Pipeline Automation",
            "organization": "Acme Corp",
            "start_date": "2023-06-01",
            "end_date": "2023-12-01",
            "description": "Built automated ETL pipeline processing 10M events/day.",
            "impact_metrics": "Saved 20 hours/week of manual data processing.",
            "tags": ["python", "airflow", "data-engineering"],
        },
    ]


def _valid_sections() -> list[dict[str, Any]]:
    return [
        {"type": "header", "name": "Jane Smith", "email": "jane@example.com"},
        {"type": "summary", "content": "Experienced backend engineer."},
        {"type": "experience", "entries": []},
        {"type": "projects", "entries": []},
        {"type": "skills", "categories": []},
        {"type": "education", "entries": []},
    ]


# ─── OpenAI provider ──────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_openai_provider_generate_text() -> None:
    """OpenAI provider delegates to the SDK and returns the message content."""
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Generated text from OpenAI"

    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    from app.services.ai.openai import OpenAIProvider

    provider = OpenAIProvider(api_key="sk-test")
    # Bypass lazy import by injecting mock client directly
    provider._client = mock_client

    result = await provider.generate_text("Write a summary.")
    assert result == "Generated text from OpenAI"
    mock_client.chat.completions.create.assert_awaited_once()


@pytest.mark.asyncio
async def test_openai_provider_generate_structured() -> None:
    """OpenAI provider parses JSON response from the SDK."""
    payload = {"selected_ids": ["exp-001"], "rationale": "Most relevant"}

    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = json.dumps(payload)

    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    from app.services.ai.openai import OpenAIProvider

    provider = OpenAIProvider(api_key="sk-test")
    provider._client = mock_client

    result = await provider.generate_structured("Select experiences.", schema={})
    assert result == payload


# ─── Anthropic provider ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_anthropic_provider_generate_text() -> None:
    """Anthropic provider delegates to the SDK and returns message content."""
    mock_message = MagicMock()
    mock_message.content = [MagicMock()]
    mock_message.content[0].text = "Generated text from Anthropic"

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_message)

    from app.services.ai.anthropic import AnthropicProvider

    provider = AnthropicProvider(api_key="sk-ant-test")
    provider._client = mock_client

    result = await provider.generate_text("Write a summary.")
    assert result == "Generated text from Anthropic"


@pytest.mark.asyncio
async def test_anthropic_provider_generate_structured() -> None:
    """Anthropic provider strips markdown fences and parses JSON."""
    payload = {"selected_ids": ["exp-002"], "rationale": "Relevant project"}

    mock_message = MagicMock()
    mock_message.content = [MagicMock()]
    # Simulate markdown-wrapped response
    mock_message.content[0].text = f"```json\n{json.dumps(payload)}\n```"

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_message)

    from app.services.ai.anthropic import AnthropicProvider

    provider = AnthropicProvider(api_key="sk-ant-test")
    provider._client = mock_client

    result = await provider.generate_structured("Select experiences.", schema={})
    assert result == payload


# ─── Provider factory ─────────────────────────────────────────────────────────


def test_factory_selects_openai_by_default() -> None:
    """Factory returns OpenAIProvider when ai_provider='openai'."""
    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        ai_provider="openai",
        openai_api_key="sk-test",
    )
    # Stub the openai module so the import inside OpenAIProvider.__init__ succeeds
    with patch.dict("sys.modules", {"openai": MagicMock(AsyncOpenAI=MagicMock())}):
        from app.services.ai.openai import OpenAIProvider

        svc = get_ai_service(settings)
        assert isinstance(svc, OpenAIProvider)


def test_factory_selects_anthropic_when_configured() -> None:
    """Factory returns AnthropicProvider when ai_provider='anthropic'."""
    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        ai_provider="anthropic",
        anthropic_api_key="sk-ant-test",
    )
    with patch.dict("sys.modules", {"anthropic": MagicMock(AsyncAnthropic=MagicMock())}):
        from app.services.ai.anthropic import AnthropicProvider

        svc = get_ai_service(settings)
        assert isinstance(svc, AnthropicProvider)


def test_factory_raises_without_openai_key() -> None:
    """Factory raises RuntimeError if OpenAI is selected but key is missing."""
    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        ai_provider="openai",
        openai_api_key=None,
    )
    with pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
        get_ai_service(settings)


def test_factory_raises_without_anthropic_key() -> None:
    """Factory raises RuntimeError if Anthropic is selected but key is missing."""
    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        ai_provider="anthropic",
        anthropic_api_key=None,
    )
    with pytest.raises(RuntimeError, match="ANTHROPIC_API_KEY"):
        get_ai_service(settings)


# ─── ResumeGenerationService ──────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_resume_generation_selects_relevant_experiences() -> None:
    """Service calls generate_structured and filters experiences by returned IDs."""
    mock_ai = MockAIService(
        structured_response={"selected_ids": ["exp-001"], "rationale": "Most relevant"}
    )
    svc = ResumeGenerationService(mock_ai)
    experiences = _sample_experiences()

    selected = await svc.select_relevant_experiences("Backend Python engineer role", experiences)

    assert len(selected) == 1
    assert selected[0]["id"] == "exp-001"


@pytest.mark.asyncio
async def test_resume_generation_handles_empty_experiences() -> None:
    """Service handles an empty experience library gracefully."""
    mock_ai = MockAIService(structured_response={"selected_ids": [], "rationale": ""})
    svc = ResumeGenerationService(mock_ai)

    selected = await svc.select_relevant_experiences("Any job", [])
    assert selected == []


@pytest.mark.asyncio
async def test_resume_generation_generates_sections() -> None:
    """Service returns sections from generate_structured response."""
    sections = _valid_sections()
    mock_ai = MockAIService(structured_response={"sections": sections})
    svc = ResumeGenerationService(mock_ai)

    result_sections = await svc.generate_resume_sections(
        "Backend engineer role", _sample_experiences()
    )

    assert isinstance(result_sections, list)
    assert len(result_sections) == len(sections)
    section_types = {s["type"] for s in result_sections}
    assert "summary" in section_types
    assert "experience" in section_types


@pytest.mark.asyncio
async def test_resume_generation_full_pipeline() -> None:
    """Full generate() call returns a dict with name and sections."""
    sections = _valid_sections()
    call_count = 0

    class TwoStepMockAI(AIService):
        async def generate_text(self, prompt: str, **kwargs: Any) -> str:
            return ""

        async def generate_text_stream(
            self, prompt: str, **kwargs: Any
        ) -> AsyncGenerator[str, None]:
            async def _gen() -> AsyncGenerator[str, None]:
                yield ""

            return _gen()

        async def generate_structured(
            self, prompt: str, schema: dict[str, Any], **kwargs: Any
        ) -> dict[str, Any]:
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                # First call: experience selection
                return {"selected_ids": ["exp-001"], "rationale": "Relevant"}
            # Second call: section generation
            return {"sections": sections}

    svc = ResumeGenerationService(TwoStepMockAI())
    result = await svc.generate("Python backend engineer", _sample_experiences(), "My Resume")

    assert result["name"] == "My Resume"
    assert isinstance(result["sections"], list)
    assert call_count == 2


@pytest.mark.asyncio
async def test_resume_generation_uses_default_name() -> None:
    """generate() uses 'AI-Generated Resume' when name is None."""

    # Patch select to skip the first AI call
    class OneStepMockAI(AIService):
        async def generate_text(self, prompt: str, **kwargs: Any) -> str:
            return ""

        async def generate_text_stream(
            self, prompt: str, **kwargs: Any
        ) -> AsyncGenerator[str, None]:
            async def _gen() -> AsyncGenerator[str, None]:
                yield ""

            return _gen()

        call = 0

        async def generate_structured(
            self, prompt: str, schema: dict[str, Any], **kwargs: Any
        ) -> dict[str, Any]:
            self.call += 1
            if self.call == 1:
                return {"selected_ids": [], "rationale": ""}
            return {"sections": _valid_sections()}

    svc = ResumeGenerationService(OneStepMockAI())
    result = await svc.generate("Some job", [], name=None)
    assert result["name"] == "AI-Generated Resume"


# ─── SSE endpoint ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_generate_resume_endpoint_requires_auth(client: AsyncClient) -> None:
    """POST /api/ai/generate-resume returns 401 without a Bearer token."""
    response = await client.post(
        "/api/ai/generate-resume",
        json={"job_description": "Senior Python Engineer at Acme Corp"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_generate_resume_endpoint_streams_sse(client: AsyncClient) -> None:
    """
    POST /api/ai/generate-resume streams SSE events when the AI provider is mocked.

    Verifies:
    - Response is text/event-stream
    - At least one token event is present
    - A 'complete' event with a 'resume' key is present
    - Stream ends with [DONE]
    """
    # Register a user and get a token
    reg = await client.post(
        "/api/auth/register",
        json={
            "email": "sse_tester@example.com",
            "password": "testpass123",
            "full_name": "SSE Tester",
        },
    )
    assert reg.status_code in (200, 201)
    token = reg.json()["access_token"]

    sections = _valid_sections()

    class FakeTwoStepAI(AIService):
        async def generate_text(self, prompt: str, **kwargs: Any) -> str:
            return ""

        async def generate_text_stream(
            self, prompt: str, **kwargs: Any
        ) -> AsyncGenerator[str, None]:
            async def _gen() -> AsyncGenerator[str, None]:
                yield ""

            return _gen()

        _call = 0

        async def generate_structured(
            self, prompt: str, schema: dict[str, Any], **kwargs: Any
        ) -> dict[str, Any]:
            self._call += 1
            if self._call == 1:
                return {"selected_ids": [], "rationale": "none"}
            return {"sections": sections}

    fake_ai = FakeTwoStepAI()

    with patch("app.routers.ai.get_ai_service", return_value=fake_ai):
        response = await client.post(
            "/api/ai/generate-resume",
            json={"job_description": "Senior Python engineer role at Acme"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    raw = response.text
    lines = [line for line in raw.split("\n") if line.startswith("data: ")]

    assert any(line != "data: [DONE]" for line in lines), "Expected at least one data event"
    assert "data: [DONE]" in lines

    # Find the complete event
    complete_event = None
    for line in lines:
        payload_str = line[6:]  # strip "data: "
        if payload_str == "[DONE]":
            continue
        payload = json.loads(payload_str)
        if payload.get("type") == "complete":
            complete_event = payload
            break

    assert complete_event is not None, "Expected a 'complete' SSE event"
    assert "resume" in complete_event
    assert "sections" in complete_event["resume"]


@pytest.mark.asyncio
async def test_generate_resume_endpoint_error_when_no_ai_key(
    client: AsyncClient,
) -> None:
    """Endpoint streams an error SSE event when AI provider is not configured."""
    reg = await client.post(
        "/api/auth/register",
        json={
            "email": "nokey_tester@example.com",
            "password": "testpass123",
            "full_name": "No Key Tester",
        },
    )
    assert reg.status_code in (200, 201)
    token = reg.json()["access_token"]

    with patch(
        "app.routers.ai.get_ai_service",
        side_effect=RuntimeError("OPENAI_API_KEY is not configured."),
    ):
        response = await client.post(
            "/api/ai/generate-resume",
            json={"job_description": "Python engineer at Acme"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    raw = response.text
    error_found = any(
        '"type": "error"' in line or '"type":"error"' in line
        for line in raw.split("\n")
        if line.startswith("data:")
    )
    assert error_found, "Expected an error SSE event when AI key is missing"
