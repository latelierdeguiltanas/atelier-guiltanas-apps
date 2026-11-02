'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..'),stageBase=process.env.FOH_STAGE_DIR||'/tmp/foh-n1-arbaletrier-stage';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const click=read(path.resolve(process.cwd(),'arbaletrier-stage-click.json'));
const browser=read(path.resolve(process.cwd(),'forge-n1-stage-existing-journeys.json'));
const prototype=read(path.join(root,'QA/N1/arbaletrier-virtual-prototype.json'));
assert.equal(click.status,'PASS','Arbalétrier failed real Chrome click');
assert.equal(browser.length,12,'All existing 12 journeys must run');
assert.ok(browser.every(x=>x.status==='PASS'),'A pre-existing character journey failed: '+JSON.stringify(browser.filter(x=>x.status!=='PASS')));
assert.deepEqual([prototype.matrix.total,prototype.matrix.passed,prototype.matrix.failed],[480,480,0],'Full race/path/age prototype missing');
const sourceFiles=['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'];
const products=[];
for(const name of sourceFiles){
 const orig=load(path.join(root,name)),staged=load(path.join(stageBase,'forge-of-heroes',name));
 const tbl=staged.db.tables,profiles=tbl.classes.filter(c=>c.id==='class:arbaletrier:cof2-variant-2024'),paths=tbl.paths_class.filter(p=>p.classId===profiles[0]?.id);
 assert.equal(profiles.length,1);assert.equal(paths.length,5);
 assert.equal(orig.db.tables.classes.length+1,staged.db.tables.classes.length);
 assert.equal(orig.db.tables.paths_class.length+5,staged.db.tables.paths_class.length);
 assert.equal(orig.db.tables.abilities_class.length+25,staged.db.tables.abilities_class.length);
 const s=standardState(staged.db,'class:arbaletrier:cof2-variant-2024',paths[4].id);
 s.profileChoices.preferredWeaponCategory='crossbows';
 const r=staged.engine.computeCharacterN1(s);
 assert.ok(r.errors.every(e=>!e.includes('profil')),'Cannot create variant '+r.errors.join(';'));
 // Warrior is deliberately *not* allowed to choose a crossbow as his favourite weapon.
 const warriorPath=tbl.paths_class.find(p=>p.classId==='class:guerrier:cof2-lb-2024'&&p.id.includes('voie-du-maitre-d-armes'));
 const warrior=standardState(staged.db,'class:guerrier:cof2-lb-2024',warriorPath.id);
 warrior.profileChoices.preferredWeaponCategory='crossbows';
 assert.ok(staged.engine.computeCharacterN1(warrior).errors.some(e=>/prédilection|illégale|autorisée/i.test(e)),'Crossbows incorrectly allowed for a regular warrior');
 products.push({name,sha256:hash(staged.html),size:Buffer.byteLength(staged.html)});
}
let src=fs.readFileSync(path.join(root,'rules/permanent-rules.js'),'utf8');
const replace=(old,repl)=>{assert.equal(src.split(old).length-1,1,'Rule anchor ambiguous: '+old.slice(0,64));src=src.replace(old,repl)};
replace("if(p==='voie-de-la-precision'&&r===3)rules.push({kind:'critical',match:'ranged',amount:'RANG>=5?2:1'});",
"if(p==='voie-du-maitre-d-armes'&&String(a.path_id).includes(':class-arbaletrier:')&&r===2)rules.push({kind:'critical',match:'crossbow',amount:'1'});if(p==='voie-du-maitre-d-armes'&&String(a.path_id).includes(':class-arbaletrier:')&&r===3)rules.push({kind:'weapon_bonus',match:'crossbow',damage:'1'});if(p==='voie-de-la-precision'&&r===3)rules.push({kind:'critical',match:'ranged',amount:'RANG>=5?2:1'});");
replace("if(type==='crossbow_powder')return","if(type==='crossbow')return w.category==='crossbow';if(type==='crossbow_powder')return");
for(const name of sourceFiles)fs.copyFileSync(path.join(stageBase,'forge-of-heroes',name),path.join(root,name));
fs.writeFileSync(path.join(root,'rules/permanent-rules.js'),src);
const release={
 schema:'FOH_N1_ARBALETRIER_DEPLOYMENT',
 status:'INTEGRATED_NOT_CERTIFIED_FULL',
 generatedAt:new Date().toISOString(),
 scope:'Official COF2 Arbalétrier variant p.62 for pure N1; no changes to the 14 original profiles.',
 mainProfil:'Arquebusier',
 visibleVariant:'Arbalétrier',
 sourceRules:'Replace powder weapons by corresponding crossbows; replace explosives path with warrior master of arms restricted to crossbows; 5 pathways total',
 validation:{realMobileCreation:click.status,nonRegressionJourneys:browser.length,variantRules:prototype.matrix.passed+'/'+prototype.matrix.total,warriorCrossbowRejection:true,officialPDF:'UNVERIFIED',allConditionalEffects:'UNVERIFIED'},
 sourceFiles:products,
 sourceHashSha256:hash(src),
 globalN1Certified:false
};
fs.writeFileSync(path.join(root,'QA/N1/arbaletrier-production-release.json'),JSON.stringify(release,null,2)+'\n');
console.log(JSON.stringify({status:release.status,products,validated:release.validation}));
