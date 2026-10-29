# Validation de la création N1

**Phase active : N1. Certification globale encore ouverte. N2 et N3 en attente.**

Ce dossier remplace les anciens compteurs comme point de suivi actuel, sans réécrire les preuves historiques de `FINAL_FREEZE`. Les résultats sont attachés aux empreintes du moteur et des données ; les contrôles PDF conservent leur propre périmètre. Les trois profils et huit peuples du Compagnon restent des adaptations Forge, pas une certification officielle COF2.

## Matrice déterministe exécutée

| Groupe | Configurations | Acceptées par le moteur | Refusées, conservées pour revue | Échecs d’assertion |
| --- | ---: | ---: | ---: | ---: |
| Profils purs × peuples × paires de voies | 2 720 | 2 286 | 434 | 0 |
| Variantes de bonus/malus de peuple | 5 950 | 5 082 | 868 | 0 |
| Autre choix du R2 initial des mages | 960 | 840 | 120 | 0 |
| Hybrides, deux sens, 25 croisements de voies, 16 peuples | 108 800 | 91 520 | 17 280 | 0 |
| Sans profil, toutes les paires distinctes, 16 peuples | 57 120 | 55 902 | 1 218 | 0 |
| Ordre inverse sans profil, humain | 3 570 | 3 500 | 70 | 0 |
| **Total** | **179 120** | **159 130** | **19 990** | **0** |

Couverture acceptée : 17 profils, 16 peuples, 85 voies principales, les 272 couples ordonnés de profils hybrides et 3 500 paires distinctes sans profil. 9 352 sauvegardes/relectures sont vérifiées dans cette matrice ; 5 127 mutations à zéro voie sont refusées avec un motif lié aux voies.

**Ce que ce résultat signifie :** les invariants testés passent, y compris les caractéristiques raciales calculées indépendamment, l’identité de profil, l’absence de capacité dupliquée, la présence des R1 choisis, la non-mutation des entrées et le rejeu échantillonné. Cela ne certifie pas chaque chiffre de chaque capacité : les valeurs exactes ciblées sont dans les suites séparées. Le nombre de configurations inclut plusieurs choix pouvant conduire au même résultat ; il n’est pas présenté comme un nombre de fiches mécaniquement uniques.

**Les refus ne sont ni des créations validées ni automatiquement des bugs.** Les 27 groupes du lot initial ont été classés en six causes et leurs 81 exemples conservés ont une contrepartie légale testée. Les 27 groupes de la nouvelle matrice sont également classés, en sept causes (dont les armes trop grandes). Les comptes rendus `lot2/rejection-review*.json` distinguent échange MJ, changement de voie et matériel ajusté. Les parcours de l’interface correspondants restent à vérifier. Une répartition officielle différente est utilisée pour lutin/fée afin de respecter leur plafond de FOR. Le petit bouclier est équipé pour tester la voie du bouclier sans profil. Ces ajustements sont explicites dans le générateur.

## Défauts corrigés dans ce lot

- **N1-GNOME-HYBRID-001 :** Don étrange pouvait dupliquer une capacité déjà donnée par le profil secondaire. 80 cas ont été reproduits. Références : Don étrange p.53 et règle de non-cumul p.39 ; la règle Forge du don différent existait déjà pour les profils purs. Le contrôle est ajouté avant la fusion des profils ; le choix en double est refusé, puis un autre don est accepté. 160 vérifications, sur les deux produits, contrôlent aussi les voies conservées et la sauvegarde. La fixture et les identifiants obtenus avant correction sont dans `defects/gnome-hybrid-duplicate.json`.
- **N1-PDF-HISTORY-001 :** le PDF imprimait des historiques désactivés provenant de valeurs résiduelles du brouillon (`geoId`/`proId`). Reproduit par un vrai téléchargement dans Chrome. L’export respecte désormais l’activation du module. Deux exports natifs N1 et un export partagé vérifient l’absence d’historiques inactifs et la conservation des historiques actifs. Le produit maître ancien n’embarque pas cet exporteur : sa parité PDF/UI n’est pas revendiquée.

Les contrats anciens ont aussi été actualisés pour les quatre champs introduits depuis leur rédaction : calculs des capacités, catalogue d’actions, règles d’équipement et journal des effets. Les assertions numériques, les chemins obligatoires/invariants et les dix sabotages anti-faux-vert sont conservés. Les fiches MANUAL_02/03 sont corrigées avec formules et références COF2 : bonus humain légal et PC 4 pour le point-buy ; PV 15 pour le barbare mûr.

## Contrôles complémentaires

- 29 suites de régression : PASS ; détail et sorties dans `regressions.json`.
- 53 transitions et 53 retours A→B→A : PASS ; 11 valeurs exactes, 13 transitions sans résidu, 14 refus ciblés et 10 contrôles anti-faux-vert : PASS.
- Les 12 fiches de recette sont vérifiées automatiquement. Cela ne signifie pas 12 parcours au clic.
- Un vrai parcours Chrome : humain voleur, création, changement de voie et retour avec DEF/INIT attendues, sauvegarde, rechargement, réouverture et téléchargement PDF. Le test est limité à ce personnage, sur ordinateur.
- PDF : 156 champs, modèle exact reconnu, valeurs numériques relues ; export corrigé rendu et première page inspectée. Les exports N1 moine/sorcier/forgesort et 1 895 encodages de textes/titres passent. Aucun modèle ni PDF officiel rempli n’est ajouté au dépôt.

## Rejouer

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_regression_batch.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_systematic_matrix.cjs --smoke
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_matrix_batch.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_phase_status.cjs
```

La matrice complète utilise huit processus Node. Les JSON par processus et fichiers temporaires sont exclus du dépôt ; la synthèse contient les compteurs et des exemples complets de chaque motif de refus. Le test PDF supplémentaire reçoit le chemin du PDF vierge fourni en argument, sans le publier.

## Réserves à fermer avant N2

1. Les familles de refus ont leur revue et leurs contreparties testées sur le moteur. Reste à contrôler les restrictions et paquetages dans les vrais parcours des peuples concernés, notamment quand un échange MJ est nécessaire ou que la combinaison de voies doit changer.
2. Étendre les valeurs attendues indépendantes aux effets N1 encore non couverts, y compris les rangs accessibles à la création par âge, les dons et les interactions d’équipement.
3. Les méthodes de caractéristiques sont maintenant couvertes par le lot 2 ci-dessous. Reste leur croisement complet avec les autres profils/peuples et toutes les alternatives de choix persistants, voies du demi-elfe/mage, historiques, options, religions et capacités à la carte. Leur produit cartésien complet n’est pas certifié.
4. Répéter les parcours au clic pour hybrides, sans profil et options ; vérifier les exports associés, l’aller-retour d’import et Android. Un seul parcours réel ne valide pas toutes les interfaces.
5. **Sans voies :** le produit actuel exige des voies et refuse zéro voie. Ce refus est testé. Une création volontaire sans aucune voie n’est pas un mode existant et reste une exigence à préciser, pas une fonctionnalité déclarée validée.
6. La référence interne de Don étrange est corrigée vers COF2 p.53 ; la nouvelle matrice est rejouée sur le moteur corrigé. Les empreintes antérieures restent dans les preuves de reproduction du lot 2.
7. Résoudre les éventuels écarts, rejouer les tests concernés et clôturer explicitement la phase N1. Aucun compteur ne déclenche automatiquement la phase N2.

## Lot 2 — reprise du 28 octobre 2026

Les preuves avant/après sont conservées dans `lot2/size-defect-proof.json` et `lot2/semi-random-before.json`.

- Les restrictions d’équipement de peuple sont partagées entre profils purs, hybrides et sans profil. Le mode sans profil ne peut plus contourner la limite d4 des fées/lutins.
- Le calcul de taille regarde tous les dés des DM de base : une arme 2d6 dépasse la limite 1d10 du gobelin/kobold (Compagnon pp.15 et 17). Un simple examen de `maxDie=6` ne suffisait pas.
- Une arme d8–d10 est utilisable à deux mains par gobelin/kobold sans bouclier. Le nombre de mains apparaît dans la projection d’attaque et survit à la sauvegarde ; aucun bonus de dégâts n’est inventé. Le port simultané du bouclier reste refusé dans ce mode d’équipement.
- Après trois petits jets semi-aléatoires, la répartition légale à sept +1 est maintenant acceptée. Une case permet de choisir le bonus sur la valeur 0. Le choix est conservé par la répartition enregistrée et récupéré à la réouverture, sans changer le comportement par défaut des anciennes répartitions. Source : photo `règles avancées.pdf`, PDF p.1, pages imprimées 152–153, lue visuellement après rotation.

`n1_size_equipment_runner.cjs` : 84 cas ciblés sur les deux moteurs. Les refus originaux et les refus courants ont chacun 81 exemples testés, avec des contreparties légales. Ces exemples ne remplacent pas le rejeu complet de chaque refus historique. Les 179 120 configurations principales ont été rejouées sur le moteur final.

`n1_characteristic_methods_runner.cjs` : les 279 936 répartitions possibles de −1 à +4 sont comparées à un calcul indépendant du budget d’achat ; 27 568 sont légales et 252 368 illégales. Les 2 940 permutations distinctes des trois séries sont créées sur un voleur humain. Les 1 331 triplets de résultats de 2d6 sont contrôlés, avec sept rotations par triplet et les 64 variantes à sept +1. Cela donne 9 381 créations semi-aléatoires et 284 créations par achat échantillonnées, avec attentes numériques indépendantes et 407 contrôles de sauvegarde/relecture. Huit contrôles d’interface simulée portent sur les deux produits ; aucun nouveau clic Android n’est revendiqué.

Commandes supplémentaires :

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_size_equipment_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_rejection_review_runner.cjs --current
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_characteristic_methods_runner.cjs
```

Ces progrès ferment des réserves de moteur et de caractéristiques. Ils ne clôturent pas la phase N1 : les autres effets numériques, options, parcours d’interface et le mode volontaire sans voies restent explicitement ouverts.

## Lot 3 — contrôles directs des PDF (28 octobre 2026)

Deux omissions sont corrigées après lecture visuelle des pages sources ; leurs empreintes et pages sont dans `lot3/sources.json`.

- **N1-HALFELIN-SIZE-001 :** Petite taille (Livre de base p.55, PDF p.57) impose aussi au halfelin les limites d6 à une main, d8–d10 à deux mains, l’interdiction au-delà de d10, de l’arc long et de l’arbalète lourde. Le contrôle partagé du lot 2 avait omis ce peuple. Le halfelin est ajouté aux mêmes validations et à la projection du nombre de mains. Neuf cas avant/après couvrent profil pur, hybride et sans profil ; le test d’équipement est étendu à **120 cas sur les deux produits**. Les dégâts tiennent compte du malus racial de FOR, sans bonus de deux mains inventé.
- **N1-AGE-RESIDUAL-001 :** le choix +1 PC/+1 DR de « Très jeune » persistait dans les catégories jeune, mûr et vénérable. La source (Règles avancées p.153, PDF p.1) n’accorde ces bonus qu’à « Très jeune ». Le moteur normalise ce choix à `null` pour les autres catégories. Six échecs avant correction sont conservés dans `lot3/age-before.json`. Les **24 cas sur les deux produits** contrôlent les quatre catégories, les anciens choix PC/DR, les caractéristiques exactes, PV/DEF/INIT/PC/PM/attaques/DR, les rangs et le budget d’âge, ainsi que **22 sauvegardes/relectures** et la désactivation du module. Le calcul indépendant porte sur un voleur humain ; il ne prétend pas certifier tous les effets d’âge de chaque profil.

Le passage « Jouer sans profil » (Règles avancées p.154, PDF p.2) conserve explicitement des voies et leur famille. Il ne fournit pas de règle de création sans aucune voie. Cette dernière demande reste distincte de la validation du mode sans profil.

Le lot 3 ajoute aussi **850 contrôles d’interactions d’âge et 850 sauvegardes/relectures**, sur les deux produits, pour 17 profils et 85 voies (chaque voie en première position, avec la suivante comme seconde voie). Les catégories jeune et très jeune sont comparées à chaque fiche de référence : seules les différences INIT/PC/DR de la règle d’âge sont attendues. Ce contrôle relatif ne remplace pas la validation indépendante des chiffres de base de chaque capacité ni les catégories mûr/vénérable sur tous les profils. Rapport : `lot3/age-profiles.json`.

Matrice finale après les deux correctifs du lot 3 : **179 120 tentatives, 159 130 acceptées, 19 990 refusées, zéro échec d’assertion**. Les 27 groupes de refus courants ont été revus sur cette même empreinte du moteur. La baisse des créations acceptées provient des équipements de halfelins désormais refusés conformément à la source ; elle ne représente pas une perte de couverture. Les 29 suites passent (lot complet initial de 28 suites, puis trois réexécutions documentées dont la nouvelle suite des profils).
