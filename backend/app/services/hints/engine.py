"""
CodeMentor AI — Hint Engine (Phase A6).

Deterministic engine orchestrating progressive hint selection.
Evaluates task-specific known mistake rules, general logic rules, and fallback progressions.
"""

from typing import Optional, List
from app.services.hints.base import HintRule, TieredHint, HintResponse
from app.services.hints.rules_tasks import TASK_RULES, get_task_default_hint
from app.services.hints.rules_general import GENERAL_RULES, GENERIC_FALLBACK_HINT
from app.services.evaluator.base import EvaluationResult, TaskDefinition


class HintEngine:
    """Orchestrates deterministic rule-based hint generation."""

    def __init__(self, custom_rules: Optional[List[HintRule]] = None):
        all_rules = list(TASK_RULES) + list(GENERAL_RULES)
        if custom_rules:
            all_rules.extend(custom_rules)
        # Sort rules by priority descending (highest priority evaluated first)
        self._rules = sorted(all_rules, key=lambda r: r.priority, reverse=True)

    def generate_hints(
        self,
        code: str,
        task: Optional[TaskDefinition] = None,
        evaluation_result: Optional[EvaluationResult] = None
    ) -> HintResponse:
        """
        Generate a 3-tier progressive hint package based on code, task, and test results.

        Evaluation order:
        1. Task-specific known mistake rules (highest priority for this task).
        2. General output/logic rules (empty output, prompt strings, crashes).
        3. Task default 3-tier progressive hint sequence.
        4. Global fallback hint sequence.
        """
        # 1. Evaluate task-specific rules first
        if task:
            task_rules = [r for r in self._rules if r.task_id == task.id]
            for rule in task_rules:
                if rule.matches(code, evaluation_result, task):
                    tiered = rule.to_tiered_hint()
                    return HintResponse(
                        has_hints=True,
                        rule_id=tiered.rule_id,
                        rule_name=tiered.rule_name,
                        matched_mistake=tiered.matched_mistake,
                        hints=tiered.to_dict(),
                        source=tiered.source,
                        total_levels=3
                    )

        # 2. Evaluate general cross-task rules
        general_rules = [r for r in self._rules if r.task_id is None]
        for rule in general_rules:
            if rule.matches(code, evaluation_result, task):
                tiered = rule.to_tiered_hint()
                return HintResponse(
                    has_hints=True,
                    rule_id=tiered.rule_id,
                    rule_name=tiered.rule_name,
                    matched_mistake=tiered.matched_mistake,
                    hints=tiered.to_dict(),
                    source=tiered.source,
                    total_levels=3
                )

        # 3. Fallback to task-specific default hint progression
        if task:
            default_hint = get_task_default_hint(task.id)
            if default_hint:
                return HintResponse(
                    has_hints=True,
                    rule_id=default_hint.rule_id,
                    rule_name=default_hint.rule_name,
                    matched_mistake=default_hint.matched_mistake,
                    hints=default_hint.to_dict(),
                    source=default_hint.source,
                    total_levels=3
                )

        # 4. Global generic fallback
        return HintResponse(
            has_hints=True,
            rule_id=GENERIC_FALLBACK_HINT.rule_id,
            rule_name=GENERIC_FALLBACK_HINT.rule_name,
            matched_mistake=GENERIC_FALLBACK_HINT.matched_mistake,
            hints=GENERIC_FALLBACK_HINT.to_dict(),
            source=GENERIC_FALLBACK_HINT.source,
            total_levels=3
        )
