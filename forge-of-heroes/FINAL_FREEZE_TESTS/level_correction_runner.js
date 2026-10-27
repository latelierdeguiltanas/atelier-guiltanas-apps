'use strict';
const assert=require('assert/strict'),C=require('../progression/core.js').create(require('../progression/catalog.json')),records=require('./level3-fixtures.cjs');
for(const rec of records){assert.equal(C.canRevise(rec),false);assert.throws(()=>C.revise(rec,rec.levels[0].picks));const changed=C.clone(rec);changed.levels[0].picks=[];assert.throws(()=>C.validate(changed));}
console.log('PASS six N2 définitifs : correction et réécriture refusées ; accès N3 depuis la base acquise.');
