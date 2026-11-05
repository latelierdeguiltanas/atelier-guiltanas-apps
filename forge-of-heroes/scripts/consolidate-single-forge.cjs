'use strict';
/* Migration atomique en CI : une seule Forge, celle publiée dans index.html.
   Aucun fichier HTML de production n'est modifié par ce script. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),forge=path.join(root,'forge-of-heroes');
const index=path.join(forge,'index.html'),legacy='FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html';
const oldHtml=path.join(forge,legacy);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(!fs.existsSync(index))throw Error('Published index.html missing');
const before=hash(index),changes=[];
function walk(p){if(!fs.existsSync(p))return[];return fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>{const f=path.join(p,x.name);return x.isDirectory()?walk(f):x.isFile()?[f]:[]});}
for(const p of [...walk(path.join(root,'.github','workflows')),...walk(forge)]){
 if(!/\.(?:cjs|mjs|js|yml|yaml)$/i.test(p))continue;
 const old=fs.readFileSync(p,'utf8');
 if(!old.includes(legacy))continue;
 let s=old.replaceAll(legacy,'index.html');
 // Some test loops used to run both HTMLs. They now run exactly one HTML.
 s=s.replace(/(['"])index\.html\1\s*,\s*(['"])index\.html\2/g,'$1index.html$1');
 s=s.replace(/(forge-of-heroes\/index\.html)(?:[ \t]+\1)+/g,'$1');
 if(p.endsWith('/forge-of-heroes/scripts/sync-rule-bundles.cjs')){
  const cut=s.indexOf('// Both products execute the same rules');
  if(cut<0)throw Error('Sync bundle structure changed unexpectedly');
  s=s.slice(0,cut)+'// The published index.html is the only bundle target.\n';
 }
 if(p.endsWith('/forge-of-heroes/FINAL_FREEZE_TESTS/n1_version_parity.cjs')){
  s=[
   "'use strict';",
   "const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');",
   "const root=path.resolve(__dirname,'..'),qa=path.join(root,'QA/N1');",
   "const hash=s=>crypto.createHash('sha256').update(s).digest('hex');",
   "const html=fs.readFileSync(path.join(root,'index.html'),'utf8');",
   "const matrix=JSON.parse(fs.readFileSync(path.join(qa,'matrix.json'),'utf8'));",
   "const regression=JSON.parse(fs.readFileSync(path.join(qa,'regressions.json'),'utf8'));",
   "const extract=id=>{const start=html.indexOf('id=\"'+id+'\"');if(start<0)throw Error('Missing '+id);const a=html.indexOf('>',start)+1,b=html.indexOf('</script>',a);if(b<a)throw Error('Malformed '+id);return html.slice(a,b)};",
   "const sig={index:hash(html),engine:hash(extract('FOH_ENGINE_BUNDLE')),database:hash(extract('FOH_DB_JSON'))};",
   "const checks={matrixEngineIdentical:sig.engine===matrix.inputs.engineSha256,matrixDbIdentical:sig.database===matrix.inputs.databaseSha256,regressionIndexIdentical:sig.index===regression.indexSha256,matrixNoAssertionFailure:(matrix.assertionFailures||[]).length===0,regressionsPass:regression.passed===regression.total};",
   "const report={schema:'FOH_N1_SINGLE_PRODUCT_VALIDATION',generatedAt:new Date().toISOString(),publishedProduct:'forge-of-heroes/index.html',current:sig,oldMatrix:matrix.inputs,checks,matrixMechanicsReusable:checks.matrixEngineIdentical&&checks.matrixDbIdentical&&checks.matrixNoAssertionFailure,limitations:'Only matching engine and database allow reuse of historical matrix proofs. UI, PDF and Android need separate current evidence.'};",
   "fs.writeFileSync(path.join(qa,'version-parity.json'),JSON.stringify(report,null,2)+'\\n');",
   "console.log(JSON.stringify(report,null,2));"
  ].join('\n')+'\n';
 }
 if(s!==old){fs.writeFileSync(p,s);changes.push(path.relative(root,p));}
}
if(fs.existsSync(oldHtml)){fs.unlinkSync(oldHtml);changes.push(path.relative(root,oldHtml)+' DELETED');}
const manifest=path.join(forge,'FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.install.webmanifest');
if(fs.existsSync(manifest)){fs.unlinkSync(manifest);changes.push(path.relative(root,manifest)+' DELETED');}
const readme=path.join(forge,'README.md');
fs.writeFileSync(readme,[
 '# Forge of Heroes — source unique',
 '',
 'Une seule Forge de production et de test : forge-of-heroes/index.html.',
 'Cette entrée GitHub Pages est la seule à recevoir les corrections et les recettes.',
 'Les tests du moteur, les vrais clics et les exports officiels doivent cibler cette entrée.',
 '',
 'FINAL_FREEZE_TESTS et QA conservent les tests et rapports, sans HTML alternatif.',
 'Les rapports anciens qui évoquent un produit maître sont des preuves historiques.',
 'Ils ne certifient pas automatiquement la version actuellement publiée.',
 'Ne pas régénérer un second HTML pour la validation.',
 'Le N1 général reste ouvert jusqu’à clôture indépendante de toutes ses réserves.',
 ''
].join('\n'));
changes.push(path.relative(root,readme));
const suivi=path.join(forge,'SUIVI_VALIDATION.md'),previous=fs.readFileSync(suivi,'utf8');
if(!previous.startsWith('# Architecture Forge unique')){
 fs.writeFileSync(suivi,[
  '# Architecture Forge unique — 5 novembre 2026',
  '',
  'Seule Forge utilisée et testée : forge-of-heroes/index.html.',
  'Tous les tests et correctifs doivent viser exactement cette entrée publiée.',
  'Les mentions « deux produits » ci-dessous sont des notes de recette historiques.',
  'Le produit maître alternatif a été supprimé sans toucher au code du produit publié.',
  'Les anciens certificats liés au maître ne valent pas validation du fichier courant.',
  'Cette consolidation ne clôture pas à elle seule les réserves N1.',
  '',
  '---',
  ''
 ].join('\n')+previous);
 changes.push(path.relative(root,suivi));
}
if(hash(index)!==before)throw Error('STOP: published Forge index.html was modified');
if(fs.existsSync(oldHtml))throw Error('STOP: old Forge HTML still exists');
const refs=[...walk(path.join(root,'.github','workflows')),...walk(forge)]
 .filter(p=>/\.(?:cjs|mjs|js|yml|yaml)$/i.test(p)&&fs.readFileSync(p,'utf8').includes(legacy))
 .map(p=>path.relative(root,p));
if(refs.length)throw Error('STOP: active legacy references: '+refs.join(', '));
console.log(JSON.stringify({status:'SINGLE_PRODUCT_PREPARED',canonical:'forge-of-heroes/index.html',indexSha256:before,changed:changes},null,2));
