// Run once a real GitHub repository and maintainer have been chosen.
import {readFileSync,writeFileSync} from 'node:fs';
const [repo,maintainer]=process.argv.slice(2);
if(!/^[\w.-]+\/[\w.-]+$/.test(repo||'')||!/^@?[\w-]+$/.test(maintainer||'')){
 console.error('Usage: node scripts/release-metadata.mjs OWNER/REPO @MAINTAINER');process.exit(1);
}
const path='custom_components/nightwave/manifest.json';
const manifest=JSON.parse(readFileSync(path,'utf8'));
manifest.documentation=`https://github.com/${repo}#readme`;
manifest.issue_tracker=`https://github.com/${repo}/issues`;
manifest.codeowners=[maintainer.startsWith('@')?maintainer:'@'+maintainer];
writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');
console.log('Updated publication metadata for '+repo);
