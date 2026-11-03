'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),h=fs.readFileSync(path.join(root,'index.html'),'utf8');
const m=h.match(/<script[^>]*id="FOH_ENGINE_BUNDLE"[^>]*>([\s\S]*?)<\/script>/);
if(!m)throw Error('No engine');const s=m[1],queries=['Bouclier interdit par le profil','profile_rules','shieldForbidden','shieldAllowed','powder','masteries','mastered','category===\'powder\'','weapon:powder-pistol','masteredByProfile','hybrid?.enabled'];
const findings={engineLength:s.length};
for(const token of queries){
 const hits=[];let i=-1;
 while((i=s.indexOf(token,i+1))>=0){if(hits.length<12)hits.push({at:i,near:s.slice(Math.max(0,i-430),Math.min(s.length,i+710))})}
 findings[token]=hits;
}
for(const token of ['const mw=rule.masteries.weapons||{};','if(shieldId&&rule.masteries.shields===\'none\')','const rule=Data.getProfileRule','let mastered=false;']){
 const at=s.indexOf(token);
 findings['FULL:'+token]=at>=0?{at,near:s.slice(Math.max(0,at-1000),Math.min(s.length,at+3200))}:null;
}
const x={};
for(const token of ['validateProfileEquipmentN1(','__hybridEquipment','state.hybrid=','hybrid:','buildHybridCharacterN1']){
 let pos=-1,n=0;const hits=[];
 while((pos=s.indexOf(token,pos+1))>=0){if(n++<8)hits.push({at:pos,near:s.slice(Math.max(0,pos-750),pos+1050)});}
 x[token]=hits;
}
console.log(JSON.stringify({engineLength:findings.engineLength,callSites:x},null,2).slice(0,29000));
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-mercenary-engine-anchors.json'),JSON.stringify(findings,null,2)+'\n');
