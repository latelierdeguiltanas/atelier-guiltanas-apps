/* XP D&D 2024 — 4 PJ, paliers 300 / 900. Entrées manuelles tracées sans effacer le journal. */
(()=>{
 'use strict';
 const KEY='mj_xp_ghost_v18',SENT='iat_xp_last_manual_20261113';
 const API=window.XP_GHOST_V18;
 if(!API)return;
 const xstate=()=>API.getState();
 const done=x=>(x.history||[]).some(h=>h.encounterId==='b1-pieuvre')||x.encounters?.['b1-pieuvre']?.status==='played';
 const clean=s=>String(s||'').replace(/[<>]/g,'').slice(0,150);
 function saveState(x,success){
   localStorage.setItem(KEY,JSON.stringify(x));
   localStorage.setItem(SENT,success);
   location.reload();
 }
 function canEdit(x){
   if(x.combat&&!x.combat.awarded&&!x.combat.abandoned)
     return alert('Un combat XP est encore ouvert : termine-le ou abandonne-le d’abord dans le gestionnaire.'),false;
   return true;
 }
 function align(){
   const x=xstate();
   if(!canEdit(x))return;
   if(x.xp>300)return alert('Le compteur contient déjà '+x.xp+' XP, soit plus que 300. Aucune réduction automatique.');
   if(x.xp===300&&(x.closedZones||[]).length) return alert('Le niveau 2 et les 300 XP sont déjà enregistrés.');
   if(!confirm('Recaler les 4 aventuriers à 300 XP, niveau 2, sans effacer les entrées du journal ?'))return;
   const before=x.xp;
   x.lastUndo=JSON.parse(JSON.stringify(x));
   x.xp=300;x.closedZones=['epave'];x.activeZone='poussemers';x.level=2;x.threshold=900;
   x.order=(x.order||0)+1;
   x.history=[...(x.history||[]),{id:'checkpoint-mj-manuel-'+Date.now(),kind:'jalon-confirme',order:x.order,date:new Date().toISOString(),zone:'Rose des Vents',zoneId:'epave',encounter:'Niveau 2 confirmé par le MJ',encounterId:'checkpoint-n2-manuel',official:false,composition:[],referenceWeight:0,dynamicXp:300-before,before,after:300}];
   saveState(x,'Checkpoint niveau 2 enregistré.');
 }
 function grant(total,what,key){
   const x=xstate();
   if(!canEdit(x))return;
   if(!Number.isSafeInteger(total)||total<1||total>4000)return alert('Le gain doit être un entier positif au maximum 4 000 XP par personnage.');
   if(x.xp<300)return alert('Le groupe est niveau 2 avec 300 XP. Utilise d’abord « Aligner à 300 XP ».');
   if(key==='b1-pieuvre'&&done(x))return alert('La pieuvre figure déjà dans l’historique. Aucun doublon autorisé.');
   const before=x.xp;
   if(!confirm('Attribuer +'+total+' XP à chacun des quatre aventuriers pour : '+what+' ?\n\n'+before+' → '+(before+total)+' XP par PJ'))return;
   x.lastUndo=JSON.parse(JSON.stringify(x));
   x.xp+=total;x.order=(x.order||0)+1;
   const sceneKey=key||'attribution-'+Date.now();
   x.history=[...(x.history||[]),{id:'h_manuel_'+Date.now(),kind:'xp-mj-confirmee',order:x.order,date:new Date().toISOString(),zone:'Grottes de Poussemer',zoneId:'poussemers',encounter:what,encounterId:sceneKey,official:key==='b1-pieuvre',composition:key==='b1-pieuvre'?[{id:'pieuvre-spores',qty:1}]:[],compositionText:what,referenceWeight:key==='b1-pieuvre'?200:0,dynamicXp:total,before,after:x.xp}];
   if(key)x.encounters={...(x.encounters||{}),[key]:{status:'played',at:new Date().toISOString(),weight:200}};
   saveState(x,'+'+total+' XP/PJ confirmés pour '+what+'.');
 }
 window.nespressoAwardOctopus=function(){
   if(!confirm('Ce gain de 50 XP par aventurier correspond à une PIEUVRE seule (FP 1, 200 XP / 4 PJ).\n\nSi deux striges étaient aussi présentes, utilise l’attribution manuelle du total de la rencontre.'))return;
   grant(50,'B1 — Pieuvre servante des spores seule','b1-pieuvre');
 };
 window.nespressoManualXP=function(){
   const amount=prompt('XP à accorder À CHAQUE PJ (entier positif) :','50');
   if(amount===null)return;
   const n=Number(amount);if(!Number.isSafeInteger(n)||n<=0||n>4000)return alert('Quantité invalide.');
   const description=prompt('Nom de la scène ou du combat :','Rencontre personnalisée');
   if(description===null)return;
   grant(n,clean(description)||'Attribution du MJ',null);
 };
 window.nespressoAlignXP=align;
 function box(){
   const x=xstate(),el=document.createElement('div');
   el.className='card';el.id='ns-checkpoint-guide';
   el.style.cssText='padding:9px;margin:6px 0;border-color:#b9975d';
   const first=x.xp<300?'<button onclick="nespressoAlignXP()">Aligner à 300 XP · niveau 2</button>':'';
   const already=done(x);
   el.innerHTML='<b>XP du groupe — 4 PJ</b><p class="mini">'+x.xp+' XP par aventurier · prochain seuil : 900 XP ('+Math.max(0,900-x.xp)+' à obtenir). <strong>Pollux ne compte pas comme un 5e PJ.</strong></p>'+
    '<div class="row">'+first+'<button '+(already?'disabled':'')+' onclick="nespressoAwardOctopus()">'+(already?'✓ Pieuvre déjà comptée':'Pieuvre seule : +50 XP/PJ')+'</button>'+
    '<button onclick="nespressoManualXP()">Autre gain XP…</button><button onclick="xpHistoryV18()">Historique</button></div>'+
    '<p class="mini">Calcul des combats : XP des monstres divisés par 4 PJ (sans bonus de difficulté). Attribution ponctuelle toujours confirmée. XP conservée sur ce navigateur MJ ; pas encore synchronisée entre appareils.</p>';
   return el;
 }
 function inject(){
   for(const id of ['home','combat']){
     const parent=document.getElementById(id);
     if(!parent||parent.querySelector('#ns-checkpoint-guide'))continue;
     const el=box();el.id='ns-checkpoint-guide-'+id;
     parent.insertBefore(el,parent.firstChild);
   }
   const notice=localStorage.getItem(SENT);
   if(notice){localStorage.removeItem(SENT);const note=document.createElement('div');note.className='card';note.textContent=notice;(document.getElementById('home')||document.body).prepend(note);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject,{once:true});else inject();
})();
