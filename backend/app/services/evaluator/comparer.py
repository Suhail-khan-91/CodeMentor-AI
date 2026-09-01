"""
CodeMentor AI — Output Comparison Engine (Phase A5).

Flexible matchers for comparing actual program stdout against expected test case output.
"""

import re
from typing import Optional


def _normalize_newlines(text: str) -> str:
    """Normalize Windows \\r\\n to Unix \\n."""
    return text.replace("\r\n", "\n")


def compare_output(actual: str, expected: str, match_mode: str = "trimmed") -> bool:
    """
    Compare actual output string against expected output string according to match_mode.

    :param actual: Raw standard output captured from student program.
    :param expected: Target expected output from test case definition.
    :param match_mode: "trimmed" | "exact" | "ignore_case" | "numeric_float"
    :return: True if actual matches expected, False otherwise.
    """
    act_norm = _normalize_newlines(actual)
    exp_norm = _normalize_newlines(expected)

    if match_mode == "exact":
        return act_norm == exp_norm

    if match_mode == "ignore_case":
        return act_norm.strip().lower() == exp_norm.strip().lower()

    if match_mode == "numeric_float":
        # Extract all floats/ints from actual and expected
        act_nums = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", act_norm)
        exp_nums = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", exp_norm)

        if act_nums and exp_nums and len(act_nums) == len(exp_nums):
            try:
                for a_str, e_str in zip(act_nums, exp_nums):
                    a_val = float(a_str)
                    e_val = float(e_str)
                    if abs(a_val - e_val) > 1e-4:
                        return False
                return True
            except ValueError:
                pass

        # Fallback to trimmed match if numeric parsing fails
        return act_norm.strip() == exp_norm.strip()

    # Default: "trimmed" mode
    # Normalizes leading/trailing whitespace while preserving line structure
    act_lines = [line.rstrip() for line in act_norm.strip().splitlines()]
    exp_lines = [line.rstrip() for line in exp_norm.strip().splitlines()]

    return act_lines == exp_lines
