"""Regression for sticky tooltip visibility, including keyboard access."""
from pathlib import Path
from playwright.sync_api import sync_playwright
source = (Path(__file__).resolve().parents[1] / 'src/sliders.js').read_text()
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    for mobile in [False, True]:
        page = browser.new_page(viewport={'width':390 if mobile else 1280,'height':844},is_mobile=mobile,has_touch=mobile)
        page.set_content('<hui-root><ha-control-slider></ha-control-slider></hui-root>')
        page.evaluate('''()=>{
          window.nw={active:()=>true};
          customElements.define('ha-control-slider',class extends HTMLElement{
            constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<style>.tooltip{opacity:0}.tooltip.visible{opacity:1}</style><div class="container"><div class="slider" tabindex="0">Slider</div><span class="tooltip visible">1%</span></div>';}
            updated(){}
          });
        }''')
        page.evaluate(source)
        slider = page.locator('ha-control-slider')
        page.wait_for_timeout(50)
        visible = lambda: slider.evaluate("e=>{const s=getComputedStyle(e.shadowRoot.querySelector('.tooltip'));return s.visibility!='hidden'&&s.opacity!='0'}")
        assert not visible(), 'Sticky idle tooltip must be hidden'
        slider.evaluate("e=>e.shadowRoot.querySelector('.container').classList.add('pressed')")
        assert visible(), 'Dragging must retain the value bubble'
        slider.evaluate("e=>e.shadowRoot.querySelector('.container').classList.remove('pressed')")
        assert not visible(), 'Released pointer must hide the bubble'
        page.keyboard.press('Tab')
        assert slider.evaluate("e=>e.shadowRoot.querySelector('.slider').matches(':focus-visible')")
        assert visible(), 'Keyboard focus must retain native tooltip behavior'
        slider.evaluate("e=>e.shadowRoot.querySelector('.slider').blur()")
        assert not visible()
        page.emulate_media(reduced_motion='reduce')
        assert not visible()
        page.close()
        print('PASS slider tooltip', 'mobile' if mobile else 'desktop')
    browser.close()
