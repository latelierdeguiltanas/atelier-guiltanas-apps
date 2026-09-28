"use strict";
(function(){
  var MONTHS={
    "JANVIER":1,"FEVRIER":2,"FÉVRIER":2,"MARS":3,"AVRIL":4,"MAI":5,"JUIN":6,
    "JUILLET":7,"AOUT":8,"AOÛT":8,"SEPTEMBRE":9,"OCTOBRE":10,"NOVEMBRE":11,
    "DECEMBRE":12,"DÉCEMBRE":12
  };
  var BUDGET_NAMES=["COURSES","DIVERS","ENFANTS","TRAVAUX","NDF MATH","ESSENCE"];
  var SECTIONS=[
    {start:"COURSES",label:5,amount:7,status:8,switches:{"TRAVAUX":"TRAVAUX"}},
    {start:"DIVERS",label:9,amount:11,status:12,switches:{"NDF MATH":"NDF MATH"}},
    {start:"ENFANTS",label:13,amount:15,status:16,switches:{"ESSENCE":"ESSENCE"}},
    {start:"REVENUS",label:17,amount:19,status:20,switches:{"RESULTATS":"RESULTATS"}}
  ];
  function norm(v){return v===null||v===undefined?"":String(v).trim().toUpperCase()}
  function num(v){
    if(v===null||v===undefined||v===""||typeof v==="boolean")return null;
    if(typeof v==="number")return Number.isFinite(v)?Math.round(v*100)/100:null;
    var n=Number(String(v).replace(/\s/g,"").replace(",","."));
    return Number.isFinite(n)?Math.round(n*100)/100:null
  }
  function rightNumber(row,col){
    for(var j=col+1;j<Math.min(row.length,col+5);j++){var v=num(row[j]);if(v!==null)return v}
    return null
  }
  function findLabelValue(rows,label,minRow,minCol){
    var target=norm(label),best=null;
    rows.forEach(function(row,r){
      if(r<(minRow||0))return;
      row.forEach(function(v,c){
        if(c<(minCol||0))return;
        if(norm(v)===target){var x=rightNumber(row,c);if(x!==null)best=x}
      })
    });
    return best
  }
  function parseSheet(rows,sheetName,year){
    var monthNumber=MONTHS[norm(sheetName)];
    if(!monthNumber)return null;
    var monthKey=year+"-"+String(monthNumber).padStart(2,"0");
    var budgets=[];
    rows.forEach(function(row){
      var name=norm(row[1]),amount=num(row[3]);
      if(BUDGET_NAMES.indexOf(name)!==-1&&amount!==null){
        budgets.push({name:name,planned:amount,status:row[4]==null?"":String(row[4]).trim()})
      }
    });

    var charges=[],group="Autres";
    rows.forEach(function(row){
      if(row[0]!==null&&row[0]!==undefined&&String(row[0]).trim()!=="")group=String(row[0]).trim();
      var label=row[1]==null?"":String(row[1]).trim(),amount=num(row[3]),status=row[4]==null?"":String(row[4]).trim(),nl=norm(label);
      if(label&&amount!==null&&BUDGET_NAMES.indexOf(nl)===-1&&nl!=="TOTAL"&&nl.indexOf("TOTAL OPTION")!==0){
        charges.push({group:group,label:label,amount:amount,status:status})
      }
    });

    var entries=[];
    SECTIONS.forEach(function(sec){
      var category=sec.start;
      rows.forEach(function(row){
        var label=row[sec.label]==null?"":String(row[sec.label]).trim();
        var amount=num(row[sec.amount]);
        var status=row[sec.status]==null?"":String(row[sec.status]).trim();
        var nl=norm(label);
        if(sec.switches[nl]&&amount===null){category=sec.switches[nl];return}
        if(!label||amount===null||["BUDGET","RESTE","TOTAL","RESULTATS","BASE"].indexOf(nl)!==-1||category==="RESULTATS")return;
        entries.push({
          type:category==="REVENUS"?"income":"expense",
          category:category,label:label,amount:amount,status:status,
          actual:/^ok\b/i.test(status)
        })
      })
    });

    var base=findLabelValue(rows,"BASE",0,0);
    var result=findLabelValue(rows,"RESTE",28,17);
    return{
      monthKey:monthKey,label:sheetName,base:base,budgets:budgets,plannedCharges:charges,entries:entries,
      excelTotals:{
        expenses:findLabelValue(rows,"TOTAL DÉPENSES",0,0) ?? findLabelValue(rows,"TOTAL DEPENSES",0,0),
        result:result,
        bankBalance:findLabelValue(rows,"SOLDE BANQUE",0,0),
        remainingToOut:findLabelValue(rows,"RESTE A SORTIR",0,0),
        realBalance:findLabelValue(rows,"SOLDE REEL",0,0)
      }
    }
  }
  function yearFromFile(file){
    var m=String(file&&file.name||"").match(/\b(20\d{2})\b/);
    return m?Number(m[1]):new Date().getFullYear()
  }
  async function parseExcelFile(file){
    if(!window.XLSX)throw new Error("Le module de lecture Excel n'est pas disponible. Recharge la page puis réessaie.");
    var data=await file.arrayBuffer(),book=XLSX.read(data,{type:"array",cellDates:true});
    var year=yearFromFile(file),months=[];
    book.SheetNames.forEach(function(name){
      if(!MONTHS[norm(name)])return;
      var rows=XLSX.utils.sheet_to_json(book.Sheets[name],{header:1,raw:true,defval:null});
      var parsed=parseSheet(rows,name,year);
      if(parsed)months.push(parsed)
    });
    months.sort(function(a,b){return a.monthKey.localeCompare(b.monthKey)});
    if(!months.length)throw new Error("Aucun onglet mensuel reconnu (JANVIER, FEVRIER, MARS…).");
    var verifiedDates=[];
    months.forEach(function(m){
      (m.plannedCharges||[]).forEach(function(c){var d=window.statusDate?statusDate(c.status,m.monthKey):null;if(d)verifiedDates.push(d)});
      (m.entries||[]).forEach(function(e){var d=window.statusDate?statusDate(e.status,m.monthKey):null;if(d)verifiedDates.push(d)})
    });
    verifiedDates.sort();
    return{
      format:"guiltanas-budget-excel-v1",
      source:file.name,
      year:year,
      currentMonthKey:months[months.length-1].monthKey,
      suggestedCheckedThrough:verifiedDates.length?verifiedDates[verifiedDates.length-1]:null,
      months:months,
      notes:"Import direct du classeur Excel effectué localement dans le navigateur."
    }
  }
  window.parseExcelFile=parseExcelFile;
})();