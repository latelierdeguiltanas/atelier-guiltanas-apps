'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const files=['ability-runtime.js','permanent-rules.js','path-calculations.js','prestige-rules.js'],endMarker="})(typeof window==='undefined'?globalThis:window);",modules=files.map(f=>fs.readFileSync(root+'/rules/'+f,'utf8').trimEnd()).join('\n')+'\n';
for(const filename of ['index.html']){const p=root+'/'+filename,html=fs.readFileSync(p,'utf8'),start=html.indexOf("(function(root){'use strict';",html.indexOf('id="FOH_ENGINE_BUNDLE"'));if(start<0)throw Error('Bundle absent');let end=start;for(let n=0;n<(html.includes('root.FOHPrestigeRules=api;')?4:3);n++){end=html.indexOf(endMarker,end);if(end<0)throw Error('Fin de module absente');end+=endMarker.length;}fs.writeFileSync(p,html.slice(0,start)+modules+html.slice(end));}
// The published index.html is the only bundle target.
