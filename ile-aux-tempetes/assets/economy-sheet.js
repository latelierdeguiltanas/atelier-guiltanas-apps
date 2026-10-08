(()=>{'use strict';const A=window.NespressoEconomy;if(!A||typeof S==='undefined'||typeof DATA==='undefined')return;
let shared=null,reportTimer=null;const previousSave=save;
function sheetCopy(saved=false){A.report({saved,snapshot:{name:DATA.name,class:DATA.class,level:DATA.level,maxHP:DATA.maxHP,hp:S.hp,tempHP:S.tempHP,conditions:S.conditions,concentration:S.concentration,prepared:(S.prepared||[]).map(id=>DATA.spells.find(s=>s.id===id)?.name||id),resources:(DATA.resources||[]).map(r=>({label:r.label,max:r.max,used:Number(S.resources?.[r.id]||0)})),log:(S.log||[]).slice(-100)}});}
function scheduleCopy(){if(reportTimer)clearTimeout(reportTimer);reportTimer=setTimeout(()=>{reportTimer=null;sheetCopy(true);},1500);}
save=function(){if(shared){S.money=shared.money;S.inventory=shared.inventory;}const result=previousSave();scheduleCopy();return result;};
window.addEventListener('nespresso-economy',e=>{const p=e.detail;if(p.player_id!==DATA.id||!p.initialized)return;shared=p.state;S.money=shared.money;S.inventory=shared.inventory;previousSave();});
renderBag=function(){const host=document.getElementById('bag');host.innerHTML='<div id="nespresso-bag"></div>';NespressoInventory.mount(host.firstElementChild,{data:DATA});};
// Legacy inventory dialogs can also be reached through search. Route them to the shared sac.
invDialog=function(){nav('bag');};moneyDialog=function(){nav('bag');};
changeQty=removeItem=addItem=moneyChange=function(){nav('bag');};
if(document.getElementById('bag').classList.contains('active'))renderBag();
sheetCopy();
})();
