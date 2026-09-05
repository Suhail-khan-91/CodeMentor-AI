"""
CodeMentor AI — General Logical Error Rules & Diagnostic Bridges (Phase A6).

Defines cross-task rules for empty output, interactive prompts in test environments,
and diagnostic bridge rules that provide tiered hints for runtime/syntax failures.
"""

from typing import List, Optional
from app.services.hints.base import HintRule, TieredHint
from app.services.hints import matchers
from app.services.evaluator.base import EvaluationResult, TaskDefinition


def _match_empty_output(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.detect_empty_output(eval_res)


def _match_general_prompt(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.contains_prompt_in_input(code)


def _match_timeout(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    if not eval_res:
        return False
    return eval_res.status == "timeout" or any(tr.status == "timeout" for tr in eval_res.test_results)


def _match_runtime_crash(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    if not eval_res:
        return False
    return eval_res.status == "error" or any(tr.status == "error" for tr in eval_res.test_results)


GENERAL_RULES: List[HintRule] = [
    HintRule(
        id="rule_general_empty_output",
        name="No Output Produced",
        description="The program finished without printing any output to standard output.",
        task_id=None,
        priority=200,
        level_1_nudge="Did you display your final result? Variables hold values in memory, but they aren't visible unless displayed.",
        level_2_strategy="Use Python's built-in print(...) function to output your calculated result to the terminal.",
        level_3_clue="Make sure your script ends with: print(your_result)",
        matcher=_match_empty_output
    ),
    HintRule(
        id="rule_general_prompt_pollution",
        name="Prompt Text in input()",
        description="Prompt strings inside input() are printed to stdout, which causes mismatches with expected test results.",
        task_id=None,
        priority=210,
        level_1_nudge="Automated grading systems check exact character output. Prompts in input() are counted as program output.",
        level_2_strategy="Leave input() blank with no prompt string inside the parentheses.",
        level_3_clue="Replace input(\"Enter: \") with simply input()",
        matcher=_match_general_prompt
    ),
    HintRule(
        id="rule_general_timeout",
        name="Execution Timeout / Infinite Loop",
        description="The code ran longer than the 5.0s maximum allowed execution time.",
        task_id=None,
        priority=250,
        level_1_nudge="A timeout usually means a loop condition never becomes false or an input is waiting indefinitely.",
        level_2_strategy="Inspect your while loops to verify that the loop counter or condition variable changes on every iteration.",
        level_3_clue="Ensure your while loop has an incrementing update: e.g. i = i + 1 or i += 1",
        matcher=_match_timeout
    ),
    HintRule(
        id="rule_general_runtime_crash",
        name="Runtime Error Occurred",
        description="An unhandled Python exception occurred during execution.",
        task_id=None,
        priority=150,
        level_1_nudge="A runtime error stopped your program before it could finish. Check the Diagnostic card above for details.",
        level_2_strategy="Read the exact error line and variable types involved to resolve the exception before checking outputs.",
        level_3_clue="Look at the highlighted line number in the diagnostic message to locate the exception.",
        matcher=_match_runtime_crash
    ),
]


GENERIC_FALLBACK_HINT = TieredHint(
    rule_id="default_generic_fallback",
    rule_name="General Problem Solving Guidance",
    level_1_nudge="Re-read the task description carefully and note the exact input and expected output formats.",
    level_2_strategy="Break the challenge into steps: (1) read input, (2) process or calculate, (3) print the exact result.",
    level_3_clue="Review each line of your code from top to bottom, verifying variable names and data types.",
    source="rule_based",
    matched_mistake="General guidance for unresolved problem."
)
