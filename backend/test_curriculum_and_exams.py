"""
Curriculum and Exams Comprehensive Verification Script.

Iterates through all 6 modules (26 sessions), extracts every lesson challenge
and chapter exam question, and executes the solution code against all test cases.
Also tests execution with sales_data.csv for Pandas and Matplotlib.
"""

import os
import sys
import json
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(backend_dir))

from app.services.runner import SubprocessRunner
from app.services.evaluator.comparer import compare_output

curriculum_dir = backend_dir.parent / "frontend" / "src" / "data" / "curriculum"
sales_data_path = backend_dir.parent / "sales_data.csv"

runner = SubprocessRunner()

def run_all_checks():
    index_path = curriculum_dir / "index.json"
    with open(index_path, "r", encoding="utf-8") as f:
        index_data = json.load(f)

    print(f"Loaded Course: {index_data['title']}")
    print(f"Total Modules listed in index: {index_data['total_modules']}")
    
    total_challenges = 0
    passed_challenges = 0
    total_exam_questions = 0
    passed_exam_questions = 0
    failures = []

    for mod_info in index_data["modules"]:
        mod_file = curriculum_dir / mod_info["file"]
        print(f"\n=======================================================")
        print(f"Checking Module {mod_info['module_number']}: {mod_info['title']} ({mod_info['file']})")
        print(f"=======================================================")
        
        with open(mod_file, "r", encoding="utf-8") as f:
            mod_data = json.load(f)

        # 1. Check Sessions & Practice Challenges
        sessions = mod_data.get("sessions", [])
        for sess in sessions:
            print(f"\n  Session {sess.get('session_number')}: {sess.get('title')}")
            for lesson in sess.get("lessons", []):
                for chal in lesson.get("practice_challenges", []):
                    total_challenges += 1
                    chal_id = chal.get("id")
                    title = chal.get("title")
                    solution = chal.get("solution_code")
                    test_cases = chal.get("test_cases", [])
                    
                    chal_passed = True
                    for tc in test_cases:
                        stdin = tc.get("stdin", "")
                        expected = tc.get("expected_output", "")
                        match_mode = tc.get("match_mode", "trimmed")
                        
                        res = runner.run(code=solution, stdin=stdin)
                        
                        if res.status != "success":
                            chal_passed = False
                            failures.append({
                                "type": "practice_challenge",
                                "module": mod_info["module_number"],
                                "challenge_id": chal_id,
                                "challenge_title": title,
                                "tc_id": tc.get("id"),
                                "reason": f"Execution error: {res.error_type} - {res.error_message}",
                                "stderr": res.stderr
                            })
                            break
                        
                        is_match = compare_output(res.stdout, expected, match_mode=match_mode)
                        if not is_match:
                            chal_passed = False
                            failures.append({
                                "type": "practice_challenge",
                                "module": mod_info["module_number"],
                                "challenge_id": chal_id,
                                "challenge_title": title,
                                "tc_id": tc.get("id"),
                                "reason": f"Output mismatch: expected '{expected}', got '{res.stdout.strip()}'",
                                "actual": res.stdout,
                                "expected": expected
                            })
                            break
                    
                    if chal_passed:
                        passed_challenges += 1
                        print(f"    [PASS] Challenge: {title} ({chal_id}) - {len(test_cases)} test cases")
                    else:
                        print(f"    [FAIL] Challenge: {title} ({chal_id})")

        # 2. Check Chapter Exam
        exam = mod_data.get("chapter_exam")
        if exam:
            print(f"\n  Mastery Exam: {exam.get('title')}")
            questions = exam.get("questions", [])
            for q in questions:
                total_exam_questions += 1
                q_id = q.get("id")
                q_title = q.get("title")
                solution = q.get("solution_code")
                test_cases = q.get("test_cases", [])
                
                q_passed = True
                for tc in test_cases:
                    stdin = tc.get("stdin", "")
                    expected = tc.get("expected_output", "")
                    match_mode = tc.get("match_mode", "trimmed")
                    
                    res = runner.run(code=solution, stdin=stdin)
                    
                    if res.status != "success":
                        q_passed = False
                        failures.append({
                            "type": "chapter_exam",
                            "module": mod_info["module_number"],
                            "question_id": q_id,
                            "question_title": q_title,
                            "tc_id": tc.get("id"),
                            "reason": f"Execution error: {res.error_type} - {res.error_message}",
                            "stderr": res.stderr
                        })
                        break
                    
                    is_match = compare_output(res.stdout, expected, match_mode=match_mode)
                    if not is_match:
                        q_passed = False
                        failures.append({
                            "type": "chapter_exam",
                            "module": mod_info["module_number"],
                            "question_id": q_id,
                            "question_title": q_title,
                            "tc_id": tc.get("id"),
                            "reason": f"Output mismatch: expected '{expected}', got '{res.stdout.strip()}'",
                            "actual": res.stdout,
                            "expected": expected
                        })
                        break
                
                if q_passed:
                    passed_exam_questions += 1
                    print(f"    [PASS] Exam Question: {q_title} ({q_id}) - {len(test_cases)} test cases")
                else:
                    print(f"    [FAIL] Exam Question: {q_title} ({q_id})")

    # 3. Test with sales_data.csv
    print(f"\n=======================================================")
    print(f"Testing sales_data.csv Integration")
    print(f"=======================================================")
    if sales_data_path.exists():
        with open(sales_data_path, "r", encoding="utf-8") as f:
            csv_content = f.read()
        
        files = [{"name": "sales_data.csv", "content": csv_content}]
        
        # Test 3.1: Pandas aggregation on sales_data.csv
        test_script_pandas = (
            "import pandas as pd\n"
            "df = pd.read_csv('sales_data.csv')\n"
            "print('Total Rows:', len(df))\n"
            "top_product = df.groupby('Product')['Units_Sold'].sum().idxmax()\n"
            "print('Top Product:', top_product)\n"
        )
        res_pandas = runner.run(code=test_script_pandas, files=files)
        print("Pandas sales_data.csv run:")
        print("  Status:", res_pandas.status)
        print("  Stdout:", res_pandas.stdout.strip())
        assert res_pandas.status == "success", f"Pandas run failed: {res_pandas.stderr}"
        assert "Total Rows: 16" in res_pandas.stdout, "Unexpected row count"
        assert "Top Product: Wireless Mouse" in res_pandas.stdout, "Unexpected top product"
        print("  [PASS] Pandas aggregation on sales_data.csv succeeded!")

        # Test 3.2: Matplotlib plot on sales_data.csv
        test_script_plot = (
            "import pandas as pd\n"
            "import matplotlib.pyplot as plt\n"
            "df = pd.read_csv('sales_data.csv')\n"
            "city_sales = df.groupby('City')['Units_Sold'].sum()\n"
            "plt.figure(figsize=(6, 4))\n"
            "city_sales.plot(kind='bar', color='teal')\n"
            "plt.title('Units Sold by City')\n"
            "plt.tight_layout()\n"
        )
        res_plot = runner.run(code=test_script_plot, files=files)
        print("Matplotlib sales_data.csv plot run:")
        print("  Status:", res_plot.status)
        print("  Plot image generated:", bool(res_plot.plot_image))
        assert res_plot.status == "success", f"Plot run failed: {res_plot.stderr}"
        assert res_plot.plot_image is not None, "Plot image was not captured!"
        print("  [PASS] Matplotlib plot on sales_data.csv generated successfully!")
    else:
        print("sales_data.csv not found!")

    # Summary
    print(f"\n=======================================================")
    print(f"VERIFICATION SUMMARY")
    print(f"=======================================================")
    print(f"Practice Challenges: {passed_challenges} / {total_challenges} passed")
    print(f"Chapter Exam Questions: {passed_exam_questions} / {total_exam_questions} passed")
    print(f"Total Failures: {len(failures)}")
    
    if failures:
        print("\nFAILURES DETECTED:")
        for idx, f in enumerate(failures, 1):
            print(f"\n{idx}. [{f['type'].upper()}] Module {f['module']}: {f.get('challenge_title') or f.get('question_title')}")
            print(f"   ID: {f.get('challenge_id') or f.get('question_id')} | Test Case: {f['tc_id']}")
            print(f"   Reason: {f['reason']}")
            if 'stderr' in f:
                print(f"   Stderr: {f['stderr']}")
    else:
        print("\nALL CURRICULUM LESSONS & EXAMS PASSED WITH 100% ACCURACY!")

    return len(failures) == 0

if __name__ == "__main__":
    success = run_all_checks()
    sys.exit(0 if success else 1)
