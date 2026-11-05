'use strict';
// Independent arithmetic from COF2 pp.44-65,87-89,76-77 and advanced ages p.153.
// No expected value calls a production calculation helper.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),F=require('./forge_product_runner'),root=path.resolve(__dirname,'..');
const variants=['arquebusier','arbaletrier'],ages=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]],series=[['expert',{for:3,agi:2,con:1,per:1,int:0,vol:0,cha:-1}],['specialiste',{for:4,agi:2,con:1,per:0,int:0,vol:-1,cha:-1}]],racial={humain:['cha',null],'nain':['con','agi'],'demi-elfe':['per','for'],'demi-orc':['for','cha'],'elfe-haut':['int','for'],'elfe-sylvain':['agi','for'],gnome:['int','for'],halfelin:['agi','for']};
const report={schema:'FOH_N1_ARQ_DERIVED_INDEPENDENT_SOURCE',at:new Date().toISOString(),source:'Livre de base COF2 : familles/caractéristiques/peuples, Arquebusier pp.62–65 et quinze capacités R1 accordées ; âges avancés p.153',scope:'Deux variantes, huit peuples, vingt paires ordonnées, cinq modalités d’âge, deux séries, deux armures, quinze dons et échange PC/DR. Statistiques canoniques et attaques permanentes ; les activations de combat et variantes non exposées ne sont pas certifiées ici.',expected:20480,passed:0,failed:0,saves:0,products:[],perVariant:{},perPeople:{},failures:[],status:'PENDING'};
const signed=n=>n>0?'+'+n:n<0?String(n):'',copy=x=>JSON.parse(JSON.stringify(x));
const limit=Number(process.env.DERIVED_CASE_LIMIT||0);
allCases: for(const file of ['index.html']){const{db,engine:E,html}=F.load(root+'/'+file),T=db.tables;report.products.push({file,sha256:crypto.createHash('sha256').update(html).digest('hex')});
for(const variant of variants){const cls=T.classes.find(c=>c.id.startsWith('class:'+variant+':')),paths=T.paths_class.filter(p=>p.classId===cls.id&&!p.additionalMagePath),sl=p=>p.id.split(':')[1],ability=(p,n)=>T.abilities_class.find(a=>a.path_id===p.id&&a.rank===n),merc=paths.find(p=>sl(p)==='voie-du-mercenaire'),grantId=ability(merc,3).id;
const grants=T.abilities_class.filter(a=>a.rank===1&&/class-(guerrier|voleur|rodeur):cof2-lb-2024$/.test(a.path_id));assert.equal(grants.length,15);
for(const race of Object.keys(racial))for(const first of paths)for(const second of paths.filter(p=>p.id!==first.id))for(const[age,youngChoice]of ages)for(const[serie,base]of series)for(const armor of [0,4]){
 const options=sl(first)==='voie-du-mercenaire'&&age==='venerable'?[...grants.map(a=>({a,swap:false})),{a:grants.find(a=>a.id.startsWith('ability:eclaireur:')),swap:true}]:[{a:null,swap:false}];
 for(const opt of options){if(limit&&report.passed+report.failed>=limit)break allCases;const tag=[file,variant,race,sl(first),sl(second),age,youngChoice||'',serie,armor,opt.a?.label||'',opt.swap].join('|');try{
 const s=F.standardState(db,cls.id,first.id,'people:'+race+':cof2-lb-2024');s.voies.profilePathIds=[first.id,second.id];s.serieId=serie;s.baseCaracs={...base};
 const[b,m]=racial[race];s.peupleChoices=race==='humain'?{humainStat:b}:{bonusStat:b,malusStat:m};
 if(race==='demi-elfe')s.voies.peoplePathId='path:voie-de-l-humain:cof2-lb-2024';
 if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.id.startsWith('ability-r1-class-ensorceleur-air-'))?.id;
 const rank1=age==='venerable'?3:age==='mature'?2:1,rank2=age==='mature'||age==='venerable'?2:1;
 s.advancedRules.age=true;s.age={categoryId:age,choice:youngChoice,spending:age==='mature'?[{pathId:first.id,rank:2},{pathId:second.id,rank:2}]:age==='venerable'?[{pathId:first.id,rank:2},{pathId:first.id,rank:3},{pathId:second.id,rank:2}]:[]};
 const rankOf=name=>sl(first)===name?rank1:sl(second)===name?rank2:0;
 const projectile=variant==='arquebusier'?'weapon:powder-pistol':'weapon:hand-crossbow';
 s.equip={...s.equip,gmApprovedSwap:true,armorId:armor?'armor:chemise-de-mailles:cof2-lb-2024':'',shieldId:'',weaponIds:[projectile,'weapon:long-sword','weapon:dagger','weapon:shortbow','weapon:throwing-knives']};
 if(rankOf('voie-de-l-artilleur')>=2)s.abilityChoices[ability(paths.find(p=>sl(p)==='voie-de-l-artilleur'),2).id]={repeatingWeapons:[projectile]};
 if(rankOf('voie-du-maitre-d-armes')){const a=ability(paths.find(p=>sl(p)==='voie-du-maitre-d-armes'),1);s.abilityChoices[a.id]={preferredWeaponCategory:'crossbows'};s.profileChoices.preferredWeaponCategory='crossbows';}
 if(opt.a){s.abilityChoices[grantId]={combattantAguerriAbility:opt.a.id};if(opt.a.id.startsWith('ability:armes-de-predilection:'))s.abilityChoices[opt.a.id]={preferredWeaponCategory:'swords'};if(opt.a.id.startsWith('ability:eclaireur:'))s.abilityChoices[opt.a.id]={traqueurSwap:opt.swap};}
 const result=E.computeCharacterN1(s);assert.equal(result.errors.length,0,result.errors.join('; '));const st=result.sticky,c={...base};c[b]++;if(m)c[m]--;if(age==='mature'||age==='venerable')c.agi--;if(age==='venerable')c.con--;
 assert.deepEqual(copy(st.caracs),c,'Final characteristics');
 const slug=opt.a?.id.split(':')[1]||'',active=!!opt.a&&(!opt.a.path_id.includes('class-voleur:')||armor<=2)&&(!opt.a.path_id.includes('class-rodeur:')||armor<=3),has=x=>active&&slug===x;
 const expected={PV:8+c.con+(has('robustesse')?3:0),PC:3+c.cha+(['humain','demi-elfe'].includes(race)?1:0)+(youngChoice==='PC'?1:0)-(has('eclaireur')&&opt.swap?1:0),PM:race==='gnome'?Math.max(0,1+c.vol):0,DEF:10+c.agi+armor+(race==='halfelin'?1:0)+(race==='gnome'?1:0)+(rankOf('voie-du-mercenaire')>=3?1:0)+(has('agile')?1:0),INIT:10+c.per+(age==='very-young'?-1:0)+(race==='gnome'?1:0)+(has('agile')?1:0)+(has('vivacite')?3:0)+(has('archer-emerite')?1:0)+(has('attaque-en-finesse')?c.agi:0),DR:{count:2+c.con+(youngChoice==='DR'?1:0)+(has('eclaireur')&&opt.swap?1:0),die:8},ATC:1+c.for,ATD:1+c.agi,ATM:1+c.vol};
 for(const k of ['PV','PC','PM','DEF','INIT'])assert.equal(st[k],expected[k],k);assert.deepEqual(copy(st.DR),expected.DR);assert.deepEqual(copy(st.characterState.derived),expected,'Saved canonical derived values');
 const powder=rankOf('voie-des-explosifs')>=3,precise=rankOf('voie-de-la-precision')>=3,master=rankOf('voie-du-maitre-d-armes');
 for(const a of st.attacks){const ranged=a.type==='distance',unarmed=a.weaponId==='weapon:unarmed',w=T.weapons_n1.find(w=>w.id===a.weaponId);assert(w,'Unknown attack');const crossbow=w.category==='crossbow',isPowder=w.category==='powder',dagger=a.weaponId==='weapon:dagger',knife=a.weaponId==='weapon:throwing-knives',sword=a.weaponId==='weapon:long-sword',bow=w.category==='bow';
 const atk=1+(ranged?c.agi:dagger&&has('attaque-en-finesse')?Math.max(c.agi,c.for):c.for)+(crossbow&&master?1:0)+(sword&&has('armes-de-predilection')?1:0);
 assert.equal(a.attackBonus,atk,'Attack '+a.label);
 let damage=unarmed?'1d4°':ranged?dagger?'1d4':w.damage:w.damage+signed(c.for);
 const extra=(isPowder&&powder?1:0)+(crossbow&&master>=3?1:0)+(ranged&&(dagger||knife)&&has('doigts-agiles')?1:0)+(bow&&has('archer-emerite')?c.per:0);
 damage+=signed(extra);assert.equal(a.damage,damage,'Damage '+a.label);
 const range=ranged?(dagger?5:w.rangeMeters)+(isPowder&&powder?10:0):null;assert.equal(a.rangeMeters,range,'Range '+a.label);
 assert.equal(a.criticalThreshold,20-(ranged&&precise?1:0)-(crossbow&&master>=2?1:0),'Critical '+a.label);assert.equal(!!a.tags?.includes('magical_projectile'),!!(isPowder&&powder),'Projectile '+a.label);
 }
 if((report.passed+report.failed)%97===0){const back=E.computeCharacterN1(E.restoreHeroSavePayload(copy(E.createHeroSavePayload(s,st.characterState,{id:'derived-source'}))).draft);assert.equal(back.errors.length,0);assert.deepEqual(copy(back.sticky.characterState.derived),expected);report.saves++;}
 report.passed++;report.perPeople[race]=(report.perPeople[race]||0)+1;report.perVariant[variant]=(report.perVariant[variant]||0)+1;
 }catch(e){report.failed++;if(report.failures.length<40)report.failures.push({tag,error:String(e),actual:e.actual,expected:e.expected});}}
}
console.log(file+' '+variant+' '+report.passed+' PASS / '+report.failed+' FAIL');
}}
report.status=report.passed===report.expected&&!report.failed?'PASS':limit&&!report.failed?'PARTIAL_DIAGNOSTIC':'FAIL';fs.writeFileSync(root+'/QA/N1/arquebusier-derived-source.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,expected:report.expected,passed:report.passed,failed:report.failed,saves:report.saves,failures:report.failures.slice(0,15)}));if(report.status==='FAIL')process.exitCode=1;
