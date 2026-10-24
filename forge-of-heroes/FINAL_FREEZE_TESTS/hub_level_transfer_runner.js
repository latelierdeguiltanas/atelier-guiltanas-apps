'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{stripTypeScriptTypes}=require('node:module');
const dir=path.resolve(__dirname,'../progression'),factory=require(dir+'/core.js'),catalog=require(dir+'/catalog.json'),seeds=require(dir+'/bastide-seeds.json'),C=factory.create(catalog),clone=C.clone;
let handler,identity='player',activeId='',rows=new Map(),writes=0;
const db={from(table){let filters={};return{select(){return this},eq(k,v){filters[k]=v;return this},is(){return this},async maybeSingle(){return{data:table==='bastide_admin_tokens'?(identity==='admin'?{token_hash:'ok'}:null):table==='bastide_players'?(identity==='player'?{id:activeId}:null):rows.get(filters.player_id)||null}}}},async rpc(name,args){assert.equal(name,'bastide_character_level_save');const old=rows.get(args.p_player);if((old?.revision||0)!==args.p_revision)return{data:{conflict:true}};rows.set(args.p_player,{payload:clone(args.p_payload),revision:args.p_revision+1});writes++;return{data:{revision:args.p_revision+1}}}};
let source=fs.readFileSync(path.resolve(__dirname,'../../supabase/functions/bastide-character/index.ts'),'utf8').replace(/^import .*;$/gm,'');source=stripTypeScriptTypes(source);
const ctx={createClient:()=>db,catalog,FOHProgression:factory,Deno:{env:{get:()=>''},serve:fn=>handler=fn},Request,Response,URL,TextEncoder,crypto:require('node:crypto').webcrypto,console};vm.createContext(ctx);vm.runInContext(source,ctx);
async function request(id,body,token='fixture-token'){const r=await handler(new Request('https://fixture.test/?playerId='+id,{method:body?'POST':'GET',headers:{'x-bastide-key':token},body:body?JSON.stringify(body):undefined}));return{status:r.status,data:await r.json()}}
function plan(seed){const rec=C.begin(seed);for(const p of C.allowed(rec))for(const q of C.allowed(rec)){const a={pathId:p.id,rank:C.rank(rec.head,p.id)+1},b={pathId:q.id,rank:C.rank(rec.head,q.id)+1};if(p.id===q.id)b.rank++;try{return C.commit(rec,[a,b])}catch{}}throw Error('No plan for '+seed.name)}
(async()=>{
assert.equal((await request('scanlan',null,'')).status,401);
for(const h of seeds){
 const id=h.recovery.sourceId;activeId=id;identity='player';const rec=plan(h),out=C.exportHub(rec);
 assert.equal(out.character.level,2);assert.equal(out.character.id,id);
 assert.deepEqual(out.character.combat,rec.head.combat);
 assert.deepEqual(out.character.equipment,rec.head.equipment);
 for(const p of C.allowed(rec)){const cp=out.character.paths.find(a=>a.pathId===p.id);assert.ok(cp);assert.equal(cp.kind,p.kind);assert.equal(cp.ranks.length,p.ranks.length);for(const a of cp.ranks)assert.equal(a.text,C.flavour({id,paths:[{pathId:p.id,name:p.name,ranks:[C.clone(C.ability(p.id,a.rank))]}]}).paths[0].ranks[0].text);}
 const post=await request(id,{transfer:out,revision:0});assert.equal(post.status,200,JSON.stringify(post));assert.deepEqual(post.data.character,out.character);
 const get=await request(id);assert.deepEqual(get.data.character,out.character);assert.equal(get.data.revision,1);
 const repeat=await request(id,{transfer:out,revision:1});assert.equal(repeat.data.unchanged,true);
 const bad=clone(out);bad.character.combat.pvMax++;assert.equal((await request(id,{transfer:bad,revision:1})).status,400);
 assert.equal((await request(seeds.find(s=>s.recovery.sourceId!==id).recovery.sourceId,{transfer:out,revision:0})).status,403);
 console.log('PASS '+h.name+' / level 2 export → server replay → import → reload; altered/wrong hero refused');
}
assert.equal(writes,6);
for(const h of seeds){activeId=h.recovery.sourceId;const old=rows.get(activeId).payload.progression,changed=C.revise(old,old.levels[0].picks),out=C.exportHub(changed),response=await request(activeId,{transfer:out,revision:1});assert.equal(response.status,200);assert.equal((await request(activeId)).data.progression.correctionVersion,1);assert.equal(response.data.character.combat.pvMax,old.head.combat.pvMax);}
assert.equal(writes,12);console.log('PASS six corrected N2 imports keep PV and are returned for another device');
identity='admin';assert.equal((await request('scanlan')).status,200);assert.equal((await request('unknown')).status,403);
const r=plan(seeds[0]),old=clone(r);for(const p of old.head.paths)for(const a of p.ranks)a.text='Ancien résumé';assert.equal(C.validate(old),true);assert.ok(old.head.paths.some(p=>p.ranks.some(a=>a.text!=='Ancien résumé')));
console.log('PASS repeated imports do not apply gains twice; admin access restricted to six IDs; old descriptions refresh without numerical changes');
})().catch(e=>{console.error(e);process.exitCode=1});
