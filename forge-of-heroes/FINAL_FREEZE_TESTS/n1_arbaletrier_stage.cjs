'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),{load}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');
const prototype=fs.readFileSync(path.join(__dirname,'n1_arbaletrier_proto.cjs'),'utf8');
const segment=prototype.slice(prototype.indexOf('function inject(db){'),prototype.indexOf('\nfor(const file of ['));
if(!segment.startsWith('function inject(db)')||segment.length<900)throw Error('Prototype implementation no longer extractable');
const context={clone:x=>JSON.parse(JSON.stringify(x)),srcClass:'class:arquebusier:cof2-lb-2024',altClass:'class:arbaletrier:cof2-variant-2024',oldWar:'classpath:voie-du-maitre-d-armes:class-guerrier:cof2-lb-2024'};
vm.createContext(context);vm.runInContext(segment+';this.installArbaletrier=inject;',context);
function rewriteEngine(bundle){
 const substitutions=[
  ["rows.push({id:'preferredWeaponCategory',type:'preferred_weapon_category',sourceMechanic:'legacy.requiresChoice',required:true,persist:true,values:['swords','axes','maces','spears','thrown']})",
   "rows.push({id:'preferredWeaponCategory',type:'preferred_weapon_category',sourceMechanic:'legacy.requiresChoice',required:true,persist:true,values:ability.path_id?.includes(':class-arbaletrier:')?['crossbows']:['swords','axes','maces','spears','thrown']})"],
  ["if(c.type==='preferred_weapon_category')return[{id:'swords',label:'Épées'},{id:'axes',label:'Haches'},{id:'maces',label:'Masses'},{id:'spears',label:'Lances'},{id:'thrown',label:'Armes de jet'}]",
   "if(c.type==='preferred_weapon_category')return String(abilityId).includes(':class-arbaletrier:')?[{id:'crossbows',label:'Arbalètes'}]:[{id:'swords',label:'Épées'},{id:'axes',label:'Haches'},{id:'maces',label:'Masses'},{id:'spears',label:'Lances'},{id:'thrown',label:'Armes de jet'}]"],
  ["pred=pref&&w.preferredCategory===pref?1:0",
   "pred=pref&&(w.preferredCategory===pref||(pref==='crossbows'&&w.category==='crossbow'))?1:0"],
  ["if(p==='voie-de-la-precision'&&r===3)rules.push({kind:'critical',match:'ranged',amount:'RANG>=5?2:1'});",
   "if(p==='voie-du-maitre-d-armes'&&String(a.path_id).includes(':class-arbaletrier:')&&r===2)rules.push({kind:'critical',match:'crossbow',amount:'1'});if(p==='voie-du-maitre-d-armes'&&String(a.path_id).includes(':class-arbaletrier:')&&r===3)rules.push({kind:'weapon_bonus',match:'crossbow',damage:'1'});if(p==='voie-de-la-precision'&&r===3)rules.push({kind:'critical',match:'ranged',amount:'RANG>=5?2:1'});"],
  ["if(type==='crossbow_powder')return","if(type==='crossbow')return w.category==='crossbow';if(type==='crossbow_powder')return"]
 ];
 for(const [before,after]of substitutions){const n=bundle.split(before).length-1;if(n!==1)throw Error('Engine substitution ambiguous '+n+': '+before.slice(0,55));bundle=bundle.replace(before,after)}
 return bundle;
}
function replaceScript(html,id,transform){
 const re=new RegExp('(<script[^>]*id=["\\x27]'+id+'["\\x27][^>]*>)([\\s\\S]*?)(<\\/script>)');
 let occurred=0;
 html=html.replace(re,(_match,opening,body,closing)=>{occurred++;return opening+transform(body)+closing});
 if(occurred!==1)throw Error(id+' missing or duplicated');
 return html;
}
function linkAssets(){
 const base=process.env.FOH_STAGE_DIR||'/tmp/foh-n1-arbaletrier-stage';const destRoot=path.join(base,'forge-of-heroes');fs.mkdirSync(destRoot,{recursive:true});
 for(const name of fs.readdirSync(path.resolve(root,'..'))){if(name==='forge-of-heroes'||name==='.git'||name==='node_modules')continue;const target=path.join(base,name);if(!fs.existsSync(target))fs.symlinkSync(path.resolve(root,'..',name),target);}
 for(const name of fs.readdirSync(root)){
  if(name==='index.html'||name==='index.html')continue;
  const dest=path.join(destRoot,name);if(!fs.existsSync(dest))fs.symlinkSync(path.join(root,name),dest);
 }
}
function stage(file){
 const p=path.join(root,file),{html,db}=load(p);
 if(db.tables.classes.some(c=>c.id==='class:arbaletrier:cof2-variant-2024'))throw Error('Already integrated; refuses double patch');
 const result=context.installArbaletrier(db);
 if(result.paths.length!==5)throw Error('Five paths required');
 let updated=replaceScript(html,'FOH_DB_JSON',()=>JSON.stringify(db));
 updated=replaceScript(updated,'FOH_ENGINE_BUNDLE',rewriteEngine);
 const dest=path.join(process.env.FOH_STAGE_DIR||'/tmp/foh-n1-arbaletrier-stage','forge-of-heroes',file);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,updated);
 const phrase='native-play-sheet',posOld=html.indexOf(phrase),posNew=updated.indexOf(phrase);
 console.log(JSON.stringify({probe:file,staticNativeOld:posOld>=0,staticNativeNew:posNew>=0,oldSnippet:posOld>=0?html.slice(Math.max(0,posOld-420),posOld+420):null,newSnippet:posNew>=0?updated.slice(Math.max(0,posNew-420),posNew+420):null,oldNativeCount:html.split(phrase).length-1,newNativeCount:updated.split(phrase).length-1}));
 const staged=load(dest);
 assert.equal(staged.db.tables.classes.filter(c=>c.id==='class:arbaletrier:cof2-variant-2024').length,1);
 assert.equal(staged.db.tables.paths_class.filter(p=>p.classId==='class:arbaletrier:cof2-variant-2024').length,5);
 // Existing people, normal classes and official source paths not modified
 const orig=db.tables.classes.filter(c=>c.id!=='class:arbaletrier:cof2-variant-2024').map(c=>c.id);
 assert.equal(orig.length,17);return {file,bytesBefore:Buffer.byteLength(html),bytesAfter:Buffer.byteLength(updated),path:dest};
}
linkAssets();const out=['index.html'].map(stage);
console.log(JSON.stringify({status:'STAGED_ONLY',files:out}));
