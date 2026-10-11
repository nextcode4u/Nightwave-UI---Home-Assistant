"""Reusable styling additions: scoped native controls and safe foldout content."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path.startswith(('/demo/','/other/')):self.path='/tests/fixture.html'
  super().do_GET()
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(args=['--no-sandbox'])
  for width in [390,1200]:
   page=b.new_page(viewport={'width':width,'height':850});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(base+'/demo/one')
   page.evaluate('''()=>{
    for(const tag of ['ha-switch','hui-button-card'])customElements.define(tag,class extends HTMLElement{constructor(){super();this.attachShadow({mode:'open'});this.shadowRoot.innerHTML='<ha-card><ha-state-icon>Icon</ha-state-icon><div class="switch"><div class="thumb"></div></div></ha-card>';}updated(){}});
    const root=document.querySelector('hui-root').shadowRoot;const style=document.createElement('style');style.textContent='hui-view{display:block;padding:20px;min-height:900px}ha-switch,hui-button-card{display:block}';root.append(style);
    root.querySelector('hui-view').innerHTML='<ha-switch></ha-switch><hui-button-card></hui-button-card>';
    window.loadCardHelpers=async()=>({createCardElement:config=>{window.nativeConfig=config;const e=document.createElement('ha-card');e.textContent='Native entity controls';return e;}});
   }''')
   page.evaluate("async()=>await import('/dist/nightwave-ui.js?dashboard=demo')")
   sw=page.locator('ha-switch');button=page.locator('hui-button-card')
   assert sw.evaluate('e=>e.shadowRoot.adoptedStyleSheets.length')==1
   assert button.locator('ha-state-icon').evaluate('e=>getComputedStyle(e).borderRadius')=='16px'
   page.evaluate('''()=>{const c=document.createElement('nightwave-details');c.setConfig({title:'<img src=x onerror=alert(1)>',entities:['binary_sensor.example']});c.hass={states:{}};document.querySelector('hui-root').shadowRoot.querySelector('hui-view').append(c);}''')
   details=page.locator('nightwave-details');details.get_by_text('Native entity controls').wait_for(state='attached')
   assert not details.locator('details').evaluate('e=>e.open')
   assert details.locator('img').count()==0
   details.locator('summary').click();assert details.locator('details').evaluate('e=>e.open')
   assert page.evaluate('nativeConfig')=={'type':'entities','show_header_toggle':False,'entities':['binary_sensor.example']}
   assert details.evaluate('e=>e.getBoundingClientRect().right<=innerWidth')
   page.evaluate('''()=>{const c=document.createElement('nightwave-glance');c.setConfig({system_path:'//evil.example'});document.querySelector('hui-root').shadowRoot.querySelector('hui-view').append(c);}''')
   link=page.locator('nightwave-glance a');assert link.is_hidden()
   page.locator('nightwave-glance').evaluate("e=>e.setConfig({system_path:'/lovelace/system'})");page.locator('nightwave-glance summary').click();assert link.is_visible()
   page.emulate_media(reduced_motion='reduce')
   assert details.locator('.content').evaluate('e=>getComputedStyle(e).animationName')=='none'
   page.locator('hui-root').evaluate("e=>e.navigate('/other/one')")
   assert sw.evaluate('e=>e.shadowRoot.adoptedStyleSheets.length')==0
   assert button.evaluate('e=>e.shadowRoot.adoptedStyleSheets.length')==0
   assert not errors,errors
   page.close();print('PASS parity native controls, foldout, safe links and route cleanup',width,flush=True)
  b.close()
finally:server.shutdown()
