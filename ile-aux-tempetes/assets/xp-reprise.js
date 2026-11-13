/* Île aux Tempêtes — checkpoint validé par le MJ : 4 PJ niveau 2 / 300 XP chacun.
   Ne jamais remplacer un suivi de combat déjà réel. La pieuvre n'est PAS créditée
   automatiquement : bouton de confirmation distinct. */
(()=>{
'use strict';
const KEY='mj_xp_ghost_v18',MARK='iat_xp_lvl2_checkpoint_20261113',BACKUP='iat_xp_before_lvl2_20261113';
let result='Suivi XP existant conservé.';
try{
 const raw=localStorage.getItem(KEY);
 let previous=null;try{previous=raw?JSON.parse(raw):null;}catch{}
 const clean=previous&&previous.version===18;
 const old=clean?previous:{version:18,xp:0,level:1,threshold:300,closedZones:[],activeZone:null,history:[],encounters:{},combat:null,lastUndo:null,warning:'NORMALE',order:0};
 const fresh=!clean||(!old.xp&&!(old.history||[]).length&&!old.combat&&!(old.closedZones||[]).length);
 const oldGhost=old.xp===41 && (old.history||[]).length===1 && old.history[0]?.id==='reprise-plage-20260922' && !old.combat && !(old.closedZones||[]).length;
 if(!localStorage.getItem(MARK)&&(fresh||oldGhost)){
   if(raw&&!localStorage.getItem(BACKUP))localStorage.setItem(BACKUP,raw);
   const before=Number(old.xp)||0,after=300;
   const entry={id:'checkpoint-niveau-2-20261113',kind:'reprise-mj-confirmee',order:(old.order||0)+1,
    date:new Date().toISOString(),zone:'Chapitre 3 terminé — Rose des Vents',zoneId:'epave',
    encounter:'Point de reprise confirmé par le MJ : quatre PJ niveau 2',encounterId:'checkpoint-niveau-2',
    official:false,composition:[],referenceWeight:0,dynamicXp:after-before,before,after};
   const next={...old,version:18,xp:300,level:2,threshold:900,
     closedZones:['epave'],activeZone:'poussemers',
     history:[...(old.history||[]),entry],order:entry.order};
   localStorage.setItem(KEY,JSON.stringify(next));
   localStorage.setItem(MARK,'applied');
   result='Point de reprise MJ appliqué : niveau 2, 300/900 XP/PJ. Le combat de la pieuvre reste à confirmer.';
 }else if(old.xp>=300){result='Progression locale existante préservée : '+old.xp+' XP/PJ.';}
 else result='Historique personnalisé déjà présent : aucune correction automatique ; alignement manuel proposé.';
}catch(e){result='Suivi local XP : aucune modification automatique ('+(e?.message||'erreur')+').';}
window.IAT_XP_CHECKPOINT_MESSAGE=result;
})();