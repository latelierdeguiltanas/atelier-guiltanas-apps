# Validation de la création N1

**Phase active : clôture N1, certification globale encore ouverte. Urgences autorisées en parallèle : six PJ Bastide N3 et sorcier/moine N1→N2 (voir `../N3/2026-10-30.md`).**

Ce dossier remplace les anciens compteurs comme point de suivi actuel, sans réécrire les preuves historiques de `FINAL_FREEZE`. Les résultats sont attachés aux empreintes du moteur et des données ; les contrôles PDF conservent leur propre périmètre. Les trois profils et huit peuples du Compagnon restent des adaptations Forge, pas une certification officielle COF2.

## Matrice déterministe exécutée

| Groupe | Configurations | Acceptées par le moteur | Refusées, conservées pour revue | Échecs d’assertion |
| --- | ---: | ---: | ---: | ---: |
| Profils purs × peuples × paires de voies | 2 720 | 2 286 | 434 | 0 |
| Variantes de bonus/malus de peuple | 5 950 | 5 082 | 868 | 0 |
| Autre choix du R2 initial des mages | 960 | 840 | 120 | 0 |
| Hybrides, deux sens, 25 croisements de voies, 16 peuples | 108 800 | 91 520 | 17 280 | 0 |
| Sans profil, toutes les paires distinctes, 16 peuples | 57 120 | 56 052 | 1 068 | 0 |
| Ordre inverse sans profil, humain | 3 570 | 3 510 | 60 | 0 |
| **Total** | **179 120** | **159 290** | **19 830** | **0** |

Couverture acceptée : 17 profils, 16 peuples, 85 voies principales, les 272 couples ordonnés de profils hybrides et 3 510 paires distinctes sans profil. 9 352 sauvegardes/relectures sont vérifiées dans cette matrice ; 5 127 mutations à zéro voie sont refusées avec un motif lié aux voies.

**Ce que ce résultat signifie :** les invariants testés passent, y compris les caractéristiques raciales calculées indépendamment, l’identité de profil, l’absence de capacité dupliquée, la présence des R1 choisis, la non-mutation des entrées et le rejeu échantillonné. Cela ne certifie pas chaque chiffre de chaque capacité : les valeurs exactes ciblées sont dans les suites séparées. Le nombre de configurations inclut plusieurs choix pouvant conduire au même résultat ; il n’est pas présenté comme un nombre de fiches mécaniquement uniques.

**Les refus ne sont ni des créations validées ni automatiquement des bugs.** Les 27 groupes du lot initial ont été classés en six causes et leurs 81 exemples conservés ont une contrepartie légale testée. Les 27 groupes de la nouvelle matrice sont également classés, en sept causes (dont les armes trop grandes). Les comptes rendus `lot2/rejection-review*.json` distinguent échange MJ, changement de voie et matériel ajusté. Les parcours de l’interface correspondants restent à vérifier. Une répartition officielle différente est utilisée pour lutin/fée afin de respecter leur plafond de FOR. Le petit bouclier est équipé pour tester la voie du bouclier sans profil. Ces ajustements sont explicites dans le générateur.

## Défauts corrigés dans ce lot

- **N1-GNOME-HYBRID-001 :** Don étrange pouvait dupliquer une capacité déjà donnée par le profil secondaire. 80 cas ont été reproduits. Références : Don étrange p.53 et règle de non-cumul p.39 ; la règle Forge du don différent existait déjà pour les profils purs. Le contrôle est ajouté avant la fusion des profils ; le choix en double est refusé, puis un autre don est accepté. 160 vérifications, sur les deux produits, contrôlent aussi les voies conservées et la sauvegarde. La fixture et les identifiants obtenus avant correction sont dans `defects/gnome-hybrid-duplicate.json`.
- **N1-PDF-HISTORY-001 :** le PDF imprimait des historiques désactivés provenant de valeurs résiduelles du brouillon (`geoId`/`proId`). Reproduit par un vrai téléchargement dans Chrome. L’export respecte désormais l’activation du module. Deux exports natifs N1 et un export partagé vérifient l’absence d’historiques inactifs et la conservation des historiques actifs. Le produit maître ancien n’embarque pas cet exporteur : sa parité PDF/UI n’est pas revendiquée.

Les contrats anciens ont aussi été actualisés pour les quatre champs introduits depuis leur rédaction : calculs des capacités, catalogue d’actions, règles d’équipement et journal des effets. Les assertions numériques, les chemins obligatoires/invariants et les dix sabotages anti-faux-vert sont conservés. Les fiches MANUAL_02/03 sont corrigées avec formules et références COF2 : bonus humain légal et PC 4 pour le point-buy ; PV 15 pour le barbare mûr.

## Contrôles complémentaires

- 37 suites de régression : PASS ; détail et sorties dans `regressions.json`.
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

## Lot 4 — valeurs exactes et rangs sauvegardés (29 octobre 2026)

Les attentes numériques de `n1_source_numeric_runner.cjs` sont écrites à partir du Livre de base fourni, sans reprendre les formules du moteur. **74 créations et sauvegardes/relectures**, sur les deux produits, couvrent quinze capacités officielles aux rangs 1–3 accessibles au N1 : Grâce féline, Archer émérite, Souplesse du félin, Agile, Vigueur, Réflexes éclair, Armure de vent, Robustesse, Vitesse du félin, Agilité du singe, Vêtements sacrés, Divination, Runes de défense, Exsangue et Pacte démoniaque. Le test tient compte des autres effets acquis dans leurs voies, des choix de Peau de pierre/Armure lourde, des DR de famille et des malus d’âge. CHA négatif et VOL positive évitent de réduire les vérifications à des bonus nuls. Chaque cas indique sa page source et ses valeurs attendues dans `lot4/source-numeric.json`. Périmètre : humain sans armure ; ce lot ne certifie pas tous les équipements ni toutes les capacités.

**N1-MAGE-PATH-RANK-001 :** les capacités initiales de rang 2 des mages étaient présentes, mais `characterState.paths` pouvait conserver le rang 1, ou omettre la Voie du mage. Source lue visuellement : Livre de base p.29, PDF p.31. La projection finale réconcilie le rang des voies présentes avec les capacités réellement acquises, ajoute la Voie du mage choisie, et exclut les capacités seulement accordées par un don. Aucun rang n’est accordé par ce correctif : il représente les acquisitions déjà validées.

- `lot4/mage-ranks-before.json` conserve 90 reproductions avant correction.
- `lot4/mage-ranks.json` : 180 cas et 180 sauvegardes/relectures, six profils mages, leurs cinq voies principales, rang 2 sur la première ou la seconde voie ou sur la Voie du mage, sur les deux produits. Deux contrôles de Touche-à-tout vérifient qu’une capacité donnée ne fait pas progresser sa voie d’origine.
- `lot4/mage-legacy-saves.json` : douze sauvegardes réellement fabriquées par le moteur avant correction, réouvertes avec le moteur corrigé. Les rangs sont rétablis, les valeurs numériques et les payloads d’origine restent identiques.

Rejouer les deux contrôles autonomes :

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_source_numeric_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_mage_rank_projection_runner.cjs
```

Les preuves avant/après et anciennes sauvegardes peuvent être régénérées en extrayant l’HTML du commit `f080f9833aa254399df9c536cb815cfbc16108a0`, puis en passant son chemin aux runners `n1_mage_rank_projection_runner.cjs` et `n1_mage_legacy_save_runner.cjs`. Les PDF source ne sont pas copiés dans le dépôt. Les réserves N1 non couvertes restent ouvertes ; N2/N3 attendent.

Vérification finale du lot 4 : les 31 suites passent ; les huit lots de la matrice de 179 120 tentatives sont terminés sans échec d’assertion et leurs empreintes correspondent au moteur final. Les 27 familles de refus sont relues sur cette même matrice. Le verrou de clôture reste fermé tant que les autres réserves N1 subsistent.

## Lot 5 — historiques croisés et contrôle des photos (29 octobre 2026)

Les six pages de `voies d’historique.pdf` ont été relues visuellement. Quatre écarts sont corrigés dans les données des deux produits et les libellés de l’export : dégâts du garde du corps du nanti **1d4°+2** ; augmentation de difficulté d’Au-dessus des lois **+5** par utilisation supplémentaire la même semaine ; Fendre la foule **+2 en DEF et en attaque** ; suppression de la condition d’équipement ajoutée à Se mettre à l’abri. Le calcul du compagnon utilise désormais les bons dégâts. Les pages et valeurs avant/après sont dans `lot5/source-review.json`.

`n1_history_cross_runner.cjs` couvre les **72 couples** entre neuf origines et huit professions. Pour chaque couple, les achats de rangs 2–5 portent successivement sur l’origine et la profession, dans les deux ordres ; les quatre choix de caractéristique de l’expert sont essayés. Sur les deux produits : **684 créations et 684 sauvegardes/relectures**, les 17 voies et leurs cinq rangs sont couverts. Les attentes indépendantes vérifient caractéristiques, PV, DEF, INIT, DR, coût uniforme d’un point par rang historique, absence de fuite des bonus de contexte et garde du corps adjacent. Périmètre : guerrier humain sans armure, voie du soldat ; ce n’est pas le produit cartésien avec tous les profils et peuples.

La preuve avant correction comporte 342 cas, dont 18 échouaient sur les dégâts du garde du corps, ainsi que quatre écarts textuels source détectés indépendamment. `lot5/history-before.json` conserve les résultats. Le texte des historiques reste une transcription mécanique normalisée ; ce lot ne déclare pas les 85 rangs verbatim ni tous les effets de contexte automatisés.

**Export :** quatre vrais PDF N1 (cités/nanti et déserts/nanti, export natif et partagé) sont créés depuis le modèle fourni. PV des formulaires contrôlés, quatre corrections retrouvées dans les textes des annexes. L’annexe du nanti de l’export natif est rendue et inspectée. Résultats : `lot5/pdf-source.json`. Les PDF de test et le modèle ne sont pas publiés.

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_history_cross_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_pdf_history_source_runner.cjs CHEMIN_DU_PDF_VIERGE DOSSIER_TEMPORAIRE
```

Les vérifications restantes du N1 demeurent explicites dans la section des réserves. Aucune nouvelle navigation IA ni recette Android n’est revendiquée.

Fin du lot 5 : **32 suites PASS**, matrice complète rejouée (179 120 tentatives, zéro échec d’assertion), revue des 27 familles de refus mise à jour. La comparaison directe des sources natives/Compagnon extractibles vérifie à nouveau **550 rangs, 550 correspondances, aucun écart** (`lot5/extractible-source-audit.json`). Cette dernière vérification porte sur les textes d’origine ; les transcriptions photographiques et les adaptations restent identifiées séparément.

## Lot 6 — prêtres spécialistes (29 octobre 2026)

La règle du Livre de base p.122 (PDF p.124), lue visuellement, impose de remplacer une capacité du même rang par la capacité divine et d’acquérir celle-ci en premier à ce rang. La création avec âge variable expose cette règle dès le N1.

Corrections :

- Le remplacement de rang 1 conserve la voie de prêtre comme voie d’acquisition. Il ne supprime plus son prérequis de rang 1 : les rangs suivants deviennent accessibles et le rang de la voie fait évoluer les bonus de la capacité divine.
- Les achats d’âge de rang 2/3 peuvent maintenant remplacer une capacité de voie de prêtre par la capacité divine correspondante, avec le même coût et sans donner les deux capacités. L’achat divin est traité en premier à son rang. Le choix de voie est explicite, sauvegardé et proposé dans l’interface ; sans choix explicite dans un ancien brouillon, le moteur choisit une voie admissible de manière déterministe.
- Les références canoniques manquantes d’Arcanna, Linnarré, Orbis, Perinde et Tulsadüm sont reliées aux capacités existantes. Le rang 4 de Linnarré reste différé, sans être accordé au N1. Les références ambiguës déjà hors catalogue ne sont pas inventées.
- La reconstruction des attaques utilise la vraie capacité divine, au lieu de celle qu’elle remplace.
- Les exporteurs natif et partagé substituent aussi le titre, le résumé et le texte intégral de la capacité divine sur la fiche et dans l’annexe. La mention « capacité divine » rend le remplacement explicite.

`lot6/religions.json` : **360 créations et 360 sauvegardes/relectures**, pour les 30 religions proposées, les deux voies de remplacement et les catégories jeune/mûr/vénérable, sur les deux produits. **240 inversions des achats** contrôlent leur ordre. La présence de la capacité divine, l’absence de celle remplacée, les rangs conservés et les valeurs exactes d’Archer émérite, Robustesse et Poings de fer sont vérifiés. Périmètre : prêtre humain sans armure ni bouclier, deux voies de prêtre ; les croisements hybrides/historiques ne sont pas déclarés couverts par ce lot.

La preuve avant correction porte sur 180 cas : 136 échouent, y compris des exceptions du moteur avant projection. Les résultats sont conservés dans `lot6/religions-before.json`. Les 20 contrôles DOM simulés des deux interfaces valident les options et la transmission du choix ; ils ne constituent pas une recette au clic sur Android.

`lot6/pdf-religions.json` : **six vrais exports**, natifs/partagés, couvrent les substitutions de rang 1/2/3, les titres de formulaire, les descriptions complètes des annexes et les PV. La page officielle des voies et l’annexe de l’export natif de rang 3 ont été rendues et inspectées. Le produit maître historique n’embarquant pas l’exporteur natif, sa parité PDF n’est pas revendiquée.

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_religion_creation_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_religion_ui_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_pdf_religion_runner.cjs CHEMIN_DU_PDF_VIERGE DOSSIER_TEMPORAIRE
```

Fin du lot 6 : **34 suites PASS**, 179 120 configurations rejouées sans échec d’assertion ; les empreintes du moteur et des données correspondent à la matrice. L’amélioration de l’export a ensuite modifié le HTML hors moteur : elle est contrôlée par les six exports dédiés et une nouvelle analyse de syntaxe. La différence des empreintes HTML complètes est donc conservée, sans attribuer à la matrice un contrôle de l’export. Les 240 inversions d’achat du nouveau test ont été réexécutées séparément et consignées dans `regressions.json`.

## Lot 7 — accès aux équipements légaux dans l’interface

Le moteur autorisait déjà un échange de paquetage approuvé par le MJ, mais l’interface ne permettait pas de saisir cet échange. Cela rendait certaines contreparties légales des petites tailles accessibles seulement aux tests.

Un panneau optionnel **« Échange de matériel validé par le MJ »** permet désormais de choisir les armes (avec plusieurs exemplaires et ajout de lignes), l’armure et le bouclier. Les choix sont conservés dans le brouillon et l’import d’un état équipé. Désactiver le panneau rétablit le paquetage ; le réactiver retrouve les choix. L’accord MJ ne désactive aucun contrôle de maîtrise, de taille, de bouclier ou de voie du moteur. Il s’agit de la politique d’échange Forge préexistante, pas d’un nouveau paquetage officiel.

`lot7/equipment-ui.json` : **36 scénarios DOM reliés au vrai constructeur d’équipement et au moteur**, sur les deux HTML, pour humain, halfelin, gobelin, kobold, lutin et fée, en profil pur/hybride/sans profil. Les 36 sauvegardes/relectures passent. Les 30 essais d’une arme trop grande restent refusés. Les tests couvrent aussi les armes multiples, la conservation du brouillon, le retour au paquetage et l’origine correcte du paquetage sans profil lorsque le profil global résiduel est différent. Ce sont des contrôles DOM, pas des clics Android.

La revue numérique est également étendue à **25 capacités et 132 cas** dans le runner source : Vivacité, les voies du vent/poing/méditation du moine, Murmures dans le vent, les effets initiaux du psionique et du samouraï, et Tour de magie au rang 3. Les six profils mages vérifient indépendamment le gain de +1 DEF et de +3 PM à l’acquisition de ce rang, avec sauvegarde. Les adaptations Compagnon restent signalées comme telles. Le rapport courant `lot4/source-numeric.json` est étendu ; son état antérieur de 74 cas reste dans l’historique Git.

35 suites passent. La correction du seul extracteur de fixture de l’ancien HTML, puis l’extension du test numérique, ont été réexécutées séparément et consignées dans `regressions.json`. Le moteur et les données n’ont pas changé dans ce lot : leur matrice complète précédente reste applicable, sans prétendre que la matrice vérifie l’interface.


## Lot 8 — peuples et historiques, texte intégral de Diversité

Source : Voies d’historique p.172 et Livre de base pp.57–58. L’humain avec historiques reçoit +5 dans une profession/loisir cohérent avec sa voie professionnelle ; son +1 PC reste acquis. L’elfe sylvain remplace le milieu forestier par son origine et augmente son bonus géographique de +3 à +5 ; cités et campagnes lui sont interdites. Ces règles concernent les peuples explicitement nommés : elles ne sont pas extrapolées au demi-elfe qui choisit leur voie.

Le moteur, les choix d’interface persistants et les exports natif/partagé appliquent ces règles, y compris quand la voie du mage conserve la capacité de peuple. Une ancienne origine interdite reste visible comme invalide jusqu’à correction, sans réécriture silencieuse. Le texte de Diversité est complété avec les six origines et les conditions des choix personnalisés, auparavant omis après « voir ci-dessous ». Les choix ordinaires de métier/origine hors historiques restent textuels ; ce lot ne prétend pas les automatiser.

Preuves dans `lot8/` : **288 cas**, dont **272 créations/relectures**, **16 refus attendus**, **272 désactivations du module** ; deux fixtures d’interface. La référence avant correction donne 72 échecs sur 144 cas. **Huit vrais exports PDF** vérifient les champs et les annexes, dont la capacité conservée par le mage ; page des voies de l’elfe et annexe du mage humain inspectées visuellement. **550 textes source correspondent** à leur source extractible : ce contrôle ne prouve pas que tous les paragraphes connexes sont présents.

État après correction : **36 suites PASS**, matrice complète de **179 120 tentatives**, **zéro échec d’assertion**, 27 familles de refus relues, empreintes moteur/données à jour. Les contrôles automatiques du statut passent. La clôture globale reste distincte des preuves de ce lot ; parcours Android et réserves listées plus haut non déclarés réalisés.


## Lot 9 — origine de Diversité enregistrée et exportée

Le choix des six origines du Livre de base pp.57–58 est désormais disponible pour la capacité Diversité, aussi lorsqu’elle est choisie par le demi-elfe ou conservée par la voie du mage. Le nomade enregistre son climat ; un des deux domaines peut être remplacé par une origine sociale ou un gagne-pain. Une origine personnalisée contient deux domaines distincts et un accord MJ. Le moteur refuse les origines inconnues, les champs personnalisés incomplets et le choix d’un profil comme gagne-pain. Les bonus sont de **+3, explicitement hors combat**, sans modification des attaques ni des statistiques permanentes. Le +1 PC préexistant est conservé.

Une ancienne création sans origine enregistrée garde son fonctionnement manuel : aucune origine ni bonus de compétence n’est inventé. Le choix est enregistré dans le brouillon et l’état exporté. Avec les historiques, l’humain utilise la règle +5 du lot 8 ; une origine +3 résiduelle ne se cumule pas. La capacité de la voie humaine choisie par un demi-elfe conserve sa règle propre.

`lot9/origins.json` : **2 856 créations et sauvegardes/relectures**, 17 profils, humain/demi-elfe, profil pur/hybride/sans profil, sept variantes d’origine (les deux climats du nomade), avec/sans remplacement social, sur les deux HTML. Les valeurs des deux domaines sont indépendantes des données du moteur ; statistiques et attaques sont comparées à leur référence sans origine. S’ajoutent **14 refus**, six interactions avec les historiques, huit contrôles personnalisés/compatibilité et deux fixtures d’interface reliées au constructeur des choix de peuple.

La référence précédente donne **1 428 créations sans origine projetée**, plus sept refus non appliqués et deux cas personnalisés non projetés : 1 437 assertions en échec. Le rapport `origins-before.json` distingue ces contrôles. Les erreurs de paquetage du générateur de test ont été corrigées avant cette comparaison finale ; elles ne sont pas comptées comme défauts du produit.

`lot9/pdf-origins.json` : **16 vrais exports** natifs/partagés pour humain/demi-elfe, voie humaine directe/conservée par le mage, origine sociale/personnalisée. Champs officiels, domaines choisis, +1 PC, +3 hors combat et texte source intégral sont contrôlés. Le résumé d’occultisme utilise le rang réel de la voie du mage : +4 au rang 2. Annexe du demi-elfe mage inspectée après rendu. Les huit exports historiques du lot 8 sont rejoués.

Fin de lot : **37 suites PASS** (36 suites de la campagne générale et la nouvelle suite ciblée), matrice complète rejouée sans échec d’assertion, revue des 27 familles actualisée. Le dernier changement de résumé PDF est extérieur au moteur ; le contrôle d’équipement lié au HTML a été réexécuté après ce changement. Les preuves ne constituent pas une recette au clic sur Android, et ne clôturent pas les réserves globales encore listées.


## Lot 10 — reprise du 30 octobre

Les correctifs non publiés du précédent chat ont été récupérés, contrôlés et sauvegardés sur `fix/forge-final-n1-bastide-n3` au commit `6b3cb24`. Le détail des sources, défauts et limites est dans [lot10/README.md](lot10/README.md). Rejeu indépendant : 7 600 tentatives, 7 480 créations et 120 refus attendus ; 60 cas peuples R1/R2 avec 60 sauvegardes et 50 retraits/choix ; 72 langues ; six contextes de familier. Les 210 résumés R1/R2 et 39 sentinelles sémantiques passent ; 96 résumés corrigés conservent leurs descriptions intégrales. Douze vrais exports N1 et six N3 ont été régénérés.

Défaut supplémentaire du relais : le PDF sans profil affichait les voies non choisies du profil technique dans les colonnes 3–5 et les annexes. Les deux exporteurs ne complètent plus ces colonnes ; nouveau contrôle des 15 titres/corps et des annexes sur les deux PDF sans profil, rendu final inspecté. Les exports classiques/hybrides conservent leur comportement.

Une nouvelle extension indépendante aux paires R2 par âge et le rejeu de la matrice générale sont en cours ; seuls les résultats effectivement terminés doivent être retenus. Aucun clic Android ni changement de rang d’un PJ réel n’est déclaré. Le mode volontaire sans voie reste absent et ne doit pas être confondu avec sans profil.

Rejeu final du relais : **179 120 tentatives, 159 290 créations acceptées, 19 830 refus conservés pour revue, zéro échec**. L’évolution des acceptations vient notamment des petits boucliers du mode sans profil. Les 27 familles sont à nouveau revues. L’oracle R2 couvre **7 140 paires sur deux produits**, dont **7 020 créations numériques conformes et 120 refus de bouclier attendus** ; l’armement absent des fixtures Artilleur a été corrigé et ses 168 cas seuls rejoués (166 anciens échecs du générateur conservés). Cette contre-vérification ciblée ne prétend pas être un deuxième rejeu complet. Les limites de caractéristiques/peuple/équipement/contexte de cet oracle restent explicites.
