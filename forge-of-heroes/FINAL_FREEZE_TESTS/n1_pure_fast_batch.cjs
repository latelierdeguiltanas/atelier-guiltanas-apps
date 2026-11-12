'use strict';
/* Production accelerated BASE COF2 pure-profile matrix; one profile per run.
 * Every age option, legal pair, eight races, stat choices and demi-elf ancestry,
 * three *distinct* actual characteristic series. Both production standalone builds.
 * This is NOT a complete profile certificate: contextual combat, equipment,
 * acquisition special choices, all roll/purchase distributions and PDF separate.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const profileLabel=process.argv.find(x=>x.startsWith('--profile='))?.split('=').slice(1).join('=')||'Arquebusier';
const representative=process.argv.includes('--representative');
const series={polyvalent:{for:2,agi:2,con:2,per:1,int:1,vol:0,cha:-1},expert:{for:3,agi:2,con:1,per:1,int:0,vol:0,cha:-1},specialiste:{for:4,agi:2,con:1,per:0,int:0,vol:-1,cha:-1}};
const races=['humain','nain','demi-elfe','demi-orc','elfe-haut','elfe-sylvain','gnome','halfelin'],stats=['for','agi','con','per','int','vol','cha'];
const ages=[['young',null],['very-young','PC'],['very-young','DR'],['mature',null],['venerable',null]];
const report={schema:'FOH_N1_PURE_BASE_COF2_FAST_BATCH',at:new Date().toISOString(),profile:profileLabel,pureOnly:true,hybridsExcluded:true,companionExcluded:true,scope:representative?'1 version publiée, 8 peuples, 10 paires de voies, 5 modalités d’âge. Une série et un choix de peuple/héritage représentatifs. Pour le Halfelin Barbare, hache simple avec accord du MJ.':'1 published build x 8 peoples x 10 profile-specific pure pairs x 5 age cases x 3 actual distinct book series x racial choices / hereditary paths. Includes acquired-rank and numeric fields with partial save/restore. A Chevalier halfelin uses a short sword and omits the cavalry lance after GM approval.',notCertified:['all stat arrangements','purchase and dice alternatives','all permanent and conditional special choices','all equipment restrictions','all histories','all real browser clicks','real official two-page PDF and annexes'],status:'PENDING',attempts:0,pass:0,rejected:0,failed:0,saves:0,byRace:{},errors:[],sourceHashes:[]};
const clone=x=>JSON.parse(JSON.stringify(x));
function permutations(p,base){
 const sc=p.schema;
 if(sc.type==='stat_mods')return (sc.bonus?.options||[]).flatMap(b=>(sc.malus?.options||[]).map(m=>({bonusStat:b,malusStat:m})));
 if(sc.type==='special'){
  const low=stats.map((k,i)=>({k,v:base[k],i})).sort((a,b)=>a.v-b.v||a.i-b.i);return low.filter(x=>x.v<=low[1].v).map(x=>({humainStat:x.k}));
 }
 throw Error('Unknown race rule '+p.id);
}
function heritagePaths(T,p){
 if(p.id.includes('demi-elfe'))return T.paths_people.filter(q=>['humain','elfe-haut','elfe-sylvain'].some(k=>q.people_id==='people:'+k+':cof2-lb-2024'));
 return T.paths_people.filter(q=>q.people_id===p.id);
}
function fill(E,T,s){
 for(let round=0;round<4;round++)for(const ability of E.previewAcquiredAbilities(s)||[])for(const choice of E.getPersistentChoicesForAbility(s,ability.id)||[]){
  const bag=s.abilityChoices[ability.id]||(s.abilityChoices[ability.id]={});
  if(choice.id==='preferredWeaponCategory'){bag[choice.id]='swords';s.profileChoices[choice.id]='swords';}
  else if(choice.id==='extraLanguage'){bag[choice.id]='celestien';s.profileChoices[choice.id]='celestien';}
  else if(choice.id==='forestChildAbility'){bag[choice.id]=T.abilities_class.find(a=>a.rank===1&&a.path_id.includes('voie-de-la-survie'))?.id;}
  else if(choice.type==='boolean')bag[choice.id]??=false;
  else if(choice.type==='entity')bag[choice.id]??={type:'animal',species:'chat',name:'QA'};
  else if(choice.type==='weapon_multi')bag[choice.id]??=(choice.options||[]).slice(0,Math.max(1,choice.min||1)).map(a=>a.id);
  else if(choice.options?.length)bag[choice.id]??=choice.options[0].id;
 }
 return s;
}
for(const file of ['index.html']){
 const {html,db,engine:E}=load(path.join(root,file)),T=db.tables||db,original=fs.readFileSync(path.join(root,file),'utf8');
 const cls=T.classes.find(c=>c.group==='Base'&&c.label.toLowerCase()===profileLabel.toLowerCase());
 assert(cls,'Unknown pure base profile '+profileLabel);
 const paths=T.paths_class.filter(q=>q.classId===cls.id&&q.group==='Base'&&!q.additionalMagePath);
 assert.equal(paths.length,5,'Exactly five pure paths required');
 const m=id=>original.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))?.[1];
 report.sourceHashes.push({file,htmlSha256:sha(html),engineSha256:sha(m('FOH_ENGINE_BUNDLE')),dbSha256:sha(m('FOH_DB_JSON'))});
 for(const race of races){
  const p=T.peoples.find(q=>q.id==='people:'+race+':cof2-lb-2024');assert(p&&p.group==='Base');
  const routes=heritagePaths(T,p);assert(routes.length,'Missing racial heritage '+race);
  for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)for(const [age,option]of ages)for(const [serie,base]of (representative?Object.entries(series).slice(1,2):Object.entries(series)))for(const racial of (representative?permutations(p,base).slice(0,1):permutations(p,base)))for(const inherited of (representative?routes.slice(0,1):routes)){
    const tag=[file,cls.id,race,i,j,age,option||'',serie,JSON.stringify(racial),inherited.id].join('|');
    report.attempts++;const rp=report.byRace[race]||(report.byRace[race]={attempts:0,pass:0,failed:0,rejected:0});rp.attempts++;
    try{
      const s=standardState(db,cls.id,paths[i].id,p.id);
      s.identite.nom='QA '+tag.slice(0,50);
      s.serieId=serie;s.baseCaracs={...base};s.voies.profilePathIds=[paths[i].id,paths[j].id];
      s.voies.peoplePathId=inherited.id;s.peupleChoices={...racial};
      if(race==='gnome')s.peupleChoices.grantedAbilityId=T.abilities_class.find(a=>a.rank===1&&!s.voies.profilePathIds.includes(a.path_id)&&T.paths_class.some(q=>q.id===a.path_id&&q.classId.includes(':ensorceleur:')))?.id;
      s.advancedRules.age=true;
      const spending=age==='mature'?[{pathId:paths[i].id,rank:2},{pathId:paths[j].id,rank:2}]:age==='venerable'?[{pathId:paths[i].id,rank:2},{pathId:paths[i].id,rank:3},{pathId:paths[j].id,rank:2}]:[];
      const mage=cls.familleId==='mage';
      if(mage&&spending.length){
       s.advancedRules.aLaCarte=true;
       s.aLaCartePurchases=[{type:'skill',skill:'Acrobaties'}];
      }
      s.age={categoryId:age,choice:option,spending:mage?spending.filter(x=>x.pathId!==s.voies.mageRank2PathId||x.rank!==2):spending};
      assert(!s.hybrid?.enabled&&s.profileMode!=='NO_PROFILE','Accidental mixed profile');
      if(race==='halfelin'&&cls.label==='Barbare'){
       s.equip.gmApprovedSwap=true;
       s.equip.weaponIds=s.equip.weaponIds.map(id=>id==='weapon:great-axe'?'weapon:axe':id);
      }
      if(race==='halfelin'&&cls.label==='Chevalier'){
       s.equip.gmApprovedSwap=true;
       s.equip.weaponIds=s.equip.weaponIds.filter(id=>id!=='weapon:cavalry-lance').map(id=>id==='weapon:long-sword'?'weapon:short-sword':id);
      }
      fill(E,T,s);
      const originalDraft=JSON.stringify(s),r=E.computeCharacterN1(s);
      if(r.errors?.length){report.rejected++;rp.rejected++;if(report.errors.length<75)report.errors.push({tag,kind:'REJECTED',error:r.errors});continue}
      assert.equal(JSON.stringify(s),originalDraft,'Mutation of input');
      const st=r.sticky,cs=st?.characterState;assert(cs,'No character state');assert.equal(cs.profileId,cls.id,'Wrong profile');
      const gotRanks=new Map((cs.paths||[]).map(x=>[x.pathId,x.rank]));
      assert.equal(gotRanks.get(paths[i].id),age==='venerable'?3:age==='mature'||mage?2:1,'First rank mismatch');
      assert.equal(gotRanks.get(paths[j].id),age==='venerable'||age==='mature'?2:1,'Second rank mismatch');
      for(const q of [paths[i],paths[j]])assert((st.acquiredAbilities||[]).some(a=>a.pathId===q.id&&a.rank===1),'Missing R1 '+q.label);
      for(const key of ['PV','PC','PM','DEF','INIT'])assert(Number.isFinite(cs.derived?.[key]),'Unbounded '+key);
      const bonus=racial.bonusStat,malus=racial.malusStat,expected={...base};
      if(bonus){expected[bonus]+=p.schema.bonus.value;expected[malus]+=p.schema.malus.value;}
      if(racial.humainStat)expected[racial.humainStat]++;
      const adjustments=age==='mature'?{agi:-1}:age==='venerable'?{agi:-1,con:-1}:{};
      for(const [k,v]of Object.entries(adjustments))expected[k]+=v;
      for(const key of stats)assert.equal(st.caracs[key],expected[key],'Wrong '+key+' for '+race+'/'+age);
      // No global numeric oracle for contextual weapons: those need scenario-specific checks.
      if(cls.label==='Barbare'){
        const rankFor=slug=>gotRanks.get('classpath:'+slug+':class-barbare:cof2-lb-2024')||0;
        const bonusPV=(rankFor('voie-de-la-brute')?expected.for:0)+rankFor('voie-du-pagne')+(rankFor('voie-du-primitif')?1:0);
        assert.equal(st.PV,10+expected.con+bonusPV,'Wrong Barbare PV');
      }else if(cls.label==='Arquebusier'){
        assert.equal(st.PV,8+expected.con,'Wrong base Arquebusier PV');
      }
      if(report.attempts%13===0){
        const saved=E.createHeroSavePayload(s,cs,{id:'fast-'+sha(tag).slice(0,12)});
        const restored=E.restoreHeroSavePayload(clone(saved));
        const replay=E.computeCharacterN1(restored.draft);
        assert.equal(replay.errors.length,0,'Saved hero refused on restoration');
        assert.deepEqual(clone(replay.sticky.characterState.derived),clone(cs.derived),'Derived fields lost on restoration');
        report.saves++;
      }
      report.pass++;rp.pass++;
    }catch(e){report.failed++;rp.failed++;if(report.errors.length<75)report.errors.push({tag,kind:'ASSERTION',error:String(e.stack||e).slice(0,1250)})}
  }
 }
}
if(report.sourceHashes.some(source=>source.dbSha256!==report.sourceHashes[0].dbSha256||source.engineSha256!==report.sourceHashes[0].engineSha256))report.status='FAILED_PARITY';
else report.status=report.failed||report.rejected?'FAILED':'PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED';
const name=profileLabel.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const dest=path.join(root,'QA/N1/pure-profile-'+(representative?'sample-':'fast-')+name+'.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({profile:profileLabel,status:report.status,pass:report.pass,attempts:report.attempts,failed:report.failed,rejected:report.rejected,saves:report.saves,sourceHashes:report.sourceHashes,errors:report.errors.slice(0,6)}).slice(0,5000));
if(report.status!=='PASS_NARROW_PURE_MATRIX_NOT_CERTIFIED')process.exitCode=1;
