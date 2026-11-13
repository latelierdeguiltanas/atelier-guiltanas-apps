/* Prométhée / Loris : ensorceleur niveau 2, D&D 2024. 
   Migrations locales idempotentes : sac, pièces, usages et notes inchangés. */
(()=>{
  'use strict';
  if(typeof DATA==='undefined'||typeof S==='undefined'||DATA.id!=='loris'||DATA.level!==2)return;
  const slots=DATA.resources.find(r=>r.id==='slots');
  const sorcery=DATA.resources.find(r=>r.id==='sorceryPoints');
  if(!slots||!sorcery)return;
  const BASE_SLOTS=3;
  if(!S.resources||typeof S.resources!=='object')S.resources={};
  if(!Number.isInteger(S.createdSorcererSlots)||S.createdSorcererSlots<0)S.createdSorcererSlots=0;
  if(!Number.isInteger(S.resources.sorceryPoints))S.resources.sorceryPoints=0;
  function recalc(){slots.max=BASE_SLOTS+S.createdSorcererSlots;}
  function points(){return Math.max(0,sorcery.max-(S.resources.sorceryPoints||0));}
  function availableSlots(){return Math.max(0,slots.max-(S.resources.slots||0));}
  recalc();
  if(!S.lorisLevel2Migrated){
    const oldHP=Number(S.hp);
    // +8 au maximum précédent (8 -> 16), sans soigner les blessures subies et sans relever 0 PV.
    if(Number.isFinite(oldHP)&&oldHP>0)S.hp=Math.min(DATA.maxHP,Math.max(0,oldHP+8));
    S.lorisLevel2Migrated=true;
    save();
  }

  // Les autres fiches continuent à utiliser leurs propres règles de lancement.
  const previousSpellTiming=spellTiming;
  spellTiming=function(s,kind){
    if(s?.level>0&&ensureTurn().quickenedThisTurn)return false;
    return previousSpellTiming(s,kind);
  };
  const previousCommitSpellUse=commitSpellUse;
  commitSpellUse=function(id,kind,mode){
    const s=DATA.spells.find(x=>x.id===id),t=ensureTurn();
    if(!s)return;
    if(s.level>0&&t.quickenedThisTurn)return info('Sort de niveau 1 indisponible','Après Sort accéléré, tu ne peux pas lancer de sort de niveau 1 ou supérieur pendant ce même tour.');
    const key=kind==='bonus'?'bonus':kind==='reaction'?'reaction':'action',before=t[key];
    const out=previousCommitSpellUse(id,kind,mode);
    if(!before&&t[key]==='Magie — '+s.name&&s.level>0){t.castLevelledThisTurn=true;save();}
    return out;
  };
  const previousUseSpell=useSpell;
  useSpell=function(id,mode){
    const s=DATA.spells.find(x=>x.id===id),t=ensureTurn();
    if(!s)return;
    if(s.level>0&&t.quickenedThisTurn)return info('Sort de niveau 1 indisponible','Tu as déjà utilisé Sort accéléré ce tour-ci.');
    const prevSlots=S.resources.slots||0, prevFree=s.freeResource?(S.resources[s.freeResource]||0):0;
    const out=previousUseSpell(id,mode);
    const applied=mode==='slot'?(S.resources.slots||0)>prevSlots:mode==='free'&&s.freeResource?(S.resources[s.freeResource]||0)>prevFree:mode==='ritual';
    if(s.level>0&&applied){t.castLevelledThisTurn=true;save();}
    return out;
  };
  const previousLongRest=longRest;
  longRest=function(){
    const oldTurn=ensureTurn();
    previousLongRest();
    if(S.turn===oldTurn)return; // L'utilisateur a annulé la confirmation.
    S.createdSorcererSlots=0;
    recalc();
    S.resources.sorceryPoints=0;
    save();render();
  };

  window.convertL1SlotToSP=function(){
    if(availableSlots()<1)return info('Aucun emplacement disponible','Il faut dépenser un emplacement de niveau 1 encore disponible.');
    if(points()>=sorcery.max)return info('Réserve pleine','La réserve est déjà à 2/2 points de sorcellerie.');
    S.resources.slots=(S.resources.slots||0)+1;
    S.resources.sorceryPoints=Math.max(0,(S.resources.sorceryPoints||0)-1);
    save();closeM();render();
    info('Source de magie','1 emplacement de niveau 1 converti en <b>1 point de sorcellerie</b>. Cette conversion ne demande aucune action.');
  };
  window.createL1SlotFromSP=function(){
    const t=ensureTurn();
    if(t.bonus)return info('Action bonus dépensée','Tu as déjà utilisé ton action bonus de ce tour.');
    if(points()<2)return info('Points insuffisants','La création d’un emplacement de niveau 1 coûte 2 points de sorcellerie.');
    S.resources.sorceryPoints=(S.resources.sorceryPoints||0)+2;
    S.createdSorcererSlots++;
    recalc();
    t.bonus='Source de magie — créer 1 emplacement';
    save();closeM();render();
    info('Emplacement créé','2 points de sorcellerie dépensés, <b>1 emplacement de niveau 1 créé</b>. Cet emplacement supplémentaire disparaîtra après le prochain repos long.');
  };

  function eligibleForQuickened(s){
    return !!(s&&/^1 action(?: ou rituel)?$/i.test(s.cast||'')&&(s.level===0||s.level===1));
  }
  window.openQuickened=function(){
    const t=ensureTurn();
    if(t.bonus)return info('Action bonus déjà dépensée','Sort accéléré réclame ton action bonus.');
    if(points()<2)return info('Points insuffisants','Sort accéléré exige 2 points de sorcellerie.');
    if(t.castLevelledThisTurn||t.slotSpellThisTurn)return info('Sort accéléré impossible','Tu as déjà lancé un sort de niveau 1 ou supérieur pendant ce tour.');
    const opts=DATA.spells.filter(eligibleForQuickened);
    openM('<h2>⚡ Sort accéléré</h2><div class="learn">Dépense <b>2 points de sorcellerie</b> en plus du coût normal du sort. Le sort utilisera ton <b>action bonus</b>, pas ton action.</div>'+
      '<div class="tapnote">Tu ne pourras plus lancer de sort de niveau 1 ou supérieur pendant ce tour.</div><div class="list">'+
      opts.map(s=>'<button class="item" onclick="previewQuickened(\''+s.id+'\')"><strong>'+esc(s.name)+'</strong><small>'+(s.level===0?'Tour de magie sans emplacement':'Niveau 1 : 1 emplacement')+'</small></button>').join('')+'</div>');
  };
  window.previewQuickened=function(id){
    const s=DATA.spells.find(x=>x.id===id);
    if(!eligibleForQuickened(s))return;
    const mode=s.level===0?'cantrip':'slot';
    openM('<h2>⚡ '+esc(s.name)+'</h2><div class="learn">Lancer comme action bonus en dépensant <b>2 points de sorcellerie</b>'+
      (mode==='slot'?' et <b>1 emplacement de niveau 1</b>':'')+'.</div><div class="why">'+esc(s.effect||'')+'</div>'+
      '<button class="btn primary" style="width:100%" onclick="commitQuickened(\''+s.id+'\',\''+mode+'\')">✓ CONFIRMER LE SORT ACCÉLÉRÉ</button>'+
      '<button class="btn" style="width:100%;margin-top:8px" onclick="openQuickened()">← Retour</button>');
  };
  window.commitQuickened=function(id,mode){
    const s=DATA.spells.find(x=>x.id===id),t=ensureTurn();
    if(!eligibleForQuickened(s)||mode!==(s.level===0?'cantrip':'slot'))return;
    if(t.bonus||points()<2||t.castLevelledThisTurn||t.slotSpellThisTurn)return info('Sort accéléré indisponible','Vérifie ton action bonus, tes points de sorcellerie et les sorts déjà lancés ce tour-ci.');
    if(s.level===1&&availableSlots()<1)return info('Plus d’emplacements','Un sort de niveau 1 accéléré exige toujours son emplacement.');
    // Le gestionnaire de sorts existant valide d'abord l'action et son emplacement.
    commitSpellUse(id,'bonus',mode);
    if(t.bonus!=='Magie — '+s.name)return;
    S.resources.sorceryPoints=(S.resources.sorceryPoints||0)+2;
    t.quickenedThisTurn=true;
    if(s.level===1)t.castLevelledThisTurn=true;
    save();renderCombat();
    info('Sort accéléré confirmé','<b>2 points de sorcellerie dépensés</b> ; action bonus consommée.'+
      (s.level===1?' 1 emplacement de niveau 1 dépensé.':' Aucun emplacement dépensé.')+
      '<br><br><b>'+esc(s.name)+'</b> : '+esc(s.effect||''));
  };

  window.explainTwinned=function(){
    info('Métamagie : Sort jumelé','Coût : <b>1 point de sorcellerie</b> lorsqu’un sort peut viser <b>une créature supplémentaire</b> grâce à un emplacement d’un niveau supérieur. Au niveau 2, les sorts connus de Prométhée ne satisfont pas cette condition : aucun point n’est dépensé.');
  };

  const previousBonusMenu=bonusMenu;
  bonusMenu=function(){
    previousBonusMenu();
    const target=document.getElementById('sheet');
    if(!target)return;
    target.insertAdjacentHTML('beforeend','<div class="section"><button class="item" onclick="openQuickened()"><strong>⚡ Sort accéléré (2 PS)</strong><small>Lancer un sort d’une action comme action bonus.</small></button>'+
      '<button class="item" style="margin-top:8px" onclick="createL1SlotFromSP()"><strong>➕ Créer un emplacement (2 PS)</strong><small>Coûte une action bonus, emplacement temporaire.</small></button></div>');
  };
  const previousRenderCombat=renderCombat;
  renderCombat=function(){
    previousRenderCombat();
    const root=document.getElementById('combat');
    if(root)root.insertAdjacentHTML('beforeend','<div class="section"><h2>Source de magie — niveau 2</h2><div class="card">'+
      '<p><b>'+points()+'/2 points de sorcellerie</b> • '+availableSlots()+'/'+slots.max+' emplacements N1 disponibles</p>'+
      '<div class="btnrow"><button class="btn" onclick="openQuickened()">⚡ Sort accéléré</button><button class="btn" onclick="createL1SlotFromSP()">➕ Emplacement</button><button class="btn" onclick="convertL1SlotToSP()">↔ Vers 1 PS</button></div>'+
      '<button class="btn" style="margin-top:9px;width:100%" onclick="explainTwinned()">ℹ️ Sort jumelé — conditions</button></div></div>');
  };
  const previousRenderMagic=renderMagic;
  renderMagic=function(){
    previousRenderMagic();
    const root=document.getElementById('magic');
    if(root)root.insertAdjacentHTML('afterbegin','<div class="card"><h3>✨ Source de magie — 2 points</h3>'+
      '<p><b>'+points()+' / 2 PS disponibles</b> • <b>'+availableSlots()+' / '+slots.max+' emplacements de niveau 1</b></p>'+
      '<div class="btnrow"><button class="btn" onclick="convertL1SlotToSP()">↔ 1 sort → 1 PS</button><button class="btn" onclick="createL1SlotFromSP()">2 PS → 1 sort</button><button class="btn" onclick="openQuickened()">⚡ Accélérer</button></div>'+
      '<button class="btn" style="width:100%;margin-top:9px" onclick="explainTwinned()">Sort jumelé : voir les conditions</button></div>');
  };
  save();render();
})();
