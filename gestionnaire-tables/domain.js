/* L'Atelier de Guiltanas — Gestionnaire de tables — moteur hors ligne v0.1
   Scénarios originaux seulement. Aucune dépendance envers le hub Bastide. */
(function(root){
'use strict';
const STORE='guiltanas.table-manager.v1';
const deepcopy=x=>JSON.parse(JSON.stringify(x));
const uid=()=>typeof crypto!=='undefined' && crypto.randomUUID?crypto.randomUUID():'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const iso=()=>new Date().toISOString();
const text=(value,max=250)=>String(value??'').trim().slice(0,max);
const first=(arr)=>Array.isArray(arr)?arr:[];
const scene=(v={},preserve=false)=>({id:preserve&&v.id?text(v.id,120):uid(),title:text(v.title||'Nouvelle scène',90),description:text(v.description||'',2500),gmNotes:text(v.gmNotes||'',4000),encounters:first(v.encounters).slice(0,20).map(e=>({id:preserve&&e.id?text(e.id,120):uid(),name:text(e.name||'Rencontre',100),notes:text(e.notes||'',500)}))});
const module=(v={},preserve=false)=>({id:preserve&&v.id?text(v.id,120):uid(),name:text(v.name||'Module sans nom',100),duration:Math.min(480,Math.max(15,Number(v.duration)||90)),summary:text(v.summary||'',800),scenes:first(v.scenes).slice(0,50).map(s=>scene(s,preserve))});
const originalTemplate={id:'original-phare-brumes-v1',name:'Le Phare des Brumes',category:'one-shot',system:'generic',copyright:'original',description:'Une aventure originale de démonstration, sans contenu sous licence.',modules:[{name:'La crique oubliée',duration:45,summary:'Les aventuriers trouvent une lettre et une barque brisée.',scenes:[{title:'L’appel de la côte',description:'La cloche d’un phare abandonné résonne alors que le vent est immobile.',gmNotes:'Laisser les joueurs décider de leur arrivée. Trois pistes possibles : un marin, un signal lumineux, des empreintes dans le sable.'},{title:'Traces sur la plage',description:'Une longue trace s’arrête face aux rochers.',gmNotes:'Un indice permet de localiser une entrée secondaire. Aucun jet obligatoire.'}]},{name:'Le phare silencieux',duration:75,summary:'Explorer les niveaux du phare et réparer son mécanisme.',scenes:[{title:'La porte de cuivre',description:'Une porte à trois inscriptions défend l’accès.',gmNotes:'Accepter des solutions créatives. La serrure n’est pas un passage obligé.'},{title:'Le gardien des brumes',description:'Une silhouette veille près du feu éteint.',gmNotes:'Rencontre sociale ou confrontation selon les choix.',encounters:[{name:'Le gardien',notes:'Définir les statistiques avec le système de jeu choisi.'}]}]}]};
function normalizedScenario(src,{preserveIds=false}={}){
 if(!src||typeof src!=='object'||Array.isArray(src))throw Error('Format de scénario incorrect.');
 const name=text(src.name,100); if(!name)throw Error('Le scénario doit avoir un nom.');
 if(first(src.modules).length>100)throw Error('Trop de modules.');
 return {id:preserveIds&&src.id?text(src.id,120):uid(),name,category:['one-shot','campaign','custom'].includes(src.category)?src.category:'custom',system:text(src.system||'generic',40),copyright:['original','external-personal-use','unknown'].includes(src.copyright)?src.copyright:'unknown',description:text(src.description||'',1500),modules:first(src.modules).map(m=>module(m,preserveIds)),createdAt:preserveIds&&src.createdAt?text(src.createdAt,50):iso()};
}
function seed(){return {version:1,scenarios:[normalizedScenario(originalTemplate)],tables:[],createdAt:iso(),updatedAt:iso()};}
function validateDb(raw){
 if(!raw||raw.version!==1||!Array.isArray(raw.scenarios)||!Array.isArray(raw.tables))throw Error('Sauvegarde incompatible.');
 if(raw.scenarios.length>250||raw.tables.length>200)throw Error('Sauvegarde trop volumineuse.');
 const scenarios=raw.scenarios.map(s=>normalizedScenario(s,{preserveIds:true}));
 const tables=raw.tables.map(t=>{
   const name=text(t.name,100);if(!name)throw Error('Table sans nom.');
   const sc=normalizedScenario(t.scenario||{name:'Scénario libre',modules:[]},{preserveIds:true});
   return {id:text(t.id,120)||uid(),name,system:text(t.system||'generic',40),scenario:sc,characters:first(t.characters).slice(0,200).map(c=>({id:text(c.id,120)||uid(),name:text(c.name,80),player:text(c.player,80),level:text(c.level,25),sheetUrl:/^https:\/\//i.test(c.sheetUrl||'')?text(c.sheetUrl,800):''})),sessions:first(t.sessions).slice(0,200).map(s=>({id:text(s.id,120)||uid(),title:text(s.title,120),date:text(s.date,20),status:['preparation','active','closed'].includes(s.status)?s.status:'preparation',notes:text(s.notes,8000)})),completedScenes:first(t.completedScenes).slice(0,600).map(x=>text(x,120)),notes:text(t.notes,8000),createdAt:text(t.createdAt,50)||iso(),updatedAt:text(t.updatedAt,50)||iso()};
 });
 const ids=new Set();for(const t of tables){if(ids.has(t.id))throw Error('Identifiants de table en doublon.');ids.add(t.id)}
 return {version:1,scenarios,tables,createdAt:text(raw.createdAt,50)||iso(),updatedAt:iso()};
}
function createTable(db,{name,system,scenarioId}){
 const sc=db.scenarios.find(x=>x.id===scenarioId);if(!sc)throw Error('Scénario introuvable.');
 const table={id:uid(),name:text(name,100),system:text(system||sc.system||'generic',40),scenario:normalizedScenario(sc),characters:[],sessions:[],completedScenes:[],notes:'',createdAt:iso(),updatedAt:iso()};
 if(!table.name)throw Error('Le nom de la table est obligatoire.'); db.tables.unshift(table);return table;
}
function duplicateTable(db,id){const src=db.tables.find(t=>t.id===id);if(!src)throw Error('Table introuvable.');const dest=deepcopy(src);dest.id=uid();dest.name=text(src.name+' — copie',100);dest.createdAt=dest.updatedAt=iso();dest.scenario.id=uid();dest.scenario.modules=dest.scenario.modules.map(m=>({...m,id:uid(),scenes:m.scenes.map(s=>({...s,id:uid(),encounters:s.encounters.map(e=>({...e,id:uid()}))}))}));dest.completedScenes=[];dest.sessions=[];dest.characters=src.characters.map(c=>({...c,id:uid()}));db.tables.unshift(dest);return dest;}
function addCharacter(table,v){const name=text(v.name,80);if(!name)throw Error('Nom du personnage obligatoire.');const link=text(v.sheetUrl||'',800);if(link&&!/^https:\/\//i.test(link))throw Error('Utilise une adresse HTTPS pour la fiche.');const character={id:uid(),name,player:text(v.player,80),level:text(v.level||'',25),sheetUrl:link};table.characters.push(character);table.updatedAt=iso();return character;}
function addSession(table,v){const s={id:uid(),title:text(v.title||'Séance '+(table.sessions.length+1),120),date:text(v.date||'',20),status:'preparation',notes:''};table.sessions.push(s);table.updatedAt=iso();return s;}
function exportScenario(table){return deepcopy({...table.scenario,source:'table-manager',exportType:'scenario'});}
function read(storage){try{const v=storage.getItem(STORE);return v?validateDb(JSON.parse(v)):seed();}catch(e){throw Error('Données locales illisibles : '+e.message+'. Fais une exportation de récupération avant toute réinitialisation.');}}
function persist(storage,db){const normalized=validateDb(db);storage.setItem(STORE,JSON.stringify(normalized));return normalized;}
root.TableDomain={STORE,uid,iso,deepcopy,seed,validateDb,normalizedScenario,createTable,duplicateTable,addCharacter,addSession,exportScenario,read,persist,module,scene};
})(typeof globalThis!=='undefined'?globalThis:this);