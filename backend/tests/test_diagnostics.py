"""
CodeMentor AI — Code Diagnostic Tests (Phase A4).

Comprehensive unit and integration tests for deterministic syntax and runtime diagnostics.
"""

import pytest
from app import create_app
from app.services.diagnostics import diagnose_error, DiagnosticEngine


@pytest.fixture
def app():
    """Create and configure a testing Flask app instance."""
    return create_app("testing")


@pytest.fixture
def client(app):
    """Create a Flask test client."""
    return app.test_client()


# =====================================================================
# Unit Tests — Syntax Error Diagnostics
# =====================================================================

def test_syntax_missing_colon_if():
    code = "if x > 5\n    print('greater')"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="expected ':'",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert diag.error_type == "SyntaxError"
    assert "Missing Colon" in diag.title
    assert "line 1" in diag.hint
    assert diag.code_snippet == "if x > 5"
    assert diag.category == "syntax"


def test_syntax_missing_colon_def():
    code = "def calculate_sum(a, b)\n    return a + b"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid syntax",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Missing Colon" in diag.title
    assert "def" in diag.friendly_explanation


def test_syntax_missing_colon_for():
    code = "for i in range(5)\n    print(i)"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="expected ':'",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Missing Colon" in diag.title


def test_syntax_missing_colon_inline():
    code = "if x > 5 print('yes')"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid syntax",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Missing Colon" in diag.title


def test_syntax_unclosed_string():
    code = 'print("Hello World)'
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="unterminated string literal (detected at line 1)",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Unclosed String" in diag.title
    assert "quotation mark" in diag.friendly_explanation


def test_syntax_unmatched_parentheses():
    code = "print(5 + (10 * 2)"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="'(' was never closed",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Unmatched Parenthesis" in diag.title
    assert "never closed" in diag.friendly_explanation


def test_syntax_assignment_in_if():
    code = "if count = 10:\n    print('ten')"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid syntax. Maybe you meant '==' or ':=' instead of '='?",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Assignment" in diag.title
    assert "==" in diag.hint


def test_syntax_indentation_expected():
    code = "def greet():\nprint('hello')"
    diag = diagnose_error(
        code=code,
        error_type="IndentationError",
        error_message="expected an indented block after function definition on line 1",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert diag.category == "indentation"
    assert "Expected Indented Block" in diag.title
    assert "4 spaces" in diag.hint


def test_syntax_unexpected_indent():
    code = "x = 5\n    y = 10"
    diag = diagnose_error(
        code=code,
        error_type="IndentationError",
        error_message="unexpected indent",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Unexpected Indentation" in diag.title


def test_syntax_reserved_keyword_as_variable():
    code = "for = 10"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid syntax",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Reserved Keyword" in diag.title
    assert "for" in diag.title


def test_syntax_invalid_variable_name():
    code = "1st_place = 'Alice'"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid decimal literal",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Invalid Variable Name" in diag.title


def test_syntax_generic_fallback():
    code = "def %%%"
    diag = diagnose_error(
        code=code,
        error_type="SyntaxError",
        error_message="invalid syntax",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert diag.title == "Syntax Error"
    assert diag.confidence == "medium"


# =====================================================================
# Unit Tests — Runtime Error Diagnostics
# =====================================================================

def test_runtime_zero_division():
    code = "x = 10\ny = 0\nprint(x / y)"
    diag = diagnose_error(
        code=code,
        error_type="ZeroDivisionError",
        error_message="division by zero",
        line_number=3
    )
    assert diag.has_diagnostic is True
    assert diag.title == "Division by Zero"
    assert "undefined" in diag.friendly_explanation
    assert diag.line_number == 3
    assert diag.code_snippet == "print(x / y)"


def test_runtime_name_error_undefined():
    code = "print(unknown_variable)"
    diag = diagnose_error(
        code=code,
        error_type="NameError",
        error_message="name 'unknown_variable' is not defined",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "unknown_variable" in diag.title
    assert "spelling" in diag.hint.lower() or "define" in diag.hint.lower()


def test_runtime_name_error_builtin_typo():
    code = "Print('Hello')"
    diag = diagnose_error(
        code=code,
        error_type="NameError",
        error_message="name 'Print' is not defined",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Capitalization Typo" in diag.title
    assert "print" in diag.title
    assert "case-sensitive" in diag.friendly_explanation


def test_runtime_name_error_boolean_typo():
    code = "is_active = true"
    diag = diagnose_error(
        code=code,
        error_type="NameError",
        error_message="name 'true' is not defined",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "True" in diag.title


def test_runtime_type_error_concatenation():
    code = "msg = 'Score: ' + 100"
    diag = diagnose_error(
        code=code,
        error_type="TypeError",
        error_message='can only concatenate str (not "int") to str',
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Combining Incompatible" in diag.title
    assert "str(" in diag.hint or "f-string" in diag.hint


def test_runtime_type_error_not_callable():
    code = "num = 42\nnum()"
    diag = diagnose_error(
        code=code,
        error_type="TypeError",
        error_message="'int' object is not callable",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Not a Function" in diag.title
    assert "int" in diag.title


def test_runtime_index_error():
    code = "fruits = ['apple', 'banana']\nprint(fruits[5])"
    diag = diagnose_error(
        code=code,
        error_type="IndexError",
        error_message="list index out of range",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Index Out of Bounds" in diag.title
    assert "0" in diag.friendly_explanation
    assert "len(" in diag.hint


def test_runtime_key_error():
    code = "user = {'name': 'Sam'}\nprint(user['email'])"
    diag = diagnose_error(
        code=code,
        error_type="KeyError",
        error_message="KeyError: 'email'",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Key 'email' Not Found" in diag.title or "Key" in diag.title
    assert ".get(" in diag.hint


def test_runtime_attribute_error():
    code = "text = 'hello'\ntext.append('!')"
    diag = diagnose_error(
        code=code,
        error_type="AttributeError",
        error_message="'str' object has no attribute 'append'",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Has No Method `.append()`" in diag.title


def test_runtime_value_error():
    code = "val = int('not_a_number')"
    diag = diagnose_error(
        code=code,
        error_type="ValueError",
        error_message="invalid literal for int() with base 10: 'not_a_number'",
        line_number=1
    )
    assert diag.has_diagnostic is True
    assert "Invalid Value Conversion" in diag.title


def test_runtime_recursion_error():
    code = "def loop():\n    loop()\nloop()"
    diag = diagnose_error(
        code=code,
        error_type="RecursionError",
        error_message="maximum recursion depth exceeded",
        line_number=2
    )
    assert diag.has_diagnostic is True
    assert "Infinite Recursion" in diag.title
    assert "base case" in diag.friendly_explanation.lower()


def test_runtime_timeout_error():
    code = "while True:\n    pass"
    diag = diagnose_error(
        code=code,
        error_type="TimeoutError",
        error_message="Execution exceeded maximum allowed time",
        line_number=1,
        timed_out=True
    )
    assert diag.has_diagnostic is True
    assert "Execution Timed Out" in diag.title
    assert diag.category == "timeout"


def test_diagnostic_success_code():
    code = "print('Success')"
    diag = diagnose_error(code=code)
    assert diag.has_diagnostic is False
    assert diag.error_type is None


# =====================================================================
# Integration Tests — Endpoints
# =====================================================================

def test_api_diagnose_endpoint_success(client):
    payload = {
        "code": "print(10 / 0)",
        "error_type": "ZeroDivisionError",
        "error_message": "division by zero",
        "line_number": 1
    }
    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert data["has_diagnostic"] is True
    assert data["title"] == "Division by Zero"
    assert data["line_number"] == 1


def test_api_diagnose_with_stderr(client):
    stderr = (
        'Traceback (most recent call last):\n'
        '  File "solution.py", line 2, in <module>\n'
        '    print(unknown_var)\n'
        'NameError: name \'unknown_var\' is not defined\n'
    )
    payload = {
        "code": "x = 1\nprint(unknown_var)",
        "stderr": stderr
    }
    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["has_diagnostic"] is True
    assert data["error_type"] == "NameError"
    assert data["line_number"] == 2


def test_api_diagnose_missing_code(client):
    response = client.post("/api/diagnose", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field: 'code'" in data["error"]


def test_api_run_includes_diagnostic_on_error(client):
    payload = {"code": "def broken(\n"}
    response = client.post("/api/run", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "syntax_error"
    assert "diagnostic" in data
    assert data["diagnostic"] is not None
    assert data["diagnostic"]["has_diagnostic"] is True
    assert "Unmatched Parenthesis" in data["diagnostic"]["title"] or "Syntax" in data["diagnostic"]["title"]


def test_api_run_diagnostic_null_on_success(client):
    payload = {"code": "print('All good')"}
    response = client.post("/api/run", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "success"
    assert data["diagnostic"] is None
