"use strict";
(function(){
  var MONTHS={
    "JANVIER":1,"FEVRIER":2,"FÉVRIER":2,"MARS":3,"AVRIL":4,"MAI":5,"JUIN":6,
    "JUILLET":7,"AOUT":8,"AOÛT":8,"SEPTEMBRE":9,"OCTOBRE":10,"NOVEMBRE":11,
    "DECEMBRE":12,"DÉCEMBRE":12
  };
  var BUDGET_NAMES=["COURSES","DIVERS","ENFANTS","TRAVAUX","NDF MATH","ESSENCE"];
  var LCL_SECTIONS=[
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
  function excelTotals(rows){
    return{
      expenses:findLabelValue(rows,"TOTAL DÉPENSES",0,0) ?? findLabelValue(rows,"TOTAL DEPENSES",0,0),
      result:findLabelValue(rows,"RESTE",25,0),
      bankBalance:findLabelValue(rows,"SOLDE BANQUE",0,0),
      remainingToOut:findLabelValue(rows,"RESTE A SORTIR",0,0),
      realBalance:findLabelValue(rows,"SOLDE REEL",0,0),
      difference:findLabelValue(rows,"ECART",0,0)
    }
  }
  function parseLclSheet(rows,sheetName,year){
    var monthNumber=MONTHS[norm(sheetName)];if(!monthNumber)return null;
    var monthKey=year+"-"+String(monthNumber).padStart(2,"0"),budgets=[];
    rows.forEach(function(row){
      var name=norm(row[1]),amount=num(row[3]);
      if(BUDGET_NAMES.indexOf(name)!==-1&&amount!==null)budgets.push({name:name,planned:amount,status:row[4]==null?"":String(row[4]).trim()})
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
    LCL_SECTIONS.forEach(function(sec){
      var category=sec.start;
      rows.forEach(function(row){
        var label=row[sec.label]==null?"":String(row[sec.label]).trim(),amount=num(row[sec.amount]),status=row[sec.status]==null?"":String(row[sec.status]).trim(),nl=norm(label);
        if(sec.switches[nl]&&amount===null){category=sec.switches[nl];return}
        if(!label||amount===null||["BUDGET","RESTE","TOTAL","RESULTATS","BASE"].indexOf(nl)!==-1||category==="RESULTATS")return;
        entries.push({type:category==="REVENUS"?"income":"expense",category:category,label:label,amount:amount,status:status,actual:/^ok\b/i.test(status)})
      })
    });
    return{monthKey:monthKey,label:sheetName,base:findLabelValue(rows,"BASE",0,0),budgets:budgets,plannedCharges:charges,entries:entries,excelTotals:excelTotals(rows)}
  }
  function parseCaSheet(rows,sheetName,year){
    var monthNumber=MONTHS[norm(sheetName)];if(!monthNumber)return null;
    var monthKey=year+"-"+String(monthNumber).padStart(2,"0"),charges=[],entries=[],group="Autres";
    rows.forEach(function(row){
      var groupCell=row[0]==null?"":String(row[0]).trim();
      if(groupCell)group=groupCell;
      var label=row[1]==null?"":String(row[1]).trim(),amount=num(row[3]),status=row[4]==null?"":String(row[4]).trim(),nl=norm(label);
      if(label&&amount!==null&&nl!=="TOTAL"&&nl!=="BASE"&&nl!=="RESTE"&&nl!=="TOTAL DÉPENSES"&&nl!=="TOTAL DEPENSES"){
        charges.push({group:group,label:label,amount:amount,status:status})
      }
      var incomeLabel=row[6]==null?"":String(row[6]).trim(),incomeAmount=num(row[8]),incomeStatus=row[9]==null?"":String(row[9]).trim(),ni=norm(incomeLabel);
      if(incomeLabel&&incomeAmount!==null&&["TOTAL","BASE","RESTE","TOTAL DÉPENSES","TOTAL DEPENSES","REMBOURSEMENTS MEDICAUX","AUTRES"].indexOf(ni)===-1){
        entries.push({type:"income",category:"REVENUS",label:incomeLabel,amount:incomeAmount,status:incomeStatus,actual:/^ok\b/i.test(incomeStatus)})
      }
    });
    return{monthKey:monthKey,label:sheetName,base:findLabelValue(rows,"BASE",0,0),budgets:[],plannedCharges:charges,entries:entries,excelTotals:excelTotals(rows)}
  }
  function parseDateSeed(text){
    var m=String(text||"").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if(!m)return null;var y=Number(m[3]);if(y<100)y+=2000;
    return{day:Number(m[1]),month:Number(m[2]),year:y}
  }
  function parseSavingsSheet(rows,sourceFile){
    if(!rows||rows.length<6)return[];
    var result=[],bank="",banks={};
    for(var col=1;col<=4;col++){
      var header=norm(rows[2]&&rows[2][col]);
      if(header==="CREDIT AGRICOLE")bank="Crédit Agricole";
      else if(header==="LCL")bank="LCL";
      if(bank)banks[col]=bank
    }
    var seed=parseDateSeed(rows[5]&&rows[5][0])||{day:14,month:11,year:2024};
    var balanceRow=-1;
    for(var r=6;r<rows.length;r++){if(norm(rows[r]&&rows[r][0])==="SOLDE"){balanceRow=r;break}}
    if(balanceRow<0)balanceRow=rows.length;
    var currentYear=seed.year,lastMonth=seed.month,rowDates={};
    for(var rr=6;rr<balanceRow;rr++){
      var txt=rows[rr]&&rows[rr][0]!=null?String(rows[rr][0]).trim():"",m=txt.match(/^\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
      if(!m)continue;
      var month=Number(m[2]),year=currentYear;
      if(m[3]){year=Number(m[3]);if(year<100)year+=2000}
      else if(month<lastMonth)year=currentYear+1;
      currentYear=year;lastMonth=month;
      rowDates[rr]=year+"-"+String(month).padStart(2,"0")+"-"+String(Number(m[1])).padStart(2,"0")
    }
    for(var c=1;c<=4;c++){
      var owner=rows[3]&&rows[3][c]!=null?String(rows[3][c]).trim():"",purpose=rows[4]&&rows[4][c]!=null?String(rows[4][c]).trim():"";
      if(!banks[c]&&!owner&&!purpose)continue;
      var tx=[];
      for(var row=6;row<balanceRow;row++){
        var amount=num(rows[row]&&rows[row][c]);if(amount===null)continue;
        var raw=rows[row]&&rows[row][0]!=null?String(rows[row][0]).trim():"";
        var label=raw.replace(/^\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*/,"").trim()||raw;
        tx.push({date:rowDates[row]||null,dateText:raw,label:label,amount:amount})
      }
      var currentBalance=balanceRow<rows.length?num(rows[balanceRow]&&rows[balanceRow][c]):null;
      var openingBalance=num(rows[5]&&rows[5][c]);
      result.push({
        sourceKey:"ca-epargne-col-"+c,
        sourceFile:sourceFile,sourceSheet:"EPARGNE",
        bank:banks[c]||"Autre",owner:owner||"",name:purpose||((owner||"Épargne")+" — "+(banks[c]||"")),
        purpose:purpose||"",balance:currentBalance===null?(openingBalance||0):currentBalance,target:0,
        openingBalance:openingBalance||0,openingDate:seed.year+"-"+String(seed.month).padStart(2,"0")+"-"+String(seed.day).padStart(2,"0"),
        transactions:tx
      })
    }
    return result
  }
  function yearFromFile(file){
    var m=String(file&&file.name||"").match(/\b(20\d{2})\b/);return m?Number(m[1]):new Date().getFullYear()
  }
  async function parseExcelFile(file){
    if(!window.XLSX)throw new Error("Le module de lecture Excel n'est pas disponible. Recharge la page puis réessaie.");
    var data=await file.arrayBuffer(),book=XLSX.read(data,{type:"array",cellDates:true}),year=yearFromFile(file),months=[];
    var firstMonthName=book.SheetNames.find(function(name){return !!MONTHS[norm(name)]}),firstRows=firstMonthName?XLSX.utils.sheet_to_json(book.Sheets[firstMonthName],{header:1,raw:true,defval:null}):[];
    var isCreditAgricole=!!book.Sheets["EPARGNE"]&&norm(firstRows[1]&&firstRows[1][6])==="REVENUS";
    book.SheetNames.forEach(function(name){
      if(!MONTHS[norm(name)])return;
      var rows=XLSX.utils.sheet_to_json(book.Sheets[name],{header:1,raw:true,defval:null});
      var parsed=isCreditAgricole?parseCaSheet(rows,name,year):parseLclSheet(rows,name,year);
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
    var savings=[];
    if(isCreditAgricole&&book.Sheets["EPARGNE"]){
      savings=parseSavingsSheet(XLSX.utils.sheet_to_json(book.Sheets["EPARGNE"],{header:1,raw:true,defval:null}),file.name)
    }
    var detectedModules=[];
    ["PRIME 2026","SUIVI REMBOURSEMENTS","ANNUEL"].forEach(function(name){if(book.Sheets[name])detectedModules.push(name)});
    return{
      format:"guiltanas-budget-excel-v2",
      workbookType:isCreditAgricole?"credit_agricole":"lcl",
      accountId:isCreditAgricole?"credit_agricole":"lcl",
      source:file.name,year:year,currentMonthKey:months[months.length-1].monthKey,
      suggestedCheckedThrough:verifiedDates.length?verifiedDates[verifiedDates.length-1]:null,
      months:months,savings:savings,detectedModules:detectedModules,
      notes:isCreditAgricole?"Import Crédit Agricole : compte courant + épargnes détectées.":"Import LCL : compte courant. Les lignes Epargne restent des sorties mensuelles, pas des livrets autonomes."
    }
  }
  window.parseExcelFile=parseExcelFile;
})();