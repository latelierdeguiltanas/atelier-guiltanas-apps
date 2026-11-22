/* BEGIN GENERATED GUERRIER COMBAT: source forge-of-heroes/ENGINE/guerrier-combat.js */
(function(root){'use strict';
// COF2 Livre de base fourni : p.43 (d4°), 87–90 (25 capacités), 188 et 209–211.
const clone=x=>JSON.parse(JSON.stringify(x)),fail=m=>{throw Error(m);};
const paths={shield:'voie-du-bouclier',combat:'voie-du-combat',master:'voie-du-maitre-d-armes',resistance:'voie-de-la-resistance',soldier:'voie-du-soldat'};
const rank=(c,key)=>Math.max(0,...(c.paths||[]).filter(p=>String(p.pathId||'').includes('classpath:'+paths[key]+':class-guerrier:')).flatMap(p=>(p.ranks||[]).filter(a=>a.owned).map(a=>Number(a.rank)||0)));
// Standard progression: d4 N1–5, d6 N6–8, d8 N9–11, d10 N12–14, d12 N15+.
const evolvingDie=level=>level>=15?12:level>=12?10:level>=9?8:level>=6?6:4;
function ability(c,key,r){return rank(c,key)>=r;}
function isAbility(a){return String(a?.pathId||'').includes(':class-guerrier:');}
function code(a){if(!isAbility(a))return null;const key=Object.keys(paths).find(k=>String(a.pathId).includes('classpath:'+paths[k]+':'));return key?key+':'+a.rank:null;}
function state(play){const s=play.warrior||{};return{round:Math.max(1,Number(s.round)||1),roundUses:{...(s.roundUses||{})},combatUses:{...(s.combatUses||{})},targets:[...(s.targets||[])],maneuvers:{...(s.maneuvers||{})},braced:!!s.braced,absorbed:s.absorbed?clone(s.absorbed):null,lastStand:!!s.lastStand,...(s.lastResult?{lastResult:clone(s.lastResult)}:{})};}
function inspect(c,play,ctx={}){const ranks=Object.fromEntries(Object.keys(paths).map(k=>[k,rank(c,k)])),w=state(play),conditions=play.conditions||[];return{ranks,state:w,hasWarrior:Object.values(ranks).some(Boolean),die:evolvingDie(c.level),shield:!!ctx.shield,armor:Number(ctx.armor)||0,armorAllowed:(Number(ctx.armor)||0)<=5||!!c.warriorRules?.plateMastery,surprised:conditions.includes('Surpris'),unconscious:conditions.includes('Inconscient')&&!w.lastStand,stunned:conditions.includes('Étourdi'),immobilized:conditions.includes('Immobilisé'),weakened:conditions.includes('Affaibli'),heroic:ranks.resistance>=4?['CON',...(ranks.soldier>=4?['FOR']:[])]:ranks.soldier>=4?['FOR']:[],recoveryMinutes:ranks.resistance>=4?5:ranks.resistance>=2?10:30};}
const integer=(x,min,max,name)=>{if(x===''||x===null||x===undefined||!Number.isInteger(Number(x))||Number(x)<min||Number(x)>max)fail('Renseigne '+name+' ('+min+' à '+max+').');return Number(x);};
function quota(w,key,max=1,combat=false){const store=combat?w.combatUses:w.roundUses;if((store[key]||0)>=max)fail('Utilisation déjà dépensée '+(combat?'pour ce combat.':'pour ce round.'));store[key]=(store[key]||0)+1;}
function reset(play,period){const out=clone(play),w=state(play);w.roundUses={};w.targets=[];w.absorbed=null;if(period==='turn')w.braced=false;if(period==='laststand'){if(w.lastStand){w.lastStand=false;if(Number(out.hp)<=0&&!(out.conditions||[]).includes('Inconscient'))(out.conditions=out.conditions||[]).push('Inconscient');}}if(period==='combat'||period==='day'){w.combatUses={};w.maneuvers={};w.braced=false;w.lastStand=false;}w.round++;delete w.lastResult;out.warrior=w;return out;}
function categories(weapon){if(weapon.preferredCategory)return[weapon.preferredCategory];const n=String(weapon.base||weapon.name||weapon.label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),type=String(weapon.type||weapon.attackType||'').toLowerCase();if(/arbalete|arc |arc$|fronde|poudre|mousquet|pistolet/.test(n))return[];if(/javelot|hachette|couteaux? de lancer|dague.*distance|dague.*lancer|lancer.*dague/.test(n)||/distance/.test(type)&&/dague|couteau/.test(n))return['thrown'];if(/epee|rapiere|cimeterre|sabre/.test(n))return['swords'];if(/hache/.test(n))return['axes'];if(/masse|marteau/.test(n))return['maces'];if(/epieu|pique|lance/.test(n)&&!/lance-pierre/.test(n))return['spears'];return[];}
function training(c){if(c.warriorRules?.preferredWeapons)return c.warriorRules.preferredWeapons;const choices=c.warriorChoices||{},snapshot=c.forgeSnapshot||{},saved=Object.values(snapshot.persistentChoices||{}).find(x=>x?.preferredWeaponCategory)?.preferredWeaponCategory,category=choices.preferredWeaponCategory||saved;if(!rank(c,'master')||!category)return{};return{[category]:rank(c,'master')>=3?1:0};}
function weaponBonus(c,weapon){const t=training(c),cats=categories(weapon),preferred=cats.some(k=>Object.hasOwn(t,k));return{preferred,attack:preferred?1:0,damage:preferred?Math.max(0,...cats.map(k=>t[k]||0)):0,critical:preferred&&rank(c,'master')>=2?1:0};}
function dice(rolls,mode){const needed=mode==='normal'?1:2;if(!Array.isArray(rolls)||rolls.length<needed)fail('Saisis '+needed+' résultat(s) de d20.');const values=rolls.slice(0,needed).map(v=>integer(v,1,20,'le d20'));return mode==='bonus'?Math.max(...values):mode==='malus'?Math.min(...values):values[0];}
function diceMode(bonus,malus){return bonus&&!malus?'bonus':malus&&!bonus?'malus':'normal';}
const requirements={protect:['shield',1],prepare:['shield',2],parry:['shield',2],absorb:['shield',4],reflect:['shield',5],area:['shield',3],vivacity:['combat',1],maneuver:['combat',2],power:['combat',3],double:['combat',4],circular:['combat',5],perfect:['master',4],disarm:['master',4],riposte:['master',5],prowess:['soldier',2],teigneux:['soldier',1],reminder:['soldier',3],laststand:['resistance',5],constitution:['resistance',4],strength:['soldier',4]};
function resolve(c,play,ctx,action,input={}){if(!requirements[action])fail('Action de guerrier inconnue.');const [key,r]=requirements[action],st=inspect(c,play,ctx);if(!ability(c,key,r))fail('Capacité non acquise.');if(!st.armorAllowed)fail('Armure trop lourde : capacités de guerrier interdites.');const out=clone(play),w=state(play);out.conditions=out.conditions||[];let result={action,path:key,rank:r,round:w.round};
 const informational=action==='area';if(!informational){if(st.unconscious&&action!=='laststand'||Number(play.hp)<=0&&!w.lastStand&&action!=='laststand')fail('Personnage inconscient ou à 0 PV.');if(st.surprised&&action!=='laststand')fail('Le personnage est surpris.');if(st.stunned&&st.ranks.resistance<5)fail('Étourdi : aucune action possible.');}
 if(st.stunned&&action!=='area'&&!['laststand','power','double','circular','perfect','riposte','teigneux','reminder'].includes(action))fail('Étourdi : Dur à cuire autorise seulement une attaque avec dé malus.');
 if(key==='shield'&&!st.shield)fail('Il faut manier un bouclier.');
 if(action!=='reflect'&&action!=='absorb')w.absorbed=null;
 if(action==='protect'){if(input.inContact!==true||input.beforeResult!==true||!String(input.target||'').trim())fail('Précise l’allié au contact et confirme l’annonce avant le résultat.');quota(w,'protect');result={...result,target:String(input.target).trim(),allyDefenseBonus:2,message:'Allié protégé : +2 DEF contre cette attaque uniquement.'};}
 else if(action==='prepare'){if(st.stunned)fail('Étourdi : pas d’action de mouvement pour préparer une parade.');if(w.roundUses.parry)fail('Une parade a déjà été résolue ce round.');w.braced=true;result={...result,actionType:'M',message:'Posture préparée (M) : parer une attaque ou absorber un sort avant ton prochain tour.'};}
 else if(action==='parry'||action==='absorb'){const free=input.free===true;if(free&&(action!=='parry'||st.ranks.shield<5))fail('La parade gratuite nécessite le rang 5.');if(!free&&!w.braced)fail('Prépare d’abord la parade avec une action de mouvement.');if(action==='parry'&&!['contact','distance'].includes(input.incomingType))fail('Parade : attaque au contact ou à distance uniquement.');if(action==='absorb'&&input.spell!==true)fail('L’absorption exige un sort.');if(action==='absorb'&&st.stunned)fail('Dur à cuire autorise une attaque, pas l’absorption d’un sort.');if(input.stat!=='FOR'&&input.stat!=='AGI')fail('Choisis FOR ou AGI pour le test opposé.');const bonus=Number(ctx.contact??c.combat.contact)+(Number(c.stats[input.stat])||0)-(Number(c.stats.FOR)||0),mode=diceMode(false,free||st.weakened||st.stunned||(st.immobilized&&st.ranks.resistance<5)),roll=dice(input.rolls,mode),opposed=integer(input.opposed,-100,1000,'le total adverse'),total=roll+bonus;
 result={...result,roll,bonus,total,opposed,diceMode:mode,success:total>opposed,tie:total===opposed,actionType:free?'G':'M préparée'};if(total===opposed){result.message='Égalité : relancez le test opposé, aucune résolution consommée.';}else{quota(w,'parry');w.braced=false;if(action==='parry'){const damage=integer(input.damage,0,100000,'les dégâts reçus');result.damageTaken=total>opposed?(input.huge===true?Math.floor(damage/2):0):damage;out.hp=Math.max(0,Number(out.hp)-result.damageTaken);result.message=total>opposed?'Attaque parée.':'Parade manquée.';}else{result.damageTaken=total>opposed?0:null;result.message=total>opposed?'Sort absorbé pour toi ; les autres cibles d’une zone restent affectées.':'Sort non absorbé : appliquer ses effets.';if(total>opposed)w.absorbed={area:input.area===true,caster:String(input.target||'Lanceur'),round:w.round};}}}
 else if(action==='reflect'){if(!w.absorbed||w.absorbed.round!==w.round)fail('Aucun sort absorbé immédiatement auparavant.');if(w.absorbed.area)fail('Renvoi de sort interdit pour un sort de zone.');result={...result,target:w.absorbed.caster,actionType:'G',message:'Le sort absorbé est renvoyé sur son lanceur, qui subit les effets de sa propre attaque.'};w.absorbed=null;}
 else if(action==='vivacity'){if(st.stunned||st.immobilized)fail('Aucun mouvement supplémentaire dans cet état.');if(w.combatUses.vivacity)fail('Vivacité déjà utilisée ce combat.');w.combatUses.vivacity=1;result={...result,actionType:'M supplémentaire',extraMovement:1,message:'Une action de mouvement supplémentaire ce tour (une fois par combat).'};}
 else if(action==='laststand'){if(Number(play.hp)!==0)fail('Dur à cuire se déclenche à 0 PV.');if(w.lastStand)fail('Le dernier round est déjà actif.');if(w.combatUses.laststand)fail('Dur à cuire a déjà été utilisé ce combat.');w.combatUses.laststand=1;w.lastStand=true;out.conditions=out.conditions.filter(x=>x!=='Inconscient');result={...result,message:'Dernier round actif à 0 PV. Termine ce dernier round avec le bouton dédié : inconscience si aucun soin reçu.'};}
 else if(action==='constitution'||action==='strength'){if(st.stunned)fail('Étourdi : seulement une attaque.');const stat=action==='constitution'?'CON':'FOR',mode=diceMode(true,st.weakened),roll=dice(input.rolls,mode),total=roll+(Number(c.stats[stat])||0),difficulty=integer(input.difficulty,0,1000,'la difficulté');result={...result,stat,diceMode:mode,roll,total,opposed:difficulty,success:total>=difficulty,message:'Test héroïque de '+stat+' : '+total+'.'};}
 else if(action==='area'){if(st.surprised)fail('Pas de réduction au bouclier lorsque tu es surpris.');const damage=integer(input.damage,0,100000,'les dégâts de zone');result={...result,damageReduction:st.ranks.shield,damageTaken:Math.max(0,damage-st.ranks.shield),message:'Réduction du bouclier appliquée aux dégâts de zone.'};out.hp=Math.max(0,Number(out.hp)-result.damageTaken);}
 else if(action==='prowess'){if(st.stunned)fail('Étourdi : Dur à cuire permet seulement d’attaquer.');if(!['FOR','CON'].includes(input.stat))fail('Prouesse : choisir un test de FOR ou CON.');const cost=integer(input.cost,1,st.die,'le résultat du dé évolutif');if(cost>Number(play.hp))fail('PV insuffisants pour ce sacrifice.');quota(w,'prowess');out.hp-=cost;result={...result,stat:input.stat,hpCost:cost,testBonus:5,actionType:'G',message:'−'+cost+' PV ; +5 au test de '+input.stat+', utilisable après le résultat.'};}
 else{
 const weapon=ctx.weapons?.find(a=>a.id===input.weaponId);if(!weapon)fail('Choisis une arme disponible.');const ranged=/distance/i.test(weapon.type),wb=weaponBonus(c,weapon);if(st.shield&&Number(weapon.hands)>=2)fail('Range le bouclier pour manier cette arme à deux mains.');if(ranged&&!['perfect','disarm'].includes(action))fail('Cette capacité exige une attaque au contact.');if(['perfect','disarm'].includes(action)&&(!wb.preferred||ranged&&!categories(weapon).includes('thrown')))fail('Utilise une arme de prédilection, au contact ou une arme de jet.');if(st.stunned&&['maneuver','disarm'].includes(action))fail('Étourdi : seulement une attaque avec dégâts.');
 let mode=action,attackPenalty=['double','circular'].includes(action)?-2:0,power=action==='power'||input.power===true,limitedPower=action==='power'&&input.limited===true,bonusDice=0;
 if(power&&!ability(c,'combat',3))fail('Attaque puissante non acquise.');if(ranged&&power)fail('Attaque puissante : contact uniquement.');if(power)bonusDice=limitedPower?3:2;if(['perfect','disarm'].includes(action))bonusDice+=1;
 const bonus=['perfect','disarm','maneuver'].includes(action),malus=power||st.stunned||st.weakened||(st.immobilized&&st.ranks.resistance<5),rollMode=diceMode(bonus,malus);
 if(['riposte','teigneux','reminder'].includes(action)){if(input.inContact!==true||!String(input.target||'').trim())fail('Précise l’adversaire au contact.');if(action==='riposte'&&input.enemyMissed!==true)fail('Riposte : l’adversaire doit avoir raté une attaque au contact contre toi.');if(action==='teigneux'&&input.leaving!==true)fail('Teigneux : l’adversaire doit tenter de quitter ton contact.');if(action==='reminder'&&input.attacksOther!==true)fail('Piqûre de rappel : l’adversaire doit attaquer une autre créature.');if(action==='teigneux'){const limit=st.ranks.soldier>=5?Math.max(0,(Number(c.stats.AGI)||0)+2):1;if(w.targets.includes(String(input.target).trim().toLowerCase()))fail('Cet adversaire a déjà déclenché Teigneux ce round.');quota(w,'teigneux',limit);w.targets.push(String(input.target).trim().toLowerCase());}else quota(w,action);}
 if(action==='disarm'&&integer(input.nc,0,1000,'le NC de la cible')>=wb.damage)fail('Le NC doit être strictement inférieur au bonus de DM de Spécialisation ('+wb.damage+').');
 if(action==='maneuver'){if(!String(input.target||'').trim())fail('Précise la cible de la manœuvre.');const target=String(input.target).trim();attackPenalty-=5*(w.maneuvers[target]||0);w.maneuvers[target]=(w.maneuvers[target]||0)+1;}
 const rolls=action==='double'?2:action==='circular'?integer(input.targetCount,1,50,'le nombre d’adversaires au contact'):1;if(action==='circular'&&input.allInContact!==true)fail('Tous les adversaires de l’attaque circulaire doivent être au contact.');if(!Array.isArray(input.rolls)||input.rolls.length<rolls*(rollMode==='normal'?1:2))fail('Saisis les d20 requis pour chaque attaque.');const defenses=action==='circular'&&Array.isArray(input.defenses)&&input.defenses.length?input.defenses.map(v=>integer(v,0,1000,'la DEF de chaque adversaire')):null;if(defenses&&defenses.length!==rolls)fail('Indique une DEF par adversaire.');const opposed=action==='maneuver'?integer(input.opposed,-100,1000,'le total opposé'):defenses?0:integer(input.defense,0,1000,'la DEF de la cible');
 const attack=Number(weapon.attack??weapon.attackBonus)||0,rows=[];for(let i=0;i<rolls;i++){const n=rollMode==='normal'?1:2,roll=dice(input.rolls.slice(i*n,(i+1)*n),rollMode),total=attack+attackPenalty+roll,targetDefense=defenses?defenses[i]:opposed,crit=action!=='maneuver'&&roll>=(weapon.criticalThreshold??20),hit=action==='maneuver'?total>opposed:roll===1?false:crit||total>=targetDefense;rows.push({roll,total,targetDefense,attackBonus:attack+attackPenalty,hit,tie:action==='maneuver'&&total===opposed,critical:crit&&hit,damage:['maneuver','disarm'].includes(action)?'aucun':(crit&&hit?'('+String(weapon.damage||'')+') × 2':String(weapon.damage||''))+(bonusDice?' + '+bonusDice+'d'+st.die:''),bonusDice,bonusDie:st.die});}
 if(action==='maneuver'&&rows[0].tie){w.maneuvers[String(input.target).trim()]--;result.message='Égalité au test opposé : relancez.';}else result.message=action==='maneuver'?'Manœuvre : '+(rows[0].hit?'test opposé réussi.':'test opposé manqué.'):action==='disarm'?'Attaque parfaite : aucun dégât, désarmement si l’attaque touche.':'Résolution de la capacité.';
 result={...result,weapon:weapon.name,actionType:['double','circular','perfect','disarm','maneuver'].includes(action)||limitedPower?'L':['riposte','teigneux','reminder'].includes(action)?'G':'A',diceMode:rollMode,attackPenalty,rows};
 if(action==='teigneux'&&st.ranks.soldier>=5)result.stopsMovement=rows[0].hit;if(action==='reminder'){const intelligence=integer(input.targetInt,-20,20,'l’INT de l’adversaire'),damageDealt=integer(input.damageDealt,0,100000,'les DM infligés');result.mustTargetWarrior=rows[0].hit&&intelligence<0&&damageDealt>0;}
 }
 w.lastResult=result;out.warrior=w;return{play:out,result};}
const api={rank,code,isAbility,inspect,state,reset,resolve,evolvingDie,categories,training,weaponBonus,requirements};root.FOHWarriorCombat=api;if(typeof module==='object')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

/* END GENERATED GUERRIER COMBAT */
(async function(){
'use strict';
let D=window.BASTIDE_CHARACTER;let levelRevision=0,levelLoadError=false;
if(!D){document.body.innerHTML='<p>Fiche de personnage indisponible.</p>';return}
async function apiItem(){}
async function apiCompanion(){}
function renderAtelier(){}
function renderShared(){}
function renderSessionInitiative(){}
function syncResourceDelta(){}
const speedStyle=document.createElement('style');speedStyle.textContent='.warrior-fields{display:grid;gap:10px}.warrior-fields label{display:grid;gap:4px}.warrior-fields input,.warrior-fields select{max-width:100%;min-height:38px}.warrior-fields input[type=checkbox]{min-height:auto}.warrior-ability [data-warrior-result]{margin-top:12px} [hidden]{display:none!important}.resources{grid-template-columns:repeat(7,1fr)}.resource em{display:block;margin-top:2px;color:#71664f;font-size:.65rem;font-style:normal;font-weight:800}.shared-entry{white-space:pre-line}.document-link{display:inline-flex;margin-top:8px}.bag-shell{border:1px solid #bca970;border-radius:14px;background:#f5ecd0;padding:10px}.bag-shell>h3{margin:0 0 4px;color:#70551b}.bag-shell>.inventory-list{margin-top:9px}@media(max-width:760px){.resources{grid-template-columns:repeat(4,1fr)}.resource:nth-child(3){border-right:1px solid #c7b887}.resource:nth-child(4){border-right:0}.resource:nth-child(-n+4){border-bottom:1px solid #c7b887}}@media(max-width:390px){.resources{grid-template-columns:repeat(2,1fr)}.resource:nth-child(odd){border-right:1px solid #c7b887}.resource:nth-child(even){border-right:0}.resource:nth-child(-n+6){border-bottom:1px solid #c7b887}}';document.head.appendChild(speedStyle);
const hasAnimalCompanion=(D.paths||[]).some(p=>/compagnon animal/i.test(p.name||'')&&(p.ranks||[]).some(r=>r.owned));
const WC=window.FOHWarriorCombat;
const id=D.id||'hero',key='cof2_solo_play_'+id,oldKey='cof2_solo_play_'+id;
const max={hp:Number(D.combat?.pvMax)||0,pc:Number(D.combat?.pcMax)||0,pm:Number(D.combat?.pmMax)||0,dr:Number(D.combat?.recoveryMax)||0};
const defaults={hp:max.hp,pc:max.pc,pm:max.pm,dr:max.dr,silver:Number(D.combat?.silver)||0,money:{po:0,pa:Number(D.combat?.silver)||0,pc:0},player:'',ideal:D.heroicIdeal||'',flaw:D.flaw||'',notes:'',conditions:[],uses:{},ammo:{},inventory:null,companion:hasAnimalCompanion?{name:'Mon loup',hp:Math.max(1,Number(D.level)||1)*4}:null};
// Authoritative library snapshot wins over the legacy mirror, including removed fields.
let S=window.SOLO_PLAY_STATE&&typeof window.SOLO_PLAY_STATE==='object'?Object.assign({},defaults,window.SOLO_PLAY_STATE):load();
if(Array.isArray(S.conditions))S.conditions=[...new Set(S.conditions.map(effectiveCondition))];
const starterInventory=!Array.isArray(S.inventory);if(starterInventory)S.inventory=D.equipment||[];
function load(){if(window.SOLO_HUB_MODE)return Object.assign({},defaults);let value=null;try{value=JSON.parse(localStorage.getItem(key)||'null')}catch(_e){}if(!value){try{value=JSON.parse(localStorage.getItem(oldKey)||'null')}catch(_e){}}return Object.assign({},defaults,value||{})}
let syncStatus='local',adminView=false,lastUnseen=0,pollTimer=null,transferRecipients=[],sharedEntries=[];
function save(){try{parent.saveSoloSheet(id,JSON.parse(JSON.stringify(S)));if(!window.SOLO_HUB_MODE)localStorage.setItem(key,JSON.stringify(S));}catch(e){const alert=document.getElementById('toast');if(alert){alert.textContent='Sauvegarde non effectuée : '+e.message;alert.classList.add('show');}try{if(!window.SOLO_HUB_MODE)localStorage.setItem('cof2_unsaved_recovery_'+id,JSON.stringify({id,date:new Date().toISOString(),play:S}));}catch{}}}
function esc(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function signed(n){n=Number(n)||0;return(n>=0?'+':'')+n}
function slug(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function cleanAbilityName(a){return slug(a?.name||'').replace(/^rang-\d+-/,'');}
function clamp(n,min,maxi){return Math.max(min,Math.min(maxi,Number(n)||0))}
const gridMeters=Number(D.combat.gridMeters)||1.5;
function movement(){const meters=Math.max(0,Number(D.combat?.speedMeters)||10);return{meters,cases:Math.floor(meters/gridMeters),doubleMeters:meters*2,doubleCases:Math.floor(meters*2/gridMeters),sprintMeters:meters*3,sprintCases:Math.floor(meters*3/gridMeters)}}
function itemCategory(name){const n=String(name).toLowerCase();if(/armure|cuir|broigne|maille|bouclier/.test(n))return'Protection';if(/épée|dague|rapière|javelot|masse|pétoire|arc|arbalète|couteau/.test(n))return'Arme';if(/potion|onguent|soin|élixir/.test(n))return'Consommable';return'Équipement'}
function normalizeItem(item,index=Date.now()){const name=String(item?.name||'Nouvel objet'),equipment=item?.equipment&&typeof item.equipment==='object'?item.equipment:{};return{id:String(item?.id||slug(name+'-'+index)||('objet-'+index)),name,base:String(item?.base||''),category:String(item?.category||itemCategory(name)),quantity:Math.max(0,Number(item?.quantity??1)||0),equipped:Boolean(item?.equipped),chargesMax:Math.max(0,Number(item?.chargesMax)||0),charges:Math.max(0,Number(item?.charges??item?.chargesMax)||0),notes:String(item?.notes||''),mediaUrl:String(item?.mediaUrl||''),mediaType:String(item?.mediaType||''),documentUrl:String(item?.documentUrl||''),containerType:String(item?.containerType||''),containerId:String(item?.containerId||''),source:String(item?.source||'joueur'),shopItemId:String(item?.shopItemId||''),purchasePriceSilver:Math.max(0,Number(item?.purchasePriceSilver)||0),salePriceSilver:Math.max(0,Number(item?.salePriceSilver)||0),salePriceApproved:item?.salePriceApproved===true,receivedAt:String(item?.receivedAt||''),equipment}}
const SLOT_LABELS={main_hand:'Main principale',off_hand:'Seconde main',armor:'Armure',shield:'Bouclier',feet:'Bottes',accessory_1:'Accessoire 1',accessory_2:'Accessoire 2'};
const EQUIPMENT_PROFILES={
  none:{label:'Aucun effet automatique',equipment:{}},
  armor1:{label:'Tissus matelassés / fourrures · DEF +1',category:'Protection',base:'Tissus matelassés, fourrures',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 1.',bonuses:{armorDef:1}}},
  armor2:{label:'Cuir simple · DEF +2',category:'Protection',base:'Cuir simple',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 2.',bonuses:{armorDef:2}}},
  armor3:{label:'Cuir renforcé / broigne · DEF +3',category:'Protection',base:'Cuir renforcé, broigne',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 3.',bonuses:{armorDef:3}}},
  armor4:{label:'Chemise de mailles · DEF +4',category:'Protection',base:'Chemise de mailles',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 4.',bonuses:{armorDef:4}}},
  armor5:{label:'Cotte de mailles · DEF +5',category:'Protection',base:'Cotte de mailles',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 5.',bonuses:{armorDef:5}}},
  armor6:{label:'Armure de plaques · DEF +6',category:'Protection',base:'Armure de plaques',equipment:{slot:'armor',effect:'Armure COF2 : valeur d’armure 6.',bonuses:{armorDef:6}}},
  armor7:{label:'Plaque complète · DEF +7 (capacité requise)',category:'Protection',base:'Plaque complète',equipment:{slot:'armor',effect:'Armure sur mesure : rang 2 de la voie de la noblesse requis.',bonuses:{armorDef:7}}},
  shield1:{label:'Petit bouclier · DEF +1',category:'Protection',base:'Petit bouclier',equipment:{slot:'shield',effect:'Bouclier COF2 : DEF +1.',bonuses:{shieldDef:1}}},
  shield2:{label:'Grand bouclier · DEF +2',category:'Protection',base:'Grand bouclier',equipment:{slot:'shield',effect:'Bouclier COF2 : DEF +2.',bonuses:{shieldDef:2}}},
  dagger:{label:'Dague · contact 1d4 / lancer 5 m',category:'Arme',base:'Dague',equipment:{slot:'main_hand',effect:'Arme légère, perforante.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d4',damageStat:'FOR',damageType:'perforants'},{label:'Lancer',attackType:'distance',damage:'1d4',range:'5 m',damageType:'perforants'}]}}},
  shortsword:{label:'Épée courte · contact 1d6',category:'Arme',base:'Épée courte',equipment:{slot:'main_hand',effect:'Arme légère, perforante.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d6',damageStat:'FOR',damageType:'perforants'}]}}},
  longsword:{label:'Épée longue · contact 1d8',category:'Arme',base:'Épée longue',equipment:{slot:'main_hand',effect:'Arme tranchante.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d8',damageStat:'FOR',damageType:'tranchants'}]}}},
  rapier:{label:'Rapière · contact 1d6 · critique 19-20',category:'Arme',base:'Rapière',equipment:{slot:'main_hand',effect:'Arme légère ; critique sur 19-20.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d6',damageStat:'FOR',damageType:'perforants',special:'critique 19-20'}]}}},
  staff:{label:'Bâton ferré · contact 1d6',category:'Arme',base:'Bâton ferré',equipment:{slot:'main_hand',effect:'Arme à deux mains, contondante.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d6',damageStat:'FOR',damageType:'contondants'}]}}},
  mace:{label:'Masse · contact 1d6',category:'Arme',base:'Masse',equipment:{slot:'main_hand',effect:'Arme contondante.',weapon:{modes:[{label:'Contact',attackType:'contact',damage:'1d6',damageStat:'FOR',damageType:'contondants'}]}}},
  spear:{label:'Lance · contact 1d6 / lancer 10 m',category:'Arme',base:'Lance',equipment:{slot:'main_hand',effect:'Une main : 1d6 ; deux mains : 1d10 ; lancer : 1d6 à 10 m.',weapon:{modes:[{label:'Contact (1 main)',attackType:'contact',damage:'1d6',damageStat:'FOR',damageType:'perforants'},{label:'Contact (2 mains)',attackType:'contact',damage:'1d10',damageStat:'FOR',damageType:'perforants'},{label:'Lancer',attackType:'distance',damage:'1d6',range:'10 m',damageType:'perforants'}]}}},
  javelin:{label:'Javelot · distance 1d6 · 20 m',category:'Arme',base:'Javelot',equipment:{slot:'main_hand',effect:'Arme de lancer perforante.',weapon:{modes:[{label:'Lancer',attackType:'distance',damage:'1d6',range:'20 m',damageType:'perforants'}]}}},
  shortbow:{label:'Arc court · distance 1d6 · 30 m',category:'Arme',base:'Arc court',equipment:{slot:'main_hand',effect:'Arme à deux mains.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d6',range:'30 m',damageType:'perforants'}]}}},
  longbow:{label:'Arc long · distance 1d8 · 50 m',category:'Arme',base:'Arc long',equipment:{slot:'main_hand',effect:'Arme à deux mains ; FOR minimale +1.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d8',range:'50 m',damageType:'perforants'}]}}},
  handcrossbow:{label:'Arbalète de poing · distance 1d6 · 10 m',category:'Arme',base:'Arbalète de poing',equipment:{slot:'main_hand',effect:'Rechargement : action de mouvement.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d6',range:'10 m',damageType:'perforants',special:'rechargement (M)'}]}}},
  musket:{label:'Pétoire · distance 1d10 · 20 m',category:'Arme',base:'Pétoire',equipment:{slot:'main_hand',effect:'Arme à poudre ; rechargement : action limitée.',weapon:{modes:[{label:'Distance',attackType:'distance',damage:'1d10',range:'20 m',damageType:'perforants',special:'rechargement (L)'}]}}}
};
const BASIC_PRICES={armor1:2,armor2:4,armor3:8,armor4:15,armor5:25,armor6:60,armor7:200,shield1:2,shield2:4,dagger:3,shortsword:5,longsword:6,rapier:6,staff:2,mace:4,spear:4,javelin:1,shortbow:4,longbow:8,handcrossbow:8,musket:50};
const BASIC_AGI_CAPS={armor1:7,armor2:6,armor3:5,armor4:4,armor5:3,armor6:2,armor7:1};
function basicItem(key,id){const p=EQUIPMENT_PROFILES[key];if(!p||key==='none'||!p.base)return null;return normalizeItem({id,name:p.base,base:p.base,category:p.category,quantity:1,equipped:false,source:'Catalogue COF2',equipment:JSON.parse(JSON.stringify(p.equipment)),notes:p.equipment?.slot==='armor'?'AGI max +'+BASIC_AGI_CAPS[key]+' · malus aux tests d’AGI : -'+p.equipment.bonuses.armorDef+' (règle p. 188).':''});}
function catalogItemHtml(){const entries=Object.entries(EQUIPMENT_PROFILES).filter(([k,p])=>k!=='none'&&p.base);return '<details class="basic-catalog"><summary>＋ Catalogue d’équipement COF2</summary><p>Ajout au sac avec ses caractéristiques préremplies. Le prix est indicatif ; la bourse ne change pas. Équipe ensuite l’objet.</p><input data-catalog-search type="search" placeholder="Chemise, bouclier, arme…" aria-label="Rechercher un équipement"><div class="basic-catalog-list">'+['Protection','Arme'].map(c=>'<h4>'+c+'s</h4>'+entries.filter(([k,p])=>p.category===c).map(([k,p])=>'<button type="button" class="basic-catalog-item" data-catalog-item="'+esc(k)+'"><strong>'+esc(p.base)+'</strong><small>'+esc(p.label.split(' · ').slice(1).join(' · '))+(BASIC_PRICES[k]!=null?' · '+BASIC_PRICES[k]+' pa':'')+'</small><span aria-hidden="true">＋</span></button>').join('')).join('')+'</div></details>';}

function protectionProfile(item){const n=slug([item?.name,item?.base].filter(Boolean).join(' '));if(/sans-armure|sans-bouclier|aucun-bouclier|aucune-armure/.test(n))return '';if(/grand-bouclier/.test(n))return 'shield2';if(/petit-bouclier|bouclier/.test(n))return 'shield1';if(/plaque-complete/.test(n))return 'armor7';if(/plaque/.test(n))return 'armor6';if(/cotte-de-mailles/.test(n))return 'armor5';if(/chemise-de-mailles/.test(n))return 'armor4';if(/cuir-renforce|broigne/.test(n))return 'armor3';if(/cuir-simple|armure-de-cuir/.test(n))return 'armor2';if(/matelass|fourrure/.test(n))return 'armor1';return '';}
function withMechanicalProfile(item){if(item.equipment?.slot||item.manualNoProfile)return item;const p=EQUIPMENT_PROFILES[protectionProfile(item)];if(p){item.equipment=JSON.parse(JSON.stringify(p.equipment));item.base=item.base||p.base;item.category=p.category;}return item;}
function protectionValues(items){const result={armor:0,shield:0};for(const x of items||[]){const item=typeof x==='string'?{name:x}:x,e=item?.equipment||{},p=EQUIPMENT_PROFILES[protectionProfile(item)];const slot=e.slot||p?.equipment?.slot;if(slot==='armor'||slot==='shield'){const key=slot==='armor'?'armorDef':'shieldDef',value=e.bonuses?.[key]??p?.equipment?.bonuses?.[key]??0;result[slot]=Math.max(result[slot],Number(value)||0);}}return result;}
S.inventory=S.inventory.map((item,index)=>{const raw=typeof item==='string'?{name:item}:(item||{});const normalized=normalizeItem(raw,index);normalized.manualNoProfile=raw.manualNoProfile===true;withMechanicalProfile(normalized);if(starterInventory&&normalized.quantity>0&&(normalized.equipment?.slot==='armor'||normalized.equipment?.slot==='shield'))normalized.equipped=true;return normalized;});

function equipmentProfile(item){const e=item.equipment||{},b=e.bonuses||{};if(e.slot==='armor'&&Number.isFinite(Number(b.armorDef)))return'armor'+Number(b.armorDef);if(e.slot==='shield'&&Number.isFinite(Number(b.shieldDef)))return'shield'+Number(b.shieldDef);const base=String(item.base||'').toLowerCase();return Object.keys(EQUIPMENT_PROFILES).find(k=>k!=='none'&&String(EQUIPMENT_PROFILES[k].base||'').toLowerCase()===base)||'none'}
function equippedItems(){return S.inventory.filter(x=>x.equipped&&x.quantity>0)}
// The creation snapshot already includes selected protection, even when the
// conditional bone armour has not been prepared in play. Remove that baseline
// before applying current protection; ownership never confirms daily upkeep.
function isBoneArmorItem(item){const raw=typeof item==='string'?item:[item?.name,item?.base,item?.sourceId].filter(Boolean).join(' ');return /armure-d-os|armor-os-sorcier/.test(slug(raw));}
function startingPhysicalProtection(){return protectionValues((D.equipment||[]).filter(x=>!isBoneArmorItem(x)));}
function startingProtection(){const result=startingPhysicalProtection();if((D.equipment||[]).some(isBoneArmorItem))result.armor=Math.max(result.armor,boneArmorValue());return result;}
function isArquebusier(){return /arquebusier/i.test(String(D.profile||''))||(D.paths||[]).some(p=>/class-arquebusier/.test(String(p.pathId||'')));}
function hasPetoire(){return isArquebusier()&&([...S.inventory.map(x=>x.name),...(D.attacks||[]).map(x=>x.name)].some(n=>/p[ée]toire/i.test(n)));}
function isExplosives(a){return /voie-des-explosifs/.test(slug(a.path||''))||/voie-des-explosifs/.test(String(a.pathId||''));}

function hasPsiShield(){return ownedAbilities().some(a=>Number(a.rank)===2&&cleanAbilityName(a)==='bouclier-psi'&&slug(a.path)==='voie-de-l-attaque-mentale');}
function psiShieldPanel(){if(!hasPsiShield())return'';const current=finalValue('def');return '<article class="card psi-shield-card"><h3>Bouclier psi · rang 2</h3><p><b>DEF normale : '+current+'</b> · <b>DEF contre une attaque mentale : '+(current+5)+'</b></p><p>Passif : le bonus +5 s’applique uniquement aux attaques mentales psi ou magiques, pas aux attaques physiques. Les DM de la capacité Attaque mentale sont divisés par 2.</p><small>Voie de l’attaque mentale, rang 2. La DEF générale reste inchangée.</small></article>';}
function isSuccubusAbility(a){return Number(a.rank)===2&&cleanAbilityName(a).startsWith('beaute-de-la-succube')&&slug(a.path)==='voie-du-demon';}
function succubusAbility(){return ownedAbilities().find(isSuccubusAbility);}
function succubusState(){const a=S.succubusCharm||{};return {active:a.active===true,minutesRemaining:Math.max(0,Number(a.minutesRemaining)||0)};}
function succubusActive(){const a=succubusState();return !!succubusAbility()&&a.active&&a.minutesRemaining>0;}
function succubusPanel(){const a=succubusAbility();if(!a)return'';const st=succubusState(),active=succubusActive(),cost=Number(a.rank)||2,duration=Math.max(1,Number(D.stats?.INT)||0);return '<article class="card succubus-card"><h3>Beauté de la succube · rang 2</h3><p><b>'+(active?'Sort actif · '+st.minutesRemaining+' min restantes':'Sort inactif')+'</b> · Dé bonus aux tests de CHA tant que le sort est actif.</p><p>Attaque de contact : <b>1d20 '+signed(finalValue('magic'))+'</b> (attaque magique) contre DEF ; dégâts <b>1d4°'+signed(Number(D.stats?.INT)||0)+'</b>. Le sorcier récupère autant de PV que la cible en a réellement perdus, sans dépasser ses PV max.</p><div class="ability-actions">'+(active?'<label>PV réellement perdus par la cible <input type="number" min="0" max="999" step="1" value="0" inputmode="numeric" data-succubus-heal></label><button type="button" class="mini-button primary" data-succubus-action="heal">Appliquer le vol de vie</button><label>Minutes écoulées <input type="number" min="1" max="10000" value="1" step="1" inputmode="numeric" data-succubus-minutes></label><button type="button" class="mini-button" data-succubus-action="tick">Avancer le temps</button><button type="button" class="mini-button" data-succubus-action="end">Terminer</button>':'<button type="button" class="mini-button primary" data-succubus-action="cast" '+(S.pm<cost||rageActive()?'disabled':'')+'>Lancer ('+cost+' PM)</button>')+'</div><small>Durée : INT minutes ('+duration+' min suivant les caractéristiques actuelles). Les jets se font à la table ; seuls les PV réellement perdus par la cible sont récupérés. COF2 livre de base p. 108.</small></article>';}
function mutationAbilityIs(a){return Number(a.rank)===2&&cleanAbilityName(a)==='mutation-protectrice'&&slug(a.path)==='voie-des-mutations';}
function mutationAbility(){return ownedAbilities().find(mutationAbilityIs);}
const MUTATION_EFFECTS={cuirasse:'Cuirasse : DEF +rang de la voie',ecailles:'Écailles rouges : dégâts de feu et acide divisés par deux',fourrure:'Fourrure violette : dégâts de froid et foudre divisés par deux',ouies:'Ouïes : respiration aquatique',sang:'Sang noir : immunité au poison ou aux maladies (choix du MJ)'};
function mutationState(){const a=S.mutationProtectrice||{};return {active:a.active===true,mode:String(a.mode||''),minutesRemaining:Math.max(0,Number(a.minutesRemaining)||0)};}
function mutationActive(){const a=mutationState();return !!mutationAbility()&&a.active&&a.minutesRemaining>0&&Object.hasOwn(MUTATION_EFFECTS,a.mode);}
function mutationDefenseBonus(){return mutationActive()&&mutationState().mode==='cuirasse'?ownedPathRank('voie-des-mutations'):0;}
function mutationPanel(){const a=mutationAbility();if(!a)return'';const st=mutationState(),active=mutationActive(),cost=Number(a.rank)||2,minutes=Math.max(1,5+Number(D.stats?.CHA||0));return '<article class="card mutation-protectrice-card"><h3>Mutation protectrice · rang '+a.rank+'</h3><p><b>'+(active?esc(MUTATION_EFFECTS[st.mode]):'Aucune mutation active')+'</b>'+(active?' · '+st.minutesRemaining+' min restantes':'')+'</p><p>Une seule mutation protectrice à la fois, durée '+minutes+' min. Le choix Cuirasse modifie automatiquement la DEF ; les résistances et immunités sont indiquées pour les dégâts reçus.</p><div class="ability-actions">'+(active?'<label>Minutes écoulées <input type="number" min="1" max="10000" step="1" inputmode="numeric" value="1" data-mutation-minutes></label><button type="button" class="mini-button" data-mutation-action="tick">Avancer le temps</button><button type="button" class="mini-button" data-mutation-action="end">Terminer</button>':'<label>Mutation <select data-mutation-choice>'+Object.entries(MUTATION_EFFECTS).map(([key,label])=>'<option value="'+key+'">'+esc(label)+'</option>').join('')+'</select></label><button type="button" class="mini-button primary" data-mutation-action="cast" '+(S.pm<cost?'disabled':'')+'>Activer ('+cost+' PM)</button>')+'</div><small>Source : Compagnon, Voie des mutations rang 2. Le suivi du temps est en temps de jeu, pas en temps réel.</small></article>';}
function isBoneArmorAbility(a){return Number(a.rank)===2&&cleanAbilityName(a)==='armure-d-os'&&(/outre-tombe/.test(slug(a.path||''))||/outre-tombe/.test(String(a.pathId||'')));}
function hasBoneArmor(){return ownedAbilities().some(isBoneArmorAbility);}
function boneArmorDay(){return 'jdr-'+Math.max(0,Math.floor(Number(S.gameDay)||0));}
function boneArmorState(){const a=S.boneArmor;return a&&typeof a==='object'&&!Array.isArray(a)?a:{crafted:false,worn:false,maintainedDay:''};}
function boneArmorValue(){const names=new Set(['voie-du-demon','voie-de-la-mort','voie-de-l-outre-tombe','voie-du-sang','voie-de-la-sombre-magie']);return 3+(D.paths||[]).filter(p=>(/class-sorcier/.test(String(p.pathId||''))||!p.pathId&&names.has(slug(p.name||'')))&&(p.ranks||[]).some(r=>r.owned&&Number(r.rank)>=4)).length;}
function boneArmorPhysicalConflict(){return equippedItems().some(x=>x.equipment?.slot==='armor'&&!isBoneArmorItem(x));}
function boneArmorActive(){const a=boneArmorState();return hasBoneArmor()&&a.crafted===true&&a.worn===true&&a.maintainedDay===boneArmorDay()&&!boneArmorPhysicalConflict();}
function boneArmorPanel(){if(!hasBoneArmor())return'';const a=boneArmorState(),today=boneArmorDay(),maintained=a.maintainedDay===today,active=boneArmorActive(),conflict=boneArmorPhysicalConflict();const state=!a.crafted?'Absente : ossements nécessaires':!a.worn?'Confectionnée, non portée':!maintained?'Entretien de 10 min à effectuer aujourd’hui':conflict?'Autre armure portée : bonus suspendu':'Portée et entretenue aujourd’hui';const button=(act,label,off)=>'<button type="button" class="mini-button'+(act==='maintain'||act==='craft'?' primary':'')+'" data-bone-action="'+act+'"'+(off?' disabled':'')+'>'+label+'</button>';return '<article class="card bone-armor-card"><h3>Armure d’os · rang 2</h3><p><b>'+esc(state)+'</b> · <strong>'+esc(active?'DEF +'+boneArmorValue()+' appliqué':'DEF +0 (inactive)')+'</strong></p><p>Cette armure remplace une armure ordinaire. Confection personnelle à partir d’ossements, entretien magique de 10 min chaque jour. Aucun coût en PM indiqué par la règle.</p><div class="ability-actions">'+button('craft','Confectionner avec des ossements',a.crafted)+button('maintain',maintained?'Entretien effectué aujourd’hui':'Confirmer les 10 min d’entretien',!a.crafted||maintained)+button('wear',a.worn?'Retirer l’armure':'Porter l’armure',!a.crafted)+button('lose','Perdue / détruite',!a.crafted)+button('newday','Nouveau jour en jeu',false)+'</div><small>Le bonus se retire automatiquement si l’armure est absente, retirée, non entretenue ce jour ou remplacée par une autre armure. COF2, Livre de base, voie de l’outre-tombe, rang 2.</small></article>';}


function isManaArmorAbility(a){return Number(a.rank)===1&&cleanAbilityName(a).startsWith('armure-de-mana');}
function manaArmorAbility(){return ownedAbilities().find(isManaArmorAbility);}
function manaArmorState(){const a=S.manaArmor;return a&&typeof a==='object'&&!Array.isArray(a)?a:{active:false,minutesRemaining:0};}
function manaArmorValue(){return ownedPathRank('voie-de-la-magie-protectrice')>=3?4:3;}
function manaArmorDuration(){return Math.max(1,Number(D.stats?.INT)||0);}
function manaArmorActive(){const a=manaArmorState();return !!manaArmorAbility()&&a.active===true&&Number(a.minutesRemaining)>0&&!boneArmorActive()&&!boneArmorPhysicalConflict();}
function manaArmorPanel(){const a=manaArmorAbility();if(!a)return'';const current=manaArmorState(),active=manaArmorActive(),block=boneArmorActive()||boneArmorPhysicalConflict(),minutes=Math.max(0,Number(current.minutesRemaining)||0),cost=Number(a.rank)||1,button=(op,label,disabled)=>'<button type="button" class="mini-button'+(op==='cast'?' primary':'')+'" data-mana-armor="'+op+'"'+(disabled?' disabled':'')+'>'+label+'</button>';return '<article class="card mana-armor-card"><h3>Armure de mana · rang '+a.rank+'</h3><p><b>'+esc(active?'Protection active : DEF +'+manaArmorValue():current.active&&block?'Protection suspendue (autre armure)':'Protection inactive')+'</b></p><p>Coût : '+cost+' PM. Durée : '+manaArmorDuration()+' min de jeu, dont '+minutes+' restantes. Ne se cumule pas avec une armure ordinaire, l’armure d’os ou un autre sort de protection.</p><div class="ability-actions">'+button('cast','Lancer l’armure ('+cost+' PM)',current.active||S.pm<cost||block)+ (current.active?'<label>Minutes écoulées <input data-mana-armor-minutes type="number" min="1" step="1" value="1" inputmode="numeric"></label>'+button('tick','Avancer le temps',false)+button('end','Terminer le sort',false):'')+'</div><small>Le bonus et le coût sont intégrés à la fiche. COF2, Livre de base, Voie de la magie protectrice, rang 1.</small></article>';}


function hasPacifism(){return ownedAbilities().some(a=>Number(a.rank)===1&&cleanAbilityName(a)==='pacifisme'&&slug(a.path)==='voie-de-la-meditation');}
function pacifismActive(){return hasPacifism()&&!S.pacifismBroken;}
function pacifismPanel(){if(!hasPacifism())return'';return '<article class="card"><h3>Pacifisme · rang 1</h3><p><b>'+esc(pacifismActive()?'+5 DEF et DM reçus divisés par deux (aucune offensive)':'Bonus désactivé : offensive effectuée')+'</b></p><div class="ability-actions"><button type="button" class="mini-button" data-pacifism-offense '+(!pacifismActive()?'disabled':'')+'>J’ai effectué une action offensive</button><button type="button" class="mini-button" data-pacifism-new '+(pacifismActive()?'disabled':'')+'>Nouveau combat</button></div><small>Les attaques sont lancées physiquement ; indique ici ton premier acte offensif. Le bonus revient au début du combat suivant.</small></article>';}
function hasCrossParry(){return ownedAbilities().some(a=>Number(a.rank)===2&&cleanAbilityName(a)==='parade-croisee'&&slug(a.path)==='voie-du-combat-a-deux-armes');}
function dualWeaponsEquipped(){return equippedItems().some(x=>x.equipment?.slot==='main_hand')&&equippedItems().some(x=>x.equipment?.slot==='off_hand');}
function crossParryBonus(){if(!hasCrossParry()||!(S.dualWield===true||dualWeaponsEquipped()))return 0;const rank=ownedPathRank('voie-du-combat-a-deux-armes'),value=rank>=5?2:1;return value*(S.crossParryDouble===true?2:1);}
function crossParryPanel(){if(!hasCrossParry())return'';const ready=S.dualWield===true||dualWeaponsEquipped(),bonus=crossParryBonus();return '<article class="card"><h3>Parade croisée · rang 2</h3><p><b>DEF '+(bonus?'+'+bonus+' actif':'sans bonus')+'</b> · '+(ready?'Deux armes déclarées':'Deux armes nécessaires')+'.</p><div class="ability-actions"><button type="button" class="mini-button" data-cross-parry="weapons">'+(ready?'Arrêter le combat à deux armes':'Confirmer une arme dans chaque main')+'</button><button type="button" class="mini-button" data-cross-parry="double" '+(!ready?'disabled':'')+'>'+(S.crossParryDouble?'Reprendre les attaques secondaires':'Renoncer à l’attaque secondaire (+DEF ce tour)')+'</button></div><small>Sans attaque de la main secondaire : double bonus jusqu’au prochain tour. Confirme ton équipement et ta tactique.</small></article>';}
function sacredVestmentAdjustment(armor){
 const owned=ownedAbilities().find(a=>slug(a.path)==='voie-de-la-spiritualite'&&Number(a.rank)===1);
 if(!owned||owned.choices?.sacredVestments==='WARRIOR_MAIL')return 0;
 const rank=ownedPathRank('voie-de-la-spiritualite'),now=armor<=0?(rank>=5?4:rank>=3?3:2):0;
 const ledger=D.forgeSnapshot?.ruleCompletionLedger;
 const prior=Array.isArray(ledger)?ledger.filter(e=>e.key==='DEF'&&(e.condition==='sacred_vestments'||String(e.abilityId||'').includes('voie-de-la-spiritualite'))).reduce((sum,e)=>sum+Number(e.value||0),0):startingProtection().armor===0?(rank>=5?4:rank>=3?3:2):0;
 return now-prior;
}


function hasMageFamiliarAbility(a){return Number(a.rank)===2&&cleanAbilityName(a).startsWith('familier')&&slug(a.path)==='voie-de-la-magie-universelle';}
function hasMageFamiliar(){return ownedAbilities().some(hasMageFamiliarAbility);}
function hasInvokerFamiliar(){return ownedAbilities().some(a=>Number(a.rank)===1&&cleanAbilityName(a)==='familier'&&slug(a.path)==='voie-du-familier');}
function hasPersonalFamiliar(){return hasMageFamiliar()||hasInvokerFamiliar();}
function familiarState(){const a=S.familiarControl;return a&&typeof a==='object'&&!Array.isArray(a)?a:{present:false,visible:false,awaitRest:false};}
function familiarInSight(){const a=familiarState();return hasPersonalFamiliar()&&a.present===true&&a.visible===true&&!a.awaitRest;}
function familiarDefBonus(){return familiarInSight()&&hasMageFamiliar()?2:0;}
function familiarInitBonus(){return familiarInSight()?2:0;}
function familiarPanel(){if(!hasPersonalFamiliar())return'';const a=familiarState(),mage=hasMageFamiliar(),visible=familiarInSight();const btn=(op,label,disabled)=>'<button type="button" class="mini-button'+(op==='summon'?' primary':'')+'" data-personal-familiar="'+op+'"'+(disabled?' disabled':'')+'>'+label+'</button>';return '<article class="card personal-familiar-card"><h3>Familier · '+(mage?'magicien':'invocateur')+'</h3><p><b>'+(a.awaitRest?'Disparu : récupération complète requise':!a.present?'Absent':visible?'En vue : bonus actifs':'Présent, hors de vue')+'</b> · '+(mage?'DEF '+(visible?'+2':'0')+' et INIT '+(visible?'+2':'0'):'INIT '+(visible?'+2':'0'))+'</p><p>Les bonus ne s’appliquent que lorsque le familier est en vue. Les points de vie et capacités du familier sont détaillés dans le pouvoir.</p><div class="ability-actions">'+btn('summon',mage?'Invoquer (2 PM)':'Présenter le familier',a.present||a.awaitRest||mage&&S.pm<2)+btn('existing','Déjà présent avant ouverture de cette fiche',a.present||a.awaitRest)+btn('sight',visible?'Le familier quitte ma vue':'Le familier est dans ma vue',!a.present||a.awaitRest)+btn('lost','Le familier est vaincu',!a.present)+'</div>'+(a.present&&mage?'<label>Si le familier est détruit : contrecoup 1d'+evolvingDie()+'° PV <input data-familiar-backlash type="number" min="1" max="'+evolvingDie()+'" step="1" inputmode="numeric" placeholder="Résultat du dé"></label>':'')+(a.awaitRest&&!mage?btn('recover24','24 heures de jeu écoulées',false):'')+'<small>'+(mage?'Le familier ne peut réapparaître qu’après une récupération complète s’il est détruit.':'Le familier de l’invocateur peut être à nouveau convoqué 24 heures après sa destruction.')+'</small></article>';}


function isHealingTrance(a){return Number(a.rank)===2&&cleanAbilityName(a)==='transe-de-guerison'&&slug(a.path)==='voie-de-la-meditation';}
function hasHealingTrance(){return ownedAbilities().some(isHealingTrance);}
function healingTranceState(){const raw=S.healingTrance||{},day=boneArmorDay();return {day,uses:raw.day===day?Math.max(0,Math.floor(Number(raw.uses)||0)):0,needsRapid:raw.needsRapid===true};}
function healingTranceDice(){return 1+(D.paths||[]).filter(p=>/class-moine/.test(String(p.pathId||''))&&(p.ranks||[]).some(r=>r.owned&&Number(r.rank)>=4)).length;}
function healingTrancePanel(){if(!hasHealingTrance())return'';const tr=healingTranceState(),n=healingTranceDice(),die=evolvingDie();return '<article class="card healing-trance-card"><h3>Transe de guérison · rang 2</h3><p><b>'+tr.uses+'/3 utilisations ce jour de jeu</b>'+(tr.needsRapid?' · Attendre une récupération rapide avant la prochaine transe.':' · Disponible après 10 minutes de méditation.')+'</p><div class="ability-actions"><label><input type="checkbox" data-healing-trance-ten> 10 minutes de méditation accomplies</label><label>Total des '+n+'d'+die+'° lancés <input data-healing-trance-roll type="number" min="'+n+'" max="'+n*die+'" step="1" inputmode="numeric"></label><button type="button" class="mini-button primary" data-healing-trance-use '+(tr.uses>=3||tr.needsRapid?'disabled':'')+'>Soigner : dés + VOL ('+signed(Number(D.stats?.VOL)||0)+')</button></div><small>La récupération rapide dépensant 1 DR réarme cette capacité ; maximum 3 usages par jour. COF2, Voie de la méditation R2.</small></article>';}

function priestPath(a){return /:class-pretre:/.test(a.pathId||'')||['voie-de-la-foi','voie-de-la-guerre-sainte','voie-de-la-priere','voie-des-soins','voie-de-la-spiritualite'].includes(slug(a.path));}
function protectionNow(){const active=equippedItems().filter(x=>!isBoneArmorItem(x));return {armor:boneArmorActive()?boneArmorValue():manaArmorActive()?manaArmorValue():Math.max(0,...active.filter(x=>x.equipment?.slot==='armor').map(x=>Number(x.equipment?.bonuses?.armorDef)||0)),shield:Math.max(0,...active.filter(x=>x.equipment?.slot==='shield').map(x=>Number(x.equipment?.bonuses?.shieldDef)||0))};}
function priestArmorLimit(){const cap=Number(D.forgeSnapshot?.equipmentRules?.profileCaps?.['class:pretre:cof2-lb-2024']||4),sacred=ownedAbilities().some(a=>slug(a.path)==='voie-de-la-spiritualite'&&Number(a.rank)===1&&a.choices?.sacredVestments==='WARRIOR_MAIL');return Math.max(cap,sacred?5:4);}
function armorName(n){return ['Sans armure','Tissus matelassés','Cuir simple','Cuir renforcé','Chemise de mailles','Cotte de mailles','Armure de plaques','Plaque complète'][n]||('Armure +'+n);}
function faithShieldStatus(gear=protectionNow()){const rank=ownedPathRank('voie-de-la-guerre-sainte'),limit=priestArmorLimit();if(rank<2)return{active:false,bonus:0,reason:'Rang 2 de la Voie de la guerre sainte requis.'};const reasons=[];if(gear.armor>limit)reasons.push(armorName(gear.armor)+' (+'+gear.armor+' DEF) : limite '+armorName(limit).toLowerCase()+' (+'+limit+' DEF).');if(gear.shield<=0)reasons.push('Aucun bouclier équipé. Équipe un bouclier dans l’inventaire.');return reasons.length?{active:false,bonus:0,reason:reasons.join(' ')}:{active:true,bonus:rank>=5?2:1,reason:'Passif : bonus déjà inclus dans la DEF lorsque ton bouclier est équipé.'+(gear.shield>1?' Le profil prêtre prévoit le petit bouclier ; le grand relève du chevalier. Confirme cet usage avec le MJ.':'')};}
function priestAbilityStatus(a,gear=protectionNow()){if(!priestPath(a))return null;if(slug(a.path)==='voie-de-la-guerre-sainte'&&Number(a.rank)===2)return faithShieldStatus(gear);const spell=a.spell===true||/\*/.test(a.name||'');const snapshot=D.forgeSnapshot?.equipmentRules,hybridKnight=(D.paths||[]).some(p=>/:class-chevalier:/.test(p.pathId||''))||/chevalier/i.test(D.profile||'');const max=hybridKnight?Math.max(6,Number(snapshot?.profileCaps?.['class:chevalier:cof2-lb-2024']||0)):Math.max(priestArmorLimit(),...(snapshot?.masteryProfiles||[]).map(id=>Number(snapshot?.profileCaps?.[id]||0)));if(gear.armor>max)return{active:false,reason:'Armure non maîtrisée.'};if(spell)return{active:true,reason:'Sort de prêtre : armure maîtrisée autorisée, aucun surcoût de PM.'};if(gear.armor>priestArmorLimit())return{active:false,reason:armorName(gear.armor)+' (+'+gear.armor+' DEF) : limite '+armorName(priestArmorLimit()).toLowerCase()+' pour cette capacité de prêtre.'};return{active:true,reason:gear.shield>1?'Grand bouclier maîtrisé si chevalier ; vérifie son utilisation pour cette capacité avec le MJ.':''};}
function faithShieldBonus(gear){return faithShieldStatus(gear).bonus;}
function faithShieldAdjustment(){const start=startingProtection(),snapshot=D.forgeSnapshot?.ruleCompletionLedger;const existing=Array.isArray(snapshot)?snapshot.filter(x=>x.key==='DEF'&&String(x.abilityId).includes('voie-de-la-guerre-sainte')).reduce((n,x)=>n+Number(x.value||0),0):faithShieldBonus(start);return faithShieldBonus(protectionNow())-existing;}
function priestGearHtml(){if(!ownedAbilities().some(priestPath))return'';const g=protectionNow(),heavy=g.armor>priestArmorLimit(),bonus=faithShieldBonus(g),faith=ownedPathRank('voie-de-la-guerre-sainte')>=2;return '<article class="card"><h3>Armure et foi</h3><p>Armure +'+g.armor+' DEF · bouclier +'+g.shield+' DEF.</p><p>Sorts de prêtre : toute armure maîtrisée, sans supplément de PM (p. 178). Autres capacités : '+(heavy?'armure trop lourde.':'armure compatible.')+'</p>'+(faith?'<p><b>Bouclier de la foi : '+(bonus?'+'+bonus+' DEF':'inactif')+'</b><br><small>'+esc(faithShieldStatus(g).reason)+'</small></p>':'')+(g.shield>1?'<p>Grand bouclier : maîtrisé par le chevalier ; le petit bouclier est celui prévu par le profil prêtre (p. 122). Validation MJ recommandée pour les capacités ambiguës.</p>':'')+'</article>';}
function stoneSkinDefenseStat(){const agi=Number(D.stats?.AGI)||0,con=Number(D.stats?.CON)||0;return ownedPathRank('voie-du-pagne')>=2&&con>agi?con:agi;}
function armorStatCap(value,physicalArmor){const cap=Number(BASIC_AGI_CAPS['armor'+physicalArmor]);return physicalArmor>0&&Number.isFinite(cap)?Math.min(value,cap):value;}
function armorStatDelta(){const gear=equippedItems().filter(x=>x.equipment?.slot==='armor'&&!isBoneArmorItem(x)),now=boneArmorActive()?3:Math.max(0,...gear.map(x=>Number(x.equipment?.bonuses?.armorDef)||0)),initial=(D.equipment||[]).some(isBoneArmorItem)?3:startingPhysicalProtection().armor,stat=stoneSkinDefenseStat();return armorStatCap(stat,now)-armorStatCap(stat,initial);}
function combatNow(){const c={def:Number(D.combat.def)||0,init:Number(D.combat.init)||0,contact:Number(D.combat.contact)||0,distance:Number(D.combat.distance)||0,magic:Number(D.combat.magic)||0},start=startingProtection(),gear=protectionNow();let armor=gear.armor,shield=gear.shield;equippedItems().forEach(item=>{const e=item.equipment||{},b=e.bonuses||{};c.def+=Number(b.def)||0;c.init+=Number(b.initiative)||0;c.contact+=Number(b.contact)||0;c.distance+=Number(b.distance)||0;c.magic+=Number(b.magic)||0});c.def+=armor-start.armor+windArmorAdjustment(start.armor,armor);c.def+=armorStatDelta();c.def+=shield-start.shield;if(D.warriorRules){const r=ownedPathRank('voie-du-bouclier'),bonus=r>=5?2:r>=3?1:0;c.def+=(shield>0?bonus:0)-(start.shield>0?bonus:0);}const seduction=(D.paths||[]).find(p=>/séduction/.test(p.name));const dentelle=seduction?.ranks?.some(r=>r.owned&&r.rank===2);if(dentelle&&(armor??start.armor)>0)c.def-=Math.min(Number(D.stats.CHA)||0,Math.max(...seduction.ranks.filter(r=>r.owned).map(r=>r.rank)));if(rageActive())c.def-=2;
if((armor??start.armor)<4&&!boneArmorActive()&&!manaArmorActive())c.def+=druideBarkBonus();
c.def+=Math.max(druideFamiliarBonus(),familiarDefBonus());c.init+=familiarInitBonus();
const terrain=druideTerrainBonus();
if(terrain){c.def++;c.init+=3;c.contact++;c.distance++;c.magic++}
if(ownedPathRank('voie-de-la-guerre-sainte')>=2)c.def+=faithShieldAdjustment();c.def+=sacredVestmentAdjustment(armor);if(pacifismActive())c.def+=5;c.def+=crossParryBonus();c.def+=mutationDefenseBonus();return c}
function finalValue(kind){return combatNow()[kind]}
function defenseBreakdown(){const gear=protectionNow(),start=startingProtection(),extra=equippedItems().reduce((n,x)=>n+(Number(x.equipment?.bonuses?.def)||0),0),total=finalValue('def'),base=(Number(D.combat.def)||0)-start.armor-start.shield;return{base,armor:gear.armor,shield:gear.shield,extra,other:total-base-gear.armor-gear.shield-extra,total};}
function defenseDetail(){const d=defenseBreakdown();return 'Base '+d.base+' · '+(boneArmorActive()?'Armure d’os':manaArmorActive()?'Armure de mana':'Armure')+' +'+d.armor+' · Bouclier +'+d.shield+(d.extra?' · Objet '+signed(d.extra):'')+(d.other?' · Capacités/états '+signed(d.other):'');}
function valueWithBase(kind,label){const base=Number(D.combat[kind])||0,value=finalValue(kind);return`<div class="value"><small>${label}</small><b>${signed(value)}</b>${value!==base?`<em>Base ${signed(base)}</em>`:''}</div>`}
function modeDamage(mode){const stat=mode.damageStat?Number(D.stats?.[mode.damageStat])||0:0,bonus=Number(mode.damageBonus)||0,total=stat+bonus;return esc(mode.damage||'—')+(total?signed(total):'')}
function equippedAttackHtml(item,mode){const kind=String(mode.attackType||'contact').toLowerCase(),finesse=kind==='contact'&&/dague|rapière|rapiere|épée courte|epee courte|main manifest/i.test(item.base||item.name)&&(D.paths||[]).some(p=>/voie-du-spadassin|voie-de-l-escrime/.test(p.pathId||'')&&p.ranks.some(r=>r.owned&&r.rank===1)),attack=finalValue(kind)+(Number(mode.attackBonus)||0)+(WC.inspect(D,S).hasWarrior?WC.weaponBonus(D,{name:item.base||item.name,type:kind}).attack:0)+(finesse?Math.max(0,Number(D.stats.AGI)-Number(D.stats.FOR)):0),label=mode.label||({contact:'Contact',distance:'Distance',magic:'Magie'}[kind]||kind);return`<article class="attack equipped-attack"><div class="attack-head"><h3>${esc(item.name)} · ${signed(attack)}</h3><span class="tag equipped">Équipé · ${esc(label)}</span></div><p><b>${modeDamage({...mode,damageBonus:(Number(mode.damageBonus)||0)+(WC.inspect(D,S).hasWarrior?WC.weaponBonus(D,{name:item.base||item.name,type:kind}).damage:0)+(id==='prepotante'&&kind==='distance'&&/dague|couteau/i.test(item.base||item.name)?1:0)})}${rageDamage(kind)}${mountedDamage(kind)}${forgeFireDamage(item.name,kind)} DM</b> · ${esc(mode.range||label)} ${rageRestriction(kind)}${mode.damageType?' · '+esc(mode.damageType):''}${mode.special?' · '+esc(mode.special):''}</p>${WC.inspect(D,S).hasWarrior?'<p>Critique : '+Math.max(16,(Number(mode.criticalThreshold)||(/rapi[eè]re/i.test(item.base||item.name)?19:20))-WC.weaponBonus(D,{name:item.base||item.name,type:kind}).critical)+'–20</p>':''}<small>Base ${signed(Number(D.combat[kind])||0)}${Number(mode.attackBonus)?' · objet '+signed(mode.attackBonus):''}</small></article>`}
function equippedAttacksHtml(){return equippedItems().flatMap(item=>{const w=item.equipment?.weapon||{},modes=Array.isArray(w.modes)?w.modes:(w.attackType?[w]:[]);return modes.map(mode=>equippedAttackHtml(item,mode))}).join('')}
function activeEquipmentHtml(){const items=equippedItems().filter(item=>item.equipment?.effect||item.equipment?.slot);if(!items.length)return'<div class="empty">Aucun effet d’équipement actif.</div>';return items.map(item=>`<article class="choice active-gear"><strong>${esc(item.name)}</strong><span class="tag equipped">${esc(SLOT_LABELS[item.equipment?.slot]||'Actif')}</span><p>${esc(item.equipment?.effect||item.notes||'Équipement actif.')}</p></article>`).join('')}
function ownedAbilities(){return(D.paths||[]).flatMap(path=>(path.ranks||[]).filter(rank=>rank.owned).map(rank=>Object.assign({path:path.name,pathId:path.pathId,id:slug(path.name+'-'+rank.rank+'-'+rank.name)},rank)))}
function effectiveCondition(value){
 if(value!=='Étourdi')return value;
 const tattoo=ownedAbilities().some(a=>Number(a.rank)===3&&slug(a.path)==='voie-du-pagne'&&slug(a.name)==='tatouages');
 return tattoo?'Ralenti':value;
}
function isWindArmor(a){return Number(a.rank)===2&&slug(a.path)==='voie-du-primitif'&&slug(a.name)==='armure-de-vent'}
function windArmorAdjustment(initialArmor,currentArmor){
 const ranks=ownedAbilities().filter(a=>slug(a.path)==='voie-du-primitif');
 if(!ranks.some(isWindArmor))return 0;
 const bonus=armor=>armor>0?1:ranks.some(a=>Number(a.rank)>=5)?3:2;
 return bonus(currentArmor)-bonus(initialArmor);
}
function isWarCry(a){return Number(a.rank)===1&&slug(a.path)==='voie-de-la-rage'&&/^cri-de-guerre(?:-g)?$/.test(slug(a.name))}
function warCryTargetHtml(){
 return `<fieldset data-war-cry-target><legend>Adversaire</legend>
  <label>Nom <input data-war-cry-name maxlength="80"></label>
  <label>Distance (m) <input type="number" min="0" step="any" inputmode="decimal" data-war-cry-distance></label>
  <label>FOR <input type="number" step="1" inputmode="numeric" data-war-cry-strength></label>
 </fieldset>`;
}
function warCryHtml(a){
 const saved=S.warCryTargets||[];
 if(S.uses[usageKey(a)]>=1){
  const result=saved.length?'Dé malus aux attaques au contact au prochain tour de chaque adversaire : '+saved.join(', ')+'.':'Aucun adversaire affecté.';
  return '<p>Déjà utilisé dans ce combat.</p><p data-war-cry-outcome>'+esc(result)+'</p>';
 }
 return `<div class="ability-actions">
  <div data-war-cry-targets>${warCryTargetHtml()}</div>
  <button type="button" class="mini-button" data-war-cry-add>Ajouter un adversaire</button>
  <button type="button" class="mini-button primary" data-barbare-combat="${esc(a.id)}">Pousser le cri</button>
  <p role="status" data-barbare-result></p>
 </div>`;
}
function resolveWarCry(a,card,result){
 if(S.uses[usageKey(a)]>=1)return;
 const targets=Array.from(card.querySelectorAll('[data-war-cry-target]'),row=>({
  name:row.querySelector('[data-war-cry-name]').value.trim(),
  distance:row.querySelector('[data-war-cry-distance]').value,
  strength:row.querySelector('[data-war-cry-strength]').value
 })).filter(x=>x.name||x.distance!==''||x.strength!=='');
 if(targets.some(x=>!x.name||x.distance===''||Number(x.distance)<0||x.strength===''||!Number.isSafeInteger(Number(x.strength)))){
  result.textContent='Renseigne le nom, la distance et la FOR de chaque adversaire saisi.';
  return;
 }
 const strength=Number(D.stats.FOR)||0;
 S.warCryTargets=targets.filter(x=>Number(x.distance)<=10&&Number(x.strength)<strength).map(x=>x.name);
 S.uses[usageKey(a)]=1;
 updateAfterAction();
}
function isRage(a){return Number(a.rank)===3&&slug(a.path)==='voie-de-la-rage'&&/^rage-du-berserk(?:-l)?$/.test(slug(a.name))}
function rageActive(){
 return !!S.berserk&&S.hp>0&&!S.conditions.includes('Inconscient')&&ownedAbilities().some(a=>a.id===S.berserk.id&&isRage(a));
}
function rageMax(){
 const paths=['voie-de-la-brute','voie-du-pagne','voie-du-pourfendeur','voie-du-primitif','voie-de-la-rage'];
 return 1+new Set(ownedAbilities().filter(a=>Number(a.rank)===4&&paths.includes(slug(a.path))).map(a=>a.path)).size;
}
function rageHtml(a){
 const id=esc(a.id);
 if(!rageActive())return S.uses[usageKey(a)]>=rageMax()?'<p>Réserve de rage épuisée pour la journée.</p>':
  `<button type="button" class="mini-button primary" data-rage-command="start" data-rage-id="${id}">Entrer en rage</button><p role="status" data-rage-result></p>`;
 return `<p>Rage active · −2 DEF · +1d${evolvingDie()} DM au contact · dé bonus aux tests de VOL. Attaques à distance, sorts et fuite volontaire interdits.</p>
 <div class="ability-actions">
  ${S.berserk.attempted?
   `<p>Test déjà tenté pendant ce tour.</p><button type="button" class="mini-button" data-rage-command="turn" data-rage-id="${id}">Tour suivant</button>`:
   `<label>Total du test de VOL en fin de tour (difficulté 15) <input type="number" inputmode="numeric" step="1" data-rage-roll></label><button type="button" class="mini-button" data-rage-command="stop" data-rage-id="${id}">Tenter de calmer la rage</button>`}
  <p role="status" data-rage-result></p>
 </div>`;
}
function resolveRage(button){
 const a=ownedAbilities().find(a=>a.id===button.dataset.rageId&&isRage(a));
 if(!a)return;
 const card=button.closest('.ability'),result=card.querySelector('[data-rage-result]');
 const command=button.dataset.rageCommand;
 if(command==='start'){
  const used=Number(S.uses[usageKey(a)])||0;
  if(rageActive()||used>=rageMax())return;
  if(S.hp<=0||S.conditions.includes('Inconscient')){result.textContent='La rage exige de pouvoir agir.';return}
  S.uses[usageKey(a)]=used+1;
  S.berserk={id:a.id,attempted:false};
 }else{
  if(!rageActive())return;
  if(command==='turn')S.berserk.attempted=false;
  if(command==='stop'&&!S.berserk.attempted){
   const raw=card.querySelector('[data-rage-roll]').value,roll=Number(raw);
   if(raw===''||!Number.isSafeInteger(roll)){result.textContent='Indique le total de ton test de VOL.';return}
   if(roll>=15)delete S.berserk;
   else S.berserk.attempted=true;
  }
 }
 updateAfterAction();
}
function rageDamage(kind){return kind==='contact'&&rageActive()?' + 1d'+evolvingDie():''}
function rageRestriction(kind){return kind==='distance'&&rageActive()?'<strong>Attaque à distance interdite pendant la rage.</strong>':''}
function isTourDeForce(a){return Number(a.rank)===2&&slug(a.path)==='voie-de-la-brute'&&/^tour-de-force(?:-g)?$/.test(slug(a.name))}
function isCharge(a){return Number(a.rank)===2&&slug(a.path)==='voie-du-pourfendeur'&&/^charge(?:-l)?$/.test(slug(a.name))}
function isDefyDeath(a){return Number(a.rank)===2&&slug(a.path)==='voie-de-la-rage'&&slug(a.name)==='defier-la-mort'}
function ownsBerserk(){return ownedAbilities().some(a=>slug(a.path)==='voie-de-la-rage'&&[3,5].includes(Number(a.rank)))}
function barbareCombatHtml(a){
 if(isWarCry(a))return warCryHtml(a);
 if(isRage(a))return rageHtml(a);
 if(isCharge(a))return `<div class="ability-actions">
  <label>Distance en ligne droite (m) <input type="number" inputmode="decimal" min="5" max="10" step="any" data-charge-distance></label>
  <label><input type="checkbox" data-charge-contact> Je suis déjà au contact d’un adversaire</label>
  <button type="button" class="mini-button primary" data-barbare-combat="${esc(a.id)}">Vérifier la charge</button>
  <p role="status" data-barbare-result></p>
 </div>`;
 if(!isDefyDeath(a))return'';
 if(S.uses[usageKey(a)]>=1)return'<p>Déjà utilisée dans ce combat.</p>';
 return `<div class="ability-actions">
  <label>DM finaux d’une attaque <input type="number" inputmode="numeric" min="1" step="1" data-defy-damage></label>
  <label>Total du test de CON (difficulté 10) <input type="number" inputmode="numeric" step="1" data-defy-test></label>
  ${ownsBerserk()?'<label><input type="checkbox" data-defy-rage> Je suis enragé</label>':''}
  <button type="button" class="mini-button primary" data-barbare-combat="${esc(a.id)}">Résoudre Défier la mort</button>
  <p role="status" data-barbare-result></p>
 </div>`;
}
function resolveBarbareCombat(button){
 const a=ownedAbilities().find(x=>x.id===button.dataset.barbareCombat),card=button.closest('.ability');
 if(!a||!card)return;
 const input=selector=>card.querySelector(selector);
 const result=input('[data-barbare-result]');
 if(isWarCry(a)){resolveWarCry(a,card,result);return}
 if(isCharge(a)){
  const distance=Number(input('[data-charge-distance]').value);
  result.textContent=input('[data-charge-contact]').checked?'Charge impossible au contact d’un adversaire.':
   distance>=5&&distance<=10?'Charge possible. Fais une attaque au contact avec un dé bonus. Si elle touche, ajoute +1d'+evolvingDie()+' aux DM.':
   'Une charge exige entre 5 et 10 m en ligne droite.';
  return;
 }
 if(!isDefyDeath(a)||S.uses[usageKey(a)]>=1)return;
 const damage=Number(input('[data-defy-damage]').value),test=input('[data-defy-test]').value;
 const rage=rageActive()||ownsBerserk()&&input('[data-defy-rage]')?.checked;
 if(!Number.isSafeInteger(damage)||damage<1||S.hp<=0||damage<S.hp){
  result.textContent='Cette capacité se déclenche quand une attaque te ferait passer de PV positifs à 0 PV.';
  return;
 }
 if(!rage&&(test===''||!Number.isSafeInteger(Number(test)))){
  result.textContent='Indique le total de ton test de CON.';
  return;
 }
 const survived=rage||Number(test)>=10;
 S.hp=survived?1:0;
 S.uses[usageKey(a)]=1;
 updateAfterAction();
 const message=survived?'Défier la mort : tu conserves 1 PV.':'Défier la mort : le test échoue, tu tombes à 0 PV.';
 const updated=document.querySelector('dialog [data-barbare-outcome]');
 if(updated)updated.textContent=message;
 toast(message);
}
function actionType(a){
 const explicit=(a.name||'').match(/\(([LAMG])\)/i);
 if(explicit)return explicit[1].toUpperCase();
 if(isTourDeForce(a))return'G';
 if(isCharge(a)||isRage(a))return'L';
 if(isWarCry(a))return'G';
 if(isWindArmor(a))return'Passif';
 const text=(a.text||'').toLowerCase();
 if(/action limitée/.test(text))return'L';
 if(/action d.attaque/.test(text))return'A';
 if(/action de mouvement/.test(text))return'M';
 if(/action gratuite/.test(text))return'G';
 return'Passif';
}
function evolvingDie(){return [4,6,8,10,12][Math.max(0,Math.min(4,Math.floor((Number(D.level)||1)/3)-1))]}
function tourDeForceHtml(a){
 if(!isTourDeForce(a))return'';
 const die=evolvingDie();
 return `<div class="ability-actions"><label>Résultat du d${die} <input data-tour-de-force-roll type="number" inputmode="numeric" min="1" max="${die}" step="1"></label><button type="button" class="mini-button primary" data-tour-de-force="${esc(a.id)}">Déduire les PV</button></div>`;
}
function bardeAbility(a){
 const path=slug(a.path),name=slug(a.name),rank=Number(a.rank);
 if(path==='voie-de-l-escrime'&&rank===2&&/^feinte(?:-l)?$/.test(name))return'feinte';
 if(path==='voie-du-musicien'&&rank===1&&/^chant-des-heros(?:-l)?$/.test(name))return'heros';
 if(path==='voie-du-musicien'&&rank===2&&/^chant-de-reconfort(?:-l)?$/.test(name))return'reconfort';
 return'';
}
function ownedPathRank(path){
 return Math.max(0,...ownedAbilities().filter(a=>slug(a.path)===path).map(a=>Number(a.rank)||0));
}
function bardePlayHtml(a){
 const kind=bardeAbility(a);
 if(!kind)return'';
 const key=esc(a.id),button=(command,label)=>`<button type="button" class="mini-button primary" data-barde-use="${key}" data-barde-command="${command}">${label}</button>`;
 let controls='';
 if(kind==='feinte'){
  const f=S.feinte;
  controls=f?`<p>${esc(f.target)} · ${f.ready?'Première attaque au contact de ce round : '+signed(f.bonus)+' à l’attaque'+(f.won?' et +2d'+evolvingDie()+' DM si elle touche.':'.'):'Effet au round suivant.'}</p>
    ${f.ready?button('consume','Marquer la première attaque effectuée'):button('next','Passer au round suivant')}
    ${button('end','Abandonner la feinte')}`:
   `<label>Adversaire <input data-barde-target maxlength="80"></label>
    <label><input type="checkbox" data-barde-won> Test opposé de CHA contre PER réussi</label>
    ${button('start','Préparer la feinte')}`;
 }else if(kind==='heros'){
  const h=S.chantDesHeros;
  controls=h?`<p>Bonus ${signed(h.bonus)} à tous les tests du barde et des alliés à portée de voix. Durée initiale : ${h.minutes} min en jeu. Fredonne pendant l’effet.</p>${button('end','Terminer le chant')}`:
   button('start','Lancer le chant · 1 PM');
 }else{
  controls=S.chantDeReconfort?`<p>Termine les 30 min de récupération rapide en chantant. Les alliés à 10 m ou moins reçoivent aussi les soins.</p>
   <label>Total des soins du barde <input type="number" inputmode="numeric" min="1" step="1" data-barde-heal></label>
   ${button('heal','Appliquer les soins après les 30 min')}${button('end','Interrompre le chant')}`:
   button('start','Commencer la récupération · 2 PM');
 }
 return `<div class="ability-actions">${controls}<p role="status" data-barde-result></p></div>`;
}
function resolveBarde(button){
 const a=ownedAbilities().find(a=>a.id===button.dataset.bardeUse),kind=a&&bardeAbility(a);
 if(!kind)return;
 const cmd=button.dataset.bardeCommand,card=button.closest('.ability'),result=card.querySelector('[data-barde-result]');
 if(kind==='feinte'){
  if(cmd==='start'&&!S.feinte){
   const target=card.querySelector('[data-barde-target]').value.trim();
   if(!target){result.textContent='Indique l’adversaire visé.';return}
   S.feinte={target,won:card.querySelector('[data-barde-won]').checked,bonus:2*ownedPathRank('voie-de-l-escrime'),ready:false};
  }
  if(cmd==='next'&&S.feinte)S.feinte.ready=true;
  if(cmd==='consume'||cmd==='end')delete S.feinte;
 }else{
  const stateKey=kind==='heros'?'chantDesHeros':'chantDeReconfort';
  if(cmd==='start'&&!S[stateKey]){
   const cost=kind==='heros'?1:2;
   if(rageActive()){result.textContent='La rage interdit de lancer un sort.';return}
   if(S.pm<cost){result.textContent='Mana insuffisant : '+cost+' PM requis.';return}
   const minutes=Number(D.stats.CHA)||0;
   if(kind==='heros'&&minutes<=0){result.textContent='Le chant ne dure que si le CHA est positif.';return}
   S.pm-=cost;
   S[stateKey]=kind==='heros'?{minutes,bonus:ownedPathRank('voie-du-musicien')>=5?2:1}:true;
  }
  if(cmd==='heal'&&S[stateKey]){
   const heal=Number(card.querySelector('[data-barde-heal]').value);
   const dice=ownedPathRank('voie-du-musicien')>=4?2:1;
   if(!Number.isInteger(heal)||heal<dice||heal>dice*evolvingDie()){result.textContent='Entre le total de '+dice+'d'+evolvingDie()+'.';return}
   S.hp=Math.min(max.hp,S.hp+heal);
   delete S[stateKey];
  }
  if(cmd==='end')delete S[stateKey];
 }
 updateAfterAction();
}
function chevalierAbility(a){
 const path=slug(a.path),name=slug(a.name),rank=Number(a.rank);
 if(path==='voie-du-cavalier'&&rank===1&&name==='fidele-monture')return'monture';
 if(path==='voie-du-preux'&&rank===1&&/^ignorer-la-douleur(?:-g)?$/.test(name))return'douleur';
 if(path==='voie-du-preux'&&rank===2&&name==='piqures-d-insectes')return'piqures';
 if(path==='voie-du-meneur-d-homme'&&rank===2&&/^intercepter(?:-g)?$/.test(name))return'intercepter';
 if(path==='voie-de-la-guerre'&&rank===2&&/^encaisser-un-coup(?:-m)?$/.test(name))return'encaisser';
 return'';
}
function chevalierArmor(){
 const item=equippedItems().find(x=>x.equipment?.slot==='armor'),tracks=S.inventory.some(x=>x.equipment?.slot==='armor');
 const base=tracks?Number(item?.equipment?.bonuses?.armorDef)||0:startingProtection().armor;
 return {base,def:base+(Number(item?.equipment?.bonuses?.def)||0)};
}
function chevalierRangedRD(){
 if(!ownedAbilities().some(a=>chevalierAbility(a)==='piqures'))return 0;
 const {base}=chevalierArmor();
 return base>=6?3:base>=4?2:base>=2?1:0;
}
function mountedDamage(kind){
 const rank=ownedPathRank('voie-du-cavalier');
 return kind==='contact'&&S.chevalierMounted&&rank>=2?' + '+(rank>=5?2:1):'';
}
function chevalierPlayHtml(a){
 const kind=chevalierAbility(a);
 if(!kind)return'';
 const button=(cmd,label)=>`<button type="button" class="mini-button" data-chevalier-use="${esc(a.id)}" data-chevalier-command="${cmd}">${label}</button>`;
 const damage='<label>DM de l’attaque <input type="number" min="1" step="1" inputmode="numeric" data-chevalier-damage></label>';
 let html='';
 if(kind==='monture'){
  const rank=ownedPathRank('voie-du-cavalier'),mounted=!!S.chevalierMounted;
  html=`<p>${mounted?'En selle · déplacement supplémentaire de 10 m avant ou après une action.':'À pied'} · DEF de la monture ${mounted&&rank>=2?finalValue('def'):12+rank}.</p>${button('toggle',mounted?'Descendre de selle':'Monter en selle')}`;
 }
 if(kind==='douleur')html=S.uses[usageKey(a)]>=1?
  `<p>Déjà utilisée pour ce combat. ${Number(S.chevalierDeferred)||0} DM seront appliqués à sa fin.</p>`:
  `${damage}<label><input type="checkbox" data-chevalier-critical> Coup critique</label>${button('defer','Reporter les dégâts')}`;
 if(kind==='piqures')html=`<p>Réduction contre les attaques à distance avec l’armure actuelle : ${chevalierRangedRD()} DM. Minimum de 1 DM par attaque.</p>`;
 if(kind==='encaisser')html=S.chevalierBraced?
  `<p>En garde jusqu’au prochain tour. L’attaque au contact choisie ne peut pas te renverser ni t’étourdir.</p>${damage}${button('absorb','Appliquer une attaque au contact')}${button('expire','Terminer la garde')}`:
  `<p>Réduction d’armure sur un coup : ${chevalierArmor().def} DM.</p>${button('brace','Se mettre en garde')}`;
 if(kind==='intercepter'){
  const intercept=S.chevalierIntercept;
  html=intercept?`<p>Interception déclarée · utilise ta DEF (${finalValue('def')}).</p>
   ${intercept.resolved?button('round','Passer au round suivant'):
     damage+button('resolve','Appliquer les dégâts')+button('miss','L’attaque a raté')}`:
   `<label><input type="checkbox" data-chevalier-adjacent> L’allié est à mon contact</label>
     <label>Attaque <select data-chevalier-attack><option value="contact">Au contact</option><option value="distance">À distance</option></select></label>
     ${button('declare','Déclarer avant le jet d’attaque')}`;
 }
 return `<div class="ability-actions">${html}<p role="status" data-chevalier-result></p></div>`;
}
function resolveChevalier(button){
 const a=ownedAbilities().find(a=>a.id===button.dataset.chevalierUse),kind=a&&chevalierAbility(a);
 if(!kind)return;
 const cmd=button.dataset.chevalierCommand,card=button.closest('.ability'),result=card.querySelector('[data-chevalier-result]');
 const damage=()=>Number(card.querySelector('[data-chevalier-damage]')?.value);
 const validDamage=()=>Number.isSafeInteger(damage())&&damage()>0;
 if(kind==='monture'&&cmd==='toggle')S.chevalierMounted=!S.chevalierMounted;
 if(kind==='douleur'&&cmd==='defer'&&!(S.uses[usageKey(a)]>=1)){
  if(card.querySelector('[data-chevalier-critical]').checked){result.textContent='Un coup critique ne peut pas être reporté.';return}
  if(!validDamage()){result.textContent='Entre les DM subis après réduction.';return}
  S.chevalierDeferred=damage();
  S.uses[usageKey(a)]=1;
 }
 if(kind==='encaisser'){
  if(cmd==='brace')S.chevalierBraced=true;
  if(cmd==='expire')delete S.chevalierBraced;
  if(cmd==='absorb'&&S.chevalierBraced){
   if(!validDamage()){result.textContent='Entre les DM de l’attaque au contact.';return}
   S.hp=Math.max(0,S.hp-Math.max(1,damage()-chevalierArmor().def));
   delete S.chevalierBraced;
  }
 }
 if(kind==='intercepter'){
  if(cmd==='declare'&&!S.chevalierIntercept){
   if(!card.querySelector('[data-chevalier-adjacent]').checked){result.textContent='Intercepter exige un allié à ton contact.';return}
   S.chevalierIntercept={attack:card.querySelector('[data-chevalier-attack]').value,resolved:false};
  }
  if(cmd==='resolve'&&S.chevalierIntercept&&!S.chevalierIntercept.resolved){
   if(!validDamage()){result.textContent='Entre les DM avant tes réductions.';return}
   const ranged=S.chevalierIntercept.attack==='distance';
   let rd=ownedPathRank('voie-du-meneur-d-homme')+(ranged?chevalierRangedRD():0);
   if(!ranged&&S.chevalierBraced){rd+=chevalierArmor().def;delete S.chevalierBraced}
   S.hp=Math.max(0,S.hp-Math.max(1,damage()-rd));
   S.chevalierIntercept.resolved=true;
  }
  if(cmd==='miss'&&S.chevalierIntercept)S.chevalierIntercept.resolved=true;
  if(cmd==='round'&&S.chevalierIntercept?.resolved){delete S.chevalierIntercept;delete S.chevalierBraced}
 }
 updateAfterAction();
}
function druideAbility(a){
 const rank=Number(a.rank),name=slug(a.name).replace(/^rang-\d+-/,'');
 const rule={
  'baies-magiques-l':['voie-du-protecteur',1,'berries'],
  'foret-vivante':['voie-du-protecteur',2,'forest'],
  'terrains-difficiles':['voie-de-la-nature',2,'terrain'],
  'peau-d-ecorce-m':['voie-des-vegetaux',1,'bark'],
  'prison-vegetale-l':['voie-des-vegetaux',2,'prison'],
  'maitre-de-la-survie':['voie-de-la-nature',1,'night'],
  'petit-compagnon':['voie-des-animaux',2,'familiar']
 }[name];
 return rule&&rank===rule[1]&&slug(a.path)===rule[0]?rule[2]:'';
}
function druideTerrainBonus(){
 return S.druideTerrain&&ownedAbilities().some(a=>druideAbility(a)==='terrain')?1:0;
}
function druideBarkBonus(){
 if(!S.druideBark||!ownedAbilities().some(a=>druideAbility(a)==='bark'))return 0;
 const rank=ownedPathRank('voie-des-vegetaux');
 return rank>=5?4:rank>=3?3:2;
}
function druideFamiliarBonus(){
 return S.druideFamiliar&&ownedAbilities().some(a=>druideAbility(a)==='familiar')?2:0;
}
function druidePlayHtml(a){
 const kind=druideAbility(a);
 if(!kind)return'';
 const per=Math.max(0,Number(D.stats?.PER)||0);
 const button=(command,label,disabled=false)=>`<button type="button" class="mini-button" data-druide-use="${esc(a.id)}" data-druide-command="${command}" ${disabled?'disabled':''}>${label}</button>`;
 let body='';
 if(kind==='berries'){
  const rank=ownedPathRank('voie-du-protecteur');
  body=`<p>${S.druideBerries||0} baie(s) disponible(s). Après 1 min : 1d${evolvingDie()} + ${rank} PV. Une fois par jour par bénéficiaire.</p>
   <label><input type="checkbox" data-druide-plant> Devant un arbre ou un buisson vivant</label>
   ${button('grow',`Faire pousser ${per} baie(s) · 1 PM`,per===0||S.pm<1)}
   <label>Bénéficiaire <input type="text" maxlength="80" data-druide-target></label>
   ${button('serve','Noter la consommation',!(S.druideBerries>0))}`;
 }
 if(kind==='forest'){
  const radius=ownedPathRank('voie-du-protecteur');
  body=`<p>${S.uses[a.id]?'Rituel utilisé aujourd’hui.':'Rituel de 30 min · 2 PM · une fois par jour.'} Rayon ${radius} km, durée 24 h. Ennemis : déplacement ÷2 et dé malus aux tests concernés.</p>
   ${S.uses[a.id]?'':`<label><input type="checkbox" data-druide-ritual> Rituel de 30 min terminé</label>${button('forest','Éveiller la forêt',S.pm<2)}`}`;
 }
 if(kind==='terrain')body=`<p>${S.druideTerrain?'Terrain difficile actif : +3 INIT, +1 attaque et DEF.':'Déplacement sans pénalité de terrain difficile. Active les bonus si le combat s’y déroule.'}</p>${button('terrain',S.druideTerrain?'Quitter le terrain difficile':'Combattre en terrain difficile')}`;
 if(kind==='bark'){
  const rank=ownedPathRank('voie-des-vegetaux');
  const bonus=rank>=5?4:rank>=3?3:2;
  body=`<p>${S.druideBark?'Active. ':''}DEF +${bonus} pendant ${per} min · 1 PM.</p>
   ${S.druideBark?button('expire','Terminer la Peau d’écorce'):`<label><input type="checkbox" data-druide-protection> Autre sort de protection à la DEF actif (hors Masque du prédateur)</label>${button('bark','Activer la Peau d’écorce',per===0||S.pm<1)}`}`;
 }
 if(kind==='prison'){
  const targets=S.druidePrisonTargets||[];
  body=`<p>Zone de 10 m de diamètre à 20 m · ${per} min · 2 PM. Ennemis uniquement. Se libérer (A) : FOR difficulté ${10+(Number(D.stats?.PER)||0)}.</p>
   ${S.druidePrison?`<p>Immobilisés : ${targets.map(esc).join(', ')||'aucun'}</p>
    <label>Ennemi dans la zone <input data-druide-target maxlength="80"></label>${button('trap','Immobiliser')}
    <label>Ennemi <select data-druide-prison-target>${targets.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>
    <label>Total du test de FOR <input type="number" inputmode="numeric" data-druide-roll></label>
    ${button('escape','Résoudre le test',!targets.length)}${button('end-prison','Terminer la prison végétale')}`:
    button('prison','Lancer Prison végétale',per===0||S.pm<2)}`;
 }
 if(kind==='night')body=`<p>Survie et test nocturne en milieu naturel : +${ownedPathRank('voie-de-la-nature')+2}.</p>
  <label><input type="checkbox" data-druide-natural> Nuit passée en milieu naturel</label>
  <label>Soin normal du DR <input type="number" min="0" step="1" data-druide-normal></label>
  <label>Résultat du d${evolvingDie()} supplémentaire <input type="number" min="1" max="${evolvingDie()}" data-druide-roll></label>
  ${button('night','Dépenser 1 DR et récupérer',S.dr<1||S.druideNightUsed)}`;
 if(kind==='familiar')body=`<p>${S.druideFamiliar?'Compagnon en vue : +2 DEF.':'Compagnon hors de vue.'}</p>${button('familiar',S.druideFamiliar?'Hors de vue':'Compagnon en vue')}`;
 return `<div class="ability-actions">${body}<p role="status" data-druide-result></p></div>`;
}
function resolveDruide(t){
 const a=ownedAbilities().find(x=>x.id===t.dataset.druideUse);
 if(!a)return;
 const kind=druideAbility(a),command=t.dataset.druideCommand,card=t.closest('.ability');
 const result=card.querySelector('[data-druide-result]');
 const per=Math.max(0,Number(D.stats?.PER)||0);
 const checked=name=>card.querySelector('[data-druide-'+name+']')?.checked;
 if(kind==='berries'&&command==='grow'&&per>0&&S.pm>=1){
  if(!checked('plant')){result.textContent='Il faut un arbre ou un buisson vivant.';return}
  S.pm--;
  S.druideBerries=(Number(S.druideBerries)||0)+per;
 }
 if(kind==='berries'&&command==='serve'&&S.druideBerries>0){
  const name=card.querySelector('[data-druide-target]').value.trim();
  const target=slug(name);
  if(!target){result.textContent='Indique le bénéficiaire.';return}
  const served=Array.isArray(S.druideBerryTargets)?S.druideBerryTargets:[];
  if(served.includes(target)){result.textContent='Ce bénéficiaire a déjà reçu les effets d’une baie aujourd’hui.';return}
  S.druideBerryTargets=[...served,target];
  S.druideBerries--;
  toast('Baie consommée. Applique les PV après une minute de jeu.');
 }
 if(kind==='forest'&&command==='forest'&&!S.uses[a.id]&&S.pm>=2){
  if(!checked('ritual')){result.textContent='Confirme la fin du rituel de 30 minutes.';return}
  S.pm-=2;
  S.uses[a.id]=1;
 }
 if(kind==='prison'){
  if(command==='prison'&&!S.druidePrison&&per>0&&S.pm>=2){
   S.pm-=2;
   S.druidePrison=true;
   S.druidePrisonTargets=[];
  }
  if(command==='trap'&&S.druidePrison){
   const name=card.querySelector('[data-druide-target]').value.trim(),target=slug(name);
   if(!target){result.textContent='Indique un ennemi dans la zone.';return}
   if((S.druidePrisonFreed||[]).includes(target)){result.textContent='Cet ennemi est immunisé pour le reste du combat.';return}
   const targets=S.druidePrisonTargets||[];
   if(!targets.some(x=>slug(x)===target))S.druidePrisonTargets=[...targets,name];
  }
  if(command==='escape'&&S.druidePrison){
   const name=card.querySelector('[data-druide-prison-target]').value;
   const total=card.querySelector('[data-druide-roll]').value;
   if(!name||total===''||!Number.isSafeInteger(Number(total))){result.textContent='Choisis un ennemi et saisis le total de FOR.';return}
   if(Number(total)<10+(Number(D.stats?.PER)||0)){result.textContent='Échec : cet ennemi reste immobilisé.';return}
   S.druidePrisonTargets=S.druidePrisonTargets.filter(x=>x!==name);
   S.druidePrisonFreed=[...(S.druidePrisonFreed||[]),slug(name)];
  }
  if(command==='end-prison'){
   delete S.druidePrison;
   delete S.druidePrisonTargets;
  }
 }
 if(kind==='night'&&command==='night'&&S.dr>0&&!S.druideNightUsed){
  const normal=card.querySelector('[data-druide-normal]').value;
  const extra=Number(card.querySelector('[data-druide-roll]').value);
  if(!checked('natural')||normal===''||!Number.isSafeInteger(Number(normal))||Number(normal)<0||
     !Number.isSafeInteger(extra)||extra<1||extra>evolvingDie()){
   result.textContent='Confirme la nuit en milieu naturel et saisis les deux résultats de soin.';
   return;
  }
  S.dr--;
  S.hp=Math.min(max.hp,S.hp+Number(normal)+extra);
  S.druideNightUsed=true;
 }
 if(kind==='terrain'&&command==='terrain')S.druideTerrain=!S.druideTerrain;
 if(kind==='familiar'&&command==='familiar')S.druideFamiliar=!S.druideFamiliar;
 if(kind==='bark'&&command==='bark'&&!S.druideBark&&per>0&&S.pm>=1){
  if(chevalierArmor().base>=4||checked('protection')){
   result.textContent='Retire la protection incompatible avant d’appliquer le bonus.';
   return;
  }
  S.pm--;
  S.druideBark=true;
 }
 if(kind==='bark'&&command==='expire')delete S.druideBark;
 updateAfterAction();
}
const damageElementLabels={fire:'Feu',cold:'Froid',lightning:'Électricité',acid:'Acide'};
function breathFeature(a){
 const features=D.passiveFeatures??D.forgeSnapshot?.passiveFeatures;
 return Array.isArray(features)&&a.abilityId?features.find(f=>f.kind==='breath'&&f.sourceAbilityId===a.abilityId):undefined;
}
function breathDetails(a){
 const f=breathFeature(a);
 if(!f)return '';
 return '<p><b>'+esc(damageElementLabels[f.element]||f.element)+' · '+esc(f.damageDice)+' DM</b> · Cône de '+esc(f.coneMeters)+' × '+esc(f.coneWidthMeters)+' m. Test d’'+esc(f.save.stat.toUpperCase())+' difficulté '+esc(f.save.difficulty)+' pour diviser les dégâts par deux.</p>';
}
const roundQuotaAbility=/^ability:(?:tour-de-magie-g|lanceur-de-couteau-g|attaque-a-suivre-g|droite-gauche-g|acrobaties-g|teigneux-g|piqure-de-rappel-g|charge-au-galop|tir-en-mouvement:path:voie-du-centaure):/;
function runtimeAbility(a){
 return D.forgeSnapshot?.abilityRuntimeCatalog?.find(entry=>entry.id===a.abilityId);
}
function isMagicTrick(a){
 return /^ability:tour-de-magie-g:/.test(a.abilityId||'')||
  Number(a.rank)===3&&/^Tour de magie(?:\s*\(G\))?\*?$/i.test(a.name||'')&&/sans dépenser aucun PM/i.test(a.text||'');
}
function isReplacedFollowUpAttack(a){
 return /^ability:attaque-a-suivre-g:/.test(a.abilityId||'')&&
  ownedAbilities().some(other=>/^ability:droite-gauche-g:/.test(other.abilityId||''));
}
function roundUsage(a){
 const rule=runtimeAbility(a);
 if(D.warriorRules&&String(a.pathId||'').includes('class-guerrier')){const id=a.abilityId||'';if(/^ability:teigneux-g:/.test(id)&&ownedPathRank('voie-du-soldat')>=5){const max=Math.max(0,(Number(D.stats.AGI)||0)+2);return{scope:'round',max,label:max+' fois/round'};}if(/^ability:(?:proteger-un-allie-g|parer-un-coup-m|prouesse-g|piqure-de-rappel-g|riposte-g):/.test(id))return{scope:'round',max:1,label:'1 fois/round'};}

 // The source says "un tour ... par round", which the descriptor does not parse.
 if(!isMagicTrick(a)&&!roundQuotaAbility.test(a.abilityId||''))return null;
 if(!isMagicTrick(a)&&!rule?.quotas?.some(q=>q.period==='round'&&q.resolvedMax===1))return null;
 const centaur=/^ability:(?:charge-au-galop|tir-en-mouvement:path:voie-du-centaure):/.test(a.abilityId||'');
 const shared=centaur&&ownedAbilities().filter(other=>other.pathId===a.pathId).every(other=>Number(other.rank)<4);
 return{scope:'round',max:1,label:'1 fois/round',pool:shared?'centaur-round-action':undefined};
}
function regenerationTranceUsage(a){
 if(a.abilityId!=='ability:foh81:psionique:voie-du-controle-corporel:r2')return null;
 const daily=runtimeAbility(a)?.quotas?.find(q=>q.period==='day'&&q.maxFormula==='pathRank');
 const max=daily?.resolvedMax;
 if(!Number.isSafeInteger(max)||max<2)return null;
 return{scope:'day',max,label:max+' fois/jour'};
}
function roundUsageControls(){
 const tracked=ownedAbilities().filter(a=>roundUsage(a)&&!isReplacedFollowUpAttack(a));
 if(!tracked.length)return'';
 const used=tracked.some(a=>Number(S.uses[usageKey(a)])>0);
 return `<button type="button" class="mini-button" data-reset="round" ${used?'':'disabled'}>Réactiver les usages du round</button>`;
}
function usage(a){if(isReplacedFollowUpAttack(a))return null;const tracked=roundUsage(a)||regenerationTranceUsage(a);if(tracked)return tracked;const breath=breathFeature(a);if(breath)return{scope:'combat',max:breath.usesPerCombat,label:breath.usesPerCombat+' fois/combat'};if(isHealingTrance(a))return null;const druid=druideAbility(a);if(druid==='berries')return null;if(druid==='forest')return{scope:'day',max:1,label:'1 fois/jour'};if(chevalierAbility(a)==='douleur')return{scope:'combat',max:1,label:'1 fois/combat'};if(isRage(a))return{scope:'day',max:rageMax(),label:'Rage/jour'};if(isDefyDeath(a)||isWarCry(a))return{scope:'combat',max:1,label:'1 fois/combat'};if(a.manualUsage!=null)return{scope:'day',max:a.manualUsage,label:a.manualUsage+' utilisations'};if(isExplosives(a)&&a.rank>=2){const rank=Math.max(...(D.paths||[]).filter(p=>p.pathId?.includes('voie-des-explosifs')).flatMap(p=>p.ranks.filter(r=>r.owned).map(r=>r.rank)),2);return{scope:'day',max:rank,label:rank+' charges/jour',pool:'charges-explosives'}}const text=((a.name||'')+' '+(a.text||'')).toLowerCase();if(/une fois par (jour|journée) par rang/.test(text))return{scope:'day',max:Number(a.rank)||1,label:(Number(a.rank)||1)+' fois/jour'};if(/une fois par (jour|journée)|1 fois par (jour|journée)/.test(text))return{scope:'day',max:1,label:'1 fois/jour'};if(/une fois par combat|1 fois par combat/.test(text))return{scope:'combat',max:1,label:'1 fois/combat'};const m=text.match(/(\d+) fois par (jour|journée|combat)/);if(m)return{scope:m[2]==='combat'?'combat':'day',max:Number(m[1]),label:m[1]+' fois/'+(m[2]==='combat'?'combat':'jour')};return null}
function usageKey(a){return usage(a)?.pool||a.id}
function resourceCost(a){if(a.manualCost>0)return{kind:'pm',amount:a.manualCost,label:a.manualCost+' PM'};const rule=runtimeAbility(a);if(rule?.spell&&!rule.manaByAction&&!rule.manaByNC&&!rule.manaEscalation&&!rule.costNotes&&Number.isSafeInteger(rule.manaCost)&&rule.manaCost>=0){return rule.manaCost===0?null:{kind:'pm',amount:rule.manaCost,label:rule.manaCost+' PM'};}if(isMagicTrick(a))return null;const text=(a.text||'');const pm=text.match(/(?:pour|coûte|dépense|dépenser)\s+(\d+)\s*PM/i);const pc=text.match(/(?:pour|coûte|dépense|dépenser)\s+(\d+)\s*(?:PC|points? de chance)/i);const dr=text.match(/(?:pour|coûte|dépense|dépenser)\s+(\d+)\s*DR/i);if(pm)return{kind:'pm',amount:+pm[1],label:pm[1]+' PM'};if(pc)return{kind:'pc',amount:+pc[1],label:pc[1]+' PC'};if(dr)return{kind:'dr',amount:+dr[1],label:dr[1]+' DR'};if(a.spell===true||/\*/.test(a.name||''))return{kind:'pm',amount:Number(a.rank)||1,label:(Number(a.rank)||1)+' PM (rang du sort)'};return null}
const conditionsInfo={Affaibli:'Dé malus aux tests utilisant FOR, AGI ou CON.',Aveuglé:'-5 en attaque au contact et en DEF ; -10 pour attaquer à distance.',Étourdi:'Aucune action et -5 en DEF.',Immobilisé:'Aucun déplacement et dé malus en attaque.',Ralenti:'Une seule action de mouvement ou d’attaque.',Renversé:'-5 en DEF ; une action d’attaque est nécessaire pour se relever.',Surpris:'Ne peut pas agir avant son premier tour et vulnérable à certains effets.',Inconscient:'Ne peut pas agir. La situation exacte est tranchée par le MJ.'};
document.body.innerHTML=`<main class="sheet"><header class="sheet-top"><span class="back">✦ Ma fiche COF2</span><button class="pill" id="solo-ranks" aria-label="Ouvrir l’accueil et les sauvegardes">☰ Accueil</button></header><div class="tabs-wrap"><nav class="tabs" aria-label="Sections"><button class="active" data-page="play">Mon tour</button><button data-page="fight">Règles de combat</button><button data-page="abilities">Capacités</button><button data-page="stats">Caractéristiques</button><button data-page="bag">Inventaire</button><button data-page="rest">Repos et usages</button><button data-page="notes">Notes</button>${hasAnimalCompanion?'<button data-page="companion">Compagnon</button>':''}</nav></div><article class="paper"><header class="identity"><div><small>FICHE PERSONNELLE COF2</small><h1>${esc(D.name)}</h1><p>${esc([D.people,D.family,D.profile].filter(Boolean).join(' · '))}</p></div><div class="level"><small>NIV.</small><b>${esc(D.level)}</b></div></header><div id="resource-accordion" class="resource-accordion"><button type="button" id="resource-toggle" aria-controls="resources" aria-expanded="true"><span>PV · Défense · Ressources</span><span class="resource-toggle-hint">Replier ▴</span></button><section class="resources" id="resources"></section></div><div id="quick-bonus-overview" class="content"></div><div class="content"><section class="page active" id="play"></section><section class="page" id="fight"></section><section class="page" id="abilities"></section><section class="page" id="stats"></section><section class="page" id="bag"></section><section class="page" id="rest"></section><section class="page" id="notes"></section>${hasAnimalCompanion?'<section class="page" id="companion"></section>':''}<p class="source">Les dés restent physiques ; la fiche assure le suivi. ${window.SOLO_HUB_MODE?'Enregistre dans le hub avec le bouton au-dessus de la fiche.':'Sauvegarde automatique sur cet appareil.'}</p></div></article></main><div class="toast" id="toast" role="status"></div>`;
document.getElementById('solo-ranks').onclick=()=>parent.postMessage({type:'cof2-home'},location.origin);
const $=selector=>document.querySelector(selector);
const resourcePreference='cof2_solo_resource_open_'+id,resourceToggle=$('#resource-toggle');let resourcesOpen=true;try{resourcesOpen=localStorage.getItem(resourcePreference)!=='0';}catch{}function applyResourcesOpen(){resourceToggle.setAttribute('aria-expanded',String(resourcesOpen));$('#resources').hidden=!resourcesOpen;resourceToggle.querySelector('.resource-toggle-hint').textContent=resourcesOpen?'Replier ▴':'Déplier ▾';}resourceToggle.addEventListener('click',()=>{resourcesOpen=!resourcesOpen;applyResourcesOpen();try{localStorage.setItem(resourcePreference,resourcesOpen?'1':'0');}catch{}});applyResourcesOpen();
let sheetView=localStorage.getItem('cof2_solo_sheet_view_'+id)||'simple',sheetText=localStorage.getItem('cof2_solo_sheet_text')||'normal',uiTopic='',uiAbilityId='';
const controls=document.createElement('div');controls.className='sheet-view-controls';controls.innerHTML='<div class="view-segment" role="group" aria-label="Présentation de la fiche"><button data-view="simple" aria-label="Fiche simplifiée">Simple</button><button data-view="complete" aria-label="Fiche détaillée">Détail</button></div><label class="text-size-control" title="Taille du texte"><span aria-hidden="true">Aa</span><select id="sheet-text" aria-label="Taille du texte"><option value="normal">Normal</option><option value="large">Grand</option><option value="xl">Très grand</option></select></label>';
$('.sheet-top').after?.(controls);
const infoDialog=document.createElement('dialog');infoDialog.className='sheet-info-dialog';infoDialog.setAttribute('aria-labelledby','sheet-info-title');infoDialog.innerHTML='<header><h2 id="sheet-info-title"></h2><button data-ui-close aria-label="Fermer la fenêtre">Fermer ×</button></header><div id="sheet-info-body"></div>';document.body.appendChild(infoDialog);
function applySheetView(){document.body.classList.toggle('sheet-simple',sheetView==='simple');document.body.classList.toggle('sheet-large',sheetText==='large');document.body.classList.toggle('sheet-xl',sheetText==='xl');controls.querySelectorAll('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.view===sheetView)));const size=$('#sheet-text');if(size)size.value=sheetText;}
function simpleAbility(a){if(WC.isAbility(a))return `<button class="simple-ability" data-ui-ability="${esc(a.id)}"><strong>${esc(a.name)}</strong><span>Rang ${a.rank} · calculs et conditions</span><b aria-hidden="true">›</b></button>`;const u=usage(a),cost=resourceCost(a),remaining=u?Math.max(0,u.max-(Number(S.uses[usageKey(a)])||0)):null,status=priestAbilityStatus(a);return `<button class="simple-ability" data-ui-ability="${esc(a.id)}"><strong>${esc(a.name)}</strong><span>${status?.active===false?'Inactif · ':status?.bonus?'+'+status.bonus+' DEF · ':''}${esc(actionType(a))}${cost?' · '+esc(cost.label):''}${u?' · '+remaining+'/'+u.max:''}</span><b aria-hidden="true">›</b></button>`}
function drawInfo(){let title='',html='';const move=movement();
 if(uiTopic==='ability'){const a=ownedAbilities().find(x=>x.id===uiAbilityId);if(!a)return;title=a.name;html=abilityHtml(a)}
 if(uiTopic==='tests'){title='Le MJ me demande un test';html=testCards()+actionBonusesHtml(true)}
 if(uiTopic==='rules'){title='Que puis-je faire pendant mon tour ?';html=$('#fight').innerHTML}
 if(uiTopic==='mana'){title='Comprendre le mana';html=manaGuide(false)}
 if(uiTopic==='gear'){title='Mon équipement actif';html=priestGearHtml()+activeEquipmentHtml()}
 if(uiTopic==='states'){title='Mes états';html=`<p class="manual-state-note">Suivi manuel : applique les effets à la table.</p><div class="condition-form"><select id="condition-select"><option value="">Ajouter un état…</option>${Object.keys(conditionsInfo).map(x=>`<option>${x}</option>`).join('')}</select><button class="mini-button primary" id="condition-add">Ajouter</button></div><div>${S.conditions.map(x=>`<article><h3>${esc(x)}</h3><p>${esc(conditionsInfo[x])}</p><button data-remove-condition="${esc(x)}">Retirer cet état</button></article>`).join('')||'<p>Aucun état manuel actif.</p>'}</div>`}
 if(uiTopic==='resources'){title='Mes ressources et repères';html='<div class="resources">'+fullResourcesHtml()+'</div>'+`<p>Dé de récupération : ${esc(D.combat.recoveryDie)}. Vitesse : ${move.meters} m, soit ${move.cases} cases.</p><button data-page-jump="rest">Ouvrir repos et récupération</button>`}
 if(uiTopic==='more'){title='Toutes mes informations';html='<div class="info-menu"><button data-page-jump="stats">Caractéristiques et traits</button><button data-page-jump="fight">Règles de combat</button><button data-page-jump="notes">Mes notes</button><button data-page-jump="rest">Repos et usages</button></div>'}
 $('#sheet-info-title').textContent=title;$('#sheet-info-body').innerHTML=html;if(uiTopic==='tests')filterQuick();
}
function showInfo(topic,abilityId=''){uiTopic=topic;uiAbilityId=abilityId;drawInfo();if(!infoDialog.open)infoDialog.showModal();}
infoDialog.addEventListener('click',e=>{if(e.target===infoDialog)infoDialog.close()});infoDialog.addEventListener('close',()=>uiTopic='');
document.addEventListener('click',e=>{const close=e.target.closest?.('[data-ui-close]');if(close){infoDialog.close();return}const view=e.target.closest?.('[data-view]');if(view){sheetView=view.dataset.view;localStorage.setItem('cof2_solo_sheet_view_'+id,sheetView);applySheetView();renderAll();return}const a=e.target.closest?.('[data-ui-ability]');if(a){showInfo('ability',a.dataset.uiAbility);return}const c=e.target.closest?.('[data-ui-modal]');if(c)showInfo(c.dataset.uiModal);if(infoDialog.open&&e.target.closest?.('[data-page-jump]'))infoDialog.close();});
document.addEventListener('change',e=>{if(e.target.id==='sheet-text'){sheetText=e.target.value;localStorage.setItem('cof2_solo_sheet_text',sheetText);applySheetView()}});
const more=document.createElement('button');more.dataset.uiModal='more';more.className='simple-more';more.textContent='Plus';$('.tabs').appendChild(more);applySheetView();

function activatePage(page,{updateHash=false}={}){const target=$(`#${page}`),tab=document.querySelector(`.tabs [data-page="${page}"]`);if(!target||!target.classList.contains('page'))return false;document.querySelectorAll('.tabs [data-page]').forEach(x=>x.classList.toggle('active',x===tab));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x===target));if(updateHash&&history.replaceState)history.replaceState(null,'','#'+page);tab?.scrollIntoView?.({behavior:'smooth',inline:'center',block:'nearest'});return true}
document.addEventListener('click',event=>{const control=event.target.closest?.('[data-page],[data-page-jump]');if(!control)return;const page=control.dataset.page||control.dataset.pageJump;if(activatePage(page,{updateHash:true})){event.preventDefault();window.scrollTo?.({top:0,behavior:'smooth'})}});
window.addEventListener('hashchange',()=>activatePage(location.hash.slice(1)));
const escapeSelector=value=>window.CSS?.escape?window.CSS.escape(value):String(value).replace(/["\\]/g,'\\$&');
const openInventoryItems=new Set();document.addEventListener('toggle',event=>{const details=event.target.closest?.('details[data-item]');if(!details)return;if(details.open)openInventoryItems.add(details.dataset.item);else openInventoryItems.delete(details.dataset.item)},true);if(window.MutationObserver)new MutationObserver(()=>{openInventoryItems.forEach(itemId=>{const details=document.querySelector(`details[data-item="${escapeSelector(itemId)}"]`);if(details)details.open=true})}).observe($('#bag'),{childList:true,subtree:true});
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
function fullResourcesHtml(){S.hp=clamp(S.hp,0,max.hp);S.pc=clamp(S.pc,0,max.pc);S.pm=clamp(S.pm,0,max.pm);S.dr=clamp(S.dr,0,max.dr);S.silver=Math.max(0,Number(S.silver)||0);const rows=[['hp','PV',max.hp],['pc','Chance',max.pc],['pm','Mana',max.pm],['dr','Récup.',max.dr]],move=movement();return rows.map(([k,label,m])=>`<div class="resource"><small>${label}</small><div class="counter"><button data-count="${k}" data-delta="-1" aria-label="Retirer 1 ${label}">−</button><b>${S[k]}/${m}</b><button data-count="${k}" data-delta="1" aria-label="Ajouter 1 ${label}">+</button></div></div>`).join('')+`<div class="resource"><small>Défense</small><b>${esc(finalValue('def'))}</b><em>${esc(defenseDetail())}</em></div><div class="resource"><small>Initiative</small><b>${esc(finalValue('init'))}</b></div><div class="resource"><small>Vitesse</small><b>${move.meters} m</b><em>${move.cases} cases</em></div>`}
function renderResources(){const quick=$('#quick-bonus-overview');if(quick){const wasOpen=!!quick.querySelector('details[open]');quick.innerHTML=actionBonusesHtml(wasOpen);filterQuick();}const full=fullResourcesHtml();$('#resources').innerHTML=sheetView==='complete'?full:`<div class="resource"><small>Points de vie</small><div class="counter"><button data-count="hp" data-delta="-1" aria-label="Retirer un point de vie">−</button><b>${S.hp}/${max.hp}</b><button data-count="hp" data-delta="1" aria-label="Ajouter un point de vie">+</button></div></div><div class="resource"><small>Défense</small><b>${esc(finalValue('def'))}</b><em>${esc(defenseDetail())}</em></div><div class="resource"><small>Vitesse</small><b>${movement().meters} m</b></div><button class="resource resource-more" data-ui-modal="resources">Mana, chance<br>et récupération →</button>`;if(infoDialog.open&&uiTopic==='resources')drawInfo()}

const ensorceleurSpells={
 'sous-tension-m':'tension',
 'image-decalee-m':'image',
 'sommeil-l':'sleep',
 'choc-a':'shock'
};
function ensorceleurAbility(a){
 return ensorceleurSpells[slug(a.name).replace(/^rang-\d+-/,'')]||'';
}
function ensorceleurAttackDamage(a){
 return ['tension','shock'].includes(ensorceleurAbility(a))
  ?'1d'+evolvingDie()+'°'+signed(Number(D.stats?.CHA)||0):a.damage;
}
function ensorceleurPlayHtml(a){
 const kind=ensorceleurAbility(a);
 if(!kind)return'';
 const cha=Number(D.stats?.CHA)||0, die=evolvingDie(), mana=resourceCost(a)?.amount||Number(a.rank);
 const disabled=S.pm<mana||rageActive();
 const button=(action,label,off=false)=>`<button type="button" class="mini-button" data-ensorceleur="${esc(a.id)}" data-spell-action="${action}" ${off?'disabled':''}>${label}</button>`;
 const field=(name,label,min,max='')=>`<label>${label} <input type="number" step="1" inputmode="numeric" data-spell-field="${name}" min="${min}" ${max===''?'':'max="'+max+'"'}></label>`;
 let html='';
 if(kind==='tension'){
  const active=S.ensorceleurTension;
  html=active?`<p>Chargé pour ${cha} min de jeu. Contact ou blessure au contact : 1d${die}° DM. Décharge (A) : attaque magique contre DEF à 10 m, 1d${die}°${signed(cha)} DM.</p>
   ${button('touch','Résoudre un contact')}${field('distance','Distance de la cible en mètres',0,10)}${button('discharge','Décharger',active.used)}
   ${button('round','Round suivant')}${button('expire','Terminer Sous tension')}`:
   button('cast',`Se charger · ${mana} PM`,disabled||cha<1);
 }
 if(kind==='image'){
  html=S.ensorceleurImage>0?`<p>${S.ensorceleurImage} round(s) restant(s). Sur 5 ou 6 au d6, l’attaque qui touche n’inflige aucun DM.</p>
   ${field('roll','Résultat du d6',1,6)}${button('evade','Résoudre une attaque')}
   ${button('round','Round suivant')}`:
   `${field('roll','Résultat du d4 de durée',1,4)}${button('cast',`Créer les images · ${mana} PM`,disabled)}`;
 }
 if(kind==='sleep'){
  const rank=ownedPathRank('voie-de-l-envouteur'), limit=rank>=5?3:rank>=4?2:1;
  const targets=S.ensorceleurSleepTargets||[];
  html=`<p>Zone de 10 m de diamètre à 20 m. Cibles vivantes de NC inférieur à ${limit}. Inconscience ${cha} min, réveil par une action d’attaque infligeant 1 DM.</p>
   ${S.uses[usageKey(a)]?`<p>Déjà utilisé dans ce combat. Jusqu’à ${S.ensorceleurSleep??'—'} cible(s).</p>
   <p>Endormis : ${targets.filter(x=>x.asleep).map(x=>esc(x.name)).join(', ')||'aucun'}</p>
   ${targets.length<S.ensorceleurSleep?`<label>Cible <input data-spell-target maxlength="80"></label>
    <label><input type="checkbox" data-spell-living> Créature vivante dans la zone</label>
    <label>NC <input type="number" min="0" step="any" data-spell-field="nc"></label>
    ${button('sleep-target','Endormir la cible')}`:''}
   ${targets.some(x=>x.asleep)?`<label>Cible endormie <select data-spell-wake>${targets.filter(x=>x.asleep).map(x=>`<option>${esc(x.name)}</option>`).join('')}</select></label>
    ${button('wake','Réveiller · 1 DM')}`:''}`:
   field('roll','Dé évolutif de capacité',1,die)+button('cast',`Lancer Sommeil · ${mana} PM`,disabled||cha<1)}`;
 }
 if(kind==='shock'){
  html=`<p>À 20 m, attaque magique contre DEF : 1d${die}°${signed(cha)} DM.</p>
   ${field('distance','Distance en mètres',0,20)}
   <label><input type="checkbox" data-spell-hit> Attaque magique réussie</label>
   <label>NC de la cible <input type="number" step="any" min="0" data-spell-field="nc"></label>
   ${field('force','Total du test de FOR si requis',-20)}
   ${button('cast',`Lancer Choc · ${mana} PM`,disabled)}
   ${button('concentrate','Lancer Choc en action limitée · 0 PM',rageActive())}`;
 }
 return `<div class="ability-actions">${html}<p role="status" data-spell-result></p></div>`;
}
function resolveEnsorceleur(button){
 const a=ownedAbilities().find(x=>x.id===button.dataset.ensorceleur);
 if(!a)return;
 const kind=ensorceleurAbility(a),action=button.dataset.spellAction,card=button.closest('.ability');
 const result=card.querySelector('[data-spell-result]'),cha=Number(D.stats?.CHA)||0,die=evolvingDie();
 const field=name=>{const value=card.querySelector('[data-spell-field="'+name+'"]')?.value;return value?Number(value):NaN;};
 const roll=field('roll'),validRoll=max=>Number.isSafeInteger(roll)&&roll>=1&&roll<=max;
 const cost=action==='concentrate'?0:resourceCost(a)?.amount||Number(a.rank);
 const casting=action==='cast'||action==='concentrate';
 if(casting&&(rageActive()||S.pm<cost))return;
 let message='';
 if(kind==='tension'){
  if(casting&&!S.ensorceleurTension&&cha>0)S.ensorceleurTension={used:false};
  if(action==='touch'&&S.ensorceleurTension)message='Contact : 1d'+die+'° DM à la créature.';
  if(action==='discharge'&&S.ensorceleurTension&&!S.ensorceleurTension.used){
   const distance=field('distance');
   if(!Number.isFinite(distance)||distance<0||distance>10){result.textContent='La décharge exige une cible à 10 m ou moins.';return}
   S.ensorceleurTension.used=true;
   message='Décharge : attaque magique contre DEF, 1d'+die+'°'+signed(cha)+' DM si elle touche.';
  }
  if(action==='round'&&S.ensorceleurTension)S.ensorceleurTension.used=false;
  if(action==='expire')delete S.ensorceleurTension;
 }
 if(kind==='image'){
  if(casting){
   if(!validRoll(4)||roll+cha<1){result.textContent='Saisis un d4 valide et vérifie la durée.';return}
   S.ensorceleurImage=roll+cha;
  }
  if(action==='round'&&S.ensorceleurImage>0)S.ensorceleurImage--;
  if(action==='evade'&&S.ensorceleurImage>0){
   if(!validRoll(6)){result.textContent='Saisis le résultat du d6.';return}
   result.textContent=roll>=5?'Image touchée : aucun DM.':'L’attaque inflige ses DM normalement.';
   return;
  }
 }
 if(kind==='sleep'&&casting){
  if(S.uses[usageKey(a)]||cha<1)return;
  if(!validRoll(die)){result.textContent='Saisis un résultat de dé valide.';return}
  S.uses[usageKey(a)]=1;
  S.ensorceleurSleep=roll+cha;
  S.ensorceleurSleepTargets=[];
 }
 if(kind==='sleep'&&action==='sleep-target'&&S.uses[usageKey(a)]){
  const target=card.querySelector('[data-spell-target]').value.trim(),nc=field('nc');
  const rank=ownedPathRank('voie-de-l-envouteur'),limit=rank>=5?3:rank>=4?2:1;
  const targets=S.ensorceleurSleepTargets||[];
  if(!slug(target)||!card.querySelector('[data-spell-living]').checked||!Number.isFinite(nc)||nc<0||nc>=limit){
   result.textContent='Choisis une créature vivante dans la zone avec un NC inférieur à '+limit+'.';
   return;
  }
  if(targets.some(x=>slug(x.name)===slug(target))){result.textContent='Cette créature a déjà été comptée.';return}
  if(targets.length<S.ensorceleurSleep)S.ensorceleurSleepTargets=[...targets,{name:target,asleep:true}];
 }
 if(kind==='sleep'&&action==='wake'){
  const name=card.querySelector('[data-spell-wake]').value;
  const target=(S.ensorceleurSleepTargets||[]).find(x=>x.name===name&&x.asleep);
  if(target){target.asleep=false;message=name+' se réveille après une action d’attaque et 1 DM.'}
 }
 if(kind==='shock'&&casting){
  const distance=field('distance'),nc=field('nc'),hit=card.querySelector('[data-spell-hit]').checked;
  const force=field('force'),needsTest=hit&&nc<ownedPathRank('voie-de-l-invocation');
  if(!Number.isFinite(distance)||distance<0||distance>20){result.textContent='La cible doit être à 20 m ou moins.';return}
  if(hit&&(!Number.isFinite(nc)||nc<0||needsTest&&!Number.isSafeInteger(force))){
   result.textContent='Saisis le NC de la cible et le résultat de FOR si requis.';return;
  }
  message=hit?'1d'+die+'°'+signed(cha)+' DM. '+(needsTest&&force<10?'La cible est renversée.':'La cible reste debout.'):'Attaque manquée.';
 }
 if(casting)S.pm-=cost;
 updateAfterAction();
 if(message){
  const updated=document.querySelector('dialog [data-spell-result]');
  if(updated)updated.textContent=message;
  toast(message);
 }
}

function forgesortAbility(a){
 const name=slug(a.name).replace(/^rang-\d+-/,'');
 return ({
  'fortifiant-l':'tonic','feu-gregeois-l':'fire','morsure-de-la-forge-m':'bite',
  'metal-brulant-m':'heat','rune-de-puissance-l':'rune'
 })[name]||'';
}
function forgesortWeapons(){
 const attacks=(D.attacks||[]).filter(a=>/^(contact|distance)$/i.test(a.type)).map(a=>a.name);
 const equipped=equippedItems().filter(a=>a.equipment?.weapon).map(a=>a.name);
 return [...new Set([...attacks,...equipped].filter(Boolean))];
}
function forgeBiteBonus(){
 const paths=(D.paths||[]).filter(p=>String(p.pathId||'').includes('class-forgesort'));
 return 2+paths.filter(p=>p.ranks.some(r=>r.rank===4&&r.owned)).length;
}
function forgeFireDamage(name,type){
 return S.forgeBite===name&&slug(type)==='contact'?' + '+forgeBiteBonus()+' feu':'';
}
function forgesortPlayHtml(a){
 const kind=forgesortAbility(a);
 if(!kind)return'';
 const die=evolvingDie(),int=Number(D.stats?.INT)||0,mana=resourceCost(a)?.amount||0;
 const button=(action,label,off=false)=>`<button type="button" class="mini-button" data-forgesort="${esc(a.id)}" data-forge-action="${action}" ${off?'disabled':''}>${label}</button>`;
 const number=(field,label,min,max)=>`<label>${label} <input data-forge-field="${field}" type="number" step="1" inputmode="numeric" min="${min}" max="${max}"></label>`;
 const select=(field,label,options)=>`<label>${label} <select data-forge-field="${field}">${options.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>`;
 const weapon=filter=>select('weapon','Arme',forgesortWeapons().filter(filter));
 const noMana=S.pm<mana||rageActive();
 let html='';
 if(kind==='tonic'){
  html=S.forgeTonic>0?`<p>${S.forgeTonic} test(s) avec un dé bonus, pendant 30 min au total.</p>
   ${button('test','Utiliser un dé bonus')}${button('end','Terminer le Fortifiant')}`:
   `${number('roll','Résultat du dé de soin',1,die)}${button('cast','Boire le Fortifiant')}`;
 }
 if(kind==='fire'){
  html=`<p>Portée 10 m, rayon 3 m, réussite automatique. AGI difficulté ${10+int} pour diviser les DM par deux.</p>
   ${number('distance','Distance en mètres',0,10)}${number('roll','Total de 2d'+die+'°',2,2*die)}
   ${number('save','Total du test d’AGI',-20,99)}${button('cast','Résoudre le Feu grégeois')}`;
 }
 if(kind==='bite'){
  html=S.forgeBite?`<p>${esc(S.forgeBite)} · +${forgeBiteBonus()} DM de feu au contact, pendant ${int} min ou jusqu’à ce que l’arme soit lâchée.</p>${button('end','Éteindre l’arme')}`:
   `${weapon(x=>/bâton|baton|marteau/i.test(x))}${button('cast','Enflammer l’arme · '+mana+' PM',noMana||int<1)}`;
 }
 if(kind==='heat'){
  const active=S.forgeHeat;
  html=active?`<p>${esc(active.object)} · ${active.rounds} round(s). ${active.object==='Arme'?'1 DM par round et −2 aux tests d’attaque.':'1d'+die+'° DM par round. Retrait de l’armure par une action limitée.'}</p>
   ${button('round','Résoudre le round')}${button('end','Terminer l’effet')}`:
   `<p>Attaque magique opposée, à 20 m maximum.</p>${number('distance','Distance en mètres',0,20)}
    ${select('object','Objet métallique porté',['Arme','Armure'])}
    <label><input type="checkbox" data-forge-hit> Test opposé réussi</label>
    ${number('roll','Résultat du d4 de durée',1,4)}${button('cast','Lancer Métal brûlant · '+mana+' PM',noMana)}`;
 }
 if(kind==='rune'){
  const rune=S.forgeRune;
  html=rune?`<p>${esc(rune.weapon)} · rune valable 24 h. ${rune.used?'Déjà déclenchée dans ce combat.':'À annoncer avant le jet de dégâts. Maximise les dés de l’arme. Les dés bonus se lancent normalement.'}</p>
   ${button('trigger','Déclencher sur une attaque réussie',rune.used)}${button('end','Dissiper la rune')}`:
   `${weapon(()=>true)}${button('cast','Inscrire la rune · '+mana+' PM',noMana||int<1)}`;
 }
 return `<div class="ability-actions">${html}<p role="status" data-forge-result></p></div>`;
}
function resolveForgesort(button){
 const a=ownedAbilities().find(x=>x.id===button.dataset.forgesort);
 if(!a)return;
 const kind=forgesortAbility(a),action=button.dataset.forgeAction,card=button.closest('.ability');
 const result=card.querySelector('[data-forge-result]'),die=evolvingDie(),int=Number(D.stats?.INT)||0;
 const value=key=>card.querySelector('[data-forge-field="'+key+'"]')?.value;
 const number=key=>value(key)?Number(value(key)):NaN;
 const bounded=(key,min,max)=>Number.isSafeInteger(number(key))&&number(key)>=min&&number(key)<=max;
 const mana=resourceCost(a)?.amount||0,casting=action==='cast';
 if(casting&&mana&&(S.pm<mana||rageActive()))return;
 let message='';
 if(kind==='tonic'){
  if(casting){
   if(!bounded('roll',1,die)){result.textContent='Saisis le résultat du dé de soin.';return}
   S.hp=Math.min(max.hp,S.hp+number('roll'));
   S.forgeTonic=3;
  }
  if(action==='test'&&S.forgeTonic>0)S.forgeTonic--;
  if(action==='end')delete S.forgeTonic;
 }
 if(kind==='fire'&&casting){
  if(!bounded('distance',0,10)||!bounded('roll',2,die*2)||!Number.isSafeInteger(number('save'))){
   result.textContent='Saisis une distance valide, les DM et le total d’AGI.';return;
  }
  const damage=number('roll');
  message=(number('save')>=10+int?Math.floor(damage/2):damage)+' DM de feu.';
 }
 if((kind==='bite'||kind==='rune')&&casting){
  const weapon=value('weapon');
  if(int<1||!forgesortWeapons().includes(weapon)||kind==='bite'&&!/bâton|baton|marteau/i.test(weapon)){
   result.textContent='Choisis une arme compatible.';return;
  }
  if(kind==='bite')S.forgeBite=weapon;
  else S.forgeRune={weapon,used:false};
 }
 if(kind==='bite'&&action==='end')delete S.forgeBite;
 if(kind==='heat'){
  if(casting){
   if(!bounded('distance',0,20)){result.textContent='La cible doit être à 20 m ou moins.';return}
   if(card.querySelector('[data-forge-hit]').checked){
    if(!bounded('roll',1,4)||number('roll')+int<1){result.textContent='Saisis le d4 pour calculer la durée.';return}
    S.forgeHeat={object:value('object'),rounds:number('roll')+int};
   }else message='Test opposé manqué.';
  }
  if(action==='round'&&S.forgeHeat){
   message=S.forgeHeat.object==='Arme'?'1 DM et −2 aux tests d’attaque.':'1d'+die+'° DM au porteur.';
   if(--S.forgeHeat.rounds===0)delete S.forgeHeat;
  }
  if(action==='end')delete S.forgeHeat;
 }
 if(kind==='rune'){
  if(action==='trigger'&&S.forgeRune&&!S.forgeRune.used){
   S.forgeRune.used=true;
   message='Dés de l’arme maximisés. Lance les dés bonus normalement.';
  }
  if(action==='end')delete S.forgeRune;
 }
 if(casting)S.pm-=mana;
 updateAfterAction();
 if(message){
  const updated=document.querySelector('dialog [data-forge-result]');
  if(updated)updated.textContent=message;
  toast(message);
 }
}


function warriorAbility(a){return !!WC?.isAbility(a);}
function warriorWeapons(){const originals=(D.attacks||[]).filter(a=>{if(a.abilityId||a.weaponId==='weapon:unarmed'||String(a.id||'').startsWith('natural:'))return true;const base=String(a.name||a.label||'').replace(/\s*\([^)]*\)/g,'').trim(),items=(S.inventory||[]).filter(i=>[i.name,i.base].some(n=>String(n||'').trim()===base));return items.some(i=>i.quantity>0)&&!items.some(i=>i.quantity>0&&i.equipped&&i.equipment?.weapon);}).map((a,i)=>{const kind=/distance/i.test(a.type)?'distance':/mag/i.test(a.type)?'magic':'contact';return{...a,id:a.id||'reference-'+i,attack:(Number(a.attack??a.attackBonus)||0)+finalValue(kind)-(Number(D.combat[kind])||0)};}),added=equippedItems().flatMap(item=>{const weapon=item.equipment?.weapon||{},modes=Array.isArray(weapon.modes)?weapon.modes:weapon.attackType?[weapon]:[];return modes.map((m,i)=>{const kind=m.attackType||'contact',wb=WC.weaponBonus(D,{name:item.base||item.name,type:kind});return{id:'item-'+item.id+'-'+i,name:item.name+' — '+(m.label||kind),type:kind,hands:m.hands||weapon.hands||(/deux mains/i.test(item.base||item.name)?2:1),attack:finalValue(kind)+(Number(m.attackBonus)||0)+wb.attack,damage:String(m.damage||'')+signed((Number(D.stats?.[m.damageStat])||0)+(Number(m.damageBonus)||0)+wb.damage),criticalThreshold:Math.max(16,(m.criticalThreshold||(/rapi[eè]re/i.test(item.base||item.name)?19:20))-wb.critical)};});});return [...originals,...added];}
function warriorContext(){const gear=protectionNow();return{shield:gear.shield>0,armor:gear.armor,contact:finalValue('contact'),weapons:warriorWeapons()};}
function warriorResultHtml(result){if(!result)return '';return '<section class="notice" data-warrior-result aria-live="polite"><b>'+esc(result.message||'Résultat')+'</b>'+(result.total!=null?'<p>Test '+result.total+' contre '+result.opposed+' · '+esc(result.diceMode==='malus'?'dé malus':result.diceMode==='bonus'?'dé bonus':'dé normal')+'</p>':'')+(result.damageTaken!=null?'<p>'+result.damageTaken+' PV retirés.</p>':'')+(result.testBonus?'<p>+'+result.testBonus+' au test de '+esc(result.stat)+' ; coût '+result.hpCost+' PV.</p>':'')+(result.rows||[]).map((r,i)=>'<p>Attaque '+(i+1)+' : d20 '+r.roll+' + '+r.attackBonus+' = '+r.total+' · '+(r.tie?'égalité, relancer':r.hit?(r.critical?'critique':'réussie'):'manquée')+' · DM '+esc(r.damage)+'</p>').join('')+(result.rows?.some(r=>r.critical)?'<p>Critique : double les DM de l’arme, bonus fixes inclus ; les dés bonus de capacité restent lancés normalement.</p>':'')+(result.stopsMovement?'<p>Rempart : déplacement de cet adversaire stoppé.</p>':'')+(result.mustTargetWarrior?'<p>INT négative et DM infligés : cet adversaire doit te prendre pour cible à sa prochaine attaque.</p>':'')+'</section>';}
function warriorQuota(action){const w=WC.state(S),r=WC.inspect(D,S).ranks;if(['vivacity','laststand'].includes(action))return{used:Number(w.combatUses[action])||0,max:1};const pool=['prepare','parry','absorb'].includes(action)?'parry':action;if(['protect','parry','riposte','prowess','teigneux','reminder'].includes(pool))return{used:Number(w.roundUses[pool])||0,max:pool==='teigneux'&&r.soldier>=5?Math.max(0,(Number(D.stats.AGI)||0)+2):1};return null;}
function warriorAbilityHtml(a){const st=WC.inspect(D,S,warriorContext()),key=WC.code(a),r=st.ranks,field=(name,label,type='number')=>'<label>'+esc(label)+'<input data-warrior-field="'+name+'" type="'+type+'" '+(type==='number'?'step="1" inputmode="numeric"':'')+'></label>',check=(name,label)=>'<label><input type="checkbox" data-warrior-field="'+name+'"> '+esc(label)+'</label>',select=(name,label,values)=>'<label>'+esc(label)+'<select data-warrior-field="'+name+'">'+values.map(([value,text])=>'<option value="'+esc(value)+'">'+esc(text)+'</option>').join('')+'</select></label>',button=(action,label)=>{const quota=warriorQuota(action),remaining=quota?Math.max(0,quota.max-quota.used):null;return '<button type="button" class="mini-button primary" data-warrior-action="'+action+'" '+(remaining===0?'disabled':'')+'>'+esc(label)+(quota?' · '+remaining+'/'+quota.max:'')+'</button>';};
 const weapons=warriorWeapons().filter(w=>/contact/i.test(w.type)||key==='master:4'&&WC.categories(w).includes('thrown')),weaponFields=()=>select('weaponId','Arme utilisée',weapons.map(w=>[w.id,w.name]))+field('rolls','d20 lancés, séparés par des virgules','text')+field('defense','DEF de la cible');
 let content='',notes='';
 if(key==='shield:1')content=field('target','Allié','text')+check('inContact','Allié à mon contact')+check('beforeResult','Annonce faite avant le résultat de l’attaque')+button('protect','Accorder +2 DEF à cet allié');
 if(key==='shield:2'||key==='shield:4')content=button('prepare','Préparer la posture (M)')+'<p>Posture : '+(st.state.braced?'préparée':'non préparée')+'. Test opposé : FOR ou AGI ; une résolution par round.</p>'+select('stat','Caractéristique',[['FOR','FOR'],['AGI','AGI']])+field('rolls','d20 (deux pour un dé malus)','text')+field('opposed','Total de l’attaque adverse')+(key==='shield:2'?select('incomingType','Type d’attaque',[['contact','Contact'],['distance','Distance']])+field('damage','DM de l’attaque adverse')+check('huge','Adversaire énorme ou colossal')+(r.shield>=5?check('free','Parer en action gratuite, avec dé malus'):'')+button('parry','Résoudre la parade'):field('target','Lanceur du sort','text')+check('spell','Il s’agit bien d’un sort')+check('area','Sort de zone')+button('absorb','Résoudre l’absorption'));
 if(key==='shield:3')content='<p>Avec bouclier : +'+(r.shield>=5?2:1)+' DEF et réduction '+r.shield+' des DM de zone, sauf surprise.</p>'+field('damage','DM de zone reçus, après le test éventuel')+button('area','Appliquer la réduction et retirer les PV');
 if(key==='shield:5')content='<p>Parade gratuite avec dé malus disponible dans Parer un coup. Renvoi : immédiatement après une absorption réussie, sauf sort de zone.</p>'+button('reflect','Renvoyer le sort absorbé');
 if(key==='combat:1')content='<p>+3 INIT ; +3 pour éviter immobilisation ou renversement.</p>'+button('vivacity','Utiliser le mouvement supplémentaire');
 if(key==='combat:2')content=weaponFields()+field('target','Adversaire ciblé','text')+field('opposed','Total du test opposé')+'<p>Dé bonus : deux d20. Une répétition sur la même cible impose −5 cumulatif. Aucun DM.</p>'+button('maneuver','Résoudre la manœuvre');
 if(key==='combat:3')content=weaponFields()+check('limited','Action limitée : +3 dés évolutifs au lieu de +2')+'<p>Dé malus : deux d20. À ce niveau, le dé évolutif est d'+st.die+'.</p>'+button('power','Résoudre l’attaque puissante');
 if(key==='combat:4'||key==='combat:5')content=weaponFields()+check('power','Ajouter Attaque puissante (+2 dés évolutifs, dé malus)')+(key==='combat:5'?field('targetCount','Nombre d’adversaires')+field('defenses','DEF distinctes, dans le même ordre que les jets (facultatif)','text')+check('allInContact','Tous ces adversaires sont à mon contact'):'')+'<p>−2 par attaque. Saisis un d20 par attaque, deux avec un dé malus. Pour des DEF différentes, compare chaque total à la DEF de son adversaire.</p>'+button(key==='combat:4'?'double':'circular',key==='combat:4'?'Résoudre les deux attaques':'Résoudre l’attaque circulaire');
 if(key==='master:1')content='<p>+1 attaque avec les catégories de prédilection. Estimation des armes et réputation martiale : +'+(r.master+2)+'.</p>';
 if(key==='master:2')content='<p>Seuil critique diminué de 1 pour les armes de prédilection. Le seuil de chaque attaque figure sur sa carte.</p>';
 if(key==='master:3')content='<p>Spécialisations : '+esc(Object.entries(WC.training(D)).map(([k,v])=>({swords:'épées',axes:'haches',maces:'masses',spears:'lances',thrown:'armes de jet'}[k]||k)+' +'+v+' DM').join(' ; '))+'</p>';
 if(key==='master:4')content=weaponFields()+check('power','Ajouter Attaque puissante : les dés bonus et malus s’annulent')+field('nc','NC de la cible, pour désarmer')+'<p>Arme de prédilection : dé bonus et +1d'+st.die+' DM. Désarmer remplace tous les DM et exige NC inférieur au bonus de DM de Spécialisation.</p>'+button('perfect','Attaque parfaite avec dégâts')+button('disarm','Attaque parfaite pour désarmer');
 if(key==='master:5'||key==='soldier:1'||key==='soldier:3')content=weaponFields()+field('target','Adversaire','text')+check('inContact','Adversaire à mon contact')+(key==='master:5'?check('enemyMissed','Il a raté son attaque au contact contre moi')+button('riposte','Résoudre la riposte'):key==='soldier:1'?check('leaving','Il tente de quitter mon contact')+'<p>Quota : '+(r.soldier>=5?Math.max(0,Number(D.stats.AGI)+2):1)+' adversaire(s) par round.</p>'+button('teigneux','Résoudre Teigneux'):check('attacksOther','Il attaque une autre créature')+field('targetInt','INT de cet adversaire')+field('damageDealt','DM réellement infligés')+button('reminder','Résoudre Piqûre de rappel'));
 if(key==='resistance:1')content='<p>Robustesse : +'+(r.resistance+2)+' PV (déjà inclus) ; +'+(r.resistance+2)+' aux efforts physiques, à la chaleur et au froid naturels.</p>';
 if(key==='resistance:2')content='<p>Récupération rapide : '+st.recoveryMinutes+' minutes. Résister à étourdi ou affaibli : +'+r.resistance+'.</p>';
 if(key==='resistance:3')content='<p>Choix conservé : '+(D.warriorRules?.plateMastery?'armure de plaques autorisée pour les capacités de guerrier (armure à obtenir).':'+1 DEF, déjà inclus.')+'</p>';
 if(key==='resistance:4'||key==='soldier:4')content='<p>'+ (key==='resistance:4'?'CON +1, PV recalculés pour tous les niveaux et DR ajustés. Dé bonus aux tests de CON.':'FOR +1, attaque et dégâts au contact recalculés. Dé bonus aux tests de FOR.')+'</p>';
 if(key==='resistance:5')content='<p>+1 DEF inclus. Immobilisé : pas de dé malus. Étourdi : peut encore attaquer, avec dé malus.</p>'+button('laststand','Déclencher le dernier round à 0 PV')+(st.state.lastStand?'<button type="button" class="mini-button" data-warrior-reset="laststand">Fin de mon dernier round</button>':'');
 if(key==='resistance:4'||key==='soldier:4')content=field('rolls','Deux d20 pour le test héroïque','text')+field('difficulty','Difficulté du test')+'<p>Dé bonus uniquement aux tests de caractéristique, jamais aux attaques.</p>'+button(key==='resistance:4'?'constitution':'strength','Résoudre le test héroïque');
 if(key==='resistance:1')content='<p>Robustesse : +'+(r.resistance+2)+' PV ; +'+(r.resistance+2)+' aux tests d’effort physique et résistance à la chaleur ou au froid naturels.</p>';
 if(key==='resistance:2')content='<p>Récupération rapide : '+st.recoveryMinutes+' min ; +'+r.resistance+' pour résister aux états étourdi ou affaibli.</p>';
 if(key==='resistance:3')content='<p>Choix conservé : '+(D.warriorRules?.plateMastery?'plaques autorisées (à obtenir et équiper)':'bonus permanent +1 DEF')+'.</p>';
 if(key==='resistance:4'||key==='soldier:4')content=field('rolls','d20 lancés (deux avec dé bonus)','text')+field('difficulty','Difficulté du test')+'<p>Dé bonus de caractéristique ; aucun dé bonus aux attaques.</p>'+button(key==='resistance:4'?'constitution':'strength','Résoudre le test héroïque');
 if(key==='soldier:1')notes='<p>+'+(r.soldier+2)+' aux tests contre alcool et privation de nourriture ou sommeil.</p>';
 if(key==='soldier:2')content=select('stat','Test amélioré',[['FOR','FOR'],['CON','CON']])+field('cost','Résultat du d'+st.die+' à sacrifier')+'<p>+5 au test, une fois par round, même après son résultat.</p>'+button('prowess','Sacrifier les PV et appliquer Prouesse');
 if(key==='soldier:5')content='<p>+1 DEF inclus. Teigneux peut viser '+Math.max(0,Number(D.stats.AGI)+2)+' adversaires distincts par round ; un coup réussi stoppe leur déplacement.</p>';
 const warning=!st.armorAllowed?'Armure trop lourde : capacités de guerrier interdites.':key.startsWith('shield:')&&!st.shield?'Bouclier non manié : capacité indisponible.':'';
 return '<article class="ability warrior-ability" data-warrior-code="'+esc(key)+'"><h3>'+esc(a.name)+'</h3><p>'+esc(a.text)+'</p>'+(warning?'<p class="error">'+esc(warning)+'</p>':'')+'<div class="warrior-fields">'+content+notes+'</div>'+warriorResultHtml(st.state.lastResult?.path===key.split(':')[0]?st.state.lastResult:null)+'</article>';
}
function warriorConsoleHtml(){if(!WC.inspect(D,S).hasWarrior)return '';const w=WC.state(S);return '<article class="card"><h3>Guerrier — round '+w.round+'</h3><p>Les dés restent physiques. La fiche calcule les résultats saisis, vérifie les déclencheurs et conserve les usages.</p><button class="mini-button" data-warrior-reset="turn">Début de mon prochain tour</button><button class="mini-button" data-warrior-reset="round">Nouveau round</button>'+(w.lastStand?'<p>Dernier round à 0 PV actif.</p><button class="mini-button" data-warrior-reset="laststand">Fin de mon dernier round</button>':'')+warriorResultHtml(w.lastResult)+'</article>';}
function resolveWarrior(control){const holder=control.closest('.warrior-ability'),input={};for(const el of holder?.querySelectorAll('[data-warrior-field]')||[]){const k=el.dataset.warriorField;input[k]=el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':Number(el.value)):el.value;}input.rolls=String(input.rolls||'').split(/[,;\s]+/).filter(Boolean).map(Number);input.defenses=String(input.defenses||'').split(/[,;\s]+/).filter(Boolean).map(Number);try{const resolved=WC.resolve(D,S,warriorContext(),control.dataset.warriorAction,input);Object.assign(S,resolved.play);updateAfterAction();toast(resolved.result.message);}catch(error){toast(error.message);}}

function warriorInfoHtml(){const w=D.warriorRules;if(!w)return warriorConsoleHtml();return warriorConsoleHtml()+`<article class="card"><h3>Guerrier · rangs et choix conservés</h3><p>Récupération rapide : ${w.recoveryMinutes} min. Réduction des DM de zone : ${w.areaDamageReduction} avec le bouclier, sauf surprise. Maîtrise des plaques : ${w.plateMastery?'oui (armure à obtenir et équiper)':'non'}. Dé bonus aux tests : ${esc(w.heroicTests.join(', ')||'aucun')}.</p><p>Armes de prédilection : ${esc(Object.entries(w.preferredWeapons).map(([k,v])=>({swords:'épées',axes:'haches',maces:'masses',spears:'lances',thrown:'armes de jet'}[k])+' (+'+v+' DM)').join(', ')||'aucune')}.</p><p>Parade, attaques supplémentaires, Prouesse et Attaque puissante : applique les conditions et les coûts indiqués dans la capacité ; aucun bonus conditionnel n’est ajouté en permanence.</p></article>`;}
function attackHtml(a){const ammo=a.ammo||a.magazine;return`<article class="attack"><div class="attack-head"><h3>${esc(a.name)} · ${signed((Number(a.attack)||0)+(WC.inspect(D,S).hasWarrior?finalValue(/distance/i.test(a.type)?'distance':/mag/i.test(a.type)?'magic':'contact')-(Number(D.combat[/distance/i.test(a.type)?'distance':/mag/i.test(a.type)?'magic':'contact'])||0):druideTerrainBonus()))}</h3><span class="tag">${esc(a.type)}</span></div><p><b>${esc(ensorceleurAttackDamage(a))}${rageDamage(a.type)}${mountedDamage(a.type)}${forgeFireDamage(a.name,a.type)} DM</b> · ${esc(a.range||'—')} ${rageRestriction(a.type)}${a.damageType?' · '+esc(a.damageType):''}${a.special?' · '+esc(a.special):''}</p>${a.criticalThreshold<20?`<p>Critique : ${a.criticalThreshold}–20</p>`:''}${ammo?`<div class="ability-actions"><span class="tag">Munitions ${Number(S.ammo[a.id]??ammo.current??ammo.capacity)}/${esc(ammo.capacity)}</span><button class="mini-button" data-ammo="${esc(a.id)}" data-ammo-delta="-1">Tirer</button><button class="mini-button" data-ammo="${esc(a.id)}" data-ammo-delta="1">Recharger</button></div>`:''}</article>`}
function abilityHtml(a){if(WC.isAbility(a))return warriorAbilityHtml(a);if(isReplacedFollowUpAttack(a))return `<article class="ability"><h3>${esc(a.name)}</h3><p>${esc(a.text)}</p><p><strong>Remplacée par Droite-gauche.</strong></p></article>`;const availability=priestAbilityStatus(a);if(availability&&!availability.active)return `<article class="ability"><h3>${esc(a.name)}</h3><p>${esc(a.text)}</p><p><strong>Inactif — ${esc(availability.reason)}</strong></p></article>`;const type=actionType(a),u=usage(a),cost=resourceCost(a),used=Number(S.uses[usageKey(a)])||0,remaining=u?Math.max(0,u.max-used):null;return`<article class="ability"><div class="ability-head"><div><span class="tag action">${type}</span> <span class="tag">Rang ${a.rank}</span></div>${u?`<span class="tag ${remaining===0?'used':''}">${remaining}/${u.max} disponible</span>`:''}</div><h3>${esc(a.name)}</h3><p><b>${esc(a.path)}</b></p><p>${esc(a.text)}</p>${breathDetails(a)}${availability?.bonus?`<p class="faith-status"><b>Actif : +${availability.bonus} DEF</b> · ${esc(availability.reason)}</p>`:''}${a.source?`<small class="source">${esc(a.source.edition||a.source.document||'Source')} · p. ${esc(a.source.printedPage||'—')}${a.source.bookId==='cof1-compagnon-2017'?' · adaptation vers COF2':''}</small>`:''}${!forgesortAbility(a)&&!ensorceleurAbility(a)&&!druideAbility(a)&&!chevalierAbility(a)&&!bardeAbility(a)&&!isDefyDeath(a)&&!isWarCry(a)&&!isRage(a)&&!isManaArmorAbility(a)&&!mutationAbilityIs(a)&&!isSuccubusAbility(a)&&!isHealingTrance(a)&&!hasMageFamiliarAbility(a)&&(u||cost)?`<div class="ability-actions">${u?`<button class="mini-button primary" data-use="${a.id}" ${remaining===0?'disabled':''}>Utiliser</button><button class="mini-button" data-refund="${a.id}" ${used===0?'disabled':''}>Annuler</button>`:cost?`<button class="mini-button primary" data-spend="${a.id}">Dépenser ${cost.label}</button>`:''}${cost?`<span class="tag">Coût : ${cost.label}</span>`:''}</div>`:''}${isBoneArmorAbility(a)?boneArmorPanel():''}${isManaArmorAbility(a)?manaArmorPanel():''}${mutationAbilityIs(a)?mutationPanel():''}${isSuccubusAbility(a)?succubusPanel():''}${Number(a.rank)===1&&cleanAbilityName(a)==='pacifisme'?pacifismPanel():''}${Number(a.rank)===2&&cleanAbilityName(a)==='parade-croisee'?crossParryPanel():''}${(Number(a.rank)===2&&cleanAbilityName(a).startsWith('familier')&&slug(a.path)==='voie-de-la-magie-universelle'||Number(a.rank)===1&&cleanAbilityName(a)==='familier'&&slug(a.path)==='voie-du-familier'||Number(a.rank)===1&&cleanAbilityName(a)==='familier'&&slug(a.path)==='voie-du-familier')?familiarPanel():''}${isHealingTrance(a)?healingTrancePanel():''}${tourDeForceHtml(a)}${barbareCombatHtml(a)}${bardePlayHtml(a)}${chevalierPlayHtml(a)}${druidePlayHtml(a)}${ensorceleurPlayHtml(a)}${forgesortPlayHtml(a)}${isDefyDeath(a)?'<p role="status" data-barbare-outcome></p>':''}</article>`}
function manaGuide(compact=false){if(max.pm<1)return'';return`<article class="mana-guide ${compact?'compact':''}"><div class="mana-title"><div><small>AIDE DU LANCEUR DE SORTS</small><h3>Mana : ${S.pm}/${max.pm} PM</h3></div><span class="tag mana-tag">${esc(D.profile||'Magie')}</span></div><div class="mana-steps"><p><b>1 · Lancer</b><span>Le coût normal d’un sort est égal à son rang. Retire ces PM après le lancement.</span></p><p><b>2 · Économiser</b><span>Un sort noté (A) peut devenir une action limitée (L) pour coûter 2 PM de moins.</span></p><p><b>3 · À court de mana</b><span>Brûlure : chaque PM manquant inflige ${esc(D.combat.recoveryDie)} DM, sans réduction. Impossible pour un sort de soin.</span></p><p><b>4 · Récupérer</b><span>La récupération rapide ne rend pas de PM. Une récupération complète de 8 h les remet au maximum, au plus une fois par jour.</span></p></div>${compact?'':`<div class="ability-actions"><button class="mini-button" data-page-jump="rest">Ouvrir la récupération</button></div>`}</article>`}
function peopleCombatNotes(){const people=slug(D.people||''),rows=[];if(people==='halfelin'&&isArquebusier()){rows.push('<b>Armes à poudre et petite taille (COF2 p. 187)</b> : une arme humaine impose un dé malus ; la pétoire peut être utilisée à deux mains sans ce malus. Un calibre halfelin réduit les dés de dégâts (pétoire 1d8, mousquet 1d12). Choisis le matériel réellement possédé avec ton MJ.');}if(people==='demi-ogre'){rows.push('<b>Demi-ogre (Compagnon p. 12–13, adaptation COF2)</b> : vérifie la limitation dans les espaces étroits et la Réaction violente ; les armes à sa taille ont des règles particulières. Les capacités acquises restent détaillées dans l’onglet Capacités.');}return rows.length?'<aside class="notice lineage-combat-notes">'+rows.map(x=>'<p>'+x+'</p>').join('')+'</aside>':'';}
function petoireStock(){const raw=S.ammo?.['petoire-stock'];if(raw==null||raw==='')return null;const n=Number(raw);return Number.isFinite(n)?clamp(Math.floor(n),0,999):null}
function petoireCounter(){if(!hasPetoire())return'';const n=petoireStock(),loaded=S.ammo?.['petoire-loaded'];return `<article class="card"><h3>Pétoire : ${loaded===true?'chargée · 1 tir prêt':loaded===false?'déchargée':'état à renseigner'}</h3><p>Après chaque tir, recharge avec une action limitée (L). Impossible de recharger avec un adversaire actif au contact. Le pistolero permet de tirer au contact, pas d’y recharger.</p><div class="ability-actions"><button class="mini-button primary" data-petoire-fire="true" ${loaded!==true||n===0?'disabled':''}>Tirer · arme déchargée ensuite</button><button class="mini-button" data-petoire-load="true" ${loaded===true?'disabled':''}>${loaded==null?'Marquer déjà chargée / recharger (L)':'Recharger (L)'}</button><button class="mini-button" data-petoire-empty="true" ${loaded===false?'disabled':''}>Corriger : déchargée</button></div><p>Règles COF2 : aucun quota de tirs par jour. Les munitions ordinaires ne sont normalement pas décomptées.</p><details><summary>Stock de munitions facultatif${n==null?' · non suivi':' · '+n+' restantes'}</summary><p>À utiliser seulement si le MJ fait suivre la réserve. Le livre indique 20 à 50 projectiles comme réserve usuelle en cas de suivi exceptionnel, sans imposer un stock initial. Le total inclut la munition chargée ; seul Tirer retire une munition.</p><label>Stock restant <input id="petoire-stock-value" type="number" min="0" max="999" step="1" value="${n??''}" inputmode="numeric"></label> <button class="mini-button" data-petoire-set="true">Enregistrer le stock</button><button class="mini-button" data-petoire-untrack="true">Ne pas suivre le stock</button></details><p><small>Livre de base, p. 185 et 187 ; artilleur rang 2, p. 63. Pas de chargeur à répétition acquis. Sauvegarde sur cet appareil. Les actions restent à gérer à la table.</small></p></article>`}
function explosiveCounter(){const a=ownedAbilities().find(a=>isExplosives(a)&&a.rank===2);if(!a)return'';const u=usage(a),used=Number(S.uses[usageKey(a)])||0;return `<article class="card explosive-counter"><h3>Charges explosives : ${Math.max(0,u.max-used)}/${u.max}</h3><p>Réserve quotidienne commune. Le repos complet réinitialise les charges.</p><button class="mini-button primary" data-use="${a.id}" ${used>=u.max?'disabled':''}>Dépenser une charge</button><button class="mini-button" data-refund="${a.id}" ${used<1?'disabled':''}>Annuler une dépense</button></article>`}
function compactStatesHtml(){const names=S.conditions||[];return `<button type="button" class="compact-states${names.length?' has-states':''}" data-ui-modal="states" aria-label="Gérer les états manuels"><span>États manuels</span><span class="states-summary">${names.length?esc(names.join(' · ')):'Aucun état'}</span><span aria-hidden="true">›</span></button>`;}
function renderPlay(){if(sheetView==='simple'){const active=ownedAbilities().filter(a=>WC.isAbility(a)||forgesortAbility(a)||druideAbility(a)||chevalierAbility(a)||actionType(a)!=='Passif'||usage(a)||resourceCost(a)||isBoneArmorAbility(a)||isManaArmorAbility(a)||Number(a.rank)===1&&cleanAbilityName(a)==='pacifisme'||Number(a.rank)===2&&cleanAbilityName(a)==='parade-croisee'||Number(a.rank)===2&&cleanAbilityName(a).startsWith('familier')&&slug(a.path)==='voie-de-la-magie-universelle'||Number(a.rank)===1&&cleanAbilityName(a)==='familier'&&slug(a.path)==='voie-du-familier'||Number(a.rank)===2&&cleanAbilityName(a).startsWith('familier')&&slug(a.path)==='voie-de-la-magie-universelle'||Number(a.rank)===1&&cleanAbilityName(a)==='familier'&&slug(a.path)==='voie-du-familier'||Number(a.rank)===1&&cleanAbilityName(a)==='pacifisme'||Number(a.rank)===2&&cleanAbilityName(a)==='parade-croisee'||isManaArmorAbility(a)||isBoneArmorAbility(a));$('#play').innerHTML=`${warriorInfoHtml()}${peopleCombatNotes()}${boneArmorPanel()}${manaArmorPanel()}${mutationPanel()}${succubusPanel()}${psiShieldPanel()}${pacifismPanel()}${crossParryPanel()}${familiarPanel()}${healingTrancePanel()}${petoireCounter()}${explosiveCounter()}${roundUsageControls()}<p class="simple-hint">Choisis ce que tu veux faire. Les dés se lancent à la main.</p><div class="simple-shortcuts">${hasAnimalCompanion?'<button data-page-jump="companion"><strong>Mon loup</strong><span>Gérer ses points de vie →</span></button>':''}<button data-ui-modal="tests"><strong>Faire un test</strong><span>Test demandé par le MJ →</span></button><button data-ui-modal="rules"><strong>Comprendre mon tour</strong><span>Déplacement, attaque et actions →</span></button><button data-ui-modal="gear"><strong>Mon équipement actif</strong><span>Armure, bouclier et effets →</span></button>${max.pm>0?'<button data-ui-modal="mana"><strong>Comprendre le mana</strong><span>Coûts et récupération →</span></button>':''}</div>${compactStatesHtml()}<section id="shared-initiative"></section><div class="section-title">Attaques prêtes</div><p class="simple-hint">Lance 1d20 + le bonus de l’attaque choisie. Les dégâts sont indiqués juste dessous.</p><div class="list">${equippedAttacksHtml()}${(D.attacks||[]).map(attackHtml).join('')||(!equippedAttacksHtml()?'<div class="empty">Aucune attaque renseignée.</div>':'')}</div><div class="section-title">Mes actions et sorts</div><div class="simple-actions">${active.map(simpleAbility).join('')||'<p>Mes capacités passives sont dans l’onglet Capacités.</p>'}</div>`;return}const active=ownedAbilities().filter(a=>WC.isAbility(a)||forgesortAbility(a)||druideAbility(a)||chevalierAbility(a)||actionType(a)!=='Passif'||usage(a)||resourceCost(a));$('#play').innerHTML=`${warriorInfoHtml()}${peopleCombatNotes()}${boneArmorPanel()}${manaArmorPanel()}${mutationPanel()}${succubusPanel()}${psiShieldPanel()}${pacifismPanel()}${crossParryPanel()}${familiarPanel()}${healingTrancePanel()}${petoireCounter()}${explosiveCounter()}${roundUsageControls()}<div class="dashboard"><article class="card"><h2>Attaquer : 1d20 + bonus</h2><div class="value-grid">${valueWithBase('contact','CONTACT')}${valueWithBase('distance','DISTANCE')}${valueWithBase('magic','MAGIE')}<div class="value"><small>DR</small><b>${esc(D.combat.recoveryDie)}</b></div></div></article></div>${compactStatesHtml()}${testCards()}<section id="shared-initiative"></section>${manaGuide(true)}<div class="section-title">Attaques prêtes</div><div class="list">${equippedAttacksHtml()}${(D.attacks||[]).map(attackHtml).join('')||(!equippedAttacksHtml()?'<div class="empty">Aucune attaque renseignée.</div>':'')}</div><div class="section-title">Équipement actif</div><div class="combat-grid">${priestGearHtml()}${activeEquipmentHtml()}</div><div class="section-title">Actions propres à ce personnage</div><div class="personal-actions">${active.map(abilityHtml).join('')||'<div class="empty">Les capacités acquises sont passives. Consulte Capacités pour leur texte complet.</div>'}</div>`;renderConditions()}
function renderConditions(){const el=$('#conditions');if(!el)return;el.innerHTML=S.conditions.length?S.conditions.map(x=>`<span class="condition" title="${esc(conditionsInfo[x]||'')}">${esc(x)} <button data-remove-condition="${esc(x)}" aria-label="Retirer ${esc(x)}">×</button></span>`).join(''):'<span class="empty">Aucun état actif.</span>'}
function renderFight(){const move=movement();$('#fight').innerHTML=`<div class="section-title">Mon tour : choisir une formule</div><div class="choice-grid"><article class="choice"><strong>(L) Une action limitée</strong><p>Une capacité notée (L) ou une action complexe occupe normalement tout le tour.</p></article><article class="choice"><strong>(M) + (A)</strong><p>${move.meters} m, soit ${move.cases} cases complètes, et une attaque dans l’ordre de ton choix.</p></article><article class="choice"><strong>(M) + (M)</strong><p>${move.doubleMeters} m, soit ${move.doubleCases} cases complètes.</p></article></div><div class="notice"><b>Échelle de la grille : 1 case = ${gridMeters} m.</b> Le déplacement en cases est arrondi à l’inférieur pour ne jamais dépasser la vitesse du personnage.</div><div class="section-title">Actions courantes</div><div class="combat-grid"><article class="choice"><strong>Marcher (M)</strong><p>${move.meters} m · ${move.cases} cases. Il est possible de dégainer pendant le déplacement.</p></article><article class="choice"><strong>Attaquer (A)</strong><p>1d20 physique + valeur de contact, distance ou magie contre la DEF.</p></article><article class="choice"><strong>Défense partielle (A)</strong><p>+3 en DEF et aux tests opposés pendant 1 round.</p></article><article class="choice"><strong>Défense totale (L)</strong><p>+5 en DEF et aux tests opposés pendant 1 round.</p></article><article class="choice"><strong>Sprinter (L)</strong><p>${move.sprintMeters} m · ${move.sprintCases} cases en ligne droite ; jusqu’au prochain tour, -5 en DEF et dé malus aux tests.</p></article><article class="choice"><strong>Se relever (A)</strong><p>Se relever ou ramasser une arme utilise l’action d’attaque.</p></article></div><div class="section-title">Options utiles</div><div class="rules"><details><summary>Attaque assurée et attaque puissante</summary><div><b>Assurée :</b> +5 en attaque, DM divisés par deux.<br><b>Précise ou violente :</b> -3 en attaque pour +1d4 DM, ou -7 pour +2d4 DM.</div></details><details><summary>Sorts et mana</summary><div>Respecte le type d’action du sort. Son coût normal est égal à son rang. Un sort (A) peut devenir (L) pour coûter 2 PM de moins. La brûlure de mana inflige, pour chaque PM manquant, des DM égaux au dé de récupération et ne permet pas de lancer un soin.</div></details><details><summary>Manœuvres</summary><div>Action limitée, test opposé d’attaque et aucun dégât : distraire, gêner, repousser, bloquer, désarmer, aveugler, renverser ou étourdir. Répéter une manœuvre sur la même cible pendant le combat impose ensuite -5 cumulatif.</div></details><details><summary>Deux armes et dégâts temporaires</summary><div><b>Deux armes (L) :</b> une attaque avec chaque arme, toutes deux avec dé malus ; arme secondaire limitée à 1d6 DM.<br><b>Assommer :</b> dé malus sauf arme adaptée, puis retrancher la FOR de la cible aux DM temporaires.</div></details></div><p class="source">Synthèse COF2 : combat p. 209–221 ; magie et sorts p. 227–228. Le texte officiel et la décision du MJ priment.</p>`}
function renderAbilities(){if(sheetView!=='simple'&&WC.inspect(D,S).hasWarrior){$('#abilities').innerHTML='<div class="section-title">Capacités acquises et résolutions</div>'+ownedAbilities().map(abilityHtml).join('');return;}if(sheetView==='simple'){$('#abilities').innerHTML=`<div class="section-title">Mes capacités acquises</div><p class="simple-hint">Ouvre une capacité pour lire son texte complet et suivre son utilisation.</p><div class="simple-actions">${ownedAbilities().map(simpleAbility).join('')}</div>`;return}const used=(D.paths||[]).filter(p=>(p.ranks||[]).some(r=>r.owned)),unused=(D.paths||[]).filter(p=>!(p.ranks||[]).some(r=>r.owned));$('#abilities').innerHTML=`<div class="section-title">Capacités acquises</div>${boneArmorPanel()}${manaArmorPanel()}${mutationPanel()}${succubusPanel()}${psiShieldPanel()}${pacifismPanel()}${crossParryPanel()}${familiarPanel()}${healingTrancePanel()}<div class="list">${used.map(path=>`<article class="path"><h3>${esc(path.name)}</h3>${path.ranks.filter(r=>r.owned).map(r=>`<div class="rank"><b><span class="check">✓</span>${r.rank}. ${esc(r.name)} <span class="tag action">${actionType(r)}</span></b><p>${esc(r.text)}</p></div>`).join('')}</article>`).join('')}</div><details class="future"><summary>Préparer une montée de niveau</summary><div class="future-content">${used.map(path=>`<h3>${esc(path.name)}</h3>${path.ranks.filter(r=>!r.owned).map(r=>`<p><b>${r.rank}. ${esc(r.name)}</b> — ${esc(r.text)}</p>`).join('')}`).join('')}</div></details><details class="future"><summary>Consulter les autres voies du profil</summary><div class="future-content">${unused.map(path=>`<h3>${esc(path.name)}</h3>${path.ranks.map(r=>`<p><b>${r.rank}. ${esc(r.name)}</b> — ${esc(r.text)}</p>`).join('')}`).join('')||'<p>Aucune autre voie renseignée.</p>'}</div></details>`}
function normalizedTraits(){const obj=Array.isArray(D.traits)&&D.traits.length?D.traits:D.traitDetails&&Object.keys(D.traitDetails).length?D.traitDetails:D.forgeSnapshot?.traits||[];const fmt=(k,v)=>{const labels={darkvisionMeters:'Vision dans le noir',oversizedWeapons:'Armes de grande taille',largeForResistingCreatureAbilities:'Grande taille pour résister aux capacités',moveMeters:'Vitesse',visionRangeMeters:'Portée de vision'};const label=labels[k]||String(k).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ');if(v==null)return'';if(typeof v==='string')return label==='traits'?v:label+' : '+v;if(typeof v==='number'||typeof v==='boolean')return label+' : '+v+(k==='darkvisionMeters'||k==='moveMeters'||k==='visionRangeMeters'?' m':'');if(Array.isArray(v))return label+' : '+v.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(', ');return label+' : '+JSON.stringify(v);};if(Array.isArray(obj))return obj.map((v,i)=>typeof v==='string'?v:fmt(v?.label||v?.name||'Trait '+(i+1),v?.text||v?.value||v)).filter(Boolean);return obj&&typeof obj==='object'?Object.entries(obj).map(([k,v])=>fmt(k,v)).filter(Boolean):[];}
function actionBonuses(){
 const rows=[];
 function collect(text,source,rank){
  const sentences=String(text||'').split(/(?<=[.!?])\s+(?=[A-ZÀ-Ÿ])/);
  sentences.forEach((sentence,index)=>{
   if(!/(?:tests?|crochet|discr[ée]tion|déplacement silencieux|intimidation|perception|escalade|initiative)/i.test(sentence)||!/(?:bonus|ajoute|obtient|bénéficie|remplac|utilis|résist|immunis)/i.test(sentence))return;
   // Keep the whole sentence: equipment, target and situational restrictions matter.
   if(/^Ce (?:bonus|dé)|^Cette capacité|^Il (?:doit|ne peut)/i.test(sentences[index+1]||''))sentence+=' '+sentences[index+1];
   const resolved=rank?sentence.replace(/(?:son|le) rang\s*\+\s*2/gi,`${rank+2} (rang ${rank} + 2)`):sentence;
   const actions=[[/baratin/i,'Baratin'],[/sédu|séduction/i,'Séduction'],[/persuasion|convain/i,'Persuasion'],[/négoci/i,'Marchandage'],[/crochet/i,'Crochetage'],[/désamorc|piège/i,'Pièges'],[/pickpocket/i,'Pickpocket'],[/évaluer/i,'Estimation'],[/discr[ée]tion|déplacements? silencieux|se déplacer silencieusement|furtivit[ée]/i,'Discrétion'],[/déguis/i,'Déguisement'],[/cacher une arme/i,'Dissimulation'],[/intimid/i,'Intimidation'],[/esquive|déplacement(?!s? silencieux)|saut|course|équilibre|escalade/i,'Déplacements'],[/poison|toxine/i,'Poisons'],[/recherche|indice|preuve|déduction|aveu/i,'Enquête'],[/danse|jonglerie|mime/i,'Danse, mime et jonglerie'],[/perception|détecter|repérer|observer/i,'Perception'],[/survie|pistage|pister|orientation/i,'Survie et pistage'],[/soins?|médecine|premiers secours/i,'Soins'],[/artisanat|fabriquer|\bforge\b/i,'Artisanat'],[/connaissances?|érudition/i,'Connaissances'],[/équitation|monter à cheval/i,'Équitation'],[/\b(?:nage|nager|natation)\b/i,'Natation'],[/initiative/i,'Initiative'],[/tests? de CHA/i,'Tests de CHA'],[/tests? d’AGI/i,'Tests d’AGI']].filter(([pattern])=>pattern.test(sentence)).map(([,label])=>label);
   rows.push({text:resolved,source,label:actions.join(' · ')||'Tests et actions'});
  });
 }
 (D.paths||[]).forEach(path=>{const owned=(path.ranks||[]).filter(r=>r.owned),rank=Math.max(0,...owned.map(r=>Number(r.rank)||0));owned.forEach(r=>collect(r.text,`${path.name} · rang ${r.rank} · ${r.name}`,rank));});
 normalizedTraits().forEach(text=>collect(text,`Trait · ${D.people||'personnage'}`,0));
 equippedItems().forEach(item=>collect([item.equipment?.effect,item.notes].filter(Boolean).join(' '),`Équipement · ${item.name}`,0));
 return rows.filter((row,index)=>rows.findIndex(x=>x.text===row.text&&x.source===row.source)===index);
}
function quickBonusRows(){
 const rows=[],seen=new Set(),owned=ownedAbilities(),structured=D.skillBonuses||D.forgeSnapshot?.skillBonuses||[];
 const byId=new Map(owned.filter(a=>a.abilityId).map(a=>[a.abilityId,a]));
 const pretty=t=>{const x=String(t||''),k=slug(x);if(/crochet/.test(k))return'Crochetage';if(/discretion|furtivite|silencieux|silencieusement/.test(k))return'Discrétion';if(/desamorc|piege/.test(k))return'Pièges';return x.charAt(0).toUpperCase()+x.slice(1)};
 const add=row=>{const key=[slug(row.label),row.value,row.condition||'',row.source||''].join('|');if(!seen.has(key)){seen.add(key);rows.push(row);}};
 for(const sk of structured){const ability=byId.get(sk.sourceAbilityId);if(ability&&priestAbilityStatus(ability)?.active===false)continue;if(sk.scope&&sk.scope!=='self')continue;const value=Number(sk.value);if(!Number.isFinite(value)||!value)continue;const tests=Array.isArray(sk.tests)?sk.tests:sk.skill?[sk.skill]:[];for(const test of tests)add({label:pretty(test),value:signed(value),condition:[sk.condition,sk.excludes?.length?'Sauf '+sk.excludes.join(', '):''].filter(Boolean).join(' · '),source:ability?.name||sk.sourceRule||'Bonus de capacité'});}
 // Source-text fallback for old sheets and bonuses not structured by Forge; retain the full conditions.
 for(const row of actionBonuses()){
  const match=owned.find(a=>row.source===a.path+' · rang '+a.rank+' · '+a.name);
  if(match&&priestAbilityStatus(match)?.active===false)continue;
  const covered=match?.abilityId?new Set(structured.filter(sk=>sk.sourceAbilityId===match.abilityId&&(!sk.scope||sk.scope==='self')&&Number.isFinite(Number(sk.value))).flatMap(sk=>(Array.isArray(sk.tests)?sk.tests:sk.skill?[sk.skill]:[]).map(t=>slug(pretty(t))))):new Set();
  const formula=row.text.match(/(\d+) \(rang \d+ \+ 2\)/),number=row.text.match(/(?:bonus (?:de )?|ajoute |obtient |bénéficie de )([+−-]\s*\d+)(?![\d]\s*|d\d)/i);
  const value=formula?'+'+formula[1]:number?number[1].replace(/\s/g,''):/dé (?:de )?bonus/i.test(row.text)?'dé bonus':/dé (?:de )?malus/i.test(row.text)?'dé malus':'Voir règle';
  let labels=row.label.split(' · ').filter(x=>x!=='Initiative');if(labels.length===0)continue;
  for(const label of labels)if(!covered.has(slug(label)))add({label,value,condition:row.text,source:match?.name||row.source});
 }
 return rows;
}
function actionBonusesHtml(expanded=false){const entries=quickBonusRows().sort((a,b)=>a.label.localeCompare(b.label,'fr')),preview=entries.slice(0,3);return entries.length?`<details class="quick-bonus-panel" ${expanded?'open':''}><summary><span>Bonus rapides <small>(${entries.length})</small></span><span class="quick-preview">${preview.map(row=>`<span>${esc(row.label)} <b>${esc(row.value)}</b></span>`).join('')}${entries.length>preview.length?`<span>+${entries.length-preview.length}</span>`:''}</span></summary><label class="quick-filter">Chercher un bonus<input data-quick-bonus-search type="search" placeholder="Crochetage, discrétion, perception…"></label><div class="action-bonuses">${entries.map(row=>`<span class="quick-bonus-item"><strong>${esc(row.label)}</strong> <b>${esc(row.value)}</b>${row.condition?`<small>${esc(row.condition)}</small>`:''}<small class="quick-bonus-source">${esc(row.source)}</small></span>`).join('')}</div><small>Bonus à appliquer au test lorsque les conditions sont remplies. Consulte la source ; les valeurs de combat intègrent déjà leurs propres effets.</small></details>`:'';}
function testCards(){const labels={FOR:'Force',AGI:'Agilité',CON:'Constitution',PER:'Perception',INT:'Intelligence',VOL:'Volonté',CHA:'Charisme'};return `<details class="quick-tests" open><summary>Test demandé par le MJ : 1d20 + caractéristique</summary><div class="stats">${Object.entries(D.stats).map(([k,v])=>`<div class="stat"><small>${esc(labels[k]||k)} (${k})</small><b>${signed(v)}</b></div>`).join('')}</div><small>Ajoute les bonus de capacité et les effets indiqués par le MJ lorsqu’ils s’appliquent.</small></details>`}

function featureLabel(f){const kind=slug(f.kind||'');const target=f.target||f.stat||'';if(kind==='violent-reaction')return 'Réaction violente';if(kind==='large-size')return 'Grande taille';if(kind==='bonus-die')return 'Dé bonus'+(target?' : '+target:'');if(kind==='damage-reduction')return 'Réduction des dégâts'+(f.value!=null?' : '+f.value:'');return [f.label,f.name,f.text,f.description,f.effect,kind?kind.replace(/-/g,' '):''].find(Boolean)||'Effet passif';}
function featuresInfoHtml(){
 const lines=[],features=Array.isArray(D.passiveFeatures)?D.passiveFeatures:Array.isArray(D.forgeSnapshot?.passiveFeatures)?D.forgeSnapshot.passiveFeatures:[],languages=(D.languages&&typeof D.languages==='object'?D.languages:D.forgeSnapshot?.languages)||null;
 if(D.age)lines.push('<p><b>Âge :</b> '+esc(D.age)+'</p>');if(Array.isArray(D.mechanicalWarnings)&&D.mechanicalWarnings.length)lines.push('<div class="section-title">Points de règle à confirmer</div><div class="notice">'+D.mechanicalWarnings.map(w=>'<p>'+esc(w)+'</p>').join('')+'</div>');
 if(features.length){const ids=new Map(ownedAbilities().filter(a=>a.abilityId).map(a=>[a.abilityId,a]));lines.push('<div class="section-title">Effets passifs enregistrés par Forge</div><div class="list">'+features.map(f=>{const source=ids.get(f.sourceAbilityId),label=featureLabel(f);return '<article class="item"><b>'+esc(label)+'</b>'+(source?'<p>'+esc(source.path+' · '+source.name)+'</p>':'')+(f.condition?'<small>'+esc(f.condition)+'</small>':'')+'</article>';}).join('')+'</div>');}
 const reductions=D.traitDetails?.damageReduction;
 const elementalReductions=Array.isArray(reductions)?reductions.filter(r=>r&&Array.isArray(r.types)&&Number.isFinite(r.value)):[];
 if(elementalReductions.length)lines.push('<div class="section-title">Réductions des dégâts</div>'+elementalReductions.map(r=>'<p>RD '+esc(r.value)+' · '+esc(r.types.map(type=>damageElementLabels[type]||type).join(', '))+'</p>').join(''));
 if(languages&&Object.keys(languages).length){const explain=value=>Array.isArray(value)?value.map(x=>typeof x==='string'?x:(x?.name||x?.label||JSON.stringify(x))).join(', '):typeof value==='string'?value:JSON.stringify(value);const titles={automatic:'Langues connues',selected:'Langues choisies',choicesAllowed:'Langues proposées',literacy:'Lecture et écriture',remainingSlots:'Langues encore à choisir'};lines.push('<div class="section-title">Langues et écritures</div><div class="list">'+Object.entries(languages).map(([key,value])=>'<article class="item"><b>'+esc(titles[key]||key.replace(/_/g,' '))+'</b><p>'+esc(explain(value))+'</p></article>').join('')+'</div>');}
 return lines.join('');
}
function renderStats(){const move=movement();$('#stats').innerHTML=`<div class="section-title">Caractéristiques</div><div class="stats">${Object.entries(D.stats||{}).map(([k,v])=>`<div class="stat"><small>${esc(k)}</small><b>${signed(v)}</b></div>`).join('')}</div>${featuresInfoHtml()}${psiShieldPanel()}${normalizedTraits().length?`<div class="section-title">Traits et restrictions</div><div class="list">${normalizedTraits().map(x=>`<div class="item">${esc(x)}</div>`).join('')}</div>`:''}<div class="section-title">Repères de combat</div><div class="value-grid"><div class="value"><small>DÉF</small><b>${esc(finalValue('def'))}</b><em>${esc(defenseDetail())}</em></div><div class="value"><small>INIT</small><b>${esc(finalValue('init'))}</b>${finalValue('init')!==Number(D.combat.init)?`<em>Base ${D.combat.init}</em>`:''}</div><div class="value"><small>VITESSE</small><b>${move.meters} m</b><em>${move.cases} cases de ${gridMeters} m</em></div><div class="value"><small>PV MAX</small><b>${max.hp}</b></div><div class="value"><small>PC MAX</small><b>${max.pc}</b></div></div>`}
function companionRank(){const path=(D.paths||[]).find(p=>/compagnon animal/i.test(p.name||''));return Math.max(1,...((path?.ranks||[]).filter(r=>r.owned).map(r=>Number(r.rank)||0)))}
function renderCompanion(){const el=$('#companion');if(!el||!hasAnimalCompanion)return;const rank=companionRank(),maxHp=Math.max(1,Number(D.level)||1)*(rank>=4?5:4),wolf=S.companion||{name:'Mon loup',hp:maxHp};S.companion=wolf;wolf.hp=clamp(wolf.hp,0,maxHp);el.innerHTML=`<div class="section-title">Compagnon animal</div><article class="card"><div class="row-between"><div><span class="tag">Loup · rang ${rank}</span><h2>${esc(wolf.name||'Mon loup')}</h2></div><span class="tag">Agit comme un combattant</span></div><label>Nom du loup<input id="companion-name" maxlength="80" value="${esc(wolf.name||'Mon loup')}"></label><div class="value-grid"><div class="value"><small>PV</small><b>${wolf.hp}/${maxHp}</b></div><div class="value"><small>DEF</small><b>${12+rank}</b></div><div class="value"><small>INIT</small><b>${esc(finalValue('init'))}</b></div><div class="value"><small>ATTAQUE</small><b>${esc(finalValue('magic'))}</b></div></div><div class="ability-actions"><button class="mini-button" data-companion-hp="-1">− 1 PV</button><button class="mini-button" data-companion-hp="1">+ 1 PV</button><button class="mini-button primary" data-companion-full="${maxHp}">Soigner complètement</button></div><p><b>Morsure : 1d4+2 DM.</b> ${rank>=2?'Travail d’équipe : dé bonus en attaque lorsque le loup et le rôdeur sont au contact.':''}</p><p>Le loup possède son propre tour dans le gestionnaire de combat. Ses valeurs évolueront avec les rangs de la Voie du compagnon animal.</p></article>`;}
function inventoryItemHtml(item){const charges=item.chargesMax>0?`<span class="tag">Charges ${item.charges}/${item.chargesMax}</span>`:'',media=item.mediaUrl?`<div class="wide media-preview"><button class="media-open" data-media="${esc(item.mediaUrl)}" data-media-title="${esc(item.name)}"><img src="${esc(item.mediaUrl)}" alt=""><span>Ouvrir en grand et zoomer</span></button></div>`:'',documentLink=item.documentUrl?`<div class="wide"><a class="mini-button primary document-link" href="${esc(item.documentUrl)}" target="_blank" rel="noopener">Lire le recueil →</a></div>`:'',recipientOptions=transferRecipients.map(p=>`<option value="${esc(p.id)}">${esc(p.display_name)}</option>`).join(''),transfer=recipientOptions&&item.quantity>0&&item.containerType!=='pollen-bag'?`<div class="inventory-transfer wide"><strong>Donner cet objet</strong><div><select data-transfer-recipient aria-label="Destinataire">${recipientOptions}</select><input data-transfer-quantity type="number" min="1" max="${item.quantity}" value="1" aria-label="Quantité"><button class="mini-button primary" data-transfer-item="${esc(item.id)}">Envoyer</button></div><small>L’objet sera retiré ici et ajouté immédiatement chez le destinataire.</small></div>`:'',inPollenBag=item.containerId==='zepheline-besace-pollen',containerAction=id==='zepheline'&&item.containerType!=='pollen-bag'?`<div class="wide"><button class="mini-button" data-container-item="${esc(item.id)}" data-container-target="${inPollenBag?'':'zepheline-besace-pollen'}">${inPollenBag?'Sortir de la Besace de pollen':'Ranger dans la Besace de pollen'}</button></div>`:'',profile=equipmentProfile(item),modes=item.equipment?.weapon?.modes||[],attackBonus=modes.length?Number(modes[0].attackBonus)||0:0,damageBonus=modes.length?Number(modes[0].damageBonus)||0:0;return`<details class="inventory-item" data-item="${esc(item.id)}"><summary><span><strong>${esc(item.name)}</strong><small>${esc(item.category)}${item.base?' · profil : '+esc(item.base):''}</small></span><span class="inventory-badges"><span class="tag">×${item.quantity}</span>${item.equipped?'<span class="tag equipped">Équipé</span>':''}${item.equipment?.slot?`<span class="tag">${esc(SLOT_LABELS[item.equipment.slot]||item.equipment.slot)}</span>`:''}${charges}${inPollenBag?'<span class="tag">Dans la besace</span>':''}</span></summary><div class="inventory-editor">${media}${documentLink}<label>Nom visible<input data-item-field="name" value="${esc(item.name)}"></label><label>Profil mécanique COF2<input data-item-field="base" value="${esc(item.base)}" placeholder="Ex. épée longue"></label><label>Catégorie<select data-item-field="category">${['Arme','Protection','Consommable','Équipement','Objet spécial','Document et indice'].map(x=>`<option ${x===item.category?'selected':''}>${x}</option>`).join('')}</select></label><label>Quantité<input data-item-field="quantity" type="number" min="0" value="${item.quantity}"></label><label class="wide">Profil d’équipement COF2<select data-equipment-profile>${Object.entries(EQUIPMENT_PROFILES).map(([key,p])=>`<option value="${key}" ${key===profile?'selected':''}>${esc(p.label)}</option>`).join('')}</select><small>Les protections modifient la DEF. Les armes équipées créent automatiquement leurs lignes de contact, distance ou lancer.</small></label><label>Bonus DEF supplémentaire<input data-gear-bonus="def" type="number" step="1" value="${Number(item.equipment?.bonuses?.def)||0}"></label>${modes.length?`<label>Bonus d’attaque de l’arme<input data-weapon-bonus="attackBonus" type="number" value="${attackBonus}"></label><label>Bonus de dégâts de l’arme<input data-weapon-bonus="damageBonus" type="number" value="${damageBonus}"></label>`:''}<label>Charges / munitions actuelles<input data-item-field="charges" type="number" min="0" value="${item.charges}"></label><label>Maximum<input data-item-field="chargesMax" type="number" min="0" value="${item.chargesMax}"></label><label class="wide">Effet, description ou précision<textarea data-item-field="notes" placeholder="Règle utile, dégâts, propriété, provenance…">${esc(item.notes)}</textarea></label>${transfer}${containerAction}<div class="inventory-actions wide"><button class="mini-button ${item.equipped?'':'primary'}" data-equip="${esc(item.id)}" ${item.quantity<=0?'disabled':''}>${item.equipped?'Ranger':'Équiper'}</button><button class="mini-button" data-item-qty="-1" data-item-id="${esc(item.id)}">− 1</button><button class="mini-button" data-item-qty="1" data-item-id="${esc(item.id)}">+ 1</button>${item.containerType==='pollen-bag'?'':`<button class="mini-button danger" data-delete-item="${esc(item.id)}">Supprimer</button>`}</div></div></details>`}
let bagQuery='',bagMode='all';
function legacyProtectionRepair(){const start=startingProtection(),now=protectionNow(),need=['armor','shield'].filter(k=>start[k]>now[k]);return need.length&&need.every(k=>S.inventory.some(x=>x.equipment?.slot===k&&x.quantity>0&&Number(x.equipment?.bonuses?.[k==='armor'?'armorDef':'shieldDef'])===start[k]));}
function restoreLegacyProtection(){const start=startingProtection();let changed=false;for(const slot of ['armor','shield']){const current=protectionNow()[slot];if(start[slot]<=current)continue;const key=slot==='armor'?'armorDef':'shieldDef';const candidate=S.inventory.find(x=>x.equipment?.slot===slot&&x.quantity>0&&Number(x.equipment?.bonuses?.[key])===start[slot]);if(!candidate)continue;S.inventory.filter(x=>x.equipment?.slot===slot).forEach(x=>x.equipped=false);candidate.equipped=true;changed=true;}if(changed){updateAfterAction();toast('Protections de départ activées. DEF recalculée.');}return changed;}
document.addEventListener('click',e=>{if(e.target.id!=='restore-legacy-protection')return;if(!confirm('Rééquiper les protections de départ ? Cela remplace uniquement l’armure et le bouclier actuellement équipés.'))return;restoreLegacyProtection();});
function renderBag(){const openIds=new Set([...document.querySelectorAll('#bag [data-item][open]')].map(x=>x.dataset.item));const equipped=S.inventory.filter(x=>x.equipped).length,total=S.inventory.reduce((sum,x)=>sum+x.quantity,0),m=S.money||{po:0,pa:S.silver||0,pc:0};$('#bag').innerHTML=`<div class="inventory-summary"><div><small>OBJETS</small><b>${total}</b></div><div><small>ÉQUIPÉS</small><b>${equipped}</b></div><div><small>MONNAIE</small><b>${m.po} po · ${m.pa} pa · ${m.pc} pc</b></div></div><div class="notice">${window.SOLO_HUB_MODE?"Campagne : enregistre dans le hub après modification.":"Sauvegarde personnelle. Synchronisée si ton coffre est relié."}</div><div class="notice"><b>DEF ${finalValue("def")}</b> · ${esc(defenseDetail())}</div>${boneArmorPanel()}<div class="section-title">Monnaie</div><div class="money-grid">${['po','pa','pc'].map(k=>`<label>${k.toUpperCase()}<input data-solo-money="${k}" type="number" min="0" value="${m[k]||0}"></label>`).join('')}</div><button id="solo-save-money" class="mini-button primary">Enregistrer la bourse</button><div class="money-grid">${["po","pa","pc"].map(k=>`<label>Variation ${k.toUpperCase()}<input data-money-delta="${k}" type="number" min="0" step="1" value="0"></label>`).join("")}</div><div class="ability-actions"><button class="mini-button primary" data-money-op="1">+ Recevoir</button><button class="mini-button" data-money-op="-1">− Dépenser</button></div><div class="inventory-heading"><div class="section-title">Mes objets</div><button class="mini-button primary" id="add-item">+ Objet libre</button></div>${legacyProtectionRepair()?'<div class="notice"><b>Ancienne fiche : protections de départ non équipées.</b> <button type="button" id="restore-legacy-protection" class="mini-button primary">Rééquiper les protections initiales</button></div>':''}${catalogItemHtml()}<p class="inventory-help">Quantités, charges, descriptions et profils d’équipement sont modifiables. Équiper une protection ajuste la DEF selon le moteur de la fiche.</p><div class="inventory-filter"><label>Rechercher<input id="bag-search" type="search" value="${esc(bagQuery)}" placeholder="Armure, bouclier, potion…"></label><label>Afficher<select id="bag-mode">${[["all","Tous"],["equipped","Équipés"],["stored","Dans le sac"]].map(([k,l])=>`<option value="${k}" ${bagMode===k?"selected":""}>${l}</option>`).join("")}</select></label></div><div class="inventory-list">${S.inventory.map(inventoryItemHtml).join('')||'<div class="empty">Inventaire vide. Ajoute un objet.</div>'}</div>`;for(const el of document.querySelectorAll("#bag [data-item]"))if(openIds.has(el.dataset.item))el.open=true;filterBag();}
function filterBag(){const q=slug(bagQuery);for(const el of document.querySelectorAll('#bag [data-item]')){const item=S.inventory.find(x=>x.id===el.dataset.item);el.hidden=!!item&&((bagMode==='equipped'&&!item.equipped)||(bagMode==='stored'&&item.equipped)||(q&&!slug([item.name,item.base,item.category].join(' ')).includes(q)));}}
let quickQuery='';function filterQuick(){for(const input of document.querySelectorAll('.quick-bonus-panel input[type=search]'))if(input.value!==quickQuery)input.value=quickQuery;for(const e of document.querySelectorAll('.quick-bonus-panel .quick-bonus-item'))e.hidden=!!quickQuery&&!slug(e.textContent).includes(slug(quickQuery));}
document.addEventListener('input',e=>{if(e.target.hasAttribute('data-catalog-search')){const q=slug(e.target.value);for(const item of e.target.closest('.basic-catalog').querySelectorAll('[data-catalog-item]'))item.hidden=!!q&&!slug(item.textContent).includes(q);}if(e.target.id==='bag-search'){bagQuery=e.target.value;filterBag();}if(e.target.hasAttribute('data-quick-bonus-search')){quickQuery=e.target.value;filterQuick();}});
document.addEventListener('change',e=>{if(e.target.id==='bag-mode'){bagMode=e.target.value;filterBag();}});
document.addEventListener('click',e=>{const op=e.target.closest('[data-money-op]');if(!op)return;const dir=Number(op.dataset.moneyOp),old=S.money||{po:0,pa:S.silver||0,pc:0},m={};for(const k of ['po','pa','pc']){const n=Number(document.querySelector('[data-money-delta="'+k+'"]').value);if(!Number.isSafeInteger(n)||n<0||!Number.isSafeInteger(Number(old[k]||0)+dir*n)||Number(old[k]||0)+dir*n<0){toast('Montant invalide ou solde insuffisant.');return;}m[k]=Number(old[k]||0)+dir*n;}S.money=m;S.silver=m.po*10+m.pa;save();renderBag();toast('Bourse mise à jour.');});
document.addEventListener('click',e=>{if(e.target.id!=='solo-save-money')return;const m={};for(const k of ['po','pa','pc']){const n=Number(document.querySelector('[data-solo-money="'+k+'"]').value);if(!Number.isSafeInteger(n)||n<0){toast('Montant invalide.');return}m[k]=n}S.money=m;S.silver=m.po*10+m.pa;save();renderBag();toast('Bourse enregistrée.')});

function renderRest(){$('#rest').innerHTML=`${healingTrancePanel()}${familiarPanel()}${boneArmorPanel()}${manaArmorPanel()}${mutationPanel()}${succubusPanel()}${psiShieldPanel()}${manaGuide(true)}<div class="section-title">Récupération et usages</div><div class="rest-grid"><article class="rest-card"><h3>Récupération rapide</h3><p>${D.warriorRules?.recoveryMinutes||30} minutes au calme : dépense 1 DR, lance physiquement ${esc(D.combat.recoveryDie)} et ajuste tes PV. <b>Aucun PM récupéré.</b></p><div class="ability-actions"><button class="mini-button primary" id="spend-dr" ${S.dr<1?'disabled':''}>Dépenser 1 DR</button></div></article><article class="rest-card"><h3>Fin du combat</h3><p>${S.chevalierDeferred?'Applique les '+esc(S.chevalierDeferred)+' DM reportés et réactive les usages par combat.':'Réactive les capacités limitées à une utilisation par combat.'}</p><div class="ability-actions"><button class="mini-button" data-reset="combat">Réinitialiser le combat</button></div></article><article class="rest-card"><h3>Récupération complète</h3><p>8 heures, au plus une fois par jour : remet ${max.pm>0?'les PM au maximum et ':''}réactive les capacités quotidiennes. Les PV et autres ressources restent ajustables manuellement.</p><div class="ability-actions"><button class="mini-button" data-reset="day">Valider les 8 heures</button></div></article></div><div class="section-title">Capacités suivies</div><div class="list">${ownedAbilities().filter(usage).map(a=>abilityHtml(a)).join('')||'<div class="empty">Aucune capacité à usage limité détectée sur cette fiche.</div>'}</div>`}
function renderNotes(){$('#notes').innerHTML=`<div class="section-title">Informations personnelles</div><div class="field-grid"><label>Joueur<input id="player" value="${esc(S.player)}"></label><label>Idéal héroïque<input id="ideal" value="${esc(S.ideal)}"></label><label>Travers<input id="flaw" value="${esc(S.flaw)}"></label></div><div class="section-title">Notes de partie</div><textarea id="notes-text" placeholder="Noms, indices, objectifs, effets temporaires…">${esc(S.notes)}</textarea>`}

document.addEventListener('click',event=>{const b=event.target.closest?.('[data-bone-action]');if(!b||!hasBoneArmor())return;const op=b.dataset.boneAction,a=boneArmorState(),next={crafted:a.crafted===true,worn:a.worn===true,maintainedDay:String(a.maintainedDay||'')};if(op==='newday'){if(!confirm('Le MJ a-t-il indiqué le début d’un nouveau jour dans l’histoire ?'))return;S.gameDay=Math.max(0,Math.floor(Number(S.gameDay)||0))+1;updateAfterAction();toast('Nouveau jour : entretien requis.');return;}if(op==='craft'){if(next.crafted)return;if(!confirm('Confirmer que le personnage dispose d’ossements et confectionne lui-même son armure ?'))return;next.crafted=true;next.worn=true;next.maintainedDay='';}else if(op==='maintain'){if(!next.crafted)return;if(!confirm('Le personnage a-t-il accompli les 10 minutes d’entretien magique aujourd’hui ?'))return;next.maintainedDay=boneArmorDay();}else if(op==='wear'){if(!next.crafted)return;if(!next.worn&&boneArmorPhysicalConflict()){if(!confirm('Remplacer l’armure actuellement équipée par l’armure d’os ?'))return;S.inventory.filter(x=>x.equipment?.slot==='armor').forEach(x=>x.equipped=false);}next.worn=!next.worn;}else if(op==='lose'){if(!next.crafted)return;if(!confirm('Confirmer la perte ou destruction de l’armure ? Le personnage devra en fabriquer une nouvelle.'))return;next.crafted=false;next.worn=false;next.maintainedDay='';}else return;S.boneArmor=next;updateAfterAction();toast(boneArmorActive()?'Armure d’os : DEF +'+boneArmorValue()+' appliqué.':'Armure d’os : aucun bonus actif.');});



document.addEventListener('click',event=>{const b=event.target.closest?.('[data-succubus-action]');if(!b||!succubusAbility())return;const op=b.dataset.succubusAction,st=succubusState(),cost=Number(succubusAbility().rank)||2;if(op==='cast'){if(st.active||S.pm<cost||rageActive()){toast('Lancement impossible : mana ou conditions insuffisants.');return;}S.pm-=cost;st.active=true;st.minutesRemaining=Math.max(1,Number(D.stats?.INT)||0);}else if(op==='heal'){if(!succubusActive())return;const raw=b.closest('.succubus-card')?.querySelector('[data-succubus-heal]')?.value,n=Number(raw);if(raw===''||!Number.isSafeInteger(n)||n<0||n>999){toast('Indique les PV effectivement perdus par la cible.');return;}S.hp=clamp(S.hp+n,0,max.hp);toast('Vol de vie : '+n+' PV perdus par la cible, soin appliqué sans dépasser le maximum.');}else if(op==='tick'){if(!st.active)return;const n=Number(b.closest('.succubus-card')?.querySelector('[data-succubus-minutes]')?.value);if(!Number.isSafeInteger(n)||n<1||n>10000){toast('Durée invalide.');return;}st.minutesRemaining=Math.max(0,st.minutesRemaining-n);if(st.minutesRemaining===0)st.active=false;}else if(op==='end'){st.active=false;st.minutesRemaining=0;}else return;S.succubusCharm=st;updateAfterAction();});
document.addEventListener('click',event=>{const b=event.target.closest?.('[data-mutation-action]');if(!b||!mutationAbility())return;const mode=b.dataset.mutationAction,st=mutationState(),cost=Number(mutationAbility().rank)||2;if(mode==='cast'){if(st.active||S.pm<cost){toast('Mana insuffisant ou mutation déjà active.');return;}const chosen=b.closest('.mutation-protectrice-card')?.querySelector('[data-mutation-choice]')?.value;if(!Object.hasOwn(MUTATION_EFFECTS,chosen)){toast('Sélectionne une mutation.');return;}S.pm-=cost;st.active=true;st.mode=chosen;st.minutesRemaining=Math.max(1,5+Number(D.stats?.CHA||0));}else if(mode==='tick'){if(!st.active)return;const n=Number(b.closest('.mutation-protectrice-card')?.querySelector('[data-mutation-minutes]')?.value);if(!Number.isSafeInteger(n)||n<1||n>10000){toast('Indique un nombre de minutes valide.');return;}st.minutesRemaining=Math.max(0,st.minutesRemaining-n);if(st.minutesRemaining===0)st.active=false;}else if(mode==='end'){st.active=false;st.minutesRemaining=0;}else return;S.mutationProtectrice=st;updateAfterAction();toast(mutationDefenseBonus()?'Mutation Cuirasse : DEF +'+mutationDefenseBonus()+'.':mutationActive()?'Mutation '+st.mode+' active.':'Mutation terminée.');});
document.addEventListener('click',event=>{const b=event.target.closest?.('[data-mana-armor]');if(!b)return;const a=manaArmorAbility();if(!a)return;const old=manaArmorState(),op=b.dataset.manaArmor,next={active:old.active===true,minutesRemaining:Math.max(0,Number(old.minutesRemaining)||0)};if(op==='cast'){const cost=Number(a.rank)||1;if(next.active||S.pm<cost){toast('Mana ou conditions insuffisants.');return;}if(boneArmorActive()||boneArmorPhysicalConflict()){toast('Retire l’armure portée avant de lancer Armure de mana.');return;}S.pm-=cost;next.active=true;next.minutesRemaining=manaArmorDuration();}else if(op==='tick'){if(!next.active)return;const input=b.closest('.mana-armor-card')?.querySelector('[data-mana-armor-minutes]'),minutes=Number(input?.value);if(!Number.isSafeInteger(minutes)||minutes<1||minutes>10000){toast('Indique un nombre valide de minutes.');return;}next.minutesRemaining=Math.max(0,next.minutesRemaining-minutes);if(next.minutesRemaining===0)next.active=false;}else if(op==='end'){next.active=false;next.minutesRemaining=0;}else return;S.manaArmor=next;updateAfterAction();toast(manaArmorActive()?'Armure de mana : DEF +'+manaArmorValue()+' active.':'Armure de mana : protection terminée ou suspendue.');});


document.addEventListener('click',e=>{const t=e.target.closest?.('[data-pacifism-offense],[data-pacifism-new]');if(!t||!hasPacifism())return;if(t.hasAttribute('data-pacifism-offense'))S.pacifismBroken=true;else{if(!confirm('Un nouveau combat a-t-il commencé ?'))return;S.pacifismBroken=false;}updateAfterAction();});
document.addEventListener('click',e=>{const t=e.target.closest?.('[data-cross-parry]');if(!t||!hasCrossParry())return;if(t.dataset.crossParry==='weapons'){if(S.dualWield||dualWeaponsEquipped()){S.dualWield=false;S.crossParryDouble=false;}else{if(!confirm('Confirmer que tu combats avec une arme dans chaque main ?'))return;S.dualWield=true;}}else if(t.dataset.crossParry==='double'&&(S.dualWield||dualWeaponsEquipped()))S.crossParryDouble=!S.crossParryDouble;updateAfterAction();});


document.addEventListener('click',e=>{const b=e.target.closest?.('[data-personal-familiar]');if(!b||!hasPersonalFamiliar())return;const old=familiarState(),next={present:old.present===true,visible:old.visible===true,awaitRest:old.awaitRest===true},mage=hasMageFamiliar(),op=b.dataset.personalFamiliar;if(op==='summon'){if(next.present||next.awaitRest||mage&&S.pm<2)return;if(mage)S.pm-=2;next.present=true;next.visible=true;}else if(op==='existing'){if(next.present||next.awaitRest||!confirm('Confirmer que ce familier était déjà présent avant l’ouverture de la fiche ?'))return;next.present=true;next.visible=true;}else if(op==='sight'){if(!next.present||next.awaitRest)return;next.visible=!next.visible;}else if(op==='recover24'){if(mage||!next.awaitRest||!confirm('Le MJ confirme-t-il 24 heures écoulées depuis la destruction ?'))return;next.awaitRest=false;next.present=false;next.visible=false;}else if(op==='lost'){if(!next.present)return;if(mage){const raw=b.closest('.personal-familiar-card')?.querySelector('[data-familiar-backlash]')?.value,n=Number(raw);if(!raw||!Number.isSafeInteger(n)||n<1||n>evolvingDie()){toast('Indique le résultat du contrecoup 1d4° PV avant de confirmer.');return;}if(!confirm('Le familier est détruit ? Contrecoup '+n+' PV et rappel impossible avant un repos complet.'))return;S.hp=Math.max(0,S.hp-n);}else if(!confirm('Le familier est détruit ? Il faudra attendre 24 h pour le reconvoquer.'))return;next.present=false;next.visible=false;next.awaitRest=true;}else return;S.familiarControl=next;updateAfterAction();});


document.addEventListener('click',e=>{const t=e.target.closest?.('[data-healing-trance-use]');if(!t||!hasHealingTrance())return;const card=t.closest('.healing-trance-card'),roll=card?.querySelector('[data-healing-trance-roll]')?.value,done=card?.querySelector('[data-healing-trance-ten]')?.checked,tr=healingTranceState(),n=healingTranceDice(),die=evolvingDie(),value=Number(roll);if(!done){toast('Termine les 10 minutes de méditation.');return;}if(tr.uses>=3||tr.needsRapid){toast('Transe indisponible : quota ou repos rapide.');return;}if(roll===''||!Number.isSafeInteger(value)||value<n||value>n*die){toast('Indique un total valable pour les '+n+'d'+die+'° lancés.');return;}const restored=Math.max(0,value+(Number(D.stats?.VOL)||0));S.hp=clamp(S.hp+restored,0,max.hp);S.healingTrance={day:boneArmorDay(),uses:tr.uses+1,needsRapid:true};updateAfterAction();toast('Transe : '+restored+' PV soignés (limité au maximum).');});

function renderAll(){renderResources();renderPlay();renderFight();renderAbilities();renderStats();renderCompanion();renderBag();renderRest();renderNotes();renderAtelier();renderShared()}
function updateAfterAction(){if(!rageActive())delete S.berserk;syncResourceDelta();save();renderResources();renderPlay();renderAbilities();renderStats();renderBag();renderRest();renderSessionInitiative();if(infoDialog.open)drawInfo()}
document.addEventListener('click',async event=>{const t=event.target.closest('[data-container-item]');if(!t||id!=='zepheline')return;const item=S.inventory.find(x=>x.id===t.dataset.containerItem);if(!item)return;item.containerId=t.dataset.containerTarget||'';item.equipped=false;save();renderBag();await apiItem(item);toast(item.containerId?'Objet miniaturisé et rangé dans la besace.':'Objet sorti de la besace et revenu à sa taille normale.')});
document.addEventListener('click',async event=>{const t=event.target.closest('button');if(!t||!hasAnimalCompanion)return;if(t.dataset.companionHp){const rank=companionRank(),maxHp=Math.max(1,Number(D.level)||1)*(rank>=4?5:4);S.companion.hp=clamp(Number(S.companion.hp)+Number(t.dataset.companionHp),0,maxHp);save();renderCompanion();await apiCompanion()}else if(t.dataset.companionFull){S.companion.hp=Number(t.dataset.companionFull)||S.companion.hp;save();renderCompanion();await apiCompanion()}});
document.addEventListener('click',async event=>{const t=event.target.closest('button');if(!t)return;if(t.dataset.catalogItem){const item=basicItem(t.dataset.catalogItem,'objet-'+(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16)).join('')));if(!item)return;S.inventory.unshift(item);bagQuery='';bagMode='all';save();renderAll();await apiItem(item,'POST');const details=document.querySelector('[data-item="'+item.id+'"]');if(details)details.open=true;toast(item.name+' ajouté au sac, non équipé.');return}if(t.id==='add-item'){const item=normalizeItem({id:'objet-'+(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16)).join('')),name:'Nouvel objet',category:'Équipement'},Date.now());S.inventory.unshift(item);save();renderBag();await apiItem(item,'POST');const details=document.querySelector(`[data-item="${item.id}"]`);if(details){details.open=true;details.querySelector('[data-item-field="name"]')?.select()}return}if(t.dataset.equip){const item=S.inventory.find(x=>x.id===t.dataset.equip);if(item){if(item.quantity<=0)return;withMechanicalProfile(item);const activating=!item.equipped,slot=item.equipment?.slot,changed=[];if(activating&&slot==='armor'&&(D.warriorRules||D.profile==='Guerrier')&&Number(item.equipment?.bonuses?.armorDef)>5&&!D.warriorRules?.plateMastery){toast('Armure trop lourde pour tes capacités de guerrier : choisis la maîtrise des plaques ou une armure autorisée.');return;}if(activating&&slot==='armor'&&(Number(item.equipment?.bonuses?.armorDef)||0)>5&&D.warriorRules&&!D.warriorRules.plateMastery){toast('Armure de plaques : choisis d’abord sa maîtrise avec Armure lourde.');return;}if(activating&&slot){S.inventory.forEach(x=>{if(x.id!==item.id&&x.equipped&&x.equipment?.slot===slot){x.equipped=false;changed.push(x)}})}item.equipped=activating;if(slot==='shield'&&!activating&&S.warrior){S.warrior.braced=false;S.warrior.absorbed=null;}if([item,...changed].some(x=>x.name===S.forgeBite&&!x.equipped))delete S.forgeBite;save();renderAll();for(const old of changed)await apiItem(old);await apiItem(item);toast(item.equipped?(changed.length?'Objet équipé ; ancien équipement rangé.':'Objet équipé et effets activés.'):'Objet rangé ; effets retirés.')}return}if(t.dataset.itemQty){const item=S.inventory.find(x=>x.id===t.dataset.itemId);if(item){item.quantity=Math.max(0,item.quantity+Number(t.dataset.itemQty));if(!item.quantity)item.equipped=false;save();renderAll();await apiItem(item)}return}if(t.dataset.deleteItem){const item=S.inventory.find(x=>x.id===t.dataset.deleteItem);if(item&&confirm(`Supprimer « ${item.name} » de l’inventaire ?`)){S.inventory=S.inventory.filter(x=>x.id!==item.id);save();renderAll();await apiItem(item,'DELETE');toast('Objet supprimé.')}return}if(t.dataset.media){openMedia(t.dataset.media,t.dataset.mediaTitle);return}});
document.addEventListener('change',async event=>{const field=event.target.dataset.itemField,profileKey=event.target.dataset.equipmentProfile!==undefined?event.target.value:'',weaponBonus=event.target.dataset.weaponBonus,gearBonus=event.target.dataset.gearBonus;if(!field&&!profileKey&&!weaponBonus&&!gearBonus)return;const holder=event.target.closest('[data-item]'),item=S.inventory.find(x=>x.id===holder?.dataset.item);if(!item)return;if(profileKey){const profile=EQUIPMENT_PROFILES[profileKey]||EQUIPMENT_PROFILES.none;item.equipment=JSON.parse(JSON.stringify(profile.equipment));if(profile.category)item.category=profile.category;if(profile.base)item.base=profile.base;item.manualNoProfile=profileKey==='none';if(profileKey==='none')item.equipped=false;else if(item.equipped&&item.equipment.slot)S.inventory.forEach(x=>{if(x!==item&&x.equipment?.slot===item.equipment.slot)x.equipped=false})}else if(gearBonus){const value=Number(event.target.value);if(!Number.isSafeInteger(value)){toast('Bonus invalide');return;}item.equipment={...item.equipment,bonuses:{...item.equipment?.bonuses,[gearBonus]:value}};}else if(weaponBonus){const value=Number(event.target.value)||0;(item.equipment?.weapon?.modes||[]).forEach(mode=>mode[weaponBonus]=value)}else{item[field]=['quantity','charges','chargesMax'].includes(field)?Math.max(0,Number(event.target.value)||0):event.target.value;if(field==='quantity'&&!item.quantity)item.equipped=false;if(field==='name'||field==='base')withMechanicalProfile(item);if(field==='chargesMax')item.charges=Math.min(item.charges,item.chargesMax);if(field==='charges')item.charges=item.chargesMax?Math.min(item.charges,item.chargesMax):item.charges}save();renderAll();await apiItem(item);toast(profileKey?'Profil d’équipement appliqué.':weaponBonus?'Bonus de l’arme appliqué.':'Objet mis à jour.');});
function openMedia(url,title){const modal=document.createElement('div');modal.className='media-modal';modal.innerHTML=`<header><b>${esc(title)}</b><button aria-label="Fermer">×</button></header><div class="media-stage"><img src="${esc(url)}" alt="${esc(title)}"></div><p>Pince avec deux doigts ou utilise la molette pour zoomer.</p>`;document.body.appendChild(modal);const img=modal.querySelector('img'),stage=modal.querySelector('.media-stage');let scale=1;stage.addEventListener('wheel',e=>{e.preventDefault();scale=clamp(scale+(e.deltaY<0?.2:-.2),1,5);img.style.transform=`scale(${scale})`},{passive:false});modal.querySelector('button').onclick=()=>modal.remove()}
let companionSaveTimer=null;document.addEventListener('input',event=>{if(event.target.id!=='companion-name'||!hasAnimalCompanion)return;S.companion.name=event.target.value.slice(0,80);save();clearTimeout(companionSaveTimer);companionSaveTimer=setTimeout(()=>apiCompanion(),500)});
document.addEventListener('click',async event=>{const t=event.target.closest('button');if(!t)return;if(t.dataset.warriorAction){resolveWarrior(t);return}if(t.dataset.warriorReset){Object.assign(S,WC.reset(S,t.dataset.warriorReset));updateAfterAction();return}if(t.dataset.forgesort){resolveForgesort(t);return}if(t.dataset.ensorceleur){resolveEnsorceleur(t);return}if(t.dataset.druideUse){resolveDruide(t);return}if(t.dataset.chevalierUse){resolveChevalier(t);return}if(t.dataset.bardeUse){resolveBarde(t);return}if(t.dataset.rageCommand){resolveRage(t);return}if(t.hasAttribute('data-war-cry-add')){
 t.closest('.ability').querySelector('[data-war-cry-targets]').insertAdjacentHTML('beforeend',warCryTargetHtml());
 return
}if(t.dataset.barbareCombat){resolveBarbareCombat(t);return}if(t.dataset.tourDeForce){
 const ability=ownedAbilities().find(a=>a.id===t.dataset.tourDeForce);
 if(!ability||!isTourDeForce(ability))return;
 const roll=Number(t.closest('.ability')?.querySelector('[data-tour-de-force-roll]')?.value);
 const die=evolvingDie();
 if(!Number.isInteger(roll)||roll<1||roll>die){toast('Entre le résultat du d'+die+' avant le test de FOR.');return}
 if(S.hp<=0){toast('Aucun PV disponible.');return}
 S.hp=Math.max(0,S.hp-roll);
 toast('Tour de force : −'+roll+' PV. Ajoute +10 au test de FOR.');
 updateAfterAction();return
}if(t.dataset.count){const k=t.dataset.count;S[k]=clamp(S[k]+Number(t.dataset.delta),0,max[k]);updateAfterAction();return}if(t.dataset.use){const a=ownedAbilities().find(x=>x.id===t.dataset.use);if(a&&priestAbilityStatus(a)?.active===false){toast(priestAbilityStatus(a).reason);return}if(rageActive()&&a?.name.includes('*')){toast('La rage interdit de lancer un sort.');return}const u=a&&usage(a),cost=a&&resourceCost(a);if(cost&&S[cost.kind]<cost.amount){toast('Ressource insuffisante : '+cost.label+'.');return}if(u&&(S.uses[usageKey(a)]||0)<u.max){S.uses[usageKey(a)]=(S.uses[usageKey(a)]||0)+1;if(cost)S[cost.kind]-=cost.amount;toast(a.name+' marqué comme utilisé.');updateAfterAction()}return}if(t.dataset.spend){const a=ownedAbilities().find(x=>x.id===t.dataset.spend);if(a&&priestAbilityStatus(a)?.active===false){toast(priestAbilityStatus(a).reason);return}if(rageActive()&&a?.name.includes('*')){toast('La rage interdit de lancer un sort.');return}const cost=a&&resourceCost(a);if(cost&&S[cost.kind]>=cost.amount){S[cost.kind]-=cost.amount;toast(cost.label+' dépensé pour '+a.name+'.');updateAfterAction()}else if(cost)toast('Ressource insuffisante : '+cost.label+'.');return}if(t.dataset.refund){const ability=ownedAbilities().find(a=>a.id===t.dataset.refund),useKey=ability?usageKey(ability):t.dataset.refund;S.uses[useKey]=Math.max(0,(S.uses[useKey]||0)-1);updateAfterAction();return}if(t.dataset.petoireFire||t.dataset.petoireLoad||t.dataset.petoireEmpty||t.dataset.petoireSet||t.dataset.petoireUntrack){if(!hasPetoire())return;S.ammo=S.ammo||{};if(t.dataset.petoireSet){const raw=$('#petoire-stock-value').value,value=Number(raw);if(raw===''||!Number.isInteger(value)||value<0||value>999){toast('Indique un stock entier entre 0 et 999.');return}S.ammo['petoire-stock']=value}else if(t.dataset.petoireUntrack){delete S.ammo['petoire-stock']}else if(t.dataset.petoireFire){const n=petoireStock();if(S.ammo['petoire-loaded']!==true||n===0){toast('Vérifie le chargement et les munitions.');return}S.ammo['petoire-loaded']=false;if(n!=null)S.ammo['petoire-stock']=n-1}else S.ammo['petoire-loaded']=!!t.dataset.petoireLoad;updateAfterAction();return}if(t.dataset.ammo){const a=(D.attacks||[]).find(x=>x.id===t.dataset.ammo),ammo=a&&(a.ammo||a.magazine),cap=Number(ammo?.capacity)||0;S.ammo[t.dataset.ammo]=clamp(S.ammo[t.dataset.ammo]??ammo?.current??cap,0,cap)+Number(t.dataset.ammoDelta);S.ammo[t.dataset.ammo]=clamp(S.ammo[t.dataset.ammo],0,cap);updateAfterAction();return}if(t.id==='condition-add'){
 const chosen=(t.closest('.condition-form')?.querySelector('select')?.value||''),value=effectiveCondition(chosen);
 if(value&&!S.conditions.includes(value)){
  S.conditions.push(value);
  if(value==='Inconscient'&&S.berserk){delete S.berserk;updateAfterAction();return}
  save();renderPlay();
  if(infoDialog.open&&uiTopic==='states')drawInfo();
  if(chosen!==value)toast('Tatouages : Étourdi devient Ralenti.');
 }
 return;
}if(t.dataset.removeCondition){S.conditions=S.conditions.filter(x=>x!==t.dataset.removeCondition);save();renderPlay();if(infoDialog.open&&uiTopic==='states')drawInfo();return}if(t.id==='spend-dr'&&S.dr>0){S.dr--;if(S.healingTrance)S.healingTrance.needsRapid=false;toast('Dé de récupération dépensé. Ajuste les PV après ton lancer.');updateAfterAction();return}if(t.dataset.reset==='round'){if(WC.inspect(D,S).hasWarrior)Object.assign(S,WC.reset(S,'round'));
  for(const a of ownedAbilities().filter(a=>roundUsage(a)&&!isReplacedFollowUpAttack(a)))S.uses[usageKey(a)]=0;
  toast('Usages du round réactivés.');
  updateAfterAction();
  return;
 }if(t.dataset.reset){if(WC.inspect(D,S).hasWarrior)Object.assign(S,WC.reset(S,t.dataset.reset));if(t.dataset.reset==='day'){delete S.succubusCharm;delete S.mutationProtectrice;if(S.healingTrance)S.healingTrance.needsRapid=false;S.gameDay=Math.max(0,Math.floor(Number(S.gameDay)||0))+1;delete S.manaArmor;if(hasMageFamiliar()&&S.familiarControl?.awaitRest){S.familiarControl.awaitRest=false;S.familiarControl.present=false;S.familiarControl.visible=false;}}if(t.dataset.reset==='combat'){S.pacifismBroken=false;S.crossParryDouble=false;}if(S.forgeRune)S.forgeRune.used=false;delete S.forgeHeat;if(t.dataset.reset==='day'){delete S.forgeBite;delete S.forgeTonic}delete S.ensorceleurImage;delete S.ensorceleurTension;delete S.ensorceleurSleep;delete S.ensorceleurSleepTargets;delete S.druideTerrain;delete S.druidePrison;delete S.druidePrisonTargets;delete S.druidePrisonFreed;if(t.dataset.reset==='day'){delete S.druideBerryTargets;delete S.druideBark;delete S.druideNightUsed}S.hp=Math.max(0,S.hp-(Number(S.chevalierDeferred)||0));delete S.chevalierDeferred;delete S.chevalierIntercept;delete S.chevalierBraced;delete S.feinte;if(t.dataset.reset==='day'){delete S.chantDesHeros;delete S.chantDeReconfort}delete S.warCryTargets;delete S.berserk;ownedAbilities().forEach(a=>{const u=usage(a);if(u&&(t.dataset.reset==='day'||u.scope==='combat'||u.scope==='round'))S.uses[usageKey(a)]=0});if(t.dataset.reset==='day')S.pm=max.pm;toast(t.dataset.reset==='day'?(max.pm>0?'Récupération complète : mana et capacités restaurés.':'Capacités quotidiennes réactivées.'):'Capacités de combat réactivées.');updateAfterAction()}});
document.addEventListener('input',event=>{const map={player:'player',ideal:'ideal',flaw:'flaw','notes-text':'notes'};if(map[event.target.id]){S[map[event.target.id]]=event.target.value;save()}});

let sharedResource=null,resourcePending=0,resourceChain=Promise.resolve(),sessionData=null,initializingResource=false;

new ResizeObserver(()=>parent.postMessage({type:'cof2-height',height:document.documentElement.scrollHeight},location.origin)).observe(document.body);
renderAll();
activatePage(location.hash.slice(1)||'play');
})();

