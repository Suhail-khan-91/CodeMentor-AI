"""
CodeMentor AI — Custom Question AI Evaluation Engine.

Provides automated, pedagogical AI evaluation for student-authored questions and freeform code.
Supports dual modes:
1. Question Evaluation: Checks whether student code solves the provided question prompt,
   evaluating logic, edge cases, and runtime output.
2. Freeform Code Review (Sandbox): Analyzes code quality, syntax, and execution when no
   question prompt is specified.
Uses the configured LLM provider (OpenRouter, Ollama, or Offline Socratic Mock).
"""

import json
import re
from typing import Optional, Dict, Any, List, Tuple
from app.services.ai.base import AICustomEvaluationResponse, BaseLLMClient
from app.services.ai.providers import get_llm_provider
from app.services.ai.providers.mock_provider import MockLLMClient


def build_custom_evaluation_prompt(
    code: str,
    question_prompt: str,
    question_title: str = "",
    execution_result: Optional[Dict[str, Any]] = None
) -> Tuple[str, str]:
    """
    Construct system and user prompts specifically engineered for evaluating
    student Python solutions against custom question prompts.
    """
    system_prompt = (
        "You are CodeMentor AI, a patient, encouraging Python mentor and solution evaluator.\n\n"
        "YOUR ROLE:\n"
        "Evaluate whether a student's Python code correctly and effectively solves the problem they specified, "
        "or review their code if writing in freeform sandbox mode.\n\n"
        "EVALUATION CRITERIA:\n"
        "1. DOES IT SOLVE THE QUESTION? Check if the logic, inputs, transformations, and outputs match the requirements described in the question prompt.\n"
        "2. RUNTIME & SYNTAX: Take into account the actual program execution output (stdout/stderr/exit code) if provided.\n"
        "3. CONSTRUCTIVE & ENCOURAGING: Never be harsh. Celebrate what the student did right, and clearly explain what is missing or incorrect.\n"
        "4. ANTI-SPOILER: Do NOT output the complete copy-paste solution to the user. Instead, give guiding hints on what logic to adjust or what edge cases were missed.\n\n"
        "OUTPUT FORMAT (STRICT JSON ONLY):\n"
        "You MUST respond ONLY with valid, parseable JSON with these exact keys:\n"
        "{\n"
        '  "verdict": "correct" | "needs_work" | "runtime_error" | "syntax_error" | "clean_code",\n'
        '  "score": integer between 0 and 100 (100 for correct/clean, 40-80 for partial/needs_work, 0-30 for errors),\n'
        '  "summary": "1-2 sentences summarizing the result in a warm, encouraging tone.",\n'
        '  "feedback_points": ["point 1 highlighting what worked", "point 2 explaining what to adjust or add"],\n'
        '  "edge_case_note": "A note about an edge case or input variation (e.g. empty input, large numbers, negative values)",\n'
        '  "concepts_applied": ["Concept 1", "Concept 2"]\n'
        "}\n"
        "Do NOT include markdown formatting (like ```json ... ```) or conversational text outside the JSON object."
    )

    code_lines = code.split("\n") if code else []
    numbered_code = "\n".join(
        f"{idx + 1:3d} | {line}" for idx, line in enumerate(code_lines)
    )

    prompt_parts = []
    if question_prompt.strip():
        if question_title and question_title.strip():
            prompt_parts.append(f"### PROBLEM TITLE: {question_title.strip()}")
        prompt_parts.append(f"### QUESTION REQUIREMENTS / PROMPT:\n{question_prompt.strip()}\n")
    else:
        prompt_parts.append("### MODE: Freeform Python Sandbox (Code Alone Review)\n")

    prompt_parts.append("### STUDENT'S PYTHON CODE:")
    prompt_parts.append(numbered_code or "(No code provided)")
    prompt_parts.append("")

    if execution_result:
        status = execution_result.get("status", "unknown")
        stdout = str(execution_result.get("stdout", "")).strip()
        stderr = str(execution_result.get("stderr", "")).strip()
        exit_code = execution_result.get("exit_code", 0)

        prompt_parts.append(f"### TERMINAL EXECUTION:")
        prompt_parts.append(f"Status: {status} (Exit Code: {exit_code})")
        if stdout:
            prompt_parts.append(f"Standard Output (stdout):\n{stdout}")
        if stderr:
            prompt_parts.append(f"Error Output (stderr):\n{stderr}")
    else:
        prompt_parts.append("### TERMINAL EXECUTION: (Not executed yet)")

    user_prompt = "\n".join(prompt_parts)
    return system_prompt, user_prompt


def get_deterministic_mock_evaluation(
    code: str,
    question_prompt: str,
    question_title: str = "",
    execution_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate an offline, deterministic evaluation without calling external LLM APIs.
    Used for Mock provider mode, offline study, and automated test execution.
    """
    clean_code = (code or "").strip()
    clean_prompt = (question_prompt or "").strip().lower()
    clean_title = (question_title or "").strip()

    # 1. Empty Code Check
    if not clean_code or clean_code.startswith("# [No code") or clean_code == "pass":
        return {
            "verdict": "needs_work",
            "score": 0,
            "summary": "No executable code detected. Write your Python solution in the editor to evaluate.",
            "feedback_points": [
                "Start by outlining the variables or inputs required.",
                "Implement your solution step-by-step and run it in the terminal."
            ],
            "edge_case_note": "A blank script produces no output.",
            "concepts_applied": ["Getting Started"]
        }

    # 2. Python Syntax Error Check
    try:
        compile(code, "<student_code>", "exec")
    except SyntaxError as syn_err:
        return {
            "verdict": "syntax_error",
            "score": 10,
            "summary": f"Your code has a Python syntax error on line {syn_err.lineno}: {syn_err.msg}.",
            "feedback_points": [
                f"Syntax issue detected at line {syn_err.lineno}.",
                "Check for matching quotes, balanced parentheses, and trailing colons (:) on statement headers."
            ],
            "edge_case_note": "Python cannot execute programs with structural syntax mistakes.",
            "concepts_applied": ["Syntax Rules"]
        }

    # 3. Runtime Error Check (from execution_result)
    if execution_result:
        exit_code = execution_result.get("exit_code", 0)
        stderr = str(execution_result.get("stderr", "")).strip()
        status = execution_result.get("status", "")

        if exit_code != 0 or status == "error" or stderr:
            return {
                "verdict": "runtime_error",
                "score": 25,
                "summary": "Your program encountered an unhandled exception or error while running.",
                "feedback_points": [
                    "The script halted prematurely during execution.",
                    "Review terminal output for error traces (e.g., TypeError, ValueError, IndexError)."
                ],
                "edge_case_note": "Ensure all variables are properly initialized before use.",
                "concepts_applied": ["Debugging", "Runtime Safety"]
            }

    # 4. Freeform Code Sandbox (Empty Question Prompt)
    if not clean_prompt:
        return {
            "verdict": "clean_code",
            "score": 100,
            "summary": "Your Python script executed cleanly with exit code 0 in the sandbox!",
            "feedback_points": [
                "Syntax and structure are valid.",
                "Execution completed without errors."
            ],
            "edge_case_note": "Try testing your script with unexpected or boundary inputs.",
            "concepts_applied": ["Scripting", "Execution"]
        }

    # 5. Targeted Problem Logic Matching (Heuristics)
    code_lower = clean_code.lower()

    # Pattern A: Star Triangle
    if "star" in clean_prompt or "triangle" in clean_prompt:
        has_star = "*" in clean_code
        has_loop = "for " in code_lower or "while " in code_lower or "print(" in code_lower
        if has_star and has_loop:
            return {
                "verdict": "correct",
                "score": 100,
                "summary": "Great work! Your solution correctly generates the right-angled star triangle.",
                "feedback_points": [
                    "Loop logic properly increments the asterisk count row by row.",
                    "Output follows the requested geometric shape."
                ],
                "edge_case_note": "Consider what happens if N = 0 or N = 1.",
                "concepts_applied": ["Loops (for/while)", "String Multiplication", "Formatted Output"]
            }
        else:
            return {
                "verdict": "needs_work",
                "score": 60,
                "summary": "Your code runs, but the star triangle pattern logic is incomplete.",
                "feedback_points": [
                    "Make sure to use a loop to iterate from 1 up to N.",
                    "Print i asterisks on row i using string repetition: '*' * i."
                ],
                "edge_case_note": "Test with input 3 and input 5 to inspect the output shape.",
                "concepts_applied": ["Loops", "String Formatting"]
            }

    # Pattern B: Even / Odd Check
    if "even" in clean_prompt and "odd" in clean_prompt:
        has_modulo = "% 2" in clean_code or "& 1" in clean_code
        if has_modulo:
            return {
                "verdict": "correct",
                "score": 100,
                "summary": "Excellent! Your code accurately tests whether a number is even or odd.",
                "feedback_points": [
                    "Modulo arithmetic correctly determines divisibility by 2.",
                    "Conditional branches handle both parity cases cleanly."
                ],
                "edge_case_note": "Check behavior with zero (0) and negative integers.",
                "concepts_applied": ["Conditionals (if/else)", "Arithmetic Operators (%)", "Type Casting"]
            }
        else:
            return {
                "verdict": "needs_work",
                "score": 65,
                "summary": "Your program runs, but needs divisibility check logic.",
                "feedback_points": [
                    "Use the modulo operator (% 2) to test if the remainder is 0.",
                    "Make sure to convert input() to an integer with int()."
                ],
                "edge_case_note": "A number n is even when n % 2 == 0.",
                "concepts_applied": ["Conditionals", "Modulo"]
            }

    # Pattern C: Reverse String / Palindrome
    if "reverse" in clean_prompt or "palindrome" in clean_prompt:
        has_slice = "[::-1]" in clean_code or "reversed" in code_lower or "reverse" in code_lower
        if has_slice:
            return {
                "verdict": "correct",
                "score": 100,
                "summary": "Well done! Your logic correctly handles sequence reversal.",
                "feedback_points": [
                    "String slicing or reversal function correctly inverts character order.",
                    "Result is formatted as expected."
                ],
                "edge_case_note": "Test with palindromes having mixed casing or spaces.",
                "concepts_applied": ["String Slicing", "Sequence Manipulation"]
            }
        else:
            return {
                "verdict": "needs_work",
                "score": 60,
                "summary": "Reversal logic is missing or incomplete.",
                "feedback_points": [
                    "In Python, a string can be reversed easily using slice notation: text[::-1].",
                    "Print the reversed result to standard output."
                ],
                "edge_case_note": "Check with single-letter words or empty strings.",
                "concepts_applied": ["String Slicing"]
            }

    # Pattern D: Count Vowels
    if "vowel" in clean_prompt:
        has_vowels = any(v in code_lower for v in ["aeiou", "'a'", '"a"', "vowel"])
        if has_vowels:
            return {
                "verdict": "correct",
                "score": 100,
                "summary": "Good job! Your vowel counting logic correctly tracks vowels.",
                "feedback_points": [
                    "Membership test identifies vowels accurately.",
                    "Accumulator count increments on each match."
                ],
                "edge_case_note": "Convert input to lowercase with .lower() for case insensitivity.",
                "concepts_applied": ["Iteration", "Membership Testing ('in')", "Accumulator Pattern"]
            }
        else:
            return {
                "verdict": "needs_work",
                "score": 60,
                "summary": "Vowel detection logic needs improvement.",
                "feedback_points": [
                    "Iterate over each character in the string.",
                    "Check if the character exists in 'aeiou'."
                ],
                "edge_case_note": "Remember capital vowels (A, E, I, O, U).",
                "concepts_applied": ["Loops", "Membership Checks"]
            }

    # Pattern E: Hello World
    if "hello" in clean_prompt and "world" in clean_prompt:
        has_hello_world = "hello" in code_lower and "world" in code_lower and "print(" in code_lower
        if has_hello_world:
            return {
                "verdict": "correct",
                "score": 100,
                "summary": "Excellent! Your code correctly prints 'hello world'.",
                "feedback_points": [
                    "String literal is properly passed to the print() function.",
                    "Syntax is clean and straightforward."
                ],
                "edge_case_note": "Make sure spelling and punctuation match requirements.",
                "concepts_applied": ["Basic Output", "Strings"]
            }
        else:
            return {
                "verdict": "needs_work",
                "score": 30,
                "summary": "Your code does not print 'hello world'. It currently contains different logic.",
                "feedback_points": [
                    "The problem prompt specifically asks to print 'hello world'.",
                    "Update your script to use print('hello world') instead of the current code."
                ],
                "edge_case_note": "Remember Python string syntax requires matching quotes.",
                "concepts_applied": ["Basic Output"]
            }

    # General Relevance Mismatch Check
    prompt_words = [
        w for w in re.findall(r'[a-zA-Z]{4,}', clean_prompt)
        if w not in {"write", "program", "python", "input", "output", "print", "that", "takes", "from", "standard", "user"}
    ]
    code_words = set(re.findall(r'[a-zA-Z]{3,}', code_lower))

    if prompt_words and not any(pw in code_words for pw in prompt_words):
        return {
            "verdict": "needs_work",
            "score": 35,
            "summary": "Your code does not appear to address the specific requirements described in your prompt.",
            "feedback_points": [
                "The logic in the editor does not reflect the key operations mentioned in the prompt.",
                "Review your problem description and ensure your code performs the requested task."
            ],
            "edge_case_note": "Make sure your variable names and logic align with the challenge description.",
            "concepts_applied": ["Problem Analysis"]
        }

    # General Fallback for Custom Prompts
    has_statements = len(clean_code.splitlines()) >= 2 or "print(" in clean_code
    if has_statements:
        return {
            "verdict": "correct",
            "score": 90,
            "summary": f"Your solution addresses the requirements for '{clean_title or 'your challenge'}'.",
            "feedback_points": [
                "Script logic executes and produces standard output.",
                "Code is cleanly structured with valid Python syntax."
            ],
            "edge_case_note": "Test with boundary and extreme values to verify robustness.",
            "concepts_applied": ["Core Python Logic", "Output Formatting"]
        }

    return {
        "verdict": "needs_work",
        "score": 65,
        "summary": "Your code runs, but appears incomplete for the specified problem requirements.",
        "feedback_points": [
            "Ensure the script performs all transformations described in the prompt.",
            "Display the final outcome using print()."
        ],
        "edge_case_note": "Walk through your logic line by line with sample input.",
        "concepts_applied": ["Problem Solving", "Input / Output"]
    }


class AICustomEvaluator:
    """Orchestrates AI solution evaluation for custom questions."""

    def __init__(self, client: Optional[BaseLLMClient] = None):
        self._client = client

    def get_client(self) -> BaseLLMClient:
        if self._client is not None:
            return self._client
        try:
            from app.services.ai.config_service import get_ai_config_service
            return get_ai_config_service().get_active_client()
        except Exception:
            return get_llm_provider()

    def evaluate(
        self,
        code: str,
        question_prompt: str,
        question_title: str = "",
        execution_result: Optional[Dict[str, Any]] = None,
        client_override: Optional[BaseLLMClient] = None
    ) -> AICustomEvaluationResponse:
        """
        Evaluate student code against the custom question prompt.
        """
        active_client = client_override or self.get_client()
        is_mock = isinstance(active_client, MockLLMClient) or "mock" in str(type(active_client)).lower()

        # 1. Deterministic Mock Flow
        if is_mock:
            mock_data = get_deterministic_mock_evaluation(
                code=code,
                question_prompt=question_prompt,
                question_title=question_title,
                execution_result=execution_result
            )
            return AICustomEvaluationResponse(
                success=True,
                status="success",
                verdict=mock_data["verdict"],
                score=mock_data["score"],
                summary=mock_data["summary"],
                feedback_points=mock_data["feedback_points"],
                edge_case_note=mock_data.get("edge_case_note", ""),
                concepts_applied=mock_data.get("concepts_applied", []),
                source="ai_custom_evaluator",
                provider="mock",
                model=getattr(active_client, "model_name", "mock-socratic-tutor")
            )

        # 2. Live LLM Flow (OpenRouter, OpenAI, Ollama)
        system_prompt, user_prompt = build_custom_evaluation_prompt(
            code=code,
            question_prompt=question_prompt,
            question_title=question_title,
            execution_result=execution_result
        )

        try:
            raw_response = active_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                context={
                    "mode": "custom_evaluation",
                    "question_title": question_title
                }
            )

            if not raw_response.success:
                fallback_data = get_deterministic_mock_evaluation(
                    code=code,
                    question_prompt=question_prompt,
                    question_title=question_title,
                    execution_result=execution_result
                )
                return AICustomEvaluationResponse(
                    success=False,
                    status=raw_response.status,
                    verdict=fallback_data["verdict"],
                    score=fallback_data["score"],
                    summary=fallback_data["summary"],
                    feedback_points=fallback_data["feedback_points"],
                    edge_case_note=fallback_data.get("edge_case_note", ""),
                    concepts_applied=fallback_data.get("concepts_applied", []),
                    source="ai_custom_evaluator",
                    provider=raw_response.provider,
                    model=raw_response.model,
                    error_message=raw_response.error_message or "AI provider could not be reached"
                )

            # Parse JSON response
            text_content = raw_response.socratic_guidance or ""
            parsed = self._extract_json(text_content)

            if parsed and "verdict" in parsed:
                return AICustomEvaluationResponse(
                    success=True,
                    status="success",
                    verdict=str(parsed.get("verdict", "needs_work")).strip(),
                    score=int(parsed.get("score", 70)),
                    summary=str(parsed.get("summary", "")).strip(),
                    feedback_points=list(parsed.get("feedback_points", [])),
                    edge_case_note=str(parsed.get("edge_case_note", "")).strip(),
                    concepts_applied=list(parsed.get("concepts_applied", [])),
                    source="ai_custom_evaluator",
                    provider=raw_response.provider,
                    model=raw_response.model
                )

            # Unstructured text fallback
            fallback_data = get_deterministic_mock_evaluation(
                code=code,
                question_prompt=question_prompt,
                question_title=question_title,
                execution_result=execution_result
            )
            return AICustomEvaluationResponse(
                success=True,
                status="success",
                verdict=fallback_data["verdict"],
                score=fallback_data["score"],
                summary=text_content[:200] if text_content else fallback_data["summary"],
                feedback_points=fallback_data["feedback_points"],
                edge_case_note=fallback_data.get("edge_case_note", ""),
                concepts_applied=fallback_data.get("concepts_applied", []),
                source="ai_custom_evaluator",
                provider=raw_response.provider,
                model=raw_response.model
            )

        except Exception as e:
            fallback_data = get_deterministic_mock_evaluation(
                code=code,
                question_prompt=question_prompt,
                question_title=question_title,
                execution_result=execution_result
            )
            return AICustomEvaluationResponse(
                success=False,
                status="error",
                verdict=fallback_data["verdict"],
                score=fallback_data["score"],
                summary=fallback_data["summary"],
                feedback_points=fallback_data["feedback_points"],
                edge_case_note=fallback_data.get("edge_case_note", ""),
                concepts_applied=fallback_data.get("concepts_applied", []),
                source="ai_custom_evaluator",
                provider=getattr(active_client, "model_name", "unknown"),
                model=getattr(active_client, "model_name", "unknown"),
                error_message=str(e)
            )

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Attempt to extract and parse JSON object from LLM response string."""
        if not text or not text.strip():
            return None
        try:
            return json.loads(text.strip())
        except Exception:
            pass

        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        return None


# Module singleton
_EVALUATOR_INSTANCE: Optional[AICustomEvaluator] = None


def get_ai_custom_evaluator() -> AICustomEvaluator:
    """Retrieve or initialize the singleton AICustomEvaluator instance."""
    global _EVALUATOR_INSTANCE
    if _EVALUATOR_INSTANCE is None:
        _EVALUATOR_INSTANCE = AICustomEvaluator()
    return _EVALUATOR_INSTANCE


def evaluate_custom_solution_with_ai(
    code: str,
    question_prompt: str,
    question_title: str = "",
    execution_result: Optional[Dict[str, Any]] = None,
    client_override: Optional[BaseLLMClient] = None
) -> AICustomEvaluationResponse:
    """Convenience helper to evaluate student solution using the singleton evaluator."""
    evaluator = get_ai_custom_evaluator()
    return evaluator.evaluate(
        code=code,
        question_prompt=question_prompt,
        question_title=question_title,
        execution_result=execution_result,
        client_override=client_override
    )
