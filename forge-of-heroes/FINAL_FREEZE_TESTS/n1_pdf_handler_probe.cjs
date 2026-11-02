'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const terms=['async function importTemplate','function importTemplate','const importTemplate','function buildOfficialPdf','const buildOfficialPdf','async function buildOfficialPdf','Ce PDF sans champs','async function exportOfficial','function exportOfficial','const exportOfficial','Exporter la fiche officielle PDF','export-official','official-pdf','export-pdf','pdf-export','import-pdf','pdf-file','pdfjs','pdf-lib','Export PDF','__FOH_PDF'];
const report={terms:[],length:html.length};
for(const t of terms){const positions=[];let idx=-1;while((idx=html.indexOf(t,idx+1))>=0&&positions.length<7){positions.push({at:idx,near:html.slice(Math.max(0,idx-1700),Math.min(html.length,idx+6500))});}
 report.terms.push({term:t,positions});
}
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-pdf-handler-probe.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.terms.map(t=>({term:t.term,count:t.positions.length,first:t.positions[0]?.at}))));
