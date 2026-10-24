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
function apply(result,state,db){if(!result?.sticky||result.errors?.length)return result;const s=result.sticky,t=db.tables||db,rows=[...(t.abilities_class||[]),...(t.abilities_people||[]),...(t.abilities_r1_people||[])],byId=new Map(rows.map(a=>[a.id,a])),owned=s.acquiredAbilities||[];s.ruleCompletionLedger=[];
 // Only explicitly authored permanent rules execute. Action powers and conditional bonuses remain contextual.
 for(const row of owned){const a=byId.get(row.id);if(!a)continue;const rank=Math.max(row.rank,...owned.filter(x=>x.pathId===row.pathId).map(x=>x.rank));for(const rule of a.calculationRules||[]){if(rule.mode!=='permanent')continue;const values={RANG:rank,NIVEAU:Number(s.niveau||1),...Object.fromEntries(stats.map(k=>[k,Number(s.caracs[k.toLowerCase()]||0)]))};let value=rule.steps?rule.steps.reduce((v,step)=>rank>=step.rank?step.value:v,0):formula(rule.expression,values).value;if(value===null)continue;
 if(rule.operation==='add_derived'){const before=Number(s[rule.key]||0);s[rule.key]=before+value;s.ruleCompletionLedger.push({abilityId:a.id,key:rule.key,before,value,after:s[rule.key],expression:rule.expression||'seuil de rang'});}
 if(rule.operation==='movement_floor'){s.movement=typeof s.movement==='object'?{...s.movement,meters:Math.max(Number(s.movement.meters||10),value)}:Math.max(Number(s.movement||10),value);s.ruleCompletionLedger.push({abilityId:a.id,key:'movement',value});}
 }}
 s.abilityCalculations=owned.map(row=>byId.get(row.id)).filter(Boolean).map(a=>details(a,s));s.totals={...s.totals,PV:s.PV,DEF:s.DEF,INIT:s.INIT,PC:s.PC,PM:s.PM};s.resources=s.resources||{};
 for(const[k,value]of [['mana',s.PM],['chance',s.PC]])if(s.resources[k])s.resources[k]={...s.resources[k],max:value,current:value};
 const cs=s.characterState;if(cs){cs.derived={...cs.derived,PV:s.PV,DEF:s.DEF,INIT:s.INIT,PC:s.PC,PM:s.PM};cs.ruleCompletionLedger=clone(s.ruleCompletionLedger);cs.abilityCalculations=clone(s.abilityCalculations);cs.resources=clone(s.resources);}
 return result;
}
const api={version:'FOH_PATH_CALCULATIONS_1',arithmetic,formula,details,apply};root.FOHPathCalculations=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
