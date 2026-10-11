// Always available, including when all presentation effects are disabled.
class NightwaveSettings extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.scope='device';this.message='';this.household={...nwHousehold};this.connected=nwConnected;this.dirty={};}
 setConfig(config){this.config=config;this.render();}
 set hass(hass){
  const changed=this._userId!==hass.user?.id;this._hass=hass;this._userId=hass.user?.id;
  if(changed){this.scope='device';this.dirty={};this.render();this.fetchSettings();}
 }
 getCardSize(){return 9;}
 static getStubConfig(){return {};}
 async fetchSettings(){
  try{const r=await nwTimeout(this._hass.callWS({type:'nightwave/settings'}));this.household=nwClean(r.settings);this.connected=true;}
  catch{this.connected=false;}
  this.render();
 }
 values(){return this.scope==='household'?{...nwDefaults,...this.household,...this.dirty}:{...nwDefaults,...this.household,...nwUrl,...nwReadLocal(this._hass),...this.dirty};}
 async save(){
  const patch={...this.dirty};
  if(!Object.keys(patch).length){this.message='No changes to save.';this.render();return;}
  this.busy=true;this.render();
  try{
   if(this.scope==='household'){
    if(!this._hass?.user?.is_admin)throw Error('Administrator access required.');
    const r=await nwTimeout(this._hass.callWS({type:'nightwave/settings/update',settings:patch}));this.household=nwClean(r.settings);
   }else{
    const key=nwUserKey(this._hass);if(!key)throw Error('Sign in before saving preferences.');
    localStorage.setItem(key,JSON.stringify({...nwReadLocal(this._hass),...patch}));
   }
   this.dirty={};this.message='Saved. Refresh to apply the new look.';this.saved=true;
  }catch(e){this.message=e.message||'Could not save settings. Try again.';}
  this.busy=false;this.render();
 }
 reset(){
  try{const key=nwUserKey(this._hass);if(!key)throw Error('Sign in first.');localStorage.removeItem(key);this.dirty={};this.message='Device overrides cleared. Refresh to use defaults.';this.saved=true;}
  catch(e){this.message=e.message||'Could not clear preferences.';}
  this.render();
 }
 render(){
  const root=this.shadowRoot;root.replaceChildren();
  const style=document.createElement('style');style.textContent=nwSurfaceCSS+`
   :host{display:block}ha-card{display:block;padding:24px;border-radius:24px;background:linear-gradient(145deg,#3e2055,#20132f);color:#f5edff;--primary-text-color:#f5edff;--secondary-text-color:#c9b5d9;box-shadow:inset 1px 1px 2px #dab2f54d,inset -1px -2px 3px #08001199,0 8px 20px #08001166;font-family:var(--primary-font-family,system-ui)}
   h2{font-size:21px;margin:0 0 6px}p{font-size:13px;line-height:1.5;color:var(--secondary-text-color,#c9b5d9);margin:0 0 18px}.row{display:flex;justify-content:space-between;align-items:center;gap:18px;min-height:46px;border-bottom:1px solid #b18cc41c;font-size:14px}.row span{flex:1}
   select,input,button{font:inherit;accent-color:#35d8d0}select,input[type=text]{box-sizing:border-box;width:100%;margin:8px 0 16px;background:#1a1029;color:#f5edff;border:1px solid #9471a8;border-radius:10px;padding:12px}input[type=checkbox]{width:23px;height:23px;cursor:pointer}
   input[type=range]{width:100%;margin:15px 0}label.field{display:block;font-size:14px;margin-top:18px}button{min-height:44px;padding:10px 16px;border:1px solid #8974a4;border-radius:12px;background:#39214f;color:#fff;cursor:pointer;transition:transform .15s,background .15s}button:hover{background:#493060}button:active{transform:translateY(1px)}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #35f1d2;outline-offset:3px}button.primary{background:#35d8d0;color:#14282a;border-color:transparent}button:disabled{opacity:.45;cursor:default}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.status{margin-top:15px;margin-bottom:0;color:#82eee2}small{color:#c9b5d9;font-size:11px} @media(prefers-reduced-motion:reduce){button{transition:none}}
  `;root.append(style);
  const card=document.createElement('ha-card');root.append(card);
  const add=(tag,text,parent=card)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(tag==='button')e.className='nw-button';if(tag==='select'||tag==='input')e.className='nw-input';parent.append(e);return e;};
  add('h2','Nightwave');add('p','Choose the look for this device or your household.');
  const scopeLabel=add('label','Applies to');scopeLabel.className='field';const select=add('select',null,scopeLabel);select.setAttribute('aria-label','Applies to');
  for(const [value,label] of [['device','This device'],['household','Household defaults']]){const o=add('option',label,select);o.value=value;o.disabled=value==='household'&&(!this._hass?.user?.is_admin||!this.connected);}
  select.value=this.scope;select.onchange=()=>{this.scope=select.value;this.dirty={};this.message='';this.render();};
  add('p',this.scope==='device'?'Only this browser or app, for your signed-in account. Other devices keep their own preferences.':'Shared defaults for devices without overrides. Refresh open dashboards after saving.');
  if(!this.connected)add('p','Household settings unavailable. Device preferences still work. Add or reconnect the Nightwave integration.');
  if(Object.keys(nwUrl).length)add('p','Legacy resource URL options are active and override household defaults. Device preferences take priority.');
  const values=this.values(),local=nwReadLocal(this._hass);
  for(const [key,title] of Object.entries(nwFeatures)){
   const row=add('label',null);row.className='row';const text=add('span',title,row);
   if(this.scope==='device'&&(key in local||key in this.dirty))add('small',' · device override',text);
   const input=add('input',null,row);input.type='checkbox';input.className='';input.checked=values[key];input.setAttribute('aria-label',title);input.onchange=()=>{this.dirty[key]=input.checked;};
  }
  add('p','Reduced effects pauses particles, liquid transitions, animated weather and device motion.');
  const label=add('label',`Transition duration · ${values.duration} ms`);label.className='field';
  const range=add('input');range.type='range';range.className='';range.min=250;range.max=2500;range.step=50;range.value=values.duration;range.setAttribute('aria-label','Transition duration');range.oninput=()=>{this.dirty.duration=Number(range.value);label.textContent=`Transition duration · ${range.value} ms`;};
  if(this.scope==='household')for(const [key,title] of [['dashboard','Dashboard URL prefixes'],['fan_entities','Optional fan switch entity IDs']]){
   const l=add('label',title);l.className='field';const input=add('input',null,l);input.type='text';input.value=values[key];input.placeholder=key==='dashboard'?'lovelace,dashboard-tablet':'switch.ceiling_fan';input.oninput=()=>{this.dirty[key]=input.value;};
  }
  const actions=add('div');actions.className='actions';const save=add('button',this.busy?'Saving…':'Save preferences',actions);save.className='nw-button primary';save.disabled=this.busy||!this._hass;save.onclick=()=>this.save();
  if(this.scope==='device'){const reset=add('button','Use defaults',actions);reset.disabled=this.busy;reset.onclick=()=>this.reset();}
  if(this.saved){const refresh=add('button','Refresh now',actions);refresh.onclick=()=>location.reload();}
  if(!this.connected){const retry=add('button','Reconnect',actions);retry.onclick=()=>this.fetchSettings();}
  const status=add('p',this.message);status.className='status';status.setAttribute('role','status');
 }
}
if(!customElements.get('nightwave-settings'))customElements.define('nightwave-settings',NightwaveSettings);
window.customCards=window.customCards||[];
window.customCards.push({type:'nightwave-settings',name:'Nightwave settings',description:'Device preferences and household defaults',preview:true});
