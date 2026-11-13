/* Fiche joueur — relie les armes et armures réellement équipées aux informations de combat.
   Sans modification silencieuse de l'inventaire et sans attribuer de maîtrise inconnue. */
(()=>{
'use strict';
const Rules=window.NespressoEquipmentRules;
if(!Rules||typeof DATA==='undefined'||typeof S==='undefined')return;
const escText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const baseWeapons=DATA.weapons.map(w=>({...w}));
const fmtBonus=n=>n>=0?'+'+n:String(n);
const report=()=>Rules.compute(DATA,S.inventory||[]);
function refreshWeapons(){
 const gear=report();
 DATA.weapons.splice(0,DATA.weapons.length,...baseWeapons.map(w=>({...w})));
 for(let i=0;i<gear.attacks.length;i++){
  const a=gear.attacks[i];if(a.unknown)continue;
  const existing=DATA.weapons.find(w=>Rules.norm(w.name)===Rules.norm(a.name));
  if(existing){
   existing.attack=a.attack;existing.damage=a.damage;
   if(a.versatile)existing.props=(existing.props||'')+' • dégâts à deux mains : '+a.versatile;
  }else{
   DATA.weapons.push({id:'equipped-'+i,name:a.name,attack:a.attack,damage:a.damage,
    type:'à confirmer (arme de l’inventaire)',range:a.kind==='ranged'?'Distance':'Mêlée • 1,5 m',
    props:'Équipement actuel • '+a.stat+(a.versatile?' • Deux mains : '+a.versatile:''),
    mastery:'',masteryText:'',unknown:false});
  }
 }
 return gear;
}
function summary(gear){
 const b=gear.bonuses;
 return '<div class="section ns-gear" style="border:1px solid #b9975d;border-radius:12px;padding:12px;margin:12px 0;background:#14232a">'+
 '<h2>🛡️ Équipement actuel • calcul D&D</h2>'+
 '<div class="stats"><div class="stat"><b>'+gear.ac+'</b><span>CA calculée</span></div>'+
 '<div class="stat"><b>'+fmtBonus(b.melee)+'</b><span>Mêlée FOR maîtrisée</span></div>'+
 '<div class="stat"><b>'+fmtBonus(b.finesse)+'</b><span>Finesse maîtrisée</span></div>'+
 '<div class="stat"><b>'+fmtBonus(b.ranged)+'</b><span>Distance DEX maîtrisée</span></div>'+
 '<div class="stat"><b>'+fmtBonus(b.magic)+'</b><span>Attaque magique</span></div>'+
 '<div class="stat"><b>'+b.dc+'</b><span>DD des sorts</span></div></div>'+
 '<p class="tapnote">'+escText(gear.formula)+'</p>'+
 (gear.attacks.length?'<h3>Armes déclarées équipées</h3><div class="list">'+gear.attacks.map(a=>
 '<div class="item"><strong>'+escText(a.name)+(a.unknown?'':' • '+fmtBonus(a.attack)+' pour toucher')+'</strong>'+
 '<small>'+(a.unknown?escText(a.note):escText(a.damage+' dégâts'+(a.versatile?' • deux mains : '+a.versatile:'')+(a.mastery?' • maîtrise '+a.mastery:'')))+'</small></div>').join('')+'</div>':
 '<p class="tapnote">Aucune arme encore déclarée équipée : les armes ci-dessous restent les références du PDF.</p>')+
 (gear.warnings.length?'<div class="tapnote" style="color:#f7c78c">'+gear.warnings.map(escText).join('<br>')+'</div>':'')+
 '<button class="btn" style="margin-top:8px" onclick="nav(\'bag\')">🎒 Équiper ou retirer dans mon sac</button></div>';
}
function augmentHome(){
 const host=document.getElementById('home');if(!host)return;
 const g=refreshWeapons();
 const first=host.querySelector('.stats .stat:first-child b');
 if(first)first.textContent=String(g.ac);
 host.insertAdjacentHTML('beforeend',summary(g));
}
function augmentCombat(){
 const host=document.getElementById('combat');if(!host)return;
 const g=refreshWeapons();
 host.insertAdjacentHTML('afterbegin',summary(g));
 if(DATA.id==='loris'){
  host.insertAdjacentHTML('afterbegin','<div class="section" style="border-left:4px solid #f1b05d;padding:9px"><strong>📜 Prométhée : Projectile magique NON connu sur le PDF niveau 2.</strong>'+
   '<div class="tapnote">Mains brûlantes : sauvegarde DEX DD 13, moitié des dégâts en cas de réussite. Explosion ensorcelée : attaque de sort +5 contre la CA, peut rater.</div></div>');
 }
}
function augmentBag(){
 const host=document.getElementById('bag');if(!host)return;
 const g=refreshWeapons();
 host.insertAdjacentHTML('afterbegin','<div class="section ns-gear" style="padding:9px;background:#14232a;border:1px solid #b9975d;border-radius:10px;margin:8px 0"><b>Équipement et combat</b>'+
 '<p>CA actuelle selon équipement déclaré : <b>'+g.ac+'</b>. '+escText(g.defenseConfirmed?'Armure/bouclier déclarés.':'Équipement défensif non confirmé : CA du PDF conservée.')+'</p>'+
 '<p class="tapnote">Ouvre un objet dans le sac partagé puis clique « Équiper/Déséquiper ». La fiche Combat met à jour les bonus et la CA. La préparation des armes en main reste soumise aux règles D&D 2024.</p></div>');
}
const oldHome=renderHome,oldCombat=renderCombat,oldBag=renderBag;
renderHome=function(){oldHome();augmentHome();};
renderCombat=function(){oldCombat();augmentCombat();};
renderBag=function(){oldBag();augmentBag();};
const oldExplain=explain;
explain=function(kind){
 if(kind!=='ac')return oldExplain(kind);
 const g=report();
 return openM('<h2>Classe d’armure actuelle : '+g.ac+'</h2><div class="learn">'+escText(g.formula)+'</div><div class="tapnote">Une seule armure et au maximum un bouclier. Une CA issue du PDF reste provisoire tant que les équipements défensifs ne sont pas déclarés.</div>');
};
window.NespressoGearSummary=()=>report();
window.addEventListener('nespresso-economy',e=>{
 if(e.detail?.player_id!==DATA.id||!e.detail.initialized)return;
 // economy-sheet a déjà récupéré le sac dans S. L'écran actif doit suivre.
 const page=document.querySelector('.page.active')?.id||'home';
 if(['home','combat','bag'].includes(page))render(page);
});
render();
setTimeout(()=>{try{save();}catch{}},200);
})();
