(function(root){'use strict';
const STATS=['for','agi','con','per','int','vol','cha'],clone=x=>JSON.parse(JSON.stringify(x));
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^rang \d+ — /,'');
function ruleSet(a){const p=(a.path_id||a.pathId||'').split(':')[1],r=Number(a.rank),name=fold(a.label),rules=[];const add=(key,formula,legacy=0,when=null)=>rules.push({kind:'derived',key,formula,legacy,when});const gain=values=>rules.push({kind:'stats',values});
 const heroic={'force heroique':'for','agilite heroique':'agi','dexterite heroique':'agi','constitution heroique':'con','perception heroique':'per','charisme heroique':'cha','volonte heroique':'vol','ego heroique':'cha'};
 if(heroic[name]){gain({[heroic[name]]:1});rules.push({kind:'bonus_die',stat:heroic[name]});}
 const multi={'voie-du-halfelin':['agi','con'],'voie-du-nain':['con','vol'],'voie-du-demi-orc':['for','con'],'voie-de-l-elfe-sylvain':['agi','per'],'voie-du-gnome':['con','cha'],'voie-de-lâme-forgée':['con','for'],'voie-du-centaure':['con','per'],'voie-du-demi-ogre':['con','for'],'voie-du-gobelin':['agi','con'],'voie-du-kobold':['agi','per'],'voie-de-letre-feerique':['per','cha'],'voie-du-minotaure':['con','for']};
 if(r===5&&(a.path_id||'').startsWith('path:')&&multi[p])gain(Object.fromEntries(multi[p].map(k=>[k,1])));
 if(a.path_id==='history:nomad'&&r===5)gain({per:1});
 if(a.path_id==='history:scholar'&&r===5)gain({int:1});
 if(a.path_id==='history:commoner'&&r===5)gain({con:1});
 if(a.path_id==='history:commoner'&&r===1)add('DR_COUNT','RANG>=4?1:0');
 if(a.path_id==='history:pauper'&&r===2)add('INIT','3');
 if(a.path_id==='history:pauper'&&r===4)add('PV','3');
 if(a.path_id==='history:expert'&&r===5)rules.push({kind:'stat_choice',id:'expertStat',values:['for','agi','int','cha'],amount:1,required:true});
 if(p==='mage'&&r===4){gain({int:1,vol:1});rules.push({kind:'bonus_die',stat:'int'});}
 if(p==='voie-de-l-elfe-haut'&&r===5){gain({vol:1});rules.push({kind:'stat_choice',id:'elfHighStat',values:['int','cha'],amount:1,required:true});}
 if(p==='voie-du-combat-a-deux-armes'&&r===4)rules.push({kind:'stat_choice',id:'heroicCombatStat',values:['agi','for'],amount:1,default:'agi',bonusDieIf:'agi'});
 if(p==='voie-de-l-humain'&&r===5){gain({vol:1});rules.push({kind:'lowest_stat',id:'versatilityStat',amount:1});}
 if(['voie-de-la-maitrise','voie-de-la-meditation','voie-du-vent'].includes(p)&&r===5)rules.push({kind:'lowest_stat',id:'lowestStat',amount:1});
 if((p==='voie-du-metal'&&r===5)||(p==='voie-de-la-sombre-magie'&&r===5)||(p==='voie-de-l-energie-vitale'&&r===5)){gain({con:1});rules.push({kind:'bonus_die',stat:'con'});}
 if(p==='voie-du-metal'&&r===5)add('PM','CON',0,'has_spells');
 if((p==='voie-de-la-divination'&&r===4)||(p==='voie-du-protecteur'&&r===4))add('PM','PER',0,'has_spells');
 if(p==='voie-de-la-seduction'&&r===4)rules.push({kind:'mana_stat_choice',id:'manaStat',default:'vol',values:['vol','cha']});
 if(p==='voie-du-saltimbanque'&&r===2){add('INIT','CHA');add('DEF','RANG>=4?2:1');}
 if(p==='voie-de-l-archer'&&r===1)add('INIT','RANG',1);
 if(p==='voie-du-deplacement'&&r===1){add('DEF','RANG>=5?3:RANG>=3?2:1',1);add('INIT','RANG>=5?3:RANG>=3?2:1',1);}
 if(p==='voie-du-pagne'&&r===1)add('PV','RANG',1);
 if(p==='voie-de-la-resistance'&&r===1)add('PV','RANG+2',3);
 if(p==='voie-du-pourfendeur'&&r===1)add('DEF','RANG>=5?2:1',1);
 if(p==='voie-du-fauve'&&r===1)add('DEF','RANG>=5?3:RANG>=3?2:1',1);
 if(p==='voie-de-la-maitrise'&&r===1)add('DEF','RANG>=4?3:2',2);
 if(p==='voie-du-primitif'&&r===2)add('DEF','ARMOR?1:RANG>=5?3:2');
 if(p==='voie-des-runes'&&r===1)add('DEF','HEAVY_HYBRID?RANG>=4?2:1:RANG>=5?4:RANG>=3?3:2',2);
 if(p==='voie-du-sang'&&r===3)add('DEF','RANG>=5?3:2-0',0,'exsangue');
 if(p==='voie-de-la-spiritualite'&&r===1)add('DEF','RANG>=5?4:RANG>=3?3:2',2,'no_armor');
 if(p==='voie-du-bouclier'&&r===3)add('DEF','RANG>=5?2:1',0,'shield');
 if(p==='voie-de-la-guerre-sainte'&&r===2)add('DEF','RANG>=5?2:1',0,'shield');
 if(p==='voie-du-demon'&&r===3)add('DR_COUNT','VOL');
 if(p==='voie-de-l-empathie'&&r===2)add('DEF','PER');
 if(p==='voie-de-la-telekinesie'&&r===2)add('DEF','RANG');
 if(p==='voie-du-controle-corporel'&&r===3)add('INIT','CHA');
 if((p==='voie-du-mercenaire'&&r===5)||(p==='voie-de-la-resistance'&&r===5)||(p==='voie-du-soldat'&&r===5))add('DEF','1');
 if(p==='voie-du-compagnon-animal'&&r===5)add('DEF','RODEUR_RANK5');
 if(p==='voie-de-la-guerre'&&r===1)add('DEF','CHEVALIER_RANK5',0,'heavy_armor');
 if(p==='voie-du-nain'&&r===2)rules.push({kind:'weapon_bonus',match:'axe_hammer',attack:1,damage:'1',mastery:true});
 if(p==='voie-du-gnome'&&r===4)rules.push({kind:'weapon_bonus',match:'crossbow_powder',damage:'AGI',mastery:true});
 if(p==='voie-du-roublard'&&r===1)rules.push({kind:'weapon_bonus',match:'thrown_knife',damage:'RANG>=5?3:RANG>=3?2:1',legacyDamage:1});
 if(p==='voie-de-la-precision'&&r===3)rules.push({kind:'critical',match:'ranged',amount:'RANG>=5?2:1'});
 if(p==='voie-du-spadassin'&&r===3)rules.push({kind:'critical',match:'light_melee',amount:'2'});
 if(p==='voie-de-la-maitrise'&&r===3)rules.push({kind:'critical',match:'unarmed',amount:'1'});
 if(p==='voie-de-la-brute'&&r===5)rules.push({kind:'critical',match:'melee',amount:'1'});
 if(p==='voie-du-demi-orc'&&r===3)rules.push({kind:'critical',match:'melee',amount:'1'});
 if(p==='voie-de-l-elfe-sylvain'&&r===3)rules.push({kind:'critical',match:'bow',amount:'1',mastery:true});
 if(p==='voie-du-pagne'&&r===5)rules.push({kind:'damage_reduction',value:3,minimumDamage:1,scope:'all'});
 if(p==='voie-du-nain'&&r===4)rules.push({kind:'damage_reduction',formula:'NIVEAU>=10?3:2',minimumDamage:1,scope:'all'});
 return rules;
}
function ownedRules(s,db,state){const t=db.tables||db,by=new Map([...(t.abilities_class||[]),...(t.abilities_people||[]),...(t.abilities_r1_people||[]),...(t.history_abilities||[])].map(a=>[a.id,a])),seen=new Set(),out=[];for(const row of s.acquiredAbilities||[]){if(seen.has(row.id))continue;seen.add(row.id);const ability=by.get(row.id);if(!ability)continue;const inactive=String(ability.path_id||'').includes('class-moine:')&&!!(state.equip?.armorId||state.equip?.shieldId);if(inactive)continue;const rank=Math.max(row.rank,...(s.acquiredAbilities||[]).filter(x=>x.pathId===row.pathId).map(x=>x.rank));out.push({ability,row,rank,rules:ruleSet(ability)});}return out;}
// A deliberately small formula language; all expressions are authored here, never taken from free text.
function numeric(expression,v){if(typeof expression==='number')return expression;const s=String(expression);const q=s.indexOf('?');if(q>=0){const condition=s.slice(0,q),rest=s.slice(q+1);let depth=0,colon=-1;for(let i=0;i<rest.length;i++){if(rest[i]==='?')depth++;if(rest[i]===':'){if(depth===0){colon=i;break;}depth--;}}if(colon<0)throw Error('Expression de règle invalide');const m=condition.match(/^([A-Z_0-9]+)>=(\d+)$/),pass=m?Number(v[m[1]])>=Number(m[2]):!!v[condition];return numeric(pass?rest.slice(0,colon):rest.slice(colon+1),v);}
 const parts=s.match(/[+-]?[^+-]+/g)||[];return parts.reduce((n,p)=>{const sign=p[0]==='-'?-1:1,key=p.replace(/^[+-]/,'');const value=/^\d+$/.test(key)?Number(key):v[key];if(!Number.isFinite(value))throw Error('Variable de règle absente : '+key);return n+sign*value;},0);}
function damagePlus(value,bonus){if(!bonus)return value;const m=String(value||'').match(/^(\d+d\d+°?)([+-]\d+)?$/);if(!m)return String(value)+(bonus>=0?'+':'')+bonus;const sum=Number(m[2]||0)+bonus;return m[1]+(sum?((sum>0?'+':'')+sum):'');}
function weaponMatch(type,a,w){const props=w.properties||[],n=fold(w.name||a.label);if(type==='melee')return a.type==='contact';if(type==='ranged')return a.type==='distance';if(type==='unarmed')return a.weaponId==='weapon:unarmed';if(type==='light_melee')return a.type==='contact'&&props.includes('light');if(type==='bow')return a.type==='distance'&&w.category==='bow';if(type==='thrown_knife')return a.type==='distance'&&/dague|couteau/.test(n);if(type==='axe_hammer')return /hache|marteau/.test(n);if(type==='crossbow_powder')return w.category==='crossbow'||props.includes('powder')||/arbalete|poudre|mousquet|pistolet|arquebuse/.test(n);return false;}
function apply(s,state,db){const rows=ownedRules(s,db,state),before={...s.caracs},delta=Object.fromEntries(STATS.map(k=>[k,0])),errors=[],statChanges=[];s.passiveFeatures=[];
 for(const x of rows){const bag=state.abilityChoices?.[x.ability.id]||{};for(const rule of x.rules){let values=null;if(rule.kind==='stats')values=rule.values;if(rule.kind==='stat_choice'){const choice=String(bag[rule.id]||rule.default||'').toLowerCase();if(!rule.values.includes(choice)){errors.push(x.ability.label+' : choisir '+rule.values.map(x=>x.toUpperCase()).join(' ou ')+'.');continue;}values={[choice]:rule.amount};if(choice===rule.bonusDieIf)s.passiveFeatures.push({kind:'bonus_die',stat:choice,sourceAbilityId:x.ability.id});}
 if(values){for(const[k,value]of Object.entries(values))delta[k]+=value;statChanges.push({abilityId:x.ability.id,values:clone(values)});}
 if(rule.kind==='bonus_die')s.passiveFeatures.push({...rule,sourceAbilityId:x.ability.id});}}
 for(const x of rows){const bag=state.abilityChoices?.[x.ability.id]||{};for(const r of x.rules.filter(r=>r.kind==='lowest_stat')){const self=statChanges.filter(a=>a.abilityId===x.ability.id).reduce((v,a)=>{for(const[k,n]of Object.entries(a.values))v[k]=(v[k]||0)+n;return v;},{}),values=Object.fromEntries(STATS.map(k=>[k,before[k]+delta[k]-(self[k]||0)])),min=Math.min(...Object.values(values)),allowed=STATS.filter(k=>values[k]===min),choice=String(bag[r.id]|| (allowed.length===1?allowed[0]:'')).toLowerCase();if(!allowed.includes(choice)){errors.push(x.ability.label+' : choisir une des caractéristiques les plus faibles ('+allowed.join(', ')+').');continue;}delta[choice]+=r.amount;statChanges.push({abilityId:x.ability.id,values:{[choice]:r.amount}});}}
 if(errors.length)return{errors};
 for(const k of STATS)s.caracs[k]=before[k]+delta[k];const level=Number(s.niveau||1),spells=(s.spells||[]).length,cap=Number(s.equipment?.agiCap??(db.tables||db).armors.find(a=>a.id===state.equip?.armorId)?.agiCap??99);
 const skin=rows.find(x=>(x.ability.mechanics?.effects||[]).some(e=>e.type==='replace_derived_dependency')),skinEff=skin?.ability.mechanics.effects.find(e=>e.type==='replace_derived_dependency'),defStat=skin?String(state.abilityChoices?.[skin.ability.id]?.[skinEff.toChoiceField]||'AGI').toLowerCase():'agi';
 s.PV+=level*delta.con;s.INIT+=delta.per;s.PC+=delta.cha;if(spells)s.PM+=delta.vol;s.DEF+=Math.min(s.caracs[defStat],cap)-Math.min(before[defStat],cap);s.ATK_CONTACT+=delta.for;s.ATK_DISTANCE+=delta.agi;s.ATK_MAGIC+=delta.vol;s.DR.count+=delta.con;
 for(const x of rows)for(const e of x.ability.mechanics?.effects||[]){if(e.type==='add_stat'){const n=delta[String(e.stat).toLowerCase()]||0;if(e.target==='PV')s.PV+=n;if(e.target==='INIT')s.INIT+=n;}if(e.type==='optional_pv_stat'&&state.abilityChoices?.[x.ability.id]?.[e.choiceField])s.PV+=delta[String(e.to).toLowerCase()]-delta[String(e.from).toLowerCase()];}
 // Reconcile dependencies already applied by the legacy semantic layer using the pre-gain stats.
 for(const x of rows){for(const e of x.ability.mechanics?.effects||[]){
  if(e.type==='conditional_add_stat_capped'&&e.target==='DEF'&&!state.equip?.armorId){const stat=String(e.stat).toLowerCase();s.DEF+=Math.min(s.caracs[stat],x.rank)-Math.min(before[stat],x.rank);}
  if(e.type==='replace_derived_dependency'&&e.target==='DEF'&&defStat==='agi'&&e.fallback){const oldBonus=before.agi>=before.con?1:0,newBonus=s.caracs.agi>=s.caracs.con?(x.rank>=4?2:1):0;s.DEF+=newBonus-oldBonus;}
 }}
 const count=(name,rank)=>new Set(rows.filter(x=>String(x.ability.path_id).includes('class-'+name+':')&&x.rank>=rank).map(x=>x.ability.path_id)).size;
 const baseValues={NIVEAU:level,...Object.fromEntries(STATS.map(k=>[k.toUpperCase(),s.caracs[k]])),ARMOR:!!state.equip?.armorId,HEAVY_HYBRID:!!state.hybrid?.enabled&&Number(s.equip?.armureDEF||0)>2,RODEUR_RANK5:count('rodeur',5),CHEVALIER_RANK5:count('chevalier',5)};
 for(const x of rows){const values={...baseValues,RANG:x.rank},bag=state.abilityChoices?.[x.ability.id]||{};for(const r of x.rules){if(r.kind==='derived'){if(r.when==='no_armor'&&state.equip?.armorId)continue;if(r.when==='has_spells'&&!spells)continue;if(r.when==='shield'&&!state.equip?.shieldId)continue;if(r.when==='heavy_armor'&&Number(s.equip?.armureDEF||0)<6)continue;let value=numeric(r.formula,values)-r.legacy;if(r.when==='exsangue'&&state.equip?.armorId!=='armor:os-sorcier:cof2-lb-2024'&&state.equip?.armorId)value-=1;const key=r.key==='DR_COUNT'?'DR.count':r.key,beforeValue=key==='DR.count'?s.DR.count:s[key];if(key==='DR.count')s.DR.count+=value;else s[key]=Number(s[key]||0)+value;s.ruleCompletionLedger.push({abilityId:x.ability.id,key,before:beforeValue,value,after:key==='DR.count'?s.DR.count:s[key],expression:r.formula,legacyReplaced:r.legacy});}
 if(r.kind==='mana_stat_choice'&&spells){const choice=String(bag[r.id]||r.default).toLowerCase();if(!r.values.includes(choice))errors.push(x.ability.label+' : choix de caractéristique de mana illégal.');else{s.PM+=s.caracs[choice]-s.caracs.vol;}}
 if(r.kind==='damage_reduction')s.passiveFeatures.push({...r,value:r.value??numeric(r.formula,values),sourceAbilityId:x.ability.id});}}
 for(const a of s.attacks||[]){if(Number(a.damageBonus)){a.damage=damagePlus(a.damage,Number(a.damageBonus));a.appliedFlatDamageBonus=Number(a.damageBonus);delete a.damageBonus;}const w=(db.tables||db).weapons_n1.find(w=>w.id===a.weaponId)||{},atkStat=a.attackCharacteristic||(a.type==='distance'?'agi':a.type==='magique'?'vol':'for');if(a.attackBonus!=null)a.attackBonus+=delta[atkStat]||0;
  const damageStat=a.damageCharacteristic||(!a.abilityId&&a.type==='contact'?'for':null);if(damageStat)a.damage=damagePlus(a.damage,delta[damageStat]||0);
  let crit=Number(a.criticalThreshold||((w.properties||[]).includes('critical_19_20')?19:20));for(const x of rows){for(const r of x.rules){if(r.kind==='weapon_bonus'&&weaponMatch(r.match,a,w)){if(r.attack)a.attackBonus+=r.attack;if(r.damage)a.damage=damagePlus(a.damage,numeric(r.damage,{...baseValues,RANG:x.rank})-Number(r.legacyDamage||0));if(r.mastery)a.mastered=true;}if(r.kind==='critical'&&weaponMatch(r.match,a,w)){crit-=numeric(r.amount,{...baseValues,RANG:x.rank});if(r.mastery)a.mastered=true;}}}a.criticalThreshold=Math.max(16,crit);
 }
 for(const x of rows)for(const sk of x.ability.mechanics?.skillBonuses||[]){const value=/rang\s*\+\s*2/i.test(x.ability.desc||'')&&Number(sk.value)===3?x.rank+2:Number(sk.value);if(Number.isFinite(value)){const entry={sourceAbilityId:x.ability.id,tests:sk.tests||[],value,scope:sk.scope||'self'},i=(s.skillBonuses||[]).findIndex(k=>k.sourceAbilityId===entry.sourceAbilityId&&JSON.stringify(k.tests||[])===JSON.stringify(entry.tests));s.skillBonuses=s.skillBonuses||[];if(i>=0)s.skillBonuses[i]=entry;else s.skillBonuses.push(entry);}}
 s.statGainLedger=statChanges;if(s.characterState){s.characterState.characteristics=clone(s.caracs);s.characterState.attacks=clone(s.attacks||[]);s.characterState.passiveFeatures=clone(s.passiveFeatures);s.characterState.skillBonuses=clone(s.skillBonuses||[]);s.characterState.statGainLedger=clone(statChanges);}return{errors,statChanges};
}
const api={version:'FOH_PERMANENT_RULES_1',ruleSet,numeric,apply,damagePlus,weaponMatch};root.FOHPermanentRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
