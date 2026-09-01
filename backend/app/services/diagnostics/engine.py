"""
CodeMentor AI — Diagnostic Engine (Phase A4).

Deterministic engine orchestrating syntax and runtime error diagnostics.
Converts technical tracebacks into beginner-friendly explanations with actionable guidance.
"""

from typing import Optional, List, Dict, Any
from app.services.diagnostics.base import CodeDiagnostic
from app.services.diagnostics import syntax_rules
from app.services.diagnostics import runtime_rules


class DiagnosticEngine:
    """Orchestrates deterministic rule-based code diagnostics."""

    @staticmethod
    def diagnose(
        code: str,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None,
        line_number: Optional[int] = None,
        stderr: str = "",
        timed_out: bool = False
    ) -> CodeDiagnostic:
        """
        Analyze code and error metadata to produce an educational diagnostic.

        :param code: Full Python source code submitted by user.
        :param error_type: Error class name (e.g. "SyntaxError", "ZeroDivisionError").
        :param error_message: Error description string.
        :param line_number: 1-indexed line number in source code.
        :param stderr: Full standard error traceback output.
        :param timed_out: Whether execution timed out.
        :return: CodeDiagnostic instance.
        """
        # 1. If code ran successfully and didn't time out
        if not error_type and not timed_out and not stderr.strip():
            return CodeDiagnostic(
                has_diagnostic=False,
                error_type=None,
                title="Code Executed Successfully",
                friendly_explanation="Your program finished executing without any errors.",
                hint=None,
                line_number=None,
                code_snippet=None,
                category="general",
                confidence="high"
            )

        code_lines = code.splitlines()
        e_type = error_type or "RuntimeError"
        e_msg = error_message or ""

        # Safe line snippet extraction
        code_snippet = None
        if line_number and 1 <= line_number <= len(code_lines):
            code_snippet = code_lines[line_number - 1].rstrip()

        # 2. Timeout Error
        if timed_out or e_type == "TimeoutError":
            diag = runtime_rules.match_timeout_error(code_lines, line_number, e_msg)
            if diag:
                return diag

        # 3. Indentation & Tab Errors
        if e_type in ("IndentationError", "TabError"):
            diag = syntax_rules.match_indentation_error(code_lines, line_number, e_msg)
            if diag:
                return diag

        # 4. Syntax Errors
        if e_type == "SyntaxError":
            # Priority 1: Unclosed string
            diag = syntax_rules.match_unclosed_string(code_lines, line_number, e_msg)
            if diag:
                return diag

            # Priority 2: Unmatched brackets / parentheses
            diag = syntax_rules.match_unmatched_delimiter(code_lines, line_number, e_msg)
            if diag:
                return diag

            # Priority 3: Keyword as variable or invalid name
            diag = syntax_rules.match_reserved_keyword_or_name(code_lines, line_number, e_msg)
            if diag:
                return diag

            # Priority 4: Assignment in condition (= vs ==)
            diag = syntax_rules.match_assignment_in_condition(code_lines, line_number, e_msg)
            if diag:
                return diag

            # Priority 5: Missing colon
            diag = syntax_rules.match_missing_colon(code_lines, line_number, e_msg)
            if diag:
                return diag

            # Generic SyntaxError fallback
            return CodeDiagnostic(
                has_diagnostic=True,
                error_type="SyntaxError",
                title="Syntax Error",
                friendly_explanation=(
                    f"Python encountered a syntax mistake on line {line_number or '?'}. "
                    "This usually means a typo, missing quotation mark, bracket, colon, or symbol."
                ),
                hint=f"Examine line {line_number or '?'}: verify punctuation, spelling, and operators.",
                line_number=line_number,
                code_snippet=code_snippet,
                category="syntax",
                confidence="medium"
            )

        # 5. Runtime Errors
        if e_type == "ZeroDivisionError":
            return runtime_rules.match_zero_division(code_lines, line_number, e_msg)

        if e_type == "NameError":
            return runtime_rules.match_name_error(code_lines, line_number, e_msg)

        if e_type == "TypeError":
            return runtime_rules.match_type_error(code_lines, line_number, e_msg)

        if e_type == "IndexError":
            return runtime_rules.match_index_error(code_lines, line_number, e_msg)

        if e_type == "KeyError":
            return runtime_rules.match_key_error(code_lines, line_number, e_msg)

        if e_type == "AttributeError":
            return runtime_rules.match_attribute_error(code_lines, line_number, e_msg)

        if e_type == "ValueError":
            return runtime_rules.match_value_error(code_lines, line_number, e_msg)

        if e_type == "RecursionError":
            return runtime_rules.match_recursion_error(code_lines, line_number, e_msg)

        # 6. Fallback generic runtime diagnostic
        return CodeDiagnostic(
            has_diagnostic=True,
            error_type=e_type,
            title=f"Runtime Error: {e_type}",
            friendly_explanation=(
                f"Your code ran into an issue while executing: {e_msg or 'an unhandled exception occurred'}."
            ),
            hint=f"Check the statement on line {line_number or '?'} and ensure all values and operations are valid.",
            line_number=line_number,
            code_snippet=code_snippet,
            category="runtime",
            confidence="medium"
        )


def diagnose_error(
    code: str,
    error_type: Optional[str] = None,
    error_message: Optional[str] = None,
    line_number: Optional[int] = None,
    stderr: str = "",
    timed_out: bool = False
) -> CodeDiagnostic:
    """Helper shortcut function to produce a diagnostic."""
    return DiagnosticEngine.diagnose(
        code=code,
        error_type=error_type,
        error_message=error_message,
        line_number=line_number,
        stderr=stderr,
        timed_out=timed_out
    )
