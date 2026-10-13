"""
CodeMentor AI — Cloud LLM Provider (Phase A7).

Connects to standard OpenAI-compatible Cloud LLM endpoints over HTTP.
Handles missing keys and connection errors gracefully.
"""

import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any
from app.services.ai.base import BaseLLMClient, AITutorResponse


class CloudLLMClient(BaseLLMClient):
    """Client for Cloud OpenAI-compatible endpoints."""

    def __init__(
        self,
        api_key: str = "",
        base_url: str = "https://api.openai.com/v1",
        model_name: str = "gpt-4o-mini",
        timeout_seconds: float = 25.0
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout = timeout_seconds
        self.provider_label = "OpenRouter" if "openrouter" in self.base_url.lower() else "Cloud AI"

    def is_available(self) -> bool:
        """Check if an API key has been provided."""
        return bool(self.api_key and self.api_key.strip())

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AITutorResponse:
        """Send chat completion request to the Cloud LLM endpoint."""
        if not self.is_available():
            return AITutorResponse(
                success=False,
                status="unavailable",
                socratic_guidance=(
                    "Cloud AI Tutor is not yet configured with an API key. "
                    "You can configure your provider in Phase A8 settings or use our deterministic hints!"
                ),
                provider="cloud",
                model=self.model_name,
                error_message="Missing CLOUD_AI_API_KEY"
            )

        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3
        }

        try:
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "CodeMentor AI",
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status == 200:
                    resp_json = json.loads(response.read().decode("utf-8"))
                    choices = resp_json.get("choices", [])
                    if choices:
                        raw_text = choices[0].get("message", {}).get("content", "").strip()
                        return AITutorResponse(
                            success=True,
                            status="success",
                            socratic_guidance=raw_text,
                            conceptual_nudge="",
                            strategy="",
                            structural_clue="",
                            source="ai_tutor",
                            provider=self.provider_label,
                            model=self.model_name
                        )
                return AITutorResponse(
                    success=False,
                    status="error",
                    socratic_guidance="Cloud AI provider returned an unexpected response.",
                    provider=self.provider_label,
                    model=self.model_name,
                    error_message=f"HTTP {response.status}"
                )
        except urllib.error.URLError as e:
            return AITutorResponse(
                success=False,
                status="unavailable",
                socratic_guidance="Could not reach the Cloud AI endpoint. Check your internet connection.",
                provider=self.provider_label,
                model=self.model_name,
                error_message=str(e)
            )
        except Exception as e:
            return AITutorResponse(
                success=False,
                status="error",
                socratic_guidance="An unexpected error occurred while communicating with the Cloud AI provider.",
                provider=self.provider_label,
                model=self.model_name,
                error_message=str(e)
            )
