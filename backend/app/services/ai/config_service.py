"""
CodeMentor AI — AI Configuration & Connection Test Service (Phase A8).

Manages runtime AI provider configurations, securely masks API keys,
and executes live connection health probes (Mock, Ollama, Cloud).
"""

import os
import time
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

DEFAULT_CONFIG: Dict[str, Any] = {
    "provider": os.getenv("AI_PROVIDER", "mock").lower().strip(),
    "ollama": {
        "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        "model": os.getenv("OLLAMA_MODEL", "llama3")
    },
    "cloud": {
        "provider_name": "openai",
        "base_url": os.getenv("CLOUD_AI_BASE_URL", "https://api.openai.com/v1"),
        "api_key": os.getenv("CLOUD_AI_API_KEY", ""),
        "model": os.getenv("CLOUD_AI_MODEL", "gpt-4o-mini")
    }
}


def mask_api_key(key: str) -> str:
    """Mask an API key for safe client display (e.g. 'sk-...4a9f')."""
    if not key or not key.strip():
        return ""
    clean = key.strip()
    if len(clean) <= 8:
        return "••••••••"
    return f"{clean[:3]}...{clean[-4:]}"


class AIConfigService:
    """Service managing runtime AI provider settings and connection testing."""

    def __init__(self, initial_config: Optional[Dict[str, Any]] = None):
        self._config = initial_config.copy() if initial_config else json.loads(json.dumps(DEFAULT_CONFIG))

    def get_config(self, mask_secrets: bool = True) -> Dict[str, Any]:
        """Retrieve current AI configuration, with sensitive keys masked by default."""
        cfg_copy = json.loads(json.dumps(self._config))
        if mask_secrets and "cloud" in cfg_copy:
            raw_key = cfg_copy["cloud"].get("api_key", "")
            cfg_copy["cloud"]["api_key"] = mask_api_key(raw_key)
            cfg_copy["cloud"]["has_api_key"] = bool(raw_key and raw_key.strip())
        return cfg_copy

    def update_config(self, new_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update the runtime AI configuration.
        Preserves existing API key if masked string is passed back.
        """
        if "provider" in new_config:
            p = str(new_config["provider"]).lower().strip()
            if p in ("mock", "ollama", "cloud"):
                self._config["provider"] = p

        if "ollama" in new_config and isinstance(new_config["ollama"], dict):
            o = new_config["ollama"]
            if "base_url" in o and o["base_url"]:
                self._config["ollama"]["base_url"] = str(o["base_url"]).strip()
            if "model" in o and o["model"]:
                self._config["ollama"]["model"] = str(o["model"]).strip()

        if "cloud" in new_config and isinstance(new_config["cloud"], dict):
            c = new_config["cloud"]
            if "provider_name" in c and c["provider_name"]:
                self._config["cloud"]["provider_name"] = str(c["provider_name"]).strip()
            if "base_url" in c and c["base_url"]:
                self._config["cloud"]["base_url"] = str(c["base_url"]).strip()
            if "model" in c and c["model"]:
                self._config["cloud"]["model"] = str(c["model"]).strip()

            # Handle API key: if a real new key is provided (not masked), update it
            if "api_key" in c:
                incoming_key = str(c["api_key"]).strip()
                # If incoming is not empty and not the masked placeholder, update
                if incoming_key and not incoming_key.startswith("••") and "..." not in incoming_key:
                    self._config["cloud"]["api_key"] = incoming_key
                elif incoming_key == "":
                    self._config["cloud"]["api_key"] = ""

        # Dynamically refresh active client in the A7 AI Tutor engine
        self._sync_tutor_engine()

        return self.get_config(mask_secrets=True)

    def _sync_tutor_engine(self):
        """Update the A7 tutor engine's client to match new configuration."""
        try:
            from app.services.ai import get_ai_tutor_engine
            from app.services.ai.providers import get_llm_provider

            engine = get_ai_tutor_engine()
            provider = self._config.get("provider", "mock")
            override_cfg = {}

            if provider == "ollama":
                override_cfg["OLLAMA_BASE_URL"] = self._config["ollama"].get("base_url")
                override_cfg["OLLAMA_MODEL"] = self._config["ollama"].get("model")
            elif provider == "cloud":
                override_cfg["CLOUD_AI_BASE_URL"] = self._config["cloud"].get("base_url")
                override_cfg["CLOUD_AI_API_KEY"] = self._config["cloud"].get("api_key")
                override_cfg["CLOUD_AI_MODEL"] = self._config["cloud"].get("model")

            engine._client = get_llm_provider(provider_type=provider, config=override_cfg)
        except Exception:
            pass

    def test_connection(
        self,
        provider: Optional[str] = None,
        custom_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Probe target AI provider connection and measure latency.

        :param provider: 'mock', 'ollama', or 'cloud'. Defaults to active provider.
        :param custom_params: Optional parameters to test without saving.
        :return: Dict with success, latency_ms, message, and details.
        """
        target_provider = (provider or self._config.get("provider", "mock")).lower().strip()
        start_time = time.perf_counter()

        # 1. Mock Provider Test
        if target_provider == "mock":
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return {
                "success": True,
                "status": "connected",
                "provider": "mock",
                "latency_ms": max(elapsed_ms, 0.5),
                "message": "Offline Mock Socratic Tutor is ready and responsive.",
                "details": {
                    "mode": "offline",
                    "requires_internet": False,
                    "cost": "Free (Built-in)"
                }
            }

        # 2. Local Ollama Provider Test
        elif target_provider == "ollama":
            ollama_cfg = custom_params.get("ollama", {}) if custom_params and "ollama" in custom_params else self._config.get("ollama", {})
            base_url = (ollama_cfg.get("base_url") or "http://localhost:11434").rstrip("/")
            model = ollama_cfg.get("model") or "llama3"

            try:
                req = urllib.request.Request(f"{base_url}/api/tags", method="GET")
                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                    if resp.status == 200:
                        body = json.loads(resp.read().decode("utf-8"))
                        available_models = [m.get("name", "") for m in body.get("models", [])]
                        has_model = any(model in m for m in available_models)
                        msg = f"Connected to Ollama ({elapsed_ms}ms)!"
                        if not has_model and available_models:
                            msg += f" Note: Model '{model}' not found in local library ({', '.join(available_models[:3])}). You may need to run `ollama pull {model}`."
                        elif has_model:
                            msg += f" Model '{model}' is installed and ready."

                        return {
                            "success": True,
                            "status": "connected",
                            "provider": "ollama",
                            "latency_ms": elapsed_ms,
                            "message": msg,
                            "details": {
                                "base_url": base_url,
                                "model": model,
                                "available_models": available_models[:10]
                            }
                        }
                    else:
                        return {
                            "success": False,
                            "status": "error",
                            "provider": "ollama",
                            "latency_ms": elapsed_ms,
                            "message": f"Ollama returned HTTP {resp.status}.",
                            "details": {"base_url": base_url}
                        }
            except urllib.error.URLError as e:
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "success": False,
                    "status": "unreachable",
                    "provider": "ollama",
                    "latency_ms": elapsed_ms,
                    "message": f"Could not connect to Ollama at {base_url}. Ensure the Ollama app or service is running (`ollama serve`).",
                    "details": {"error": str(e), "base_url": base_url}
                }
            except Exception as e:
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "success": False,
                    "status": "error",
                    "provider": "ollama",
                    "latency_ms": elapsed_ms,
                    "message": f"Error connecting to Ollama: {str(e)}",
                    "details": {"error": str(e)}
                }

        # 3. Cloud Provider Test
        elif target_provider == "cloud":
            cloud_cfg = custom_params.get("cloud", {}) if custom_params and "cloud" in custom_params else self._config.get("cloud", {})
            api_key = cloud_cfg.get("api_key") or self._config.get("cloud", {}).get("api_key", "")
            base_url = (cloud_cfg.get("base_url") or "https://api.openai.com/v1").rstrip("/")
            model = cloud_cfg.get("model") or "gpt-4o-mini"

            # Check if key is provided
            if not api_key or not api_key.strip():
                return {
                    "success": False,
                    "status": "missing_api_key",
                    "provider": "cloud",
                    "latency_ms": 0.0,
                    "message": "Cloud API Key is missing. Please provide a valid API key to connect.",
                    "details": {"base_url": base_url, "model": model}
                }

            # Send a lightweight test probe (e.g. GET /models or minimal 1-token completion)
            url = f"{base_url}/models"
            try:
                req = urllib.request.Request(
                    url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "User-Agent": "CodeMentorAI/1.0"
                    },
                    method="GET"
                )
                with urllib.request.urlopen(req, timeout=3.5) as resp:
                    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                    if resp.status == 200:
                        return {
                            "success": True,
                            "status": "connected",
                            "provider": "cloud",
                            "latency_ms": elapsed_ms,
                            "message": f"Successfully connected to Cloud AI provider ({elapsed_ms}ms)! Model '{model}' ready.",
                            "details": {
                                "base_url": base_url,
                                "model": model
                            }
                        }
                    else:
                        return {
                            "success": False,
                            "status": "error",
                            "provider": "cloud",
                            "latency_ms": elapsed_ms,
                            "message": f"Cloud provider returned HTTP {resp.status}.",
                            "details": {"base_url": base_url}
                        }
            except urllib.error.HTTPError as e:
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                msg = f"Cloud authentication failed (HTTP {e.code}). Please verify your API key."
                if e.code == 401:
                    msg = "Invalid API Key. Please check your credentials."
                return {
                    "success": False,
                    "status": "auth_error",
                    "provider": "cloud",
                    "latency_ms": elapsed_ms,
                    "message": msg,
                    "details": {"code": e.code, "reason": str(e.reason)}
                }
            except urllib.error.URLError as e:
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "success": False,
                    "status": "unreachable",
                    "provider": "cloud",
                    "latency_ms": elapsed_ms,
                    "message": f"Could not reach endpoint at {base_url}. Check your internet connection or URL.",
                    "details": {"error": str(e)}
                }
            except Exception as e:
                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                return {
                    "success": False,
                    "status": "error",
                    "provider": "cloud",
                    "latency_ms": elapsed_ms,
                    "message": f"Error connecting to Cloud AI: {str(e)}",
                    "details": {"error": str(e)}
                }

        return {
            "success": False,
            "status": "invalid_provider",
            "provider": target_provider,
            "latency_ms": 0.0,
            "message": f"Unknown AI provider '{target_provider}'. Supported: mock, ollama, cloud."
        }


# Singleton accessor
_CONFIG_SERVICE_INSTANCE: Optional[AIConfigService] = None


def get_ai_config_service() -> AIConfigService:
    """Retrieve or create the singleton AIConfigService instance."""
    global _CONFIG_SERVICE_INSTANCE
    if _CONFIG_SERVICE_INSTANCE is None:
        _CONFIG_SERVICE_INSTANCE = AIConfigService()
    return _CONFIG_SERVICE_INSTANCE
