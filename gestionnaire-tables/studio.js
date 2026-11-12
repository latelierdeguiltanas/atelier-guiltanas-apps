/* L'Atelier de Guiltanas — Studio de campagne modulaire, sans systeme impose.
   Aucune ecriture vers les API historiques Bastide. */
(function(){
'use strict';
const A=window.TableManagerAPI,D=window.TableDomain;
if(!A||!D)return;
const ROOT='https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/';
const BUCKET='guiltanas-mj-media';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const safeUri=v=>/^https:\/\//i.test(String(v||''))?String(v).slice(0,1400):'';
const keys=['areas','maps','encounters','scenarioItems','shop'];
const title={areas:'Zones & lieux',maps:'Cartes',encounters:'PNJ & rencontres',scenarioItems:'Objets de quête',shop:'Boutique'};
const singular={areas:'zone',maps:'carte',encounters:'PNJ / rencontre',scenarioItems:'objet',shop:'article'};
const shortcuts=[['scenario','Scénario','Chapitres, scènes et secrets','book-open'],
 ['combat','Combat','Initiative, rencontres, effets','swords'],
 ['shop','Boutique','Catalogue et stocks','shopping-bag'],
 ['players','Personnages','Fiches et joueurs facultatifs','users'],
 ['soundboard','Ambiance sonore','Soundboard autonome','music'],
 ['notes','Carnet MJ','Séances et notes privées','notebook-pen']];
let currentTab='scenes',search='',zone='all',editing=null,lastOuterTab='',lastTableId='';
const client=()=>window.MJAccount?.client;
const current=()=>A.selectedTable();
const assets=t=>{if(!t.scenario.assets)t.scenario.assets=D.cleanPackAssets({});return t.scenario.assets};
const onlyVisible=type=>type==='shop'?(current()?.tools?.shop!==false):true;
function makeArea(name,description=''){return {id:D.uid(),name,description,image_url:''};}
function organize(scenario){
 if(!scenario?.assets)return scenario;
 const a=scenario.assets;
 if(a.areas?.length)return scenario;
 const areas=[
  makeArea('Le Repos du Dragon','Refuge, habitants et vie du village'),
  makeArea('La côte et l’épave','Arrivée, rivage et premières découvertes'),
  makeArea('Les grottes de Poussemer','Exploration et créatures des grottes'),
  makeArea('L’observatoire de la Falaise','Site et préparations de l’observatoire'),
  makeArea('Autres lieux','Éléments sans zone encore définie')
 ];
 a.areas=areas;
 const classify=o=>{
  const txt=((o.name||'')+' '+(o.title||'')+' '+(o.summary||'')+' '+(o.description||'')).toLocaleLowerCase('fr');
  if(/poussemer|grotte|myconide|spore|champignon|morille|cristal|thallophyte/.test(txt))return areas[2].id;
  if(/observatoire|falaise/.test(txt))return areas[3].id;
  if(/épave|bateau|naufrag|lettre|plage|rivage|crique/.test(txt))return areas[1].id;
  if(/repos du dragon|runara|kobold|mila|myla|aga|blepp|frub|kilnip|laylee|mumpo|rix|zark|tarak|varnoth/.test(txt))return areas[0].id;
  return areas[4].id;
 };
 for(const k of ['maps','encounters','scenarioItems','shop']){
  for(const obj of a[k]||[])if(!obj.zoneId)obj.zoneId=classify(obj);
 }
 return scenario;
}
function prepareAreas(t){
 const a=assets(t);
 if(!Array.isArray(a.areas))a.areas=[];
 return a.areas;
}
function typeOptions(selected){
 const names={scenes:'Histoire',areas:'Lieux',encounters:'PNJ',maps:'Cartes',scenarioItems:'Objets',shop:'Boutique'};
 return Object.entries(names).filter(([k])=>k!=='shop'||current()?.tools?.shop).map(([k,v])=>'<button type="button" class="studio-pill '+(selected===k?'active':'')+'" data-st="view" data-kind="'+k+'">'+v+'</button>').join('');
}
function imageBlock(url,alt=''){
 if(!url)return '<div class="studio-placeholder">✦</div>';
 if(/^mjmedia:\/\//.test(url))return '<img class="studio-image" loading="lazy" data-mj-media="'+esc(url)+'" alt="'+esc(alt)+'">';
 const ok=safeUri(url);
 return ok?'<img class="studio-image" loading="lazy" src="'+esc(ok)+'" alt="'+esc(alt)+'" referrerpolicy="no-referrer">':'<div class="studio-placeholder">✦</div>';
}
async function resolveMedia(root=document){
 const c=client(),user=(await c()?.auth?.getUser?.())?.data?.user;
 if(!c||!user)return;
 for(const image of root.querySelectorAll('[data-mj-media]')){
  const uri=image.dataset.mjMedia;
  const path=uri.replace(/^mjmedia:\/\//,'');
  if(!path.startsWith(user.id+'/')){image.replaceWith(document.createTextNode('Image privée du propriétaire'));continue}
  const {data,error}=await c.storage.from(BUCKET).createSignedUrl(path,3600);
  if(!error&&data?.signedUrl)image.src=data.signedUrl;
 }
}
function renderModules(t){
 const c=t.tools||D.normalizeTools(null,t.system);
 const cards=shortcuts.map(([k,label,desc])=>{
  const on=!!c[k],unavailable=k==='combat'&&t.system!=='COF2';
  return '<article class="studio-tool"><div class="studio-tool-top"><div><b>'+esc(label)+'</b><p>'+esc(desc)+'</p></div><span class="studio-state '+(on?'enabled':'')+'">'+(on?'Activé':'Désactivé')+'</span></div>'+
    (unavailable?'<p class="note">Le moteur COF2 n’est actif que sur les tables COF2.</p>':'')+
    '<div class="actions">'+(on&&k==='scenario'?'<button class="button sm" data-st="open-tab" data-tab="scenario">Ouvrir</button>':'')+
    (on&&k==='combat'&&t.system==='COF2'?'<button class="button sm primary" data-st="open-combat">Combat COF2</button>':'')+
    (on&&k==='shop'?'<button class="button sm" data-st="open-tab" data-tab="resources">Mila / boutique</button>':'')+
    (on&&k==='players'?'<button class="button sm" data-st="open-tab" data-tab="characters">Fiches PJ</button>':'')+
    (on&&k==='soundboard'?'<a class="button sm" href="https://latelierdeguiltanas.github.io/soundboard/" target="_blank" rel="noopener noreferrer">Soundboard</a>':'')+
    (on&&k==='notes'?'<button class="button sm" data-st="open-tab" data-tab="sessions">Séances</button>':'')+
    '<button class="button sm" data-st="toggle" data-tool="'+k+'">'+(on?'Désactiver':'Activer')+'</button></div></article>';
 }).join('');
 return '<section class="panel"><div class="eyebrow">CONFIGURATION DE LA TABLE</div><h2>Mes modules MJ</h2><p>Chaque module est indépendant. Tu peux préparer seulement un scénario, seulement un combat, ou un hub plus complet.</p>'+
 '<div class="studio-tools">'+cards+'</div><hr><h3>Personnages et espace joueurs</h3>'+
 '<div class="studio-mode"><label><input type="radio" name="studioPlayerMode" value="solo" '+(t.playerMode!=='linked'?'checked':'')+'> MJ seul — aucune interface joueur partagée</label>'+
 '<label><input type="radio" name="studioPlayerMode" value="linked" '+(t.playerMode==='linked'?'checked':'')+'> MJ + fiches — préparer la liaison aux joueurs</label></div>'+
 '<p class="note">Le mode « MJ + fiches » permet déjà de garder des liens de personnages dans ta table. Il ne crée pas encore un espace public des joueurs ni une synchronisation des inventaires.</p></section>';
}
function moduleCard(m,t){
 const count=m.scenes.length,done=m.scenes.filter(s=>t.completedScenes.includes(s.id)).length;
 return '<section class="studio-section"><div class="studio-section-head"><div><span class="cardmeta">'+esc(m.type==='chapter'?'CHAPITRE':m.type==='act'?'ACTE':m.type==='zone'?'ZONE':'SECTION')+' · '+count+' scène(s)</span><h3>'+esc(m.name)+'</h3><p>'+esc(m.summary||'Décrivez cette partie du scénario.')+'</p></div><div class="actions"><button class="button sm" data-st="edit-module" data-id="'+esc(m.id)+'">Modifier</button><button class="button sm" data-st="add-scene" data-module="'+esc(m.id)+'">+ Scène</button></div></div>'+
 '<div class="studio-progress"><span style="width:'+ (count?Math.round(100*done/count):0)+'%"></span></div>'+
 (m.scenes.length?'<div class="studio-scene-grid">'+m.scenes.map(sc=>'<article class="studio-scene"><div>'+imageBlock(sc.image_url,sc.title)+'</div><div class="studio-scene-content"><h4>'+esc(sc.title)+'</h4><p>'+esc(sc.description||'')+'</p><p class="note">'+(sc.gmNotes?'Notes MJ enregistrées':'Notes MJ à compléter')+'</p><div class="actions"><button class="button sm" data-st="edit-scene" data-module="'+esc(m.id)+'" data-id="'+esc(sc.id)+'">Détails</button><button class="button sm" data-st="scene-toggle" data-id="'+esc(sc.id)+'">'+(t.completedScenes.includes(sc.id)?'✓ Jouée':'Marquer jouée')+'</button></div></div></article>').join('')+'</div>':'<div class="empty">Aucune scène. Ajoute la première.</div>')+'</section>';
}
function entityCard(x,type,t){
 const name=x.name||x.title||'Sans titre';
 const zoneName=(assets(t).areas||[]).find(z=>z.id===x.zoneId)?.name||'Sans zone';
 const intro=x.description||x.summary||x.player_text||x.mj_notes||'';
 return '<article class="studio-entity">'+imageBlock(x.image_url,name)+'<div class="studio-entity-body"><div class="cardmeta">'+esc(zoneName)+'</div><h3>'+esc(name)+'</h3><p>'+esc(intro.slice(0,240))+'</p>'+
 (type==='shop'?'<p><b>'+esc(x.price_silver)+' PA</b> · Stock '+(x.stock==null?'libre':esc(x.stock))+'</p>':'')+
 '<div class="actions"><button class="button sm" data-st="edit-entity" data-kind="'+type+'" data-id="'+esc(x.id)+'">Ouvrir / modifier</button></div></div></article>';
}
function renderStudio(t){
 const a=assets(t),areas=prepareAreas(t),kind=currentTab;
 const total=(a.maps?.length||0)+(a.encounters?.length||0)+(a.scenarioItems?.length||0)+(a.shop?.length||0);
 const head='<section class="studio-hero"><div class="eyebrow">STUDIO SCÉNARIO · MODIFIABLE ET PRIVÉ</div><h2>'+esc(t.scenario.name)+'</h2><p>'+esc(t.scenario.description||'Aucune description encore renseignée.')+'</p><div class="studio-hero-meta"><span>'+t.scenario.modules.length+' sections</span><span>'+areas.length+' zones</span><span>'+total+' ressources</span></div><div class="actions"><button class="button sm" data-st="edit-scenario">Modifier le scénario</button>'+(t.scenario.assets?.source?.toLowerCase().includes("bastide")&&!areas.length?'<button class="button sm primary" data-st="organize">Classer les ressources par zone</button>':'')+'<button class="button sm" data-st="export">Exporter ce scénario</button></div></section>';
 const nav='<div class="studio-nav">'+typeOptions(kind)+'</div>';
 const areaSelect=kind!=='scenes'&&kind!=='areas'?'<label class="field">Zone<select id="studio-zone"><option value="all">Toutes les zones</option><option value="none" '+(zone==='none'?'selected':'')+'>Sans zone</option>'+areas.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===zone?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></label>':'';
 let content='';
 if(kind==='scenes'){
  content='<div class="studio-section-actions"><h3>Déroulement de l’aventure</h3><button class="button primary" data-st="add-module">+ Acte / chapitre / zone</button></div>'+
   (t.scenario.modules.map(m=>moduleCard(m,t)).join('')||'<div class="empty">Aucune section. Ajoute un acte ou un chapitre pour structurer ton scénario.</div>');
 }else{
  const list=kind==='areas'?areas:(a[kind]||[]);
  const filtered=list.filter(x=>{
   if(kind!=='areas'&&zone==='none'&&x.zoneId)return false;
   if(kind!=='areas'&&zone!=='all'&&zone!=='none'&&x.zoneId!==zone)return false;
   return !search||JSON.stringify([x.name,x.title,x.summary,x.description,x.category,x.tags]).toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'));
  });
  content='<div class="studio-section-actions"><h3>'+esc(title[kind])+' ('+list.length+')</h3><button class="button primary" data-st="add-entity" data-kind="'+kind+'">+ '+esc(singular[kind])+'</button></div>'+
   '<div class="studio-filters"><label class="field">Rechercher<input id="studio-search" value="'+esc(search)+'" placeholder="Nom, objet, lieu, indice…"></label>'+areaSelect+'</div>'+
   '<div class="studio-entity-grid">'+filtered.map(x=>entityCard(x,kind,t)).join('')+'</div>'+
   (!filtered.length?'<div class="empty">Aucune ressource correspondante. Choisis une autre zone ou crée un élément.</div>':'');
 }
 return head+nav+content;
}
function mount(t,view){
 const tabs=document.querySelector('.tabs[role="tablist"]');
 if(!tabs)return;
 while(tabs.nextSibling)tabs.nextSibling.remove();
 if(view==='tools')tabs.insertAdjacentHTML('afterend',renderModules(t));
 else tabs.insertAdjacentHTML('afterend',renderStudio(t));
 resolveMedia(document.getElementById('app'));
}
function decorate(ctx){
 if(ctx.view==='library'){
  const hero=document.querySelector('#app .hero');if(!hero)return;
  const p=document.createElement('section');p.className='panel';
  p.innerHTML='<div class="eyebrow">TRAMES LIBRES ET ORIGINALES</div><h2>Démarrer sans scénario sous licence</h2><p>Choisis une structure de départ, puis personnalise tout dans ta propre table : actes, chapitres, zones, PNJ, cartes et objets.</p>'+
   '<div class="studio-template-choices"><button class="button" data-st="template" data-kind="acts">One-shot · 3 actes</button><button class="button" data-st="template" data-kind="chapters">Campagne · 3 chapitres</button><button class="button" data-st="template" data-kind="zones">Exploration · zones</button><button class="button" data-st="template" data-kind="blank">Scénario vierge</button></div>';
  hero.after(p);return;
 }
 if(ctx.view!=='table'||!ctx.table)return;
 const t=ctx.table;
 if(t.id!==lastTableId){lastTableId=t.id;currentTab='scenes';search='';zone='all';lastOuterTab='';}
 const tools=t.tools||D.normalizeTools(null,t.system);
 if(ctx.tab==='overview'){
  const stats=document.querySelector('#app .statrow');
  if(stats){
   const p=document.createElement('section');p.className='studio-overview';
   p.innerHTML='<h2>Outils de ma table</h2><div class="studio-quick">'+shortcuts.filter(([k])=>tools[k]).map(([k,label,desc])=>
    '<button class="studio-quick-card" data-st="'+(k==='combat'?'open-combat':k==='soundboard'?'soundboard':'open-tab')+'" '+(k==='combat'||k==='soundboard'?'':'data-tab="'+(k==='scenario'?'scenario':k==='shop'?'resources':k==='players'?'characters':k==='notes'?'sessions':'tools')+'"')+'><strong>'+esc(label)+'</strong><span>'+esc(desc)+'</span></button>').join('')+'</div>'+
    (!tools.players?'<p class="note">Cette table est en mode MJ indépendant. Tu peux activer « Personnages » dans Modules si tu souhaites y rattacher des PJ.</p>':'')+
    '<div class="actions"><button class="button sm" data-st="open-tab" data-tab="tools">Personnaliser mes modules</button></div>';
   stats.after(p);
  }
 }
 const resTab=document.querySelector('#app .tabs [role="tab"][data-tab="resources"]');
 if(resTab){resTab.textContent='Ressources';if(!tools.shop&&!tools.scenario)resTab.remove();}
 if(ctx.tab==='scenario'||ctx.tab==='resources'||ctx.tab==='tools'){
  if(ctx.tab==='scenario'&&lastOuterTab!=='scenario')currentTab='scenes';
  if(ctx.tab==='resources'&&lastOuterTab!=='resources')currentTab=tools.shop?'shop':'scenarioItems';
  if(currentTab==='shop'&&!tools.shop)currentTab='scenarioItems';
  mount(t,ctx.tab);
 }
 lastOuterTab=ctx.tab;
}
function input(label,name,value='',options={}){
 const type=options.type||'text',required=options.required?'required':'',limit=options.limit||180;
 return '<label class="field">'+esc(label)+'<input type="'+type+'" name="'+esc(name)+'" value="'+esc(value)+'" maxlength="'+limit+'" '+required+'></label>';
}
function textarea(label,name,value=''){
 return '<label class="field">'+esc(label)+'<textarea name="'+esc(name)+'" rows="4" maxlength="12000">'+esc(value)+'</textarea></label>';
}
function selectField(label,name,choices,selected=''){
 return '<label class="field">'+esc(label)+'<select name="'+esc(name)+'">'+choices.map(([k,v])=>'<option value="'+esc(k)+'" '+(k===selected?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function zoneChoices(t){return [['','Sans zone'],...(assets(t).areas||[]).map(z=>[z.id,z.name])];}
function imageFields(x){
 return input('Lien HTTPS de l’image (facultatif)','image_url',/^https:\/\//i.test(x?.image_url||'')?x.image_url:'',{type:'url',limit:1400})+
  '<label class="field">Ou importer une image privée (JPG, PNG, WebP · 5 Mo max)<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>'+
  (x?.image_url?'<p class="note">Image déjà associée. Une nouvelle image ou un nouveau lien la remplacera.</p>':'')+
  '<p class="note">Les images importées sont privées au compte MJ. Lors d’un partage de scénario, seules les images HTTPS publiques sont réutilisables par un autre MJ pour le moment.</p>';
}
function dialog(titleText,fields,metadata){
 const d=$('studio-dialog');if(!d)return;
 editing=metadata;
 d.innerHTML='<h2>'+esc(titleText)+'</h2><form id="studio-form">'+fields+'<div class="form-actions"><button type="submit" class="button primary">Enregistrer</button>'+(metadata?.id?'<button type="button" class="button danger" data-st="delete">Supprimer</button>':'')+'<button type="button" class="button" data-st="close">Annuler</button></div></form>';
 if(!d.open)d.showModal();
}
function entityForm(kind,id=''){
 const t=current();if(!t)return;
 const a=assets(t),x=(a[kind]||[]).find(q=>q.id===id)||{},name=x.name||x.title||'';
 let fields=input('Nom / titre','name',name,{required:true,limit:160});
 if(kind!=='areas')fields+=selectField('Zone de l’aventure','zoneId',zoneChoices(t),x.zoneId||'');
 if(kind==='encounters'){
  fields+=input('Type (PNJ, monstre, rencontre…)','kind',x.kind||'PNJ',{limit:90})+textarea('Résumé','summary',x.summary||'')+
  textarea('À raconter aux joueurs','player_text',x.player_text||'')+textarea('Notes secrètes du MJ','mj_notes',x.mj_notes||'');
 }else if(kind==='shop'){
  fields+=input('Catégorie','category',x.category||'')+textarea('Description','description',x.description||'')+
  input('Prix (pièces d’argent)','price_silver',x.price_silver??0,{type:'number'})+
  input('Stock (laisser vide pour illimité)','stock',x.stock==null?'':x.stock,{type:'number'});
 }else if(kind==='maps'||kind==='scenarioItems'||kind==='areas'){
  fields+=kind==='scenarioItems'?input('Catégorie','category',x.category||'Quête'):'';
  fields+=textarea('Description / informations utiles','description',x.description||'');
 }
 fields+=imageFields(x);
 dialog((id?'Modifier ':'Créer ')+singular[kind],fields,{action:'entity',kind,id});
}
function moduleForm(id=''){
 const t=current();const x=t?.scenario.modules.find(m=>m.id===id)||{};
 dialog(id?'Modifier la section':'Ajouter une section',
  input('Titre','name',x.name||'',{required:true,limit:100})+
  selectField('Structure','type',[['act','Acte'],['chapter','Chapitre'],['zone','Zone'],['section','Section libre']],x.type||'chapter')+
  textarea('Objectif / résumé','summary',x.summary||'')+
  input('Durée indicative (minutes)','duration',x.duration||90,{type:'number'}),{action:'module',id});
}
function sceneForm(moduleId,id=''){
 const t=current(),m=t?.scenario.modules.find(m=>m.id===moduleId),x=m?.scenes.find(v=>v.id===id)||{};
 if(!m)return;
 dialog(id?'Modifier la scène':'Créer une scène',
  input('Titre de la scène','name',x.title||'',{required:true,limit:90})+
  selectField('Lieu / zone','zoneId',zoneChoices(t),x.zoneId||'')+
  textarea('Ce que les joueurs découvrent','description',x.description||'')+
  textarea('Déroulement et secrets MJ','gmNotes',x.gmNotes||'')+imageFields(x),
  {action:'scene',id,moduleId});
}
function scenarioForm(){
 const sc=current()?.scenario;if(!sc)return;
 dialog('Modifier le scénario',input('Nom','name',sc.name,{required:true,limit:100})+
  textarea('Résumé de l’aventure','description',sc.description||'')+
  selectField('Format','category',[['campaign','Campagne'],['one-shot','One-shot'],['custom','Libre']],sc.category)+imageFields(sc),
 {action:'scenario'});
}
async function uploadImage(file,t,id){
 if(!file)return '';
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Image JPG, PNG ou WebP seulement.');
 if(file.size>5*1024*1024)throw Error('Image trop volumineuse (5 Mo maximum).');
 const c=client();if(!c)throw Error('Compte MJ requis pour importer des images.');
 const {data:{user},error:e}=await c.auth.getUser();if(e||!user)throw Error('Session MJ expirée.');
 const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
 const imageId=D.uid();const path=user.id+'/'+t.id+'/'+imageId+'.'+ext;
 const out=await c.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
 if(out.error)throw Error('Import de l’image : '+out.error.message);
 return 'mjmedia://'+path;
}
async function saveForm(form){
 const t=current(),data=Object.fromEntries(new FormData(form)),meta=editing;
 if(!t||!meta)return;
 const file=form.querySelector('[name="imageFile"]')?.files?.[0];
 let rawImage=file?await uploadImage(file,t,meta.id||D.uid()):safeUri(data.image_url);
 const setImage=(obj)=>{if(rawImage)obj.image_url=rawImage;else if(data.image_url==='')obj.image_url='';};
 if(meta.action==='entity'){
  const list=meta.kind==='areas'?prepareAreas(t):assets(t)[meta.kind];
  const x=list.find(y=>y.id===meta.id),obj=x||{id:D.uid()};
  obj.name=String(data.name||'').trim().slice(0,160);obj.title=obj.name;
  if(!obj.name)throw Error('Un nom est obligatoire.');
  obj.zoneId=String(data.zoneId||'').slice(0,120);obj.category=String(data.category||'').slice(0,90);
  obj.description=String(data.description||'').slice(0,8000);
  if(meta.kind==='encounters'){
   obj.kind=String(data.kind||'PNJ').slice(0,90);obj.summary=String(data.summary||'').slice(0,1500);
   obj.player_text=String(data.player_text||'').slice(0,12000);
   obj.mj_notes=String(data.mj_notes||'').slice(0,12000);
  }
  if(meta.kind==='shop'){
   obj.price_silver=Math.max(0,Number(data.price_silver)||0);
   obj.stock=data.stock===''?null:Math.max(0,Number(data.stock)||0);
  }
  setImage(obj);if(!x)list.push(obj);
 }else if(meta.action==='module'){
  const x=t.scenario.modules.find(m=>m.id===meta.id),obj=x||{id:D.uid(),scenes:[]};
  obj.name=String(data.name||'').trim().slice(0,100);
  if(!obj.name)throw Error('Titre requis.');
  obj.type=['act','chapter','zone','section'].includes(data.type)?data.type:'section';
  obj.summary=String(data.summary||'').slice(0,800);
  obj.duration=Math.max(15,Math.min(480,Number(data.duration)||90));
  if(!x)t.scenario.modules.push(obj);
 }else if(meta.action==='scene'){
  const m=t.scenario.modules.find(x=>x.id===meta.moduleId);if(!m)throw Error('Section introuvable.');
  const x=m.scenes.find(v=>v.id===meta.id),obj=x||{id:D.uid(),encounters:[]};
  obj.title=String(data.name||'').trim().slice(0,90);
  if(!obj.title)throw Error('Titre requis.');
  obj.zoneId=String(data.zoneId||'').slice(0,120);
  obj.description=String(data.description||'').slice(0,2500);
  obj.gmNotes=String(data.gmNotes||'').slice(0,4000);
  setImage(obj);if(!x)m.scenes.push(obj);
 }else if(meta.action==='scenario'){
  t.scenario.name=String(data.name||'').trim().slice(0,100);
  if(!t.scenario.name)throw Error('Nom requis.');
  t.scenario.description=String(data.description||'').slice(0,1500);
  t.scenario.category=data.category;
  setImage(t.scenario);
 }
 A.save();$('studio-dialog').close();A.refresh();A.notify('Enregistré dans ta table MJ. Synchronisation cloud en cours.');
}
const oldDecorate=window.TableIntegration?.decorate;
if(window.TableIntegration)window.TableIntegration.decorate=function(ctx){oldDecorate?.(ctx);decorate(ctx);};
let activeSave=false;
document.addEventListener('click',async event=>{
 const b=event.target.closest('[data-st]');if(!b)return;
 const action=b.dataset.st,t=current();
 try{
  if(action==='view'){currentTab=b.dataset.kind;search='';zone='all';A.refresh();return;}
  if(action==='open-tab'){A.setTab(b.dataset.tab);return;}
  if(action==='open-combat'){
   if(!t||t.system!=='COF2'){A.notify('Ce gestionnaire de combat requiert une table COF2.');return;}
   const u=ROOT+'gestionnaire-tables/combat/?table='+encodeURIComponent(t.id);
   window.open(u,'_blank','noopener');return;
  }
  if(action==='soundboard'){window.open('https://latelierdeguiltanas.github.io/soundboard/','_blank','noopener');return;}
  if(action==='toggle'){
   if(!t)return;t.tools=t.tools||D.normalizeTools(null,t.system);
   const k=b.dataset.tool;if(!D.TOOL_LIST.includes(k))return;
   if(k==='combat'&&t.system!=='COF2'){A.notify('Combat COF2 disponible seulement pour une table COF2.');return}
   t.tools[k]=!t.tools[k];
   A.save();if(k==='scenario'&&t.tools[k])A.setTab('scenario');else A.refresh();return;
  }
  if(action==='organize'&&t){organize(t.scenario);A.save();A.refresh();A.notify('Ressources classées par zones proposées.');}
  if(action==='add-module')moduleForm();
  if(action==='edit-module')moduleForm(b.dataset.id);
  if(action==='add-scene')sceneForm(b.dataset.module);
  if(action==='edit-scene')sceneForm(b.dataset.module,b.dataset.id);
  if(action==='add-entity')entityForm(b.dataset.kind);
  if(action==='edit-entity')entityForm(b.dataset.kind,b.dataset.id);
  if(action==='edit-scenario')scenarioForm();
  if(action==='close')$('studio-dialog')?.close();
  if(action==='delete'&&t&&editing?.id){
   if(!confirm('Supprimer définitivement cet élément de la copie de cette table ?'))return;
   const meta=editing;
   if(meta.action==='entity'){
    const a=assets(t);a[meta.kind]=(a[meta.kind]||[]).filter(x=>x.id!==meta.id);
    if(meta.kind==='areas')for(const k of ['maps','encounters','scenarioItems','shop'])for(const x of a[k]||[])if(x.zoneId===meta.id)x.zoneId='';
   }else if(meta.action==='module')t.scenario.modules=t.scenario.modules.filter(x=>x.id!==meta.id);
   else if(meta.action==='scene'){const m=t.scenario.modules.find(x=>x.id===meta.moduleId);if(m)m.scenes=m.scenes.filter(x=>x.id!==meta.id);}
   A.save();$('studio-dialog')?.close();A.refresh();A.notify('Élément supprimé de cette table seulement.');
  }
  if(action==='export'&&t)A.download('scenario-'+t.scenario.name+'.json',D.exportScenario(t));
  if(action==='scene-toggle'&&t){const i=t.completedScenes.indexOf(b.dataset.id);if(i<0)t.completedScenes.push(b.dataset.id);else t.completedScenes.splice(i,1);A.save();A.refresh();}
  if(action==='template'){
   const titles={acts:'One-shot — 3 actes',chapters:'Campagne — 3 chapitres',zones:'Exploration — zones',blank:'Scénario vierge'};
   const kind=b.dataset.kind,s=D.scenarioTemplate(kind,'generic',titles[kind]||'Scénario vierge');
   A.getDb().scenarios.push(s);A.save();A.refresh();A.notify('Trame ajoutée à la bibliothèque. Tu peux créer une table avec ce scénario.');
  }
 }catch(err){A.notify('Studio : '+err.message)}
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.name==='studioPlayerMode'){
  const t=current();if(!t)return;
  t.playerMode=el.value==='linked'?'linked':'solo';
  if(t.playerMode==='linked')t.tools.players=true;
  A.save();A.refresh();
 }
 if(el.id==='studio-zone'){zone=el.value;A.refresh();}
});
document.addEventListener('input',event=>{
 if(event.target.id==='studio-search'){
  search=event.target.value;
  // Filtering does not force a full re-render while typing: keep keyboard focus.
  const t=current();if(!t)return;
  document.querySelectorAll('.studio-entity').forEach(card=>{
   const name=card.textContent.toLocaleLowerCase('fr');
   card.hidden=!name.includes(search.toLocaleLowerCase('fr'));
  });
 }
});
document.addEventListener('submit',async event=>{
 if(event.target.id!=='studio-form')return;
 event.preventDefault();if(activeSave)return;activeSave=true;
 const button=event.target.querySelector('button[type="submit"]');
 if(button)button.disabled=true;
 try{await saveForm(event.target);}
 catch(error){A.notify('Erreur Studio : '+error.message)}
 finally{activeSave=false;if(button)button.disabled=false}
});
const dlg=document.createElement('dialog');dlg.id='studio-dialog';dlg.className='studio-dialog';document.body.append(dlg);
window.TableStudio={organize,render:()=>{if(current())A.refresh();}};
})();