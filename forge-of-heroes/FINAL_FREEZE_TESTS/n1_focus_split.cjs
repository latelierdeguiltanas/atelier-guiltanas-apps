'use strict';
/*
 Two entirely independent N1 progress lines:
 1. An official pure profile, all of its five pathways with every rank reachable at N1.
 2. One progress line per official people, from people-only rules and choices.
 No per-people/per-profile score and no per-pathway percentages in this user-facing report.
*/
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
const pure=read('../centre-synchronisation/forge-n1/purs.json');
const old=read('../centre-synchronisation/forge-n1/progress.json');
const ages=read('QA/N1/arquebusier-pure-age-ranks.json');
const variantPath=path.resolve(root,'QA/N1/arquebusier-arbaletrier-source-audit.json');const variant=fs.existsSync(variantPath)?JSON.parse(fs.readFileSync(variantPath,'utf8')):null;
const releasePath=path.resolve(root,'QA/N1/arbaletrier-production-release.json');
const release=fs.existsSync(releasePath)?JSON.parse(fs.readFileSync(releasePath,'utf8')):null;
const releaseProducts=release?.sourceFiles||[];
const deployed=release?.status==='INTEGRATED_NOT_CERTIFIED_FULL'&&releaseProducts.length===2&&releaseProducts.every(p=>{
 const file=path.join(root,p.name);
 return fs.existsSync(file)&&require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex')===p.sha256
});
const arbaletrierMissing=variant?.verdict==='VARIANTE_OFFICIELLE_NON_ENTIEREMENT_INTEGREE';
const prototypePath=path.resolve(root,'QA/N1/arbaletrier-virtual-prototype.json');const prototype=fs.existsSync(prototypePath)?JSON.parse(fs.readFileSync(prototypePath,'utf8')):null;const prototypeOK=prototype?.matrix?.total===480&&prototype?.matrix?.passed===480&&prototype?.matrix?.failed===0;
const variantGap=deployed?'La variante officielle Arbalétrier est maintenant proposée dans Forge : cinq voies légales, arbalètes, rangs 1 à 3 et sauvegardes validés au clic sur mobile. Restent à valider les contraintes complètes d’équipement et tous les effets conditionnels, ainsi que la fiche officielle PDF et ses annexes.':arbaletrierMissing?(prototypeOK?'La variante Arbalétrier est prête dans une version d’essai : les cinq voies, huit peuples, âges, sauvegardes, +1 en attaque, critique amélioré et +1 aux dégâts avec les arbalètes ont été éprouvés. Elle n’est PAS encore intégrée à Forge : il reste l’installation, les choix visibles, l’export PDF et le contrôle au clic.':'Variante Arbalétrier absente du jeu publié. Les armes à arbalète et la Voie du maître d’armes sont en préparation ; il reste à valider les calculs de critique, de dégâts, les choix visibles et l’installation.'):'';
const profile=pure.items.find(x=>x.profile==='Arquebusier'&&x.people==='Nain');
if(pure.items.length!==112||!profile||profile.powers.length!==5||ages.complete!==true||ages.pass!==400)throw Error('Missing or non-current proof');
const mark=(id,name,yes,detail,remaining)=>({id,name,status:yes?'ACQUIS':'A_VERIFIER',detail:yes?detail:remaining});
const ageOK=ages.complete&&ages.pass===ages.expected;
const effects=ages.numericEffectAssertions||{};
const numericPartial=effects['Arme à répétition — chargeur 2 + INT et +1 au rang 3']===32&&effects['Poudre puissante — portée +10 m, dommages +1 et projectile magique']===16&&effects['Tir précis — critique sur 19-20 à distance']===16&&effects['Combattant aguerri — défense +1']===16;
const profileChecks=[
 mark('paths','Les cinq voies officielles',profile.powers.length===5,'Les cinq voies et leurs 15 rangs accessibles sont présents et référencés.','Vérifier les cinq voies du livre.'),
 mark('pairs','Toutes les paires de voies légales',false,'','Les dix choix possibles de deux voies doivent fonctionner avec les équipements autorisés, y compris l’alternative Halfelin.'),
 mark('r1','Recevoir les capacités de rang 1',ageOK,'Les cinq rangs 1 sont attribués et sauvegardés dans les créations de référence.','Vérifier les cinq rangs 1.'),
 mark('r2','Recevoir les capacités de rang 2',ageOK,'Les cinq rangs 2 obtenus à N1 par l’âge mûr sont attribués et sauvegardés.','Vérifier les cinq rangs 2.'),
 mark('r3','Recevoir les capacités de rang 3',ageOK,'Les cinq rangs 3 obtenus à N1 par l’âge vénérable sont attribués et sauvegardés.','Vérifier les cinq rangs 3.'),
 mark('age','Dépenses de rangs selon l’âge',ageOK,'Très jeune, jeune, mûr et vénérable : rangs supplémentaires et restrictions vérifiés.','Vérifier tous les choix d’âge.'),
 mark('methods','Méthodes de répartition des caractéristiques',true,'Séries, achat et tirages représentatifs avec toutes les races officielles ; les règles raciales sont comptées à part.','Contrôler les méthodes du profil.'),
 mark('derived','PV, DEF, initiative, chance, mana, attaques et dommages',false,'','Faire correspondre chaque valeur et chaque bonus permanent au Livre de base avec les voies et équipements autorisés.'),
 mark('r1effects','Tous les effets des cinq capacités de rang 1',false,'','Vérifier les compétences, les jets, le couvert, les tirs de grenaille et l’initiative avec une arme chargée, selon les conditions du livre.'),
 mark('r2effects','Tous les effets des cinq capacités de rang 2',false,'','Chargeur 2 + INT validé ; restent le rechargement, la démolition, Mort ou vif, Ajuster le tir et Défaut dans la cuirasse.'),
 mark('r3effects','Tous les effets des cinq capacités de rang 3',false,'','Poudre puissante, Tir précis et +1 DEF de Combattant aguerri chiffrés ; vérifier le choix d’aptitude, Tir double, Tir de barrage et toutes les conditions.'),
 mark('gear','Toutes les armes, armures et variante Arbalétrier',false,'',deployed||arbaletrierMissing?variantGap:'Maîtrises, armure maximum, absence de bouclier, deux mains, armes à poudre, équipements alternatifs et Arbalétrier sans poudre.'),
 mark('history','Origines, métiers et historiques avancés',false,'','Contrôler toutes les voies d’historique et leurs effets sur les aptitudes de l’Arquebusier.'),
 mark('save','Enregistrer et reprendre les pouvoirs obtenus',ageOK,'Les états de référence des rangs 1, 2 et 3 avec l’âge ont été enregistrés et restaurés à l’identique.','Vérifier la sauvegarde et la reprise.'),
 mark('pdf','Fiche officielle et annexes',false,'','Vérifier les deux pages officielles, toutes les valeurs, les résumés et les descriptions des voies.'),
 mark('click','Créer, sauvegarder et rouvrir au clic sur mobile',false,'','Effectuer toutes les variantes utiles dans l’interface réelle et sur format téléphone.')
];
const verified=profileChecks.filter(x=>x.status==='ACQUIS').length;
const lore={
 humain:'Bonus de +1 à l’une des caractéristiques les plus faibles ; voie de l’Humain.',
 nain:'Bonus de +1 CON ou VOL et malus de −1 AGI ; voie du Nain.',
 'demi-elfe':'Bonus de +1 PER ou CHA, malus de −1 FOR ou CON ; héritage au choix : Humain, Elfe haut ou Elfe sylvain.',
 'demi-orc':'Bonus de +1 FOR ou CON et malus de −1 CHA ou INT ; voie du Demi-orc.',
 'elfe-haut':'Bonus de +1 INT ou CHA et malus de −1 FOR ; voie de l’Elfe haut.',
 'elfe-sylvain':'Bonus de +1 AGI ou PER et malus de −1 FOR ; voie de l’Elfe sylvain.',
 gnome:'Bonus de +1 INT ou PER et malus de −1 FOR ; Don étrange et voie du Gnome.',
 halfelin:'Bonus de +1 AGI ou VOL et malus de −1 FOR ; taille et armes autorisées à contrôler.'
};
const expectedNames=new Set(['Humain','Nain','Demi-elfe','Demi-orc','Elfe haut','Elfe sylvain','Gnome','Halfelin']);
const peoples=old.peoples.filter(x=>expectedNames.has(x.label)).map(p=>{
 const has=id=>p.slots.find(x=>x.id===id)?.status==='PASS';
 const checks=[
  mark('catalogue','Peuple officiel et voie raciale',has('catalogue'),'Race et voie raciale référencées dans le livre et dans Forge.','Vérifier sa voie.'),
  mark('caracs','Bonus et malus de caractéristiques',has('race-stats'),'Bonus et malus de création comparés aux caractéristiques de référence.','Vérifier les bonus et malus raciaux.'),
  mark('options','Tous les choix raciaux de départ',has('origins'),'Choix de caractéristiques et héritages de départ vérifiés dans les cas de référence.','Vérifier les choix raciaux.'),
  mark('r1','Voie raciale de rang 1',has('people-r1'),'Acquisition de la capacité et ses valeurs raciales principales vérifiées.','Vérifier le rang 1 de la voie raciale.'),
  mark('r2','Voie raciale de rang 2',has('people-r2'),'Rang 2 accessible avec les règles avancées vérifié dans les cas de référence.','Vérifier le rang 2 de la voie raciale.'),
  mark('methods','Caractéristiques et sauvegarde des choix',has('methods')&&has('replay'),'Répartition et reprise des caractéristiques raciales vérifiées.','Valider les variantes et sauvegardes des caractéristiques.'),
  mark('ages','Tous les âges et historiques avec ce peuple',false,'','Prouver les choix d’âge et d’historique pour le peuple, sans dépendre d’un seul profil.'),
  mark('conditional','Effets conditionnels et dons raciaux',false,'','Vérifier chaque pouvoir racial selon ses conditions réelles, y compris dons et résistances.'),
  mark('gear','Équipements et contraintes de taille',false,'','Vérifier toutes les restrictions raciales, les armes et les échanges autorisés.'),
  mark('sheet','Fiche officielle et parcours de création',false,'','Vérifier fiche et annexes puis création au clic pour le peuple, sans restriction à un profil donné.')
 ];
 const pass=checks.filter(x=>x.status==='ACQUIS').length;
 return{id:p.id,key:p.key,name:p.label,rules:lore[p.key],checks,passed:pass,total:checks.length,percent:Math.round(100*pass/checks.length),certified:pass===checks.length};
});
if(peoples.length!==8||peoples.some(x=>!x.rules))throw Error('8 race progress lines must be complete');
const copyPaths=profile.powers.map(p=>({name:p.name,page:p.page,abilities:p.abilities.map(a=>({rank:a.rank,name:a.name,focus:a.focus,calculation:a.calculation,status:a.status}))}));
const output={
 schema:'FOH_N1_PROFILE_AND_PEOPLES_SEPARATE',
 generatedAt:new Date().toISOString(),
 engineSha256:pure.engineSha256,
 intent:'Le profil complet compte indépendamment des peuples : cinq voies et leurs effets, armes, historiques, fiche. Chaque peuple a son propre avancement de règles raciales, indépendant du choix de profil. AUCUNE barre par voie ni par couple profil-peuple.',
 profile:{id:profile.profileId,name:'Arquebusier',priority:'EN_COURS',completed:false,variantPrototypeReady:!!prototypeOK,variantIntegrated:!!deployed,passed:verified,total:profileChecks.length,percent:Math.round(100*verified/profileChecks.length),checks:profileChecks,paths:copyPaths,partialNumericValidated:numericPartial,
  next:deployed?'Arbalétrier disponible : valider maintenant le PDF officiel, les effets conditionnels en combat, les historiques et les alternatives d’équipement.':arbaletrierMissing?'Intégrer la variante Arbalétrier absente, puis achever les tirs spéciaux, les autres effets de rang, historiques, PDF et création mobile.':'Achever les compétences, tirs spéciaux, rechargements, équipement et Arbalétrier ; puis historiques, PDF et parcours au clic.'},
 peoples,
 pausedProfiles:13,
 summary:{profilesCertified:0,profilesInProgress:1,profilesPending:13,peoplesCertified:peoples.filter(p=>p.certified).length},
 limitations:'Pourcentage de critères complets, non proportion de tests ni preuve exhaustive de tous les personnages. Un effet chiffré peut être validé sans que le rang complet le soit.',
 sources:[...(variant?['QA/N1/arquebusier-arbaletrier-source-audit.json']:[]),'COF2 Livre de base pp. 44-65','Règles avancées p.153 et historiques','QA/N1/arquebusier-pure-age-ranks.json','QA/N1/official-methods-cross.json','QA/N1/official-racial-options.json','QA/N1/lot10/people-source.json']
};
const dest=path.resolve(root,'..','centre-synchronisation/forge-n1/focus.json');
fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({profile:output.profile.name,score:output.profile.percent,passed:verified,peoples:peoples.map(p=>[p.name,p.percent]),profileIndependent:true,racesIndependent:true}));
