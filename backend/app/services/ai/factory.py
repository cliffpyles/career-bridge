"""
Provider factory — selects the AI provider from config.
"""
from app.config import Settings
from app.services.ai.base import AIService


def get_ai_service(settings: Settings) -> AIService:
    """
    Return the configured AI service implementation.

    Raises RuntimeError if the selected provider has no API key configured.
    """
    provider = settings.ai_provider.lower()

    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not configured. "
                "Set it in your environment or .env file."
            )
        from app.services.ai.anthropic import AnthropicProvider
        return AnthropicProvider(api_key=settings.anthropic_api_key)

    # Default to OpenAI
    if not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. "
            "Set it in your environment or .env file."
        )
    from app.services.ai.openai import OpenAIProvider
    return OpenAIProvider(api_key=settings.openai_api_key)
