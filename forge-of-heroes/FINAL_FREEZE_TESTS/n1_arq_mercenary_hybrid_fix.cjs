'use strict';
/* COF2 Livre de base p65 + hybrid mastery p177.
 * Only patch the two precise clauses in the embedded N1 engine. Never alter
 * product database or any other weapon/shield behavior.
 * The Arquebusier Mercenaire in a hybrid no longer bans shields.
 * It does NOT itself train firearms. An independently trained secondary
 * class (at least 2 ranks in a class path) can still grant that mastery.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const files=['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html'];
const shieldBefore="if(shieldId&&rule.masteries.shields==='none')errors.push('Bouclier interdit par le profil.');";
const shieldAfter="const hybridEquipmentState=state?.hybrid||state?.__hybridEquipment||sticky?.hybrid||null;\n    const mercenaryHybridPath=[...(state?.voies?.profilePathIds||[]),...(sticky?.acquiredAbilities||[]).map(a=>a.pathId||a.path_id||'')].some(id=>/classpath:voie-du-mercenaire:class-(?:arquebusier|arbaletrier):/.test(String(id)));\n    const mercenaryHybridException=!!((hybridEquipmentState?.enabled||String(sticky?.profileId||'').startsWith('hybrid:'))&&mercenaryHybridPath);\n    if(shieldId&&rule.masteries.shields==='none'&&!mercenaryHybridException)errors.push('Bouclier interdit par le profil.');";
const weaponBefore="if(window.FOHPermanentRules.equipmentRules(state,dbObj).masteredWeaponIds.includes(w.id))mastered=true;if(!mastered)errors.push('Arme non maîtrisée par le profil : '+w.name+'.');";
const weaponAfter=`const permanentEquipment=window.FOHPermanentRules.equipmentRules(state,dbObj);
      if(permanentEquipment.masteredWeaponIds.includes(w.id))mastered=true;
      // Mercenaire hybride : aucune maîtrise de poudre GRATUITE (Livre de base p65).
      // La maîtrise provenant réellement d'un autre profil à au moins deux rangs
      // est préservée (Livre de base p177).
      if(mercenaryHybridException&&profile?.id==='class:arquebusier:cof2-lb-2024'&&(String(w.id).includes('powder')||w.technology==='powder')){
        const independent=(permanentEquipment.masteryProfiles||[]).some(id=>{
          if(id===profile.id)return false;
          const alt=Data.getProfileRule(id)?.masteries||{},mw=alt.weapons||{};
          if((alt.weaponIds||[]).includes(w.id))return true;
          return !!(mw.allRanged&&w.mode==='ranged'&&!(mw.forbiddenTechnology||[]).includes(w.technology)&&!(mw.forbiddenCategories||[]).includes(w.category));
        });
        if(!independent)mastered=false;
      }
      if(!mastered)errors.push('Arme non maîtrisée par le profil : '+w.name+'.');`;
const report={schema:'FOH_N1_MERCENAIRE_HYBRIDE_ENGINE_CORRECTION',at:new Date().toISOString(),source:['COF2 Livre de base p65 : exception mercenaire hybride','COF2 Livre de base p177 : maîtrise second profil à partir de deux rangs'],status:'PASS',changed:[],twoCasesOnly:true};
for(const file of files){
 const target=path.join(root,file),html=fs.readFileSync(target,'utf8');
 const engineAttr=html.indexOf('id="FOH_ENGINE_BUNDLE"'),start=engineAttr<0?-1:html.lastIndexOf('<script',engineAttr),close=start<0?-1:html.indexOf('>',engineAttr)+1,end=html.indexOf('</script>',close);
 if(start<0||close<0||end<0)throw Error('Engine bundle missing '+file);
 const engine=html.slice(close,end),dbAttr=html.indexOf('id="FOH_DB_JSON"'),dbStart=dbAttr<0?-1:html.lastIndexOf('<script',dbAttr);
 if(dbStart<0)throw Error('DB anchor missing');
 const beforeDb=html.slice(dbStart,html.indexOf('</script>',dbAttr)+9);
 const beforeMatches=[shieldBefore,weaponBefore].map(x=>engine.split(x).length-1);
 assert.deepEqual(beforeMatches,[1,1],file+' ambiguity or already installed: '+beforeMatches);
 const updatedEngine=engine.replace(shieldBefore,shieldAfter).replace(weaponBefore,weaponAfter);
 assert.equal(updatedEngine.length-engine.length,shieldAfter.length-shieldBefore.length+weaponAfter.length-weaponBefore.length);
 const updatedHtml=html.slice(0,close)+updatedEngine+html.slice(end);
 assert.equal(updatedHtml.slice(updatedHtml.lastIndexOf('<script',updatedHtml.indexOf('id="FOH_DB_JSON"')),updatedHtml.indexOf('</script>',updatedHtml.indexOf('id="FOH_DB_JSON"'))+9),beforeDb,'DB must not change');
 fs.writeFileSync(target,updatedHtml,'utf8');
 report.changed.push({file,beforeSha256:hash(html),afterSha256:hash(updatedHtml),engineBefore:hash(engine),engineAfter:hash(updatedEngine),dbSha256:hash(beforeDb),diffStatements:2});
}
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-mercenary-hybrid-fix.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,source:report.source,changed:report.changed.map(p=>({file:p.file,from:p.beforeSha256,to:p.afterSha256}))}));
