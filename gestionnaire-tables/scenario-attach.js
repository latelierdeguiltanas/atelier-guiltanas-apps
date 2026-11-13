/* Relier un pack déjà importé à une table MJ existante.
   Aucune modification du hub Bastide : copie uniquement dans le workspace du compte connecté. */
(function(){
'use strict';
const A=window.TableManagerAPI,D=window.TableDomain;
const bridge=window.TableIntegration;
if(!A||!D||!bridge)return;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const resources=s=>['shop','scenarioItems','maps','encounters'].reduce((n,k)=>n+(Array.isArray(s?.assets?.[k])?s.assets[k].length:0),0);
function potentialMatches(db){
 const packages=(db.scenarios||[]).filter(sc=>/île aux tempêtes/i.test(sc.name||'')&&resources(sc)>0);
 return (db.tables||[]).flatMap(t=>{
  if(!t.scenario||resources(t.scenario)>0||t.scenario.modules?.some(m=>m.scenes?.length))return [];
  return packages.filter(sc=>sc.system===t.system||!sc.system).map(sc=>({table:t,scenario:sc}));
 });
}
function render(ctx){
 if(ctx.view!=='home'||!window.MJAccount?.active?.())return;
 const list=potentialMatches(ctx.db);if(!list.length)return;
 const hero=document.querySelector('#app .hero');if(!hero)return;
 const panel=document.createElement('section');
 panel.className='panel';
 panel.id='mj-scenario-attach';
 panel.innerHTML='<div class="eyebrow">DERNIÈRE ÉTAPE DE L’IMPORT</div>'+
 '<h2>Relier ton scénario importé à ta table</h2>'+
 '<p>Ton pack « L’Île aux Tempêtes » est bien importé, mais une table existante utilise encore son scénario vierge. Tu peux lui associer la copie complète sans recréer les PJ et sans toucher au hub Bastide.</p>'+
 '<div class="grid">'+list.map(({table,scenario})=>'<article class="card"><h3>'+esc(table.name)+'</h3>'+
 '<p>Scénario actuel : '+esc(table.scenario.name)+'</p><p>Pack à associer : '+esc(scenario.name)+' · '+resources(scenario)+' ressources</p>'+
 '<button type="button" class="button primary" data-attach-table="'+esc(table.id)+'" data-attach-scenario="'+esc(scenario.id)+'">Associer le scénario à cette table</button></article>').join('')+'</div>'+
 '<p class="note">Cela remplace uniquement la copie locale du scénario de cette table et réinitialise ses scènes jouées. Les PJ et les séances restent inchangés.</p>';
 hero.after(panel);
}
const previous=bridge.decorate;
bridge.decorate=function(ctx){previous?.(ctx);render(ctx)};
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-attach-table][data-attach-scenario]');if(!b)return;
 const db=A.getDb(),table=db.tables.find(x=>x.id===b.dataset.attachTable),scenario=db.scenarios.find(x=>x.id===b.dataset.attachScenario);
 if(!table||!scenario)return A.notify('Table ou scénario introuvable.');
 if(resources(table.scenario)>0)return A.notify('Cette table possède déjà des ressources : utilise « Choisir un autre scénario » pour les remplacer.');
 if(!confirm('Associer « '+scenario.name+' » à la table « '+table.name+' » ?\n\nLes personnages et séances de cette table seront conservés. Les scènes jouées seront remises à zéro. Le hub Bastide ne sera pas modifié.'))return;
 table.scenario=D.normalizedScenario(scenario);
 table.completedScenes=[];
 table.tools=D.normalizeTools({...table.tools,scenario:true,shop:!!table.scenario.assets?.shop?.length},table.system);
 A.save();A.openTable(table.id,'scenario');
 A.notify('Le vrai pack « L’Île aux Tempêtes » est maintenant associé à ta table.');
});
})();