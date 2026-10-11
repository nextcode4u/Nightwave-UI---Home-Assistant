import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const f of readdirSync('src'))execFileSync(process.execPath,['--check','src/'+f]);
execFileSync(process.execPath,['--check','dist/nightwave-ui.js']);
const text=readFileSync('dist/nightwave-ui.js','utf8');
for(const pattern of [/192\.168\./,/Bearer /,/eyJ[A-Za-z0-9_-]{40}/,/\/local\/nightwave/])if(pattern.test(text))throw Error('Private or installation-specific reference: '+pattern);
if(!text.includes('const duration=nw.duration'))throw Error('Duration is not configurable');
console.log('Syntax and distribution reference checks passed');

if(JSON.stringify(JSON.parse(readFileSync('assets/theme.json','utf8')))!==JSON.stringify(JSON.parse(readFileSync('themes/nightwave.yaml','utf8'))))throw Error('Theme export differs from source');

if(readFileSync('custom_components/nightwave/www/nightwave-ui.js','utf8')!==text)throw Error('Integration bundle differs from standalone bundle');
