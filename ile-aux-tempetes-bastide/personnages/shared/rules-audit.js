/* Île aux Tempêtes — correctifs de règles D&D 2024 communs aux 4 PJ.
   Chargé après engine.html pour garder un moteur unique sans dupliquer les fiches. */
(()=>{
  const HIT_DIE={Paladin:10,'Rôdeur':10,Druide:8,'Ensorceleur':6};
  const conMod=()=>DATA.abilities?.CON?.[1]||0;
  const hitDie=()=>HIT_DIE[DATA.class]||8;

  DATA.shortRest=true; // Tout PJ peut prendre un repos court et dépenser ses dés de vie.
  if(typeof S.hitDiceUsed!=='number')S.hitDiceUsed=0;
  if(DATA.magicMode==='prepare4'&&typeof S.prepLocked!=='boolean')S.prepLocked=S.prepared.length===DATA.prepCount;
  if(typeof S.prepSwapAvailable!=='boolean')S.prepSwapAvailable=false;
  if(!('prepSwapRemoved' in S))S.prepSwapRemoved=null;
  if(typeof S.innateSorceryActive!=='boolean')S.innateSorceryActive=false;
  if(typeof S.innateSorceryRounds!=='number')S.innateSorceryRounds=0;

  const baseEnsureTurn=ensureTurn;
  ensureTurn=function(){
    const t=baseEnsureTurn();
    if(typeof t.slotSpellThisTurn!=='boolean')t.slotSpellThisTurn=false;
    return t;
  };

  const baseSpellTiming=spellTiming;
  spellTiming=function(s,kind){
    if(s&&s.level>0&&!spellAvailable(s))return false;
    return baseSpellTiming(s,kind);
  };

  const baseCommitSpellUse=commitSpellUse;
  commitSpellUse=function(id,kind,mode){
    const s=DATA.spells.find(x=>x.id===id),key=kind==='bonus'?'bonus':kind==='reaction'?'reaction':'action';
    if(!s)return;
    const t=ensureTurn();
    if(t[key])return;
    if(mode==='slot'&&t.slotSpellThisTurn)return info('Limite de magie','D&D 2024 : tu as déjà dépensé un emplacement de sort pendant ce tour. Tu ne peux pas en dépenser un second avant ton prochain tour.');
    if(mode==='slot'&&remaining('slots')<=0)return info('Plus d’emplacement','Tu n’as plus d’emplacement de niveau 1.');
    if(mode==='free'&&(!s.freeResource||remaining(s.freeResource)<=0))return info('Utilisation gratuite dépensée','Cette utilisation gratuite n’est plus disponible.');
    if(mode==='slot')t.slotSpellThisTurn=true;
    baseCommitSpellUse(id,kind,mode);
  };

  const baseApplyHP=applyHP;
  applyHP=function(mode){
    const el=document.getElementById('num');
    const n=Math.max(0,parseInt(el?.value||0));
    const concentrationBefore=S.concentration;
    baseApplyHP(mode);
    if(mode!=='damage'||n<=0||!concentrationBefore)return;
    if(S.hp<=0){
      S.concentration=null;save();render();
      return setTimeout(()=>info('Concentration interrompue','À 0 PV tu es Inconscient et donc Incapacité : la concentration prend fin automatiquement.'),0);
    }
    const dc=Math.min(30,Math.max(10,Math.floor(n/2)));
    setTimeout(()=>info('Test de concentration',`Tu as subi <b>${n} dégâts</b> en te concentrant sur <b>${esc(concentrationBefore)}</b>.<br><br>Fais un <b>jet de sauvegarde de Constitution DD ${dc}</b>. En cas d’échec, arrête la concentration depuis « Ressources ».`),0);
  };

  longRest=function(){
    if(S.hp<=0)return info('Repos long impossible','Il faut avoir au moins 1 PV pour commencer un repos long.');
    if(!confirm('Appliquer un repos long ? PV, dés de vie et ressources seront récupérés.'))return;
    DATA.resources.filter(r=>r.rest==='long'||r.rest==='short').forEach(r=>S.resources[r.id]=0);
    S.hp=DATA.maxHP;
    S.tempHP=0;
    S.hitDiceUsed=0;
    S.concentration=null;
    S.innateSorceryActive=false;
    S.innateSorceryRounds=0;
    S.turn={action:null,bonus:null,reaction:null,moveLeft:speedCases(),moveMax:speedCases(),slotSpellThisTurn:false};
    if(DATA.magicMode==='prepare4'&&S.prepLocked&&S.prepared.length===DATA.prepCount){S.prepSwapAvailable=true;S.prepSwapRemoved=null;}
    save();render();
    setTimeout(()=>info('Repos long terminé',`PV restaurés à <b>${DATA.maxHP}</b>, PV temporaires retirés, dés de vie et ressources récupérés.${DATA.magicMode==='prepare4'?'<br><br>Tu peux remplacer <b>un seul</b> sort de Druide préparé avant le prochain repos long.':''}`),0);
  };

  shortRest=function(){
    if(S.hp<=0)return info('Repos court impossible','Il faut avoir au moins 1 PV pour commencer un repos court.');
    if(!confirm('Appliquer un repos court d’au moins 1 heure ?'))return;
    DATA.resources.filter(r=>r.rest==='short').forEach(r=>S.resources[r.id]=0);
    let msg='Les capacités récupérées au repos court sont de nouveau disponibles.';
    const maxDice=DATA.level;
    if(S.hp<DATA.maxHP&&S.hitDiceUsed<maxDice&&confirm(`Dépenser 1 dé de vie d${hitDie()} pour récupérer des PV ?`)){
      const roll=1+Math.floor(Math.random()*hitDie());
      const heal=Math.max(1,roll+conMod());
      const before=S.hp;
      S.hp=Math.min(DATA.maxHP,S.hp+heal);
      S.hitDiceUsed++;
      msg+=`<br><br>Dé de vie : <b>${roll}</b> ${fmt(conMod())} CON = <b>${heal} PV</b> (${S.hp-before} effectivement récupérés).`;
    }
    save();render();setTimeout(()=>info('Repos court terminé',msg),0);
  };

  const baseResetTurn=resetTurn;
  resetTurn=function(){
    if(S.innateSorceryActive){
      S.innateSorceryRounds=Math.max(0,S.innateSorceryRounds-1);
      if(S.innateSorceryRounds===0)S.innateSorceryActive=false;
    }
    baseResetTurn();
  };

  const baseCommitFeature=commitFeature;
  commitFeature=function(id,kind){
    if(id!=='innate')return baseCommitFeature(id,kind);
    const f=(DATA.features||[]).find(x=>x.id===id),r=DATA.resources.find(x=>x.id===f?.resource);
    if(!f||!r)return;
    if(S.innateSorceryActive)return info('Sorcellerie innée déjà active',`Elle reste active encore environ <b>${S.innateSorceryRounds}</b> tour(s).`);
    if(remaining(r.id)<=0)return info('Ressource épuisée','Sorcellerie innée n’a plus d’utilisation avant le prochain repos long.');
    if(!consumeTurn('bonus',f.name))return;
    S.resources[r.id]=(S.resources[r.id]||0)+1;
    S.innateSorceryActive=true;S.innateSorceryRounds=10;
    save();closeM();renderCombat();
    info('Sorcellerie innée active','Pendant 1 minute : <b>DD +1 pour les sorts d’Ensorceleur</b> et <b>Avantage aux jets d’attaque des sorts d’Ensorceleur</b>. Les sorts de Génasi ou d’Initié à la magie ne reçoivent pas ces bénéfices.');
  };

  const baseOpenSpell=openSpell;
  openSpell=function(id){
    const s=DATA.spells.find(x=>x.id===id);if(!s)return;
    const sorcBoost=S.innateSorceryActive&&s.source==='Ensorceleur';
    const oldSave=s.save;
    if(sorcBoost&&s.save)s.save=s.save.replace(/DD\s*13\b/g,'DD 14');
    baseOpenSpell(id);
    s.save=oldSave;
    if(sorcBoost){
      const sheet=document.getElementById('sheet');
      if(sheet)sheet.insertAdjacentHTML('beforeend',`<div class="learn"><b>🔥 Sorcellerie innée active :</b> ${s.attack!=null?'Avantage sur le jet d’attaque de ce sort. ':''}${oldSave?'Le DD de ce sort est augmenté de 1.':''}</div>`);
    }
  };

  const baseOpenResources=openResources;
  openResources=function(){
    baseOpenResources();
    const sheet=document.getElementById('sheet');if(!sheet)return;
    const maxDice=DATA.level, left=Math.max(0,maxDice-S.hitDiceUsed);
    sheet.insertAdjacentHTML('beforeend',`<div class="resource"><span>Dés de vie d${hitDie()}</span><b>${left}/${maxDice}</b></div>${S.innateSorceryActive?`<div class="learn"><b>Sorcellerie innée active</b> • ~${S.innateSorceryRounds} tour(s) restant(s)<br><button class="btn danger" style="width:100%;margin-top:8px" onclick="S.innateSorceryActive=false;S.innateSorceryRounds=0;save();closeM();render()">Arrêter l’effet</button></div>`:''}`);
  };

  const baseRenderMagic=renderMagic;
  renderMagic=function(){
    baseRenderMagic();
    const root=document.getElementById('magic');if(!root)return;
    if(S.innateSorceryActive){
      root.insertAdjacentHTML('afterbegin',`<div class="learn"><b>🔥 Sorcellerie innée active</b> — sorts d’Ensorceleur : DD ${DATA.spellDC+1} et Avantage aux jets d’attaque. ~${S.innateSorceryRounds} tour(s) restant(s).</div>`);
    }
    if(DATA.magicMode==='prepare4'){
      const h=[...root.querySelectorAll('h2')].find(x=>x.textContent.includes('Préparer tes sorts'));
      const note=h?.parentElement?.querySelector('.tapnote');
      if(note){
        if(!S.prepLocked)note.innerHTML=`Préparation initiale : choisis exactement <b>${DATA.prepCount}</b> sorts de Druide. Quand le 4e est choisi, l’application te demandera de confirmer.`;
        else if(S.prepSwapRemoved)note.innerHTML=`Tu as retiré <b>${esc(DATA.spells.find(x=>x.id===S.prepSwapRemoved)?.name||'un sort')}</b>. Choisis maintenant son remplaçant.`;
        else if(S.prepSwapAvailable)note.innerHTML='Après ce repos long, tu peux remplacer <b>un seul</b> de tes quatre sorts préparés.';
        else note.innerHTML='Tes quatre sorts sont préparés. D&D 2024 permet d’en remplacer <b>un seul</b> après chaque repos long.';
      }
    }
    root.insertAdjacentHTML('beforeend','<div class="tapnote" style="margin-top:10px">En combat, lance les sorts depuis l’onglet <b>Combat</b> afin que les actions, réactions et la limite d’un emplacement dépensé par tour soient suivies.</div>');
  };

  const baseTogglePrep=togglePrep;
  togglePrep=function(id){
    if(DATA.magicMode!=='prepare4')return;
    if(!S.prepLocked){
      baseTogglePrep(id);
      if(S.prepared.length===DATA.prepCount&&confirm(`Valider ces ${DATA.prepCount} sorts préparés ? Ensuite ils resteront verrouillés jusqu’au prochain repos long (un remplacement maximum).`)){
        S.prepLocked=true;S.prepSwapAvailable=false;S.prepSwapRemoved=null;save();renderMagic();
      }
      return;
    }
    if(!S.prepSwapAvailable&&!S.prepSwapRemoved){
      renderMagic();return info('Préparation verrouillée','D&D 2024 : tu peux remplacer un seul sort de Druide préparé après un repos long.');
    }
    const has=S.prepared.includes(id);
    if(!S.prepSwapRemoved){
      if(!has){renderMagic();return info('Choisis d’abord le sort à remplacer','Touche d’abord l’un de tes quatre sorts actuellement préparés.');}
      S.prepared=S.prepared.filter(x=>x!==id);S.prepSwapRemoved=id;save();renderMagic();return;
    }
    if(id===S.prepSwapRemoved){
      S.prepared.push(id);S.prepSwapRemoved=null;save();renderMagic();return;
    }
    if(has){renderMagic();return;}
    S.prepared.push(id);S.prepSwapAvailable=false;S.prepSwapRemoved=null;save();renderMagic();
  };

  save();render();
})();