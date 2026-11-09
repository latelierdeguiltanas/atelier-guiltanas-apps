'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {ids, paths, rules} = require('../peuples-compagnon-v2');
const root = path.resolve(__dirname, '..');
const source = printedPage => ({bookId:'cof2-compagnon-v2', edition:'COF2', printedPage, chapter:'Peuples optionnels'});
const tinyIds = [ids.sprite, ids.fairy];
const certification = {scope:'n1_extension', sourceStatus:'official_cof2', enabledInCertifiedN1:true};
const schema = {
  soul: {type:'stat_mods', bonus:{mode:'fixed',options:['con'],value:1}, malus:{mode:'choice',options:['cha','int'],value:-1}, raw:'+1 CON ; −1 CHA ou INT'},
  fairy: {type:'stat_mods', bonus:{mode:'fixed',options:['agi'],value:1}, malus:{mode:'fixed',options:['con'],value:-1}, extra:{cha:1,for:-2}, raw:'+1 AGI et CHA ; −1 CON ; −2 FOR'},
  sprite: {type:'stat_mods', bonus:{mode:'fixed',options:['agi'],value:1}, malus:{mode:'fixed',options:['con'],value:-1}, extra:{per:1,for:-2}, raw:'+1 AGI et PER ; −1 CON ; −2 FOR'}
};
function updateData(db) {
  const t = db.tables || db;
  for (const [kind, id] of Object.entries(ids)) {
    const race = rules[kind], pid = paths[kind], row = t.peoples.find(p=>p.id===id);
    if (row) Object.assign(row, {label:race.name, schema:schema[kind], bonuses_raw:schema[kind].raw, source:source(kind==='soul'?7:27), certification});
    if (t.people_rules) {
      const traits = kind==='soul' ? {needsFood:false,needsDrink:false,needsAir:false,dreamHours:4,dreamMissedDayPenalty:-1,canSwim:false,underwaterMovement:'difficult_terrain',immunities:['poison','disease'],magicalHealingMultiplier:0.5,forgeRepairTimeMultiplier:2}
        : {stealthBonus:5, weaponDamageByHands:{one:'1d4',two:'1d6'}, ignoresForceForWeaponDamage:true, extraPhysicalEvolutionDieMaxCountsAs:1};
      const old = t.people_rules.findIndex(r=>r.peopleId===id);
      if(old>=0)t.people_rules[old]={id:'people-rule:'+kind+':compagnon-cof2',peopleId:id,movement:10,size:kind==='soul'?'medium':'tiny',passive:{defBonus:kind==='soul'?0:2},traits,restrictions:kind==='soul'?[]:[{type:'strength_cap',maximum:race.maxForce}],source:source(kind==='soul'?7:27)};
    }
    const pathsTable = t.paths_people;
    if (pathsTable) {
      const row={id:pid,label:race.path,people_id:id,group:'Compagnon',source:source(race.ranks[0][2]),certification};
      const i=pathsTable.findIndex(x=>x.id===pid);
      if(i<0)pathsTable.push(row);else pathsTable[i]=row;
    }
    for(const table of ['abilities_people','abilities_r1_people']){
      if(!t[table])continue;
      const count=table==='abilities_people'?5:1;
      for(let i=0;i<count;i++){
        const rank=i+1,[label,desc,page]=race.ranks[i],old=t[table].findIndex(a=>a.path_id===pid&&a.rank===rank);
        const id=old>=0?t[table][old].id:'ability:fee-r'+rank+':'+pid;
        const row={id,path_id:pid,rank,label,desc,source:source(page),certification,playSummary:desc,mechanics:{kind:'passive_or_contextual',effects:[]}};
        if(rank===1){row.r1_title=label;row.r1_desc=desc;}
        if(kind==='soul'&&rank===1)row.mechanics.effects=[{type:'weapon_damage_override',weaponId:'weapon:unarmed',formula:'1d3+FOR',nonLethal:false}];
        if(kind==='soul'&&rank===4)row.mechanics={kind:'active',rangeMeters:30,choices:[{id:'eyeCrystal',label:'Cristaux oculaires',type:'enum',values:['lightning','fire','cold'],valueLabels:{lightning:'Transparents — électricité',fire:'Rouges — feu',cold:'Bleus — froid'},persist:true,required:true}],effects:[{type:'damage',formula:'4d4°+CON',attackType:'magic',damageType:'elemental',usesPerCombat:1}]};
        if(kind==='fairy'&&rank===3)row.mechanics.effects=[{type:'racial_spell_choice',choiceId:'fairyDustAbility',allowedRanks:[1,2],allowedProfiles:['magicien','ensorceleur'],armorRestrictions:{rank1:'allowed_without_penalty'},persist:true}];
        if(kind==='sprite'&&rank===3)row.mechanics.effects=[{type:'racial_spell_choice',choiceId:'spriteInvisibility',allowedRanks:[3],allowedProfiles:['magicien','ensorceleur'],persist:true}];
        if(kind==='sprite'&&rank===2)row.mechanics.effects=[{type:'racial_spell_choice',choiceId:'spriteAnimals',allowedRanks:[1],allowedProfiles:['druide','rodeur'],persist:true}];
        if(old<0)t[table].push(row);else t[table][old]=row;
        if(kind==='soul'&&rank===1&&t.sticky_effects_r1_people){
          t.sticky_effects_r1_people=t.sticky_effects_r1_people.filter(e=>e.id!=='effect:metallic-def:'+table);
          t.sticky_effects_r1_people.push({id:'effect:metallic-def:'+table,ability_id:id,stat:'DEF',delta:1,condition:{type:'none'}});
        }
      }
    }
  }
}
const htmlPath = path.join(root,'index.html');
let html = fs.readFileSync(htmlPath,'utf8');
const dbPattern=/(<script id="FOH_DB_JSON"[^>]*>)([\s\S]*?)(<\/script>)/;
html=html.replace(dbPattern,(_,open,body,close)=>{const db=JSON.parse(body);updateData(db);return open+JSON.stringify(db)+close;});
function change(before,after) {
  assert(html.includes(before), 'Ancre absente : '+before.slice(0,120));
  html=html.replace(before,()=>after);
}
const marker = '<script id="FOH_COMPANION_V2">';
if(!html.includes(marker)){
  const rulesCode=fs.readFileSync(path.join(root,'peuples-compagnon-v2.js'),'utf8');
  change('<script id="FOH_ENGINE_BUNDLE" type="text/javascript">',marker+'\n'+rulesCode+'\n</script>\n<script id="FOH_ENGINE_BUNDLE" type="text/javascript">');
  change('if(malus) applyStatMod(mods,malus,sc.malus.value);','if(malus) applyStatMod(mods,malus,sc.malus.value);\n      for(const [stat,value] of Object.entries(sc.extra||{}))applyStatMod(mods,stat,value);');
  change("sticky.caracs.for>0) return {sticky,errors:[\"Lutin : la FOR finale ne peut pas dépasser +0.\"]}", "sticky.caracs.for>-1) return {sticky,errors:[\"Farfadet : la FOR finale ne peut pas dépasser −1.\"]}");
  change("sticky.caracs.for>-1) return {sticky,errors:[\"Fée : la FOR finale ne peut pas dépasser -1.\"]}", "sticky.caracs.for>-2) return {sticky,errors:[\"Fée : la FOR finale ne peut pas dépasser −2.\"]}");
  html=html.replace(/^    if\(peopleRule&&peopleRule\.peopleId==='people:lutin:addon-comp2017-cof2'.*(?:resources\.teleport|1 PC est requis).*\n/gm,'');
  const oldRestrictions=html.slice(html.indexOf("    if(peopleRule&&['"+ids.sprite+"','"+ids.fairy+"'].includes(peopleRule.peopleId)){"),html.indexOf('    bouclierDEF = (toNum(bouclierDEF)'));
  assert(oldRestrictions.includes('d4 maximum'));change(oldRestrictions,'');
  const equipmentChecks=[
    "      if(tiny&&maximum>4)errors.push('Être féerique : arme limitée au d4.');\n",
    "    if(tiny&&(armorId||shieldId)&&equip.tinyFitted!==true)errors.push('Être féerique : équipement non ajusté à la taille.');\n",
    "    if(people==='"+ids.fairy+"'&&shieldId)errors.push('Fée : bouclier incompatible avec le vol.');\n",
    "    if(people==='"+ids.fairy+"'&&armor&&Number(armor.defBonus)>1)errors.push('Fée : cette armure empêche le vol.');\n"
  ];
  equipmentChecks.forEach(x=>change(x,''));
  change("const damageStat=d.damageCharacteristic===undefined?(d.mode==='melee'?'for':null):d.damageCharacteristic;", "const tinyWeapon=w.id!=='weapon:unarmed'&&"+JSON.stringify(tinyIds)+".includes(sticky.peupleId);\n    if(tinyWeapon&&!o)damage=Number(d.hands||w.hands||1)===2?'1d6':'1d4';\n    const damageStat=tinyWeapon?null:(d.damageCharacteristic===undefined?(d.mode==='melee'?'for':null):d.damageCharacteristic);");
  change("if(thrower){trackedDamageStat='for';", "if(thrower&&!tinyWeapon){trackedDamageStat='for';");
  change("if(actualHands!==Number(d.hands||1))properties.push('two_handed_for_size');", "if(actualHands!==Number(d.hands||1))properties.push('two_handed_for_size');if(tinyWeapon)properties.push('tiny_weapon_damage','extra_evolution_die_max_counts_as_one');");
  change("a.damageCharacteristic||(!a.abilityId&&a.type==='contact'?'for':null)", "a.properties?.includes('tiny_weapon_damage')?null:a.damageCharacteristic||(!a.abilityId&&a.type==='contact'?'for':null)");
  change("'voie-de-letre-feerique':['per','cha']", "'voie-de-letre-feerique':['cha','vol'],'voie-de-la-fee':['per','cha']");
  change("  if(p==='voie-de-letre-feerique'){skill(a,['comprendre les animaux','calmer les animaux','communiquer avec les animaux'],3);feature(a,{kind:'animal_language'});}", `  if(['voie-de-letre-feerique','voie-de-la-fee'].includes(p)){
   s.traits.darkvisionMeters=20;
   s.traits.damageReduction=[{types:['weapon'],exceptMaterial:'cold_iron',value:rank(path)}];
   if(p==='voie-de-la-fee')s.traits.flight={action:'movement',distanceMeters:10};
   else s.traits.teleport={action:'movement',distanceMeters:10,lineOfSight:true};
  }
  if(p==='voie-de-lâme-forgée'){
   s.traits.darkvisionMeters=10;
   s.traits.damageReduction=[{types:['fire','cold','life_drain'],value:5}];
   s.traits.immunities=[...new Set([...(s.traits.immunities||[]),'bleeding'])];
  }`);
  change(" for(const a of rows){const path=a.pathId||a.path_id,p=path?.split(':')[1],r=Number(a.rank);", ` const tiny=${JSON.stringify(tinyIds)}.includes(s.peupleId);
 if(tiny)skill({id:s.peupleId,rank:0},['discrétion'],5);
 for(const a of rows){const path=a.pathId||a.path_id,p=path?.split(':')[1],r=Number(a.rank);`);
  change("    const eff=(source.mechanics?.effects||[]).find(e=>e.type==='grant_ability_choice');", "    const eff=(source.mechanics?.effects||[]).find(e=>['grant_ability_choice','racial_spell_choice'].includes(e.type));");
  change("      if(!(eff.allowedRanks||[]).includes(Number(a.rank)))return false;", `      if(!(eff.allowedRanks||[]).includes(Number(a.rank)))return false;
      if(eff.choiceId==='fairyDustAbility'&&Number(a.rank)===2&&!isSpell(a))return false;
      if(eff.choiceId==='fairyDustAbility'&&Number(a.rank)===1&&window.FOHPermanentRules.ruleSet(a).some(rule=>rule.key==='DEF'))return false;
      if(['spriteAnimals','spriteInvisibility'].includes(eff.choiceId)){
        const wanted=eff.choiceId==='spriteAnimals'?'langage des animaux':'invisibilite';
        const name=row=>String(row.label||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/^rang [0-9]+ [—-] /,'');
        const owns=window.FOHPermanentRules.plannedAbilities(state,dbObj).some(row=>String(row.path_id||'').startsWith('classpath')&&name(row).startsWith(wanted));
        if(!owns&&!name(a).startsWith(wanted))return false;
        if(owns&&eff.choiceId==='spriteAnimals'&&name(a).startsWith(wanted))return false;
        if(owns&&eff.choiceId==='spriteInvisibility'&&!/^(telekinesie|confusion)/.test(name(a)))return false;
      }`);
  change("if(e.type==='grant_ability_choice'&&e.persist)rows.push(", "if(['grant_ability_choice','racial_spell_choice'].includes(e.type)&&e.persist)rows.push(");
  change("      else if(e.type==='grant_ability_choice'){/* Expanded and validated before this pass. */}", `      else if(e.type==='racial_spell_choice'){
        const options=legalGrantOptions(ability,state);
        const selected=options.find(a=>a.id===choices[e.choiceId])||(!choices[e.choiceId]&&options.length===1?options[0]:null);
        if(selected){
          const spell=isSpell(selected);
          const entry={id:selected.id,label:selected.label,rank:selected.rank,description:selected.desc,sourceAbilityId:ability.id,spell,armorAllowed:e.choiceId!=='fairyDustAbility'||selected.rank===1};
          if(e.choiceId!=='spriteAnimals')Object.assign(entry,{dailyUses:3,manaCost:0,manaGain:0});
          s.permissions.racialAbilities=[...(s.permissions.racialAbilities||[]),entry];
        }
      }
      else if(e.type==='grant_ability_choice'){/* Expanded and validated before this pass. */}`);
  change("if(c.required&&(v==null||v===''", "if(c.required&&(!['spriteAnimals','spriteInvisibility'].includes(c.id)||options.length!==1)&&(v==null||v===''");
  change("+(s.abilityRuntimeCatalog?.some", "+(s.permissions?.racialAbilities?.length?section('Capacités féeriques accordées',7,`<ul>${s.permissions.racialAbilities.map(a=>`<li><b>${esc(a.label)}</b> · rang ${a.rank}${a.dailyUses?' · 3 fois par jour · 0 PM':''}${a.armorAllowed?' · utilisable en armure':' · sans armure'}<p>${esc(a.description||'')}</p></li>`).join('')}</ul>`):'')+(s.abilityRuntimeCatalog?.some");
  change("let input=JSON.parse(JSON.stringify(state||{}));delete input.__hybridEquipment;", `let input=JSON.parse(JSON.stringify(state||{}));delete input.__hybridEquipment;
    if(input.peupleId===${JSON.stringify(ids.fairy)}){
      const from=${JSON.stringify(paths.sprite)},to=${JSON.stringify(paths.fairy)};
      for(const key of ['peoplePathId','peopleR1PathId','retainedPeoplePathId'])if(input.voies?.[key]===from)input.voies[key]=to;
      if(input.peoplePathId===from)input.peoplePathId=to;
      for(const pick of input.age?.spending||[])if(pick.pathId===from)pick.pathId=to;
    }
    if(input.peupleId===${JSON.stringify(ids.soul)}&&input.peupleChoices?.bonusStat&&!input.peupleChoices.malusStat)input.peupleChoices.malusStat='cha';`);
  change("  picker.innerHTML='<option value=\"\">Choisir un peuple…</option>'+optionHtml(T.peoples,d.peopleChosen?d.peopleId:'');\n  picker.value=d.peopleChosen?d.peopleId:'';", `  const fairyId=${JSON.stringify(ids.fairy)},spriteId=${JSON.stringify(ids.sprite)};
  const choices=T.peoples.filter(p=>p.id!==fairyId).map(p=>p.id===spriteId?{...p,label:'Lutin'}:p);
  picker.innerHTML='<option value="">Choisir un peuple…</option>'+optionHtml(choices,d.peopleChosen?d.peopleId:'');
  picker.value=d.peopleChosen?(d.peopleId===fairyId?spriteId:d.peopleId):'';`);
  change("d.peopleId=picker.value;d.peopleChosen=true;", "d.peopleId=picker.value===spriteId&&d.sex==='female'?fairyId:picker.value;d.peopleChosen=true;");
  change("const p=people(d.peopleId),sc=p.schema||{},box=$('people-options');let h='';", `const p=people(d.peopleId),sc=p.schema||{},box=$('people-options');let h='';
  if([fairyId,spriteId].includes(p.id))h+='<div class="field"><label for="lutin-form">Forme du Lutin</label><select id="lutin-form"><option value="'+fairyId+'" '+(p.id===fairyId?'selected':'')+'>Fée</option><option value="'+spriteId+'" '+(p.id===spriteId?'selected':'')+'>Farfadet</option></select></div>';`);
  change("box.innerHTML=d.peopleChosen?h:'';const hs=", "box.innerHTML=d.peopleChosen?h:'';const form=$('lutin-form');if(form)form.onchange=()=>{d.peopleId=form.value;d.peoplePathId='';render()};const hs=");
  change("filter(x=>/^Lutin : la FOR finale|^Fée : la FOR finale/.test(x))", "filter(x=>/^Farfadet : la FOR finale|^Fée : la FOR finale/.test(x))");
  change('FOR finale supérieure à +0','FOR finale supérieure à −1');
  change('FOR finale supérieure à −1. Déplace une valeur de Force vers une autre caractéristique.\'};return{ok:false,msg:errors[0]}','FOR finale supérieure à −2. Déplace une valeur de Force vers une autre caractéristique.\'};return{ok:false,msg:errors[0]}');
  change("const c=h.recovery.character,m=h.recovery.mapping,acquired=[];", "const c=window.FOHCompanionPeopleV2?.hubCharacter(h.recovery.character)||h.recovery.character,m=h.recovery.mapping,acquired=[];");
  change("voies:{profilePathIds:profiles.map(p=>p.pathId)},history},s,d:{name:c.name", "voies:{peoplePathId:c.companionPeopleVersion===2?people[0]?.pathId:undefined,profilePathIds:profiles.map(p=>p.pathId)},history},s,d:{name:c.name");
  const oldDesc=html.match(/if\(st\.peupleId!=='people:fee:addon-comp2017-cof2'\)return head;return head\+'[^']*'/)?.[0];
  if(oldDesc)change(oldDesc,"const race=window.FOHCompanionPeopleV2.rules[window.FOHCompanionPeopleV2.kindFromId(st.peupleId)];return race?head+'\\n'+race.traits.join(' '):head");
}
for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))
  if(!/application\/(?:ld\+)?json|src=/.test(m[1]))new vm.Script(m[2],{filename:m[1]});
fs.writeFileSync(htmlPath,html);
const labelsPath=path.join(root,'progression/pdf-labels.json');
const labels=JSON.parse(fs.readFileSync(labelsPath,'utf8'));
updateData(labels);
fs.writeFileSync(labelsPath,JSON.stringify(labels,null,2)+'\n');
