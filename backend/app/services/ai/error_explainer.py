"""
CodeMentor AI — AI Error Explanation Engine (Phase A9).

Provides on-demand, beginner-friendly explanations for Python syntax errors,
runtime exceptions, and execution failures.
Integrates with A4 Diagnostics for deterministic baseline context,
and uses the Phase A7/A8 AI provider abstraction (Mock, Ollama, Cloud)
to generate deep, pedagogical error deconstructions without giving away solutions.
"""

import json
import re
from typing import Optional, Dict, Any, List, Tuple
from app.services.ai.base import AIErrorExplanationResponse, BaseLLMClient
from app.services.ai.providers.mock_provider import MockLLMClient


def build_error_explanation_prompt(
    code: str,
    error_type: str,
    error_message: str,
    line_number: Optional[int] = None,
    traceback: Optional[str] = None,
    diagnostic: Optional[Dict[str, Any]] = None
) -> Tuple[str, str]:
    """
    Construct system and user prompts specifically engineered for beginner-friendly
    Python error explanations.
    """
    system_prompt = (
        "You are CodeMentor AI's Error Explainer, an expert and empathetic computer science "
        "tutor specializing in helping absolute beginners understand Python syntax and runtime errors.\n\n"
        "PEDAGOGICAL & SAFETY RULES:\n"
        "1. EXPLAIN IN PLAIN ENGLISH: Avoid dense compiler jargon. Use clear, intuitive real-world analogies.\n"
        "2. ANTI-SOLUTION POLICY: NEVER write or output the corrected code or copy-paste replacement lines. "
        "Your goal is to help the student understand WHY the error happened and HOW to think through the fix.\n"
        "3. SOCRATIC MENTAL MODEL: Explain what Python was trying to do when it hit this line, what it expected, "
        "and what it encountered instead.\n"
        "4. STRUCTURED JSON OUTPUT: You MUST respond ONLY with valid, parseable JSON with the following keys:\n"
        "   - \"headline\": (string) A single, friendly sentence summarizing the mistake in simple terms.\n"
        "   - \"what_it_means\": (string) 1-2 sentences explaining what this class of Python error means in general.\n"
        "   - \"why_it_happened\": (string) 2-3 sentences explaining what happened on this specific line of the student's code.\n"
        "   - \"how_to_think_about_it\": (string) 2-3 sentences providing a mental model or guiding questions to fix it.\n"
        "   - \"concepts_to_review\": (list of strings) 2-3 key Python programming concepts the student should review.\n"
        "Do NOT include markdown formatting (like ```json ... ```) or conversational commentary outside the JSON object."
    )

    # Format code with line numbers for reference
    code_lines = code.split("\n") if code else []
    numbered_code = "\n".join(
        f"{idx + 1:3d} | {line}" for idx, line in enumerate(code_lines)
    )

    prompt_parts = [
        "### STUDENT'S PYTHON CODE:",
        numbered_code or "(No code provided)",
        "",
        f"### ERROR TYPE: {error_type or 'Unknown Error'}",
        f"### ERROR MESSAGE: {error_message or 'No message'}",
    ]

    if line_number is not None:
        prompt_parts.append(f"### FAILING LINE NUMBER: {line_number}")

    if traceback:
        prompt_parts.extend(["", "### PYTHON TRACEBACK:", traceback.strip()])

    if diagnostic and diagnostic.get("has_diagnostic"):
        prompt_parts.extend([
            "",
            "### PHASE A4 DETERMINISTIC DIAGNOSTIC CONTEXT:",
            f"- Category: {diagnostic.get('category', 'unknown')}",
            f"- Title: {diagnostic.get('title', '')}",
            f"- Friendly Explanation: {diagnostic.get('friendly_explanation', '')}",
            f"- Suggested Fix Tip: {diagnostic.get('hint', '')}"
        ])

    prompt_parts.extend([
        "",
        "Now, analyze the code and error, and provide a compassionate, beginner-friendly explanation in the required JSON format."
    ])

    return system_prompt, "\n".join(prompt_parts)


def get_deterministic_mock_explanation(
    code: str,
    error_type: str,
    error_message: str,
    line_number: Optional[int] = None,
    diagnostic: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate deterministic, high-quality, beginner-friendly error explanations
    for standard Python errors when running in Mock mode or offline testing.
    """
    clean_type = (error_type or "").strip()
    clean_msg = (error_message or "").strip().lower()
    clean_code = (code or "").lower()

    # 1. SyntaxError: Missing colon
    if clean_type == "SyntaxError" and (
        "expected ':'" in clean_msg or
        "colon" in clean_msg or
        (diagnostic and "colon" in str(diagnostic).lower())
    ):
        return {
            "headline": "Python was expecting a colon ':' to start an indented code block.",
            "what_it_means": "In Python, header statements like if, for, while, and def must end with a colon (:) to announce that a block of code follows.",
            "why_it_happened": f"On line {line_number or 'indicated'}, Python reached the end of the statement header without finding the required colon.",
            "how_to_think_about_it": "Look at the very end of your header statement. Did you remember to type the colon before pressing Enter?",
            "concepts_to_review": ["Syntax Rules", "Code Blocks & Colons"]
        }

    # 2. SyntaxError: Assignment in condition (= vs ==)
    if clean_type == "SyntaxError" and (
        "cannot assign to" in clean_msg or
        "invalid syntax" in clean_msg and "=" in clean_code and ("if " in clean_code or "while " in clean_code)
    ):
        return {
            "headline": "Python found an assignment '=' where it was expecting a comparison '=='.",
            "what_it_means": "A single equals sign (=) assigns a value into a variable, while a double equals (==) tests whether two values are equal.",
            "why_it_happened": f"Inside your condition on line {line_number or 'indicated'}, Python expects an expression that produces True or False, not a variable assignment.",
            "how_to_think_about_it": "Ask yourself: are you storing a value into a variable, or comparing two values? In if conditions, use '==' to compare.",
            "concepts_to_review": ["Comparison Operators (==)", "Variable Assignment (=)"]
        }

    # 3. SyntaxError: Unterminated string / unclosed quote
    if clean_type == "SyntaxError" and (
        "unterminated string" in clean_msg or
        "eol while scanning" in clean_msg or
        (diagnostic and "quote" in str(diagnostic).lower())
    ):
        return {
            "headline": "Python reached the end of the line while still waiting for a closing quote.",
            "what_it_means": "Every string of text in Python must be enclosed in matching quotes (either '...' or \"...\").",
            "why_it_happened": f"On line {line_number or 'indicated'}, Python saw an opening quotation mark, but reached the end of the line without finding its matching partner.",
            "how_to_think_about_it": "Inspect each quote on that line. Does every opening quote have an identical closing quote of the same type?",
            "concepts_to_review": ["String Literals", "Matching Quotes"]
        }

    # 4. General SyntaxError
    if clean_type == "SyntaxError":
        return {
            "headline": "Python stopped because this line doesn't follow Python's grammar rules.",
            "what_it_means": "A SyntaxError means Python cannot understand the structure of the line before even trying to run your code.",
            "why_it_happened": f"There is an unexpected character, unclosed bracket, or misplaced keyword on line {line_number or 'indicated'}.",
            "how_to_think_about_it": "Read the line slowly from left to right. Check that all parentheses () match and every keyword is spelled correctly.",
            "concepts_to_review": ["Python Syntax Rules", "Matching Parentheses & Brackets"]
        }

    # 5. IndentationError / TabError
    if "IndentationError" in clean_type or "TabError" in clean_type:
        return {
            "headline": "Python expected an indented block of code after a header line.",
            "what_it_means": "Python uses spacing (indentation) instead of curly brackets {} to know which lines belong inside a function, loop, or if-statement.",
            "why_it_happened": f"After a line ending with a colon (:), the code on line {line_number or 'indicated'} wasn't indented as expected.",
            "how_to_think_about_it": "Add 4 spaces (or press Tab) at the beginning of the line inside your block, and make sure all lines in the block line up evenly.",
            "concepts_to_review": ["Python Indentation", "Code Blocks"]
        }

    # 6. NameError: Casing typo (e.g. Print vs print)
    if clean_type == "NameError" and any(w in clean_msg or w in clean_code for w in ["'print'", "'input'", "'len'", "'range'", "'true'", "'false'"]):
        return {
            "headline": "Python is case-sensitive and didn't recognize the capitalized function or keyword.",
            "what_it_means": "In Python, uppercase and lowercase letters are completely different symbols. 'Print' is not the same as 'print'.",
            "why_it_happened": f"Python looked for a built-in command on line {line_number or 'indicated'}, but found an uppercase letter that doesn't exist in Python's standard vocabulary.",
            "how_to_think_about_it": "Check the capitalization of the word in question. Python's built-in functions like print(), input(), and len() must be entirely lowercase.",
            "concepts_to_review": ["Case Sensitivity in Python", "Built-in Functions"]
        }

    # 7. General NameError: Undefined variable
    if clean_type == "NameError":
        var_name = clean_msg.split("'")[1] if "'" in clean_msg else "a variable"
        return {
            "headline": f"Python encountered '{var_name}', which hasn't been defined or created yet.",
            "what_it_means": "A NameError occurs when Python tries to look up an identifier in memory, but cannot find any value assigned to it.",
            "why_it_happened": f"On line {line_number or 'indicated'}, your code tried to use '{var_name}', but Python hasn't executed a line that creates it yet.",
            "how_to_think_about_it": "Make sure you assigned a value to this variable earlier in the program, and check that the spelling matches exactly.",
            "concepts_to_review": ["Variable Definition & Assignment", "Order of Execution"]
        }

    # 8. TypeError: String + Int concatenation or type mismatch
    if clean_type == "TypeError" and ("concatenate" in clean_msg or "unsupported operand" in clean_msg):
        return {
            "headline": "Python cannot combine text (string) and numbers (integer) with the '+' operator.",
            "what_it_means": "In Python, the '+' symbol means mathematical addition for numbers, but text concatenation for strings. Python won't guess which one you intended.",
            "why_it_happened": f"On line {line_number or 'indicated'}, you attempted to add or combine incompatible types without converting them first.",
            "how_to_think_about_it": "If you want to do math, convert strings to numbers using int() or float(). If you want to print text together, convert numbers to str() or use f-strings.",
            "concepts_to_review": ["Data Types (str, int, float)", "Type Conversion"]
        }

    # 9. General TypeError
    if clean_type == "TypeError":
        return {
            "headline": "An operation was performed on a value of the wrong data type.",
            "what_it_means": "A TypeError occurs when an operation or function is applied to an object that doesn't support it.",
            "why_it_happened": f"Python encountered unexpected data types while processing the expression on line {line_number or 'indicated'}.",
            "how_to_think_about_it": "Inspect the types of your variables. Use type() to verify what kind of data each variable holds before using it.",
            "concepts_to_review": ["Data Types in Python", "Type Inspection"]
        }

    # 10. ZeroDivisionError
    if clean_type == "ZeroDivisionError":
        return {
            "headline": "Python cannot divide any number by zero.",
            "what_it_means": "Division by zero is mathematically undefined. In Python, attempting to divide or modulo (%) by 0 immediately stops the program.",
            "why_it_happened": f"The expression on line {line_number or 'indicated'} evaluated to a divisor (denominator) of 0.",
            "how_to_think_about_it": "Trace where the dividing number came from. Add an if-statement to verify that the denominator is not zero before dividing.",
            "concepts_to_review": ["Arithmetic Operators", "Conditional Guard Clauses"]
        }

    # 11. IndexError
    if clean_type == "IndexError":
        return {
            "headline": "Python tried to access an item at an index position that doesn't exist.",
            "what_it_means": "An IndexError happens when you try to get an item from a list or string using a position number that is too large or out of range.",
            "why_it_happened": f"On line {line_number or 'indicated'}, the list has fewer items than the index requested. Remember that Python uses 0-based indexing.",
            "how_to_think_about_it": "Check the length of your list with len(). If a list has 3 items, the only valid indexes are 0, 1, and 2.",
            "concepts_to_review": ["0-Based Indexing", "Lists & Sequences"]
        }

    # 12. KeyError
    if clean_type == "KeyError":
        return {
            "headline": "Python looked for a key in a dictionary, but couldn't find it.",
            "what_it_means": "A KeyError happens when you try to look up a value using a key that was never added to that dictionary.",
            "why_it_happened": f"The key requested on line {line_number or 'indicated'} doesn't exist in the dictionary at that moment.",
            "how_to_think_about_it": "Check the exact spelling of your key, or use dictionary.get('key', default_value) to safely retrieve items without crashing.",
            "concepts_to_review": ["Dictionaries in Python", "Safe Key Retrieval (.get)"]
        }

    # 13. AttributeError
    if clean_type == "AttributeError":
        return {
            "headline": "Python tried to access a method or property that this data type doesn't have.",
            "what_it_means": "Different data types have different built-in methods (for instance, lists have .append(), but strings and numbers do not).",
            "why_it_happened": f"On line {line_number or 'indicated'}, you called a method on an object that doesn't support it.",
            "how_to_think_about_it": "Check what data type the variable actually contains right before this line. Is it a list, string, integer, or None?",
            "concepts_to_review": ["Object Methods", "Data Type Inspection"]
        }

    # 14. ValueError
    if clean_type == "ValueError":
        return {
            "headline": "Python received the right type of data, but with an invalid value.",
            "what_it_means": "A ValueError happens when a function expects a specific format or value and cannot process the input it received.",
            "why_it_happened": f"On line {line_number or 'indicated'}, a conversion or calculation failed because the input content couldn't be parsed.",
            "how_to_think_about_it": "Verify what exact text or number was passed into the function. For example, int('42') works, but int('hello') raises a ValueError.",
            "concepts_to_review": ["Data Conversion", "Input Validation"]
        }

    # 15. TimeoutError
    if clean_type == "TimeoutError" or "timeout" in clean_msg:
        return {
            "headline": "Your code took longer than the time limit to finish and was stopped.",
            "what_it_means": "CodeMentor AI protects your system by stopping code that runs longer than 5 seconds, preventing browser and server freezes.",
            "why_it_happened": "The most common reason is an infinite loop (e.g. while True without a break, or a loop counter that never updates).",
            "how_to_think_about_it": "Inspect your loops. Does your while loop condition eventually become False, or does it have an exit condition?",
            "concepts_to_review": ["While Loops", "Loop Termination & Break"]
        }

    # 16. Fallback for any other error
    display_name = clean_type or "Runtime Error"
    return {
        "headline": f"Python encountered a {display_name} while executing line {line_number or 'indicated'}.",
        "what_it_means": f"A {display_name} indicates that an unexpected condition occurred that Python could not resolve on its own.",
        "why_it_happened": f"Python halted execution on line {line_number or 'indicated'} with the message: {clean_msg or 'Error encountered'}.",
        "how_to_think_about_it": "Look at what this line does step by step. What values does it read, and what operation does it perform?",
        "concepts_to_review": ["Python Error Handling", "Debugging Techniques"]
    }


class AIErrorExplainer:
    """Orchestrator for AI-assisted error explanations."""

    def __init__(self, client: Optional[BaseLLMClient] = None):
        self._client = client

    def get_client(self) -> BaseLLMClient:
        """Resolve active LLM provider from A7 engine or A8 configuration."""
        if self._client is not None:
            return self._client
        try:
            from app.services.ai import get_ai_tutor_engine
            return get_ai_tutor_engine().get_client()
        except Exception:
            from app.services.ai.providers import get_llm_provider
            return get_llm_provider()

    def explain_error(
        self,
        code: str,
        error_type: str,
        error_message: str,
        line_number: Optional[int] = None,
        traceback: Optional[str] = None,
        diagnostic: Optional[Dict[str, Any]] = None,
        client_override: Optional[BaseLLMClient] = None
    ) -> AIErrorExplanationResponse:
        """
        Generate a structured, beginner-friendly error explanation.

        1. If active client is Mock (or offline), returns rich deterministic explanation.
        2. If active client is Ollama or Cloud, builds specialized prompt and queries LLM.
        3. Parses output and validates anti-solution compliance.
        4. Degrades gracefully to fallback explanation if network/provider fails.
        """
        active_client = client_override or self.get_client()
        provider_name = getattr(active_client, "model_name", "mock")

        # Determine if this is a Mock provider
        is_mock = isinstance(active_client, MockLLMClient) or "mock" in str(type(active_client)).lower()

        # 1. Deterministic Mock Flow (100% offline, zero-latency)
        if is_mock:
            mock_data = get_deterministic_mock_explanation(
                code=code,
                error_type=error_type,
                error_message=error_message,
                line_number=line_number,
                diagnostic=diagnostic
            )
            return AIErrorExplanationResponse(
                success=True,
                status="success",
                error_type=error_type or "Error",
                headline=mock_data["headline"],
                what_it_means=mock_data["what_it_means"],
                why_it_happened=mock_data["why_it_happened"],
                how_to_think_about_it=mock_data["how_to_think_about_it"],
                concepts_to_review=mock_data["concepts_to_review"],
                line_number=line_number,
                source="ai_error_explainer",
                provider="mock",
                model=getattr(active_client, "model_name", "mock-socratic-tutor")
            )

        # 2. Live LLM Provider Flow (Ollama / Cloud)
        system_prompt, user_prompt = build_error_explanation_prompt(
            code=code,
            error_type=error_type,
            error_message=error_message,
            line_number=line_number,
            traceback=traceback,
            diagnostic=diagnostic
        )

        try:
            raw_response = active_client.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                context={
                    "mode": "error_explanation",
                    "error_type": error_type,
                    "line_number": line_number
                }
            )

            # If provider itself reported unavailable or error
            if not raw_response.success:
                fallback_data = get_deterministic_mock_explanation(
                    code=code,
                    error_type=error_type,
                    error_message=error_message,
                    line_number=line_number,
                    diagnostic=diagnostic
                )
                return AIErrorExplanationResponse(
                    success=False,
                    status=raw_response.status,
                    error_type=error_type or "Error",
                    headline=fallback_data["headline"],
                    what_it_means=fallback_data["what_it_means"],
                    why_it_happened=fallback_data["why_it_happened"],
                    how_to_think_about_it=fallback_data["how_to_think_about_it"],
                    concepts_to_review=fallback_data["concepts_to_review"],
                    line_number=line_number,
                    source="ai_error_explainer",
                    provider=raw_response.provider,
                    model=raw_response.model,
                    error_message=raw_response.error_message or "AI provider could not be reached"
                )

            # Parse the text response from the LLM (handling JSON or markdown wrapped JSON)
            text_content = raw_response.socratic_guidance or ""
            parsed_data = self._extract_json(text_content)

            if parsed_data and "headline" in parsed_data:
                return AIErrorExplanationResponse(
                    success=True,
                    status="success",
                    error_type=error_type or "Error",
                    headline=str(parsed_data.get("headline", "")).strip(),
                    what_it_means=str(parsed_data.get("what_it_means", "")).strip(),
                    why_it_happened=str(parsed_data.get("why_it_happened", "")).strip(),
                    how_to_think_about_it=str(parsed_data.get("how_to_think_about_it", "")).strip(),
                    concepts_to_review=list(parsed_data.get("concepts_to_review", [])),
                    line_number=line_number,
                    source="ai_error_explainer",
                    provider=raw_response.provider,
                    model=raw_response.model
                )

            # If LLM returned unstructured text, adapt gracefully
            fallback_data = get_deterministic_mock_explanation(
                code=code,
                error_type=error_type,
                error_message=error_message,
                line_number=line_number,
                diagnostic=diagnostic
            )
            return AIErrorExplanationResponse(
                success=True,
                status="success",
                error_type=error_type or "Error",
                headline=fallback_data["headline"],
                what_it_means=fallback_data["what_it_means"],
                why_it_happened=text_content or fallback_data["why_it_happened"],
                how_to_think_about_it=fallback_data["how_to_think_about_it"],
                concepts_to_review=fallback_data["concepts_to_review"],
                line_number=line_number,
                source="ai_error_explainer",
                provider=raw_response.provider,
                model=raw_response.model
            )

        except Exception as e:
            # Fallback gracefully so student experience is never disrupted
            fallback_data = get_deterministic_mock_explanation(
                code=code,
                error_type=error_type,
                error_message=error_message,
                line_number=line_number,
                diagnostic=diagnostic
            )
            return AIErrorExplanationResponse(
                success=False,
                status="error",
                error_type=error_type or "Error",
                headline=fallback_data["headline"],
                what_it_means=fallback_data["what_it_means"],
                why_it_happened=fallback_data["why_it_happened"],
                how_to_think_about_it=fallback_data["how_to_think_about_it"],
                concepts_to_review=fallback_data["concepts_to_review"],
                line_number=line_number,
                source="ai_error_explainer",
                provider=getattr(active_client, "model_name", "unknown"),
                model=getattr(active_client, "model_name", "unknown"),
                error_message=str(e)
            )

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Attempt to extract and parse JSON object from LLM response string."""
        if not text or not text.strip():
            return None
        # Try direct parse
        try:
            return json.loads(text.strip())
        except Exception:
            pass

        # Try regex extract between { and }
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass

        return None


# Module singleton
_EXPLAINER_INSTANCE: Optional[AIErrorExplainer] = None


def get_ai_error_explainer() -> AIErrorExplainer:
    """Retrieve or initialize the singleton AIErrorExplainer instance."""
    global _EXPLAINER_INSTANCE
    if _EXPLAINER_INSTANCE is None:
        _EXPLAINER_INSTANCE = AIErrorExplainer()
    return _EXPLAINER_INSTANCE


def explain_error_with_ai(
    code: str,
    error_type: str,
    error_message: str,
    line_number: Optional[int] = None,
    traceback: Optional[str] = None,
    diagnostic: Optional[Dict[str, Any]] = None,
    client_override: Optional[BaseLLMClient] = None
) -> AIErrorExplanationResponse:
    """Convenience helper to explain an error with the singleton explainer."""
    explainer = get_ai_error_explainer()
    return explainer.explain_error(
        code=code,
        error_type=error_type,
        error_message=error_message,
        line_number=line_number,
        traceback=traceback,
        diagnostic=diagnostic,
        client_override=client_override
    )
