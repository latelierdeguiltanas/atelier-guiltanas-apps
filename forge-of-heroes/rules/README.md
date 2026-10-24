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
