"""
CodeMentor AI — LLM Provider Factory (Phase A7).

Instantiates the appropriate provider client based on configuration.
Supports mock, ollama, and cloud providers.
"""

import os
from typing import Optional, Dict, Any
from app.services.ai.base import BaseLLMClient
from app.services.ai.providers.mock_provider import MockLLMClient
from app.services.ai.providers.ollama_provider import OllamaLLMClient
from app.services.ai.providers.cloud_provider import CloudLLMClient


def get_llm_provider(
    provider_type: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None
) -> BaseLLMClient:
    """
    Factory function to retrieve the configured LLM client.

    :param provider_type: 'mock', 'ollama', or 'cloud'. Defaults to AI_PROVIDER env var or 'mock'.
    :param config: Optional dictionary with custom connection overrides.
    """
    cfg = config or {}
    p_type = (provider_type or cfg.get("AI_PROVIDER") or os.getenv("AI_PROVIDER", "mock")).lower().strip()

    if p_type == "ollama":
        base_url = cfg.get("OLLAMA_BASE_URL") or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        model = cfg.get("OLLAMA_MODEL") or os.getenv("OLLAMA_MODEL", "llama3")
        return OllamaLLMClient(base_url=base_url, model_name=model)

    elif p_type == "cloud":
        api_key = cfg.get("CLOUD_AI_API_KEY") or os.getenv("CLOUD_AI_API_KEY", "")
        base_url = cfg.get("CLOUD_AI_BASE_URL") or os.getenv("CLOUD_AI_BASE_URL", "https://api.openai.com/v1")
        model = cfg.get("CLOUD_AI_MODEL") or os.getenv("CLOUD_AI_MODEL", "gpt-4o-mini")
        return CloudLLMClient(api_key=api_key, base_url=base_url, model_name=model)

    # Default to MockLLMClient for reliable, offline, zero-cost operation
    model = cfg.get("MOCK_MODEL", "mock-socratic-tutor")
    return MockLLMClient(model_name=model)


__all__ = [
    "BaseLLMClient",
    "MockLLMClient",
    "OllamaLLMClient",
    "CloudLLMClient",
    "get_llm_provider"
]
