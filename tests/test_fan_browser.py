"""Check fan motion without moving the ceiling mount or an unknown icon."""
from pathlib import Path
from playwright.sync_api import sync_playwright

source = (Path(__file__).resolve().parents[1] / 'src/motion.js').read_text()
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    for width in [390, 1280]:
        page = browser.new_page(viewport={'width': width, 'height': 844})
        page.set_content('<hui-root><ha-state-icon></ha-state-icon></hui-root>')
        page.evaluate('''() => {
          window.nw = {active:()=>true, fanEntities:[]};
          customElements.define('ha-state-icon', class extends HTMLElement {
            constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<ha-icon style="width:32px;height:32px">Fan</ha-icon>';}
            updated(){}
          });
        }''')
        page.evaluate(source)
        page.wait_for_timeout(400)
        icon = page.locator('ha-state-icon')
        def state(glyph, status='on'):
            icon.evaluate('''(e,args)=>{e.icon=args[0];e.stateObj={entity_id:'fan.example',state:args[1],attributes:{}};e.updated();}''', [glyph, status])
            page.wait_for_timeout(40)
            return icon.evaluate("e=>getComputedStyle(e.shadowRoot.querySelector('ha-icon')).animationName")
        assert state('mdi:ceiling-fan') == 'nw-fan-active'
        assert icon.evaluate("e=>getComputedStyle(e.shadowRoot.querySelector('ha-icon')).transform") == 'none'
        assert state('mdi:fan') == 'nw-fan'
        assert state('custom:unknown-fan') == 'nw-fan-active'
        assert state('mdi:ceiling-fan', 'off') == 'none'
        assert state('mdi:ceiling-fan', 'unavailable') == 'none'
        state('mdi:ceiling-fan')
        page.emulate_media(reduced_motion='reduce')
        assert icon.evaluate("e=>getComputedStyle(e.shadowRoot.querySelector('ha-icon')).animationName") == 'none'
        page.close()
        print('PASS fan motion', width)
    browser.close()
