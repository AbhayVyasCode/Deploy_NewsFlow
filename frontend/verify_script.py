from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to dashboard
            page.goto("http://localhost:5173")
            page.wait_for_timeout(3000) # Wait for animation
            page.screenshot(path="/home/jules/verification/dashboard.png")
            print("Dashboard screenshot taken.")

            # Navigate to Hindi News
            page.goto("http://localhost:5173/hindi")
            page.wait_for_timeout(3000)
            page.screenshot(path="/home/jules/verification/hindi.png")
            print("Hindi page screenshot taken.")

            # Navigate to Videos
            page.goto("http://localhost:5173/videos")
            page.wait_for_timeout(3000)
            page.screenshot(path="/home/jules/verification/videos.png")
            print("Videos page screenshot taken.")

            # Navigate to Settings and toggle theme
            page.goto("http://localhost:5173/settings")
            page.wait_for_timeout(1000)

            # Click dark mode toggle
            toggle_btn = page.locator("button[aria-label='Toggle dark mode']")
            if toggle_btn.count() > 0:
                toggle_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="/home/jules/verification/settings_dark.png")
                print("Settings dark mode screenshot taken.")
            else:
                 # Try finding by icon if aria-label is missing or different
                 print("Toggle button not found by aria-label")
                 page.screenshot(path="/home/jules/verification/settings_no_toggle.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
