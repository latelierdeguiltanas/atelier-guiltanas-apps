const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/../../',sql=fs.readFileSync(root+'supabase/bastide_fire_scales_20261109.sql','utf8');
const pattern=/\('([^']*)','([^']*)','([^']*)','([^']*)','([^']*)',\s*'([^']*)','([^']*)'::jsonb,(\d+),\s*'([^']*)'\)/g;
const rows=process.env.FIRE_SCALES_ROWS?JSON.parse(fs.readFileSync(process.env.FIRE_SCALES_ROWS,'utf8')):[...sql.matchAll(pattern)].map(m=>({id:m[1],title:m[2],category:m[3],mechanical_base:m[5],equipment:{slot:m[6],bonuses:JSON.parse(m[7]),effect:m[9]},description:m[9],kind:'object',player_description:''}));
assert.equal(rows.length,6);assert.equal(new Set(rows.map(r=>r.id)).size,6);
assert.deepEqual([...sql.matchAll(/(?:insert into|update|delete from)\s+public\.(\w+)/gi)].map(m=>m[1]),['bastide_scenario_items']);
const api=fs.readFileSync(root+'supabase/functions/bastide-inventory/index.ts','utf8');
const cleaner=api.slice(api.indexOf('const cleanEquipment='),api.indexOf('const cleanItem=')).replace(/:any/g,'').replace(/ as Record<string,string>/g,'');
const page=fs.readFileSync(root+'ile-aux-tempetes-bastide/mj/outils/inventaires/index.html','utf8');
const app=page.match(/<script>\s*(\(\(\)=>\{const A=[\s\S]*?)<\/script>/)[1];
const handler=app.split('\n').find(l=>l.startsWith('document.onclick='));
assert.ok(page.indexOf('src="../../../assets/scenario-delivery.js?')<page.indexOf('(()=>{const A='));
const doc={};let confirms=0,apiCalls=0;
const w={window:{},document:doc,CSS:{escape:x=>x},confirm:()=>{confirms++;return false;},$:()=>({value:'mj-test'}),data:{players:[{id:'mj-test',display_name:'Test local'}],scenario:rows},A:{call(){apiCalls++;throw Error('Appel réseau interdit');}},setStatus:x=>{throw Error(x);}};
doc.querySelector=()=>null;
vm.createContext(w);
vm.runInContext(cleaner+'\nglobalThis.cleanEquipment=cleanEquipment;',w);
vm.runInContext(fs.readFileSync(root+'ile-aux-tempetes-bastide/assets/scenario-delivery.js','utf8'),w);
vm.runInContext(handler,w);
(async()=>{
 for(const row of rows){
  assert.ok(row.equipment.effect.length<=500);
  await doc.onclick({target:{closest:()=>({dataset:{sendScenario:row.id}})}});
  const sent=w.window.BastideScenarioDelivery(row);
  assert.equal(sent.equipped,false);assert.equal(sent.quantity,1);
  const cleaned=w.cleanEquipment(sent.equipment);
  assert.equal(cleaned.slot,row.equipment.slot);assert.equal(cleaned.effect,row.equipment.effect);
  assert.equal(JSON.stringify(cleaned.bonuses||{}),JSON.stringify(row.equipment.bonuses));
  assert.ok(!JSON.stringify(sent).includes('Destinataire envisagé'));
  assert.notEqual(sent.equipment,row.equipment);
 }
 assert.equal(confirms,6);assert.equal(apiCalls,0);
 const sheet=fs.readFileSync(root+'ile-aux-tempetes-bastide/personnages/fiche.js','utf8');
 const combat=sheet.slice(sheet.indexOf('function combatNow(){'),sheet.indexOf('\n',sheet.indexOf('function combatNow(){')));
 const shield=rows.find(r=>r.equipment.slot==='shield');
 const state={inventory:[]};Object.assign(w,{S:state,D:{combat:{def:15},paths:[],stats:{}},startingProtection:()=>({armor:0,shield:1}),equippedItems:()=>state.inventory.filter(i=>i.equipped),activeModifiers:()=>({tests:0,attacks:0,def:0,init:0})});
 vm.runInContext(combat,w);
 for(const row of rows.filter(r=>r!==shield)){state.inventory=[{...row,equipped:true}];assert.equal(w.combatNow().def,15);}
 state.inventory=[{...shield,equipped:true}];assert.equal(w.combatNow().def,15,'le nouveau petit bouclier remplace le bonus initial');
 state.inventory[0].equipped=false;assert.equal(w.combatNow().def,14,'ranger le bouclier retire la protection');
 assert.deepEqual(shield.equipment.bonuses,{shieldDef:1});
 const hidden=w.window.BastideScenarioDelivery({...shield,player_description:'Un bouclier mystérieux.'});
 assert.equal(JSON.stringify(hidden.equipment),'{}');assert.ok(!hidden.notes.includes('Refuge'));
 console.log('PASS six objets, six préparations annulées avant API, équipement et bouclier sans double comptage.');
})().catch(e=>{console.error(e);process.exitCode=1});
