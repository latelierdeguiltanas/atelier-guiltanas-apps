/* Fiche Nespresso : gameplay disponible même sans accès privé.
   Les échanges inventaire/monnaie serveur exigent TOUJOURS un jeton joueur validé.
   Ne jamais remplacer le sac local par un écran d'authentification. */
(()=>{
 'use strict';
 const A=window.NespressoEconomy;
 if(!A||typeof S==='undefined'||typeof DATA==='undefined')return;
 const base={save,renderBag,invDialog,moneyDialog,changeQty,removeItem,addItem,moneyChange};
 let shared=null,reportTimer=null,bagMode='unknown',checking=false;
 const bag=document.getElementById('bag');

 function sheetCopy(saved=false){
   A.report({saved,snapshot:{name:DATA.name,class:DATA.class,level:DATA.level,
     maxHP:DATA.maxHP,hp:S.hp,tempHP:S.tempHP,conditions:S.conditions,
     concentration:S.concentration,
     prepared:(S.prepared||[]).map(id=>DATA.spells.find(s=>s.id===id)?.name||id),
     resources:(DATA.resources||[]).map(r=>({label:r.label,max:r.max,used:Number(S.resources?.[r.id]||0)})),
     log:(S.log||[]).slice(-100)}});
 }
 function scheduleCopy(){
   if(reportTimer)clearTimeout(reportTimer);
   reportTimer=setTimeout(()=>{reportTimer=null;sheetCopy(true);},1500);
 }
 save=function(){
   if(shared&&bagMode==='shared'){S.money=shared.money;S.inventory=shared.inventory;}
   const result=base.save();scheduleCopy();return result;
 };
 function showLocal(){
   base.renderBag();
   const label=document.createElement('div');
   label.className='tapnote';
   label.setAttribute('role','status');
   label.textContent='Sac local disponible : les objets et pièces sont conservés sur cet appareil. Les échanges avec la campagne restent désactivés hors connexion privée.';
   bag.prepend(label);
 }
 function showShared(){
   if(!window.NespressoInventory){showLocal();return;}
   bag.innerHTML='<div id="nespresso-bag"></div>';
   window.NespressoInventory.mount(bag.firstElementChild,{data:DATA});
 }
 function resolveAccess(){
   if(checking||bagMode==='shared'||!A.key()||bagMode==='local')return;
   checking=true;
   A.call('state').then(response=>{
     if(response?.access==='player'&&response.player?.player_id===DATA.id){
       bagMode='shared';
       // Le module synchronise un inventaire seulement après contrôle d'identité.
       A.mirror(response.player);
       if(bag.classList.contains('active'))renderBag();
     }else{bagMode='local';if(bag.classList.contains('active'))renderBag();}
   }).catch(error=>{
     // Une session absente, expirée ou un réseau hors ligne ne bloque jamais la fiche.
     bagMode='local';
     if(bag.classList.contains('active'))renderBag();
   }).finally(()=>{checking=false;});
 }
 window.addEventListener('nespresso-economy',event=>{
   const p=event.detail;
   if(p.player_id!==DATA.id||!p.initialized||!A.key())return;
   shared=p.state;S.money=shared.money;S.inventory=shared.inventory;
   bagMode='shared';base.save();
 });
 renderBag=function(){
   if(!A.key()){bagMode='local';shared=null;}
   if(bagMode==='shared')showShared();
   else{showLocal();resolveAccess();}
 };
 invDialog=function(...args){return bagMode==='shared'?nav('bag'):base.invDialog(...args);};
 moneyDialog=function(...args){return bagMode==='shared'?nav('bag'):base.moneyDialog(...args);};
 changeQty=function(...args){return bagMode==='shared'?nav('bag'):base.changeQty(...args);};
 removeItem=function(...args){return bagMode==='shared'?nav('bag'):base.removeItem(...args);};
 addItem=function(...args){return bagMode==='shared'?nav('bag'):base.addItem(...args);};
 moneyChange=function(...args){return bagMode==='shared'?nav('bag'):base.moneyChange(...args);};
 if(bag.classList.contains('active'))renderBag();
 sheetCopy();
})();