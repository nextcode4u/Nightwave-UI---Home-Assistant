/* Directional liquid reveal for live views. No screenshots, cloned views, or gesture interception. */
(()=>{
 if(window.__nwViewTransitions)return;window.__nwViewTransitions=true;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let previous=location.pathname,generation=0,active;
 function find(root,tag){const el=root.querySelector(tag);if(el)return el;for(const e of root.querySelectorAll('*'))if(e.shadowRoot){const found=find(e.shadowRoot,tag);if(found)return found;}return null;}
 function direction(root,from,to){const views=root.lovelace?.config?.views||root._lovelace?.config?.views||[];const a=views.findIndex(v=>v.path===from.split('/').pop()),b=views.findIndex(v=>v.path===to.split('/').pop());return a>=0&&b>=0?(b>a?1:-1):1;}
 async function navigate(root){const to=location.pathname,from=previous;if(to===from)return;previous=to;const gen=++generation;active?.cancel();if(!nw.active(from)||!nw.active(to)||reduced.matches)return;
 await root.updateComplete;const view=root.shadowRoot?.querySelector('hui-view');if(!view)return;await view.updateComplete;await new Promise(r=>requestAnimationFrame(r));if(gen!==generation||reduced.matches||!view.isConnected)return;const dir=direction(root,from,to);
 // An organic ink bloom: curved lobes and detached droplets merge as the mask grows.
 // Mask live content only; no screenshots or duplication of interactive cards.
 const rect=view.getBoundingClientRect(),w=rect.width,h=rect.height;
 const top=Math.max(0,-rect.top),bottom=Math.min(h,innerHeight-rect.top),vh=Math.max(1,bottom-top);
 const cx=w*(dir>0?.38:.62),cy=top+vh*.43,radius=Math.hypot(w,vh)*.85;
 const duration=nw.duration;let stopped=false,animation;
 const oldClip=view.style.clipPath,oldWillChange=view.style.willChange;
 function blob(x,y,r,phase,n=16){
  const pts=[];
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;
   const ripple=1+.16*Math.sin(5*a+phase)+.09*Math.sin(3*a-phase*.7);
   pts.push([x+Math.cos(a)*r*ripple,y+Math.sin(a)*r*ripple]);}
  const f=v=>v.toFixed(1);let d=`M${f(pts[0][0])},${f(pts[0][1])}`;
  for(let i=0;i<n;i++){const p0=pts[(i+n-1)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
   d+=`C${f(p1[0]+(p2[0]-p0[0])/6)},${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)},${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])},${f(p2[1])}`;}
  return d+'Z';
 }
 // Build matching curved keyframes once. The browser interpolates them; no per-frame
 // JavaScript, path-string rebuilding or style writes while dashboard cards render.
 const frames=[];
 for(let i=0;i<=20;i++){
  const t=i/20,growth=t*t*(3-2*t);
  let d=blob(cx,cy,radius*growth,t*3.2);
  for(const [x,y,delay,size] of [[.76,.22,.12,.065],[.2,.75,.21,.085]]){
   const q=Math.max(0,Math.min(1,(t-delay)/.35));
   d+=blob(w*(dir>0?x:1-x),top+vh*y,Math.min(w,vh)*size*q,t*4+x*8,8);
  }
  if(top>0)d+=`M0,0H${w}V${top}H0Z`;
  if(bottom<h)d+=`M0,${bottom}H${w}V${h}H0Z`;
  frames.push({clipPath:`path("${d}")`,offset:t});
 }
 function cleanup(){if(stopped)return;stopped=true;animation?.cancel();view.style.clipPath=oldClip;view.style.willChange=oldWillChange;view.removeAttribute('data-liquid-transition');}
 active={cancel:cleanup};view.setAttribute('data-liquid-transition','');view.style.willChange='clip-path';
 animation=view.animate(frames,{duration,easing:'linear',fill:'both'});
 animation.finished.then(cleanup,cleanup);
 window.__nwLastTransition={from,to,direction:dir,duration,effect:'organic-liquid',engine:'native-keyframes'};


 }
 // Start only after HA has committed the selected view, including cached views.
 customElements.whenDefined('hui-root').then(()=>{const proto=customElements.get('hui-root').prototype,updated=proto.updated;proto.updated=function(changed){const result=updated.call(this,changed);if(changed.has('_curView'))navigate(this);return result;};});
 reduced.addEventListener('change',()=>{if(reduced.matches)active?.cancel();});
 // Particle-block reveal on a real weather-condition change, never on routine sensor refresh.
 customElements.whenDefined('nightwave-weather-scene').then(()=>{const proto=customElements.get('nightwave-weather-scene').prototype,old=proto.update;proto.update=function(s,night){const oldKind=this.dataset.kind,oldNight=this.hasAttribute('data-night');old.call(this,s,night);if(!oldKind||oldKind==='unknown'||oldKind===this.dataset.kind&&oldNight===this.hasAttribute('data-night')||reduced.matches||document.hidden||this.hasAttribute('data-paused'))return;
 this.shadowRoot.querySelector('.nw-particle-reveal')?.remove();const veil=document.createElement('div');veil.className='nw-particle-reveal';veil.setAttribute('aria-hidden','true');veil.style.cssText='position:absolute;inset:0;display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(4,1fr);pointer-events:none;overflow:hidden';this.shadowRoot.append(veil);
 for(let i=0;i<48;i++){const bit=document.createElement('i');bit.style.cssText='background:'+(i%4?'#35204d':'#245357')+';pointer-events:none';veil.append(bit);bit.animate([{opacity:.9,transform:'translateY(0) scale(1)'},{opacity:0,transform:`translateY(${25+i%5*12}px) scale(.25)`}],{duration:480,delay:(i%12)*14,fill:'forwards',easing:'ease-out'});}setTimeout(()=>veil.remove(),750);
 };});
})();
