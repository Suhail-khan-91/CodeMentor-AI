"""
CodeMentor AI — Task-Specific Hint Rules & Default Progressions (Phase A6).

Contains:
1. Specific known mistake rules for all 5 sample starter practice challenges.
2. Default 3-tier progressive hint fallbacks for each sample task.
"""

from typing import List, Dict, Optional
from app.services.hints.base import HintRule, TieredHint
from app.services.hints import matchers
from app.services.evaluator.base import EvaluationResult, TaskDefinition


# =====================================================================
# 1. TASK DEFAULT 3-TIER PROGRESSIVE HINTS (FALLBACK GUARANTEE)
# =====================================================================

TASK_DEFAULT_HINTS: Dict[str, TieredHint] = {
    "task_hello": TieredHint(
        rule_id="default_task_hello",
        rule_name="Hello World Basics",
        level_1_nudge="Look closely at the required sentence: check capitalization, spacing, and punctuation marks.",
        level_2_strategy="Use Python's built-in print() function with the exact text enclosed in single or double quotes.",
        level_3_clue="Syntax pattern: print(\"Exact Text Here!\")",
        source="rule_based",
        matched_mistake="Task guidance for printing exact output."
    ),
    "task_greeting": TieredHint(
        rule_id="default_task_greeting",
        rule_name="Personalized Greeting Guidance",
        level_1_nudge="Your program must read the visitor's name from input, then construct the greeting dynamically.",
        level_2_strategy="Assign input() to a variable (e.g. name), then combine 'Hello, ' + name + '!' or use an f-string.",
        level_3_clue="Structure: name = input()\nprint(f\"Hello, {name}!\")",
        source="rule_based",
        matched_mistake="Task guidance for dynamic user input and greeting formatting."
    ),
    "task_even_odd": TieredHint(
        rule_id="default_task_even_odd",
        rule_name="Even or Odd Guidance",
        level_1_nudge="An integer is even if dividing it by 2 leaves no remainder, and odd if it leaves a remainder of 1.",
        level_2_strategy="Read input with int(), then use the modulo operator (%) in an if/else statement to check if the remainder is 0.",
        level_3_clue="Structure:\nnum = int(input())\nif num % 2 == 0:\n    print(\"Even\")\nelse:\n    print(\"Odd\")",
        source="rule_based",
        matched_mistake="Task guidance for modulo remainder checking and conditionals."
    ),
    "task_temp_converter": TieredHint(
        rule_id="default_task_temp_converter",
        rule_name="Temperature Converter Guidance",
        level_1_nudge="Recall the mathematical formula to convert Celsius to Fahrenheit: multiply Celsius by 9/5, then add 32.",
        level_2_strategy="Convert the input string to float(input()), apply the formula (celsius * 9 / 5) + 32, and print the calculated value.",
        level_3_clue="Structure:\nc = float(input())\nf = (c * 9 / 5) + 32\nprint(f)",
        source="rule_based",
        matched_mistake="Task guidance for floating-point temperature conversion."
    ),
    "task_sum_two": TieredHint(
        rule_id="default_task_sum_two",
        rule_name="Sum of Two Numbers Guidance",
        level_1_nudge="The problem provides two separate numbers, each given on its own line of input.",
        level_2_strategy="Call int(input()) twice to store both numbers in separate variables, then print their sum with +.",
        level_3_clue="Structure:\na = int(input())\nb = int(input())\nprint(a + b)",
        source="rule_based",
        matched_mistake="Task guidance for reading multiple numeric inputs and adding them."
    )
}


# =====================================================================
# 2. TASK-SPECIFIC KNOWN MISTAKE RULES
# =====================================================================

def _match_hello_punctuation(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    diff_kind = matchers.detect_case_or_punctuation_issue(eval_res)
    return diff_kind in ("casing", "punctuation")


def _match_hello_quotes(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.detect_print_extra_quotes(code)


def _match_greeting_hardcoded(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.detect_hardcoded_solution(code, required_func="input")


def _match_greeting_prompt(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.contains_prompt_in_input(code)


def _match_even_odd_no_int(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.uses_raw_input_without_conversion(code)


def _match_even_odd_inverted(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.detect_inverted_modulo(code)


def _match_temp_converter_formula(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    issue = matchers.detect_celcius_fahrenheit_mistake(code)
    return issue is not None


def _match_sum_two_concat(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    return matchers.detect_addition_concatenation(eval_res) or (
        "input()" in code and "int(" not in code and "float(" not in code
    )


def _match_sum_two_single_input(code: str, eval_res: Optional[EvaluationResult], task: Optional[TaskDefinition]) -> bool:
    tree = matchers.safe_parse_ast(code)
    if not tree:
        return False
    import ast
    input_calls = [
        node for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "input"
    ]
    return len(input_calls) == 1


TASK_RULES: List[HintRule] = [
    # --- Task 1: Hello, World! ---
    HintRule(
        id="rule_hello_punct_case",
        name="Exact Punctuation & Casing",
        description="The output differs from 'Hello, World!' due to letter case or missing punctuation.",
        task_id="task_hello",
        priority=300,
        level_1_nudge="Computers require character-for-character precision. Check uppercase vs lowercase and punctuation.",
        level_2_strategy="Ensure 'H' and 'W' are capitalized, a comma follows 'Hello', and an exclamation mark ends the string.",
        level_3_clue="Required string: print(\"Hello, World!\")",
        matcher=_match_hello_punctuation
    ),
    HintRule(
        id="rule_hello_nested_quotes",
        name="Nested Quotation Marks",
        description="Nested quotes inside print() caused literal quotes to appear in the terminal.",
        task_id="task_hello",
        priority=310,
        level_1_nudge="If quotation marks appear inside your output, you may have wrapped quotes inside quotes.",
        level_2_strategy="Use only one set of enclosing quotes around the string inside print().",
        level_3_clue="Avoid print(\"'Hello, World!'\"). Use print(\"Hello, World!\") instead.",
        matcher=_match_hello_quotes
    ),

    # --- Task 2: Personalized Greeting ---
    HintRule(
        id="rule_greeting_hardcoded",
        name="Hardcoded Name",
        description="The code prints a fixed name instead of reading dynamically from standard input.",
        task_id="task_greeting",
        priority=300,
        level_1_nudge="Your program must greet any person whose name is entered, not just one specific name.",
        level_2_strategy="Call input() to store the name into a variable, then insert that variable into your greeting.",
        level_3_clue="Pattern: name = input()\nprint(f\"Hello, {name}!\")",
        matcher=_match_greeting_hardcoded
    ),
    HintRule(
        id="rule_greeting_prompt",
        name="Interactive Prompt String in input()",
        description="Passing a message into input('Enter name: ') adds unwanted text to the output in automated graders.",
        task_id="task_greeting",
        priority=350,
        level_1_nudge="In automated coding challenges, prompt text inside input() is treated as program output.",
        level_2_strategy="Call input() with no arguments so that only the user's name is read without printing a prompt.",
        level_3_clue="Change name = input(\"Enter name: \") to name = input()",
        matcher=_match_greeting_prompt
    ),

    # --- Task 3: Even or Odd ---
    HintRule(
        id="rule_even_odd_no_int",
        name="Missing Integer Conversion",
        description="input() returns a string. The modulo operator (%) requires numeric integers.",
        task_id="task_even_odd",
        priority=370,
        level_1_nudge="Remember that input() always returns text (a string), even if the input looks like a number.",
        level_2_strategy="Wrap the input() call with int() before applying the modulo (%) remainder operator.",
        level_3_clue="Pattern: num = int(input())\nif num % 2 == 0: ...",
        matcher=_match_even_odd_no_int
    ),
    HintRule(
        id="rule_even_odd_inverted",
        name="Inverted Even/Odd Condition",
        description="The conditional check prints 'Even' when the remainder is 1, or 'Odd' when the remainder is 0.",
        task_id="task_even_odd",
        priority=360,
        level_1_nudge="Double check which condition corresponds to Even numbers vs Odd numbers.",
        level_2_strategy="When a number is divided by 2, an Even number has remainder 0 (num % 2 == 0).",
        level_3_clue="Check: if num % 2 == 0: print(\"Even\") else: print(\"Odd\")",
        matcher=_match_even_odd_inverted
    ),

    # --- Task 4: Temperature Converter ---
    HintRule(
        id="rule_temp_formula_issue",
        name="Temperature Formula Error",
        description="The conversion formula F = (C * 9/5) + 32 has a mathematical calculation or ratio error.",
        task_id="task_temp_converter",
        priority=320,
        level_1_nudge="Check each part of the formula: the multiplication ratio (9/5), and the addition (+ 32).",
        level_2_strategy="Make sure to use true division (9 / 5), not integer division (9 // 5), and remember to add 32 at the end.",
        level_3_clue="Pattern: fahrenheit = (celsius * 9 / 5) + 32",
        matcher=_match_temp_converter_formula
    ),

    # --- Task 5: Sum of Two Numbers ---
    HintRule(
        id="rule_sum_two_concat",
        name="String Concatenation Instead of Addition",
        description="The + operator joined two text strings together (e.g. '5' + '10' = '510') instead of summing them.",
        task_id="task_sum_two",
        priority=350,
        level_1_nudge="In Python, applying + to text strings glues them together instead of calculating their mathematical sum.",
        level_2_strategy="Convert both inputs to integers using int(input()) before applying the + operator.",
        level_3_clue="Pattern:\na = int(input())\nb = int(input())\nprint(a + b)",
        matcher=_match_sum_two_concat
    ),
    HintRule(
        id="rule_sum_two_single_input",
        name="Only One Input Read",
        description="The program only reads one input line, but the task supplies two numbers on separate lines.",
        task_id="task_sum_two",
        priority=340,
        level_1_nudge="The two numbers are given on separate lines, which means input() must be called twice.",
        level_2_strategy="Call int(input()) on two separate lines to store each number in its own variable.",
        level_3_clue="Pattern:\na = int(input())\nb = int(input())",
        matcher=_match_sum_two_single_input
    ),
]


def get_task_default_hint(task_id: str) -> Optional[TieredHint]:
    """Retrieve the fallback 3-tier progressive hint for a task."""
    return TASK_DEFAULT_HINTS.get(task_id)
