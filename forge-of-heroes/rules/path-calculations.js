(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),stats=['FOR','AGI','CON','PER','INT','VOL','CHA'];
// Arithmetic only. No eval/Function, no property access, no guessed values for unknown variables.
function arithmetic(input){const tokens=String(input).replace(/[×x]/g,'*').replace(/−/g,'-').match(/\d+(?:\.\d+)?|[()+*/-]|[^\s]/g)||[];let i=0;
 function atom(){const t=tokens[i++];if(t==='-')return-atom();if(t==='+')return atom();if(t==='('){const v=sum();if(tokens[i++]!==')')throw Error('Parenthèse manquante');return v;}if(!/^\d+(?:\.\d+)?$/.test(t||''))throw Error('Variable non résolue');return Number(t);}
 function product(){let v=atom();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],r=atom();if(op==='/'&&r===0)throw Error('Division par zéro');v=op==='*'?v*r:v/r;}return v;}
 function sum(){let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],r=product();v=op==='+'?v+r:v-r;}return v;}
 const value=sum();if(i!==tokens.length||!Number.isFinite(value))throw Error('Formule non arithmétique');return value;
}
function formula(expression,context={}){let resolved=String(expression).replace(/\bMod\.\s*(de\s+)?/g,'').replace(/\brang (?:atteint )?dans (?:cette |la )voie\b/gi,'RANG').replace(/\bniveau (?:du |de l’|de la )?(?:personnage|sorcier|druide|moine|magicien|forgesort|rôdeur|gobelin|invocateur|psionique|samouraï)\b/gi,'NIVEAU').replace(/\bniveau\b/gi,'NIVEAU').replace(/\brang\b/gi,'RANG');
 const values={...context};for(const k of Object.keys(values))if(!Number.isFinite(values[k]))delete values[k];for(const k of Object.keys(values).sort((a,b)=>b.length-a.length))resolved=resolved.replace(new RegExp('\\b'+k+'\\b','g'),String(values[k]));
 try{return{expression,resolved,value:arithmetic(resolved),status:'CALCULATED'};}catch{return{expression,resolved,value:null,status:/\d+d\d/.test(resolved)?'DICE_NOT_ROLLED':'CONTEXT_REQUIRED'};}}
function details(ability,sticky,context={}){const owned=sticky?.acquiredAbilities||[],pathId=ability.path_id||ability.pathId,r=Math.max(ability.rank,...owned.filter(a=>a.pathId===pathId).map(a=>a.rank)),values={NIVEAU:Number(sticky?.niveau||1),RANG:r,...Object.fromEntries(stats.map(k=>[k,Number(sticky?.caracs?.[k.toLowerCase()]||0)])),INIT:Number(sticky?.INIT||0),...context},text=ability.desc||ability.r1_desc||'';
 const expressions=[...new Set([...text.matchAll(/\[([^\[\]]+)\]/g)].map(m=>m[1]))];return{id:ability.id,pathId,rank:ability.rank,pathRank:r,name:ability.label,text,conversion:ability.conversion||null,formulae:expressions.map(e=>formula(e,values)),calculationRules:clone(ability.calculationRules||[]),mechanicsStatus:ability.certification?.functionalStatus||'NOT_AUDITED'};}
function deriveAssets(s,state,rows){
 const owned=s.acquiredAbilities||[],lookup=new Map(rows.map(a=>[a.id,a])),rank=id=>Math.max(0,...owned.filter(a=>a.pathId===id).map(a=>Number(a.rank))),context=state.semanticContext||{},visible=context.familiarVisible===true||context.familiarInSight===true;
 const assets=[],seen=new Set();let familiarDEF=0,familiarINIT=0;
 for(const row of owned){const a=lookup.get(row.id);if(!a)continue;let descriptors=(a.mechanics?.effects||[]).filter(e=>e.type==='companion'&&e.companionId).map(clone);
  const pid=a.path_id||a.pathId;
  if(pid==='classpath:voie-du-fauve:class-druide:cof2-lb-2024'&&a.rank===2)descriptors.push({companionId:'companion:panther',name:'Panthère',characteristics:{agi:4,con:2,for:2,per:2,cha:-2,int:-3,vol:2},defenseFormula:'13+path_rank',pvFormula:'owner_level*4',initiativeFormula:'owner_INIT',attackFormula:'owner_ATM',damage:'1d4+2'});
  if(pid==='classpath:voie-des-animaux:class-druide:cof2-lb-2024'&&a.rank===2)descriptors.push({companionId:'companion:druid-familiar',name:'Petit compagnon',characteristics:{agi:3,con:0,for:-4,per:2,int:-2,cha:-2,vol:2},defenseFormula:'13+path_rank',pvFormula:'owner_level*2',initiativeFormula:'owner_INIT',tooSmallToAttack:true});
  if(pid==='path:voie-du-gobelin:addon-comp2017-cof2'&&a.rank===2)descriptors.push({companionId:'companion:young-worg',name:'Jeune worg',characteristics:{agi:1,con:1,for:1,int:-3,per:2,cha:-3},defenseFormula:'14',pvFormula:'owner_level*4',initiativeFormula:'owner_INIT',attackFormula:'owner_level',damage:'1d6+1',conversionPolicyId:'FOH_COMPANION_COF2_V1'});
  if(pid==='classpath:voie-de-la-noblesse:class-chevalier:cof2-lb-2024'&&a.rank===2)descriptors.push({companionId:'companion:squire',name:'Écuyer',defenseFormula:'10+path_rank',pvFormula:'owner_level*4',initiativeFormula:'owner_INIT',attackFormula:'owner_ATM',damage:'1d4°+1'});
  if(pid==='classpath:voie-de-la-magie-universelle:class-magicien:cof2-lb-2024'&&a.rank===2&&visible){familiarDEF=Math.max(familiarDEF,2);familiarINIT=Math.max(familiarINIT,2);}
  if(pid==='classpath:voie-des-animaux:class-druide:cof2-lb-2024'&&a.rank===2&&visible)familiarDEF=Math.max(familiarDEF,2);
  for(const d of descriptors){const key=a.id+'|'+d.companionId;if(seen.has(key))continue;seen.add(key);assets.push({...d,sourceAbilityId:a.id,pathId:pid,pathRank:rank(pid)});}
 }
 // These two familiar DEF bonuses explicitly do not stack. Neither is permanently on by default.
 if(familiarDEF){const before=s.DEF;s.DEF+=familiarDEF;s.ruleCompletionLedger.push({key:'DEF',before,value:familiarDEF,after:s.DEF,condition:'familiar_visible',stackingGroup:'familiar_owner_defense'});}
 if(familiarINIT){const before=s.INIT;s.INIT+=familiarINIT;s.ruleCompletionLedger.push({key:'INIT',before,value:familiarINIT,after:s.INIT,condition:'familiar_visible'});}
 for(const a of assets){const values={path_rank:a.pathRank,owner_level:Number(s.niveau||1),level:Number(s.niveau||1),owner_INIT:s.INIT,owner_ATM:s.ATK_MAGIC,owner_DEF:s.DEF},n=expr=>expr==null?null:formula(String(expr),values).value;
  if(a.companionId==='companion:familiar')a.ownerBonusText='+2 DEF et +2 Initiative lorsque le familier est en vue.';if(a.companionId==='companion:druid-familiar')a.ownerBonusText='+2 DEF lorsque le compagnon est en vue ; ne se cumule pas avec le bonus du familier du magicien.';
  a.def=n(a.defenseFormula);a.pv=n(a.pvFormula);a.init=n(a.initiativeFormula);a.attack=a.tooSmallToAttack?null:n(a.attackFormula);a.DEF=a.def;a.PV=a.pv;a.INIT=a.init;a.ATK_CONTACT=a.attack;
  if(a.companionId==='companion:golem')a.damage='1d4°+1';if(a.companionId==='companion:faithful-mount'){a.damage='1d4°+5';a.healing='1d8+4 PV par nuit';if(a.pathRank>=2){a.whenMountedDEF=s.DEF;if(context.mounted===true)a.def=a.DEF=s.DEF;}}
  if(a.companionId==='companion:wolf'&&a.pathRank>=2){a.attackBonusDie=context.ownerInContact===true;a.attackBonusDieCondition='Le loup et son maître sont au contact.';}
  if(a.tooSmallToAttack){a.attack=a.ATK_CONTACT=null;a.damage=null;}
 }
 s.companions=assets;
 if(s.characterState)s.characterState.companions=clone(assets);
}

function apply(result,state,db){if(!result?.sticky||result.errors?.length)return result;const s=result.sticky,t=db.tables||db,rows=[...(t.abilities_class||[]),...(t.abilities_people||[]),...(t.abilities_r1_people||[])],byId=new Map(rows.map(a=>[a.id,a])),owned=s.acquiredAbilities||[];s.ruleCompletionLedger=[];
 // Only explicitly authored permanent rules execute. Action powers and conditional bonuses remain contextual.
 for(const row of owned){const a=byId.get(row.id);if(!a)continue;if(String(a.path_id||'').includes('class-moine:')&&(state?.equip?.armorId||state?.equip?.shieldId))continue;const rank=Math.max(row.rank,...owned.filter(x=>x.pathId===row.pathId).map(x=>x.rank));for(const rule of a.calculationRules||[]){if(rule.mode!=='permanent')continue;const values={RANG:rank,NIVEAU:Number(s.niveau||1),...Object.fromEntries(stats.map(k=>[k,Number(s.caracs[k.toLowerCase()]||0)]))};let value=rule.steps?rule.steps.reduce((v,step)=>rank>=step.rank?step.value:v,0):formula(rule.expression,values).value;if(value===null)continue;
 if(rule.operation==='add_derived'){const before=Number(s[rule.key]||0);s[rule.key]=before+value;s.ruleCompletionLedger.push({abilityId:a.id,key:rule.key,before,value,after:s[rule.key],expression:rule.expression||'seuil de rang'});}
 if(rule.operation==='movement_floor'){s.movement=typeof s.movement==='object'?{...s.movement,meters:Math.max(Number(s.movement.meters||10),value)}:Math.max(Number(s.movement||10),value);s.ruleCompletionLedger.push({abilityId:a.id,key:'movement',value});}
 }}
 deriveAssets(s,state,rows);
 s.abilityCalculations=owned.map(row=>byId.get(row.id)).filter(Boolean).map(a=>details(a,s));s.totals={...s.totals,PV:s.PV,DEF:s.DEF,INIT:s.INIT,PC:s.PC,PM:s.PM};s.resources=s.resources||{};
 for(const[k,value]of [['mana',s.PM],['chance',s.PC]])if(s.resources[k])s.resources[k]={...s.resources[k],max:value,current:value};
 const cs=s.characterState;if(cs){cs.rulesVersion="FOH_PATH_RULES_2";cs.derived={...cs.derived,PV:s.PV,DEF:s.DEF,INIT:s.INIT,PC:s.PC,PM:s.PM,ATC:s.ATK_CONTACT,ATD:s.ATK_DISTANCE,ATM:s.ATK_MAGIC};cs.ruleCompletionLedger=clone(s.ruleCompletionLedger);cs.abilityCalculations=clone(s.abilityCalculations);cs.resources=clone(s.resources);}
 return result;
}
const api={version:'FOH_PATH_CALCULATIONS_2',arithmetic,formula,details,apply};root.FOHPathCalculations=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
