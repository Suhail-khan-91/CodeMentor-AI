"""
CodeMentor AI — Sample Starter Tasks (Phase A5).

Curated programming challenges for practice, testing, and Task Evaluation mode.
"""

from typing import List
from app.services.evaluator.base import TaskDefinition, TestCase

SAMPLE_TASKS: List[TaskDefinition] = [
    TaskDefinition(
        id="task_hello",
        title="1. Hello, World!",
        description="Write a Python program that prints the exact phrase 'Hello, World!' to the terminal.",
        starter_code="# Print 'Hello, World!' below\n\n",
        test_cases=[
            TestCase(
                id="tc_hello_1",
                description="Check exact greeting output",
                stdin="",
                expected_output="Hello, World!",
                is_hidden=False,
                match_mode="trimmed"
            )
        ]
    ),
    TaskDefinition(
        id="task_greeting",
        title="2. Personalized Greeting",
        description="Read a person's name using input() and print 'Hello, <name>!'.",
        starter_code="# Read name and print personalized greeting\nname = input()\n",
        test_cases=[
            TestCase(
                id="tc_greet_1",
                description="Greets Alice",
                stdin="Alice",
                expected_output="Hello, Alice!",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_greet_2",
                description="Greets Bob",
                stdin="Bob",
                expected_output="Hello, Bob!",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_greet_3",
                description="Hidden test: Multi-word name",
                stdin="Grace Hopper",
                expected_output="Hello, Grace Hopper!",
                is_hidden=True,
                match_mode="trimmed"
            )
        ]
    ),
    TaskDefinition(
        id="task_even_odd",
        title="3. Even or Odd Checker",
        description="Read an integer from standard input. If it is divisible by 2, print 'Even'. Otherwise, print 'Odd'.",
        starter_code="# Read integer and check even/odd\nnum = int(input())\n\n",
        test_cases=[
            TestCase(
                id="tc_eo_1",
                description="Test with even number (4)",
                stdin="4",
                expected_output="Even",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_eo_2",
                description="Test with odd number (7)",
                stdin="7",
                expected_output="Odd",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_eo_3",
                description="Test with zero (0)",
                stdin="0",
                expected_output="Even",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_eo_4",
                description="Hidden test: Negative odd number (-5)",
                stdin="-5",
                expected_output="Odd",
                is_hidden=True,
                match_mode="trimmed"
            )
        ]
    ),
    TaskDefinition(
        id="task_temp_converter",
        title="4. Temperature Converter",
        description="Read temperature in Celsius (float or integer) and convert it to Fahrenheit using the formula F = (C * 9/5) + 32. Print the result.",
        starter_code="# Read Celsius and convert to Fahrenheit\ncelsius = float(input())\n\n",
        test_cases=[
            TestCase(
                id="tc_temp_1",
                description="Freezing point of water (0°C -> 32.0°F)",
                stdin="0",
                expected_output="32.0",
                is_hidden=False,
                match_mode="numeric_float"
            ),
            TestCase(
                id="tc_temp_2",
                description="Boiling point of water (100°C -> 212.0°F)",
                stdin="100",
                expected_output="212.0",
                is_hidden=False,
                match_mode="numeric_float"
            ),
            TestCase(
                id="tc_temp_3",
                description="Hidden test: Room temperature (25°C -> 77.0°F)",
                stdin="25",
                expected_output="77.0",
                is_hidden=True,
                match_mode="numeric_float"
            )
        ]
    ),
    TaskDefinition(
        id="task_sum_two",
        title="5. Sum of Two Numbers",
        description="Read two integers from standard input (each on its own line) and print their sum.",
        starter_code="# Read two numbers on separate lines and print sum\na = int(input())\nb = int(input())\n\n",
        test_cases=[
            TestCase(
                id="tc_sum_1",
                description="Positive integers (5 and 10 -> 15)",
                stdin="5\n10",
                expected_output="15",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_sum_2",
                description="Negative integers (-3 and 7 -> 4)",
                stdin="-3\n7",
                expected_output="4",
                is_hidden=False,
                match_mode="trimmed"
            ),
            TestCase(
                id="tc_sum_3",
                description="Hidden test: Large numbers (1000 and 2500 -> 3500)",
                stdin="1000\n2500",
                expected_output="3500",
                is_hidden=True,
                match_mode="trimmed"
            )
        ]
    )
]


def get_task_by_id(task_id: str) -> TaskDefinition | None:
    """Find a sample task by its ID."""
    for task in SAMPLE_TASKS:
        if task.id == task_id:
            return task
    return None
