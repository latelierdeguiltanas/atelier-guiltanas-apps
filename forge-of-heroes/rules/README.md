# Couverture des règles de Forge

Les 122 voies intégrées ont leurs 610 textes. Cela ne couvre pas toutes les voies des PDF fournis, et le moteur de calcul reste partiel. Le bilan actuel est `completeness.json`, consultable dans `coverage.html`. La version de règles est `FOH_PATH_RULES_5`.

## Catalogue de sources

| Groupe | Voies | Rangs renseignés |
| --- | ---: | ---: |
| Profils, Compagnon et options | 90 | 450 |
| Peuples et voie du mage | 15 | 75 |
| Historiques | 17 | 85 |
| Total | 122 | 610 |

Les sources ont été lues dans les fichiers fournis. Les 110 capacités du Compagnon conservent leur original COF1 et une adaptation Forge séparée, explicitement non officielle. Les quinze rangs 1 de profil du Compagnon ont leur description complète, y compris la construction de l'entité et les caractéristiques du familier.

**Correction du précédent bilan :** les vingt rangs d'arcanes étaient bien présents, répartis entre les trois photographies. Leur classement comme sources incomplètes était une erreur de repérage. Ces mêmes photos contiennent aussi la voie de la corruption, ajoutée au catalogue. `advanced-source-transcriptions.json` conserve ces 25 rangs, la table de Métamorphe et leurs pages. `history-source-transcriptions.json` conserve les 75 transcriptions d'historique ajoutées au lot 2 ; les dix textes montagne/nomade déjà vérifiés sont conservés.

`completion-audit.json` garde un périmètre plus restreint : profils et peuples, soit 525 rangs. Le bilan global avec les historiques est `completeness.json` (610 rangs). Les anciens fichiers `validation-lot1.json` et `validation-lot2.json` décrivent leurs lots historiques ; leurs anciens décomptes de sources ne constituent pas l'état actuel.

## Périmètre supplémentaire du Compagnon

`companion-source-scope.json` recense les omissions retrouvées dans les sources : 10 voies de prestige, 35 domaines religieux et 14 voies d’organisation, plus 8 voies d’objets prestigieux séparées. Il s’agit de titres repérés, pas de rangs déjà transcrits ou adaptés. Les règles de CO OSR sont une variante distincte. `sourceCatalogComplete` ne s’applique qu’aux 122 voies déjà intégrées ; `allProvidedSourcePathsIntegrated` reste faux. Le sixième point est désormais partiel sur le périmètre demandé.

## Calculs et interactions intégrés

`permanent-rules.js` traite les gains héroïques, les caractéristiques de peuple, les PV rétroactifs liés à CON, plusieurs bonus dépendant du rang, les seuils de critique et les dépendances après gain de caractéristique. Les gains sont exposés dans `statGainLedger` et `ruleCompletionLedger`. Les substitutions FOR/AGI et rang aux DM du sabre du samouraï sont effectives et réversibles ; empathie et ki suivent leur rang.

La maîtrise de l'armure est distincte de la limite d'armure de chaque profil. Les capacités incompatibles sont signalées ; les sorts autorisés calculent leur surcoût en PM. Tour de force, Armure lourde, Autorité naturelle, Armure d'os et Seconde peau sont pris en compte. Formation martiale et Seconde peau ont des choix persistants. Les restrictions de petite taille restent appliquées après les maîtrises. Vêtements sacrés propose un choix persistant : tenue bénie ou cotte de mailles pour une divinité guerrière. La variante remplace les bonus de la tenue, et un hybride doit déjà maîtriser la chemise de mailles. La résistance au contrôle mental est exposée comme dé bonus conditionné à la tenue sans armure.

Les dons de peuple appartenant au profil peuvent servir de prérequis gratuit, quel que soit l'ordre des achats. Un don provenant d'un profil extérieur n'ouvre pas automatiquement ses rangs suivants. Les calculs des attaques de moine et de bâton de mage distinguent le jet d'attaque du type de DM.

Les deux produits partagent maintenant le même bloc moteur, y compris le contexte sémantique de rang. La synchronisation ne se limite plus aux trois modules ajoutés. Les sauvegardes antérieures peuvent être recalculées avec la nouvelle version ; un échec ne doit pas écraser l'état existant.

## Actions et ressources

`ability-runtime.js` expose les actions, les coûts, les quotas usuels et leurs contrôles atomiques. Les quotas par cible sont séparés de ceux du lanceur. Rage et furie utilisent une réserve partagée, dépendant des voies de barbare au rang 4 ; la furie consomme deux utilisations. Les six vies du druide ne se réinitialisent pas au repos.

Concentration accrue, entretien de Strangulation, hausse du coût des Foudres divines et coût spécial de Rune de garde sont traités. Ventriloquie utilise son coût selon l'action ; Métamorphe utilise ses neuf seuils de NC, niveau et PM. Corruption remplace les soins, avec une attaque au contact et un dé bonus pour Blessure mineure. Toiles n'ajoute pas une attaque infligeant des DM par défaut : ses DM exigent l'incendie des toiles.

Les expressions entre crochets sont exposées dans `abilityCalculations`. Les modificateurs de dégâts peuvent être résolus, mais les dés ne sont jamais lancés. Une arme ou une cible non spécifiée reste un contexte requis. L'arithmétique n'utilise ni `eval` ni `Function`.

La brûlure de mana exige zéro PM, un sort payant hors soins, les PV et le DR du personnage, et un résultat de DR fourni pour chaque PM. Les PV sont déduits sans RD ; aucun dé n’est lancé. Un coût ou un jet invalide ne modifie rien. Une récupération complète des PM ne restaure pas ces PV. Les anciens états sans réserve de PV restent lisibles mais ne peuvent pas payer cette option. Pour un pouvoir à effets variables comme Miracle mineur, l’usage hors soins doit être déclaré.

Les durées, autres sacrifices de PV, conditions gestuelles, résistances des cibles et toutes les transformations ne sont pas intégralement automatisés. Un catalogue d'actions n'est pas une certification de tous les effets de combat.

## Compagnons et adaptation du Compagnon

Les compagnons natifs ont des valeurs dépendant du maître, et leurs paliers grand félin, monture fantastique, golem supérieur et tactiques de meute sont calculés dans des projections de haut rang. Le novice, le garde du corps et le chien de garde fantomatique sont aussi calculés. Une projection ne permet pas d'acheter illégalement un rang élevé au niveau 1.

L'entité propose une répartition de 4 points FOR/AGI et de 2 points INT/PER/CHA, avec CON +2. VOL égale PER et Initiative = 10 + PER sont des décisions Forge tracées dans `companion-conversion-policy.json`. Ses améliorations et celles du golem ont des choix contrôlés. Le familier de l'invocateur partage les PV de son maître. Les caractéristiques absentes de la source ne sont pas inventées.

Les huit catégories de prédateurs ont une fiche calculée. Cinq utilisent des animaux natifs COF2 ; trois sont des variantes Forge déclarées dans `FOH_PREDATORS_COF2_V1`, avec une formule de renforcement explicitement non officielle. Les NC natifs du lion et du grand mâle sont conservés (3 et 4). Renforcement, choix de meute avec baisse de catégorie, durée, portée et Cuirasse sont calculés sans jeter les dés du nombre de créatures. Les autres mutations restent partielles. L’armée a ses PV, dégâts par rang, durée, formation, mouvement et contre-attaque définis. Ce sont des fiches de pouvoirs à activer, pas des créatures automatiquement présentes. Le guide de conversion fourni vise principalement les PNJ/créatures : ses augmentations de PV/DM ne sont pas appliquées aux PJ. Aucun équilibrage en partie n'est certifié.

## PDF et progression

Le PDF vierge fourni est reconnu par son empreinte SHA-256 exacte. À l'import, le moteur y ajoute 156 champs éditables correspondant à sa mise en page. Un autre PDF sans champs est refusé ; les modèles déjà éditables restent pris en charge. Le PDF original n'est pas distribué : la transformation s'effectue à partir du fichier importé par l'utilisateur.

Les six exports N2 passent avec valeurs attendues, cases acquises et annexes. Champs, widgets, valeurs et apparences ont été relus, et des pages remplies ont été rendues et inspectées. Le catalogue de progression et les libellés PDF reprennent les sources canoniques ; 195 textes ont été synchronisés sans modifier les effets numériques des anciens personnages. La généralisation du passage de niveau à tous les profils et niveaux reste à réaliser.

## Vérification

`validation-lot4.json` ajoute 40 cas Vêtements sacrés/brûlure de mana et 25 cas de conjuration. `validation-lot3.json` borne le lot précédent. Il ajoute 16 créations/rejeux et 60 vérifications de répartition d'entité sur les deux produits, plus 10 créations/rejeux de voies optionnelles. Les vérifications de haut rang sont des projections isolées. Les régressions de stockage, les 50 hybrides sorcier/moine et les 226 plans N2 existants passent. Aucun parcours au clic dans un navigateur n'est revendiqué.

```
node forge-of-heroes/scripts/sync-rule-bundles.cjs
node forge-of-heroes/scripts/sync-pdf-catalogs.cjs
node forge-of-heroes/scripts/build-completeness.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/equipment_runtime_companions_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/advanced_paths_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/flat_pdf_template_runner.cjs CHEMIN_DU_PDF_VIERGE_FOURNI
node forge-of-heroes/FINAL_FREEZE_TESTS/progression_pdf_runner.js CHEMIN_DU_PDF_VIERGE_FOURNI DOSSIER_TEMPORAIRE
```

Le nombre de textes et le nombre de tests ne constituent pas un taux de complétude mécanique. Les six axes du bilan distinguent la complétude des textes des traitements encore partiels.
