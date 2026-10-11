(()=>{
const sheet=new CSSStyleSheet();sheet.replaceSync(" .container { background:linear-gradient(145deg,#56277c,#31134b)!important; box-shadow:4px 5px 9px #12041fa6,-2px -2px 5px #a55ee529,inset 1px 1px 1px #d6a3ff44; border:1px solid #b47ce522; border-radius:15px; transition:transform .15s,box-shadow .15s; }\n.container:before {opacity:0!important;}\n:host([data-state=\"on\"]) .container {color:#35f1d2;box-shadow:4px 5px 9px #12041fa6,inset 1px 1px 1px #b7ffe866,0 0 14px #35f1d226;}\n:host([interactive]) .container:active {transform:translateY(2px);box-shadow:inset 3px 3px 7px #140622,inset -1px -1px 3px #9d65c744;}\n@media(prefers-reduced-motion:reduce){.container{transition:none}}\n.container{background:linear-gradient(135deg,#6a3293,#3e245d 65%,#28304d)!important}\n:host([data-state=\"on\"]) .container{background:linear-gradient(135deg,#473472,#1e5455)!important;animation:nw-on .35s ease-out}\n@keyframes nw-on{0%{scale:.9}65%{scale:1.06}100%{scale:1}}\n@media(prefers-reduced-motion:reduce){.container{animation:none!important;transition:none!important}}\n");
customElements.whenDefined('ha-tile-icon').then(()=>{
 const proto=customElements.get('ha-tile-icon').prototype,old=proto.updated;
 function decorate(e){if(!e.shadowRoot)return;let host=e,inside=false;while(host){if(host.localName==='hui-root'){inside=true;break;}host=host.parentElement||host.getRootNode()?.host;}
 const sheets=e.shadowRoot.adoptedStyleSheets.filter(s=>s!==sheet);
 e.shadowRoot.adoptedStyleSheets=nw.active()&&inside?[...sheets,sheet]:sheets;}
 proto.updated=function(...args){const result=old?.apply(this,args);decorate(this);return result;};
 const scan=r=>{for(const e of r.querySelectorAll('*')){if(e.localName==='ha-tile-icon')decorate(e);if(e.shadowRoot)scan(e.shadowRoot);}};scan(document);
});})();

(()=>{
const sheet=new CSSStyleSheet();sheet.replaceSync("ha-card { overflow: visible; transition: box-shadow .18s, transform .18s; }\nha-tile-icon { --tile-icon-border-radius: 16px; }\n@media (prefers-reduced-motion: reduce) { ha-card {transition:none;} }\nha-card{animation:nw-enter .4s ease-out both;animation-delay:35ms}\n@keyframes nw-enter{from{opacity:0;translate:0 6px}to{opacity:1;translate:0 0}}\n@media(prefers-reduced-motion:reduce){ha-card{animation:none!important;transition:none!important}}\n");
customElements.whenDefined('hui-tile-card').then(()=>{
 const proto=customElements.get('hui-tile-card').prototype,old=proto.updated;
 function decorate(e){if(!e.shadowRoot)return;let host=e,inside=false;while(host){if(host.localName==='hui-root'){inside=true;break;}host=host.parentElement||host.getRootNode()?.host;}
 const sheets=e.shadowRoot.adoptedStyleSheets.filter(s=>s!==sheet);
 e.shadowRoot.adoptedStyleSheets=nw.active()&&inside?[...sheets,sheet]:sheets;}
 proto.updated=function(...args){const result=old?.apply(this,args);decorate(this);return result;};
 const scan=r=>{for(const e of r.querySelectorAll('*')){if(e.localName==='hui-tile-card')decorate(e);if(e.shadowRoot)scan(e.shadowRoot);}};scan(document);
});})();

// Standard button cards use the same raised icon housing as the live theme.
nwDecorate('hui-button-card', "ha-state-icon{padding:10px;border-radius:16px;background:linear-gradient(135deg,#68408b 0%,#48255f 52%,#302044 100%);border:1px solid #c097e33d;box-shadow:4px 6px 10px #10051eaa,inset 1px 1px 1px #e7c3ff55,inset -1px -2px 3px #10071e88;}ha-card:active{transform:translateY(2px) scale(.97);box-shadow:inset 3px 4px 8px #10051eaa,inset -1px -1px 2px #bb8ada33;}@media(prefers-reduced-motion:reduce){ha-card{transform:none!important}}");
