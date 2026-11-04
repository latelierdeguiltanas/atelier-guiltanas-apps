'use strict';
// Private template is supplied as argv[2]; only result metadata belongs in git.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {load,standardState,withRank}=require('./forge_product_runner'),PDFLib=require('../progression/pdf-lib');
const root=path.resolve(__dirname,'..'),template=fs.readFileSync(process.argv[2]),out=process.argv[3]||'/tmp/foh-arq-official';fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function native(html){const box={window:{__FOH_PRODUCT__:{},__FOH_ENGINE__:{}},PDFLib,setTimeout,clearTimeout,Uint8Array,ArrayBuffer,crypto:crypto.webcrypto,document:{querySelector:s=>s==='#FOH_DB_JSON'?{textContent:html.match(/id="FOH_DB_JSON"[^>]*>([\s\S]*?)<\/script>/)[1]}:null},MutationObserver:class{observe(){}},requestAnimationFrame(){},console};vm.createContext(box);vm.runInContext(fs.readFileSync(root+'/progression/pdf-lib.js','utf8'),box);vm.runInContext(html.match(/<script id="FORGE_OFFICIAL_PDF_EXPORT_FIX121">([\s\S]*?)<\/script>/)[1],box);return box.window.__FOH_OFFICIAL_PDF__;}
const semantic={
 'tir-de-barrage-l':['20 m','DM ×2','fin de son tour','sans DM'],
 'poudre-puissante':['+10 m','+1','magiques','rang 5'],
 'combattant-aguerri':['DEF +1','R1','cuir','rôdeur'],
 'tir-double-l':['2 attaques','−2','Même cible','aucun malus'],
 'tir-precis':['19–20','18–20','rang 5']
};
const report={schema:'FOH_N1_ARQ_REAL_OFFICIAL_TEMPLATE',at:new Date().toISOString(),templateSha256:sha(template),sharedExporterSha256:sha(fs.readFileSync(root+'/progression/official-pdf-engine.js')),pdfLabelsSha256:sha(fs.readFileSync(root+'/progression/pdf-labels.json')),scope:'Humain vénérable, cinq voies de chaque variante et Doigts agiles avec/sans armure autorisée, entrée publiée index.html et exporteurs natif/partagé. Ne valide pas les clics, autres peuples ou historiques.',products:[],exports:[],failures:[],status:'PENDING'};
(async()=>{global.PDFLib=PDFLib;require('../progression/official-pdf-engine');
for(const file of ['index.html']){
 const {html,db,engine:E}=load(root+'/'+file),T=db.tables;report.products.push({file,sha256:sha(html)});
 const apis={native:native(html),shared:global.FOHOfficialPDF.create({PDFLib,DB:require('../progression/pdf-labels.json')})};
 for(const variant of ['arquebusier','arbaletrier']){
 const cls=T.classes.find(p=>p.id.includes('class:'+variant+':'));assert(cls);
 const paths=T.paths_class.filter(p=>p.classId===cls.id&&!p.additionalMagePath);assert.equal(paths.length,5);
 for(const sample of paths.flatMap(first=>first.id.includes('mercenaire')?[{first},{first,grant:true,armorDef:2},{first,grant:true,armorDef:3}]:[{first}])){const first=sample.first,state=withRank(db,standardState(db,cls.id,first.id),first.id,3);
 if(sample.grant){
  const grant=E.previewAcquiredAbilities(state).find(a=>a.id.includes('combattant-aguerri')),ability=T.abilities_class.find(a=>a.id.startsWith('ability:doigts-agiles:'));
  state.abilityChoices[grant.id]={combattantAguerriAbility:ability.id};
  state.equip={...state.equip,gmApprovedSwap:true,armorId:T.armors.find(a=>a.defBonus===sample.armorDef).id,weaponIds:['weapon:throwing-knives','weapon:dagger','weapon:long-sword',variant==='arquebusier'?'weapon:powder-pistol':'weapon:hand-crossbow']};
 }

 for(let n=0;n<4;n++)for(const a of E.previewAcquiredAbilities(state))for(const c of E.getPersistentChoicesForAbility(state,a.id)){
 const bag=state.abilityChoices[a.id]||(state.abilityChoices[a.id]={});
 if(sample.grant&&c.id==='repeatingWeapons'){bag[c.id]=[variant==='arquebusier'?'weapon:powder-pistol':'weapon:hand-crossbow'];}
 else if(c.id==='preferredWeaponCategory'){bag[c.id]=variant==='arbaletrier'?'crossbows':'swords';state.profileChoices[c.id]=bag[c.id];}
 else if(c.type==='boolean')bag[c.id]??=false;else if(c.type==='entity')bag[c.id]??={type:'animal',species:'chat',name:'Témoin'};else if(c.type==='weapon_multi')bag[c.id]??=c.options.slice(0,Math.max(1,c.min||1)).map(v=>v.id);else if(c.options?.length)bag[c.id]??=c.options[0].id;
 }
 const r=E.computeCharacterN1(state);assert.equal(r.errors.length,0,r.errors.join(' | '));
 for(const [exporter,api] of Object.entries(apis)){
 const tag=[file,variant,first.id,exporter,sample.grant?'doigts-'+sample.armorDef:'default'].join('|');
 try{const s=JSON.parse(JSON.stringify(r.sticky));s.equipment=[];const d={name:'Audit officiel '+cls.label,type:'standard'},projection={state,s,d},before=JSON.stringify(projection);
 const built=await api.buildOfficialPdf(template,projection),pdf=await PDFLib.PDFDocument.load(built),form=pdf.getForm();
 for(const [field,val] of Object.entries({'NIVEAU':1,'PV MAX':s.PV,DEF:s.DEF,INIT:s.INIT,'PM MAX':s.PM,PCmax:s.PC}))assert.equal(form.getTextField(field).getText(),String(val),field);
 assert.equal(form.getTextField('PROFIL').getText(),cls.label);
 if(sample.grant){
  const knifeColumn=[1,2,3].find(c=>(form.getTextField('ARME '+c).getText()||'').includes('Couteaux de lancer'));assert(knifeColumn,'Throwing knives missing from official sheet');
  assert.equal(form.getTextField('DM'+knifeColumn).getText(),sample.armorDef===2?'1d4+1':'1d4','Granted damage and armor restriction exported');
  const extra=api.annexPaths(state,s,d).find(p=>p.kind==='Capacité accordée'&&p.rows.some(a=>a.id.startsWith('ability:doigts-agiles:')));assert(extra&&extra.rows.length===1,'Only granted rank in supplementary annex');
 }

 const column=[1,2,3,4,5].find(c=>form.getTextField('VOIE'+c).getText()===first.label);assert(column,'Path title missing '+first.label);
 const annex=api.annexPaths(state,s,d).find(p=>p.pathId===first.id);assert(annex,'Path annex missing');
 for(let rank=1;rank<=3;rank++){
 const source=T.abilities_class.find(a=>a.path_id===first.id&&a.rank===rank),row=annex.rows.find(a=>a.rank===rank);
 assert(source&&row);assert.equal(row.desc,source.desc,'Full source annex differs');
 assert.equal(form.getTextField('Titre Rang '+rank+'_'+column).getText(),source.label);
 const body=rank===3&&column===2?'Rang 3__2':'Rang '+rank+'_'+column;
 const text=form.getTextField(body).getText();
 for(const token of semantic[source.id.split(':')[1]]||[])assert(text.includes(api.pdfSafeText(token)),'Résumé perd '+token+' : '+text);
 const checkbox=[[19,22,25],[20,23,26],[21,24,27],[34,37,40],[35,38,41]][column-1][rank-1];assert(form.getCheckBox('undefined_'+checkbox).isChecked(),'Acquired rank unchecked');
 }
 for(const f of form.getFields())for(const w of f.acroField.getWidgets())assert(w.getAppearances()?.normal,'Missing appearance '+f.getName());
 assert.equal(JSON.stringify(projection),before,'PDF exporter mutates character');
 const filename=[file==='index.html'?'index':'master',variant,first.id.split(':')[1],exporter,sample.grant?'doigts-'+sample.armorDef:'default'].join('-')+'.pdf';fs.writeFileSync(path.join(out,filename),built);
 report.exports.push({tag,filename,pages:pdf.getPageCount(),fields:form.getFields().length,path:first.label,rank:3,status:'PASS'});
 }catch(e){report.failures.push({tag,error:String(e.stack||e)});}
 }
 }
 }
}
report.status=report.exports.length===28&&!report.failures.length?'PASS':'FAIL';
fs.writeFileSync(root+'/QA/N1/arquebusier-official-template.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,exports:report.exports.length,failures:report.failures}).slice(0,7000));if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
