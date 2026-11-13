/* Accès aux échanges privés uniquement si la session de ce PJ est valide.
   Sur les appareils sans lien privé, ne pas envoyer les joueurs sur un écran
   d'authentification depuis une fiche par ailleurs publique et jouable. */
(async()=>{
 'use strict';
 const valid=['vax','hammerz','lelio','loris'];
 const id=new URLSearchParams(location.search).get('pj')||localStorage.getItem('iat_last_player')||'';
 if(!valid.includes(id))return;
 const token=localStorage.getItem('iat_player_handout_token_'+id);
 if(!token||!window.IAT_HANDOUTS)return;
 try{
   const r=await window.IAT_HANDOUTS.request('list',token,{query:{player:id}});
   if(!r||!Array.isArray(r.handouts))return;
 }catch{return;}
 const section=document.createElement('section');
 section.className='panel wide';
 const q=encodeURIComponent(id);
 section.innerHTML='<h2>Échanges et carnet de campagne</h2><p>Un message privé pour le MJ, un objet à lui confier, une information à partager avec le groupe.</p><div class="row"><a class="btn primary" href="../messages/?pj='+q+'">Messages privés avec le MJ</a><a class="btn" href="../informations/?pj='+q+'">Informations et carnet partagé</a></div>';
 (document.querySelector('section.grid')||document.querySelector('main')).appendChild(section);
})();