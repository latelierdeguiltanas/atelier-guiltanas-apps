'use strict';
const fs=require('fs'),path=require('path'),{load,standardState}=require('./forge_product_runner');
const root=path.resolve(__dirname,'..');const ids=['voie-de-l-artilleur','voie-des-explosifs','voie-du-mercenaire','voie-du-pistolero','voie-de-la-precision'];
const results={at:new Date().toISOString(),engineAPIs:[],cases:[]};
for(const file of ['index.html']){
 const {db,engine:E}=load(path.join(root,file)),T=db.tables,p='class:arquebusier:cof2-lb-2024';
 results.engineAPIs=Object.keys(E).filter(k=>/skill|effect|condition|context|combat|weapon|attack|ability|compute/i.test(k)).sort();
 for(const target of ids){
  const pick=T.paths_class.find(x=>x.classId===p&&x.id.split(':')[1]===target),second=T.paths_class.find(x=>x.classId===p&&x.id!==pick.id);
  const s=standardState(db,p,pick.id,'people:humain:cof2-lb-2024');
  s.voies.profilePathIds=[pick.id,second.id];const r=E.computeCharacterN1(s);
  const st=r.sticky||{};
  results.cases.push({file,path:target,errors:r.errors,keys:Object.keys(st),derived:st.characterState?.derived,skillBonuses:st.skillBonuses,skills:st.skills,permanentEffects:st.permanentEffects,conditionalEffects:st.conditionalEffects,passiveFeatures:st.passiveFeatures,contexts:st.contextualEffects,characterStateKeys:Object.keys(st.characterState||{}),effects:st.effects,acquired:(st.acquiredAbilities||[]).filter(a=>a.pathId===pick.id).map(a=>({label:a.label,mechanics:a.mechanics,calculationRules:a.calculationRules}))});
 }
}
const dest=path.join(root,'QA/N1/arquebusier-r1-probe.json');fs.writeFileSync(dest,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({engineAPIs:results.engineAPIs,sample:results.cases.slice(0,5).map(x=>({path:x.path,errors:x.errors,keys:x.keys,characterStateKeys:x.characterStateKeys,skillBonuses:x.skillBonuses,derivedKeys:Object.keys(x.derived||{})}))}));
