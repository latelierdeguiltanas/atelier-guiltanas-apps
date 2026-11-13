/* Hammerz niveau 2 — migration prudente de la fiche sur son appareil.
   Conserve les dégâts déjà subis, l'inventaire, les dépenses de ressources et l'historique. */
(()=>{
 'use strict';
 if(typeof DATA==='undefined'||typeof S==='undefined'||DATA.id!=='hammerz'||DATA.level!==2)return;
 if(!S.hammerzLevel2Migrated){
   const hp=Number(S.hp);
   if(Number.isFinite(hp)&&hp>0)S.hp=Math.max(0,Math.min(DATA.maxHP,hp+12));
   // Les consommations d'Imposition des mains restent inchangées : réserve maximale 5 -> 10.
   // Le nouveau lancement gratuit de Châtiment divin commence disponible.
   if(!S.resources||typeof S.resources!=='object')S.resources={};
   if(typeof S.resources.divineSmiteFree!=='number')S.resources.divineSmiteFree=0;
   S.hammerzLevel2Migrated=true;
   save();
 }
 // Le sort ne peut se déclencher qu'après une attaque de mêlée réellement touchée.
 const previousCommitSpellUse=commitSpellUse;
 commitSpellUse=function(id,kind,mode){
   if(id==='pal-divine-smite'){
     const played=String(ensureTurn().action||'');
     if(!/^Attaque — (Épée longue|Bâton|Cornes|Attaque à mains nues)$/.test(played))
       return info('Châtiment divin : déclencheur requis','Commence par l’action <b>Attaquer</b> avec une arme de mêlée ou une attaque à mains nues. Châtiment divin exige une touche.');
     if(!confirm('Ton attaque de mêlée a-t-elle touché la cible ?\n\nOK : oui, lancer Châtiment divin.\nAnnuler : non, garder la ressource.'))return;
   }
   return previousCommitSpellUse(id,kind,mode);
 };
 render();
})();
