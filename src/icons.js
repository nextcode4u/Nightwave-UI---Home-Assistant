// Shade the existing vector itself; never place a second icon on top.
(()=>{
 if(window.__nightwaveSculptedIcons)return;window.__nightwaveSculptedIcons=true;
 const sheet=new CSSStyleSheet();sheet.replaceSync(`
 :host([data-nightwave-depth]) svg{overflow:visible;filter:drop-shadow(0 -0.5px .25px #e5d6ff77) drop-shadow(0 1px 0 #382449) drop-shadow(0 2px 0 #231332) drop-shadow(0 3px 2px #08011399)}
 :host([data-nightwave-depth]) svg .primary-path{fill:url(#nightwave-icon-face)}
 `);
 function inDashboard(e){if(!nw.active())return false;for(let n=e;n;n=n.parentElement||n.getRootNode()?.host)if(n.localName==='hui-root')return true;return false}
 function shade(e){
  if(!e.shadowRoot)return;
  if(!inDashboard(e)){e.removeAttribute('data-nightwave-depth');return}
  e.setAttribute('data-nightwave-depth','');
  if(!e.shadowRoot.adoptedStyleSheets.includes(sheet))e.shadowRoot.adoptedStyleSheets=[...e.shadowRoot.adoptedStyleSheets,sheet];
  const svg=e.shadowRoot.querySelector('svg');if(!svg||svg.querySelector('#nightwave-icon-face'))return;
  const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),g=document.createElementNS(ns,'linearGradient');
  g.id='nightwave-icon-face';g.setAttribute('x1','0');g.setAttribute('y1','0');g.setAttribute('x2','0.7');g.setAttribute('y2','1');
  for(const [offset,color] of [['0%','color-mix(in srgb,currentColor 55%,white)'],['42%','currentColor'],['100%','color-mix(in srgb,currentColor 60%,#312044)']]){const s=document.createElementNS(ns,'stop');s.setAttribute('offset',offset);s.style.stopColor=color;g.append(s)}
  defs.append(g);svg.prepend(defs);
 }
 function scan(root){for(const e of root.querySelectorAll('*')){if(e.localName==='ha-svg-icon')shade(e);else if(e.shadowRoot)scan(e.shadowRoot)}}
 customElements.whenDefined('ha-svg-icon').then(()=>{
  const p=customElements.get('ha-svg-icon').prototype,old=p.updated;
  p.updated=function(...args){const r=old?.apply(this,args);shade(this);return r};
  scan(document);
 });
 let timer;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>scan(document),300)};
 window.addEventListener('location-changed',refresh);window.addEventListener('popstate',refresh);
})();
