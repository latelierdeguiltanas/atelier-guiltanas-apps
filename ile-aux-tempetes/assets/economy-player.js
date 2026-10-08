(()=>{'use strict';const A=window.NespressoEconomy;if(!A?.id)return;
const link='../inventaire/?pj='+encodeURIComponent(A.id);
const nav=document.getElementById('navBag');if(nav)nav.href=link;
const panel=document.createElement('section');panel.className='panel wide';panel.innerHTML='<h2>Objets et monnaie partagés</h2><p id="nespresso-status">Connexion au sac…</p><a class="btn primary" href="'+link+'">Ouvrir mon sac · échanges et créations</a>';
(document.querySelector('section.grid')||document.querySelector('main')).appendChild(panel);
async function refresh(){try{const s=await A.call('state');A.mirror(s.player);const text=document.getElementById('nespresso-status');text.textContent=s.player.initialized?'Sac synchronisé · '+(s.events||[]).filter(x=>!x.seen_at).length+' nouvelles opérations.':'Première synchronisation : ouvre ton sac depuis ton téléphone de partie.';if(s.player.initialized){const money=document.getElementById('money');if(money)money.innerHTML=['PC','PA','PE','PO','PP'].map(k=>'<span class="coin"><b>'+Number(s.player.state.money[k]||0)+'</b> '+k+'</span>').join('');}}catch(e){document.getElementById('nespresso-status').textContent=e.message;}}
refresh();setInterval(refresh,15000);
const notes=document.getElementById('notes');let notesTimer=null;function reportNotes(){if(notes)A.report({notes:notes.value});}if(notes){reportNotes();notes.addEventListener('input',()=>{clearTimeout(notesTimer);notesTimer=setTimeout(reportNotes,1500);});}

})();
