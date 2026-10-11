(()=>{
 if(window.__nightwaveDetailedDial)return;window.__nightwaveDetailedDial=true;
 const ns='http://www.w3.org/2000/svg';
 function decorate(e){
  let climate=false;for(let n=e;n;n=n.parentElement||n.getRootNode().host){if(n.localName==='ha-state-control-climate-temperature'){climate=true;break}}
  if(!climate||!nw.active())return;
  const svg=e.shadowRoot?.querySelector('svg'),sliders=svg?.querySelectorAll('[role="slider"]');if(!sliders?.length)return;
  const min=Math.min(...[...sliders].map(s=>Number(s.getAttribute('aria-valuemin')))),max=Math.max(...[...sliders].map(s=>Number(s.getAttribute('aria-valuemax'))));
  if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)return;
  const signature=`${min}:${max}`;let detail=svg.querySelector('#nw-dial-detail');if(detail?.dataset.range===signature)return;detail?.remove();
  detail=document.createElementNS(ns,'g');detail.id='nw-dial-detail';detail.dataset.range=signature;detail.setAttribute('aria-hidden','true');detail.style.pointerEvents='none';
  const point=(v,r)=>{const angle=(135+(v-min)/(max-min)*270)*Math.PI/180;return [160+Math.cos(angle)*r,160+Math.sin(angle)*r]};
  const step=max-min>50?2:1,labelStep=max-min>50?20:5;
  for(let v=Math.ceil(min/step)*step;v<=max;v+=step){const major=v%labelStep===0,medium=v%(labelStep/2)===0;const [x1,y1]=point(v,130),[x2,y2]=point(v,major?122:medium?124:126);
   const tick=document.createElementNS(ns,'line');for(const [k,val]of Object.entries({x1,y1,x2,y2,stroke:major?'#dccdf0':'#9579b3','stroke-width':major?1.5:1,'stroke-linecap':'round',opacity:major?.85:.45}))tick.setAttribute(k,val);detail.append(tick);
   if(major){const [x,y]=point(v,111),text=document.createElementNS(ns,'text');text.setAttribute('x',x);text.setAttribute('y',y);text.setAttribute('text-anchor','middle');text.setAttribute('dominant-baseline','central');text.setAttribute('fill','#bfaace');text.style.font='500 9px "Space Grotesk",sans-serif';text.textContent=String(v);detail.append(text)}
  }
  svg.append(detail);
 }
 customElements.whenDefined('ha-control-circular-slider').then(()=>{const p=customElements.get('ha-control-circular-slider').prototype,old=p.updated;p.updated=function(...args){const result=old?.apply(this,args);decorate(this);return result};
 const scan=r=>{for(const e of r.querySelectorAll('*')){if(e.localName==='ha-control-circular-slider')decorate(e);else if(e.shadowRoot)scan(e.shadowRoot)}};scan(document);
 });
})();
