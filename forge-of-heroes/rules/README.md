# Couverture des règles de Forge

Ce lot ne certifie pas l'intégralité du moteur. `completion-audit.json` indique explicitement les sources disponibles, les données manquantes et la validation partielle des calculs.

## Textes

- 100 voies principales : 85 de profil et 15 de peuple, soit 500 rangs avec texte source conservé.
- Les quatre voies d'arcanes supplémentaires ont 20 descriptions encore incomplètes. Les trois photographies du PDF fourni ne contiennent pas l'intégralité des quatre voies ; leur contenu ne doit pas être inventé.
- Les textes COF2 conservent leur édition. Les 110 capacités issues du Compagnon ont leur texte original COF1 et une conversion Forge séparée, explicitement non officielle.
- Le guide de conversion fourni vise principalement les PNJ/créatures. Ses augmentations de PV/DM ne sont pas appliquées aux PJ.
- Les anciennes données corrompues du kobold sont remplacées, y compris le véritable rang 4 « Attaque vicieuse ».

## Conversion du Compagnon

La politique `companion-conversion-policy.json` trace la conversion DEX→AGI, SAG→PER, les gains de score COF1 +2 devenant un gain de modificateur COF2 +1, les dés bonus et les coûts de sorts de profil. Les quotas raciaux restent distincts des PM. Les adaptations de rang 1 déjà utilisées sont conservées ; il n'existe pas de validation exhaustive d'équilibrage en partie.

## Calculs de ce lot

`path-calculations.js` ajoute uniquement des règles permanentes explicitement définies à la base, sans réappliquer les effets historiques : Peau de fer, Maîtrise du ki, Course du vent, Écailles du kobold, Petit pote, Petit veinard et les bonus permanents du rang 3 de la voie du mage.

Les expressions entre crochets sont exposées dans `sticky.abilityCalculations` et `characterState.abilityCalculations`. Les dés ne sont pas lancés. Une variable inconnue de cible reste `CONTEXT_REQUIRED` ; elle n'est jamais remplacée arbitrairement par zéro. L'arithmétique ne fait appel ni à `eval` ni à `Function`.

Les pouvoirs activés, compagnons, choix et augmentations de caractéristiques des rangs élevés qui ne disposent pas encore d'un traitement spécialisé ne sont pas certifiés par ce lot. Le moteur de passage de niveau reste limité à son périmètre déjà testé ; cette modification ne débloque pas tous les profils ou tous les niveaux.

## Vérification

```
node forge-of-heroes/FINAL_FREEZE_TESTS/path_calculations_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/path_descriptions_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/hybrid_point_buy_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/forgesort_paths_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/native_progression_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/progression_runner.js
node forge-of-heroes/FINAL_FREEZE_TESTS/storage_safety_runner.js
```

Ces contrôles couvrent les ajouts ciblés, les 75 textes de peuple, la résolution sûre des formules, le rendu des cinq rangs, les sauvegardes et les régressions de progression. Ils ne constituent pas une certification de 520 effets mécaniques.

## Lot 1 — dons, attaques et compagnons

`validation-lot1.json` borne la validation du premier lot. Le nouveau scénario `grants_attacks_companions_runner.cjs` couvre 78 créations/rechargements sur chaque produit, dont 50 combinaisons sorcier/moine. Il vérifie des valeurs attendues indépendantes, les changements aller/retour, les restrictions et les choix persistants ; il ne prend pas un simple nombre de capacités comme preuve mécanique.

Les attaques de contact du moine et du bâton de mage sont corrigées : le caractère magique des DM ne transforme pas leur jet en attaque magique. Les capacités accordées par peuple sont intégrées avant les calculs sémantiques, une seule fois, avec leurs choix, leurs sorts et leur coût nul en points de capacité. Les huit types de compagnons visés par ce lot sont calculés depuis les valeurs finales du maître et apparaissent dans le récapitulatif. Les bonus de familier restent conditionnels et leur DEF ne se cumule pas.

La version de règles `FOH_PATH_RULES_2` permet de recalculer les anciennes sauvegardes lorsqu'elles sont ouvertes ; une erreur de choix ou de stockage ne remplace pas la sauvegarde existante par un état incomplet.

```
node forge-of-heroes/FINAL_FREEZE_TESTS/grants_attacks_companions_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/grants_attacks_companions_runner.cjs FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html
```

## Lot 2 — inventaire complet et calculs ciblés

Le bilan global est désormais `completeness.json`, consultable dans `coverage.html`. L'ancien `completion-audit.json` reste limité aux 520 rangs de profil/peuple ; il ne couvre pas les historiques. Le nouvel inventaire contient 121 voies et 605 rangs : 445 de profil, 75 de peuple et 85 d'historique. Il recense 585 textes disponibles et 20 textes d'arcanes incomplets. Une description disponible ne certifie pas le calcul de tous ses effets.

Les 75 textes d'historique encore absents ont été transcrits mécaniquement depuis les photographies fournies, avec typographie normalisée. Les intitulés provisoires ont été remplacés par les véritables capacités ; l'annexe de fiche utilise ces textes. Les dix textes montagne/nomade déjà vérifiés sont conservés. `history-source-transcriptions.json` conserve la transcription du présent lot. Les talents définis avec le MJ restent des choix, pas des effets inventés par le moteur.

`permanent-rules.js` traite les gains héroïques, les caractéristiques de peuple, les augmentations rétroactives de PV avec CON, plusieurs bonus dépendant du rang, les seuils de critique, les restrictions d'armure et des dépendances après gain de caractéristique. Les objets mathématiques exposent les gains dans `statGainLedger` et `ruleCompletionLedger`. Les projections R4/R5 des tests ne débloquent pas la progression réelle.

`ability-runtime.js` expose les actions, coûts de base, quotas usuels et contrôles atomiques de ressources. Les sorts du Compagnon sont reconnus même sans astérisque dans leur intitulé. Une activation avec coût additionnel non résolu est refusée ; les dés ne sont pas lancés. Les effets complexes, transformations et quotas particuliers ne sont pas intégralement automatisés. Le catalogue d'actions n'est pas une certification d'effets de combat.

Les dons de peuple appartenant au profil fournissent désormais leur prérequis gratuit pour un achat suivant, quel que soit l'ordre des achats. Un don d'un profil extérieur n'ouvre pas ses rangs suivants. Le novice de l'érudit et le garde du corps du nanti disposent de valeurs calculées ; le bonus de DEF du garde reste soumis au contact explicitement indiqué.

La version `FOH_PATH_RULES_3` déclenche le recalcul des anciennes fiches. Les régressions de création, stockage, six profils natifs, 226 plans N2 et transfert au Hub passent. Le test du formulaire PDF officiel n'est pas validé : le PDF vierge fourni n'a pas les champs éditables attendus. Aucun test visuel de navigateur n'est revendiqué.

Les six axes restent partiellement validés. Les traitements propres à toutes les capacités, les constructions d'invocation, l'équilibrage en partie et la progression générale de tous les profils ne sont pas certifiés. Ne pas afficher « données et calculs complets » sur la base du seul nombre de textes.

```
node forge-of-heroes/scripts/sync-rule-bundles.cjs
node forge-of-heroes/scripts/build-completeness.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/permanent_rules_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/ability_runtime_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/grant_prerequisites_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/history_completeness_runner.cjs
```
