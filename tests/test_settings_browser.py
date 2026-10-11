"""Settings precedence, isolation, failure handling and mobile layout."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/demo/'):
            self.path='/tests/fixture.html'
        super().do_GET()
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
BOOT="""() => {
 window.household={dashboard:'demo',duration:1000,particles:true}; window.writes=[];
 const ha=document.createElement('home-assistant');document.body.append(ha);
 ha.hass={user:{id:'alice',is_admin:true},callWS:async m=>{
   if(window.fail)throw Error('Disconnected');
   if(m.type.endsWith('/update')){window.writes.push(m.settings);Object.assign(window.household,m.settings);}
   return {settings:{...window.household}};
 }};
 window.mount=()=>{const card=document.createElement('nightwave-settings');card.setConfig({});card.hass=ha.hass;document.body.append(card);};
}"""
try:
 with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    for mobile in [False,True]:
        ctx=b.new_context(viewport={'width':390 if mobile else 1200,'height':850},is_mobile=mobile,has_touch=mobile)
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(base+'/demo/one');page.evaluate(BOOT)
        page.evaluate("async()=>await import('/dist/nightwave-ui.js?integration=true')")
        page.evaluate('mount()');card=page.locator('nightwave-settings')
        card.get_by_label('Particles and aurora',exact=True).uncheck()
        card.get_by_role('button',name='Save preferences').click()
        card.get_by_role('status').filter(has_text='Saved.').wait_for()
        assert page.evaluate('writes.length')==0
        assert page.evaluate("JSON.parse(localStorage.getItem('nightwave.preferences.v1.alice')).particles") is False
        card.get_by_label('Applies to',exact=True).select_option('household')
        card.get_by_label('Transition duration',exact=True).fill('1500')
        card.get_by_role('button',name='Save preferences').click()
        card.get_by_role('status').filter(has_text='Saved.').wait_for()
        assert page.evaluate('writes')==[{'duration':1500}]
        # Failed saves keep drafts and never claim success.
        page.evaluate('window.fail=true')
        card.get_by_label('Theme',exact=True).uncheck()
        card.get_by_role('button',name='Save preferences').click()
        card.get_by_role('status').filter(has_text='Disconnected').wait_for()
        assert not card.get_by_label('Theme',exact=True).is_checked()
        page.evaluate("document.querySelector('home-assistant').hass.user={id:'bob',is_admin:false};document.querySelector('nightwave-settings').hass=document.querySelector('home-assistant').hass;window.fail=false")
        assert card.get_by_label('Particles and aurora',exact=True).is_checked()
        assert card.locator('option[value=household]').evaluate('e=>e.disabled')
        card.get_by_role('button',name='Use defaults').click()
        assert page.evaluate("JSON.parse(localStorage.getItem('nightwave.preferences.v1.alice')).particles") is False
        assert card.evaluate('e=>e.getBoundingClientRect().right <= innerWidth')
        assert not errors,errors
        ctx.close();print('PASS settings scope, permissions UI, errors and layout',mobile,flush=True)
    ctx=b.new_context();page=ctx.new_page();page.goto(base+'/demo/one');page.evaluate(BOOT)
    page.evaluate("localStorage.setItem('nightwave.preferences.v1.alice',JSON.stringify({reduced_effects:true,duration:750}))")
    page.evaluate("async()=>await import('/dist/nightwave-ui.js?integration=true')")
    assert page.locator('nightwave-particles').count()==0
    page.locator('hui-root').evaluate("e=>e.navigate('/demo/two')")
    assert page.locator('[data-liquid-transition]').count()==0
    # Duplicate resources must not install extra prototype hooks or cards.
    page.evaluate("async()=>await import('/dist/nightwave-ui.js?integration=true&v=duplicate')")
    assert page.evaluate("customCards.filter(c=>c.type==='nightwave-settings').length")==1
    ctx.close();print('PASS reduced effects and duplicate-load guard',flush=True)
    ctx=b.new_context();page=ctx.new_page();page.goto(base+'/demo/one');page.evaluate(BOOT)
    page.evaluate('window.fail=true')
    page.evaluate("async()=>await import('/dist/nightwave-ui.js?integration=true')")
    assert page.locator('[data-nightwave-theme]').count()==0
    page.evaluate('mount()')
    assert page.locator('nightwave-settings').get_by_role('button',name='Reconnect').count()==1
    ctx.close();print('PASS disconnected integration safe fallback',flush=True)
    b.close()
finally:server.shutdown()
