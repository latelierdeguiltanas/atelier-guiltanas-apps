/* Lelio niveau 2 — Forme sauvage et Compagnon sauvage D&D 2024.
   Migration idempotente; le sac et les possessions du joueur restent locaux/serveur, intacts. */
(()=>{
 'use strict';
 if(typeof DATA==='undefined'||typeof S==='undefined'||DATA.id!=='lelio'||DATA.level!==2)return;
 const wild=DATA.resources.find(r=>r.id==='wildShape');
 const slots=DATA.resources.find(r=>r.id==='slots');
 if(!wild||!slots)return;
 if(!S.resources||typeof S.resources!=='object')S.resources={};
 if(!Number.isInteger(S.resources.wildShape))S.resources.wildShape=0;
 if(!Array.isArray(S.wildForms))S.wildForms=[];
 // Chaque forme retenue doit être déclarée par le joueur : le PDF n'indique pas les noms.
 S.wildForms=S.wildForms.slice(0,4).map(x=>({
   name:String(x?.name||'').slice(0,80),cr:['0','1/8','1/4'].includes(x?.cr)?x.cr:'0',
   ac:String(x?.ac||'').slice(0,12),attack:String(x?.attack||'').slice(0,80),
   speed:String(x?.speed||'').slice(0,60),notes:String(x?.notes||'').slice(0,200)
 }));
 if(typeof S.wildFormsLocked!=='boolean')S.wildFormsLocked=S.wildForms.length===4;
 if(typeof S.wildFormSwapCredit!=='number')S.wildFormSwapCredit=0;
 if(!S.activeWildShape||typeof S.activeWildShape!=='object')S.activeWildShape=null;
 if(!S.wildCompanion||typeof S.wildCompanion!=='object')S.wildCompanion=null;
 if(!S.lelioLevel2Migrated){
   const before=Number(S.hp);
   if(Number.isFinite(before)&&before>0)S.hp=Math.max(0,Math.min(DATA.maxHP,before+10));
   // Niveau 2 : cinq sorts préparés (contre quatre au niveau 1).
   // Les anciens choix restent sélectionnés ; la liste doit être complétée puis verrouillée.
   if(!Array.isArray(S.prepared))S.prepared=[];
   if(S.prepared.length<DATA.prepCount){S.prepLocked=false;S.prepSwapAvailable=false;}
   S.lelioLevel2Migrated=true;
   save();
 }
 const active=()=>!!S.activeWildShape;
 const nameOf=i=>S.wildForms[i]?.name||'Bête inconnue';
 const freeShape=()=>Math.max(0,wild.max-(S.resources.wildShape||0));
 const freeSlots=()=>Math.max(0,slots.max-(S.resources.slots||0));
 const safe=x=>esc(String(x??''));
 const formLabel=()=>active()?nameOf(S.activeWildShape.index):'Forme normale';
 const infoForm=()=>'<div class="learn">Le PDF ne donne pas les statistiques des quatre bêtes choisies. Les valeurs de CA, de vitesse et d\'attaque doivent provenir des blocs de bêtes validés par le MJ. Ne réutilise pas les attaques ni la CA humaine de Lelio.</div>';
 function formCard(form,i){
   return '<div class="step"><b>'+safe(form.name)+' — FP '+safe(form.cr)+'</b>'+
     '<div>CA : '+safe(form.ac||'voir bloc de bête')+' • Vitesse : '+safe(form.speed||'voir bloc de bête')+
     ' • Attaque : '+safe(form.attack||'voir bloc de bête')+'</div>'+
     (form.notes?'<small>'+safe(form.notes)+'</small>':'')+
     (!active()||S.activeWildShape.index!==i?'<button class="btn primary" onclick="startWildShape('+i+')">Devenir cette bête</button>':'<b> ✓ Forme actuelle</b>')+
     '</div>';
 }
 window.openWildForms=function(){
   const list=S.wildForms;
   const rows=Array.from({length:4},(_,i)=>{
     const form=list[i]||{},editable=!S.wildFormsLocked||S.wildFormSwapCredit>0;
     return '<div class="step"><b>Forme '+(i+1)+'</b>'+
       '<label class="tapnote">Nom de la bête (choix validé par le MJ)</label>'+
       '<input id="lf-name-'+i+'" class="search" maxlength="80" value="'+safe(form.name||'')+'" '+(editable?'':'readonly')+' placeholder="Nom de la bête">'+
       '<label class="tapnote">FP max 1/4, sans vitesse de vol</label>'+
       '<select id="lf-cr-'+i+'" class="search" '+(editable?'':'disabled')+'>'+
       ['0','1/8','1/4'].map(cr=>'<option value="'+cr+'" '+((form.cr||'0')===cr?'selected':'')+'>'+cr+'</option>').join('')+'</select>'+
       '<label class="tapnote">CA (facultatif, valeur du bloc)</label><input id="lf-ac-'+i+'" class="search" maxlength="12" value="'+safe(form.ac||'')+'" placeholder="Ex. 13">'+
       '<label class="tapnote">Attaque (facultatif, du bloc)</label><input id="lf-attack-'+i+'" class="search" maxlength="80" value="'+safe(form.attack||'')+'" placeholder="Ex. morsure +4, 2d4+2">'+
       '<label class="tapnote">Vitesse (facultatif, du bloc)</label><input id="lf-speed-'+i+'" class="search" maxlength="60" value="'+safe(form.speed||'')+'" placeholder="Ex. 12 m">'+
       '<label class="tapnote">Autres capacités (facultatif)</label><input id="lf-notes-'+i+'" class="search" maxlength="200" value="'+safe(form.notes||'')+'" placeholder="Capacités de la bête">'+
       '</div>';
   }).join('');
   openM('<h2>🐾 Mes quatre formes animales</h2>'+
     '<div class="learn">À renseigner avec les quatre bêtes connues. FP 0, 1/8 ou 1/4 ; aucune vitesse de vol. Les choix ne sont pas indiqués dans le PDF. Les formes enregistrées sont conservées sur cet appareil.</div>'+
     (S.wildFormsLocked?'<p>Formes verrouillées. Remplacement disponible après repos long : '+S.wildFormSwapCredit+'. Les détails de stats restent modifiables.</p>':'<p>Première saisie : indique les quatre noms et leur FP.</p>')+
     '<div class="list">'+rows+'</div>'+
     '<button class="btn primary" style="width:100%;margin-top:10px" onclick="saveWildForms()">✓ Enregistrer mes quatre formes</button>');
 };
 window.saveWildForms=function(){
   const get=(field,i)=>document.getElementById('lf-'+field+'-'+i)?.value?.trim()||'';
   const draft=Array.from({length:4},(_,i)=>({
     name:get('name',i).slice(0,80),cr:get('cr',i)||'0',
     ac:get('ac',i).slice(0,12),attack:get('attack',i).slice(0,80),
     speed:get('speed',i).slice(0,60),notes:get('notes',i).slice(0,200)
   }));
   if(draft.some(x=>!x.name||!['0','1/8','1/4'].includes(x.cr)))
     return info('Formes incomplètes','Renseigne les quatre noms et leurs FP (0, 1/8 ou 1/4). Elles doivent toutes être des bêtes sans vol, autorisées par le MJ.');
   if(new Set(draft.map(x=>x.name.toLocaleLowerCase('fr'))).size!==4)
     return info('Formes dupliquées','Les quatre formes doivent correspondre à quatre bêtes distinctes.');
   const changed=draft.filter((x,i)=>x.name!==S.wildForms[i]?.name||x.cr!==S.wildForms[i]?.cr).length;
   if(S.wildFormsLocked&&changed>S.wildFormSwapCredit)
     return info('Choix verrouillés','Après un repos long, tu peux remplacer une seule forme connue. Tu peux modifier la CA, la vitesse et les notes sans changer de bête.');
   if(active()&&draft[S.activeWildShape.index]?.name!==nameOf(S.activeWildShape.index))
     return info('Transformation active','Termine la forme sauvage actuelle avant de changer cette forme connue.');
   if(S.wildFormsLocked)S.wildFormSwapCredit=Math.max(0,S.wildFormSwapCredit-changed);
   S.wildForms=draft;S.wildFormsLocked=true;save();closeM();render();
   info('Formes enregistrées','Quatre formes connues enregistrées sur cet appareil. Le MJ doit confirmer leurs blocs de statistiques et l’absence de vol.');
 };
 window.openWildShape=function(){
   let msg='<h2>🐾 Forme sauvage</h2><div class="learn"><b>'+freeShape()+'/2 utilisations restantes.</b> '+
     'Transformation en action bonus ; durée 1 h ; +2 PV temporaires ; conserve tes PV et ta concentration. Tu ne peux pas lancer de nouveau sort sous cette forme.</div>';
   if(active())msg+='<div class="warn"><b>Actuellement : '+safe(formLabel())+'</b>. Revenir à forme normale exige une action bonus.</div>'+
     '<button class="btn" style="width:100%;margin-bottom:10px" onclick="endWildShape()">Reprendre forme normale</button>';
   if(S.wildForms.length<4)msg+='<div class="warn">Tu dois d\'abord enregistrer les quatre formes apprises. Les noms ne figurent pas sur le PDF.</div>';
   else msg+='<div class="steps">'+S.wildForms.map(formCard).join('')+'</div>';
   msg+=infoForm()+'<button class="btn" style="width:100%;margin-top:10px" onclick="openWildForms()">⚙️ Configurer les quatre formes</button>';
   openM(msg);
 };
 window.startWildShape=function(i){
   const t=ensureTurn(),f=S.wildForms[i];
   if(!f||!S.wildFormsLocked)return info('Choix manquant','Enregistre d’abord les quatre formes connues.');
   if(t.bonus)return info('Action bonus déjà utilisée','La transformation réclame une action bonus disponible.');
   if(freeShape()<1)return info('Forme sauvage épuisée','Plus d\'utilisation disponible. Un repos court en restaure une ; un long repos restaure les deux.');
   if(S.hp<=0)return info('À 0 PV','Lelio doit être conscient pour utiliser une action bonus.');
   S.resources.wildShape=(S.resources.wildShape||0)+1;
   S.activeWildShape={index:i,startedAt:Date.now()};
   S.tempHP=Math.max(2,Number(S.tempHP)||0);
   t.bonus='Forme sauvage — '+f.name;save();closeM();render();
   info('Forme sauvage activée','<b>'+safe(f.name)+'</b> • 1 h • 2 PV temporaires minimum, non cumulables.'+infoForm());
 };
 window.endWildShape=function(){
   if(!active())return;
   const t=ensureTurn();
   if(t.bonus)return info('Action bonus indisponible','Quitter la forme sauvage volontairement coûte une action bonus. Réessaie lors de ton prochain tour.');
   S.activeWildShape=null;
   t.bonus='Fin de Forme sauvage';
   save();closeM();render();
   info('Forme normale retrouvée','Les statistiques habituelles de Lelio s’appliquent à nouveau. Les PV actuels sont conservés.');
 };
 window.openWildCompanion=function(){
   const options='<div class="btnrow">'+
     '<button class="btn primary" onclick="summonWildCompanion(\'wild\')">1 Forme sauvage ('+freeShape()+')</button>'+
     '<button class="btn" onclick="summonWildCompanion(\'slot\')">1 emplacement ('+freeSlots()+')</button></div>';
   openM('<h2>🦉 Compagnon sauvage</h2><div class="learn">Invoque un familier féerique avec une action Magie, sans composantes matérielles, pour 1 utilisation de Forme sauvage ou 1 emplacement de sort N1. Il disparaît au repos long.</div>'+
     (S.wildCompanion?'<div class="step"><b>Familier actuel</b>'+safe(S.wildCompanion.name)+' — '+safe(S.wildCompanion.form)+
     '<button class="btn" onclick="markWildCompanionGone()">Marquer comme disparu</button></div>':'')+
     '<label class="tapnote">Nom du familier (facultatif)</label><input class="search" id="wc-name" maxlength="60" placeholder="Nom">'+
     '<label class="tapnote">Apparence validée par le MJ</label><input class="search" id="wc-form" maxlength="80" placeholder="Ex. chouette">'+
     options+'<div class="tapnote">Statistiques : celles du sort Appel de familier, sans bloc inventé.</div>');
 };
 window.summonWildCompanion=function(cost){
   const t=ensureTurn();
   if(t.action)return info('Action indisponible','L’invocation exige une action Magie disponible.');
   if(active())return info('Transformation active','Tu ne peux pas lancer un sort pendant une Forme sauvage.');
   if(cost!=='wild'&&cost!=='slot')return;
   if(cost==='wild'&&freeShape()<1)return info('Forme sauvage épuisée','Tu n’as plus d’utilisation disponible.');
   if(cost==='slot'&&(freeSlots()<1||t.slotSpellThisTurn))return info('Emplacement indisponible','Il faut un emplacement N1 et ne pas avoir déjà dépensé un emplacement pendant ce tour.');
   const form=(document.getElementById('wc-form')?.value||'').trim().slice(0,80);
   const nickname=(document.getElementById('wc-name')?.value||'').trim().slice(0,60);
   if(!form)return info('Apparence manquante','Renseigne l’apparence du familier décidée avec le MJ.');
   if(cost==='wild')S.resources.wildShape=(S.resources.wildShape||0)+1;
   else{S.resources.slots=(S.resources.slots||0)+1;t.slotSpellThisTurn=true;}
   t.action='Compagnon sauvage — '+form;
   S.wildCompanion={name:nickname||form,form,createdAt:Date.now(),cost};
   save();closeM();render();
   info('Familier invoqué','<b>'+safe(nickname||form)+'</b> • Fée • disparaît au prochain repos long. Ressource consommée : '+
     (cost==='wild'?'1 utilisation de Forme sauvage.':'1 emplacement de niveau 1.'));
 };
 window.markWildCompanionGone=function(){
   if(!S.wildCompanion)return;
   if(!confirm('Marquer ce familier comme disparu ?'))return;
   S.wildCompanion=null;save();closeM();render();
 };
 // Une Forme sauvage ne peut pas lancer de sorts et doit utiliser les statistiques de la bête.
 const prevSpellTiming=spellTiming;
 spellTiming=function(s,kind){return !active()&&prevSpellTiming(s,kind);};
 const prevChooseMagic=chooseMagic;
 chooseMagic=function(kind){return active()?info('Magie indisponible','Aucun sort ne peut être lancé en forme animale. La concentration déjà en cours reste active.'):prevChooseMagic(kind);};
 const prevCommitSpellUse=commitSpellUse;
 commitSpellUse=function(id,kind,mode){return active()?info('Magie indisponible','Termine d’abord la Forme sauvage pour lancer un sort.'):prevCommitSpellUse(id,kind,mode);};
 const prevUseSpell=useSpell;
 useSpell=function(id,mode){return active()?info('Magie indisponible','Termine d’abord la Forme sauvage pour lancer un sort.'):prevUseSpell(id,mode);};
 const prevOpenSpell=openSpell;
 openSpell=function(id){return active()?info('Magie indisponible','Les sorts sont consultables après avoir repris forme normale.'):prevOpenSpell(id);};
 const prevChooseAttack=chooseAttack;
 chooseAttack=function(){return active()?openWildAttack():prevChooseAttack();};
 const prevOpenWeapon=openWeapon;
 openWeapon=function(id){return active()?info('Attaque humaine non applicable',infoForm()):prevOpenWeapon(id);};
 window.openWildAttack=function(){
   if(!active())return;
   const f=S.wildForms[S.activeWildShape.index];
   openM('<h2>🐾 Attaque animale — '+safe(f?.name||'Bête')+'</h2>'+
     '<div class="step"><b>Statistiques du bloc de la bête</b>CA : '+safe(f?.ac||'à vérifier')+
     ' • Vitesse : '+safe(f?.speed||'à vérifier')+'<div class="calc">'+safe(f?.attack||'Attaque à vérifier avec le MJ')+'</div></div>'+
     '<div class="tapnote">Les dégâts et les règles propres à la bête se résolvent normalement. Cette action enregistre uniquement ton action du tour.</div>'+
     '<button class="btn primary" onclick="commitWildAttack()">✓ Confirmer l’attaque de la bête</button>');
 };
 window.commitWildAttack=function(){
   if(!active())return;
   if(!consumeTurn('action','Attaque animale — '+formLabel()))return info('Action déjà utilisée','L’action du tour est déjà dépensée.');
   closeM();render();
 };
 const prevBonusMenu=bonusMenu;
 bonusMenu=function(){
   prevBonusMenu();
   const sheet=document.getElementById('sheet');
   sheet?.insertAdjacentHTML('beforeend','<div class="section"><button class="item" onclick="'+
     (active()?'endWildShape()':'openWildShape()')+'"><strong>🐾 '+(active()?'Quitter la Forme sauvage':'Prendre une Forme sauvage')+
     '</strong><small>Action bonus • '+freeShape()+'/2 utilisations</small></button></div>');
 };
 const prevActionMenu=actionMenu;
 actionMenu=function(){
   prevActionMenu();
   const sheet=document.getElementById('sheet');
   sheet?.insertAdjacentHTML('beforeend','<div class="section">'+
     (active()?'<button class="item" onclick="openWildAttack()"><strong>🐾 Attaque animale</strong><small>Selon le bloc de la bête sélectionnée</small></button>':
     '<button class="item" onclick="openWildCompanion()"><strong>🦉 Compagnon sauvage</strong><small>1 utilisation de Forme sauvage ou 1 emplacement N1</small></button>')+'</div>');
 };
 const prevRenderCombat=renderCombat;
 renderCombat=function(){
   prevRenderCombat();
   const host=document.getElementById('combat');
   if(!host)return;
   const summary='<div class="card"><h3>🐾 Forme sauvage — '+freeShape()+'/2</h3>'+
     '<p>État : <b>'+safe(formLabel())+'</b> • '+S.wildForms.length+'/4 formes enregistrées</p>'+
     (active()?'<div class="warn">En forme animale : pas de nouveau sort. Les attaques, la CA et la vitesse de Lelio affichées ci-dessous ne s’appliquent pas ; utiliser le bloc de la bête.</div>':'')+
     '<div class="btnrow"><button class="btn primary" onclick="openWildShape()">Forme sauvage</button>'+
     '<button class="btn" onclick="openWildForms()">Mes 4 bêtes</button><button class="btn" onclick="openWildCompanion()">Familier</button></div>'+
     (S.wildCompanion?'<p>🦉 Familier : '+safe(S.wildCompanion.name)+'</p>':'')+'</div>';
   host.insertAdjacentHTML('afterbegin',summary);
 };
 const prevRenderHome=renderHome;
 renderHome=function(){
   prevRenderHome();
   const host=document.getElementById('home');
   if(host)host.insertAdjacentHTML('beforeend','<div class="section"><div class="card"><h3>🐾 Forme sauvage</h3><p>'+freeShape()+'/2 utilisations • '+safe(formLabel())+'</p>'+
     '<button class="btn primary" onclick="openWildShape()">Gérer la transformation</button></div></div>');
 };
 const prevRenderMagic=renderMagic;
 renderMagic=function(){
   prevRenderMagic();
   const host=document.getElementById('magic');
   if(host)host.insertAdjacentHTML('afterbegin','<div class="card"><h3>🦉 Compagnon sauvage</h3>'+
     '<p>Fée invoquée par une action Magie. Dépense un emplacement N1 ou une Forme sauvage.</p>'+
     (S.wildCompanion?'<p>Familier actuel : '+safe(S.wildCompanion.name)+'</p>':'')+
     '<button class="btn primary" onclick="openWildCompanion()">Gérer le familier</button></div>');
 };
 // Repos court : règle D&D 2024 (une Forme sauvage restaurée) et dés de vie conservés.
 shortRest=function(){
   if(S.hp<=0)return info('Repos court impossible','Il faut au moins 1 PV pour commencer un repos court.');
   if(!confirm('Appliquer un repos court d’au moins 1 heure ?'))return;
   DATA.resources.filter(r=>r.rest==='short').forEach(r=>S.resources[r.id]=0);
   const before=freeShape();
   S.resources.wildShape=Math.max(0,(S.resources.wildShape||0)-1);
   let msg='Rugissement intimidant récupéré. Forme sauvage : '+freeShape()+'/2 utilisations ('+(freeShape()>before?'+1':'déjà au maximum')+').';
   if(S.hp<DATA.maxHP&&S.hitDiceUsed<DATA.level&&confirm('Dépenser 1 dé de vie d8 pour récupérer des PV ?')){
     const roll=1+Math.floor(Math.random()*8),heal=Math.max(1,roll+(DATA.abilities?.CON?.[1]||0)),old=S.hp;
     S.hp=Math.min(DATA.maxHP,S.hp+heal);
     S.hitDiceUsed=(S.hitDiceUsed||0)+1;
     msg+='<br><br>Dé de vie : '+roll+' + '+(DATA.abilities?.CON?.[1]||0)+' CON = '+heal+' PV ('+(S.hp-old)+' effectivement récupérés).';
   }
   save();render();info('Repos court terminé',msg);
 };
 const prevLongRest=longRest;
 longRest=function(){
   const turnBefore=ensureTurn();
   prevLongRest();
   if(S.turn===turnBefore)return; // Confirmation annulée.
   S.activeWildShape=null;
   S.wildCompanion=null;
   S.wildFormSwapCredit=S.wildFormsLocked?1:0;
   save();render();
 };
 save();render();
})();
