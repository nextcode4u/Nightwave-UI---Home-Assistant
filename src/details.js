// Generic, collapsed-by-default entity foldout. No preselected devices or actions.
class NightwaveDetails extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});}
 setConfig(config){
  if(!Array.isArray(config.entities))throw Error('Nightwave details requires an entities list.');
  this.config=config;this.render();
 }
 set hass(hass){this._hass=hass;if(this.card)this.card.hass=hass;}
 getCardSize(){return this.shadowRoot.querySelector('details')?.open?Math.max(2,this.config.entities.length):1;}
 getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
 async render(){
  const config=this.config;
  this.shadowRoot.innerHTML=`<style>${nwSurfaceCSS}
  :host{display:block}details{background:var(--ha-card-background);color:var(--primary-text-color);border:1px solid var(--ha-card-border-color);border-radius:var(--ha-card-border-radius,22px);box-shadow:var(--ha-card-box-shadow);overflow:hidden}summary{padding:8px 16px;font-size:14px;touch-action:manipulation}summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:-3px}.content{padding:0 4px 4px}.error{padding:12px 16px}
  </style><details class="nw-foldout"><summary></summary><div class="content"></div></details>`;
  const details=this.shadowRoot.querySelector('details');details.open=config.open===true;
  this.shadowRoot.querySelector('summary').textContent=config.title||'Details';
  details.addEventListener('toggle',()=>this.dispatchEvent(new Event('card-size-changed',{bubbles:true,composed:true})));
  try{
   const helpers=await window.loadCardHelpers();if(config!==this.config)return;
   this.card=helpers.createCardElement({type:'entities',show_header_toggle:false,entities:config.entities});
   this.card.style.setProperty('--ha-card-box-shadow','none');this.card.style.setProperty('--ha-card-border-width','0');this.card.style.setProperty('--ha-card-background','transparent');
   if(this._hass)this.card.hass=this._hass;
   this.shadowRoot.querySelector('.content').replaceChildren(this.card);
  }catch{if(config!==this.config)return;const e=document.createElement('p');e.className='error';e.textContent='Could not load entity controls. Refresh to try again.';this.shadowRoot.querySelector('.content').replaceChildren(e);}
 }
}
if(!customElements.get('nightwave-details'))customElements.define('nightwave-details',NightwaveDetails);
window.customCards.push({type:'nightwave-details',name:'Nightwave details',description:'Collapsed entity controls with animated reveal'});
// CSS is opt-in for custom card authors; it never searches or modifies household cards.
window.Nightwave=Object.freeze({version:'0.3.1',styles:Object.freeze({surfaces:nwSurfaceCSS})});
