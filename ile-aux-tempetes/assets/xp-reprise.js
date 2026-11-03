/* Documented campaign checkpoint; no reconstructed XP formula or rule changes. */
(()=>{'use strict';const key='mj_xp_ghost_v18',marker='iat_xp_reprise_20261103';
let result='Progression locale conservée.';
try{const raw=localStorage.getItem(key),x=raw?JSON.parse(raw):null;
const blank=!x||(x.version===18&&x.xp===0&&!(x.history||[]).length&&!x.combat&&!(x.closedZones||[]).length&&!Object.keys(x.encounters||{}).length);
if(blank&&!localStorage.getItem(marker)){
 if(raw)localStorage.setItem('iat_xp_before_reprise_20261103',raw);
 const date='2026-09-22T09:22:55Z';
 localStorage.setItem(key,JSON.stringify({version:18,xp:41,level:1,threshold:300,closedZones:[],activeZone:null,history:[{id:'reprise-plage-20260922',kind:'reprise-documentee',order:1,date,zone:'Avant la première grande zone',zoneId:'prelude',encounter:'Les noyés de la plage — 4 zombies',encounterId:'marins',official:true,composition:[{id:'zombie',qty:4}],compositionText:'4 zombies réellement affrontés ; 41 XP/PJ annoncées en séance. XP du prologue non chiffrée dans les traces retrouvées.',referenceWeight:200,dynamicXp:41,before:0,after:41}],encounters:{marins:{status:'played',at:date,weight:200},prologue:{status:'played',at:'2026-09-04T12:33:57Z',xpUnverified:true}},combat:null,lastUndo:null,warning:'NORMALE',order:1}));
 localStorage.setItem(marker,'applied');result='Compteur vierge repris à 41 XP documentées par personnage.';
}else if(x&&(x.xp>0||(x.history||[]).length||x.combat)){localStorage.setItem(marker,'existing-preserved');}
}catch{result='Sauvegarde locale illisible : aucune modification automatique.';}
document.addEventListener('DOMContentLoaded',()=>{const note=document.createElement('section');note.className='card';note.id='ns-xp-reprise';note.innerHTML='<h3>Reprise de campagne — 5 novembre</h3><p></p><p>Dernière trace : quatre zombies vaincus sur la plage, +41 XP par personnage (22 septembre). Suite : route vers l’épave au nord. Le prologue des trois Traqueurs de failles est joué, mais son XP n’est pas chiffrée de manière fiable : 41 est la base documentée, pas un total exhaustif certifié.</p><p>À chaque victoire : « Terminer en victoire » calcule et inscrit le gain une seule fois. La clôture de zone reste manuelle. Le compteur est enregistré dans ce navigateur ; le partage de la frise ne synchronise pas les sauvegardes MJ entre appareils.</p>';note.querySelector('p').textContent=result;(document.getElementById('home')||document.querySelector('main')||document.body).prepend(note);});})();
