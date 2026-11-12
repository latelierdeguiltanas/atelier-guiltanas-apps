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
const scene=(v={},preserve=false)=>({id:preserve&&v.id?text(v.id,120):uid(),title:text(v.title||'Nouvelle scène',90),description:text(v.description||'',2500),gmNotes:text(v.gmNotes||'',4000),zoneId:text(v.zoneId||'',120),image_url:packUrl(v.image_url),encounters:first(v.encounters).slice(0,20).map(e=>({id:preserve&&e.id?text(e.id,120):uid(),name:text(e.name||'Rencontre',100),notes:text(e.notes||'',500)}))});
const module=(v={},preserve=false)=>({id:preserve&&v.id?text(v.id,120):uid(),name:text(v.name||'Module sans nom',100),duration:Math.min(480,Math.max(15,Number(v.duration)||90)),type:['act','chapter','zone','section'].includes(v.type)?v.type:'section',summary:text(v.summary||'',800),scenes:first(v.scenes).slice(0,50).map(s=>scene(s,preserve))});
const originalTemplate={id:'original-phare-brumes-v1',name:'Le Phare des Brumes',category:'one-shot',system:'generic',copyright:'original',description:'Une aventure originale de démonstration, sans contenu sous licence.',modules:[{name:'La crique oubliée',duration:45,summary:'Les aventuriers trouvent une lettre et une barque brisée.',scenes:[{title:'L’appel de la côte',description:'La cloche d’un phare abandonné résonne alors que le vent est immobile.',gmNotes:'Laisser les joueurs décider de leur arrivée. Trois pistes possibles : un marin, un signal lumineux, des empreintes dans le sable.'},{title:'Traces sur la plage',description:'Une longue trace s’arrête face aux rochers.',gmNotes:'Un indice permet de localiser une entrée secondaire. Aucun jet obligatoire.'}]},{name:'Le phare silencieux',duration:75,summary:'Explorer les niveaux du phare et réparer son mécanisme.',scenes:[{title:'La porte de cuivre',description:'Une porte à trois inscriptions défend l’accès.',gmNotes:'Accepter des solutions créatives. La serrure n’est pas un passage obligé.'},{title:'Le gardien des brumes',description:'Une silhouette veille près du feu éteint.',gmNotes:'Rencontre sociale ou confrontation selon les choix.',encounters:[{name:'Le gardien',notes:'Définir les statistiques avec le système de jeu choisi.'}]}]}]};
// Content pack: only scenario resources. Never store credentials, players or history.
const packText=(v,n=3000)=>String(v??'').slice(0,n);
const packUrl=v=>/^https:\/\//i.test(String(v||''))||/^mjmedia:\/\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpe?g|webp)$/i.test(String(v||''))?packText(v,1400):'';
function cleanPackAssets(raw){
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const safeObject=v=>{try{const t=JSON.stringify(v&&typeof v==='object'&&!Array.isArray(v)?v:{});return t.length<=12000?JSON.parse(t):{}}catch{return {}}};
 const clean=(x,type)=>{
  const base={id:packText(x?.id,130),name:packText(x?.name||x?.title,160),title:packText(x?.title||x?.name,160),category:packText(x?.category||x?.kind,90),description:packText(x?.description,8000),summary:packText(x?.summary,1500),image_url:packUrl(x?.image_url),zoneId:packText(x?.zoneId||x?.zone_id,120),tags:packText(x?.tags,250),sort_order:Number(x?.sort_order)||100};
  if(type==='shop')return {...base,base:packText(x?.base,160),price_silver:Math.max(0,Number(x?.price_silver)||0),stock:x?.stock==null?null:Math.max(0,Number(x.stock)||0),charges_max:Math.max(0,Number(x?.charges_max)||0),equipment:safeObject(x?.equipment)};
  if(type==='scenarioItems')return {...base,kind:packText(x?.kind,90),mechanical_base:packText(x?.mechanical_base,500),equipment:safeObject(x?.equipment)};
  if(type==='maps')return {...base,player_visible:!!x?.player_visible};
  return {...base,kind:packText(x?.kind,90),player_text:packText(x?.player_text,12000),mj_notes:packText(x?.mj_notes,12000),player_visible:!!x?.player_visible};
 };
 const result={areas:first(o.areas).slice(0,100).map(x=>({id:packText(x?.id,120)||uid(),name:packText(x?.name,120),description:packText(x?.description,3000),image_url:packUrl(x?.image_url)})),shop:first(o.shop).slice(0,300).map(x=>clean(x,'shop')),scenarioItems:first(o.scenarioItems).slice(0,800).map(x=>clean(x,'scenarioItems')),maps:first(o.maps).slice(0,250).map(x=>clean(x,'maps')),encounters:first(o.encounters).slice(0,500).map(x=>clean(x,'encounters')),combat:[],importedAt:packText(o.importedAt,50),source:packText(o.source,90)};
 // Combat templates keep only custom encounters/monsters; discard all parties, logs, fighters and player state.
 for(const c of first(o.combat).slice(0,100)){
  const monsters=safeObject(c?.monsters),encounters=safeObject(c?.encounters);
  result.combat.push({name:packText(c?.name,120),format:c?.format==='oneshot'?'oneshot':'campaign',monsters,encounters});
 }
 if(JSON.stringify(result).length>2400000)throw Error('Pack trop volumineux pour ce prototype local. Réduire les ressources avant import.');
 return result;
}

const TOOL_LIST=['scenario','combat','shop','players','soundboard','notes'];
function normalizeTools(raw,system='generic'){
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 return Object.fromEntries(TOOL_LIST.map(k=>[k,k in o?!!o[k]:(k==='scenario'||k==='notes'||(k==='combat'&&system==='COF2'))]));
}
function scenarioTemplate(kind='blank',system='generic',name='Mon scénario'){
 const shapes={
  acts:{category:'one-shot',modules:[
   {name:'Acte I — Mise en situation',type:'act',duration:45,summary:'Accroche, enjeu et premiers choix.',scenes:[{title:'Scène d’ouverture'},{title:'L’élément déclencheur'}]},
   {name:'Acte II — Obstacles et découvertes',type:'act',duration:60,summary:'Explorer, rencontrer, décider.',scenes:[{title:'Premier obstacle'},{title:'Rencontre déterminante'}]},
   {name:'Acte III — Dénouement',type:'act',duration:45,summary:'Résolution et conséquences.',scenes:[{title:'Confrontation ou choix final'},{title:'Épilogue'}]}]},
  chapters:{category:'campaign',modules:[
   {name:'Chapitre 1 — Introduction',type:'chapter',duration:90,scenes:[{title:'Départ de l’aventure'}]},
   {name:'Chapitre 2 — Développement',type:'chapter',duration:90,scenes:[{title:'Nouvelle piste'}]},
   {name:'Chapitre 3 — Conclusion',type:'chapter',duration:90,scenes:[{title:'Résolution'}]}]},
  zones:{category:'custom',modules:[{name:'Zone de départ',type:'zone',duration:90,scenes:[{title:'Point d’intérêt principal'}]}]},
  blank:{category:'custom',modules:[]}};
 const chosen=shapes[kind]||shapes.blank;
 return normalizedScenario({name,system,category:chosen.category,copyright:'original',
 description:'Trame originale et neutre : personnalisez les noms, lieux, rencontres et secrets.',modules:chosen.modules,assets:{areas:kind==='zones'?[{name:'Zone de départ',description:'Décrivez cette zone.'}]:[]}});
}
function normalizedScenario(src,{preserveIds=false}={}){
 if(!src||typeof src!=='object'||Array.isArray(src))throw Error('Format de scénario incorrect.');
 const name=text(src.name,100); if(!name)throw Error('Le scénario doit avoir un nom.');
 if(first(src.modules).length>100)throw Error('Trop de modules.');
 return {id:preserveIds&&src.id?text(src.id,120):uid(),name,category:['one-shot','campaign','custom'].includes(src.category)?src.category:'custom',system:text(src.system||'generic',40),copyright:['original','external-personal-use','unknown'].includes(src.copyright)?src.copyright:'unknown',description:text(src.description||'',1500),image_url:packUrl(src.image_url),assets:cleanPackAssets(src.assets),modules:first(src.modules).map(m=>module(m,preserveIds)),createdAt:preserveIds&&src.createdAt?text(src.createdAt,50):iso()};
}
function seed(){return {version:1,scenarios:[normalizedScenario(originalTemplate)],tables:[],createdAt:iso(),updatedAt:iso()};}
function validateDb(raw){
 if(!raw||raw.version!==1||!Array.isArray(raw.scenarios)||!Array.isArray(raw.tables))throw Error('Sauvegarde incompatible.');
 if(raw.scenarios.length>250||raw.tables.length>200)throw Error('Sauvegarde trop volumineuse.');
 const scenarios=raw.scenarios.map(s=>normalizedScenario(s,{preserveIds:true}));
 const tables=raw.tables.map(t=>{
   const name=text(t.name,100);if(!name)throw Error('Table sans nom.');
   const sc=normalizedScenario(t.scenario||{name:'Scénario libre',modules:[]},{preserveIds:true});
   return {id:text(t.id,120)||uid(),name,system:text(t.system||'generic',40),tools:normalizeTools(t.tools,t.system),playerMode:t.playerMode==='linked'?'linked':'solo',scenario:sc,characters:first(t.characters).slice(0,200).map(c=>({id:text(c.id,120)||uid(),name:text(c.name,80),player:text(c.player,80),level:text(c.level,25),sheetUrl:/^https:\/\//i.test(c.sheetUrl||'')?text(c.sheetUrl,800):''})),sessions:first(t.sessions).slice(0,200).map(s=>({id:text(s.id,120)||uid(),title:text(s.title,120),date:text(s.date,20),status:['preparation','active','closed'].includes(s.status)?s.status:'preparation',notes:text(s.notes,8000)})),completedScenes:first(t.completedScenes).slice(0,600).map(x=>text(x,120)),notes:text(t.notes,8000),createdAt:text(t.createdAt,50)||iso(),updatedAt:text(t.updatedAt,50)||iso()};
 });
 const ids=new Set();for(const t of tables){if(ids.has(t.id))throw Error('Identifiants de table en doublon.');ids.add(t.id)}
 return {version:1,scenarios,tables,createdAt:text(raw.createdAt,50)||iso(),updatedAt:iso()};
}
function createTable(db,{name,system,scenarioId,tools,playerMode}){
 const sc=db.scenarios.find(x=>x.id===scenarioId);if(!sc)throw Error('Scénario introuvable.');
 const table={id:uid(),name:text(name,100),system:text(system||sc.system||'generic',40),tools:normalizeTools(tools,system),playerMode:playerMode==='linked'?'linked':'solo',scenario:normalizedScenario(sc),characters:[],sessions:[],completedScenes:[],notes:'',createdAt:iso(),updatedAt:iso()};
 if(!table.name)throw Error('Le nom de la table est obligatoire.'); db.tables.unshift(table);return table;
}
function duplicateTable(db,id,{withoutCharacters=false}={}){const src=db.tables.find(t=>t.id===id);if(!src)throw Error('Table introuvable.');const dest=deepcopy(src);dest.id=uid();dest.name=text(src.name+' — copie',100);dest.createdAt=dest.updatedAt=iso();dest.scenario.id=uid();dest.scenario.modules=dest.scenario.modules.map(m=>({...m,id:uid(),scenes:m.scenes.map(s=>({...s,id:uid(),encounters:s.encounters.map(e=>({...e,id:uid()}))}))}));dest.completedScenes=[];dest.sessions=[];dest.characters=withoutCharacters?[]:src.characters.map(c=>({...c,id:uid()}));db.tables.unshift(dest);return dest;}
function addCharacter(table,v){const name=text(v.name,80);if(!name)throw Error('Nom du personnage obligatoire.');const link=text(v.sheetUrl||'',800);if(link&&!/^https:\/\//i.test(link))throw Error('Utilise une adresse HTTPS pour la fiche.');const character={id:uid(),name,player:text(v.player,80),level:text(v.level||'',25),sheetUrl:link};table.characters.push(character);table.updatedAt=iso();return character;}
function addSession(table,v){const s={id:uid(),title:text(v.title||'Séance '+(table.sessions.length+1),120),date:text(v.date||'',20),status:'preparation',notes:''};table.sessions.push(s);table.updatedAt=iso();return s;}
function exportScenario(table){return deepcopy({...table.scenario,source:'table-manager',exportType:'scenario'});}
function read(storage){try{const v=storage.getItem(STORE);return v?validateDb(JSON.parse(v)):seed();}catch(e){throw Error('Données locales illisibles : '+e.message+'. Fais une exportation de récupération avant toute réinitialisation.');}}
function persist(storage,db){const normalized=validateDb(db);storage.setItem(STORE,JSON.stringify(normalized));return normalized;}
root.TableDomain={STORE,uid,iso,deepcopy,seed,validateDb,normalizedScenario,cleanPackAssets,scenarioTemplate,normalizeTools,TOOL_LIST,createTable,duplicateTable,addCharacter,addSession,exportScenario,read,persist,module,scene};
})(typeof globalThis!=='undefined'?globalThis:this);