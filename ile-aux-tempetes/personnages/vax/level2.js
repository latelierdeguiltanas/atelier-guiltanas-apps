/* Vax'Ildan niveau 2 — migration locale non destructive et précision de l'expertise. */
(()=>{
  'use strict';
  if(typeof DATA==='undefined'||typeof S==='undefined'||DATA.id!=='vax'||DATA.level!==2)return;
  // Les PV actuels sont stockés sur le téléphone : conserver les dégâts déjà subis.
  // L'ancien maximum était 11 ; le nouveau est 22. Une créature à 0 PV reste à 0 PV.
  if(!S.vaxLevel2Migrated){
    const old=Number(S.hp);
    if(Number.isFinite(old)&&old>0) S.hp=Math.min(DATA.maxHP,Math.max(0,old+(DATA.maxHP-11)));
    S.vaxLevel2Migrated=true;
    save();
  }
  const oldOpenSkill=openSkill;
  openSkill=function(name){
    if(name!=='Dressage')return oldOpenSkill(name);
    openM('<h2>Dressage — expertise</h2>'+
      '<div class="step"><b>Jet de Dressage</b><div class="calc">🎲 1d20 +6</div></div>'+
      '<div class="why">Sagesse +2 + deux fois la maîtrise (+2 × 2 = +4) = <b>+6</b>. Le bonus de maîtrise est déjà inclus : ne le rajoute pas.</div>');
  };
  const oldCommitFeature=commitFeature;
  commitFeature=function(id,kind){
    if(id!=='two-weapon-extra')return oldCommitFeature(id,kind);
    const action=String(ensureTurn().action||'');
    if(!/^Attaque — (Cimeterre|Épée courte)$/.test(action))
      return info('Deux armes — condition manquante','Tu dois d’abord utiliser l’action <b>Attaquer</b> avec ton <b>cimeterre</b> ou ton <b>épée courte</b> avant d’employer cette action bonus.');
    return oldCommitFeature(id,kind);
  };
  render();
})();
