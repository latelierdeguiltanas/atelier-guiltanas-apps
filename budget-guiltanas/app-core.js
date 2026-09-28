"use strict";
var KEY="guiltanas-budget-v02", OLD_KEY="guiltanas-budget-v01";
var SYNC_CONFIG={url:"",publishableKey:""};
var euro=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"});
var monthFmt=new Intl.DateTimeFormat("fr-FR",{month:"long",year:"numeric"});
var dateFmt=new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
var $=function(id){return document.getElementById(id)};
var uid=function(){return (crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)};
function money(v){if(v===null||v===undefined||v==="")return null;var n=Number(String(v).replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?Math.round(n*100)/100:null}
function n(v){return Number.isFinite(Number(v))?Number(v):0}
function esc(v){return String(v??"").replace(/[&<>'"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"})[c]})}
function monthKeyNow(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function monthName(key){var p=key.split("-");return monthFmt.format(new Date(Number(p[0]),Number(p[1])-1,1))}
function todayKey(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function humanDate(v){if(!v)return"";var p=String(v).slice(0,10).split("-");if(p.length!==3)return v;return dateFmt.format(new Date(Number(p[0]),Number(p[1])-1,Number(p[2])))}
function statusDate(status,monthKey){
  var txt=String(status||"").trim(),m=txt.match(/ok\s+le\s+(\d{1,2})(?:\/(\d{1,2}))?/i);
  if(!m)return null;
  var p=monthKey.split("-"),year=Number(p[0]),month=m[2]?Number(m[2]):Number(p[1]),day=Number(m[1]);
  return year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0")
}
function addDaysKey(key,days){var p=String(key).slice(0,10).split("-"),d=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]));d.setDate(d.getDate()+days);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function monthStartKey(key){return String(key).slice(0,7)+"-01"}
function monthEndKey(key){var p=String(key).slice(0,7).split("-"),d=new Date(Number(p[0]),Number(p[1]),0);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function daysBetween(a,b){if(!a||!b)return 0;var pa=a.split("-"),pb=b.split("-"),da=Date.UTC(Number(pa[0]),Number(pa[1])-1,Number(pa[2])),db=Date.UTC(Number(pb[0]),Number(pb[1])-1,Number(pb[2]));return Math.max(0,Math.round((db-da)/86400000))}
function inferCheckedThrough(st){var dates=[];Object.keys(st.months||{}).forEach(function(k){var m=st.months[k];(m.charges||[]).forEach(function(c){if(c.paidAt)dates.push(String(c.paidAt).slice(0,10))});(m.entries||[]).forEach(function(e){var d=statusDate(e.sourceStatus,k);if(d)dates.push(d)})});dates.sort();return dates.length?dates[dates.length-1]:null}
function ensureAccounting(st){
  if(!st.accounting)st.accounting={checkedThrough:null,lastSessionAt:null,source:"manual",anchorBalance:null,anchorDate:null,anchorSource:null};
  if(st.accounting.anchorBalance===undefined)st.accounting.anchorBalance=null;
  if(st.accounting.anchorDate===undefined)st.accounting.anchorDate=null;
  if(st.accounting.anchorSource===undefined)st.accounting.anchorSource=null;
  if(!st.accounting.checkedThrough){var inferred=inferCheckedThrough(st);if(inferred){st.accounting.checkedThrough=inferred;st.accounting.source="excel-estimate"}}
  if(st.accounting.checkedThrough&&st.accounting.anchorBalance===null){
    var mk=checkpointMonthKey(st.accounting.checkedThrough),m=st.months&&st.months[mk];
    if(m&&m.bankBalance!==null&&m.bankBalance!==undefined){
      st.accounting.anchorBalance=n(m.bankBalance);st.accounting.anchorDate=st.accounting.checkedThrough;st.accounting.anchorSource="excel-estimate"
    }
  }
  return st
}
function checkpointMonthKey(dateKey){return dateKey?String(dateKey).slice(0,7):null}

function sortedMonthKeys(){return Object.keys(state.months||{}).sort()}
function switchMonth(key){if(!state.months[key])return;state.currentMonthKey=key;localStorage.setItem(KEY,JSON.stringify(state));render()}
function stepMonth(delta){var keys=sortedMonthKeys(),i=keys.indexOf(state.currentMonthKey),j=i+delta;if(i>=0&&j>=0&&j<keys.length)switchMonth(keys[j])}
function renderMonthNav(m){
  var keys=sortedMonthKeys(),sel=$("quickMonthSelect"),i=keys.indexOf(m.monthKey);
  sel.innerHTML=keys.map(function(k){return"<option value='"+k+"'>"+esc(monthName(k))+"</option>"}).join("");
  sel.value=m.monthKey;
  $("prevMonthBtn").disabled=i<=0;$("nextMonthBtn").disabled=i<0||i>=keys.length-1;
  var now=monthKeyNow(),checked=state.accounting&&state.accounting.checkedThrough,label,cls;
  if(m.monthKey>now){label="Planifié";cls="future"}
  else if(!checked){label="À vérifier";cls="catchup"}
  else if(checked>=monthEndKey(m.monthKey)){label="Vérifié";cls="closed"}
  else if(checked>=monthStartKey(m.monthKey)){label="En reprise";cls="current"}
  else {label="À rattraper";cls="catchup"}
  $("monthStatus").textContent=label;$("monthStatus").className="monthStatus "+cls
}
function renderCheckpoint(){
  var a=state.accounting||{},checked=a.checkedThrough,title=$("checkpointTitle"),txt=$("checkpointText"),card=$("checkpointCard");
  card.classList.remove("checkpointOk","checkpointLate","checkpointUnset");
  if(!checked){title.textContent="Point de reprise à définir";txt.textContent="Indique la dernière date jusqu'à laquelle vous êtes certains d'avoir vérifié les opérations.";card.classList.add("checkpointUnset");return}
  var next=addDaysKey(checked,1),today=todayKey(),late=checked<today?daysBetween(checked,today):0;
  title.textContent="Comptes vérifiés jusqu'au "+humanDate(checked);
  txt.textContent=checked>=today?"Vous êtes à jour.":("Reprendre à partir du "+humanDate(next)+" · "+late+" jour"+(late>1?"s":"")+" à rattraper.");
  card.classList.add(checked>=today?"checkpointOk":"checkpointLate")
}
function openCheckpoint(){
  var a=state.accounting||{};$("checkedThroughDate").value=a.checkedThrough||todayKey();$("checkpointBank").value="";
  updateCheckpointPreview();$("checkpointDialog").showModal()
}
function updateCheckpointPreview(){
  var d=$("checkedThroughDate").value;if(!d){$("checkpointPreview").textContent="";return}
  var next=addDaysKey(d,1),late=d<todayKey()?daysBetween(d,todayKey()):0;
  $("checkpointPreview").innerHTML="<strong>Prochaine reprise : "+humanDate(next)+"</strong><span>"+(d>=todayKey()?"Vous serez à jour.":late+" jour"+(late>1?"s":"")+" à reprendre ensuite.")+"</span>"
}
function saveCheckpoint(){
  var d=$("checkedThroughDate").value;if(!d)return;var bank=money($("checkpointBank").value);
  state.accounting=state.accounting||{};state.accounting.checkedThrough=d;state.accounting.lastSessionAt=new Date().toISOString();state.accounting.source="manual";
  Object.keys(state.months||{}).forEach(function(k){var m=state.months[k];m.closed=d>=monthEndKey(k);(m.entries||[]).forEach(function(e){if(entryActual(e)&&String(e.createdAt||"").slice(0,10)<=d)e.reconciled=true})});
  if(bank!==null){
    var mk=checkpointMonthKey(d),m=state.months[mk];if(m)m.bankBalance=bank;
    state.accounting.anchorBalance=bank;state.accounting.anchorDate=d;state.accounting.anchorSource="manual"
  }
  save();$("checkpointDialog").close();render()
}
function makeMonth(key){return{monthKey:key,base:0,bankBalance:null,budgets:[
  {id:uid(),name:"Courses",planned:0},{id:uid(),name:"Divers / Joker",planned:0},{id:uid(),name:"Enfants",planned:0},{id:uid(),name:"Travaux",planned:0},{id:uid(),name:"Notes de frais",planned:0},{id:uid(),name:"Essence",planned:0}
],charges:[],incomes:[],entries:[],excelReference:null,closed:false}}
function defaultState(){var k=monthKeyNow(),o={};o[k]=makeMonth(k);return{version:2,currentMonthKey:k,months:o,merchantRules:{},archiveMeta:null,lastSyncAt:null,accounting:{checkedThrough:null,lastSessionAt:null,source:"manual",anchorBalance:null,anchorDate:null,anchorSource:null}}}
function migrateOld(old){var st=defaultState(),m=currentMonth(st);m.bankBalance=n(old.settings&&old.settings.bankBalance);m.charges=(old.settings&&old.settings.fixedRemaining)?[{id:uid(),name:"Charges fixes restantes (ancien prototype)",group:"Import v0.1",amount:n(old.settings.fixedRemaining),paid:false}]:[];m.incomes=(old.settings&&old.settings.expectedIncome)?[{id:uid(),name:"Revenus attendus (ancien prototype)",amount:n(old.settings.expectedIncome),received:false}]:[];m.budgets=(old.budgets||[]).map(function(b){return{id:b.id||uid(),name:b.name,planned:n(b.reserved)}});m.entries=(old.transactions||[]).map(function(t){return{id:t.id||uid(),type:t.type,amount:n(t.amount),label:t.label,categoryId:t.categoryId||null,usesBudget:!!t.wasReserved,actual:true,reconciled:false,createdAt:t.createdAt||new Date().toISOString()}});st.merchantRules=old.merchantRules||{};return st}
function load(){try{var x=localStorage.getItem(KEY);if(x)return ensureAccounting(JSON.parse(x));var y=localStorage.getItem(OLD_KEY);if(y){var st=ensureAccounting(migrateOld(JSON.parse(y)));localStorage.setItem(KEY,JSON.stringify(st));return st}}catch(e){}return ensureAccounting(defaultState())}
function recalculateCarryForward(st){st=st||state;var keys=Object.keys(st.months||{}).sort();for(var i=1;i<keys.length;i++){var prev=st.months[keys[i-1]],cur=st.months[keys[i]];cur.base=totals(prev).planForecast;cur.baseAuto=true}}
function save(){recalculateCarryForward(state);if(typeof snapshotActiveAccount==="function")snapshotActiveAccount(state);localStorage.setItem(KEY,JSON.stringify(state));scheduleSync()}
function currentMonth(st){st=st||state;return st.months[st.currentMonthKey]||(st.months[st.currentMonthKey]=makeMonth(st.currentMonthKey))}
function isDoneStatus(s){return /^ok\b/i.test(String(s||"").trim())}
function entryActual(e){return e.actual!==false}
function budgetById(m,id){return m.budgets.find(function(b){return b.id===id})}
function usedBudget(m,bid,actualOnly){return m.entries.filter(function(e){return e.type==="expense"&&e.categoryId===bid&&(!actualOnly||entryActual(e))}).reduce(function(s,e){return s+n(e.amount)},0)}
function totals(m){
  var budgetPlan=m.budgets.reduce(function(s,b){return s+n(b.planned)},0);
  var chargePlan=m.charges.reduce(function(s,c){return s+n(c.amount)},0);
  var incomePlan=m.incomes.reduce(function(s,i){return s+n(i.amount)},0);
  var extraExpenses=m.entries.filter(function(e){return e.type==="expense"&&entryActual(e)&&!e.categoryId&&!e.fixedChargeId}).reduce(function(s,e){return s+n(e.amount)},0);
  var budgetOverrun=m.budgets.reduce(function(s,b){return s+Math.max(0,usedBudget(m,b.id,true)-n(b.planned))},0);
  var planForecast=n(m.base)+incomePlan-chargePlan-budgetPlan-budgetOverrun-extraExpenses;
  var remainingCharges=m.charges.filter(function(c){return !c.paid}).reduce(function(s,c){return s+n(c.amount)},0);
  var remainingBudgets=m.budgets.reduce(function(s,b){return s+Math.max(0,n(b.planned)-usedBudget(m,b.id,true))},0);
  var remainingIncome=m.incomes.filter(function(i){return !i.received}).reduce(function(s,i){return s+n(i.amount)},0);
  var pending=m.entries.filter(function(e){return entryActual(e)&&!e.reconciled}).reduce(function(s,e){return s+(e.type==="income"?n(e.amount):-n(e.amount))},0);
  var effectiveBank=m.bankBalance===null?null:n(m.bankBalance)+pending;
  var bankForecast=effectiveBank===null?null:effectiveBank-remainingCharges-remainingBudgets+remainingIncome;
  return{budgetPlan:budgetPlan,chargePlan:chargePlan,incomePlan:incomePlan,extraExpenses:extraExpenses,budgetOverrun:budgetOverrun,planForecast:planForecast,remainingCharges:remainingCharges,remainingBudgets:remainingBudgets,remainingIncome:remainingIncome,pending:pending,effectiveBank:effectiveBank,bankForecast:bankForecast};
}
function suggest(label,m){var key=label.trim().toLowerCase();if(state.merchantRules[key])return state.merchantRules[key];var rules=[[/carrefour|leclerc|lidl|hyper u|super u|auchan|primeur|boucher|jow/i,"course"],[/essence|avia|total|shell|esso|bp\b/i,"essence"],[/cantine|garderie|centre a[eé]r[eé]|pharmacie|danse|hip hop|enfant/i,"enfant"],[/brico|leroy|castorama|manomano|ikea/i,"travaux"]];for(var i=0;i<rules.length;i++){if(rules[i][0].test(label)){var b=m.budgets.find(function(x){return x.name.toLowerCase().includes(rules[i][1])});if(b)return b.id}}var d=m.budgets.find(function(x){return /divers|joker/i.test(x.name)});return d?d.id:(m.budgets[0]?m.budgets[0].id:"")}
function render(){recalculateCarryForward(state);var m=currentMonth(),t=totals(m);if(typeof renderAccountUI==="function")renderAccountUI();$("monthLabel").textContent=activeCurrentAccountName?activeCurrentAccountName()+" · "+monthName(m.monthKey):monthName(m.monthKey);renderMonthNav(m);renderCheckpoint();$("forecast").textContent=euro.format(t.planForecast);$("base").textContent=euro.format(n(m.base));$("incomePlan").textContent=euro.format(t.incomePlan);$("expensePlan").textContent=euro.format(t.chargePlan+t.budgetPlan);var a=state.accounting||{},appNow=(typeof appBalanceAt==="function")?appBalanceAt(todayKey()):null;$("bank").textContent=a.anchorBalance===null||a.anchorBalance===undefined?"À définir":euro.format(n(a.anchorBalance));$("bankForecast").textContent=appNow===null?"Référence requise":euro.format(appNow);$("bankForecast").classList.toggle("negative",appNow!==null&&appNow<0);renderFixedCharges(m);renderBudgets(m);renderTransactions(m);renderPlan();if(typeof renderSavings==="function")renderSavings();renderSync();fillMonthSelect()}
function renderFixedCharges(m){var root=$("fixedCharges");root.innerHTML="";if(!m.charges.length){root.innerHTML="<div class='empty'>Aucune charge fixe programmée.</div>";return}m.charges.forEach(function(c){var el=document.createElement("button");el.type="button";el.className="chargeRow "+(c.paid?"paid":"pending");el.dataset.charge=c.id;var status=c.paid?(c.paidAt?("Sortie le "+humanDate(c.paidAt)):"Sortie · date non renseignée"):"Pas encore sortie";el.innerHTML="<div class='chargeState'>"+(c.paid?"✓":"○")+"</div><div class='chargeMain'><p><strong>"+esc(c.name)+"</strong></p><small>"+status+(c.group?" · "+esc(c.group):"")+"</small></div><div class='chargeValue'>"+euro.format(n(c.amount))+"</div>";root.appendChild(el)});root.querySelectorAll("[data-charge]").forEach(function(btn){btn.onclick=function(){openChargeDialog(btn.dataset.charge)}})}
function renderBudgets(m){var root=$("budgets");root.innerHTML="";if(!m.budgets.length){root.innerHTML="<div class='empty' style='grid-column:1/-1'>Aucune enveloppe.</div>";return}m.budgets.forEach(function(b){var all=usedBudget(m,b.id,false),actual=usedBudget(m,b.id,true),planned=n(b.planned),rem=planned-all,p=planned>0?Math.min(100,Math.max(0,all/planned*100)):(all>0?100:0),over=rem<0,level;if(planned<=0)level=all>0?"budgetDanger":"budgetNeutral";else if(all>0&&rem<=50)level="budgetDanger";else if(all>=planned*.5)level="budgetWarn";else level="budgetGood";var el=document.createElement("article");el.className="card budgetCard "+level;el.innerHTML="<div class='budgetStateDot'></div><h3>"+esc(b.name)+"</h3><div class='money'>"+euro.format(rem)+"</div><div class='progress "+(over?"over":"")+"'><span style='width:"+p+"%'></span></div><div class='meta'><span>"+euro.format(all)+" engagés</span><span>"+euro.format(actual)+" sortis</span></div>"+(over?"<div class='warn'>Dépassement de "+euro.format(Math.abs(rem))+"</div>":"");root.appendChild(el)})}
function renderTransactions(m){var tx=m.entries.filter(entryActual).slice().sort(function(a,b){return String(b.createdAt||"").localeCompare(String(a.createdAt||""))}).slice(0,25),root=$("transactions");root.innerHTML="";if(!tx.length){root.innerHTML="<div class='empty'>Aucune opération réellement passée pour ce mois.</div>";return}tx.forEach(function(e){var b=budgetById(m,e.categoryId),el=document.createElement("article");el.className="tx "+e.type;el.innerHTML="<div><p><strong>"+esc(e.label)+"</strong>"+(!e.reconciled?"<span class='pendingTag'>depuis le dernier solde</span>":"")+"</p><small>"+(e.type==="income"?"Revenu":esc(b?b.name:(e.fixedChargeId?"Charge fixe":"Hors budget")))+" · "+humanDate(e.createdAt)+"</small></div><p class='amt'>"+(e.type==="income"?"+":"−")+euro.format(n(e.amount))+"</p><button class='undoBtn' data-undo='"+e.id+"' aria-label='Annuler cette opération'>↶</button>";root.appendChild(el)});root.querySelectorAll("[data-undo]").forEach(function(btn){btn.onclick=function(){undoEntry(btn.dataset.undo)}})}
function undoEntry(id){var m=currentMonth(),e=m.entries.find(function(x){return x.id===id});if(!e)return;if(!confirm("Annuler « "+e.label+" » ("+euro.format(n(e.amount))+") ?"))return;if(e.fixedChargeId){var c=m.charges.find(function(x){return x.id===e.fixedChargeId});if(c){c.paid=false;c.paidAt=null}}if(e.incomeId){var inc=m.incomes.find(function(x){return x.id===e.incomeId});if(inc)inc.received=false}m.entries=m.entries.filter(function(x){return x.id!==id});save();render()}
var planTab="charges";
function renderPlan(){var m=currentMonth(),root=$("planList"),arr=planTab==="charges"?m.charges:planTab==="incomes"?m.incomes:m.budgets;$("addPlanItemBtn").textContent=planTab==="charges"?"Ajouter une charge":planTab==="incomes"?"Ajouter un revenu":"Ajouter un budget";root.innerHTML="";if(!arr.length){root.innerHTML="<div class='empty'>Rien de programmé ici pour le moment.</div>";return}arr.forEach(function(x){var done=planTab==="charges"?x.paid:planTab==="incomes"?x.received:false,el=document.createElement("article");el.className="planItem "+(done?"checked":"")+(planTab==="charges"&&!done?" chargePending":"");var detail=planTab==="charges"?(done?((x.paidAt?"Sortie le "+humanDate(x.paidAt):"Sortie · date non renseignée")+" · "+esc(x.group||"Charge")):("Pas encore sortie · "+esc(x.group||"Charge"))):(planTab==="incomes"?"Revenu prévu":"Enveloppe mensuelle");el.innerHTML="<div><p><strong>"+esc(x.name)+"</strong></p><small>"+detail+"</small></div><div style='display:flex;align-items:center;gap:6px'><div class='planAmt'>"+euro.format(n(planTab==="budgets"?x.planned:x.amount))+"</div><button class='toggle' data-edit='"+x.id+"' aria-label='Modifier'>✎</button>"+(planTab==="budgets"?"":"<button class='toggle' data-toggle='"+x.id+"'>"+(done?"✓":"○")+"</button>")+"</div>";root.appendChild(el)});root.querySelectorAll("[data-toggle]").forEach(function(btn){btn.onclick=function(){togglePlanItem(btn.dataset.toggle)}});root.querySelectorAll("[data-edit]").forEach(function(btn){btn.onclick=function(){openPlanDialog(btn.dataset.edit)}})}
var activeChargeId=null;
function openChargeDialog(id){var m=currentMonth(),c=m.charges.find(function(x){return x.id===id});if(!c)return;activeChargeId=id;$("chargeName").textContent=c.name;$("chargeAmount").textContent=euro.format(n(c.amount));$("chargePaidDate").value=c.paidAt?String(c.paidAt).slice(0,10):todayKey();$("chargeDialogTitle").textContent=c.paid?"Charge déjà sortie":"Valider la sortie";$("chargeConfirmBtn").textContent=c.paid?"Modifier la date":"Valider la sortie";$("chargeRevertBtn").classList.toggle("hidden",!c.paid);$("chargeDialog").showModal()}
function confirmChargePaid(){var m=currentMonth(),c=m.charges.find(function(x){return x.id===activeChargeId});if(!c)return;var d=$("chargePaidDate").value||todayKey();c.paid=true;c.paidAt=d;var e=m.entries.find(function(x){return x.fixedChargeId===c.id});var stamp=d+"T12:00:00.000Z";if(e){e.amount=n(c.amount);e.label=c.name;e.createdAt=stamp;e.actual=true}else m.entries.push({id:uid(),type:"expense",amount:n(c.amount),label:c.name,fixedChargeId:c.id,usesBudget:false,actual:true,reconciled:false,createdAt:stamp});save();$("chargeDialog").close();render()}
function revertCharge(){var m=currentMonth(),c=m.charges.find(function(x){return x.id===activeChargeId});if(!c)return;if(!confirm("Remettre « "+c.name+" » en pas encore sortie ?"))return;c.paid=false;c.paidAt=null;m.entries=m.entries.filter(function(e){return e.fixedChargeId!==c.id});save();$("chargeDialog").close();render()}
function togglePlanItem(id){var m=currentMonth();if(planTab==="charges"){openChargeDialog(id);return}else if(planTab==="incomes"){var inc=m.incomes.find(function(x){return x.id===id});if(!inc)return;inc.received=!inc.received;if(inc.received)m.entries.push({id:uid(),type:"income",amount:n(inc.amount),label:inc.name,incomeId:inc.id,actual:true,reconciled:false,createdAt:new Date().toISOString()});else m.entries=m.entries.filter(function(e){return e.incomeId!==inc.id})}save();render()}
function fillCats(){var m=currentMonth();$("category").innerHTML=m.budgets.map(function(b){return"<option value='"+b.id+"'>"+esc(b.name)+"</option>"}).join("")+"<option value=''>Hors budget / Joker libre</option>"}
var mode="expense";
function defaultEntryDate(){var m=currentMonth(),next=state.accounting&&state.accounting.checkedThrough?addDaysKey(state.accounting.checkedThrough,1):null;if(next&&next.slice(0,7)===m.monthKey)return next;if(todayKey().slice(0,7)===m.monthKey)return todayKey();return monthStartKey(m.monthKey)}
function openEntry(type){mode=type;$("kind").textContent=type==="expense"?"Nouvelle dépense":"Nouveau revenu";$("entryTitle").textContent=type==="expense"?"Ajouter une dépense":"Ajouter un revenu";$("catWrap").hidden=type==="income";$("reservedWrap").hidden=type==="income";$("amount").value="";$("entryDate").value=defaultEntryDate();$("label").value="";$("reserved").checked=true;fillCats();$("entryDialog").showModal();setTimeout(function(){$("amount").focus()},50)}
function openSettings(){var m=currentMonth(),keys=sortedMonthKeys(),auto=keys.indexOf(m.monthKey)>0;$("setBase").value=n(m.base)||"";$("setBase").disabled=auto;$("baseHelp").textContent=auto?"Report automatique du résultat du mois précédent.":"Base du premier mois de l'historique.";fillMonthSelect();$("setMonth").value=state.currentMonthKey;$("settingsDialog").showModal()}
function fillMonthSelect(){var keys=sortedMonthKeys();$("setMonth").innerHTML=keys.map(function(k){return"<option value='"+k+"'>"+esc(monthName(k))+"</option>"}).join("")+"<option value='__new__'>+ Nouveau mois</option>"}
var editPlanId=null;
function openPlanDialog(id){var m=currentMonth(),arr=planTab==="charges"?m.charges:planTab==="incomes"?m.incomes:m.budgets;editPlanId=id||null;var item=id?arr.find(function(x){return x.id===id}):null;var title=(item?"Modifier ":"Ajouter ")+(planTab==="charges"?"une charge":planTab==="incomes"?"un revenu":"un budget");$("planDialogTitle").textContent=title;$("planName").value=item?item.name:"";$("planGroup").value=item&&item.group?item.group:"";$("planAmount").value=item?n(planTab==="budgets"?item.planned:item.amount):"";$("groupWrap").hidden=planTab!=="charges";$("deletePlanBtn").textContent=planTab==="budgets"?"Supprimer ce budget":planTab==="charges"?"Supprimer cette charge":"Supprimer ce revenu";$("deletePlanBtn").classList.toggle("hidden",!item);$("planDialog").showModal()}
function switchView(v){["home","plan","savings","data"].forEach(function(x){$("view"+x[0].toUpperCase()+x.slice(1)).classList.toggle("hidden",x!==v)});document.querySelectorAll("footer [data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===v)});if($("accountSwitcher"))$("accountSwitcher").classList.toggle("hidden",v==="savings");if(v==="plan")renderPlan();if(v==="savings"&&typeof renderSavings==="function")renderSavings()}
function importExcel(p){
  if(!p||["guiltanas-budget-excel-v1","guiltanas-budget-excel-v2"].indexOf(p.format)===-1||!Array.isArray(p.months))throw new Error("Format d'import Excel non reconnu");
  if(typeof snapshotActiveAccount==="function")snapshotActiveAccount(state);
  var targetId=p.accountId&&state.currentAccounts&&state.currentAccounts[p.accountId]?p.accountId:state.currentAccountId;
  if(!targetId)targetId="lcl";
  var monthsObj={},activeKey=p.currentMonthKey||p.months[p.months.length-1].monthKey;
  p.months.forEach(function(src){
    var budgetMap={},m={monthKey:src.monthKey,base:n(src.base),bankBalance:src.excelTotals&&Number.isFinite(src.excelTotals.bankBalance)?src.excelTotals.bankBalance:null,budgets:[],charges:[],incomes:[],entries:[],excelReference:src.excelTotals||null,closed:src.monthKey<activeKey};
    (src.budgets||[]).forEach(function(b){var id=uid();budgetMap[String(b.name).toUpperCase()]=id;m.budgets.push({id:id,name:b.name,planned:n(b.planned)})});
    (src.plannedCharges||[]).forEach(function(c){
      var paid=isDoneStatus(c.status),d=statusDate(c.status,src.monthKey),id=uid(),stamp=(d||src.monthKey+"-15")+"T12:00:00.000Z";
      m.charges.push({id:id,name:c.label,group:c.group||"Autres",amount:n(c.amount),paid:paid,paidAt:paid?d:null});
      if(paid)m.entries.push({id:uid(),type:"expense",amount:n(c.amount),label:c.label,fixedChargeId:id,usesBudget:false,actual:true,reconciled:true,createdAt:stamp,sourceStatus:c.status||""})
    });
    (src.entries||[]).forEach(function(e){
      var d=statusDate(e.status,src.monthKey),fallback=src.monthKey+"-15",stamp=(d||fallback)+"T12:00:00.000Z";
      if(e.type==="income"){
        var id=uid();m.incomes.push({id:id,name:e.label,amount:n(e.amount),received:!!e.actual});
        if(e.actual)m.entries.push({id:uid(),type:"income",amount:n(e.amount),label:e.label,incomeId:id,actual:true,reconciled:true,createdAt:stamp,sourceStatus:e.status||""})
      }else{
        var bid=budgetMap[String(e.category||"").toUpperCase()]||null;
        m.entries.push({id:uid(),type:"expense",amount:n(e.amount),label:e.label,categoryId:bid,usesBudget:!!bid,actual:!!e.actual,reconciled:true,createdAt:stamp,sourceStatus:e.status||""})
      }
    });
    monthsObj[m.monthKey]=m
  });
  var target=state.currentAccounts[targetId]||emptyAccountData(targetId,targetId==="credit_agricole"?"Crédit Agricole":"LCL",targetId==="credit_agricole"?"Crédit Agricole":"LCL");
  target.months=monthsObj;
  target.currentMonthKey=monthsObj[activeKey]?activeKey:Object.keys(monthsObj).sort().slice(-1)[0];
  target.archiveMeta={source:p.source||"Excel",importedAt:new Date().toISOString(),year:p.year||null,workbookType:p.workbookType||null,detectedModules:p.detectedModules||[]};
  target.accounting={checkedThrough:p.suggestedCheckedThrough||inferCheckedThrough({months:monthsObj}),lastSessionAt:null,source:"excel-estimate",anchorBalance:null,anchorDate:null,anchorSource:null};
  ensureAccounting(target);
  state.currentAccounts[targetId]=target;
  applyActiveAccount(state,targetId);
  var savingsCount=0;
  if(Array.isArray(p.savings)&&p.savings.length&&typeof mergeImportedSavings==="function")savingsCount=mergeImportedSavings(p.savings,p.source||"Excel");
  save();render();
  var keys=Object.keys(monthsObj).sort(),count=keys.length,extra=savingsCount?" · "+savingsCount+" épargnes importées":"";
  if($("importSummary"))$("importSummary").textContent=count+" mois importés dans "+activeCurrentAccountName()+" · "+monthName(keys[0])+" → "+monthName(keys[keys.length-1])+extra;
  alert("Import terminé dans "+activeCurrentAccountName()+" : "+count+" mois chargés"+(savingsCount?" et "+savingsCount+" épargnes mises à jour":"")+".")
}
function exportBackup(){var blob=new Blob([JSON.stringify({format:"guiltanas-budget-backup-v2",exportedAt:new Date().toISOString(),state:state},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="budget-guiltanas-sauvegarde-"+state.currentMonthKey+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
function importBackup(p){if(p.format==="guiltanas-budget-excel-v1"||p.format==="guiltanas-budget-excel-v2")return importExcel(p);if(p.format==="guiltanas-budget-backup-v2"&&p.state){state=ensureMultiAccount(p.state);save();render();alert("Sauvegarde restaurée.");return}throw new Error("Fichier non reconnu")}
