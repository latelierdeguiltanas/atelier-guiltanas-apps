'use strict';
// Book p.64: all 15 allowed R1 grants; thief leather, ranger reinforced leather.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),F=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),clone=x=>JSON.parse(JSON.stringify(x));
const report={schema:'FOH_N1_ARQ_COMBATTANT_GRANTS_ARMOR',at:new Date().toISOString(),source:'COF2 Livre de base p.64 et capacités R1 des Guerrier/Voleur/Rôdeur',scope:'Humain vénérable, 15 choix × armures DEF 1–4 × 2 variantes × 2 produits. Acquisition, restrictions chiffrées ciblées, sauvegarde et changement du don. Pas un certificat de tous les effets des capacités accordées.',passed:0,failed:0,cases:[],products:[],status:'PENDING'};
function fill(E,s){for(let n=0;n<4;n++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});if(c.id==='preferredWeaponCategory'){b[c.id]='swords';s.profileChoices[c.id]='swords';}else if(c.type==='boolean')b[c.id]??=false;else if(c.type==='entity')b[c.id]??={type:'animal',species:'loup',name:'Témoin'};else if(c.type==='weapon_multi')b[c.id]??=c.options.slice(0,Math.max(1,c.min||1)).map(v=>v.id);else if(c.options?.length)b[c.id]??=c.options[0].id;}return s;}
for(const file of ['index.html']){const{db,html,engine:E}=F.load(root+'/'+file),T=db.tables;report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});for(const variant of ['arquebusier','arbaletrier']){
 const p=T.paths_class.find(p=>p.id.includes('voie-du-mercenaire:class-'+variant+':')),base=F.withRank(db,F.standardState(db,p.classId,p.id),p.id,3),grant=E.previewAcquiredAbilities(base).find(a=>a.id.includes('ability:combattant-aguerri:')),choices=E.getPersistentChoicesForAbility(base,grant.id).find(c=>c.id==='combattantAguerriAbility').options;
 assert.equal(choices.length,15);assert(choices.every(c=>/class-(guerrier|voleur|rodeur):/.test(c.id)&&c.id.includes(':rank1:')));
 for(const choice of choices)for(const armorDef of [1,2,3,4]){const row={file,variant,choice:choice.label,armorDef,status:'FAIL'};report.cases.push(row);try{
 const s=clone(base);s.equip.armorId=T.armors.find(a=>a.defBonus===armorDef).id;s.equip.gmApprovedSwap=true;s.abilityChoices[grant.id]={combattantAguerriAbility:choice.id};fill(E,s);
 const result=E.computeCharacterN1(s);assert.equal(result.errors.length,0,result.errors.join(' | '));const r=result.sticky,owned=r.characterState.abilities.find(a=>a.id===choice.id);assert(owned);assert.equal(owned.grantedByAbilityId,grant.id);
 const allowed=choice.id.includes('class-voleur:')?armorDef<=2:choice.id.includes('class-rodeur:')?armorDef<=3:true;
 const isAgile=choice.label==='Agile',baseDEF=10+r.caracs.agi+armorDef+1;
 assert.equal(r.DEF,baseDEF+(isAgile&&allowed?1:0),'DEF includes Mercenary +1 once and Agile when legal');
 if(isAgile)assert.equal(r.INIT,10+r.caracs.per+(allowed?1:0));
 if(choice.label==='Vivacité')assert.equal(r.INIT,10+r.caracs.per+3);
 if(choice.label==='Robustesse')assert.equal(r.PV,8+r.caracs.con+3);
 if(choice.label==='Archer émérite')assert.equal(r.INIT,10+r.caracs.per+(allowed?1:0));
 if(!allowed)assert(!(r.skillBonuses||[]).some(b=>b.sourceAbilityId===choice.id),'Armor disables granted skill bonuses');
 const saved=E.createHeroSavePayload(s,r.characterState,{id:'grant-audit'}),restored=E.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))),back=E.computeCharacterN1(restored.draft);assert.equal(back.errors.length,0);assert.equal(back.sticky.DEF,r.DEF);assert.equal(back.sticky.INIT,r.INIT);assert.equal(back.sticky.PV,r.PV);
 const replacement=choices.find(c=>c.id!==choice.id&&c.label==='Vivacité')||choices.find(c=>c.id!==choice.id);s.abilityChoices[grant.id].combattantAguerriAbility=replacement.id;fill(E,s);const changed=E.computeCharacterN1(s);assert.equal(changed.errors.length,0);assert(!changed.sticky.characterState.abilities.some(a=>a.id===choice.id),'Previous grant must disappear');
 row.status='PASS';report.passed++;
 }catch(e){row.error=String(e);report.failed++;}}
 }}
report.status=report.passed===240&&!report.failed?'PASS':'FAIL';fs.writeFileSync(root+'/QA/N1/arquebusier-grants-armor.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(x=>x.status!=='PASS').slice(0,12)}));if(report.status!=='PASS')process.exitCode=1;
