"""
CodeMentor AI — Custom Question Templates and Validation (Phase A10).

Provides pre-defined starter challenge templates and schema validation for
student-authored custom questions.
"""

from typing import Dict, Any, List, Tuple, Optional

# Pre-defined challenge templates to jumpstart students in Custom Question Mode
CUSTOM_QUESTION_TEMPLATES: List[Dict[str, Any]] = [
    {
        "id": "template_star_triangle",
        "title": "Right-Angled Star Triangle",
        "description": "Write a program that takes an integer N from standard input and prints a right-angled triangle of asterisks (*) with N rows, where row i has i stars.",
        "starter_code": "n = int(input())\n# Print a star triangle with n rows\n",
        "test_cases": [
            {
                "id": "tc_star_1",
                "description": "3-row triangle",
                "stdin": "3",
                "expected_output": "*\n**\n***",
                "match_mode": "trimmed"
            },
            {
                "id": "tc_star_2",
                "description": "5-row triangle",
                "stdin": "5",
                "expected_output": "*\n**\n***\n****\n*****",
                "match_mode": "trimmed"
            }
        ]
    },
    {
        "id": "template_reverse_words",
        "title": "Reverse Words in a Sentence",
        "description": "Write a Python program that reads a sentence from input and prints the words in reverse order, joined by a single space.",
        "starter_code": "sentence = input()\n# Reverse word order and print\n",
        "test_cases": [
            {
                "id": "tc_rev_1",
                "description": "Three words sentence",
                "stdin": "Hello Python World",
                "expected_output": "World Python Hello",
                "match_mode": "trimmed"
            },
            {
                "id": "tc_rev_2",
                "description": "Two words brand",
                "stdin": "CodeMentor AI",
                "expected_output": "AI CodeMentor",
                "match_mode": "trimmed"
            }
        ]
    },
    {
        "id": "template_count_vowels",
        "title": "Count Vowels in a String",
        "description": "Write a Python program that reads a string from input and prints the total number of vowels (a, e, i, o, u, case-insensitive).",
        "starter_code": "text = input()\n# Count vowels and print total\n",
        "test_cases": [
            {
                "id": "tc_vowels_1",
                "description": "Word with two vowels",
                "stdin": "apple",
                "expected_output": "2",
                "match_mode": "trimmed"
            },
            {
                "id": "tc_vowels_2",
                "description": "Mixed case text",
                "stdin": "CodeMentor",
                "expected_output": "4",
                "match_mode": "trimmed"
            }
        ]
    },
    {
        "id": "template_blank_challenge",
        "title": "My Custom Python Challenge",
        "description": "Describe your challenge requirements and expected behavior here.",
        "starter_code": "# Write your Python solution here\n",
        "test_cases": [
            {
                "id": "tc_custom_1",
                "description": "Sample test case",
                "stdin": "",
                "expected_output": "",
                "match_mode": "trimmed"
            }
        ]
    }
]

VALID_MATCH_MODES = {"trimmed", "exact", "ignore_case", "numeric_float"}


def validate_custom_question(data: Any) -> Tuple[bool, Optional[str]]:
    """
    Validate a student-defined custom question payload.

    :param data: Dictionary containing custom question definition.
    :return: Tuple of (is_valid, error_message).
    """
    if not isinstance(data, dict):
        return False, "Custom question payload must be a JSON object"

    title = data.get("title")
    if not title or not isinstance(title, str) or not title.strip():
        return False, "Question 'title' is required and cannot be empty"

    description = data.get("description")
    if not description or not isinstance(description, str) or not description.strip():
        return False, "Question 'description' is required and cannot be empty"

    # Validate test cases if provided
    test_cases = data.get("test_cases", [])
    if not isinstance(test_cases, list):
        return False, "'test_cases' must be a list"

    for idx, tc in enumerate(test_cases):
        if not isinstance(tc, dict):
            return False, f"Test case at index {idx} must be an object"

        match_mode = tc.get("match_mode", "trimmed")
        if match_mode not in VALID_MATCH_MODES:
            return False, (
                f"Test case at index {idx} has invalid match_mode '{match_mode}'. "
                f"Allowed modes: {sorted(list(VALID_MATCH_MODES))}"
            )

    return True, None
