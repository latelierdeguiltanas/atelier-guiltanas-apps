"use strict";
var lastBankCheck=null;
var RECONCILE_TOLERANCE=0.05;

function bankCheckEntryDate(e){
  return String(e&&e.createdAt||"").slice(0,10)
}
function bankCheckAnchor(){
  ensureAccounting(state);
  var a=state.accounting||{};
  if(a.anchorBalance===null||a.anchorBalance===undefined||!a.anchorDate)return null;
  return{date:String(a.anchorDate).slice(0,10),balance:n(a.anchorBalance),source:a.anchorSource||"manual"}
}
function actualEntriesBetween(startExclusive,endInclusive){
  var rows=[];
  Object.keys(state.months||{}).sort().forEach(function(k){
    var m=state.months[k];
    (m.entries||[]).forEach(function(e){
      if(!entryActual(e))return;
      var d=bankCheckEntryDate(e);
      if(!d)return;
      if(startExclusive&&d<=startExclusive)return;
      if(endInclusive&&d>endInclusive)return;
      rows.push({entry:e,month:m,date:d})
    })
  });
  rows.sort(function(a,b){return a.date.localeCompare(b.date)});
  return rows
}
function appBalanceAt(dateKey){
  var anchor=bankCheckAnchor();
  if(!anchor)return null;
  var value=anchor.balance;
  actualEntriesBetween(anchor.date,dateKey).forEach(function(r){
    value+=r.entry.type==="income"?n(r.entry.amount):-n(r.entry.amount)
  });
  return Math.round(value*100)/100
}
function bankCheckCandidate(label,amount,impact,date,kind,details,priority){
  return{label:label,amount:n(amount),impact:Math.round(n(impact)*100)/100,date:date||null,kind:kind||"",details:details||"",priority:priority||0}
}
function normLabel(v){return String(v||"").toLowerCase().replace(/\s+/g," ").trim()}
function dateDistance(a,b){
  if(!a||!b)return 999;
  var pa=a.split("-"),pb=b.split("-");
  return Math.abs((Date.UTC(+pa[0],+pa[1]-1,+pa[2])-Date.UTC(+pb[0],+pb[1]-1,+pb[2]))/86400000)
}
function findDuplicateCandidates(entries){
  var out=[];
  for(var i=0;i<entries.length;i++){
    for(var j=i+1;j<entries.length;j++){
      var a=entries[i],b=entries[j];
      if(a.entry.type!==b.entry.type)continue;
      if(Math.abs(n(a.entry.amount)-n(b.entry.amount))>0.005)continue;
      if(normLabel(a.entry.label)!==normLabel(b.entry.label))continue;
      if(dateDistance(a.date,b.date)>7)continue;
      var impact=a.entry.type==="expense"?n(a.entry.amount):-n(a.entry.amount);
      out.push(bankCheckCandidate(
        a.entry.label,n(a.entry.amount),impact,b.date,"duplicate",
        "Deux écritures identiques les "+humanDate(a.date)+" et "+humanDate(b.date)+". Vérifie qu'elles sont toutes les deux réelles.",90
      ))
    }
  }
  return out
}
function reconciliationCandidates(diff,dateKey){
  var anchor=bankCheckAnchor(),candidates=[],period=anchor?actualEntriesBetween(anchor.date,dateKey):[];
  var endMonth=dateKey.slice(0,7);

  Object.keys(state.months||{}).sort().forEach(function(k){
    if(k>endMonth)return;
    var m=state.months[k];
    (m.charges||[]).forEach(function(c){
      if(c.paid)return;
      candidates.push(bankCheckCandidate(
        c.name,c.amount,-n(c.amount),null,"unpaid-charge",
        "Cette charge est prévue mais pas encore marquée comme sortie dans l'application.",75
      ))
    });
    (m.incomes||[]).forEach(function(inc){
      if(inc.received)return;
      candidates.push(bankCheckCandidate(
        inc.name,inc.amount,n(inc.amount),null,"unreceived-income",
        "Ce revenu est prévu mais pas encore marqué comme reçu.",65
      ))
    })
  });

  period.forEach(function(r){
    var e=r.entry;
    if(e.type==="expense"){
      candidates.push(bankCheckCandidate(
        e.label,e.amount,n(e.amount),r.date,"possible-extra",
        "Si cette dépense a été saisie en double ou n'existe pas réellement, sa suppression rapprocherait les soldes.",30
      ))
    }else{
      candidates.push(bankCheckCandidate(
        e.label,e.amount,-n(e.amount),r.date,"possible-extra-income",
        "Si ce revenu a été saisi en double, sa suppression rapprocherait les soldes.",30
      ))
    }
  });

  candidates=candidates.concat(findDuplicateCandidates(period));

  candidates.forEach(function(c){
    c.residual=Math.abs(diff-c.impact);
    if(Math.abs(diff-c.impact)<=RECONCILE_TOLERANCE)c.priority+=100
    if(Math.sign(diff)===Math.sign(c.impact))c.priority+=20
  });
  candidates.sort(function(a,b){
    if(b.priority!==a.priority)return b.priority-a.priority;
    return a.residual-b.residual
  });

  var exactSingles=candidates.filter(function(c){return Math.abs(diff-c.impact)<=RECONCILE_TOLERANCE}).slice(0,6);
  var pool=candidates.filter(function(c){return Math.sign(c.impact)===Math.sign(diff)}).slice(0,18);
  var combos=[];
  for(var i=0;i<pool.length;i++){
    for(var j=i+1;j<pool.length;j++){
      var sum=pool[i].impact+pool[j].impact;
      if(Math.abs(diff-sum)<=RECONCILE_TOLERANCE){
        combos.push({items:[pool[i],pool[j]],impact:sum});if(combos.length>=5)break
      }
    }
    if(combos.length>=5)break
  }
  if(!combos.length&&pool.length<=14){
    outer:for(var a=0;a<pool.length;a++)for(var b=a+1;b<pool.length;b++)for(var c=b+1;c<pool.length;c++){
      var sum3=pool[a].impact+pool[b].impact+pool[c].impact;
      if(Math.abs(diff-sum3)<=RECONCILE_TOLERANCE){combos.push({items:[pool[a],pool[b],pool[c]],impact:sum3});if(combos.length>=3)break outer}
    }
  }
  return{singles:exactSingles,combos:combos,near:candidates.slice(0,6),period:period}
}
function candidateHtml(c){
  var icon=c.kind==="duplicate"?"⧉":c.kind==="unpaid-charge"?"○":c.kind==="unreceived-income"?"+":"?";
  var date=c.date?" · "+humanDate(c.date):"";
  return"<article class='reconcileCandidate'><div class='candidateIcon'>"+icon+"</div><div><strong>"+esc(c.label)+"</strong><small>"+esc(c.details)+date+"</small></div><b>"+euro.format(c.amount)+"</b></article>"
}
function renderBankCheckAnalysis(real,dateKey){
  ensureAccounting(state);
  var expected=appBalanceAt(dateKey),result=$("bankCheckResult"),status=$("bankCheckStatus"),list=$("bankCheckCandidates"),accept=$("acceptBankCheckBtn");
  result.classList.remove("hidden");$("bankCheckActual").textContent=euro.format(real);
  if(expected===null){
    $("bankCheckExpected").textContent="Référence requise";$("bankCheckDiff").textContent="—";
    status.className="reconcileStatus warning";
    status.innerHTML="<strong>Il manque un solde de référence vérifié.</strong><span>Pour analyser un écart sans le masquer, enregistre d'abord un « Point de reprise » avec le solde exact de "+activeCurrentAccountName()+" à cette date.</span>";
    list.innerHTML="<p class='notice'>Une fois cette référence créée, l'application reconstruira automatiquement son solde avec toutes les opérations suivantes.</p>";
    accept.classList.add("hidden");lastBankCheck=null;return
  }

  var diff=Math.round((real-expected)*100)/100,abs=Math.abs(diff),anchor=bankCheckAnchor();
  lastBankCheck={date:dateKey,real:real,expected:expected,diff:diff};
  $("bankCheckExpected").textContent=euro.format(expected);$("bankCheckDiff").textContent=(diff>0?"+":"")+euro.format(diff);
  $("bankCheckDiff").className=abs<=RECONCILE_TOLERANCE?"okValue":"badValue";

  if(abs<=RECONCILE_TOLERANCE){
    status.className="reconcileStatus success";
    status.innerHTML="<strong>Les comptes correspondent.</strong><span>Écart de "+euro.format(abs)+" depuis la référence du "+humanDate(anchor.date)+". Tu peux valider ce rapprochement.</span>";
    list.innerHTML="";accept.textContent="Valider ce rapprochement";accept.classList.remove("hidden");return
  }

  accept.classList.add("hidden");
  status.className="reconcileStatus danger";
  status.innerHTML="<strong>Écart de "+euro.format(abs)+" à expliquer.</strong><span>"+(diff<0?"Le solde "+activeCurrentAccountName()+" est plus bas que l'application : cherche plutôt une dépense/prélèvement manquant ou un revenu saisi en trop.":"Le solde "+activeCurrentAccountName()+" est plus haut que l'application : cherche plutôt un revenu manquant ou une dépense saisie en trop.")+"</span>";

  var found=reconciliationCandidates(diff,dateKey),html="";
  if(found.singles.length){
    html+="<h3>Pistes qui correspondent exactement à l'écart</h3>"+found.singles.map(candidateHtml).join("")
  }
  if(found.combos.length){
    html+="<h3>Combinaisons possibles</h3>";
    found.combos.forEach(function(g){
      html+="<article class='comboCandidate'><strong>"+g.items.map(function(x){return esc(x.label)+" ("+euro.format(x.amount)+")"}).join(" + ")+"</strong><small>Ensemble, ces éléments expliqueraient exactement l'écart.</small></article>"
    })
  }
  if(!found.singles.length&&!found.combos.length){
    html+="<h3>Pistes les plus proches</h3>"+found.near.slice(0,5).map(candidateHtml).join("");
    html+="<p class='notice'>Aucune écriture déjà connue ne retombe exactement sur l'écart. Une opération peut être totalement absente de l'application. Pour l'identifier avec certitude, il faudra ensuite importer le relevé bancaire de "+activeCurrentAccountName()+" (CSV/Excel/OFX si disponible).</p>"
  }
  list.innerHTML=html
}
function openBankCheck(){
  ensureAccounting(state);
  $("bankCheckDate").value=todayKey();$("bankCheckReal").value="";$("bankCheckResult").classList.add("hidden");
  $("bankCheckDialog").showModal();setTimeout(function(){$("bankCheckReal").focus()},60)
}
function runBankCheck(){
  var d=$("bankCheckDate").value,real=money($("bankCheckReal").value),anchor=bankCheckAnchor();
  if(!d||real===null){alert("Renseigne une date et le solde réel "+activeCurrentAccountName()+".");return}
  if(anchor&&d<anchor.date){alert("La date du contrôle doit être postérieure ou égale au dernier solde de référence ("+humanDate(anchor.date)+").");return}
  renderBankCheckAnalysis(real,d)
}
function acceptBankCheck(){
  if(!lastBankCheck||Math.abs(lastBankCheck.diff)>RECONCILE_TOLERANCE)return;
  var d=lastBankCheck.date,real=lastBankCheck.real;
  state.accounting=state.accounting||{};
  state.accounting.checkedThrough=d;state.accounting.lastSessionAt=new Date().toISOString();state.accounting.source="reconciliation";
  state.accounting.anchorBalance=real;state.accounting.anchorDate=d;state.accounting.anchorSource="reconciliation";
  Object.keys(state.months||{}).forEach(function(k){
    var m=state.months[k];m.closed=d>=monthEndKey(k);
    (m.entries||[]).forEach(function(e){if(entryActual(e)&&bankCheckEntryDate(e)<=d)e.reconciled=true})
  });
  var mk=checkpointMonthKey(d);if(state.months[mk])state.months[mk].bankBalance=real;
  save();$("bankCheckDialog").close();render();lastBankCheck=null
}
