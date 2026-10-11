"""Portable browser tests; no HA server, credentials or household entities required."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/demo/') or self.path.startswith('/other/'):
            self.path = '/tests/fixture.html'
        super().do_GET()
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--no-sandbox'])
        for mobile in [True, False]:
            context = browser.new_context(viewport={'width':390 if mobile else 1280,'height':844},is_mobile=mobile,has_touch=mobile)
            page=context.new_page();errors=[];external=[]
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('request', lambda r: external.append(r.url) if not r.url.startswith(base) and not r.url.startswith('data:') else None)
            page.goto(base+'/demo/one')
            page.evaluate("async()=>await import('/dist/nightwave-ui.js?dashboard=demo&duration=600')")
            page.wait_for_timeout(150)
            assert page.locator('nightwave-particles').count()==1
            assert page.locator('hui-root').evaluate("e=>e.style.getPropertyValue('--primary-color')")=='#35f1d2'
            assert page.locator('[data-nightwave-theme]').count()==1
            assert page.locator('ha-control-switch').evaluate('e=>e.shadowRoot.adoptedStyleSheets.length')==1
            for dest in ['two','one','two']:
                page.locator('hui-root').evaluate('(e,path)=>e.navigate(path)', '/demo/'+dest)
                page.locator('[data-liquid-transition]').wait_for(state='attached')
                assert page.evaluate('window.__nwLastTransition.duration')==600
                page.wait_for_timeout(800)
                assert page.locator('[data-liquid-transition]').count()==0
                assert page.locator('hui-view').evaluate('e=>e.style.willChange')==''
            page.emulate_media(reduced_motion='reduce')
            page.locator('hui-root').evaluate("e=>e.navigate('/demo/one')")
            page.wait_for_timeout(100);assert page.locator('[data-liquid-transition]').count()==0
            page.locator('hui-root').evaluate("e=>e.navigate('/other/one')")
            page.wait_for_timeout(100);assert page.locator('nightwave-particles').count()==0
            assert page.locator('[data-nightwave-theme]').count()==0
            assert page.locator('hui-root').evaluate("e=>e.style.getPropertyValue('--primary-color')")==''
            assert not external,external
            assert not errors,errors
            context.close()
            print('PASS fixture', 'mobile' if mobile else 'desktop', flush=True)
        context=browser.new_context();page=context.new_page();page.goto(base+'/demo/one')
        page.evaluate("async()=>await import('/dist/nightwave-ui.js?dashboard=demo&theme=false&controls=false&particles=false&transitions=false')")
        page.wait_for_timeout(100)
        assert page.locator('[data-nightwave-theme]').count()==0
        assert page.locator('nightwave-particles').count()==0
        assert page.locator('ha-control-switch').evaluate('e=>e.shadowRoot.adoptedStyleSheets.length')==0
        context.close();print('PASS feature opt-outs',flush=True)
        browser.close()
finally:
    server.shutdown()
