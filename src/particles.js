/* Local particles.js-style background. No external assets or touch handlers. */
(()=>{
 if(window.__nightwaveParticles)return;window.__nightwaveParticles=true;
 class NightwaveParticles extends HTMLElement{
  constructor(){super();this.attachShadow({mode:'open'});this.shadowRoot.innerHTML='<style>:host{position:fixed;inset:0;display:block;pointer-events:none!important;z-index:0;overflow:hidden;contain:strict}canvas{position:relative;display:block;width:100%;height:100%;pointer-events:none!important}.aurora{position:absolute;inset:-15%;pointer-events:none;background:radial-gradient(ellipse at 18% 30%,#873ad0a6,transparent 48%),radial-gradient(ellipse at 86% 65%,#25b7b978,transparent 46%),radial-gradient(ellipse at 35% 95%,#c845aa66,transparent 40%);animation:nw-aurora 12s ease-in-out infinite alternate;will-change:transform;animation-play-state:paused}:host([data-running=true]) .aurora{animation-play-state:running}@keyframes nw-aurora{0%{transform:translate(-8%,-5%) scale(1.04) rotate(-7deg)}50%{transform:translate(3%,6%) scale(1.12) rotate(1deg)}100%{transform:translate(9%,-5%) scale(1.08) rotate(7deg)}}@media(prefers-reduced-motion:reduce){.aurora{animation:none;will-change:auto}}</style><div class="aurora" aria-hidden="true"></div><canvas aria-hidden="true"></canvas>';this.canvas=this.shadowRoot.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.tick=this.tick.bind(this);this.refresh=()=>{this.size();this.start()};this.motionChanged=()=>this.start();this.last=0;this.frames=0;}
  connectedCallback(){this.setAttribute('aria-hidden','true');this.size();window.addEventListener('resize',this.refresh);document.addEventListener('visibilitychange',this.motionChanged);this.motion.addEventListener('change',this.motionChanged);this.start();}
  disconnectedCallback(){cancelAnimationFrame(this.raf);window.removeEventListener('resize',this.refresh);document.removeEventListener('visibilitychange',this.motionChanged);this.motion.removeEventListener('change',this.motionChanged);}
  size(){const oldW=this.w,oldH=this.h;
    if(oldW===innerWidth&&oldH===innerHeight)return;
    this.w=innerWidth;this.h=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(this.w*d);this.canvas.height=Math.round(this.h*d);this.ctx.setTransform(d,0,0,d,0,0);const n=this.w<801?30:Math.min(65,Math.round(this.w*this.h/19000));const colors=['#35f1d2','#b27aff','#fa72dc'];this.points=this.points||[];
    for(const p of this.points){p.x=p.x/oldW*this.w;p.y=p.y/oldH*this.h}
    if(this.points.length>n)this.points.length=n;
    while(this.points.length<n){const i=this.points.length;this.points.push({x:Math.random()*this.w,y:Math.random()*this.h,vx:(Math.random()-.5)*20,vy:-10-Math.random()*12,r:1.1+Math.random()*1.8,c:colors[i%3],a:.45+Math.random()*.3});}this.draw(0);}
  start(){cancelAnimationFrame(this.raf);this.last=0;this.dataset.running=String(!document.hidden&&!this.motion.matches&&this.isConnected);if(this.dataset.running==='true')this.raf=requestAnimationFrame(this.tick);else if(!document.hidden)this.draw(0);}
  tick(t){if(!this.isConnected||document.hidden||this.motion.matches){this.start();return}if(!this.last)this.last=t;if(t-this.last>=33){this.draw(Math.min((t-this.last)/1000,.08));this.last=t;this.frames++}this.raf=requestAnimationFrame(this.tick);}
  draw(dt){const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.h);for(const p of this.points){p.x=(p.x+p.vx*dt+this.w)%this.w;p.y=(p.y+p.vy*dt+this.h)%this.h;}const dist=this.w<801?100:130;ctx.lineWidth=.6;for(let i=0;i<this.points.length;i++){const a=this.points[i];for(let j=i+1;j<this.points.length;j++){const b=this.points[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<dist){ctx.strokeStyle=`rgba(173,119,247,${ .24*(1-d/dist)})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}ctx.globalAlpha=a.a;ctx.fillStyle=a.c;ctx.shadowColor=a.c;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;}}
 }
 customElements.define('nightwave-particles',NightwaveParticles);
 const layer=document.createElement('nightwave-particles');
 let dashboard;
 function find(r){
   const e=r.querySelector('hui-root');if(e)return e;
   for(const n of r.querySelectorAll('*'))if(n.shadowRoot){
     const e=find(n.shadowRoot);if(e)return e;
   }return null;
 }
 function attach(){
   if(!nw.active()){layer.remove();return}
   if(!dashboard?.isConnected)dashboard=find(document);
   const root=dashboard?.shadowRoot;if(!root)return;dashboard.toggleAttribute('data-nightwave-popup',document.body.classList.contains('bubble-body-scroll-locked'));
   if(!root.querySelector('#nightwave-particle-layer')){
     const style=document.createElement('style');style.id='nightwave-particle-layer';
     style.textContent=':host{isolation:isolate}hui-view{position:relative;z-index:1}:host([data-nightwave-popup]){isolation:auto}:host([data-nightwave-popup]) hui-view{z-index:auto}';
     root.append(style);
   }
   // Remains a sibling of the view container throughout SPA navigation.
   if(layer.parentNode!==root)root.prepend(layer);
   const left=Math.max(0,dashboard.getBoundingClientRect().left);
   const top=Math.max(0,root.querySelector('.header')?.getBoundingClientRect().bottom||0);
   layer.style.clipPath=`inset(${top}px 0 0 ${left}px)`;
 }
 const schedule=()=>{attach();requestAnimationFrame(attach)};
 window.addEventListener('location-changed',schedule);
 window.addEventListener('popstate',schedule);
 window.addEventListener('resize',schedule);
 new MutationObserver(attach).observe(document.body,{attributes:true,attributeFilter:['class']});
 setInterval(attach,2000);attach();
})();
