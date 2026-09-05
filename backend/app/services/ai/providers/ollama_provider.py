"""
CodeMentor AI — Local Ollama LLM Provider (Phase A7).

Connects to a local Ollama server over HTTP using Python's standard urllib module.
Handles connection failures gracefully and enforces Socratic constraints.
"""

import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any
from app.services.ai.base import BaseLLMClient, AITutorResponse


class OllamaLLMClient(BaseLLMClient):
    """Client for locally running Ollama instances (e.g. llama3, mistral, qwen)."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model_name: str = "llama3",
        timeout_seconds: float = 10.0
    ):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout = timeout_seconds

    def is_available(self) -> bool:
        """Ping Ollama's /api/tags endpoint to check liveness."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AITutorResponse:
        """Call Ollama's /api/generate endpoint with system and user prompts."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9
            }
        }

        try:
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status == 200:
                    resp_json = json.loads(response.read().decode("utf-8"))
                    raw_text = resp_json.get("response", "").strip()
                    return self._parse_ai_output(raw_text)
                else:
                    return AITutorResponse(
                        success=False,
                        status="error",
                        socratic_guidance="Ollama server returned a non-200 status code.",
                        provider="ollama",
                        model=self.model_name,
                        error_message=f"HTTP {response.status}"
                    )
        except urllib.error.URLError as e:
            return AITutorResponse(
                success=False,
                status="unavailable",
                socratic_guidance=(
                    "Local AI (Ollama) is currently unreachable on http://localhost:11434. "
                    "Make sure Ollama is running (`ollama serve`), or use our deterministic hints."
                ),
                provider="ollama",
                model=self.model_name,
                error_message=str(e)
            )
        except Exception as e:
            return AITutorResponse(
                success=False,
                status="error",
                socratic_guidance="An unexpected error occurred while communicating with Ollama.",
                provider="ollama",
                model=self.model_name,
                error_message=str(e)
            )

    def _parse_ai_output(self, raw_text: str) -> AITutorResponse:
        """Parse raw model output into structured tutor guidance."""
        return AITutorResponse(
            success=True,
            status="success",
            socratic_guidance=raw_text,
            conceptual_nudge="Reflect on the guidance above and verify your mental model.",
            strategy="Break the challenge into steps and apply the suggested logic.",
            structural_clue="# Structural clue from AI Tutor:\n...",
            source="ai_tutor",
            provider="ollama",
            model=self.model_name
        )
