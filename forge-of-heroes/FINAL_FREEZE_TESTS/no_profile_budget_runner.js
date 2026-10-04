'use strict';
const assert=require('assert/strict'),path=require('path');
const {load,standardState}=require('./forge_product_runner');
const {db,engine}=load(path.resolve(__dirname,'../index.html'));
const copy=x=>JSON.parse(JSON.stringify(x));
function state(age='mature'){
  const s=standardState(db,'class:barde:cof2-lb-2024');
  s.profileMode='NO_PROFILE';s.noProfile={enabled:true,pathIds:s.voies.profilePathIds.slice()};
  s.advancedRules.age=true;s.advancedRules.aLaCarte=true;
  s.age={categoryId:age,spending:[]};s.aLaCartePurchases=[];return s;
}
let count=0;
function test(name,run){run();count++;console.log('PASS',name);}
const run=s=>copy(engine.computeCharacterN1(s));
test('rank and card share the mature budget',()=>{
  const s=state();s.age.spending=[{pathId:s.voies.profilePathIds[0],rank:2}];s.aLaCartePurchases=[{type:'skill',skill:'Survie'}];
  const before=copy(s),r=run(s);assert.deepEqual(r.errors,[]);assert.deepEqual(s,before);
  assert.equal(r.sticky.capacityBudget.age.spent,1);assert.equal(r.sticky.aLaCarte.spent,1);assert.equal(r.sticky.aLaCarte.remaining,0);
});
test('cards alone can use the mature budget',()=>{
  const s=state();s.aLaCartePurchases=[{type:'skill',skill:'Survie'},{type:'skill',skill:'Médecine'}];assert.deepEqual(run(s).errors,[]);
});
test('duplicate ranks are rejected',()=>{
  const s=state();s.age.spending=Array(2).fill({pathId:s.voies.profilePathIds[0],rank:2});assert.match(run(s).errors.join(),/déjà possédée/);
});
test('rank 3 needs rank 2',()=>{
  const s=state('venerable');s.age.spending=[{pathId:s.voies.profilePathIds[0],rank:3},{pathId:s.voies.profilePathIds[1],rank:3}];assert.match(run(s).errors.join(),/rang précédent/);
});
test('rank 2 plus rank 3 plus card uses exactly four points',()=>{
  const s=state('venerable');s.age.spending=[2,3].map(rank=>({pathId:s.voies.profilePathIds[0],rank}));s.aLaCartePurchases=[{type:'skill',skill:'Survie'}];assert.deepEqual(run(s).errors,[]);
});
test('removing a card then buying another rank does not leave ghost points',()=>{
  const s=state();s.age.spending=[{pathId:s.voies.profilePathIds[0],rank:2}];s.aLaCartePurchases=[{type:'skill',skill:'Survie'}];const a=run(s);assert.deepEqual(a.errors,[]);
  s.aLaCartePurchases=[];assert.ok(run(s).errors.length);
  s.age.spending.push({pathId:s.voies.profilePathIds[1],rank:2});const b=run(s);assert.deepEqual(b.errors,[]);assert.equal(b.sticky.capacityBudget.age.spent,2);assert.equal(b.sticky.aLaCarte.spent,0);
  s.age.spending.pop();s.aLaCartePurchases=[{type:'skill',skill:'Survie'}];assert.deepEqual(copy(run(s)),copy(a));
});
test('extra card beyond the available budget is rejected',()=>{
  const s=state();s.age.spending=s.voies.profilePathIds.map(pathId=>({pathId,rank:2}));s.aLaCartePurchases=[{type:'skill',skill:'Survie'}];assert.ok(run(s).errors.length);
});
test('noninteger rank is rejected',()=>{
  const s=state('venerable');s.age.spending=[{pathId:s.voies.profilePathIds[0],rank:2.5}];assert.match(run(s).errors.join(),/rang illégal/);
});
console.log(count+' no-profile budget checks passed.');
