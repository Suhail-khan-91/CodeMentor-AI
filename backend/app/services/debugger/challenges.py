"""
CodeMentor AI — Curated Starter Debug Challenges (Phase A13).

5 foundational debugging challenges representing real-world beginner Python errors:
1. Syntax error: missing colon & indentation
2. Type error: string concatenation instead of integer arithmetic
3. Loop boundary: off-by-one error in range()
4. Logic inversion: reversed even/odd classification
5. NameError: casing mismatch in variable name
"""

from typing import List, Optional
from app.services.evaluator.base import TestCase
from app.services.hints.base import TieredHint
from app.services.debugger.base import DebugChallenge

DEBUG_CHALLENGES: List[DebugChallenge] = [
    # 1. Syntax Error: Missing Colon & Indentation
    DebugChallenge(
        id="debug_syntax_colon",
        title="1. Missing Colon & Indentation (Syntax Bug)",
        description="This program checks if a student passed with a score of 50 or higher. But Python raises a SyntaxError before execution begins! Find and fix the syntax errors.",
        bug_type="syntax",
        buggy_code=(
            "score = int(input())\n"
            "if score >= 50\n"
            "print(\"Passed\")\n"
            "else:\n"
            "    print(\"Failed\")\n"
        ),
        test_cases=[
            TestCase(
                id="tc_syn_1",
                description="Passing score (75)",
                stdin="75",
                expected_output="Passed",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_syn_2",
                description="Failing score (40)",
                stdin="40",
                expected_output="Failed",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_syn_3",
                description="Boundary score (50)",
                stdin="50",
                expected_output="Passed",
                is_hidden=True,
                match_mode="trimmed",
            ),
        ],
        hints=TieredHint(
            level_1_nudge="Python requires a special punctuation symbol at the end of conditional statements like 'if'.",
            level_2_strategy="Add a colon (:) after the 'if score >= 50' condition, and make sure the print statement under it is indented with 4 spaces.",
            level_3_clue="Structure:\nif score >= 50:\n    print(\"Passed\")\nelse:\n    print(\"Failed\")",
            rule_id="debug_syntax_colon_rule",
            rule_name="Missing Colon and Indentation",
            source="rule_based",
            matched_mistake="Missing colon on if statement and unindented body.",
        ),
    ),

    # 2. Type Error: String Concatenation Bug
    DebugChallenge(
        id="debug_type_concat",
        title="2. The Number Concatenator (Type Error Bug)",
        description="This program reads two numbers and should print their arithmetic sum. However, entering 5 and 10 results in '510' instead of 15! Fix the data type handling.",
        bug_type="type_error",
        buggy_code=(
            "# Read two numbers and print their arithmetic sum\n"
            "a = input()\n"
            "b = input()\n"
            "print(a + b)\n"
        ),
        test_cases=[
            TestCase(
                id="tc_typ_1",
                description="Add 5 and 10",
                stdin="5\n10",
                expected_output="15",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_typ_2",
                description="Add 3 and 4",
                stdin="3\n4",
                expected_output="7",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_typ_3",
                description="Add 0 and 0",
                stdin="0\n0",
                expected_output="0",
                is_hidden=True,
                match_mode="trimmed",
            ),
        ],
        hints=TieredHint(
            level_1_nudge="Remember that the input() function returns text strings by default, even if the user types digits.",
            level_2_strategy="Using the + operator on two strings joins them end-to-end. Convert both values to integers using int() before calculating.",
            level_3_clue="Structure:\na = int(input())\nb = int(input())\nprint(a + b)",
            rule_id="debug_type_concat_rule",
            rule_name="String Concatenation Instead of Addition",
            source="rule_based",
            matched_mistake="Variables a and b are strings, causing concatenation.",
        ),
    ),

    # 3. Logic Bug: Off-by-One Loop Bug
    DebugChallenge(
        id="debug_off_by_one",
        title="3. The Early Stopper (Off-by-One Loop Bug)",
        description="This program is supposed to print numbers from 1 up to and including 10, each on a new line. But it stops early at 9! Fix the loop boundary.",
        bug_type="logic",
        buggy_code=(
            "# Print numbers 1 to 10 inclusive\n"
            "for i in range(1, 10):\n"
            "    print(i)\n"
        ),
        test_cases=[
            TestCase(
                id="tc_loop_1",
                description="Print 1 through 10 inclusive",
                stdin="",
                expected_output="1\n2\n3\n4\n5\n6\n7\n8\n9\n10",
                is_hidden=False,
                match_mode="trimmed",
            ),
        ],
        hints=TieredHint(
            level_1_nudge="Python's range(start, stop) function generates numbers up to, but not including, the stop value.",
            level_2_strategy="To include the number 10, the second argument of range() must be one greater than 10.",
            level_3_clue="Structure:\nfor i in range(1, 11):\n    print(i)",
            rule_id="debug_off_by_one_rule",
            rule_name="Off-by-One Range Boundary",
            source="rule_based",
            matched_mistake="range(1, 10) stops at 9.",
        ),
    ),

    # 4. Logic Bug: Inverted Even/Odd Classifier
    DebugChallenge(
        id="debug_even_odd_inverted",
        title="4. The Reversed Classifier (Logic Inversion Bug)",
        description="This program checks whether an integer is Even or Odd. But it mistakenly prints 'Even' for odd numbers and 'Odd' for even numbers! Correct the conditional logic.",
        bug_type="logic",
        buggy_code=(
            "num = int(input())\n"
            "# Inverted remainder check\n"
            "if num % 2 == 1:\n"
            "    print(\"Even\")\n"
            "else:\n"
            "    print(\"Odd\")\n"
        ),
        test_cases=[
            TestCase(
                id="tc_eo_1",
                description="Classify even number (4)",
                stdin="4",
                expected_output="Even",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_eo_2",
                description="Classify odd number (7)",
                stdin="7",
                expected_output="Odd",
                is_hidden=False,
                match_mode="trimmed",
            ),
            TestCase(
                id="tc_eo_3",
                description="Classify zero (0)",
                stdin="0",
                expected_output="Even",
                is_hidden=True,
                match_mode="trimmed",
            ),
        ],
        hints=TieredHint(
            level_1_nudge="Think about what remainder is left when an even number is divided by 2.",
            level_2_strategy="Even numbers divide evenly with a remainder of 0 (num % 2 == 0). Check if the remainder is 0 to print Even.",
            level_3_clue="Structure:\nif num % 2 == 0:\n    print(\"Even\")\nelse:\n    print(\"Odd\")",
            rule_id="debug_even_odd_inverted_rule",
            rule_name="Inverted Even/Odd Modulo Logic",
            source="rule_based",
            matched_mistake="Remainder of 1 signifies odd, but code prints Even.",
        ),
    ),

    # 5. Runtime Bug: NameError & Variable Casing Bug
    DebugChallenge(
        id="debug_name_error_casing",
        title="5. The Mystery Variable (NameError Casing Bug)",
        description="This program calculates the sum of three numbers. Running it causes a NameError crash because Python is case-sensitive! Correct the variable name.",
        bug_type="runtime",
        buggy_code=(
            "# Sum three numbers\n"
            "total = 10 + 20 + 30\n"
            "# Notice the casing:\n"
            "print(Total)\n"
        ),
        test_cases=[
            TestCase(
                id="tc_name_1",
                description="Print the sum of 10, 20, and 30",
                stdin="",
                expected_output="60",
                is_hidden=False,
                match_mode="trimmed",
            ),
        ],
        hints=TieredHint(
            level_1_nudge="Python is strictly case-sensitive: 'total' and 'Total' are treated as two completely different identifiers.",
            level_2_strategy="Check the exact casing used when creating the variable on line 2, and use the exact same lowercase letters inside print().",
            level_3_clue="Structure:\ntotal = 10 + 20 + 30\nprint(total)",
            rule_id="debug_name_casing_rule",
            rule_name="Case Sensitivity NameError",
            source="rule_based",
            matched_mistake="Variable defined as 'total' but printed as 'Total'.",
        ),
    ),
]


def get_debug_challenges() -> List[DebugChallenge]:
    """Retrieve all curated debug challenges."""
    return list(DEBUG_CHALLENGES)


def get_debug_challenge(challenge_id: str) -> Optional[DebugChallenge]:
    """Retrieve a single debug challenge by its unique ID."""
    for ch in DEBUG_CHALLENGES:
        if ch.id == challenge_id:
            return ch
    return None
