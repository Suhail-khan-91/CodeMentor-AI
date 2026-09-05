"""
CodeMentor AI — AI Tutor Service Package (Phase A7).

Exposes the AITutorEngine and helper functions for generating Socratic guidance.
"""

from typing import Optional, Dict, Any
from app.services.ai.base import AITutorResponse, AIErrorExplanationResponse, BaseLLMClient
from app.services.ai.tutor_engine import AITutorEngine
from app.services.ai.error_explainer import (
    AIErrorExplainer,
    get_ai_error_explainer,
    explain_error_with_ai,
    build_error_explanation_prompt
)
from app.services.evaluator.base import TaskDefinition, EvaluationResult

_ENGINE_INSTANCE: Optional[AITutorEngine] = None


def get_ai_tutor_engine() -> AITutorEngine:
    """Retrieve or create the singleton AITutorEngine instance."""
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        _ENGINE_INSTANCE = AITutorEngine()
    return _ENGINE_INSTANCE


def ask_ai_tutor(
    code: str,
    task: Optional[TaskDefinition] = None,
    execution_details: Optional[Dict[str, Any]] = None,
    evaluation_result: Optional[EvaluationResult] = None,
    diagnostic: Optional[Dict[str, Any]] = None,
    student_question: Optional[str] = None,
    client_override: Optional[BaseLLMClient] = None
) -> AITutorResponse:
    """Convenience helper to request tutoring from the default AI tutor engine."""
    engine = get_ai_tutor_engine()
    return engine.ask_tutor(
        code=code,
        task=task,
        execution_details=execution_details,
        evaluation_result=evaluation_result,
        diagnostic=diagnostic,
        student_question=student_question,
        client_override=client_override
    )


__all__ = [
    "AITutorEngine",
    "AITutorResponse",
    "AIErrorExplainer",
    "AIErrorExplanationResponse",
    "BaseLLMClient",
    "get_ai_tutor_engine",
    "ask_ai_tutor",
    "get_ai_error_explainer",
    "explain_error_with_ai",
    "build_error_explanation_prompt"
]

