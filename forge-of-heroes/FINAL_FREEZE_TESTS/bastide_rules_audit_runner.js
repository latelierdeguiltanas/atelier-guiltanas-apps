'use strict';
// Audit of the recovered table state, not proof of unseen creation choices.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {load}=require('./forge_product_runner');const file=path.resolve(__dirname,'../index.html'),{html,db}=load(file),t=db.tables||db;
const seeds=JSON.parse(html.match(/<script[^>]*id="FOH_BASTIDE_SEEDS"[^>]*>([\s\S]*?)<\/script>/)[1]);
const armor={prepotante:2,scanlan:0,wilfried:4,vivelame:3,zepheline:0,faelar:3};
let count=0;
for(const h of seeds){const s=h.recovery.character,m=h.recovery.mapping,rule=t.people_rules.find(r=>r.peopleId===m.peopleId),abilities=s.paths.flatMap(p=>p.ranks.filter(r=>r.owned).map(r=>({...r,pathId:p.pathId,kind:p.kind}))),mage=m.familyId==='mage',mystic=m.familyId==='mystique';
 const basePV=mage?6:m.familyId==='combattant'?10:8;
 assert.equal(s.combat.pvMax,basePV+s.stats.CON,h.name+' PV');
 assert.equal(s.combat.pcMax,2+s.stats.CHA+(m.familyId==='aventurier'?1:0)+(s.people==='Humain'?1:0),h.name+' PC');
 assert.equal(s.combat.recoveryMax,2+s.stats.CON+(mystic?1:0),h.name+' DR');
 const spellCount=abilities.filter(r=>{const a=t.abilities_class.find(a=>a.id===r.abilityId);return a&&(a.mechanics?.kind==='spell'||/\*/.test(a.label));}).length;
 assert.equal(s.combat.pmMax,spellCount?s.stats.VOL+spellCount:0,h.name+' PM');
 const sed=s.paths.find(p=>p.pathId?.includes('voie-de-la-seduction')),rank=sed?Math.max(...sed.ranks.filter(r=>r.owned).map(r=>r.rank)):0;
 const bareBonus=armor[s.id]===0&&rank>=2?Math.min(s.stats.CHA,rank):0;
 const raceDEF=s.people==='Halfelin'?1:Number(rule?.passive?.defBonus||0),air=abilities.some(r=>r.rank===1&&r.pathId?.includes('voie-de-l-air'))?1:0;
 assert.equal(s.combat.def,10+s.stats.AGI+armor[s.id]+(s.id==='wilfried'?1:0)+raceDEF+bareBonus+air,h.name+' DEF');
 const gob=s.people==='Gobelin'?3:0,archer=abilities.some(r=>r.rank===1&&r.pathId?.includes('voie-de-l-archer'))?1:0;
 assert.equal(s.combat.init,10+s.stats.PER+gob+archer+air,h.name+' INIT');
 for(const [key,stat] of [['contact','FOR'],['distance','AGI'],['magic','VOL']])assert.equal(s.combat[key],1+s.stats[stat],h.name+' '+key);
 const pointCost=abilities.filter(r=>r.kind==='profile').reduce((n,r)=>n+(r.rank>=3?2:1),0)+abilities.filter(r=>r.kind==='people'&&r.rank>1).reduce((n,r)=>n+(r.rank>=3?2:1),0)+abilities.filter(r=>r.kind==='history'&&r.rank>1).length;
 const history=s.paths.some(p=>p.kind==='history'&&p.ranks.some(r=>r.owned)),base=history?1:2;
 const extras=pointCost-base-(mage?1:0);
 const age=s.age==='Vénérable'?4:s.age==='Jeune'?0:null;
 if(age!==null)assert.equal(extras,age,h.name+' age budget');
 console.log(JSON.stringify({hero:h.name,derivedValues:'consistent_with_recorded_equipment_and_Forge_adaptations',additionalPoints:extras,age:s.age||'NOT_RECORDED',inferredAge:s.id==='scanlan'?'Mûr (2 points), not independently confirmed':null,creationChoices:'NOT_RECOVERED',strictOfficialCOF2:!['Gobelin','Âme-forgée','Fée'].includes(s.people)?'origin_choices_still_missing':'COF1 adaptation / table approval required'}));count++;
}
console.log(count+' derived-values and recorded-rank-budget audits passed. This is not full creation legality certification.');
