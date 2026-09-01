"""
CodeMentor AI — Traceback & Error Parser (Phase A3).

Deterministic parser that extracts error type, error message, and line number
from standard Python stderr and traceback strings.
"""

import re
from typing import Optional, Tuple, Dict, Any

# Common Python built-in error class names
KNOWN_ERRORS = {
    "SyntaxError", "IndentationError", "TabError",
    "ZeroDivisionError", "NameError", "TypeError", "ValueError",
    "IndexError", "KeyError", "AttributeError", "RecursionError",
    "ImportError", "ModuleNotFoundError", "FileNotFoundError",
    "UnboundLocalError", "StopIteration", "AssertionError",
    "MemoryError", "OverflowError", "TimeoutError", "RuntimeError",
    "NotImplementedError", "PermissionError", "IsADirectoryError"
}

SYNTAX_ERROR_TYPES = {"SyntaxError", "IndentationError", "TabError"}


def parse_traceback(stderr: str, script_name: str = "solution.py") -> Dict[str, Any]:
    """
    Parse Python stderr output to extract structured error details.

    :param stderr: Raw standard error string from Python process.
    :param script_name: The filename used when executing the code.
    :return: Dict containing error_type, error_message, line_number, and is_syntax_error.
    """
    if not stderr or not stderr.strip():
        return {
            "error_type": None,
            "error_message": None,
            "line_number": None,
            "is_syntax_error": False
        }

    lines = stderr.strip().splitlines()
    error_type = None
    error_message = None
    line_number = None

    # 1. Parse the last non-empty line which typically contains "ErrorType: message" or "ErrorType"
    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue

        # Check for Pattern: "ErrorName: message"
        match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*Error|[A-Za-z_][A-Za-z0-9_]*Exception|StopIteration|AssertionError):\s*(.*)$", line)
        if match:
            error_type = match.group(1)
            error_message = match.group(2).strip()
            break

        # Check for standalone error name: "ErrorName"
        match_bare = re.match(r"^([A-Za-z_][A-Za-z0-9_]*Error|[A-Za-z_][A-Za-z0-9_]*Exception)$", line)
        if match_bare:
            error_type = match_bare.group(1)
            error_message = ""
            break

    # 2. Extract line number targeting the user script (e.g. File "solution.py", line 5)
    # Search backwards to find the innermost frame referencing script_name or any Python file if script_name not found
    file_pattern_script = re.compile(rf'File\s+["\'].*?{re.escape(script_name)}["\'],\s+line\s+(\d+)', re.IGNORECASE)
    file_pattern_generic = re.compile(r'File\s+["\'].*?["\'],\s+line\s+(\d+)', re.IGNORECASE)

    for line in reversed(lines):
        match = file_pattern_script.search(line)
        if match:
            line_number = int(match.group(1))
            break

    # Fallback to any file line pattern if script-specific one wasn't matched
    if line_number is None:
        for line in reversed(lines):
            match = file_pattern_generic.search(line)
            if match:
                line_number = int(match.group(1))
                break

    is_syntax = error_type in SYNTAX_ERROR_TYPES

    return {
        "error_type": error_type,
        "error_message": error_message,
        "line_number": line_number,
        "is_syntax_error": is_syntax
    }
