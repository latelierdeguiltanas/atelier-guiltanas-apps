/* Choix quotidiens D&D 2024 : Paladin/Rôdeur (sort préparé + maîtrises d'armes).
   Fichier commun chargé par les 4 fiches ; sans effet sur les PJ non concernés. */
(()=>{
  const classDaily=(DATA.id==='hammerz'||DATA.id==='vax');
  if(!classDaily)return;

  const m=(id,name,cast,range,duration,components,concentration,ritual,effect,extra={})=>({
    id,name,level:1,source:DATA.class,cast,range,duration,components,concentration,ritual,
    effect,damage:null,heal:null,save:null,attack:null,
    how:['Dépense un emplacement de niveau 1.','Applique l’effet indiqué ci-dessous.'],
    freeMax:0,always:false,prepared:false,classDaily:true,...extra
  });

  const PALADIN=[
    m('pal-bless','Bénédiction','1 action','9 m','Concentration, jusqu’à 1 min','V, S, M',true,false,'Jusqu’à trois créatures ajoutent 1d4 à leurs jets d’attaque et jets de sauvegarde tant que tu maintiens la concentration.'),
    m('pal-command','Injonction','1 action','18 m','Instantané','V',false,false,'Une créature qui échoue à un JS de Sagesse DD 13 suit un ordre bref permis par le sort.',{save:'SAG DD 13'}),
    m('pal-compelled-duel','Duel forcé','1 action bonus','9 m','Concentration, jusqu’à 1 min','V',true,false,'Une créature qui échoue à un JS de Sagesse est magiquement poussée à se concentrer sur toi.',{save:'SAG DD 13'}),
    m('pal-cure-wounds','Soins','1 action','Contact','Instantané','V, S',false,false,'Rend des points de vie à la créature touchée.',{heal:'2d8 + 3 PV'}),
    m('pal-detect-evil-good','Détection du mal et du bien','1 action','Soi • 9 m','Concentration, jusqu’à 10 min','V, S',true,false,'Détecte certaines créatures surnaturelles et lieux consacrés ou profanés dans la zone.'),
    m('pal-detect-magic','Détection de la magie','1 action ou rituel','Soi • 9 m','Concentration, jusqu’à 10 min','V, S',true,true,'Détecte les effets magiques dans la zone et permet d’en percevoir l’école.'),
    m('pal-detect-poison','Détection du poison et des maladies','1 action ou rituel','Soi • 9 m','Concentration, jusqu’à 10 min','V, S, M',true,true,'Détecte certains poisons, créatures venimeuses et maladies dans la zone.'),
    m('pal-divine-favor','Faveur divine','1 action bonus','Soi','1 min','V, S',false,false,'Tes attaques avec une arme infligent des dégâts radiants supplémentaires pendant la durée.',{damage:'+1d4 radiant'}),
    m('pal-divine-smite','Châtiment divin','1 action bonus','Soi','Instantané','V',false,false,'Après avoir touché avec une arme de mêlée ou une attaque à mains nues, ajoute des dégâts radiants au coup.',{damage:'+2d8 radiant'}),
    m('heroism','Héroïsme','1 action','Contact','Concentration, jusqu’à 1 min','V, S',true,false,'La cible consentante devient immunisée à Effrayé et reçoit des PV temporaires au début de ses tours.'),
    m('pal-protection-evil-good','Protection contre le mal et le bien','1 action','Contact','Concentration, jusqu’à 10 min','V, S, M',true,false,'Protège une créature contre plusieurs catégories de créatures surnaturelles.'),
    m('pal-purify-food','Purification de nourriture et d’eau','1 action ou rituel','3 m • sphère 1,5 m','Instantané','V, S',false,true,'Purifie nourriture et boisson non magiques dans la zone.'),
    m('searing-smite','Châtiment ardent','1 action bonus','Soi','1 min','V',false,false,'Après avoir touché avec une attaque de mêlée, la cible subit l’effet brûlant du sort et effectue les sauvegardes prévues.',{damage:'1d6 feu',save:'CON DD 13'}),
    m('pal-shield-faith','Bouclier de la foi','1 action bonus','18 m','Concentration, jusqu’à 10 min','V, S, M',true,false,'Une créature à portée gagne +2 à la CA pendant la durée.'),
    m('pal-thunderous-smite','Châtiment tonnant','1 action bonus','Soi','Instantané','V',false,false,'Après un coup de mêlée, ajoute des dégâts de tonnerre et peut repousser/mettre À terre la cible.',{damage:'+2d6 tonnerre',save:'FOR DD 13'}),
    m('pal-wrathful-smite','Châtiment courroucé','1 action bonus','Soi','1 min','V',false,false,'Après un coup de mêlée, ajoute des dégâts nécrotiques et peut Effrayer la cible.',{damage:'+1d6 nécrotique',save:'SAG DD 13'})
  ];

  const RANGER=[
    m('ran-alarm','Alarme','1 min ou rituel','9 m • cube 6 m','8 h','V, S, M',false,true,'Place une alarme magique qui t’avertit lorsqu’une créature entre dans la zone.'),
    m('ran-animal-friendship','Amitié avec les animaux','1 action','9 m','24 h','V, S, M',false,false,'Une bête qui échoue à un JS de Sagesse est charmée selon le sort.',{save:'SAG DD 12'}),
    m('cure-wounds','Soins','1 action','Contact','Instantané','V, S',false,false,'Rend des points de vie à la créature touchée.',{heal:'2d8 + 2 PV'}),
    m('ran-detect-magic','Détection de la magie','1 action ou rituel','Soi • 9 m','Concentration, jusqu’à 10 min','V, S',true,true,'Détecte les effets magiques dans la zone et permet d’en percevoir l’école.'),
    m('ran-detect-poison','Détection du poison et des maladies','1 action ou rituel','Soi • 9 m','Concentration, jusqu’à 10 min','V, S, M',true,true,'Détecte certains poisons, créatures venimeuses et maladies dans la zone.'),
    m('ensnaring-strike','Frappe piégeuse','1 action bonus','Soi','Concentration, jusqu’à 1 min','V',true,false,'Renforce une attaque et peut Entraver la cible selon le sort.',{save:'FOR DD 12'}),
    m('ran-entangle','Enchevêtrement','1 action','27 m • carré 6 m','Concentration, jusqu’à 1 min','V, S',true,false,'Des plantes entravent la zone ; les créatures concernées font une sauvegarde de Force.',{save:'FOR DD 12'}),
    m('ran-fog-cloud','Nuage de brouillard','1 action','36 m • sphère 6 m','Concentration, jusqu’à 1 h','V, S',true,false,'Crée une zone de brouillard fortement obscurcie.'),
    m('ran-hail-thorns','Grêle d’épines','1 action bonus','Soi','Instantané','V',false,false,'Après une attaque à distance réussie, des épines blessent la cible et les créatures proches.',{save:'DEX DD 12',damage:'dégâts perforants selon le sort'}),
    m('ran-jump','Saut','1 action bonus','Contact','1 min','V, S, M',false,false,'Améliore fortement les capacités de saut de la cible.'),
    m('ran-longstrider','Grande foulée','1 action','Contact','1 h','V, S, M',false,false,'Augmente la vitesse de déplacement de la cible.'),
    m('ran-speak-animals','Communication avec les animaux','1 action ou rituel','Soi','10 min','V, S',false,true,'Permet de comprendre les bêtes et de communiquer verbalement avec elles pendant la durée.')
  ];

  const CATALOG=DATA.id==='hammerz'?PALADIN:RANGER;
  const initial=DATA.id==='hammerz'?['searing-smite','heroism']:['cure-wounds','ensnaring-strike'];
  for(const s of CATALOG){
    const old=DATA.spells.find(x=>x.id===s.id);
    if(old)Object.assign(old,{classDaily:true});
    else DATA.spells.push(s);
  }

  if(!Array.isArray(S.classPrepared)||S.classPrepared.length!==2)S.classPrepared=[...initial];
  if(typeof S.classSwapAvailable!=='boolean')S.classSwapAvailable=false;
  S.classSwapRemoved=null;

  const MASTERIES={
    hammerz:{javelin:['Slow','Après une touche qui inflige des dégâts, tu peux réduire la Vitesse de la cible de 3 m jusqu’au début de ton prochain tour.'],longsword:['Sap','Après une touche, la cible a Désavantage à son prochain jet d’attaque effectué avant le début de ton prochain tour.'],quarterstaff:['Topple','Après une touche, tu peux forcer une sauvegarde de Constitution DD 12 ; en cas d’échec, la cible est À terre.']},
    vax:{longbow:['Slow','Après une touche qui inflige des dégâts, tu peux réduire la Vitesse de la cible de 3 m jusqu’au début de ton prochain tour.'],scimitar:['Nick','L’attaque supplémentaire de la propriété Légère peut être faite dans l’action Attaquer au lieu d’utiliser une action bonus, une fois par tour.'],shortbow:['Vex','Après une touche qui inflige des dégâts, tu as Avantage à ton prochain jet d’attaque contre cette cible avant la fin de ton prochain tour.'],shortsword:['Vex','Après une touche qui inflige des dégâts, tu as Avantage à ton prochain jet d’attaque contre cette cible avant la fin de ton prochain tour.']}
  }[DATA.id];
  const masteryIds=Object.keys(MASTERIES);
  if(!Array.isArray(S.weaponMasteries)||S.weaponMasteries.length!==2){
    S.weaponMasteries=DATA.id==='hammerz'?['javelin','longsword']:['longbow','shortsword'];
  }
  if(typeof S.masteryChangeAvailable!=='boolean')S.masteryChangeAvailable=false;

  function applyMasteries(){
    for(const w of DATA.weapons){
      const def=MASTERIES[w.id];
      if(!def)continue;
      if(S.weaponMasteries.includes(w.id)){w.mastery=def[0];w.masteryText=def[1]}
      else{delete w.mastery;delete w.masteryText}
    }
    const f=DATA.features?.find(x=>x.id==='weapon-mastery');
    if(f){
      const txt=S.weaponMasteries.map(id=>{const w=DATA.weapons.find(x=>x.id===id),d=MASTERIES[id];return `${w?.name||id} : ${d[0]}`}).join(' ; ');
      f.summary=txt+'.';f.detail='Maîtrises actuellement sélectionnées : '+txt+'. Tu peux changer ces choix après un repos long.';
    }
  }
  applyMasteries();

  const priorSpellAvailable=spellAvailable;
  spellAvailable=function(s){
    if(s?.classDaily)return S.classPrepared.includes(s.id);
    return priorSpellAvailable(s);
  };

  const priorSpellCard=spellCard;
  spellCard=function(s){
    if(s?.classDaily&&!S.classPrepared.includes(s.id))return '';
    return priorSpellCard(s);
  };

  const priorOpenSpell=openSpell;
  openSpell=function(id){
    const s=DATA.spells.find(x=>x.id===id);
    if(s?.classDaily&&!S.classPrepared.includes(id))return info('Sort non préparé',`${s.name} figure sur la liste de ${DATA.class}, mais ${DATA.name} ne l’a pas préparé aujourd’hui.`);
    return priorOpenSpell(id);
  };

  window.openClassSwap=function(){
    if(!S.classSwapAvailable)return info('Liste verrouillée',`${DATA.name} pourra remplacer un seul sort de ${DATA.class} après son prochain repos long.`);
    openM(`<h2>Changer un sort préparé</h2><div class="learn">Après ce repos long, tu peux remplacer <b>un seul</b> de tes deux sorts de ${DATA.class}. Choisis d’abord celui que tu retires.</div><div class="list">${S.classPrepared.map(id=>{const s=DATA.spells.find(x=>x.id===id);return `<button class="item" onclick="chooseClassSwapOut('${id}')"><strong>${s?.name||id}</strong><small>Retirer ce sort</small></button>`}).join('')}</div>`);
  };
  window.chooseClassSwapOut=function(id){
    if(!S.classPrepared.includes(id))return;
    S.classSwapRemoved=id;
    const choices=CATALOG.filter(s=>!S.classPrepared.includes(s.id));
    openM(`<h2>Choisir le nouveau sort</h2><div class="tapnote">Remplace <b>${esc(DATA.spells.find(x=>x.id===id)?.name||id)}</b> par :</div><div class="list">${choices.map(s=>`<button class="item" onclick="commitClassSwap('${s.id}')"><strong>${s.name}</strong><small>${s.cast} • ${s.concentration?'Concentration • ':''}${s.ritual?'Rituel • ':''}${s.effect}</small></button>`).join('')}</div><button class="btn" style="width:100%;margin-top:10px" onclick="openClassSwap()">← Retour</button>`);
  };
  window.commitClassSwap=function(newId){
    const old=S.classSwapRemoved;if(!old||!S.classSwapAvailable)return;
    S.classPrepared=S.classPrepared.map(x=>x===old?newId:x);
    S.classSwapAvailable=false;S.classSwapRemoved=null;save();closeM();render();
    info('Sort remplacé',`${DATA.spells.find(x=>x.id===newId)?.name||newId} est maintenant préparé. Aucun autre remplacement n’est possible avant le prochain repos long.`);
  };

  window.openMasteryPicker=function(){
    if(!S.masteryChangeAvailable)return info('Maîtrises verrouillées','Tu pourras changer tes deux maîtrises d’armes après ton prochain repos long.');
    window.__iatMasteryDraft=[...S.weaponMasteries];showMasteryPicker();
  };
  window.showMasteryPicker=function(){
    const d=window.__iatMasteryDraft||[...S.weaponMasteries];
    openM(`<h2>Maîtrises d’armes</h2><div class="learn">Choisis exactement <b>2</b> types d’armes maîtrisés jusqu’au prochain repos long.</div><div class="list">${masteryIds.map(id=>{const w=DATA.weapons.find(x=>x.id===id),on=d.includes(id),def=MASTERIES[id];return `<button class="item" onclick="toggleMasteryDraft('${id}')"><strong>${on?'✓ ':''}${w?.name||id} — ${def[0]}</strong><small>${def[1]}</small></button>`}).join('')}</div><button class="btn primary" style="width:100%;margin-top:10px" onclick="commitMasteries()" ${d.length===2?'':'disabled'}>✓ VALIDER CES 2 MAÎTRISES</button>`);
  };
  window.toggleMasteryDraft=function(id){
    const d=window.__iatMasteryDraft||[];
    if(d.includes(id))window.__iatMasteryDraft=d.filter(x=>x!==id);
    else if(d.length<2)d.push(id);
    showMasteryPicker();
  };
  window.commitMasteries=function(){
    const d=window.__iatMasteryDraft||[];if(d.length!==2)return;
    S.weaponMasteries=[...d];S.masteryChangeAvailable=false;applyMasteries();save();closeM();render();info('Maîtrises validées','Tes deux maîtrises d’armes sont verrouillées jusqu’au prochain repos long.');
  };

  const priorRenderMagic=renderMagic;
  renderMagic=function(){
    priorRenderMagic();
    const root=document.getElementById('magic');if(!root)return;
    const names=S.classPrepared.map(id=>DATA.spells.find(x=>x.id===id)?.name||id).join(' • ');
    root.insertAdjacentHTML('afterbegin',`<div class="card"><h3>Sorts de ${DATA.class} préparés : 2/2</h3><p>${esc(names)}</p><button class="btn ${S.classSwapAvailable?'primary':''}" style="width:100%;margin-top:10px" onclick="openClassSwap()">${S.classSwapAvailable?'↔ Remplacer 1 sort après ce repos long':'🔒 1 remplacement au prochain repos long'}</button></div>`);
  };

  const priorRenderCombat=renderCombat;
  renderCombat=function(){
    priorRenderCombat();
    const root=document.getElementById('combat');if(!root)return;
    const txt=S.weaponMasteries.map(id=>{const w=DATA.weapons.find(x=>x.id===id),d=MASTERIES[id];return `${w?.name||id} (${d[0]})`}).join(' • ');
    root.insertAdjacentHTML('beforeend',`<div class="section"><h2>Maîtrises d’armes</h2><div class="card"><p>${esc(txt)}</p><button class="btn ${S.masteryChangeAvailable?'primary':''}" style="width:100%;margin-top:10px" onclick="openMasteryPicker()">${S.masteryChangeAvailable?'⚙ Changer mes 2 maîtrises':'🔒 Changement après repos long'}</button></div></div>`);
  };

  const priorLongRest=longRest;
  longRest=function(){
    const before=S.turn;
    priorLongRest();
    if(S.turn===before)return;
    S.classSwapAvailable=true;S.classSwapRemoved=null;S.masteryChangeAvailable=true;save();render();
    setTimeout(()=>info('Choix disponibles après repos long',`${DATA.name} peut maintenant remplacer <b>un seul sort de ${DATA.class}</b> et modifier ses <b>deux maîtrises d’armes</b>. Les boutons correspondants sont disponibles dans Magie et Combat.`),20);
  };

  save();render();
})();