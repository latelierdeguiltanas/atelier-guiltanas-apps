/* L'espace joueur ouvre toujours le sac de la fiche.
   Ne proposer la gestion partagée qu'après authentification effective du joueur. */
(()=>{
 'use strict';
 const A=window.NespressoEconomy;
 if(!A?.id)return;
 const id=A.id,local='../personnages/'+encodeURIComponent(id)+'/?tab=bag';
 const remote='../inventaire/?pj='+encodeURIComponent(id);
 const nav=document.getElementById('navBag');
 if(nav)nav.href=local;
 const panel=document.createElement('section');
 panel.className='panel wide';
 const status=document.createElement('p');
 status.id='nespresso-status';status.setAttribute('role','status');
 const action=document.createElement('a');
 action.className='btn primary';action.href=local;action.textContent='Ouvrir mon sac dans ma fiche';
 const detail=document.createElement('p');
 detail.textContent='Ton inventaire local reste utilisable, même sans connexion privée.';
 const h=document.createElement('h2');h.textContent='Mon sac et mes objets';
 panel.append(h,status,detail,action);
 (document.querySelector('section.grid')||document.querySelector('main')).appendChild(panel);
 const notes=document.getElementById('notes');
 let timer=null;
 function reportNotes(){if(notes)A.report({notes:notes.value});}
 if(notes){reportNotes();notes.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(reportNotes,1500);});}
 async function refresh(){
   if(!A.key()){
     if(nav)nav.href=local;
     action.href=local;action.textContent='Ouvrir mon sac dans ma fiche';
     status.textContent='Fiche et inventaire local disponibles.';
     detail.textContent='Les échanges d’objets entre joueurs ne sont activés que pour une session privée validée.';
     return;
   }
   try{
     const s=await A.call('state');
     if(s.access!=='player'||s.player?.player_id!==id)throw new Error('Accès individuel non confirmé');
     A.mirror(s.player);
     if(nav)nav.href=remote;
     action.href=remote;action.textContent='Ouvrir mon sac partagé';
     status.textContent=s.player.initialized?'Sac synchronisé':'Première synchronisation de ce sac';
     detail.textContent='Objets et monnaie partagés avec le MJ.';
     const money=document.getElementById('money');
     if(money&&s.player.initialized)money.innerHTML=['PC','PA','PE','PO','PP'].map(k=>'<span class="coin"><b>'+Number(s.player.state.money[k]||0)+'</b> '+k+'</span>').join('');
   }catch(e){
     if(nav)nav.href=local;
     action.href=local;action.textContent='Ouvrir mon sac dans ma fiche';
     status.textContent='Sac local disponible.';
     detail.textContent='La connexion au serveur est momentanément indisponible. Ton inventaire sur cet appareil reste accessible.';
   }
 }
 refresh();
 setInterval(()=>{if(!document.hidden)refresh()},15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();