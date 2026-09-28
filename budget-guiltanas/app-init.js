"use strict";
var state=load();initSync();
$("expenseBtn").onclick=function(){openEntry("expense")};$("incomeBtn").onclick=function(){openEntry("income")};$("settingsBtn").onclick=openSettings;$("reconcileBtn").onclick=openSettings;$("goPlanBtn").onclick=function(){switchView("plan")};$("goChargesBtn").onclick=function(){planTab="charges";document.querySelectorAll(".tab").forEach(function(x){x.classList.toggle("active",x.dataset.plan==="charges")});switchView("plan")};
$("prevMonthBtn").onclick=function(){stepMonth(-1)};
$("nextMonthBtn").onclick=function(){stepMonth(1)};
$("quickMonthSelect").onchange=function(){switchMonth(this.value)};
$("label").addEventListener("input",function(){if(mode==="expense")$("category").value=suggest(this.value,currentMonth())});
$("entryForm").onsubmit=function(e){e.preventDefault();var m=currentMonth(),a=money($("amount").value),l=$("label").value.trim();if(!a||!l)return;var cat=mode==="expense"?$("category").value:null,uses=mode==="expense"?$("reserved").checked:false;m.entries.push({id:uid(),type:mode,amount:a,label:l,categoryId:uses?cat:null,usesBudget:uses,actual:true,reconciled:false,createdAt:new Date().toISOString()});if(mode==="expense"&&cat)state.merchantRules[l.toLowerCase()]=cat;if(mode==="income")m.incomes.push({id:uid(),name:l,amount:a,received:true,oneOff:true});save();$("entryDialog").close();render()};
$("settingsForm").onsubmit=function(e){e.preventDefault();var chosen=$("setMonth").value;if(chosen==="__new__"){var cur=state.currentMonthKey,p=cur.split("-"),d=new Date(Number(p[0]),Number(p[1]),1),k=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");if(!state.months[k]){var prev=currentMonth(),nm=makeMonth(k);nm.base=totals(prev).planForecast;nm.budgets=prev.budgets.map(function(b){return{id:uid(),name:b.name,planned:n(b.planned)}});nm.charges=prev.charges.map(function(c){return{id:uid(),name:c.name,group:c.group,amount:n(c.amount),paid:false}});nm.incomes=prev.incomes.filter(function(i){return !i.oneOff}).map(function(i){return{id:uid(),name:i.name,amount:n(i.amount),received:false}});state.months[k]=nm}chosen=k}state.currentMonthKey=chosen;var m=currentMonth();m.base=money($("setBase").value)||0;var newBank=money($("setBank").value);if(newBank!==null){m.bankBalance=newBank;m.entries.forEach(function(x){if(entryActual(x))x.reconciled=true})}save();$("settingsDialog").close();render()};
$("resetBtn").onclick=function(){if(confirm("Effacer uniquement les données locales de ce gestionnaire ?")){localStorage.removeItem(KEY);state=defaultState();$("settingsDialog").close();render()}};
document.querySelectorAll(".close").forEach(function(b){b.onclick=function(){b.closest("dialog").close()}});
document.querySelectorAll("footer [data-view]").forEach(function(b){b.onclick=function(){switchView(b.dataset.view)}});
document.querySelectorAll(".tab").forEach(function(b){b.onclick=function(){planTab=b.dataset.plan;document.querySelectorAll(".tab").forEach(function(x){x.classList.toggle("active",x===b)});renderPlan()}});
$("addPlanItemBtn").onclick=openPlanDialog;
$("chargeForm").onsubmit=function(e){e.preventDefault();confirmChargePaid()};
$("chargeRevertBtn").onclick=revertCharge;
$("planForm").onsubmit=function(e){e.preventDefault();var m=currentMonth(),name=$("planName").value.trim(),amount=money($("planAmount").value)||0,arr=planTab==="charges"?m.charges:planTab==="incomes"?m.incomes:m.budgets;if(!name)return;var item=editPlanId?arr.find(function(x){return x.id===editPlanId}):null;if(item){item.name=name;if(planTab==="charges"){item.group=$("planGroup").value.trim()||"Autres";item.amount=amount;var linked=m.entries.find(function(e){return e.fixedChargeId===item.id});if(linked){linked.label=name;linked.amount=amount}}else if(planTab==="incomes"){item.amount=amount;var linkedIncome=m.entries.find(function(e){return e.incomeId===item.id});if(linkedIncome){linkedIncome.label=name;linkedIncome.amount=amount}}else item.planned=amount}else{if(planTab==="charges")arr.push({id:uid(),name:name,group:$("planGroup").value.trim()||"Autres",amount:amount,paid:false,paidAt:null});else if(planTab==="incomes")arr.push({id:uid(),name:name,amount:amount,received:false});else arr.push({id:uid(),name:name,planned:amount})}editPlanId=null;save();$("planDialog").close();render()};
$("deletePlanBtn").onclick=function(){if(!editPlanId)return;var m=currentMonth(),arr=planTab==="charges"?m.charges:planTab==="incomes"?m.incomes:m.budgets,item=arr.find(function(x){return x.id===editPlanId});if(!item||!confirm("Supprimer « "+item.name+" » du plan du mois ?"))return;if(planTab==="charges"){m.entries=m.entries.filter(function(e){return e.fixedChargeId!==editPlanId});m.charges=m.charges.filter(function(x){return x.id!==editPlanId})}else if(planTab==="incomes"){m.entries=m.entries.filter(function(e){return e.incomeId!==editPlanId});m.incomes=m.incomes.filter(function(x){return x.id!==editPlanId})}else{m.entries.forEach(function(e){if(e.categoryId===editPlanId){e.categoryId=null;e.usesBudget=false}});m.budgets=m.budgets.filter(function(x){return x.id!==editPlanId})};editPlanId=null;save();$("planDialog").close();render()};
async function fileLooksLikeExcel(file){
  var name=String(file&&file.name||"").toLowerCase(),type=String(file&&file.type||"").toLowerCase();
  if(name.indexOf(".xlsx")!==-1||name.indexOf(".xls")!==-1||type.indexOf("spreadsheet")!==-1||type.indexOf("excel")!==-1)return true;
  try{
    var head=new Uint8Array(await file.slice(0,8).arrayBuffer());
    var zip=head[0]===0x50&&head[1]===0x4b;
    var ole=head[0]===0xd0&&head[1]===0xcf&&head[2]===0x11&&head[3]===0xe0;
    return zip||ole
  }catch(e){return false}
}
$("importFile").onchange=async function(){
  var file=this.files&&this.files[0];if(!file)return;
  try{
    if($("importSummary"))$("importSummary").textContent="Lecture de "+file.name+"…";
    if(await fileLooksLikeExcel(file)){
      var payload=await parseExcelFile(file);
      importExcel(payload)
    }else{
      var p=JSON.parse(await file.text());
      importBackup(p)
    }
  }catch(e){
    if($("importSummary"))$("importSummary").textContent="Import échoué : "+e.message;
    alert("Import impossible : "+e.message)
  }
  this.value=""
};
$("exportBtn").onclick=exportBackup;
$("authBtn").onclick=openAuth;
$("signInBtn").onclick=function(){authAction("signin")};
$("signUpBtn").onclick=function(){authAction("signup")};
$("signOutBtn").onclick=async function(){if(supa){await supa.auth.signOut();$("authDialog").close()}};
render();
