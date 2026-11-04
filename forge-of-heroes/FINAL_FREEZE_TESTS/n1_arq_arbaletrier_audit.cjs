'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),catalog=require('../progression/catalog.json');
const {load}=require('./forge_product_runner');
const source={document:'COF2 Livre de base',printedPage:62,section:'POUDRE OU PAS POUDRE ?',
 requirements:[
 'Remplacer la pétoire par une arbalète de poing',
 'Remplacer le mousquet par une arbalète lourde',
 'Remplacer la couleuvrine par une baliste',
 'Retirer la voie des explosifs',
 'La remplacer par la voie du maître d’armes du Guerrier, limitée aux arbalètes',
 'Renommer le profil Arbalétrier'
 ]};
const orig='class:arquebusier:cof2-lb-2024',alt='class:arbaletrier:cof2-variant-2024';
const profileRows=catalog.profiles.filter(p=>p.id===orig||p.id===alt);
const mapped=catalog.paths.filter(p=>p.classId===alt||p.allowedClassIds?.includes(alt));
const warrior=catalog.paths.find(p=>p.id.includes('voie-du-maitre-d-armes')&&p.classId==='class:guerrier:cof2-lb-2024');
const products=[];
for(const file of ['index.html','FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html']){
 const {db,html}=load(path.join(root,file));
 const tables=db.tables;
 const appTerms=html.toLowerCase();
 const roots=[...tables.classes,...tables.paths_class,...tables.profile_rules];
 const fields=roots.filter(x=>/arbal[eé]trier|poudre ou pas poudre|powderless/i.test(JSON.stringify(x)));
 const formHints=[...new Set((appTerms.match(/arbal[eé]trier|poudre ou pas poudre|powderless/g)||[]))];
 products.push({file,profileAvailable:tables.classes.some(x=>x.id===alt||/arbal[eé]trier/i.test(x.label||'')),rulesForArbaletrier:tables.profile_rules.some(x=>/arbal[eé]trier/i.test(JSON.stringify(x))),pathsMappedToVariant:tables.paths_class.filter(p=>p.classId===alt).length,matchingRows:fields.length,applicationHasCompleteVariantLabel:formHints.some(x=>/arbal[eé]trier/.test(x)),sourceSha256:crypto.createHash('sha256').update(html).digest('hex')});
}
const report={schema:'FOH_N1_ARQUEBUSIER_ALT_SOURCE_GAP',generatedAt:new Date().toISOString(),source,expected:{mode:'ARBALETRIER',allowedPaths:5,explosivesRemoved:true,warriorCrossbowOnly:true},catalogue:{mainProfile:profileRows.some(p=>p.id===orig),alternateProfile:profileRows.some(p=>p.id===alt),alternatePaths:mapped.length,warriorMasterOfArmsPresent:!!warrior},products};
// The production creator owns variant rows; the progression catalogue is a separate scope.
const done=products.every(p=>p.profileAvailable&&p.rulesForArbaletrier&&p.pathsMappedToVariant===5);
report.verdict=done?'VARIANTE_DECLAREE_REQUIERT_CONTROLE_FONCTIONNEL':'VARIANTE_OFFICIELLE_NON_ENTIEREMENT_INTEGREE';
report.remaining=done?'Tester tous les choix, arbalètes, limitations et sorties PDF de la variante.':'Créer une configuration de l’Arbalétrier fidèle à la règle p.62 (5 voies dont maître d’armes limité aux arbalètes, sans explosifs, armes de remplacement), puis vérifier ses effets et sa fiche.';
fs.writeFileSync(path.join(root,'QA/N1/arquebusier-arbaletrier-source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({verdict:report.verdict,catalogue:report.catalogue,products:products.map(x=>({file:x.file,profileAvailable:x.profileAvailable,pathsMappedToVariant:x.pathsMappedToVariant}))}));
