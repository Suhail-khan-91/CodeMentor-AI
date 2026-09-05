"""
CodeMentor AI — AI Tutor Data Models & Abstract Interfaces (Phase A7).

Defines structured responses, message types, and the BaseLLMClient interface.
Enforces Socratic pedagogical guidance and non-solution safeguards.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List


@dataclass
class AITutorResponse:
    """Structured guidance returned by the AI Tutor Engine."""
    success: bool
    status: str                        # "success" | "unavailable" | "fallback" | "error"
    socratic_guidance: str             # Conversational explanation & reflective questions
    conceptual_nudge: str = ""         # Tier 1 mental model adjustment
    strategy: str = ""                 # Tier 2 algorithmic strategy
    structural_clue: str = ""          # Tier 3 skeleton/pattern (never complete solution)
    source: str = "ai_tutor"           # "ai_tutor" (identifies AI-generated vs rule_based)
    provider: str = "mock"             # "mock" | "ollama" | "cloud"
    model: str = "default"             # Model identifier
    error_message: Optional[str] = None
    suggested_actions: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "socratic_guidance": self.socratic_guidance,
            "conceptual_nudge": self.conceptual_nudge,
            "strategy": self.strategy,
            "structural_clue": self.structural_clue,
            "source": self.source,
            "provider": self.provider,
            "model": self.model,
            "error_message": self.error_message,
            "suggested_actions": self.suggested_actions
        }


@dataclass
class AIErrorExplanationResponse:
    """Structured beginner-friendly error explanation returned by the AI Error Explainer (Phase A9)."""
    success: bool
    status: str                        # "success" | "unavailable" | "fallback" | "error"
    error_type: str                    # e.g. "SyntaxError", "NameError", "TypeError"
    headline: str                      # Concise 1-sentence summary for beginners
    what_it_means: str                 # General conceptual explanation of the error category
    why_it_happened: str               # Contextual explanation of the student's code on the specific line
    how_to_think_about_it: str         # Socratic mental model / guiding questions to fix it (no direct solution)
    concepts_to_review: List[str] = field(default_factory=list) # e.g. ["Variables", "Type Casting"]
    line_number: Optional[int] = None  # Failing line number if known
    source: str = "ai_error_explainer"
    provider: str = "mock"             # "mock" | "ollama" | "cloud"
    model: str = "default"             # Model identifier
    error_message: Optional[str] = None # System error message if failed/unavailable

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "error_type": self.error_type,
            "headline": self.headline,
            "what_it_means": self.what_it_means,
            "why_it_happened": self.why_it_happened,
            "how_to_think_about_it": self.how_to_think_about_it,
            "concepts_to_review": self.concepts_to_review,
            "line_number": self.line_number,
            "source": self.source,
            "provider": self.provider,
            "model": self.model,
            "error_message": self.error_message
        }


class BaseLLMClient(ABC):
    """Abstract interface for all LLM providers (Mock, Ollama, Cloud)."""

    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> AITutorResponse:
        """Generate pedagogical guidance from system instructions and user context."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check whether this provider is reachable and configured."""
        pass

