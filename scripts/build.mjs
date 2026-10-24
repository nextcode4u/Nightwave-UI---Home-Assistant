import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const read=p=>readFileSync(p,'utf8');
let css=read('assets/fonts/fonts.css').replace(/url\(([^)]+)\)/g,(_,f)=>`url(data:font/woff2;base64,${readFileSync('assets/fonts/'+f).toString('base64')})`);
let result='/* Nightwave UI 0.3.4\n'+read('LICENSE')+'\nFONT LICENSES\n'+read('assets/fonts/outfit-OFL.txt')+'\n'+read('assets/fonts/spacegrotesk-OFL.txt')+'*/\nif (!window.__nightwaveUIStarted) {\nwindow.__nightwaveUIStarted = true;\n'+read('src/config.js');
result+='\n'+read('src/decorators.js');
result+='\nconst nwSurfaceCSS='+JSON.stringify(read('assets/styles/surfaces.css'))+';\n';
result+='\n'+read('src/settings-card.js');
result+='\n'+read('src/details.js');
result+=`\nif(nw.enabled('fonts')&&!document.querySelector('#nightwave-local-fonts')){const s=document.createElement('style');s.id='nightwave-local-fonts';s.textContent=${JSON.stringify(css)};document.head.append(s);}`;
const theme=JSON.parse(read('assets/theme.json'));
result+='\nconst nightwaveTheme='+JSON.stringify(theme.Nightwave)+';\n';
for(const name of ['theme','cards','links','particles','icons','motion','weather','weather-touch','dial','transitions','controls','sliders','depth']){
 const condition=`nw.enabled('${name}')`;
 result+=`\n// ---- ${name} ----\nif(${condition}){\n${read('src/'+name+'.js')}\n}\n`;
}
result+='\n}\n';
mkdirSync('themes',{recursive:true});writeFileSync('themes/nightwave.yaml',JSON.stringify(theme,null,2)+'\n');
mkdirSync('dist',{recursive:true});writeFileSync('dist/nightwave-ui.js',result);
mkdirSync('custom_components/nightwave/www',{recursive:true});
writeFileSync('custom_components/nightwave/www/nightwave-ui.js',result);
console.log('Built dist/nightwave-ui.js ('+Buffer.byteLength(result)+' bytes)');
