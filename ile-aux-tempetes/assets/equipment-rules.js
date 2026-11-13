/* D&D 2024 — calculs d'équipement, sans écriture dans les inventaires. */
(function(root){'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9+ ]/g,' ').replace(/\s+/g,' ').trim();
const ARMOR=[
['cuir cloute',12,'light',99],['armure de cuir',11,'light',99],['armure matelassee',11,'light',99],
['armure de peau',12,'medium',2],['chemise de mailles',13,'medium',2],['armure d ecailles',14,'medium',2],
['cuirasse',14,'medium',2],['demi plate',15,'medium',2],['cotte de mailles',16,'heavy',0],
['broigne',14,'heavy',0],['clibanion',17,'heavy',0],['harnois',18,'heavy',0]];
const WEAPONS=[
['hache d armes','1d8','1d10','melee',false,false],['hache a deux mains','1d12',null,'melee',false,true],
['hachette','1d6',null,'melee',false,false],['epee a deux mains','2d6',null,'melee',false,true],
['epee longue','1d8','1d10','melee',false,false],['epee courte','1d6',null,'melee',true,false],
['cimeterre','1d6',null,'melee',true,false],['dague','1d4',null,'melee',true,false],
['faucille','1d4',null,'melee',false,false],['marteau leger','1d4',null,'melee',false,false],
['maillet','2d6',null,'melee',false,true],['masse','1d6',null,'melee',false,false],
['baton','1d6','1d8','melee',false,false],['javeline','1d6',null,'melee',false,false],
['lance','1d6','1d8','melee',false,false],['arc long','1d8',null,'ranged',false,true],
['arc court','1d6',null,'ranged',false,true],['arbalete legere','1d8',null,'ranged',false,true],
['gourdin','1d4',null,'melee',false,false]];
const INITIAL={hammerz:'cotte de mailles',lelio:'armure de cuir',vax:'cuir cloute'};
function classify(item){
 const name=norm(item?.name),cat=norm(item?.category);
 if(/bouclier/.test(name))return{kind:'shield'};
 for(const [key,base,category,maxDex] of ARMOR)if(name.includes(key))return{kind:'armor',base,category,maxDex};
 for(const [key,dice,versatile,range,finesse,twoHands] of WEAPONS)if(name.includes(key))return{kind:'weapon',dice,versatile,range,finesse,twoHands};
 if(/armure/.test(name)||/armure/.test(cat))return{kind:'unknownArmor'};
 if(/arme/.test(cat))return{kind:'unknownWeapon'};
 return{kind:'other'};
}
function magicBonus(item){return Number(String(item?.name||'').match(/\+([1-3])\b/)?.[1]||0);}
function compute(data,inventory=[]){
 const DEX=Number(data.abilities?.DEX?.[1]||0),STR=Number(data.abilities?.FOR?.[1]||0),prof=Number(data.prof||2);
 const worn=(Array.isArray(inventory)?inventory:[]).filter(x=>!!x.equipped&&Number(x.qty)>0);
 const arm=worn.filter(x=>classify(x).kind==='armor'),shields=worn.filter(x=>classify(x).kind==='shield');
 const shieldsAllowed=['vax','hammerz','lelio'].includes(data.id);
 const armorAllowed={vax:['light','medium'],hammerz:['light','medium','heavy'],lelio:['light','medium'],loris:[]}[data.id]||[];
 const warnings=[],defenseConfirmed=arm.length>0||shields.length>0;
 let ac=Number(data.ac)||10+DEX,formula='CA de référence du PDF (armure/bouclier à confirmer)';
 if(defenseConfirmed){
  const a=arm[0],t=a?classify(a):INITIAL[data.id]?classify({name:INITIAL[data.id]}):null;
  const base=t?t.base+Math.min(DEX,t.maxDex):10+DEX;
  const bonus=a?magicBonus(a):0,shieldBonus=shields.length&&shieldsAllowed?2+magicBonus(shields[0]):0;
  ac=base+bonus+shieldBonus;
  formula=(a?.name||'Armure de référence')+' : '+base+(bonus?' +'+bonus+' magique':'')+(shields.length?' +'+shieldBonus+' bouclier':'')+' = '+ac;
  if(t&&!armorAllowed.includes(t.category))warnings.push('Armure non maîtrisée : désavantage aux tests FOR/DEX et sorts impossibles.');
  if(shields.length&&!shieldsAllowed)warnings.push('Bouclier non maîtrisé : aucun bonus de CA.');
 }
 if(arm.length>1)warnings.push('Plusieurs armures marquées équipées : garde une seule armure.');
 if(shields.length>1)warnings.push('Plusieurs boucliers : un seul possible.');
 const weapons=worn.filter(x=>['weapon','unknownWeapon'].includes(classify(x).kind));
 const attacks=weapons.map(item=>{
  const spec=classify(item);
  if(spec.kind!=='weapon')return{name:item.name,unknown:true,note:'Arme inconnue : propriétés et dés à faire confirmer par le MJ.'};
  const stat=spec.range==='ranged'?'DEX':spec.finesse&&DEX>STR?'DEX':'FOR';
  const mod=stat==='DEX'?DEX:STR,b=magicBonus(item),attack=mod+prof+b;
  const notation=die=>die+(mod+b>0?' + '+(mod+b):mod+b<0?' - '+Math.abs(mod+b):'');
  const mastery=(data.weapons||[]).find(w=>norm(w.name)===norm(item.name))?.mastery||'';
  return{name:item.name,attack,damage:notation(spec.dice),versatile:spec.versatile?notation(spec.versatile):'',
   kind:spec.range,stat,mastery,twoHands:spec.twoHands,notes:'Bonus de maîtrise appliqué si le personnage maîtrise cette arme.'};
 });
 if(shields.length&&attacks.some(x=>x.twoHands))warnings.push('Impossible de manier une arme à deux mains et un bouclier en même temps.');
 if(!weapons.length)warnings.push('Aucune arme déclarée équipée ; les armes du PDF restent disponibles comme référence seulement.');
 return{ac,formula,defenseConfirmed,warnings,attacks,gear:worn.map(x=>x.name),
  bonuses:{melee:STR+prof,finesse:Math.max(STR,DEX)+prof,ranged:DEX+prof,magic:Number(data.spellAttack||0),dc:Number(data.spellDC||0)}};
}
root.NespressoEquipmentRules={norm,classify,compute,magicBonus};
})(typeof window!=='undefined'?window:globalThis);
