// Settings priority: defaults < household < legacy URL < this browser/user.
const params = new URL(import.meta.url).searchParams;
const nwFeatures = {
 theme:'Theme',fonts:'Fonts',depth:'Card depth',icons:'Sculpted icons',
 particles:'Particles and aurora',transitions:'Liquid transitions',
 motion:'Animated device icons',weather:'Animated weather',controls:'Custom toggles',
 sliders:'Custom sliders',dial:'Thermostat dial details',reduced_effects:'Reduced effects',
};
const nwDefaults={...Object.fromEntries(Object.keys(nwFeatures).map(k=>[k,true])),
 reduced_effects:false,dashboard:'lovelace',duration:1000,fan_entities:''};
const nwClean = raw => {
 const out={};if(!raw||typeof raw!=='object')return out;
 for(const key of Object.keys(nwFeatures))if(typeof raw[key]==='boolean')out[key]=raw[key];
 if(Number.isFinite(raw.duration)&&raw.duration>=250&&raw.duration<=2500)out.duration=Math.round(raw.duration);
 for(const key of ['dashboard','fan_entities'])if(typeof raw[key]==='string')out[key]=raw[key];
 return out;
};
let nwHass=document.querySelector('home-assistant')?.hass;
if(params.get('integration')==='true'||document.querySelector('home-assistant')){
 for(let i=0;!nwHass&&i<80;i++){await new Promise(r=>setTimeout(r,100));nwHass=document.querySelector('home-assistant')?.hass;}
}
const nwTimeout = promise => Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error('Nightwave connection timed out')),5000))]);
let nwHousehold={},nwConnected=false;
if(nwHass){try{const result=await nwTimeout(nwHass.callWS({type:'nightwave/settings'}));nwHousehold=nwClean(result.settings);nwConnected=true;}catch{}}
const nwUserKey = hass => hass?.user?.id ? 'nightwave.preferences.v1.'+hass.user.id : null;
const nwReadLocal = hass => {try{return nwClean(JSON.parse(localStorage.getItem(nwUserKey(hass))||'{}'));}catch{return {};}};
const nwUrl={};
for(const key of Object.keys(nwFeatures))if(params.has(key))nwUrl[key]=params.get(key)!=='false';
if(params.has('dashboard'))nwUrl.dashboard=params.get('dashboard');
if(params.has('duration'))nwUrl.duration=Math.max(250,Math.min(2500,Number(params.get('duration'))||1000));
if(params.has('fan_entities'))nwUrl.fan_entities=params.get('fan_entities');
const nwResolved={...nwDefaults,...nwHousehold,...nwUrl,...nwReadLocal(nwHass)};
// A disconnected integration must not accidentally style the wrong dashboard.
const dashboards=(params.get('integration')==='true'&&!nwConnected?[]:nwResolved.dashboard.split(','))
 .map(p=>'/'+p.trim().replace(/^\/+|\/+$/g,'')).filter(p=>p!=='/');
const nw={
 active(path=location.pathname){return dashboards.some(p=>path===p||path.startsWith(p+'/'));},
 enabled(name){return !(nwResolved.reduced_effects&&['particles','transitions','motion','weather'].includes(name))&&(nwResolved[name]??(params.get(name)!=='false'));},
 duration:nwResolved.duration,
 fanEntities:nwResolved.fan_entities.split(',').map(p=>p.trim()).filter(Boolean),
};
