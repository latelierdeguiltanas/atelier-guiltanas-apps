# Réconciliation N1 — lot du 19 novembre 2026

## Version et limites

Base Git : `8bbc4fe5a1401c3a58f3c24c27aec130e4520797`.
Produit unique `forge-of-heroes/index.html`, blob `ff3ec9147d17a2bf4b3f8cebd2c39816217737f5`.
SHA256 index : `79bee1e8b4ce222cd2847d49ea7f56d8a22d8f667a1db04e4635a9fb594f9f2d`.
Moteur : `195a96fa8d6bc87d3a919be27787f56100ab2e69615d4b8c4bc1419a652d0181`.
Catalogue : `09bfd6316ed420e59f177738a1a402f849a91dd74f3b01dd7bb17d28f8fb44cb`.
Index, moteur et catalogue restent inchangés par ce lot. Les empreintes de fiche et de passerelle figurent dans les JSON.

Le téléchargement anonyme GitHub Pages au début du lot donne le même SHA256 que l’index local. Cela prouve la parité des octets, pas le fonctionnement de chaque parcours.

## Réconciliation effective

- Catalogue courant : 26 peuples, 18 profils ; 95 voies de profil, 27 de peuple, 17 historiques. 695 rangs inventoriés, plus 50 rangs de prestige en référence séparée.
- Ancien audit : 525 rangs de peuple/profil ; catalogue actuel : 610. Les 85 écarts sont **25 rangs Arbalétrier** et **60 rangs de 12 voies de peuple**. Détail identifiant par identifiant : `85-ranks.json`.
- 451 rangs candidats dans le périmètre N1 ordinaire (R1–R3 profil/peuple et R1–R5 historique). Les 244 rangs supérieurs ont une revue d’accès exceptionnel obligatoire, sans exclusion automatique. Le registre ne prétend pas que tous ces candidats ont un témoin d’accessibilité déjà établi.
- 51 acquisitions/relectures des rangs N1 parmi les 85 écarts : PASS. Les 34 autres entrées restent NON TESTÉES pour un accès exceptionnel. Aucun refus non qualifié n’est compté comme création réussie. Les premières fixtures de développement ont été corrigées (identifiant d’arme, paquetage conservé, dépense complète des points) ; ces refus de fixtures ne sont pas des défauts du produit.
- Couverture d’ensembles : les entrées enregistrées permettent de couvrir ces 51 acquisitions avec **17 témoins** au lieu de 51. Les entrées et la relation témoin/règle sont dans `set-cover.json`. Ce plan concerne les acquisitions, pas les effets numériques.
- Les rapports du 15 novembre sont réutilisables pour leurs assertions contre l’index strictement identique : 468 témoins peuple/profil, 7650 paires de voies hybrides, matrice pure 6236 acceptés et 4 refus attendus. Ils ne prouvent pas les effets non assertés ni les nouvelles dépendances de fiche. Ils n’ont pas été rejoués inutilement.
- Quatorze rapports contiennent une correspondance d’index ou moteur/catalogue ; ce sont des candidats de reprise, pas quatorze certificats complets. Les autres rapports restent en revue de dépendances, sans invalidation automatique. Empreintes et qualification : `coverage-register.json`.
- Le document Drive « 00 — ÉTAT DU PROJET — FORGE OF HEROES » a été lu. Son dernier jalon de reprise du 13 novembre est antérieur aux preuves du 15. Ses anciennes consignes de profil unique sont remplacées par la directive du 19. Aucun document Drive modifié.

## Défaut FOH-BONE-TRANSFER-001

**Reproduction** : Sorcier elfe haut, Outre-tombe R2, AGI +1, sélectionner Armure d’os via échange MJ puis exporter vers la fiche native.
**Source** : Livre de base COF2, page imprimée 109 / PDF 111, relue visuellement ; SHA256 PDF `997f2e784a4bcd69c64f9f1bd38f13fc57a003d8ea48cdf15a2577aeab0d9fae`.
**Attendu** : DEF 11 inactive ; 14 après confection personnelle et entretien de dix minutes ; aucun coût PM ajouté ; retour à 11 après retrait, nouveau jour en jeu ou perte. Autre armure +2 : DEF 13, sans cumul.
**Observé avant** : DEF 14 inactive, 17 active, 16 avec cuir. Neuf contrôles échouent.
**Cause** : DEF exportée inclut déjà l’armure sélectionnée ; `startingProtection` ne reconnaît pas l’armure d’os et ne retire donc pas son bonus initial. L’activation ajoute ensuite trois points supplémentaires.
**Correction** : reconnaître la protection initiale spéciale, retirer sa contribution avant le recalcul en jeu ; ignorer l’objet spécial dans les armures ordinaires ; gérer séparément le plafond d’AGI initial/courant. La préparation quotidienne n’est jamais inventée lors d’un import. Aucun état de PJ réel réécrit.
**Après** : 22 contrôles numériques/DOM PASS. Vingt transitions N1 réparties entre armure sélectionnée/non sélectionnée ; deux cas de borne AGI élevée sont des projections de fiche distinctes, pas des créations N1 légales. Le plafond de ces projections suit la politique de catalogue existante ; il ne vaut pas nouvelle certification de cette interprétation source.

Le test exécute le vrai moteur, l’adaptateur natif et le script entier de fiche dans JSDOM. Confection, entretien, port A→B→A, nouveau jour en jeu, autre protection, perte, retrait d’acquisition, ressources et rechargement sont exercés. Il ne simule pas un téléphone physique et ne valide pas le PDF.

## Défaut FOH-SOURCE-BUNDLE-002

`permanent-rules.js` et `path-calculations.js` étaient antérieurs aux modules embarqués. Les reconstruire aurait supprimé des corrections déjà publiées. La suite permanente échouait sur une projection R5 ; la source ne connaissait notamment pas Lady fée et gardait les anciens gains de Seigneur féerique.

Les deux fichiers ont été réalignés **octet pour octet sur leurs modules de production**, sans modifier le moteur ni inventer de règle. Les quatre modules source correspondent désormais à ceux de l’index. Le générateur du registre refuse cette divergence à l’avenir. `regressions-before-source-sync.json` conserve l’échec ; `regressions.json` donne les six suites PASS, dont 28 cas de règles permanentes et leurs projections. L’oracle n’a pas été affaibli.

## Mesure et Copilote

Les mêmes fichiers officiels reçoivent un champ `reconciliation` ; les champs anciens restent archivés. Les vues existantes privilégient ce registre. Aucune troisième application de suivi.

Dénominateur : 451 × 10 obligations individuelles + 244 revues d’accès exceptionnel + 35 contrôles moteur/interactions/intégration = **4789**. Numérateur documenté à ce lot : **203**, soit **4,24 %**. Il s’agit du **minimum déjà rattaché aux nouvelles obligations**, pas d’une estimation de fiabilité ni d’une remise à zéro des preuves historiques. Leur rattachement fin reste ouvert ; les 14 candidats à dépendances correspondantes sont conservés.

Une règle est close mécaniquement dans ce lot : Armure d’os N1. Aucun nouveau profil, peuple ou certificat fonctionnel complet n’est déclaré. Les dix obligations de cette règle sont fermées dans le périmètre mécanique/DOM ; les contrôles transverses de moteur partagé, PDF et navigateur restent ouverts.

## Reproduction

```sh
npm install --prefix /tmp/forge-qa-deps jsdom@26 --no-audit --no-fund
NODE_PATH=/tmp/forge-qa-deps/node_modules node fiches-personnages/tests/bone-armor-certification.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_untracked_rank_probe.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_targeted_set_cover.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/n1_certification_register.cjs
```

Chromium local : BLOQUÉ, `socket() failed: Operation not permitted`. Test réel fourni dans `fiches-personnages/tests/bone-armor-certification-browser.cjs` et workflow `forge-n1-targeted-certification.yml`, sans résultat anticipé. Les essais navigateur isolés et la parité du site publié sont deux contrôles distincts.

## Suite prioritaire

1. Rattacher les preuves courantes aux obligations de chaque capacité ; classer manuellement les types de mécanismes signalés automatiquement. Un classement automatique n’est jamais présenté comme une revue terminée.
2. Fermer les effets/conditions des 51 rangs nouveaux avec oracles source et témoins réduits ; examiner les accès exceptionnels supérieurs.
3. Mutualiser les définitions de pouvoirs entre moteur et fiche : la formule d’Armure d’os reste dupliquée, cette architecture n’est pas certifiée par ce correctif de transfert.
4. Exécuter la recette navigateur réelle, PDF officiel/annexes et passage N2/N3/N4 ciblé sur simulations de bases vérifiées. Aucun PJ réel ne sert de fixture.

Reprise de preuves effectuée : 32 capacités de peuple R1/R2 et 15 capacités Arquebusier R1–R3 ont leurs acquisitions et sauvegardes rattachées aux obligations exactes (90 points supplémentaires, doublons dédupliqués). Leurs chiffres vérifiés sont enregistrés en preuves partielles ; aucune condition non assertée n’est déclarée close. Le générateur global conserve désormais le registre N1 à dépendances identiques.

## Recette publiée et conservation du suivi

Commit de recette publié : `59fcc192148d41580a7a79af35e2889b9e58f7ad`. Déploiement Pages `44485258135` PASS ; parité publique contrôlée pour l’index, la fiche JS et la vue de réconciliation. Les deux registres publics affichent bien 203/4789 après régénération automatique.

Recette Chromium Copilote `44485258433`, job `135427004957` : **six scénarios bureau/mobile PASS** (deux pages N1, carte et détail projet). Ce sont des contrôles du suivi, pas des créations de PJ ni une recette matérielle Android. L’ancienne recette de progression séquentielle a été remplacée par le contrat du catalogue courant, pas simplement supprimée.

Les trois anciens producteurs de registres redirigent maintenant vers le générateur courant ; ils ne peuvent plus restaurer les 8 peuples/14 profils et l’attente séquentielle à l’occasion d’un ancien workflow. Le générateur global conserve le résumé N1 à dépendances identiques. Ces protections ont été vérifiées par régénération effective.
