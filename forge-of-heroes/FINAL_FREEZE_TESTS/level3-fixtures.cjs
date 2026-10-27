'use strict';
const C=require('../progression/core.js').create(require('../progression/catalog.json')),seeds=require('../progression/bastide-seeds.json');
const chosen={prepotante:[['voie-du-spadassin',1],['voie-du-roublard',2]],scanlan:[['voie-de-l-escrime',1],['voie-de-l-escrime',2]],wilfried:[['voie-de-la-guerre-sainte',1],['voie-de-la-priere',1]],vivelame:[['voie-des-explosifs',1],['voie-des-explosifs',2]],zepheline:[['voie-de-l-envouteur',1],['voie-de-l-envouteur',2]],faelar:[['voie-de-l-archer',2],['voie-du-compagnon-animal',2]]};
module.exports=seeds.map(h=>{const rec=C.begin(h);return C.commit(rec,chosen[h.recovery.sourceId].map(([term,rank])=>({pathId:C.allowed(rec).find(p=>p.id.includes(term)).id,rank})));});
