/* Table MJ Nespresso : compagnon Pollux + commandes de partage accessibles en permanence. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const config={id:'pollux-ally',name:'Pollux',ref:'hibours',faction:'ally',kind:'monster'};
 function polluxPresent(){return typeof fighters!=='undefined'&&Array.isArray(fighters)&&fighters.some(f=>f.id===config.id||f.name?.toLowerCase()==='pollux');}
 window.addPolluxMJ=function(){
   if(typeof fighters==='undefined'||typeof monster!=='function')return alert('Le gestionnaire de combat n’est pas encore disponible.');
   if(polluxPresent())return alert('Pollux est déjà présent dans ce combat.');
   const m=monster('hibours');
   if(!m)return alert('Bloc officiel de hibours introuvable dans le bestiaire.');
   const activeId=fighters[turn]?.id||null;
   fighters.push({...config,pv:m.pv,max:m.pv,ca:m.ca,init:m.init,conditions:[],pending:null,sharedBuffs:[]});
   sortInit(false);
   if(activeId){const index=fighters.findIndex(f=>f.id===activeId);if(index>=0)turn=index;}
   saveAll();renderFighters();
   if(typeof logEvent==='function')logEvent('Pollux ajouté comme allié permanent du groupe, contrôlé par le MJ.');
   if(typeof showPage==='function')showPage('combat');
   updateToolbar();
 };
 const STATS=[
   {name:'Hammerz',old:12,max:24,ca:18},
   {name:'Lelio',old:10,max:20,ca:14},
   {name:'Loris',old:8,max:16,ca:12},
   {name:'Vax',old:11,max:22,ca:15}
 ];
 function upgradePlayers(ask=false){
   if(typeof fighters==='undefined'||!Array.isArray(fighters))return;
   if(combatStarted){if(ask)alert('Un combat est actif : termine le combat avant de mettre les PV max des joueurs à jour.');return;}
   const matchName=(f,p)=>{const name=String(f.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return name.includes(p.name.toLowerCase())||(p.name==='Loris'&&name.includes('promethee'));};
   const pending=fighters.filter(f=>f.kind==='pj'&&STATS.some(p=>
     matchName(f,p)&&Number(f.max)===p.old));
   if(!pending.length){if(ask)alert('Les PJ présents ont déjà leurs maxima niveau 2, ou aucun ancien profil n’est détecté.');return;}
   if(ask&&!confirm('Mettre les PV maximum des '+pending.length+' PJ au niveau 2 ? Les blessures déjà subies seront conservées.'))return;
   for(const f of pending){
     const p=STATS.find(p=>matchName(f,p)&&Number(f.max)===p.old);
     if(!p)continue;
     if(f.pv>0)f.pv=Math.min(p.max,Number(f.pv)+(p.max-p.old));
     f.max=p.max;f.ca=p.ca;f.notes=String(f.notes||'').replace(/\b1\b/g,'2');
   }
   saveAll();renderFighters();
 }
 window.nespressoUpgradePlayers=()=>upgradePlayers(true);
 function makeButton(label,id,action,style){
   const b=document.createElement('button');
   b.id=id;b.type='button';b.textContent=label;
   if(style)b.className=style;
   b.onclick=action;
   return b;
 }
 function delegated(id){const b=$(id);if(b)b.click();else alert('Commande de partage indisponible. Ouvre le gestionnaire depuis la Table MJ.');}
 function make(){
   const combat=$('combat'),manager=$('fighters');if(!combat||!manager)return;
   if($('ns-compact-toolbar'))return;
   const bar=document.createElement('div');bar.id='ns-compact-toolbar';
   const left=document.createElement('div');left.style.cssText='display:flex;gap:5px;flex-wrap:wrap;align-items:center';
   left.append(
     makeButton('🦉 Ajouter Pollux','ns-quick-pollux',window.addPolluxMJ),
     makeButton('↻ PJ niveau 2','ns-quick-upgrade',window.nespressoUpgradePlayers),
     makeButton('▶ Tour suivant','ns-quick-next',()=>{if(typeof nextTurn==='function')nextTurn();}),
     makeButton('🎁 Packs','ns-quick-packs',()=>location.assign('../packs/'))
   );
   const right=document.createElement('div');right.style.cssText='display:flex;gap:5px;flex-wrap:wrap;align-items:center';
   right.append(
     makeButton('Connecter','ns-quick-connect',()=>delegated('ns-connect')),
     makeButton('📡 Partager la frise','ns-quick-share',()=>delegated('ns-share'),'primary'),
     makeButton('Masquer','ns-quick-stop',()=>delegated('ns-stop'))
   );
   const status=document.createElement('span');status.id='ns-compact-status';status.textContent='Combat local non partagé.';
   bar.append(left,right,status);
   combat.prepend(bar);
   const note=document.createElement('p');note.id='ns-pollux-help';
   note.textContent='Pollux : allié contrôlé par le MJ ; bloc officiel de hibours, FP 3. Non compté comme ennemi pour l’XP. Rééquilibre ses attaques si nécessaire.';
   bar.after(note);
   upgradePlayers(false);updateToolbar();
 }
 function updateToolbar(){
   const status=$('ns-compact-status');
   if(!status)return;
   const pollux=$('ns-quick-pollux');
   if(pollux){pollux.disabled=polluxPresent();pollux.textContent=polluxPresent()?'✓ Pollux présent':'🦉 Ajouter Pollux';}
   for(const [id,original] of [['ns-quick-share','ns-share'],['ns-quick-stop','ns-stop']]){
     const own=$(id),src=$(original);
     if(own)own.disabled=!src||src.disabled;
   }
   const source=$('ns-bridge-status');
   status.textContent=(source?.textContent||'Combat local non partagé.').slice(0,155);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',make,{once:true});
 else make();
 setInterval(()=>{if(!document.hidden)updateToolbar();},1500);
})();
