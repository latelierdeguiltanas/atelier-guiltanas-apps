/* Correctifs de précision après seconde passe d'audit D&D 2024. */
(()=>{
  if(DATA.magicMode==='prepare4'){
    if(typeof S.prepLocked!=='boolean')S.prepLocked=S.prepared.length===DATA.prepCount;
  }

  const priorSpellAvailable=spellAvailable;
  spellAvailable=function(s){
    if(DATA.magicMode==='prepare4'&&s?.level>0&&s?.selectable&&!S.prepLocked)return false;
    return priorSpellAvailable(s);
  };

  window.lockDruidPrep=function(){
    if(DATA.magicMode!=='prepare4')return;
    if(S.prepared.length!==DATA.prepCount)return info('Préparation incomplète',`Choisis exactement ${DATA.prepCount} sorts de Druide.`);
    S.prepLocked=true;S.prepSwapAvailable=false;S.prepSwapRemoved=null;save();renderMagic();
    info('Sorts préparés validés',`Tes ${DATA.prepCount} sorts de Druide sont verrouillés jusqu'au prochain repos long.`);
  };

  togglePrep=function(id){
    if(DATA.magicMode!=='prepare4')return;
    if(S.prepLocked){renderMagic();return info('Préparation verrouillée','D&D 2024 : le Druide peut modifier librement sa liste de sorts préparés quand il termine un repos long. En dehors de ce moment, la liste reste verrouillée.');}
    if(S.prepared.includes(id))S.prepared=S.prepared.filter(x=>x!==id);
    else{if(S.prepared.length>=DATA.prepCount){alert(`Maximum : ${DATA.prepCount} sorts préparés.`);renderMagic();return}S.prepared.push(id)}
    save();renderMagic();
  };

  const priorRenderMagic=renderMagic;
  renderMagic=function(){
    priorRenderMagic();
    const root=document.getElementById('magic');if(!root||DATA.magicMode!=='prepare4')return;
    const h=[...root.querySelectorAll('h2')].find(x=>x.textContent.includes('Préparer tes sorts'));
    const section=h?.parentElement,note=section?.querySelector('.tapnote');
    if(note){
      if(S.prepLocked)note.innerHTML=`Tes <b>${DATA.prepCount}</b> sorts de Druide sont préparés. À la fin du prochain repos long, tu pourras remplacer <b>autant de sorts que tu veux</b> dans cette liste.`;
      else note.innerHTML=`Fenêtre de préparation après repos long : compose librement une liste de <b>${DATA.prepCount}</b> sorts. Tant que tu n'as pas validé la liste, les sorts de Druide niveau 1 ne sont pas utilisables en combat.`;
    }
    if(section&&!S.prepLocked&&S.prepared.length===DATA.prepCount)section.insertAdjacentHTML('beforeend','<button class="btn primary" style="width:100%;margin-top:10px" onclick="lockDruidPrep()">✓ VALIDER CES 4 SORTS POUR LA JOURNÉE</button>');
  };

  longRest=function(){
    if(S.hp<=0)return info('Repos long impossible','Il faut avoir au moins 1 PV pour commencer un repos long.');
    if(!confirm('Appliquer un repos long ? PV, dés de vie et ressources seront récupérés.'))return;
    DATA.resources.filter(r=>r.rest==='long'||r.rest==='short').forEach(r=>S.resources[r.id]=0);
    S.hp=DATA.maxHP;S.tempHP=0;S.hitDiceUsed=0;S.concentration=null;S.innateSorceryActive=false;S.innateSorceryRounds=0;
    S.turn={action:null,bonus:null,reaction:null,moveLeft:speedCases(),moveMax:speedCases(),slotSpellThisTurn:false};
    if(DATA.magicMode==='prepare4'){S.prepLocked=false;S.prepSwapAvailable=false;S.prepSwapRemoved=null;}
    save();render();
    setTimeout(()=>info('Repos long terminé',`PV restaurés à <b>${DATA.maxHP}</b>, PV temporaires retirés, dés de vie et ressources récupérés.${DATA.magicMode==='prepare4'?'<br><br><b>Druide :</b> va dans Magie et valide ta liste de 4 sorts. Tu peux en remplacer autant que tu veux maintenant.':''}`),0);
  };

  const priorCommitSpellUse=commitSpellUse;
  commitSpellUse=function(id,kind,mode){
    if(mode!=='slot'||kind!=='reaction')return priorCommitSpellUse(id,kind,mode);
    const t=ensureTurn();
    const ownTurn=confirm('Cette réaction se produit-elle PENDANT TON PROPRE TOUR ?\n\nOK = oui, c’est encore mon tour\nAnnuler = non, c’est le tour d’une autre créature');
    if(ownTurn)return priorCommitSpellUse(id,kind,mode);
    const ownTurnSlotState=t.slotSpellThisTurn;t.slotSpellThisTurn=false;
    const beforeSlots=S.resources.slots||0,result=priorCommitSpellUse(id,kind,mode);
    if((S.resources.slots||0)>beforeSlots){t.slotSpellThisTurn=ownTurnSlotState;save();}else t.slotSpellThisTurn=ownTurnSlotState;
    return result;
  };

  save();render();

  // Toutes les fiches PJ partagent ce fichier : on branche donc les statistiques ici une seule fois.
  if(!document.querySelector('script[data-iat-analytics]')){
    const a=document.createElement('script');a.src='../../assets/analytics.js';a.dataset.iatAnalytics='1';document.head.appendChild(a);
  }
})();