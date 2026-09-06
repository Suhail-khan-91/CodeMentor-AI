"""
CodeMentor AI — Debug Challenge Data Models (Phase A13).

Data structures for intentional buggy code challenges, test cases, and tiered hints.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any
from app.services.evaluator.base import TestCase, TaskDefinition
from app.services.hints.base import TieredHint


@dataclass
class DebugChallenge:
    """Definition of a curated Debug Mode challenge with intentional bugs."""
    id: str
    title: str
    description: str
    bug_type: str  # "syntax" | "runtime" | "logic" | "type_error"
    buggy_code: str
    test_cases: List[TestCase] = field(default_factory=list)
    hints: TieredHint = field(default_factory=lambda: TieredHint(
        level_1_nudge="Inspect the code carefully.",
        level_2_strategy="Check the syntax and logic flow.",
        level_3_clue="Look at the error or output mismatch.",
        rule_id="debug_generic",
        rule_name="Generic Debug Hint",
        source="rule_based"
    ))
    category: str = "debug"

    def to_task_definition(self) -> TaskDefinition:
        """Convert challenge into standard TaskDefinition for Phase A5 evaluation engine."""
        return TaskDefinition(
            id=self.id,
            title=self.title,
            description=self.description,
            starter_code=self.buggy_code,
            test_cases=self.test_cases,
        )

    def to_dict(self, include_test_cases: bool = False) -> Dict[str, Any]:
        """Serialize challenge to JSON dictionary."""
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "bug_type": self.bug_type,
            "buggy_code": self.buggy_code,
            "test_cases_count": len(self.test_cases),
            "hints": self.hints.to_dict(),
            "category": self.category,
        }
        if include_test_cases:
            data["test_cases"] = [tc.to_dict(hide_secrets=True) for tc in self.test_cases]
        return data
