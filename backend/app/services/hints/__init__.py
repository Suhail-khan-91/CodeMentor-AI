"""
CodeMentor AI — Hint Service Package (Phase A6).

Exposes the HintEngine and convenient helper functions for generating tiered progressive hints.
"""

from typing import Optional
from app.services.hints.base import TieredHint, HintRule, HintResponse
from app.services.hints.engine import HintEngine
from app.services.evaluator.base import EvaluationResult, TaskDefinition

_ENGINE_INSTANCE: Optional[HintEngine] = None


def get_hint_engine() -> HintEngine:
    """Retrieve or create the singleton HintEngine instance."""
    global _ENGINE_INSTANCE
    if _ENGINE_INSTANCE is None:
        _ENGINE_INSTANCE = HintEngine()
    return _ENGINE_INSTANCE


def generate_hints(
    code: str,
    task: Optional[TaskDefinition] = None,
    evaluation_result: Optional[EvaluationResult] = None
) -> HintResponse:
    """Convenience helper to generate hints using the default hint engine."""
    engine = get_hint_engine()
    return engine.generate_hints(code=code, task=task, evaluation_result=evaluation_result)


__all__ = [
    "HintEngine",
    "TieredHint",
    "HintRule",
    "HintResponse",
    "get_hint_engine",
    "generate_hints"
]
