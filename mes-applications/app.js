/* Portail d'applications — L'Atelier de Guiltanas
 * Découverte publique GitHub, sans mot de passe/token dans le navigateur.
 * Chaque nouvelle application disposant d'un index.html dans le dépôt principal
 * est détectée à la visite ou après rafraîchissement (limite de cache 15 min).
 */
(()=>{'use strict';
const OWNER='latelierdeguiltanas',MAIN_REPO='atelier-guiltanas-apps';
const HOME=`https://${OWNER}.github.io/${MAIN_REPO}/`;
const API='https://api.github.com';
const CACHE='guiltanas_link_portal_cache_v1',BOOKMARKS='guiltanas_link_portal_bookmarks_v1',FAV='guiltanas_link_portal_favorites_v1',SHOW='guiltanas_link_portal_show_subtools_v1';
const TTL=15*60*1000;
const $=s=>document.querySelector(s);
let catalog=[],custom=readJson(BOOKMARKS,[]),favorites=new Set(readJson(FAV,[])),filter='all',syncedAt=0,repoCount=0;
const titles={
 'atelier-guiltanas-apps':'Portail des applications',
 'gestionnaire-tables':'Gestionnaire de tables',
 'mes-applications':'Mes applications',
 'ile-aux-tempetes-bastide':'Île aux Tempêtes · Bastide',
 'ile-aux-tempetes-nespresso':'Île aux Tempêtes · Nespresso',
 'forge-of-heroes':'Forge of Heroes',
 'fiches-personnages':'Mes fiches interactives',
 'gestionnaire-combat-cof2':'Gestionnaire de combat COF2',
 'gestionnaire-combat-dd5':'Gestionnaire de combat D&D',
 'centre-synchronisation':'Pilotage Guiltanas',
 'mj-express':'MJ Express',
 'soundboard':'Soundboard',
 'hub-generique':'Hub générique',
 'boutique-mila':'Boutique de Mila',
 'multi':'Mes campagnes',
 'mj':'Espace maître du jeu',
 'joueurs':'Espace joueurs',
 'progression':'Passage de niveau'
};
const human=s=>(titles[s]||String(s).replace(/[-_]/g,' ').replace(/\b\p{L}/gu,c=>c.toUpperCase()));
function readJson(k,fallback){try{const s=localStorage.getItem(k);return s?JSON.parse(s):fallback}catch{return fallback}}
function saveJson(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function isHttps(s){try{const u=new URL(s);return u.protocol==='https:'&&!!u.hostname&& !u.username&&!u.password}catch{return false}}
function classify(path){const p=path.toLowerCase();if(/combat|forge|jdr|bastide|nespresso|tempete|tempête|joueur|personnage|mj-|soundboard|boutique|hub|fiche|aventure|scenario|scénario|table/.test(p))return 'jdr';if(/pilotage|synchronisation|cockpit|projet|suivi|dashboard|finance|atelier|gestion/.test(p))return 'gestion';return 'other'}
function iconFor(x){const p=(x.path||x.name||'').toLowerCase();if(/combat|bataille/.test(p))return '⚔';if(/fiche|personnage|forge/.test(p))return '♙';if(/sound|audio|musique/.test(p))return '♫';if(/table|hub|campagne/.test(p))return '♜';if(/pilotage|synchronisation|cockpit/.test(p))return '◈';if(/boutique|inventaire/.test(p))return '◆';return '✦'}
function discoverFromTree(data){
 if(!data||!Array.isArray(data.tree))throw Error('Réponse GitHub non reconnue');
 const dedup=new Map();
 for(const item of data.tree){
  if(item.type!=='blob'||!item.path.endsWith('/index.html'))continue;
  const dir=item.path.slice(0,-'index.html'.length).replace(/\/$/,'');
  if(!dir||/(^|\/)(assets|node_modules|_archive|backup|old|tests|test|legacy|archives|tmp)(\/|$)/i.test(dir))continue;
  const parts=dir.split('/'),main=parts[0],sub=parts.length>1;
  const label=(sub?`${human(parts[parts.length-1])} · ${human(main)}`:human(main));
  const url=HOME+dir.split('/').map(encodeURIComponent).join('/')+'/';
  dedup.set(url,{id:'gh:'+dir,name:label,url,path:dir,category:classify(dir),sub,source:'GitHub Pages',icon:iconFor({path:dir}),featured:!sub&&Object.hasOwn(titles,main)});
 }
 // Some single-page apps are plain .html files at a root path.
 for(const item of data.tree){
  if(item.type!=='blob'||!item.path.endsWith('.html')||item.path.endsWith('/index.html'))continue;
  const p=item.path,parts=p.split('/');
  if(parts.length!==1)continue;
  const basename=parts[0].slice(0,-5);
  if(basename==='index'||/(^|[-_])(test|backup|old|archive|legacy|dev)([-_]|$)/i.test(basename))continue;
  const url=HOME+encodeURIComponent(p);
  dedup.set(url,{id:'gh:'+p,name:human(basename),url,path:p,category:classify(p),sub:false,source:'GitHub Pages',icon:iconFor({path:p}),featured:false});
 }
 return [...dedup.values()];
}
async function gh(url){const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!r.ok)throw Error(r.status===403?'Limite des requêtes GitHub atteinte':`GitHub HTTP ${r.status}`);return r.json()}
function fallback(){return [
 ['gestionnaire-tables/','Gestionnaire de tables','jdr'],
 ['mes-applications/','Mes applications','gestion'],
 ['ile-aux-tempetes-bastide/','Île aux Tempêtes · Bastide','jdr'],
 ['ile-aux-tempetes-bastide/mj/','Table MJ · Bastide','jdr'],
 ['fiches-personnages/','Mes fiches interactives','jdr'],
 ['forge-of-heroes/','Forge of Heroes','jdr'],
 ['gestionnaire-combat-cof2/multi/','Gestionnaire de combat COF2','jdr'],
 ['centre-synchronisation/','Pilotage Guiltanas','gestion']
 ].map(([p,name,category])=>({id:'gh:'+p.replace(/\/$/,''),path:p,name,category,url:HOME+p,sub:p.split('/').filter(Boolean).length>1,featured:true,icon:iconFor({path:p}),source:'Lien de secours'}));}
function mergeUnique(items){const map=new Map();for(const item of items){if(!isHttps(item.url))continue;const key=item.url.replace(/\/$/,'');if(!map.has(key))map.set(key,item)}return [...map.values()]}
async function fetchCatalog(force=false){
 const old=readJson(CACHE,null);const fresh=old&&Array.isArray(old.entries)&&Date.now()-old.at<TTL;
 if(!force&&fresh){catalog=old.entries;syncedAt=old.at;repoCount=old.repoCount||1;setStatus('Catalogue enregistré · découverte automatique active','ok');render();return}
 setStatus('Recherche des applications publiques sur GitHub…','loading');
 try{
  // Le dépôt central est la source des sous-applications. Les autres dépôts
  // publics avec GitHub Pages actif sont ajoutés comme points d'entrée.
  const [tree,repos]=await Promise.all([
   gh(`${API}/repos/${OWNER}/${MAIN_REPO}/git/trees/main?recursive=1`),
   gh(`${API}/users/${OWNER}/repos?type=public&per_page=100`)
  ]);
  const apps=discoverFromTree(tree);if(!apps.length)throw Error('Aucune application détectée');
  const extra=Array.isArray(repos)?repos.filter(x=>x.name!==MAIN_REPO&&x.has_pages&&x.private===false).map(x=>{
   const goodHomepage=isHttps(x.homepage||'')?x.homepage:null;
   const url=goodHomepage||`https://${OWNER}.github.io/${encodeURIComponent(x.name)}/`;
   return {id:'repo:'+x.name,name:human(x.name),url,category:classify(x.name),sub:false,path:x.name,source:'Dépôt GitHub Pages',icon:iconFor({path:x.name}),featured:false};
  }):[];
  catalog=mergeUnique([...apps,...extra]);syncedAt=Date.now();repoCount=Array.isArray(repos)?repos.length:1;
  saveJson(CACHE,{entries:catalog,at:syncedAt,repoCount});
  setStatus(tree.truncated?'Catalogue GitHub partiel : arbre trop volumineux':'Catalogue actualisé automatiquement','ok');
 }catch(e){
  catalog=old?.entries?.length?old.entries:fallback();syncedAt=old?.at||0;repoCount=old?.repoCount||1;
  setStatus(`GitHub indisponible · ${old?.entries?.length?'ancienne liste conservée':'liens de secours affichés'}`,'error');
 }
 render();
}
function setStatus(text,state){$('#syncstatus').textContent=text;$('#dot').className='dot '+(state==='ok'?'ok':state==='error'?'error':'')}
function groupName(category){return {jdr:'JDR',gestion:'Gestion',other:'Autre'}[category]||'Autre'}
function setFav(id,val){if(val)favorites.add(id);else favorites.delete(id);saveJson(FAV,[...favorites]);render()}
function appendCard(data){
 const card=document.createElement('article');card.className='card';
 const top=document.createElement('div');top.className='cardTop';
 const sym=document.createElement('span');sym.className='symbol';sym.textContent=data.icon||iconFor(data);
 const star=document.createElement('button');star.type='button';star.className='star'+(favorites.has(data.id)?' on':'');star.title='Ajouter ou retirer des favoris';star.setAttribute('aria-label',`Favori : ${data.name}`);star.setAttribute('aria-pressed',String(favorites.has(data.id)));star.textContent=favorites.has(data.id)?'★':'☆';star.addEventListener('click',()=>setFav(data.id,!favorites.has(data.id)));
 top.append(sym,star);card.append(top);
 const h=document.createElement('h2');h.textContent=data.name;card.append(h);
 const p=document.createElement('p');p.textContent=data.sub?'Sous-outil · '+data.path:data.custom?'Lien ajouté personnellement':data.path||data.source;card.append(p);
 const bottom=document.createElement('div');bottom.className='cardBottom';
 const badge=document.createElement('span');badge.className='kind';badge.textContent=groupName(data.category);
 const link=document.createElement('a');link.href=data.url;link.target='_blank';link.rel='noopener noreferrer';link.className='openLink';link.textContent='Ouvrir ↗';link.setAttribute('aria-label',`Ouvrir ${data.name}`);
 bottom.append(badge,link);card.append(bottom);
 if(data.custom){const del=document.createElement('button');del.className='delete';del.type='button';del.textContent='Supprimer ce lien';del.addEventListener('click',()=>{if(!confirm(`Supprimer « ${data.name} » de cet appareil ?`))return;custom=custom.filter(x=>x.id!==data.id);favorites.delete(data.id);saveJson(BOOKMARKS,custom);saveJson(FAV,[...favorites]);render()});card.append(del)}
 return card;
}
function render(){
 const q=$('#search').value.trim().toLocaleLowerCase('fr');const show=$('#showSubtools').checked;
 const all=mergeUnique([...custom,...catalog]);
 const visible=all.filter(x=>(show||!x.sub)&&(!q||(x.name+' '+x.path+' '+x.url).toLocaleLowerCase('fr').includes(q))&&(filter==='all'||(filter==='favorites'?favorites.has(x.id):x.category===filter)));
 visible.sort((a,b)=>Number(favorites.has(b.id))-Number(favorites.has(a.id))||Number(b.featured||0)-Number(a.featured||0)||a.name.localeCompare(b.name,'fr'));
 const grid=$('#grid');grid.replaceChildren(...visible.map(appendCard));$('#empty').hidden=visible.length>0;
 $('#countAll').textContent=all.filter(x=>!x.sub).length;$('#countFav').textContent=all.filter(x=>favorites.has(x.id)).length;$('#countRepos').textContent=repoCount||'—';
 $('#lastsync').textContent=syncedAt?'· Vérifié le '+new Date(syncedAt).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
}
function setup(){
 $('#search').addEventListener('input',render);
 $('#showSubtools').checked=readJson(SHOW,false);$('#showSubtools').addEventListener('change',()=>{saveJson(SHOW,$('#showSubtools').checked);render()});
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render()}));
 $('#refresh').addEventListener('click',()=>fetchCatalog(true));
 const dialog=$('#linkDialog');$('#add').addEventListener('click',()=>{dialog.showModal();$('#customName').focus()});
 $('#closeDialog').addEventListener('click',()=>dialog.close());$('#cancelDialog').addEventListener('click',()=>dialog.close());
 $('#linkForm').addEventListener('submit',e=>{
  e.preventDefault();const name=$('#customName').value.trim(),url=$('#customUrl').value.trim();
  if(!name||!isHttps(url)){$('#formError').textContent='Indique un nom et une adresse HTTPS valide.';return}
  if(mergeUnique([...custom,...catalog]).some(x=>x.url.replace(/\/$/,'')===url.replace(/\/$/,''))){$('#formError').textContent='Ce lien est déjà dans le catalogue.';return}
  custom.unshift({id:'manual:'+crypto.randomUUID(),name,url,category:$('#customCategory').value,path:'',sub:false,custom:true,featured:true,icon:'✧',source:'Ajout manuel'});
  saveJson(BOOKMARKS,custom);dialog.close();$('#linkForm').reset();$('#formError').textContent='';render();
 });
 render();fetchCatalog();
}
setup();
})();