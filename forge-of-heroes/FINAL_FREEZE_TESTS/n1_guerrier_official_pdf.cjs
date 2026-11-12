'use strict';
// Private template is supplied as argv[2]; only result metadata belongs in git.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {load,standardState,withRank}=require('./forge_product_runner'),PDFLib=require('../progression/pdf-lib');
const root=path.resolve(__dirname,'..'),template=fs.readFileSync(process.argv[2]),out=process.argv[3]||'/tmp/foh-guerrier-official';fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function native(html){const box={window:{__FOH_PRODUCT__:{},__FOH_ENGINE__:{}},PDFLib,setTimeout,clearTimeout,Uint8Array,ArrayBuffer,crypto:crypto.webcrypto,document:{querySelector:s=>s==='#FOH_DB_JSON'?{textContent:html.match(/id="FOH_DB_JSON"[^>]*>([\s\S]*?)<\/script>/)[1]}:null},MutationObserver:class{observe(){}},requestAnimationFrame(){},console};vm.createContext(box);vm.runInContext(fs.readFileSync(root+'/progression/pdf-lib.js','utf8'),box);vm.runInContext(html.match(/<script id="FOH_COMPANION_V2">([\s\S]*?)<\/script>/)[1],box);vm.runInContext(html.match(/<script id="FORGE_OFFICIAL_PDF_EXPORT_FIX121">([\s\S]*?)<\/script>/)[1],box);return box.window.__FOH_OFFICIAL_PDF__;}

(async()=>{
 global.PDFLib=PDFLib;require('../progression/official-pdf-engine');
 const {html,db,engine}=load(root+'/index.html'),profile='class:guerrier:cof2-lb-2024';
 const apis={native:native(html),shared:global.FOHOfficialPDF.create({PDFLib,DB:require('../progression/pdf-labels.json')})};
 const exports=[];
 const paths=db.tables.paths_class.filter(p=>p.classId===profile&&p.group==='Base');
 assert.equal(paths.length,5);
 for(const route of paths){
  const state=withRank(db,standardState(db,profile,route.id),route.id,2);
  if(state.voies.profilePathIds.some(id=>id.includes('voie-du-maitre-d-armes')))state.profileChoices.preferredWeaponCategory='swords';
  const r=engine.computeCharacterN1(state);
  assert.deepEqual(JSON.parse(JSON.stringify(r.errors)),[]);
  r.sticky.equipment=[];
  for(const [key,api] of Object.entries(apis)){
   const data=await api.buildOfficialPdf(template,{state,s:r.sticky,d:{level:1,name:'QA Guerrier'}});
   const form=(await PDFLib.PDFDocument.load(data)).getForm();
   assert.equal(Number(form.getTextField('DEF').getText()),r.sticky.DEF);
   assert.equal(form.getTextField('PROFIL').getText(),'Guerrier');
   for(const [name,value] of Object.entries({'PV MAX':r.sticky.PV,INIT:r.sticky.INIT,PCmax:r.sticky.PC})){
    assert.equal(Number(form.getTextField(name).getText()),value);
   }
   const column=[1,2,3,4,5].find(i=>form.getTextField('VOIE'+i).getText()===route.label);
   assert(column);
   const annex=api.annexPaths(state,r.sticky,{type:'standard'}).find(p=>p.pathId===route.id);
   for(let rank=1;rank<=2;rank++){
    const source=db.tables.abilities_class.find(a=>a.path_id===route.id&&a.rank===rank);
    assert.equal(form.getTextField('Titre Rang '+rank+'_'+column).getText(),source.label.replace(/[‐‑—]/g,'-'));
    assert.equal(annex.rows.find(a=>a.rank===rank).desc,source.desc);
    const checkbox=[[19,22,25],[20,23,26],[21,24,27],[34,37,40],[35,38,41]][column-1][rank-1];
    assert(form.getCheckBox('undefined_'+checkbox).isChecked());
   }
   const file=route.id.split(':')[1]+'-'+key+'.pdf';
   fs.writeFileSync(path.join(out,file),data);
   const extraction=require('node:child_process').spawnSync('pdftotext',[path.join(out,file),'-'],{encoding:'utf8'});
   assert.equal(extraction.status,0,extraction.stderr);
   exports.push({path:route.label,defense:r.sticky.DEF,exporter:key,status:'PASS'});
  }
 }
 assert.equal(exports.length,10);
 const report={status:'PASS',indexSha256:sha(html),templateSha256:sha(template),exports};
 fs.writeFileSync(root+'/QA/N1/guerrier-official-pdf.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;});
