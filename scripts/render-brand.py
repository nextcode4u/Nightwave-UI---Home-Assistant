"""Render the original vector brand artwork (requires Playwright/Chromium)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(args=['--no-sandbox'])
    for scale,name in [(1,'icon.png'),(2,'icon@2x.png')]:
        page=browser.new_page(viewport={'width':256,'height':256},device_scale_factor=scale)
        page.set_content('<style>body{margin:0;background:transparent}svg{display:block}</style>'+(root/'assets/brand.svg').read_text())
        page.locator('svg').screenshot(path=str(root/'custom_components/nightwave/brand'/name),omit_background=True)
        page.close()
    browser.close()
