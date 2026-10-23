/* Nightwave living motion. Original CSS, no external animation dependencies.
 * Visual thesis: slow purple/cyan atmosphere, state-aware sculpted icons.
 * Content: existing dashboard layout and controls; no additional UI chrome.
 * Interaction: ambient aurora, active-device motion, brief touch feedback.
 */
(()=>{
 if(window.__nightwaveLivingMotion)return;window.__nightwaveLivingMotion=true;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),tracked=new Set();
 const inside=e=>{if(!nw.active())return false;for(let n=e;n;n=n.parentElement||n.getRootNode()?.host)if(n.localName==='hui-root')return true;return false;};
 const running=e=>e.toggleAttribute('data-nw-motion-paused',document.hidden||reduce.matches||e._nwVisible===false||!inside(e));
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){entry.target._nwVisible=entry.isIntersecting;running(entry.target);}},{threshold:0});
 function track(e){if(!tracked.has(e)){tracked.add(e);e._nwVisible=false;observer.observe(e);}running(e);}
 function refresh(){for(const e of tracked){if(!e.isConnected){tracked.delete(e);observer.unobserve(e);}else running(e);}}
 document.addEventListener('visibilitychange',refresh);reduce.addEventListener('change',refresh);
 const sheets=new Map();
 function style(e,id,css){if(!e.shadowRoot)return;let sheet=sheets.get(id);if(!sheet){sheet=new CSSStyleSheet();sheet.replaceSync(css);sheets.set(id,sheet);}if(!e.shadowRoot.adoptedStyleSheets.includes(sheet))e.shadowRoot.adoptedStyleSheets=[...e.shadowRoot.adoptedStyleSheets,sheet];track(e);}
 const pause=`:host([data-nw-motion-paused]) *, :host([data-nw-motion-paused]) *::before,:host([data-nw-motion-paused]) *::after{animation-play-state:paused!important}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`;
 const icons=`
 :host([data-nw-motion]) :is(ha-icon,ha-svg-icon){display:inline-flex;transform-origin:50% 50%}
 :host([data-nw-motion=fan]) :is(ha-icon,ha-svg-icon){animation:nw-fan-active 2.4s ease-in-out infinite}
 :host([data-nw-motion=fan][data-nw-fan-rotor]) :is(ha-icon,ha-svg-icon){animation:nw-fan 2.4s linear infinite}
 :host([data-nw-motion=light]) :is(ha-icon,ha-svg-icon){animation:nw-light 3s ease-in-out infinite}
 :host([data-nw-motion=cooling]) :is(ha-icon,ha-svg-icon){animation:nw-cool 5s linear infinite}
 :host([data-nw-motion=heating]) :is(ha-icon,ha-svg-icon){animation:nw-heat 3.2s ease-in-out infinite}
 :host([data-nw-motion=playing]) :is(ha-icon,ha-svg-icon){animation:nw-playing 2.4s ease-in-out infinite}
 @keyframes nw-fan{to{transform:rotate(360deg)}}
 @keyframes nw-fan-active{0%,100%{filter:drop-shadow(0 0 1px #76ffe533)}50%{filter:drop-shadow(0 0 6px #76ffe5bb)}}
 @keyframes nw-light{0%,100%{filter:drop-shadow(0 0 1px #76ffe533);transform:scale(1)}50%{filter:drop-shadow(0 0 9px #76ffe5cc);transform:scale(1.13)}}
 @keyframes nw-cool{to{transform:rotate(360deg)}}
 @keyframes nw-heat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.13);filter:drop-shadow(0 0 3px #ffc08266)}}
 @keyframes nw-playing{0%,100%{transform:scale(1)}25%{transform:scale(1.06)}50%{transform:scale(.98)}75%{transform:scale(1.04)}}
 `+pause;
 function kind(s){if(!s||['unavailable','unknown','off'].includes(s.state))return '';const domain=s.entity_id?.split('.')[0];if(domain==='fan'||nw.fanEntities.includes(s.entity_id))return s.state==='on'?'fan':'';if(domain==='light'||(domain==='switch'&&/light/i.test(s.entity_id+' '+(s.attributes.friendly_name||''))))return s.state==='on'?'light':'';if(domain==='climate')return ['cooling','heating'].includes(s.attributes.hvac_action)?s.attributes.hvac_action:'';if(domain==='media_player')return s.state==='playing'?'playing':'';return '';}
 function icon(e){const glyph=e.icon||e.stateObj?.attributes?.icon||e.shadowRoot?.querySelector('ha-icon')?.icon;
 // Rotate only known blade-only glyphs; mounts and unknown/custom shapes stay upright.
 e.toggleAttribute('data-nw-fan-rotor',glyph==='mdi:fan');
 if(!inside(e)){e.removeAttribute('data-nw-motion');return;}const k=kind(e.stateObj);if(k){style(e,'icons',icons);e.setAttribute('data-nw-motion',k);}else e.removeAttribute('data-nw-motion');}
 const surface=`:host([data-nw-active]) ha-card{background-size:165% 165%;animation:nw-surface 9s ease-in-out infinite alternate}@keyframes nw-surface{from{background-position:0% 30%}to{background-position:100% 70%}}`+pause;
 function tile(e){if(!inside(e))return;const s=e.hass?.states[e._config?.entity||e.config?.entity];if(s){style(e,'surface',surface);e.toggleAttribute('data-nw-active',!!kind(s));}}
 const weather=`
 .forecast.daily .forecast-image-icon svg{overflow:visible;filter:drop-shadow(0 3px 2px #16092455)}
 .forecast.daily .forecast-image-icon .sun{transform-box:fill-box;transform-origin:center;animation:nw-sun 3.5s ease-in-out infinite}
 .forecast.daily .forecast-image-icon .cloud-front{animation:nw-cloud 3.8s ease-in-out infinite alternate}
 .forecast.daily .forecast-image-icon .cloud-back{animation:nw-cloud 5s ease-in-out infinite alternate-reverse}
 .forecast.daily .forecast-image-icon .moon{transform-box:fill-box;transform-origin:center;animation:nw-moon 7s ease-in-out infinite}
 .forecast.daily .forecast-image-icon [class*=rain]{animation:nw-rainfall 1.8s ease-in-out infinite}
 .forecast.daily .forecast-image-icon [class*=snow]{animation:nw-snowfall 3s ease-in-out infinite}
 @keyframes nw-sun{0%,100%{transform:scale(1);filter:drop-shadow(0 0 .4px #ffdcad44)}50%{transform:scale(1.16);filter:drop-shadow(0 0 1px #ffdcad99)}}
 @keyframes nw-cloud{from{transform:translateX(-.9px)}to{transform:translateX(1.1px)}}
 @keyframes nw-moon{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
 @keyframes nw-rainfall{0%{transform:translateY(-.4px);opacity:.6}60%{opacity:1}100%{transform:translateY(.8px);opacity:.6}}
 @keyframes nw-snowfall{0%,100%{transform:translate(-.3px,-.2px)}50%{transform:translate(.3px,.7px)}}
 .weather{animation:nw-weather-pan 28s ease-in-out infinite alternate}@keyframes nw-weather-pan{from{background-position:45% 45%}to{background-position:55% 55%}}
 ha-card{background-size:145% 145%;animation:nw-weather-surface 11s ease-in-out infinite alternate}
 @keyframes nw-weather-surface{from{background-position:0% 30%}to{background-position:100% 60%}}
 `+pause;
 function weatherCard(e){if(inside(e))style(e,'weather',weather);}
 // Home weather illustration complements the gently animated daily forecast.
 function glance(e){if(inside(e))style(e,'glance',`
 .sunny .orb{animation:nw-orb 4s ease-in-out infinite}.night .orb{animation:nw-night 8s ease-in-out infinite}.cloudy .orb,.rainy .orb,.pouring .orb,.snowy .orb{opacity:.15}
 @keyframes nw-orb{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.2);filter:brightness(1.2)}}
 @keyframes nw-night{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
 `+pause);}
 function thermostat(e){if(!inside(e))return;const s=e.hass?.states[e._config?.entity||e.config?.entity];if(!s)return;style(e,'thermostat',`:host([data-nw-hvac=cooling]) ha-control-circular-slider{filter:drop-shadow(0 0 4px #42e9f033);animation:nw-hvac 5s ease-in-out infinite}:host([data-nw-hvac=heating]) ha-control-circular-slider{filter:drop-shadow(0 0 4px #ffc47a33);animation:nw-hvac 5s ease-in-out infinite}@keyframes nw-hvac{50%{filter:drop-shadow(0 0 9px #a888de66)}}`+pause);e.setAttribute('data-nw-hvac',s.attributes.hvac_action||'idle');}
 function navigation(e){if(inside(e)){style(e,'navigation',`#img-cell{animation:nw-nav-float 4.8s ease-in-out infinite;animation-delay:var(--nw-nav-delay,0s)}@keyframes nw-nav-float{0%,100%{transform:translateY(1px) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg) scale(1.05)}}`+pause);if(!e.style.getPropertyValue('--nw-nav-delay'))e.style.setProperty('--nw-nav-delay',(-Math.random()*4).toFixed(2)+'s');}}
 const handlers={'button-card':navigation,'ha-state-icon':icon,'hui-tile-card':tile,'weather-forecast-extended-card':weatherCard,'hui-thermostat-card':thermostat,'nightwave-glance':glance};
 for(const [tag,fn] of Object.entries(handlers))customElements.whenDefined(tag).then(()=>{const proto=customElements.get(tag).prototype;if(proto.updated){const original=proto.updated;proto.updated=function(...args){const result=original.apply(this,args);fn(this);return result;};}else{const descriptor=Object.getOwnPropertyDescriptor(proto,'hass');if(descriptor?.set)Object.defineProperty(proto,'hass',{...descriptor,set(h){descriptor.set.call(this,h);fn(this);}});}schedule();});
 function scan(root){for(const e of root.querySelectorAll('*')){handlers[e.localName]?.(e);if(e.shadowRoot)scan(e.shadowRoot);}}
 let timer;function schedule(){clearTimeout(timer);refresh();timer=setTimeout(()=>{scan(document);refresh();},350);}
 window.addEventListener('location-changed',schedule);window.addEventListener('popstate',schedule);setInterval(refresh,5000);schedule();
})();
