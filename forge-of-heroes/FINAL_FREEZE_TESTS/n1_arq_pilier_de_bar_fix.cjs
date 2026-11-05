'use strict';
/**
 * COF2 Livre de base, p.64 : "Pilier de bar" (voie du Mercenaire, Arquebusier)
 * exige 1d4° DM non létaux aux mains nues, et non 1d4 ordinaire.
 * Réparation atomique du seul champ de mécanique de la DB embarquée.
 * Aucun changement de règles, de mise en page ou de métadonnées implicite.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'), files=['index.html'];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const report={schema:'FOH_N1_PILIER_DE_BAR_SOURCE_CORRECTION',source:'COF2 Livre de base p.64',expected:'1d4° DM non létaux à mains nues',status:'PASS',products:[],failures:[]};
const idrx=/"id"\s*:\s*"(ability:pilier-de-bar:[^"]+)"/g;
const abilityTag=/<script\b[^>]*\bid=["']FOH_DB_JSON["'][^>]*>([\s\S]*?)<\/script>/i;
const profile='class:arquebusier:cof2-lb-2024';
const actions=[];
for(const file of files){
 const fp=path.join(root,file),html=fs.readFileSync(fp,'utf8'),m=abilityTag.exec(html);
 assert.ok(m,'DB embarquée introuvable dans '+file);
 let dbRaw=m[1],original=JSON.parse(dbRaw);
 const matches=[...dbRaw.matchAll(idrx)].filter(x=>x[1].includes('voie-du-mercenaire'));
 const rows=original.tables.abilities_class.filter(x=>matches.some(m=>m[1]===x.id)&&x.rank===1&&x.mechanics?.effects?.some(e=>e.type==='weapon_damage_override'&&e.weaponId==='weapon:unarmed'));
 assert.ok(rows.length>=1,'Aucun Pilier de bar mécanique dans '+file);
 const expectedDb=JSON.parse(JSON.stringify(original));
 const previous=rows.map(x=>({id:x.id,formula:x.mechanics.effects.find(e=>e.type==='weapon_damage_override').formula}));
 let nextHtml=html,changed=false;
 // Traitement inverse des positions pour maintenir les indices de la source.
 for(const hit of [...matches].reverse()){
  const originalRow=rows.find(x=>x.id===hit[1]);
  if(!originalRow)continue;
  const start=dbRaw.lastIndexOf('{',hit.index);
  assert.ok(start>=0,'Début de capacité absent');
  let depth=0,inStr=false,escaped=false,end=-1;
  for(let i=start;i<dbRaw.length;i++){
   const ch=dbRaw[i];
   if(inStr){if(escaped)escaped=false;else if(ch==='\\')escaped=true;else if(ch==='"')inStr=false;continue;}
   if(ch==='"'){inStr=true;continue;}
   if(ch==='{')depth++;else if(ch==='}'&&!--depth){end=i+1;break;}
  }
  assert.ok(end>start,'Fin de capacité absente');
  const rowRaw=dbRaw.slice(start,end),oldRow=JSON.parse(rowRaw);
  assert.equal(oldRow.id,hit[1]);assert.equal(oldRow.rank,1);
  const effect=oldRow.mechanics.effects.filter(e=>e.type==='weapon_damage_override'&&e.weaponId==='weapon:unarmed');
  assert.equal(effect.length,1);
  assert.ok(['1d4','1d4°'].includes(effect[0].formula),'Formule inconnue : '+effect[0].formula);
  if(effect[0].formula!=='1d4')continue;
  const re=/"type"\s*:\s*"weapon_damage_override"\s*,\s*"weaponId"\s*:\s*"weapon:unarmed"\s*,\s*"formula"\s*:\s*"1d4"/g;
  assert.equal([...rowRaw.matchAll(re)].length,1,'Mécanique introuvable ou ambiguë');
  const newRow=rowRaw.replace(re,x=>x.replace(/"1d4"\s*$/,'"1d4°"'));
  assert.equal(JSON.parse(newRow).mechanics.effects.find(e=>e.type==='weapon_damage_override').formula,'1d4°');
  dbRaw=dbRaw.slice(0,start)+newRow+dbRaw.slice(end);
  expectedDb.tables.abilities_class.find(a=>a.id===hit[1]).mechanics.effects.find(e=>e.type==='weapon_damage_override').formula='1d4°';
  changed=true;
 }
 assert.equal(JSON.stringify(expectedDb),JSON.stringify(JSON.parse(dbRaw)),'Seules les capacités ciblées doivent changer');
 if(changed)nextHtml=html.replace(m[1],dbRaw);
 // Refuser une version verte si le moteur ne répercute pas effectivement la formule dans l'attaque.
 if(changed)fs.writeFileSync(fp,nextHtml);
 const {db,engine:E}=load(fp),t=db.tables,p=t.paths_class.find(x=>x.classId===profile&&x.id.includes('voie-du-mercenaire'));
 assert.ok(p,'Voie du Mercenaire absente');
 const s=standardState(db,profile,p.id),v=E.computeCharacterN1(s);
 assert.equal(v.errors.length,0,'Création rejetée : '+file+' '+v.errors.join(' | '));
 const attack=v.sticky.attacks.find(x=>x.weaponId==='weapon:unarmed');
 assert.ok(attack,'Attaque à mains nues introuvable');
 assert.equal(attack.damage,'1d4°','Le moteur ne restitue pas le dé explosif pour '+file);
 assert.ok(attack.properties?.includes('temporary_damage'),'La nature non létale doit être conservée');
 const restored=E.computeCharacterN1(E.restoreHeroSavePayload(JSON.parse(JSON.stringify(E.createHeroSavePayload(s,v.sticky.characterState,{id:'n1-pilier-' + file})))).draft);
 assert.equal(restored.errors.length,0,'Sauvegarde/reprise échouée');
 assert.equal(restored.sticky.attacks.find(x=>x.weaponId==='weapon:unarmed').damage,'1d4°','La sauvegarde a perdu le dé explosif');
 report.products.push({file,changed,previous,expected:'1d4°',attack:attack.damage,nonLethal:true,saveReload:'PASS',beforeSha256:sha(html),afterSha256:sha(nextHtml)});
 console.log(file+': '+(changed?'CORRIGÉ':'déjà corrigé')+' -> '+attack.damage+', sauvegarde OK');
}
fs.mkdirSync(path.join(root,'QA/N1'),{recursive:true});
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-pilier-de-bar-fix.json'),JSON.stringify(report,null,2)+'\n');
console.log('PASS : '+report.products.length+' produits, exactitude COF2 p.64 et sauvegarde/reprise.');
