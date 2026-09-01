"""
CodeMentor AI — Code Runner Tests (Phase A3).

Comprehensive unit and integration tests for the code execution service and API endpoint.
"""

import pytest
from app import create_app
from app.services.runner.subprocess_runner import SubprocessRunner
from app.services.runner.parser import parse_traceback


@pytest.fixture
def app():
    """Create and configure a testing Flask app instance."""
    app = create_app("testing")
    return app


@pytest.fixture
def client(app):
    """Create a Flask test client."""
    return app.test_client()


@pytest.fixture
def runner():
    """Create a SubprocessRunner with short timeout for fast tests."""
    return SubprocessRunner(default_timeout=2.0, max_output_bytes=1024, max_code_length=10000)


# =====================================================================
# Unit Tests — Traceback Parser
# =====================================================================

def test_parser_empty_stderr():
    result = parse_traceback("")
    assert result["error_type"] is None
    assert result["line_number"] is None
    assert result["is_syntax_error"] is False


def test_parser_syntax_error():
    stderr = (
        '  File "solution.py", line 4\n'
        '    print("hello"\n'
        '                 ^\n'
        'SyntaxError: was never closed\n'
    )
    result = parse_traceback(stderr, "solution.py")
    assert result["error_type"] == "SyntaxError"
    assert "was never closed" in result["error_message"]
    assert result["line_number"] == 4
    assert result["is_syntax_error"] is True


def test_parser_runtime_error():
    stderr = (
        'Traceback (most recent call last):\n'
        '  File "solution.py", line 2, in <module>\n'
        '    print(10 / 0)\n'
        'ZeroDivisionError: division by zero\n'
    )
    result = parse_traceback(stderr, "solution.py")
    assert result["error_type"] == "ZeroDivisionError"
    assert result["error_message"] == "division by zero"
    assert result["line_number"] == 2
    assert result["is_syntax_error"] is False


# =====================================================================
# Unit Tests — SubprocessRunner Engine
# =====================================================================

def test_runner_success(runner):
    code = 'print("Hello from CodeMentor!")'
    res = runner.run(code)

    assert res.status == "success"
    assert res.stdout.strip() == "Hello from CodeMentor!"
    assert res.stderr == ""
    assert res.exit_code == 0
    assert not res.timed_out
    assert res.error_type is None
    assert res.line_number is None
    assert res.execution_time_ms > 0


def test_runner_multiline_output(runner):
    code = (
        "for i in range(3):\n"
        "    print(f'Item {i}')\n"
    )
    res = runner.run(code)

    assert res.status == "success"
    assert res.stdout == "Item 0\nItem 1\nItem 2\n"
    assert res.exit_code == 0


def test_runner_syntax_error(runner):
    code = "def broken(\n"
    res = runner.run(code)

    assert res.status == "syntax_error"
    assert res.exit_code != 0
    assert not res.timed_out
    assert res.error_type == "SyntaxError"
    assert res.line_number == 1
    assert "SyntaxError" in res.stderr


def test_runner_indentation_error(runner):
    code = (
        "def test():\n"
        "pass\n"
    )
    res = runner.run(code)

    assert res.status == "syntax_error"
    assert res.exit_code != 0
    assert res.error_type == "IndentationError"
    assert res.line_number == 2


def test_runner_zero_division(runner):
    code = (
        "x = 10\n"
        "y = 0\n"
        "print(x / y)\n"
    )
    res = runner.run(code)

    assert res.status == "runtime_error"
    assert res.exit_code != 0
    assert res.error_type == "ZeroDivisionError"
    assert res.line_number == 3


def test_runner_name_error(runner):
    code = "print(non_existent_var)"
    res = runner.run(code)

    assert res.status == "runtime_error"
    assert res.exit_code != 0
    assert res.error_type == "NameError"
    assert res.line_number == 1


def test_runner_index_error(runner):
    code = (
        "nums = [1, 2, 3]\n"
        "print(nums[10])\n"
    )
    res = runner.run(code)

    assert res.status == "runtime_error"
    assert res.exit_code != 0
    assert res.error_type == "IndexError"
    assert res.line_number == 2


def test_runner_recursion_error(runner):
    code = (
        "def recurse():\n"
        "    return recurse()\n"
        "recurse()\n"
    )
    res = runner.run(code)

    assert res.status == "runtime_error"
    assert res.exit_code != 0
    assert res.error_type == "RecursionError"


def test_runner_timeout(runner):
    code = (
        "import time\n"
        "time.sleep(10)\n"
    )
    # Runner timeout is set to 2.0s in fixture
    res = runner.run(code, timeout=1.0)

    assert res.status == "timeout"
    assert res.timed_out is True
    assert res.exit_code is None
    assert res.error_type == "TimeoutError"
    assert "Execution timed out" in res.stderr


def test_runner_infinite_loop(runner):
    code = "while True:\n    pass\n"
    res = runner.run(code, timeout=1.0)

    assert res.status == "timeout"
    assert res.timed_out is True
    assert res.exit_code is None


def test_runner_stdin(runner):
    code = (
        "name = input()\n"
        "print(f'Hello, {name}!')\n"
    )
    res = runner.run(code, stdin="CodeMentor")

    assert res.status == "success"
    assert res.stdout.strip() == "Hello, CodeMentor!"
    assert res.exit_code == 0


def test_runner_unicode_characters(runner):
    code = 'print("🚀 Hello, Python! 🐍 こんにちは")'
    res = runner.run(code)

    assert res.status == "success"
    assert "🚀 Hello, Python! 🐍 こんにちは" in res.stdout


def test_runner_output_truncation():
    # Runner with tiny 100-byte output limit
    tiny_runner = SubprocessRunner(max_output_bytes=100)
    code = "print('X' * 500)"
    res = tiny_runner.run(code)

    assert res.status == "success"
    assert "Output truncated" in res.stdout
    assert len(res.stdout) < 500


def test_runner_code_length_limit():
    strict_runner = SubprocessRunner(max_code_length=50)
    code = "print('" + "A" * 100 + "')"
    res = strict_runner.run(code)

    assert res.status == "error"
    assert res.error_type == "ValueError"
    assert "exceeds maximum" in res.stderr


# =====================================================================
# Integration Tests — POST /api/run Route
# =====================================================================

def test_api_run_success(client):
    payload = {"code": "print(40 + 2)"}
    response = client.post("/api/run", json=payload)

    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert data["status"] == "success"
    assert data["stdout"].strip() == "42"
    assert data["stderr"] == ""
    assert data["exit_code"] == 0
    assert data["timed_out"] is False
    assert data["error"] is None
    assert "execution_time_ms" in data


def test_api_run_runtime_error(client):
    payload = {"code": "print(10 / 0)"}
    response = client.post("/api/run", json=payload)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "runtime_error"
    assert data["exit_code"] == 1
    assert data["details"]["error_type"] == "ZeroDivisionError"
    assert data["details"]["line_number"] == 1


def test_api_run_syntax_error(client):
    payload = {"code": "print('missing paren"}
    response = client.post("/api/run", json=payload)

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "syntax_error"
    assert data["exit_code"] == 1
    assert data["details"]["error_type"] == "SyntaxError"


def test_api_run_missing_code(client):
    response = client.post("/api/run", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field: 'code'" in data["error"]


def test_api_run_invalid_code_type(client):
    response = client.post("/api/run", json={"code": 12345})
    assert response.status_code == 400
    data = response.get_json()
    assert "must be a string" in data["error"]


def test_api_run_invalid_json(client):
    response = client.post(
        "/api/run",
        data="this is not json",
        headers={"Content-Type": "text/plain"}
    )
    assert response.status_code == 400
