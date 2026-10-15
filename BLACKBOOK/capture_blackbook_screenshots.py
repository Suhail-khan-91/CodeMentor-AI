import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOTS_DIR = r"C:\Users\Suhail\Desktop\Soheab\code-mentor\BLACKBOOK\screenshots"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

async def capture_all():
    print("Starting Playwright browser...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # 1. Fig 6.1: Home Hero
        print("Capturing Fig 6.1: Home Hero...")
        await page.goto("http://localhost:5173/")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_1_home_hero.png"))

        # 2. Fig 6.2: Course Explorer
        print("Capturing Fig 6.2: Course Explorer...")
        await page.goto("http://localhost:5173/courses")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_2_course_explorer.png"))

        # 3. Fig 6.3: Lesson Viewer
        print("Capturing Fig 6.3: Lesson Viewer Modal...")
        try:
            # Click first Read & Practice button
            await page.wait_for_selector(".btn-open-lesson", timeout=4000)
            await page.click(".btn-open-lesson")
            await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_3_lesson_viewer.png"))
            # Close lesson viewer
            close_btn = await page.query_selector(".lesson-viewer-close, .modal-close, button:has-text('✕')")
            if close_btn:
                await close_btn.click()
                await page.wait_for_timeout(500)
        except Exception as e:
            print("Lesson viewer fallback:", e)

        # 4. Fig 6.4: Editor Course Mode Workspace
        print("Capturing Fig 6.4: Course Track IDE Workspace...")
        await page.goto("http://localhost:5173/editor?mode=course")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_4_editor_course_mode.png"))

        # 5. Fig 6.5: Task Evaluation Pass
        print("Capturing Fig 6.5: Task Evaluation Pass...")
        try:
            eval_btn = await page.query_selector("button:has-text('Evaluate'), button:has-text('Run Tests'), button:has-text('Run')")
            if eval_btn:
                await eval_btn.click()
                await page.wait_for_timeout(3000)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_5_task_eval_pass.png"))
        except Exception as e:
            print("Eval error:", e)

        # 6. Fig 6.6: Diagnostic Card
        print("Capturing Fig 6.6: Diagnostic Card...")
        try:
            # Let's type an intentional syntax error into Monaco editor via keyboard or page evaluate
            await page.keyboard.press("Control+A")
            await page.keyboard.type('print("Unterminated string\n', delay=10)
            run_btn = await page.query_selector("button:has-text('Run Code'), button:has-text('Run')")
            if run_btn:
                await run_btn.click()
                await page.wait_for_timeout(2500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_6_diagnostic_card.png"))
        except Exception as e:
            print("Diagnostic error:", e)

        # 7. Fig 6.7: Progressive Hints Panel
        print("Capturing Fig 6.7: Progressive Hints Panel...")
        try:
            hints_tab = await page.query_selector("button:has-text('Hints'), button:has-text('Progressive Hints'), .tab-btn:has-text('Hints')")
            if hints_tab:
                await hints_tab.click()
                await page.wait_for_timeout(1000)
                unlock_btn = await page.query_selector("button:has-text('Unlock'), button:has-text('Reveal')")
                if unlock_btn:
                    await unlock_btn.click()
                    await page.wait_for_timeout(800)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_7_progressive_hints.png"))
        except Exception as e:
            print("Hints error:", e)

        # 8. Fig 6.8: Socratic AI Tutor
        print("Capturing Fig 6.8: Socratic AI Tutor...")
        try:
            tutor_tab = await page.query_selector("button:has-text('AI Tutor'), button:has-text('Tutor'), .tab-btn:has-text('Tutor')")
            if tutor_tab:
                await tutor_tab.click()
                await page.wait_for_timeout(1200)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_8_socratic_ai_tutor.png"))
        except Exception as e:
            print("Tutor error:", e)

        # 9. Fig 6.9: Custom Practice Mode
        print("Capturing Fig 6.9: Custom Practice Mode...")
        await page.goto("http://localhost:5173/editor?mode=custom")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_9_custom_practice_mode.png"))

        # 10. Fig 6.10: Stdin Input Modal
        print("Capturing Fig 6.10: Stdin Input Modal...")
        try:
            await page.keyboard.press("Control+A")
            await page.keyboard.type('name = input("Enter student name: ")\nprint("Welcome,", name)\n', delay=10)
            run_btn = await page.query_selector("button:has-text('Run Code'), button:has-text('Run')")
            if run_btn:
                await run_btn.click()
                await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_10_stdin_modal.png"))
            # Cancel/close modal
            close_stdin = await page.query_selector("button:has-text('Cancel'), .modal-close")
            if close_stdin:
                await close_stdin.click()
        except Exception as e:
            print("Stdin modal error:", e)

        # 11. Fig 6.11: Chapter Exam Stepper
        print("Capturing Fig 6.11: Chapter Exam Stepper...")
        try:
            await page.goto("http://localhost:5173/courses")
            await page.wait_for_timeout(1500)
            exam_btn = await page.query_selector(".btn-take-exam")
            if exam_btn:
                await exam_btn.click()
                await page.wait_for_timeout(2500)
            else:
                await page.goto("http://localhost:5173/editor?mode=course&examId=exam_module_1")
                await page.wait_for_timeout(2500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_11_chapter_exam_stepper.png"))
        except Exception as e:
            print("Exam stepper error:", e)

        # 12. Fig 6.12: Progress Modal
        print("Capturing Fig 6.12: Progress Modal...")
        try:
            await page.goto("http://localhost:5173/")
            await page.wait_for_timeout(1200)
            prog_btn = await page.query_selector("#btn-open-progress")
            if prog_btn:
                await prog_btn.click()
                await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_12_progress_modal.png"))
            close_prog = await page.query_selector(".modal-close, button:has-text('✕')")
            if close_prog:
                await close_prog.click()
                await page.wait_for_timeout(500)
        except Exception as e:
            print("Progress modal error:", e)

        # 13. Fig 6.13: AI Settings Modal
        print("Capturing Fig 6.13: AI Settings Modal...")
        try:
            await page.goto("http://localhost:5173/")
            await page.wait_for_timeout(1200)
            settings_btn = await page.query_selector("#btn-open-ai-settings")
            if settings_btn:
                await settings_btn.click()
                await page.wait_for_timeout(1500)
            await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "fig_6_13_ai_settings_modal.png"))
        except Exception as e:
            print("Settings modal error:", e)

        await browser.close()
        print("All 13 screenshots successfully captured!")

if __name__ == "__main__":
    asyncio.run(capture_all())
