'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const F=require('./forge_product_runner');
const file='forge-of-heroes/index.html';
const {html,db,engine}=F.load(file);
const profile='class:barbare:cof2-lb-2024';
const pagne='classpath:voie-du-pagne:class-barbare:cof2-lb-2024';
const stone=db.tables.abilities_class.find(a=>a.path_id===pagne&&a.rank===2);
const tattoo=db.tables.abilities_class.find(a=>a.path_id===pagne&&a.rank===3);
const state=F.withRank(db,F.standardState(db,profile,pagne),pagne,3);
state.abilityChoices[stone.id]={defenseStat:'AGI'};
const expected=['FOR','CON','AGI','PER','CHA','INT','VOL'];
const tattooBonuses=r=>r.sticky.skillBonuses.filter(x=>x.sourceAbilityId===tattoo.id).map(x=>[x.tests[0],x.value]);
const copy=x=>JSON.parse(JSON.stringify(x));
const options=engine.getPersistentChoicesForAbility(state,tattoo.id).find(x=>x.id==='tattooStat');
assert.deepEqual(copy(options.options.map(x=>x.id)),expected);

const legacy=engine.computeCharacterN1(state);
assert.deepEqual(copy(legacy.errors),[]);
assert.deepEqual(copy(tattooBonuses(legacy)),[]);

for(const stat of expected){
 state.abilityChoices[tattoo.id]={tattooStat:stat};
 const result=engine.computeCharacterN1(state);
 assert.deepEqual(copy(result.errors),[]);
 assert.deepEqual(copy(tattooBonuses(result)),[[stat,3]]);
 assert.deepEqual(copy(result.sticky.caracs),copy(legacy.sticky.caracs));
 assert.deepEqual(copy(result.sticky.characterState.derived),copy(legacy.sticky.characterState.derived));
 const saved=engine.createHeroSavePayload(state,result.sticky.characterState,{id:'barbare-tatouages'});
 const reopened=engine.computeCharacterN1(engine.restoreHeroSavePayload(copy(saved)).draft);
 assert.deepEqual(copy(reopened.errors),[]);
 assert.deepEqual(copy(tattooBonuses(reopened)),[[stat,3]]);
}
state.abilityChoices[tattoo.id]={tattooStat:'INVALIDE'};
assert.match(engine.computeCharacterN1(state).errors.join(' '),/Tatouages.*choix illégale/i);

const capped=F.withRank(db,F.standardState(db,profile,pagne,'people:nain:cof2-lb-2024'),pagne,2);
capped.serieId='specialiste';
capped.baseCaracs={for:2,agi:1,con:4,per:0,int:0,vol:-1,cha:-1};
capped.peupleChoices={bonusStat:'con',malusStat:'agi'};
capped.equip.gmApprovedSwap=true;
const armorCaps=[];
for(const [armor,stat,defense] of [
 ['cuir-simple','CON',17],['cuir-simple','AGI',11],
 ['chemise-de-mailles','CON',18],['chemise-de-mailles','AGI',13]
]){
 capped.equip.armorId='armor:'+armor+':cof2-lb-2024';
 capped.abilityChoices[stone.id]={defenseStat:stat};
 const r=engine.computeCharacterN1(capped);
 assert.deepEqual(copy(r.errors),[]);
 assert.equal(r.sticky.caracs.con,5);
 assert.equal(r.sticky.DEF,defense);
 armorCaps.push({armor,stat,defense});
}

const report={status:'PASS',source:'COF2 Livre de base p.80',choices:expected,reopened:7,armorCaps,legacyWithoutChoice:true,invalidRejected:true,indexSha256:createHash('sha256').update(html).digest('hex')};
fs.writeFileSync('forge-of-heroes/QA/N1/barbare-tattoo.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
