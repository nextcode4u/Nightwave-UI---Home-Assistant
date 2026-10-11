// Apply theme variables only to the selected dashboard. Restore existing inline
// values when leaving it; never change the user's saved Home Assistant theme.
(()=>{
 const applied=new Map();
 const variables={...nightwaveTheme,...nightwaveTheme.modes?.dark};
 delete variables.modes;
 function restore(root){const saved=applied.get(root);if(!saved)return;
  for(const [key,[value,priority]] of saved){if(value)root.style.setProperty(key,value,priority);else root.style.removeProperty(key);}
  root.removeAttribute('data-nightwave-theme');applied.delete(root);
 }
 function apply(root){if(!nw.active()||!root.isConnected){restore(root);return;}
  if(applied.has(root))return;
  const saved=new Map();
  for(const [name,value] of Object.entries(variables)){
   if(value==null||typeof value==='object')continue;
   const key='--'+name;saved.set(key,[root.style.getPropertyValue(key),root.style.getPropertyPriority(key)]);
   root.style.setProperty(key,String(value));
  }
  saved.set('background',[root.style.getPropertyValue('background'),root.style.getPropertyPriority('background')]);
  root.style.background='var(--lovelace-background)';
  root.setAttribute('data-nightwave-theme','');applied.set(root,saved);
 }
 function scan(root){const direct=root.querySelector('hui-root');if(direct){apply(direct);return;}
  for(const e of root.querySelectorAll('*'))if(e.shadowRoot)scan(e.shadowRoot);
 }
 function refresh(){for(const root of applied.keys())if(!root.isConnected||!nw.active())restore(root);scan(document);}
 customElements.whenDefined('hui-root').then(()=>{const proto=customElements.get('hui-root').prototype,old=proto.updated;
  proto.updated=function(...args){const result=old?.apply(this,args);apply(this);return result;};refresh();
 });
 window.addEventListener('location-changed',refresh);window.addEventListener('popstate',refresh);
})();
