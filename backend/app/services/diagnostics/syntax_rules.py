"""
CodeMentor AI — Syntax Diagnostic Rules (Phase A4).

Deterministic rules for syntax errors, indentation errors, and formatting mistakes.
"""

import re
from typing import Optional, List
from app.services.diagnostics.base import CodeDiagnostic

BLOCK_KEYWORDS = (
    "if", "elif", "else", "def", "for", "while", "class",
    "try", "except", "finally", "with", "async def", "async for", "async with"
)

BLOCK_PATTERNS = [
    (r"^if\s+[^\s=]", "if"),
    (r"^elif\s+[^\s=]", "elif"),
    (r"^else$", "else"),
    (r"^while\s+[^\s=]", "while"),
    (r"^for\s+[A-Za-z_][A-Za-z0-9_,\s]*\s+in\s+", "for"),
    (r"^def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(.*?\)", "def"),
    (r"^class\s+[A-Za-z_][A-Za-z0-9_]*(\(.*?\))?", "class"),
    (r"^try$", "try"),
    (r"^finally$", "finally"),
    (r"^except(\s+.*)?$", "except"),
    (r"^with\s+", "with"),
]

RESERVED_KEYWORDS = {
    "False", "None", "True", "and", "as", "assert", "async", "await",
    "break", "class", "continue", "def", "del", "elif", "else", "except",
    "finally", "for", "from", "global", "if", "import", "in", "is",
    "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
    "try", "while", "with", "yield"
}


def match_missing_colon(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect missing colon at the end of block statement header."""
    if not line_no or line_no < 1 or line_no > len(code_lines):
        return None

    line = code_lines[line_no - 1].strip()
    # Check current line or previous line if Python points to the next line
    candidate_lines = [(line_no, line)]
    if line_no > 1:
        candidate_lines.append((line_no - 1, code_lines[line_no - 2].strip()))

    for l_num, l_text in candidate_lines:
        for pattern, kw in BLOCK_PATTERNS:
            if re.match(pattern, l_text) and not l_text.rstrip().endswith(":"):
                snippet = code_lines[l_num - 1].rstrip()
                return CodeDiagnostic(
                    has_diagnostic=True,
                    error_type="SyntaxError",
                    title="Missing Colon (`:`)",
                    friendly_explanation=(
                        f"In Python, statements that start a new code block (such as `{kw}`) "
                        f"must end with a colon (`:`)."
                    ),
                    hint=f"Add a colon `:` at the very end of line {l_num}: `{snippet}:`",
                    line_number=l_num,
                    code_snippet=snippet,
                    category="syntax",
                    confidence="high"
                )

    # Check for keywords inside the line missing a colon before statements (e.g. `if x > 5 print("hi")`)
    if re.search(r"^(if|while|elif)\s+.+\s+(print|return|pass|break|continue)\b", line) and ":" not in line:
        snippet = code_lines[line_no - 1].rstrip()
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="SyntaxError",
            title="Missing Colon (`:`) Before Statement",
            friendly_explanation="You wrote a condition and a statement on the same line without placing a colon `:` between them.",
            hint=f"Add a `:` after the condition on line {line_no}, or put the statement on a new indented line.",
            line_number=line_no,
            code_snippet=snippet,
            category="syntax",
            confidence="high"
        )

    return None


def match_unclosed_string(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect unterminated or unclosed string quotation marks."""
    msg_lower = error_msg.lower()
    is_string_error = (
        "unterminated string literal" in msg_lower
        or "eol while scanning string literal" in msg_lower
        or "unterminated triple-quoted string" in msg_lower
    )

    if not is_string_error and line_no and 1 <= line_no <= len(code_lines):
        # Fallback check on line content
        line = code_lines[line_no - 1]
        single_quotes = len(re.findall(r"(?<!\\)'", line))
        double_quotes = len(re.findall(r'(?<!\\)"', line))
        if single_quotes % 2 != 0 or double_quotes % 2 != 0:
            is_string_error = True

    if is_string_error:
        snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="SyntaxError",
            title="Unclosed String Quotation",
            friendly_explanation=(
                "Your string starts with a quotation mark (`\"` or `'`) but is missing its matching "
                "closing quotation mark before the end of the line."
            ),
            hint=f"Make sure you close every string with the same quote type you opened it with (line {line_no or '?'}).",
            line_number=line_no,
            code_snippet=snippet,
            category="syntax",
            confidence="high"
        )

    return None


def match_unmatched_delimiter(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect unclosed or mismatched parentheses, square brackets, or curly braces."""
    msg_lower = error_msg.lower()
    is_delim_error = (
        "was never closed" in msg_lower
        or "unmatched" in msg_lower
        or "closing parenthesis" in msg_lower
        or "unexpected eof while parsing" in msg_lower
    )

    if is_delim_error:
        snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="SyntaxError",
            title="Unmatched Parenthesis or Bracket (`()`, `[]`, `{}`)",
            friendly_explanation=(
                "You opened a parenthesis `(`, square bracket `[`, or curly brace `{` that was never closed. "
                "Python searched to the end of the file or expression looking for the closing match."
            ),
            hint=f"Check line {line_no or '?'} and ensure every opening delimiter has a corresponding closing delimiter.",
            line_number=line_no,
            code_snippet=snippet,
            category="syntax",
            confidence="high"
        )

    return None


def match_assignment_in_condition(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect using a single '=' assignment instead of '==' comparison in conditions."""
    if not line_no or line_no < 1 or line_no > len(code_lines):
        return None

    line = code_lines[line_no - 1].strip()
    if re.match(r"^(if|while|elif)\b", line):
        # Look for single '=' not preceded/followed by '=', '!', '<', '>', ':'
        if re.search(r"(?<![=!<>:])=(?![=])", line):
            snippet = code_lines[line_no - 1].rstrip()
            return CodeDiagnostic(
                has_diagnostic=True,
                error_type="SyntaxError",
                title="Assignment `=` Used in Condition",
                friendly_explanation=(
                    "A single equals sign (`=`) is used to assign values to variables. "
                    "To compare whether two values are equal in an `if` condition, you must use double equals (`==`)."
                ),
                hint=f"Replace `=` with `==` on line {line_no}.",
                line_number=line_no,
                code_snippet=snippet,
                category="syntax",
                confidence="high"
            )

    return None


def match_indentation_error(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect indentation errors and tab/space mixing."""
    snippet = code_lines[line_no - 1].rstrip() if (line_no and 1 <= line_no <= len(code_lines)) else None
    msg_lower = error_msg.lower()

    if "expected an indented block" in msg_lower:
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="IndentationError",
            title="Expected Indented Block",
            friendly_explanation=(
                "Python expects the code inside functions, loops, and conditional blocks to be indented (indented by 4 spaces)."
            ),
            hint=f"Indent the code on line {line_no or '?'} with 4 spaces to place it inside the block.",
            line_number=line_no,
            code_snippet=snippet,
            category="indentation",
            confidence="high"
        )

    if "unexpected indent" in msg_lower:
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="IndentationError",
            title="Unexpected Indentation",
            friendly_explanation="This line has extra spaces at the beginning that do not belong to an enclosing block.",
            hint=f"Remove the extra spaces from the start of line {line_no or '?'} to align it with surrounding code.",
            line_number=line_no,
            code_snippet=snippet,
            category="indentation",
            confidence="high"
        )

    return CodeDiagnostic(
        has_diagnostic=True,
        error_type="IndentationError",
        title="Inconsistent Indentation",
        friendly_explanation=(
            "Python relies on consistent indentation to group statements. "
            "Mixing spaces with tabs or using uneven spacing will cause indentation errors."
        ),
        hint=f"Check the spacing at the beginning of line {line_no or '?'} and ensure you use 4 spaces per indentation level.",
        line_number=line_no,
        code_snippet=snippet,
        category="indentation",
        confidence="high"
    )


def match_reserved_keyword_or_name(code_lines: List[str], line_no: Optional[int], error_msg: str) -> Optional[CodeDiagnostic]:
    """Detect using Python reserved keywords as variable names or invalid variable names."""
    if not line_no or line_no < 1 or line_no > len(code_lines):
        return None

    line = code_lines[line_no - 1].strip()

    # Check for keyword assignment e.g. for = 5, class = "test"
    match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*=", line)
    if match and match.group(1) in RESERVED_KEYWORDS:
        kw = match.group(1)
        snippet = code_lines[line_no - 1].rstrip()
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="SyntaxError",
            title=f"Reserved Keyword `{kw}` Used as Variable",
            friendly_explanation=(
                f"`{kw}` is a reserved Python keyword and cannot be used as a variable name. "
                "Reserved words have special built-in meanings in Python."
            ),
            hint=f"Rename `{kw}` to a different name (e.g. `my_{kw}` or descriptive name) on line {line_no}.",
            line_number=line_no,
            code_snippet=snippet,
            category="syntax",
            confidence="high"
        )

    # Check for variable starting with digit e.g. 1st_var = 10
    match_digit = re.match(r"^(\d+[A-Za-z_0-9]*)\s*=", line)
    if match_digit:
        var_name = match_digit.group(1)
        snippet = code_lines[line_no - 1].rstrip()
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type="SyntaxError",
            title="Invalid Variable Name",
            friendly_explanation="Python variable names cannot start with a number. They must start with a letter or an underscore.",
            hint=f"Change `{var_name}` on line {line_no} to start with a letter (e.g. `var_{var_name}`).",
            line_number=line_no,
            code_snippet=snippet,
            category="syntax",
            confidence="high"
        )

    return None
