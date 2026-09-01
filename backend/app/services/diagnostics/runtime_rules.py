"""
CodeMentor AI — Runtime Diagnostic Rules (Phase A4).

Deterministic rules for Python runtime exceptions (ZeroDivision, NameError, TypeError, IndexError, KeyError, etc.).
"""

import re
from typing import Optional, List
from app.services.diagnostics.base import CodeDiagnostic

BUILTIN_CASING_CORRECTIONS = {
    "print": "print",
    "Print": "print",
    "PRINT": "print",
    "true": "True",
    "false": "False",
    "none": "None",
    "null": "None",
    "len": "len",
    "Len": "len",
    "input": "input",
    "Input": "input",
    "str": "str",
    "Str": "str",
    "int": "int",
    "Int": "int",
    "float": "float",
    "Float": "float",
    "range": "range",
    "Range": "range",
    "list": "list",
    "List": "list",
    "dict": "dict",
    "Dict": "dict"
}


def match_zero_division(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect division or modulo by zero."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="ZeroDivisionError",
        title="Division by Zero",
        friendly_explanation=(
            "Your code attempted to divide a number by zero (or by a variable whose value is `0`). "
            "In mathematics and in Python, division and modulo by zero are undefined."
        ),
        hint=f"Check line {line_no or '?'}: verify that your divisor is not zero before dividing.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_name_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect undefined variable or function names, including casing typos."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None

    # Extract the name: e.g. name 'Print' is not defined
    match = re.search(r"name\s+['\"](.*?)['\"]\s+is not defined", error_msg)
    name = match.group(1) if match else "variable"

    # Check for casing typo on Python built-ins
    if name in BUILTIN_CASING_CORRECTIONS:
        correct = BUILTIN_CASING_CORRECTIONS[name]
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="NameError",
            title=f"Capitalization Typo: Use `{correct}` Instead of `{name}`",
            friendly_explanation=(
                f"Python is case-sensitive. `{name}` is not recognized, but Python has a built-in named `{correct}`."
            ),
            hint=f"Change `{name}` to `{correct}` on line {line_no or '?'}.",
            line_number=line_no,
            code_snippet=snippet,
            category="runtime",
            confidence="high"
        )

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="NameError",
        title=f"Name `{name}` Not Defined",
        friendly_explanation=(
            f"Python does not know what `{name}` is. This usually happens if you haven't created or assigned "
            f"a value to `{name}` yet, or if there is a spelling mistake."
        ),
        hint=f"Make sure you define `{name} = ...` before line {line_no or '?'}, and double-check your spelling.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_type_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect incompatible type operations, concatenation errors, or invalid calls."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    msg_lower = error_msg.lower()

    # Concatenation of str and int/float
    if "can only concatenate str" in msg_lower or "unsupported operand type" in msg_lower:
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="TypeError",
            title="Combining Incompatible Data Types",
            friendly_explanation=(
                "You tried to add or concatenate two different data types (such as text and numbers) "
                "that cannot be combined directly with `+`."
            ),
            hint=(
                f"On line {line_no or '?'}, convert the number to text using `str(variable)` or use an f-string: "
                "`f'Text {variable}'`."
            ),
            line_number=line_no,
            code_snippet=snippet,
            category="runtime",
            confidence="high"
        )

    # Object is not callable (e.g. x = 5; x())
    if "object is not callable" in msg_lower:
        match_obj = re.search(r"['\"](.*?)['\"]\s+object is not callable", error_msg)
        obj_type = match_obj.group(1) if match_obj else "value"
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="TypeError",
            title=f"`{obj_type}` Object Is Not a Function",
            friendly_explanation=(
                f"You placed parentheses `()` after a variable of type `{obj_type}`, which tells Python to run it like a function. "
                f"However, `{obj_type}` objects cannot be called."
            ),
            hint=f"Check line {line_no or '?'}: make sure you are calling an actual function and not a variable.",
            line_number=line_no,
            code_snippet=snippet,
            category="runtime",
            confidence="high"
        )

    # Missing arguments or too many arguments
    if "positional argument" in msg_lower or "argument" in msg_lower:
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="TypeError",
            title="Incorrect Function Arguments",
            friendly_explanation=(
                "The function was called with the wrong number of arguments. "
                "It was either given too few or too many values inside the parentheses."
            ),
            hint=f"Check the function definition and supply the required arguments on line {line_no or '?'}.",
            line_number=line_no,
            code_snippet=snippet,
            category="runtime",
            confidence="high"
        )

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="TypeError",
        title="Type Mismatch",
        friendly_explanation=(
            f"An operation or function was applied to an inappropriate data type: {error_msg}"
        ),
        hint=f"Check the data types of your variables on line {line_no or '?'}.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="medium"
    )


def match_index_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect list/tuple/string index out of range."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="IndexError",
        title="Index Out of Bounds",
        friendly_explanation=(
            "You attempted to access an element at an index that does not exist. "
            "Remember that Python lists and strings start at index `0`. For example, a list with 3 elements has indexes `0, 1, 2`."
        ),
        hint=(
            f"Check the index you are accessing on line {line_no or '?'}. "
            "Use `len(collection)` to make sure the index is within the valid range (from `0` to `len - 1`)."
        ),
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_key_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect missing dictionary key."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    match = re.search(r"KeyError:\s*(.*)", error_msg)
    key_name = match.group(1) if match else "the key"

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="KeyError",
        title=f"Dictionary Key {key_name} Not Found",
        friendly_explanation=(
            f"Your code tried to retrieve {key_name} from a dictionary, but that key does not exist."
        ),
        hint=(
            f"On line {line_no or '?'}, verify that the key exists before accessing it (`if {key_name} in my_dict:`), "
            f"or use `my_dict.get({key_name}, default_value)` to prevent crashes."
        ),
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_attribute_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect accessing missing methods or attributes on an object."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    match = re.search(r"['\"](.*?)['\"]\s+object has no attribute\s+['\"](.*?)['\"]", error_msg)

    if match:
        obj_type, attr_name = match.group(1), match.group(2)
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="AttributeError",
            title=f"`{obj_type}` Has No Method `.{attr_name}()`",
            friendly_explanation=(
                f"You tried to use `.{attr_name}` on a `{obj_type}` object, but `{obj_type}` objects do not support this method. "
                f"(For example, `.append()` belongs to lists, not strings)."
            ),
            hint=f"Check line {line_no or '?'}: verify the data type of the variable and use methods that it supports.",
            line_number=line_no,
            code_snippet=snippet,
            category="runtime",
            confidence="high"
        )

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="AttributeError",
        title="Attribute or Method Not Found",
        friendly_explanation=f"You tried to access an attribute or method that does not exist: {error_msg}",
        hint=f"Check the spelling of the method on line {line_no or '?'}.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="medium"
    )


def match_value_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect invalid conversions such as int('abc')."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="ValueError",
        title="Invalid Value Conversion",
        friendly_explanation=(
            "A function received a value that has the right type but an inappropriate value. "
            "For instance, `int('hello')` fails because the text cannot be converted into a number."
        ),
        hint=f"On line {line_no or '?'}, ensure the input contains valid numbers or digits before converting.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_recursion_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect infinite recursive function calls."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="RecursionError",
        title="Infinite Recursion Detected",
        friendly_explanation=(
            "A function kept calling itself repeatedly until Python ran out of call stack memory. "
            "Every recursive function must have a base case (stopping condition) to end the recursion."
        ),
        hint=f"Add a base condition (such as `if n <= 1: return`) inside your function around line {line_no or '?'}.",
        line_number=line_no,
        code_snippet=snippet,
        category="runtime",
        confidence="high"
    )


def match_timeout_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect execution timeouts (e.g. infinite while loops)."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="TimeoutError",
        title="Execution Timed Out (Infinite Loop)",
        friendly_explanation=(
            "Your program took longer than 5.0 seconds to finish and was stopped. "
            "This almost always happens when a `while` loop runs forever because its condition never becomes `False`."
        ),
        hint="Check your `while` or `for` loops. Make sure the loop counter increments or reaches a stopping condition.",
        line_number=line_no,
        code_snippet=snippet,
        category="timeout",
        confidence="high"
    )
