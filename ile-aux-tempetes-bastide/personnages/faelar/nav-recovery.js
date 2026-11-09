/* Faëlar — navigation de secours indépendante des ressources et synchronisations.
 * Les onglets restent utilisables même si une autre routine de la fiche échoue.
 */
(()=>{'use strict';
 const sections=new Set(['play','fight','abilities','stats','companion','bag','rest','notes','shared-contracts','shared-confidences','atelier']);
 function openPage(id,{updateUrl=false}={}){
  if(!sections.has(id))return false;
  const page=document.getElementById(id);
  if(!page?.classList?.contains('page')||page.hidden)return false;
  const tabs=document.querySelectorAll('.sheet-navigation [data-page]');
  const tab=Array.from(tabs).find(el=>el.dataset.page===id);
  if(!tab||tab.hidden)return false;
  document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el===page));
  tabs.forEach(el=>el.classList.toggle('active',el===tab));
  if(updateUrl&&history.replaceState)history.replaceState(null,'','#'+encodeURIComponent(id));
  window.setTimeout(()=>window.BastideReadingGuard?.flush?.(),0);
  return true;
 }
 document.addEventListener('click',event=>{
  const el=event.target?.closest?.('.sheet-navigation [data-page], [data-page-jump]');
  if(!el)return;
  const id=el.dataset.page||el.dataset.pageJump;
  if(openPage(id,{updateUrl:true})){
   event.preventDefault();
   // Do not stop propagation: allow the ordinary character-sheet router and
   // analytics to run normally when they are healthy.
  }
 },true);
 window.addEventListener('hashchange',()=>openPage(decodeURIComponent(location.hash.slice(1))));
 window.BastideFaelarNavigation={openPage};
})();