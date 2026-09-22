/* Compléments ciblés après audit des 4 fiches. */
(()=>{
  const masteryText={
    Slow:'Après une touche qui inflige des dégâts, tu peux réduire la Vitesse de la cible de 3 m jusqu’au début de ton prochain tour. Plusieurs Slow ne cumulent pas au-delà de 3 m.',
    Sap:'Après une touche, la cible a Désavantage à son prochain jet d’attaque effectué avant le début de ton prochain tour.',
    Vex:'Après une touche qui inflige des dégâts, tu as Avantage à ton prochain jet d’attaque contre cette cible avant la fin de ton prochain tour.',
    Nick:'L’attaque supplémentaire de la propriété Légère peut être faite dans l’action Attaquer au lieu d’utiliser une action bonus, une fois par tour.',
    Topple:'Après une touche, tu peux forcer une sauvegarde de Constitution (DD 8 + modificateur d’attaque + maîtrise) ; en cas d’échec, la cible est À terre.'
  };
  (DATA.weapons||[]).forEach(w=>{if(w.mastery&&!w.masteryText&&masteryText[w.mastery])w.masteryText=masteryText[w.mastery]});

  const baseFeatureTiming=featureTiming;
  featureTiming=function(f,kind){
    if(f?.id==='healer'){
      const hasKit=(S.inventory||[]).some(x=>/trousse de soins|healer.?s kit|kit de soins/i.test(x.name||'' )&&x.qty>0);
      if(!hasKit)return false;
    }
    return baseFeatureTiming(f,kind);
  };

  const baseOpenFeature=openFeature;
  openFeature=function(id){
    if(id==='healer'){
      const hasKit=(S.inventory||[]).some(x=>/trousse de soins|healer.?s kit|kit de soins/i.test(x.name||'')&&x.qty>0);
      if(!hasKit)return info('Guérisseur indisponible','Médecin de bataille exige une <b>trousse de soins</b>. Hammerz n’en possède pas actuellement ; la capacité apparaîtra automatiquement dans les actions dès qu’une trousse sera ajoutée au sac.');
    }
    return baseOpenFeature(id);
  };

  const baseOpenWeapon=openWeapon;
  openWeapon=function(id){
    baseOpenWeapon(id);
    const sheet=document.getElementById('sheet');if(!sheet)return;
    if(DATA.id==='vax'&&S.concentration==='Marque du chasseur')sheet.insertAdjacentHTML('beforeend','<div class="learn"><b>🎯 Marque du chasseur active :</b> contre la créature marquée, chaque attaque qui touche inflige <b>+1d6 dégâts de force</b>.</div>');
  };

  render();
})();