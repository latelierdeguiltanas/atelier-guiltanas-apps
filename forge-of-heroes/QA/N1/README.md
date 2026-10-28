# Validation de la création N1

**Phase active : N1. Certification globale encore ouverte. N2 et N3 en attente.**

Ce dossier remplace les anciens compteurs comme point de suivi actuel, sans réécrire les preuves historiques de `FINAL_FREEZE`. Les résultats sont attachés aux empreintes du moteur et des données ; les contrôles PDF conservent leur propre périmètre. Les trois profils et huit peuples du Compagnon restent des adaptations Forge, pas une certification officielle COF2.

## Matrice déterministe exécutée

| Groupe | Configurations | Acceptées par le moteur | Refusées, conservées pour revue | Échecs d’assertion |
| --- | ---: | ---: | ---: | ---: |
| Profils purs × peuples × paires de voies | 2 720 | 2 296 | 424 | 0 |
| Variantes de bonus/malus de peuple | 5 950 | 5 102 | 848 | 0 |
| Autre choix du R2 initial des mages | 960 | 840 | 120 | 0 |
| Hybrides, deux sens, 25 croisements de voies, 16 peuples | 108 800 | 91 920 | 16 880 | 0 |
| Sans profil, toutes les paires distinctes, 16 peuples | 57 120 | 55 902 | 1 218 | 0 |
| Ordre inverse sans profil, humain | 3 570 | 3 500 | 70 | 0 |
| **Total** | **179 120** | **159 560** | **19 560** | **0** |

Couverture acceptée : 17 profils, 16 peuples, 85 voies principales, les 272 couples ordonnés de profils hybrides et 3 500 paires distinctes sans profil. 9 375 sauvegardes/relectures sont vérifiées dans cette matrice ; 5 144 mutations à zéro voie sont refusées avec un motif lié aux voies.

**Ce que ce résultat signifie :** les invariants testés passent, y compris les caractéristiques raciales calculées indépendamment, l’identité de profil, l’absence de capacité dupliquée, la présence des R1 choisis, la non-mutation des entrées et le rejeu échantillonné. Cela ne certifie pas chaque chiffre de chaque capacité : les valeurs exactes ciblées sont dans les suites séparées. Le nombre de configurations inclut plusieurs choix pouvant conduire au même résultat ; il n’est pas présenté comme un nombre de fiches mécaniquement uniques.

**Les refus ne sont ni des créations validées ni automatiquement des bugs.** Les 27 groupes de motifs de `matrix.json` restent à examiner et à compléter par des variantes légales : armes de petite taille, équipements ajustés des lutins/fées, monture du centaure, bouclier obligatoire, etc. Une répartition officielle différente est utilisée pour lutin/fée afin de respecter leur plafond de FOR. Le petit bouclier est équipé pour tester la voie du bouclier sans profil. Ces ajustements sont explicites dans le générateur.

## Défauts corrigés dans ce lot

- **N1-GNOME-HYBRID-001 :** Don étrange pouvait dupliquer une capacité déjà donnée par le profil secondaire. 80 cas ont été reproduits. Références : Don étrange p.53 et règle de non-cumul p.39 ; la règle Forge du don différent existait déjà pour les profils purs. Le contrôle est ajouté avant la fusion des profils ; le choix en double est refusé, puis un autre don est accepté. 160 vérifications, sur les deux produits, contrôlent aussi les voies conservées et la sauvegarde. La fixture et les identifiants obtenus avant correction sont dans `defects/gnome-hybrid-duplicate.json`.
- **N1-PDF-HISTORY-001 :** le PDF imprimait des historiques désactivés provenant de valeurs résiduelles du brouillon (`geoId`/`proId`). Reproduit par un vrai téléchargement dans Chrome. L’export respecte désormais l’activation du module. Deux exports natifs N1 et un export partagé vérifient l’absence d’historiques inactifs et la conservation des historiques actifs. Le produit maître ancien n’embarque pas cet exporteur : sa parité PDF/UI n’est pas revendiquée.

Les contrats anciens ont aussi été actualisés pour les quatre champs introduits depuis leur rédaction : calculs des capacités, catalogue d’actions, règles d’équipement et journal des effets. Les assertions numériques, les chemins obligatoires/invariants et les dix sabotages anti-faux-vert sont conservés. Les fiches MANUAL_02/03 sont corrigées avec formules et références COF2 : bonus humain légal et PC 4 pour le point-buy ; PV 15 pour le barbare mûr.

## Contrôles complémentaires

- 24 suites de régression : PASS ; détail et sorties dans `regressions.json`.
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

1. Classer les 27 motifs de refus et ajouter leurs contreparties légales ; contrôler les restrictions et paquetages dans le vrai parcours de chaque peuple concerné.
2. Étendre les valeurs attendues indépendantes aux effets N1 encore non couverts, y compris les rangs accessibles à la création par âge, les dons et les interactions d’équipement.
3. Couvrir toutes les alternatives de choix persistants, les trois séries, les répartitions/achats/semi-aléatoire, les voies de peuple alternatives du demi-elfe, la voie du mage, les historiques, options, religions et capacités à la carte. Les suites existantes sont ciblées ; leur produit cartésien complet n’est pas certifié.
4. Répéter les parcours au clic pour hybrides, sans profil et options ; vérifier les exports associés, l’aller-retour d’import et Android. Un seul parcours réel ne valide pas toutes les interfaces.
5. **Sans voies :** le produit actuel exige des voies et refuse zéro voie. Ce refus est testé. Une création volontaire sans aucune voie n’est pas un mode existant et reste une exigence à préciser, pas une fonctionnalité déclarée validée.
6. Corriger aussi la référence source interne héritée de Don étrange (`p.136` au lieu de `p.53`) ; elle est signalée ici sans réétiqueter les empreintes des preuves déjà exécutées.
7. Résoudre les éventuels écarts, rejouer les tests concernés et clôturer explicitement la phase N1. Aucun compteur ne déclenche automatiquement la phase N2.
