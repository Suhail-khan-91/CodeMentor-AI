"""
CodeMentor AI — Hint Matchers & Code Inspection Helpers (Phase A6).

Deterministic inspection utilities utilizing Python's standard ast and re modules.
Safely analyzes code structure, AST nodes, and test case actual/expected output diffs.
"""

import ast
import re
from typing import Optional, List
from app.services.evaluator.base import EvaluationResult


def safe_parse_ast(code: str) -> Optional[ast.AST]:
    """Parse Python source code into an AST safely, returning None on syntax error."""
    try:
        return ast.parse(code)
    except Exception:
        return None


def contains_prompt_in_input(code: str) -> bool:
    """
    Detect if input() is called with an argument prompt string.
    Example: input("Enter your name: ") or input('Number: ')
    In automated test suites, prompt strings bleed into stdout and cause diff failures.
    """
    tree = safe_parse_ast(code)
    if not tree:
        # Fallback to regex
        return bool(re.search(r'\binput\s*\(\s*["\']', code))

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id == "input":
                if len(node.args) > 0:
                    return True
    return False


def uses_raw_input_without_conversion(code: str) -> bool:
    """
    Detect if input() is called without int() or float() conversion.
    For tasks requiring numeric calculations (Even/Odd, Sum, Temp), reading raw strings
    is a primary cause of logical failures.
    """
    tree = safe_parse_ast(code)
    if not tree:
        # Regex fallback: input() without int(input()) or float(input())
        if "input()" in code and not re.search(r'(int|float)\s*\(\s*input', code):
            return True
        return False

    has_input = False
    converted_input = False

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id == "input":
                    has_input = True
                elif node.func.id in ("int", "float"):
                    # Check if any argument is an input() call
                    for arg in node.args:
                        if isinstance(arg, ast.Call) and isinstance(arg.func, ast.Name) and arg.func.id == "input":
                            converted_input = True

    return has_input and not converted_input


def detect_inverted_modulo(code: str) -> bool:
    """
    Detect inverted condition logic in even/odd checking.
    e.g. if num % 2 == 1: print("Even")
    or if num % 2 != 0: print("Even")
    or if num % 2 == 0: print("Odd")
    """
    tree = safe_parse_ast(code)
    if tree:
        for node in ast.walk(tree):
            if isinstance(node, ast.If):
                # Check condition for modulo 2
                is_mod_2 = False
                op_val = None  # e.g. ('==', 0), ('==', 1), ('!=', 0)
                if isinstance(node.test, ast.Compare) and len(node.test.ops) == 1:
                    left = node.test.left
                    op = node.test.ops[0]
                    right = node.test.comparators[0]
                    if isinstance(left, ast.BinOp) and isinstance(left.op, ast.Mod):
                        if isinstance(left.right, ast.Constant) and left.right.value == 2:
                            is_mod_2 = True
                            if isinstance(right, ast.Constant):
                                if isinstance(op, ast.Eq):
                                    op_val = ('==', right.value)
                                elif isinstance(op, ast.NotEq):
                                    op_val = ('!=', right.value)

                if is_mod_2 and op_val:
                    # Look at what is printed directly inside node.body (not orelse)
                    body_prints = []
                    for b_node in node.body:
                        for inner in ast.walk(b_node):
                            if isinstance(inner, ast.Call) and isinstance(inner.func, ast.Name) and inner.func.id == "print":
                                for arg in inner.args:
                                    if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                                        body_prints.append(arg.value.strip().lower())

                    # If condition is (% 2 == 1 or % 2 != 0) and body prints 'even', inverted!
                    if op_val in [('==', 1), ('!=', 0)] and 'even' in body_prints:
                        return True
                    # If condition is (% 2 == 0) and body prints 'odd', inverted!
                    if op_val == ('==', 0) and 'odd' in body_prints:
                        return True

    # Regex fallback for single-line statements
    if re.search(r'%\s*2\s*==\s*1\s*:\s*print\s*\(\s*[\'"]Even[\'"]', code, re.IGNORECASE):
        return True
    if re.search(r'%\s*2\s*!=\s*0\s*:\s*print\s*\(\s*[\'"]Even[\'"]', code, re.IGNORECASE):
        return True
    if re.search(r'%\s*2\s*==\s*0\s*:\s*print\s*\(\s*[\'"]Odd[\'"]', code, re.IGNORECASE):
        return True

    return False


def detect_addition_concatenation(evaluation_result: Optional[EvaluationResult]) -> bool:
    """
    Detect when numbers were concatenated as strings instead of added mathematically.
    e.g. Input: 5 and 10 -> Expected: 15, Actual: 510 or '510'
    """
    if not evaluation_result or not evaluation_result.test_results:
        return False

    for tr in evaluation_result.test_results:
        if not tr.passed and tr.actual_output and tr.expected_output:
            actual_clean = tr.actual_output.strip()
            # If stdin had two lines e.g. "5\n10", concatenated is "510"
            parts = tr.stdin.strip().split()
            if len(parts) >= 2:
                concatenated = "".join(parts)
                if actual_clean == concatenated and actual_clean != tr.expected_output.strip():
                    return True
    return False


def detect_celcius_fahrenheit_mistake(code: str) -> Optional[str]:
    """
    Detect common formula bugs in temperature conversion: F = (C * 9/5) + 32
    Returns a mistake key:
      - 'missing_32': Missing + 32 offset
      - 'integer_division': Using 9 // 5 instead of 9 / 5
      - 'inverted_ratio': Using 5 / 9 instead of 9 / 5
    """
    # 1. Missing + 32
    if "32" not in code:
        return "missing_32"

    # 2. Integer division 9 // 5
    if re.search(r'9\s*//\s*5', code) or re.search(r'//\s*5', code):
        return "integer_division"

    # 3. Inverted ratio 5 / 9 or 5.0 / 9
    if re.search(r'5(?:\.0)?\s*/\s*9', code):
        return "inverted_ratio"

    return None


def detect_hardcoded_solution(code: str, required_func: str = "input") -> bool:
    """
    Detect if code hardcodes answers without using required interactive functions like input().
    """
    return required_func not in code


def detect_case_or_punctuation_issue(evaluation_result: Optional[EvaluationResult]) -> Optional[str]:
    """
    Detect if output failed solely due to casing or missing punctuation.
    Returns 'casing' if lowercase/uppercase mismatch, 'punctuation' if punctuation difference.
    """
    if not evaluation_result or not evaluation_result.test_results:
        return None

    for tr in evaluation_result.test_results:
        if not tr.passed and tr.actual_output and tr.expected_output:
            act = tr.actual_output.strip()
            exp = tr.expected_output.strip()

            if act.lower() == exp.lower() and act != exp:
                return "casing"

            # Strip punctuation and check equality
            act_no_punct = re.sub(r'[^\w\s]', '', act)
            exp_no_punct = re.sub(r'[^\w\s]', '', exp)
            if act_no_punct.lower() == exp_no_punct.lower() and act != exp:
                return "punctuation"

    return None


def detect_empty_output(evaluation_result: Optional[EvaluationResult]) -> bool:
    """Detect if all failing test cases produced empty stdout."""
    if not evaluation_result or not evaluation_result.test_results:
        return False

    failed = [tr for tr in evaluation_result.test_results if not tr.passed]
    if not failed:
        return False

    return all(not tr.actual_output or tr.actual_output.strip() == "" for tr in failed)


def detect_print_extra_quotes(code: str) -> bool:
    """
    Detect if student enclosed output in nested quotes.
    e.g. print("'Hello, World!'") or print('"Hello, World!"')
    causing actual output to literally have quotes printed.
    """
    return bool(re.search(r'print\s*\(\s*["\'][\'"].*?[\'"]["\']\s*\)', code))
