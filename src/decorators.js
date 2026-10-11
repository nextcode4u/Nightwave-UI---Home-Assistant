// Scoped styling for native controls. Native events and service behavior are untouched.
function nwDecorate(tag,css){
 const sheet=new CSSStyleSheet();sheet.replaceSync(css);
 function apply(e){if(!e.shadowRoot)return;let inside=false;
  for(let n=e;n;n=n.parentElement||n.getRootNode()?.host)if(n.localName==='hui-root'){inside=true;break;}
  const previous=e.shadowRoot.adoptedStyleSheets;
  const use=nw.active()&&inside,has=previous.includes(sheet);
  if(use!==has)e.shadowRoot.adoptedStyleSheets=use?[...previous,sheet]:previous.filter(s=>s!==sheet);
 }
 const scan=root=>{for(const e of root.querySelectorAll('*')){if(e.localName===tag)apply(e);if(e.shadowRoot)scan(e.shadowRoot);}};
 customElements.whenDefined(tag).then(()=>{
  const proto=customElements.get(tag).prototype,old=proto.updated;
  proto.updated=function(...args){const result=old?.apply(this,args);apply(this);return result;};scan(document);
  window.addEventListener('location-changed',()=>scan(document));window.addEventListener('popstate',()=>scan(document));
 });
}
