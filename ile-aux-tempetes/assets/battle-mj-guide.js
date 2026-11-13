/* Nespresso — aide MJ D&D 2024, depuis les fiches niveau 2 réelles.
   Lecture seule : n'utilise jamais les profils de combat périmés niveau 1 comme source. */
(()=>{
'use strict';
const IDS=['vax','hammerz','loris','lelio'];
const LABELS={vax:"Vax’Ildan",hammerz:'Hammerz',loris:'Prométhée',lelio:'Lelio'};
const DATA_CACHE=new Map(),$=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const showStatus=s=>{const el=$('ns-mj-guide-status');if(el)el.textContent=s;};
const identify=name=>{const z=n(name);return z.includes('hammerz')?'hammerz':z.includes('lelio')?'lelio':z.includes('vax')?'vax':z.includes('loris')||z.includes('promethee')?'loris':null;};
const signed=v=>Number(v)>=0?'+'+v:String(v);
const tip={
 vax:'Marque du chasseur = ACTION BONUS et concentration ; +1d6 à CHAQUE attaque qui touche la cible marquée. Le style Deux armes ajoute +3 dégâts à la deuxième attaque légère, mais celle-ci demande une action bonus. Son PDF niveau 2 maîtrise Slow (arc long) et Vex (épée courte), PAS Nick (cimeterre). Donc activer/déplacer la Marque et effectuer l’attaque supplémentaire légère au même tour est impossible, sauf autre règle ultérieure.',
 loris:'Projectile magique n’est PAS connu dans son PDF de niveau 2. Explosion ensorcelée : jet d’attaque magique +5 contre CA, le sort peut rater. Mains brûlantes : PAS de jet d’attaque du lanceur, mais sauvegarde de DEX DD 13 pour chaque cible ; moitié des 3d6 dégâts de feu en cas de réussite. Sort accéléré coûte 2 points de sorcellerie en plus du coût normal du sort.',
 hammerz:'Le Châtiment divin exige une attaque de mêlée réussie ET une action bonus, ajoute 2d8 radiants ; 1 lancement gratuit/repos long. Imposition des mains = réserve de 10 PV. Bouclier + cotte de mailles : CA 18 si tous deux portés.',
 lelio:'Forme sauvage par action bonus : 2 utilisations par repos long, 1 récupérée au repos court. Les attaques et la CA de la forme sont celles de la bête ; impossible de lancer un nouveau sort, la concentration déjà active persiste. Les sorts de druide de niveau 1 ne sont utilisables que s’ils ont été préparés aujourd’hui.'
};
async function fetchData(id){
 if(DATA_CACHE.has(id))return DATA_CACHE.get(id);
 const url=new URL('../../../personnages/'+id+'/data.js?v=mj20261113-1',location.href);
 const res=await fetch(url,{cache:'no-store'});
 if(!res.ok)throw Error('Fiche joueur inaccessible : '+res.status);
 const src=await res.text(),prefix='window.__IAT_PLAYER_DATA=';
 if(!src.trimStart().startsWith(prefix))throw Error('Format de la fiche non reconnu');
 const data=JSON.parse(src.trim().slice(prefix.length).replace(/;\s*$/,''));
 if(data.id!==id)throw Error('Identité de la fiche incohérente');
 DATA_CACHE.set(id,data);return data;
}
async function fetchLive(id){
 const A=window.NespressoEconomy;
 if(!A?.isMJ||!A.key())return null;
 try{
  const r=await A.call('supervision',{query:{playerId:id,offset:'0'}});
  return r?.activity||null;
 }catch{return null;}
}
function gearHtml(data,activity){
 const g=activity?.snapshot?.gear;
 if(!g)return '<p class="mg-warn">CA du PDF : <b>'+data.ac+'</b> (équipement du téléphone NON confirmé en temps réel).</p>';
 return '<p><b>CA selon dernière copie du joueur : '+g.ac+'</b> — '+escapeHTML(g.formula||'')+'</p>'+
 '<p><small>'+escapeHTML((g.equippedNames||[]).join(' · ')||'Aucun objet déclaré équipé')+'</small></p>'+
 (Array.isArray(g.attacks)&&g.attacks.length?'<p><b>Attaques du stuff équipé</b></p>'+
 g.attacks.map(a=>'<div class="mg-line">'+escapeHTML(a.name)+' : '+(a.unknown?'dés inconnus':signed(a.attack)+' toucher • '+escapeHTML(a.damage)+(a.versatile?' / '+escapeHTML(a.versatile)+' à deux mains':''))+'</div>').join(''):'');
}
function spellsHtml(d,activity){
 const saved=activity?.snapshot;
 const prepared=Array.isArray(saved?.prepared)?saved.prepared.map(n):null;
 const sort=d.spells||[];
 return '<details class="mg-block"><summary>✨ Sorts et magie — '+sort.length+' entrées du PDF</summary>'+
 '<p class="mg-warn">Les sorts de classe possibles ne sont pas nécessairement préparés. En cas de doute, vérifier le dernier choix du joueur et les emplacements restants.</p>'+
 '<div class="mg-grid">'+sort.map(s=>{
  const isPrepared=s.level===0||s.always||s.freeResource||d.magicMode!=='prepare4'||
    prepared&&prepared.includes(n(s.name));
  const unconfirmed=d.magicMode==='prepare4'&&s.level>0&&!s.always&&!s.freeResource&&!isPrepared;
  const d20=s.save?'Sauvegarde '+s.save:s.attack!=null?'Attaque '+signed(s.attack):'Sans jet pour toucher';
  const status=unconfirmed?(prepared?'⚠ Non préparé':'⚠ Préparation non connue'):(s.level===0?'Tour de magie':'Sur la fiche');
  return '<details class="mg-spell"><summary><b>'+escapeHTML(s.name)+'</b> <small>'+status+'</small></summary>'+
   '<p>Niveau '+s.level+' • '+escapeHTML(s.cast||'')+' • '+escapeHTML(s.range||'')+' • '+escapeHTML(d20)+'</p>'+
   (s.damage?'<p><b>Dégâts :</b> '+escapeHTML(s.damage)+'</p>':'')+
   '<p>'+escapeHTML(s.effect||s.summary||'Consulter la règle du sort si besoin.')+'</p>'+
   (s.concentration?'<small>⚠ Concentration : un seul effet maintenu.</small>':'')+'</details>';
 }).join('')+'</div></details>';
}
function featuresHtml(d){
 return '<details class="mg-block"><summary>🌟 Capacités, actions et synergies — '+(d.features||[]).length+'</summary>'+
 (d.features||[]).map(f=>'<details class="mg-spell"><summary>'+escapeHTML(f.name)+' <small>'+escapeHTML(f.action||'')+'</small></summary>'+
 '<p>'+escapeHTML(f.detail||f.summary||'')+'</p></details>').join('')+'</details>';
}
function weaponsHtml(d){
 return '<details class="mg-block" open><summary>⚔ Attaques décrites sur la fiche PDF</summary>'+
 '<div class="mg-grid">'+(d.weapons||[]).map(w=>'<div class="mg-line"><strong>'+escapeHTML(w.name)+'</strong> : <b>'+signed(w.attack)+'</b> pour toucher, <b>'+escapeHTML(w.damage)+'</b> '+
 escapeHTML(w.type||'')+(w.mastery?' • maîtrise sélectionnée : '+escapeHTML(w.mastery):'')+'</div>').join('')+'</div>'+
 '<small>Il faut disposer de l’arme et respecter les actions disponibles. Les coups qui ratent ne font généralement aucun dégât.</small></details>';
}
async function openPlayer(id){
 const panel=$('ns-mj-guide'),out=$('ns-mj-guide-body'),detail=panel?.querySelector('details');
 if(!out)return;
 panel.open=true;showStatus('Lecture de '+LABELS[id]+'…');
 try{
  const d=await fetchData(id),act=await fetchLive(id);
  const hp=act?.snapshot?.hp!=null?act.snapshot.hp+' / '+act.snapshot.maxHP+' PV (dernière copie)':d.maxHP+' PV max (PDF)';
  out.innerHTML='<div class="mg-head"><h3>'+escapeHTML(d.name)+' — niveau '+d.level+'</h3><span>'+escapeHTML(hp)+'</span></div>'+
  '<p><b>CA de référence '+d.ac+'</b> • Initiative '+signed(d.init)+' • Attaque de sort '+signed(d.spellAttack||0)+' • DD '+d.spellDC+
  (act?.snapshot_at?' • Copie : '+new Date(act.snapshot_at).toLocaleString('fr-FR'):'')+'</p>'+
  '<div class="mg-hint">'+escapeHTML(tip[id]||'')+'</div>'+
  gearHtml(d,act)+weaponsHtml(d)+spellsHtml(d,act)+featuresHtml(d)+
  '<p class="mg-legal">Source des capacités : PDF du personnage / données de sa fiche niveau 2 ; équipement et ressources, seulement si une copie MJ a été reçue. Cette fenêtre ne dépense aucune ressource et ne modifie pas le combat.</p>'+
  '<a class="mg-link" target="_blank" rel="noopener" href="../../../personnages/'+id+'/?tab=combat">Ouvrir la fiche complète ↗</a>';
  showStatus('Fiche niveau '+d.level+(act?.snapshot?' • copie serveur disponible':' • valeurs PDF uniquement'));
 }catch(e){showStatus('Erreur : '+e.message);out.innerHTML='<p>Impossible de charger la fiche. Conserve le combat local et réessaie.</p>';}
}
window.NespressoOpenMJGuide=openPlayer;
function onClick(event){
 const chip=event.target.closest('.initChip');if(!chip)return;
 const chips=[...$('fighters')?.querySelectorAll('.initChip')||[]],i=chips.indexOf(chip);
 const f=typeof fighters!=='undefined'?fighters[i]:null;
 const id=identify(f?.name);
 if(id)setTimeout(()=>openPlayer(id),0);
 else if(n(f?.name)==='pollux'){
  const d=$('ns-mj-guide'),b=$('ns-mj-guide-body');d.open=true;
  b.innerHTML='<h3>🦉 Pollux — hibours allié</h3><p>Contrôlé par le MJ, possède sa propre initiative et ses actions. La fiche hibours du bestiaire sert de référence. <b>Il ne reçoit pas de part des XP des quatre PJ.</b></p><p>Attention : son FP 3 peut écraser certaines rencontres prévues pour quatre personnages niveau 2. Adapte sa participation.</p>';
  showStatus('Allié MJ');
 }
}
function start(){
 const combat=$('combat'),fightersBox=$('fighters');
 if(!combat||!fightersBox||$('ns-mj-guide'))return;
 const panel=document.createElement('details');panel.id='ns-mj-guide';panel.className='card';
 panel.innerHTML='<summary style="cursor:pointer"><b>📖 Aide MJ • capacités et règles des PJ</b> <span id="ns-mj-guide-status" class="mini">Cliquer un PJ dans la frise ou choisir ci-dessous.</span></summary>'+
 '<div class="mg-choices">'+IDS.map(id=>'<button type="button" data-mj-pj="'+id+'">'+LABELS[id]+'</button>').join('')+'</div>'+
 '<div id="ns-mj-guide-body"><p>Choisis un PJ pour consulter ses attaques, sorts, capacités, synergies et la dernière copie de son équipement — sans livre de règles.</p></div>';
 combat.insertBefore(panel,fightersBox.parentElement===combat?fightersBox:combat.firstChild);
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-mj-pj]');if(b)openPlayer(b.dataset.mjPj);});
 fightersBox.addEventListener('click',onClick,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
