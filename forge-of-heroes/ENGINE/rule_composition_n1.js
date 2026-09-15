(()=>{'use strict';
const P=window.__FOH_PRODUCT__,E=window.__FOH_ENGINE__,KEY='foh-guiltanas-heroes-v1';
if(!P||!E)return;
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const write=x=>localStorage.setItem(KEY,JSON.stringify(x));
function canonicalStateFromDraft(draft){
  const current=P.getDraft();
  try{
    P.setDraft(draft);
    const result=E.computeCharacterN1(P.buildState());
    if((result.errors||[]).length||!result.sticky?.characterState)return null;
    return JSON.parse(JSON.stringify(result.sticky.characterState));
  }catch{return null}
  finally{P.setDraft(current)}
}
function repairHero(id){
  const all=read(),i=all.findIndex(x=>x.id===id);
  if(i<0)return false;
  const hero=all[i],schema=hero.characterState?.schemaVersion;
  if(schema==='foh-character-state-6')return true;
  if(!hero.draft)return false;
  const canonical=canonicalStateFromDraft(hero.draft);
  if(!canonical)return false;
  hero.characterState=canonical;
  hero.status='READY';
  all[i]=hero;write(all);return true;
}
function repairCurrent(){
  const d=P.getDraft(),all=read();
  const id=d.heroLibraryId||(all.length?all.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]?.id:'');
  if(id)repairHero(id);
}
document.addEventListener('click',event=>{
  const saved=event.target.closest?.('[data-hero-id]');
  const action=event.target.closest?.('[data-action="open"],[data-action="edit"],[data-action="resume"]');
  if(saved&&action)repairHero(saved.dataset.heroId);
  if(event.target.closest?.('#save-btn,[data-ux03-save],#reveal-save'))queueMicrotask(repairCurrent);
},true);
window.__FOH_SAVE_SCHEMA_PATCH__={version:'FIX84-save-schema',repairHero,repairCurrent};
})();
