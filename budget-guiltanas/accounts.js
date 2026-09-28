"use strict";
function cloneJson(v){return JSON.parse(JSON.stringify(v))}
function emptyAccountData(id,name,bank){
  var k=monthKeyNow(),months={},m=makeMonth(k);
  m.budgets=[];m.charges=[];m.incomes=[];m.entries=[];
  months[k]=m;
  return{
    id:id,name:name,bank:bank,currentMonthKey:k,months:months,merchantRules:{},archiveMeta:null,
    accounting:{checkedThrough:null,lastSessionAt:null,source:"manual",anchorBalance:null,anchorDate:null,anchorSource:null}
  }
}
function accountLooksUntouched(acc){
  if(!acc||acc.archiveMeta)return false;
  var keys=Object.keys(acc.months||{});if(keys.length!==1)return false;
  var m=acc.months[keys[0]],names=(m.budgets||[]).map(function(b){return b.name}).join("|");
  var defaultNames="Courses|Divers / Joker|Enfants|Travaux|Notes de frais|Essence";
  return names===defaultNames&&(m.budgets||[]).every(function(b){return n(b.planned)===0})&&!(m.charges||[]).length&&!(m.incomes||[]).length&&!(m.entries||[]).length
}
function extractActiveAccount(st,id,name,bank){
  return{
    id:id,name:name,bank:bank,currentMonthKey:st.currentMonthKey||monthKeyNow(),
    months:st.months||{},merchantRules:st.merchantRules||{},archiveMeta:st.archiveMeta||null,
    accounting:ensureAccounting({months:st.months||{},accounting:st.accounting||null}).accounting
  }
}
function ensureMultiAccount(st){
  st=st||defaultState();
  if(!st.currentAccounts){
    st.currentAccounts={
      lcl:extractActiveAccount(st,"lcl","LCL","LCL"),
      credit_agricole:emptyAccountData("credit_agricole","Crédit Agricole","Crédit Agricole")
    };
    st.currentAccountId="lcl";
  }
  if(!st.currentAccounts.lcl)st.currentAccounts.lcl=emptyAccountData("lcl","LCL","LCL");
  if(!st.currentAccounts.credit_agricole)st.currentAccounts.credit_agricole=emptyAccountData("credit_agricole","Crédit Agricole","Crédit Agricole");
  else if(accountLooksUntouched(st.currentAccounts.credit_agricole))st.currentAccounts.credit_agricole=emptyAccountData("credit_agricole","Crédit Agricole","Crédit Agricole");
  if(!st.currentAccountId||!st.currentAccounts[st.currentAccountId])st.currentAccountId="lcl";
  if(!Array.isArray(st.savings))st.savings=[];
  st.version=3;
  applyActiveAccount(st,st.currentAccountId);
  return st
}
function snapshotActiveAccount(st){
  if(!st||!st.currentAccounts)return;
  var id=st.currentAccountId||"lcl",acc=st.currentAccounts[id]||emptyAccountData(id,id,id);
  acc.currentMonthKey=st.currentMonthKey;
  acc.months=st.months;
  acc.merchantRules=st.merchantRules||{};
  acc.archiveMeta=st.archiveMeta||null;
  acc.accounting=st.accounting||{};
  st.currentAccounts[id]=acc
}
function applyActiveAccount(st,id){
  if(!st||!st.currentAccounts||!st.currentAccounts[id])return;
  var acc=st.currentAccounts[id];
  st.currentAccountId=id;
  st.currentMonthKey=acc.currentMonthKey||monthKeyNow();
  st.months=acc.months||{};
  if(!st.months[st.currentMonthKey]){var ks=Object.keys(st.months).sort();if(ks.length)st.currentMonthKey=ks[ks.length-1];else{st.months[st.currentMonthKey]=makeMonth(st.currentMonthKey)}}
  st.merchantRules=acc.merchantRules||{};
  st.archiveMeta=acc.archiveMeta||null;
  st.accounting=ensureAccounting({months:st.months,accounting:acc.accounting||null}).accounting
}
function activeCurrentAccount(){return state&&state.currentAccounts?state.currentAccounts[state.currentAccountId]:null}
function activeCurrentAccountName(){var a=activeCurrentAccount();return a?a.name:"Compte courant"}
function activeCurrentBank(){var a=activeCurrentAccount();return a?a.bank:"Banque"}
function switchCurrentAccount(id){
  if(!state.currentAccounts||!state.currentAccounts[id]||id===state.currentAccountId)return;
  snapshotActiveAccount(state);applyActiveAccount(state,id);
  localStorage.setItem(KEY,JSON.stringify(state));lastBankCheck=null;render()
}
function renderAccountUI(){
  if(!$("accountSwitcher"))return;
  document.querySelectorAll("[data-account]").forEach(function(b){b.classList.toggle("active",b.dataset.account===state.currentAccountId)});
  var name=activeCurrentAccountName();
  if($("activeAccountLabel"))$("activeAccountLabel").textContent=name;
  if($("bankLabel"))$("bankLabel").textContent="Dernier solde "+name+" vérifié";
  if($("bankCheckTitle"))$("bankCheckTitle").textContent="Contrôler le solde "+name;
  if($("bankCheckRealLabel"))$("bankCheckRealLabel").textContent="Solde réel "+name;if($("bankCheckActualLabel"))$("bankCheckActualLabel").textContent="Solde "+name;
  if($("bankCheckIntro"))$("bankCheckIntro").textContent="Saisis le solde affiché sur "+name+" à une date donnée. L'application reconstruit son propre solde depuis le dernier point vérifié et cherche des pistes si les deux ne correspondent pas.";
  if($("importAccountName"))$("importAccountName").textContent=name
}
function savingsTotal(){return (state.savings||[]).reduce(function(s,x){return s+n(x.balance)},0)}
function savingsByBank(bank){return(state.savings||[]).filter(function(x){return x.bank===bank})}
function renderSavings(){
  if(!$("savingsList"))return;
  $("savingsTotal").textContent=euro.format(savingsTotal());
  var root=$("savingsList"),items=state.savings||[];root.innerHTML="";
  if(!items.length){root.innerHTML="<div class='empty'>Aucune épargne renseignée. Ajoute par exemple Vacances, Coup dur ou les comptes des enfants.</div>";return}
  ["LCL","Crédit Agricole","Autre"].forEach(function(bank){
    var list=savingsByBank(bank);if(!list.length)return;
    var section=document.createElement("section");section.className="savingsBank";
    section.innerHTML="<div class='savingsBankHead'><strong>"+esc(bank)+"</strong><span>"+euro.format(list.reduce(function(s,x){return s+n(x.balance)},0))+"</span></div>";
    list.forEach(function(x){
      var target=n(x.target),pct=target>0?Math.min(100,Math.max(0,n(x.balance)/target*100)):0,article=document.createElement("button");
      article.type="button";article.className="savingItem";article.dataset.saving=x.id;
      article.innerHTML="<div><p><strong>"+esc(x.name)+"</strong></p><small>"+(x.purpose?esc(x.purpose):"Épargne")+(target>0?" · objectif "+euro.format(target):"")+"</small>"+(target>0?"<div class='savingProgress'><span style='width:"+pct+"%'></span></div>":"")+"</div><b>"+euro.format(n(x.balance))+"</b>";
      section.appendChild(article)
    });
    root.appendChild(section)
  });
  root.querySelectorAll("[data-saving]").forEach(function(btn){btn.onclick=function(){openSavingDialog(btn.dataset.saving)}})
}
var editSavingId=null;
function openSavingDialog(id){
  editSavingId=id||null;var item=id?(state.savings||[]).find(function(x){return x.id===id}):null;
  $("savingDialogTitle").textContent=item?"Modifier l'épargne":"Ajouter une épargne";
  $("savingName").value=item?item.name:"";$("savingBank").value=item?item.bank:"LCL";$("savingPurpose").value=item&&item.purpose?item.purpose:"";
  $("savingBalance").value=item?n(item.balance):"";$("savingTarget").value=item&&n(item.target)?n(item.target):"";
  $("deleteSavingBtn").classList.toggle("hidden",!item);$("savingDialog").showModal()
}
function saveSaving(){
  var name=$("savingName").value.trim(),bank=$("savingBank").value,purpose=$("savingPurpose").value.trim(),balance=money($("savingBalance").value),target=money($("savingTarget").value);
  if(!name||balance===null)return;
  var item=editSavingId?(state.savings||[]).find(function(x){return x.id===editSavingId}):null;
  if(item){item.name=name;item.bank=bank;item.purpose=purpose;item.balance=balance;item.target=target||0;item.updatedAt=new Date().toISOString()}
  else state.savings.push({id:uid(),name:name,bank:bank,purpose:purpose,balance:balance,target:target||0,updatedAt:new Date().toISOString()});
  editSavingId=null;save();$("savingDialog").close();renderSavings()
}
function deleteSaving(){
  if(!editSavingId)return;var item=(state.savings||[]).find(function(x){return x.id===editSavingId});if(!item)return;
  if(!confirm("Supprimer l'épargne « "+item.name+" » ?"))return;
  state.savings=state.savings.filter(function(x){return x.id!==editSavingId});editSavingId=null;save();$("savingDialog").close();renderSavings()
}
