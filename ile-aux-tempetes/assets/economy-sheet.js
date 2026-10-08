(()=>{'use strict';const A=window.NespressoEconomy;if(!A||typeof S==='undefined'||typeof DATA==='undefined')return;
let shared=null;const previousSave=save;
save=function(){if(shared){S.money=shared.money;S.inventory=shared.inventory;}return previousSave();};
window.addEventListener('nespresso-economy',e=>{const p=e.detail;if(p.player_id!==DATA.id||!p.initialized)return;shared=p.state;S.money=shared.money;S.inventory=shared.inventory;previousSave();});
renderBag=function(){const host=document.getElementById('bag');host.innerHTML='<div id="nespresso-bag"></div>';NespressoInventory.mount(host.firstElementChild,{data:DATA});};
// Legacy inventory dialogs can also be reached through search. Route them to the shared sac.
invDialog=function(){nav('bag');};moneyDialog=function(){nav('bag');};
changeQty=removeItem=addItem=moneyChange=function(){nav('bag');};
if(document.getElementById('bag').classList.contains('active'))renderBag();
})();
