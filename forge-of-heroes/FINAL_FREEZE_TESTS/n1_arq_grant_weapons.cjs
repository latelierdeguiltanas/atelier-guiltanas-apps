'use strict';
// COF2 p.76-77 thief grants: ranged daggers AND knives; finesse never changes damage stat.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),F=require('./forge_product_runner'),root=path.resolve(__dirname,'..');
const report={schema:'FOH_N1_ARQ_GRANTED_WEAPON_NUMERICS',at:new Date().toISOString(),scope:'Humain vénérable, Doigts agiles / Attaque en finesse / Armes de prédilection, quatre armures, deux variantes, deux produits. Oracle source des bonus de dommages, caractéristique d’attaque et catégories.',source:'COF2 Livre de base, Combattant aguerri p.64 et voies du roublard/spadassin/maître d’armes',passed:0,failed:0,cases:[],products:[],status:'PENDING'};
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){const{db,engine:E,html}=F.load(root+'/'+file),T=db.tables;report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});for(const variant of ['arquebusier','arbaletrier'])for(const slug of ['doigts-agiles','attaque-en-finesse','armes-de-predilection'])for(const armorDef of [1,2,3,4]){
 const row={file,variant,slug,armorDef,status:'FAIL'};report.cases.push(row);try{
 const p=T.paths_class.find(p=>p.id.includes('voie-du-mercenaire:class-'+variant+':')),s=F.withRank(db,F.standardState(db,p.classId,p.id),p.id,3);
 s.baseCaracs={for:1,agi:3,con:1,per:2,int:0,vol:0,cha:-1};s.peupleChoices={humainStat:'cha'};
 const grant=E.previewAcquiredAbilities(s).find(a=>a.id.includes('ability:combattant-aguerri:')),ability=T.abilities_class.find(a=>a.id.startsWith('ability:'+slug+':')&&a.path_id.includes('class-'+(slug==='armes-de-predilection'?'guerrier':'voleur')+':'));
 s.abilityChoices[grant.id]={combattantAguerriAbility:ability.id};s.equip={...s.equip,gmApprovedSwap:true,armorId:T.armors.find(a=>a.defBonus===armorDef).id,weaponIds:['weapon:dagger','weapon:throwing-knives','weapon:long-sword']};
 for(let n=0;n<3;n++)for(const a of E.previewAcquiredAbilities(s))for(const c of E.getPersistentChoicesForAbility(s,a.id)){const b=s.abilityChoices[a.id]||(s.abilityChoices[a.id]={});if(c.id==='repeatingWeapons')b[c.id]=['weapon:dagger'];else if(c.id==='preferredWeaponCategory'){b[c.id]='swords';s.profileChoices[c.id]='swords';}else if(c.options?.length)b[c.id]??=c.options[0].id;}
 const r=E.computeCharacterN1(s);assert.equal(r.errors.length,0,r.errors.join('; '));const st=r.sticky,a=(id,mode)=>st.attacks.find(a=>a.weaponId===id&&a.type===mode),active=slug==='armes-de-predilection'||armorDef<=2;
 const dagger=a('weapon:dagger','contact'),thrown=a('weapon:dagger','distance'),knives=a('weapon:throwing-knives','distance'),sword=a('weapon:long-sword','contact');assert(dagger&&thrown&&knives&&sword);
 const damageBonus=slug==='doigts-agiles'&&active?'+1':'';assert.equal(thrown.damage,'1d4'+damageBonus,'Thrown dagger');assert.equal(knives.damage,'1d4'+damageBonus,'Thrown knives');
 assert.equal(dagger.damage,'1d4+'+st.caracs.for,'Melee damage still uses FOR');
 assert.equal(dagger.attackBonus,1+st.caracs[slug==='attaque-en-finesse'&&active?'agi':'for'],'Finesse attack characteristic');
 assert.equal(sword.attackBonus,1+st.caracs.for+(slug==='armes-de-predilection'?1:0),'Preferred sword category only');
 row.status='PASS';report.passed++;
 }catch(e){row.error=String(e);report.failed++;}
}}
report.status=report.passed===48&&!report.failed?'PASS':'FAIL';fs.writeFileSync(root+'/QA/N1/arquebusier-grants-weapons.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,failures:report.cases.filter(c=>c.status!=='PASS').slice(0,8)}));if(report.status!=='PASS')process.exitCode=1;
