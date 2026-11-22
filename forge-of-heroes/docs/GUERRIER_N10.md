# Guerrier : progression urgente N1 → N10

Le carnet accepte désormais un guerrier pur sauvegardé dans Forge, dans ses cinq voies de profil. Les autres profils gardent leurs limites précédentes. Aucun personnage existant n'est monté automatiquement.

## Utilisation

Créer et sauvegarder le guerrier dans la Forge habituelle. Depuis Mes héros, choisir le passage de niveau, vérifier la base N1, puis dépenser deux points et valider chacun des niveaux jusqu'à N10. Le carnet reste ouvert entre les niveaux pour accélérer cette préparation. « Ouvrir ma fiche interactive » et le téléchargement PDF sont disponibles à partir du N2. Au N10, la fiche interactive s'ouvre automatiquement. Exporter le carnet pour conserver une sauvegarde transférable.

## Règles intégrées

Source : Livre de base COF2 fourni, pages imprimées 39 et 87–90. R1/R2 coûtent un point, R3/R4/R5 deux points ; niveaux minimaux 1/2/3/5/7. Gain par niveau : 5 + CON ; progression des trois attaques jusqu'au N10. Constitution héroïque recalcule les PV rétroactivement et les dés de récupération. Force héroïque modifie contact et dégâts de contact. Robustesse et les compétences suivent le rang courant. Bouclier, Dur à cuire, Rempart et le choix +1 DEF d'Armure lourde modifient la défense. L'autre choix donne la maîtrise des plaques sans créer ni équiper une armure gratuitement. Prédilection, critique, spécialisation, nouvelles catégories et bonus supplémentaires lors des rangs 5 sont persistés.

Les capacités conditionnelles conservent leurs textes et quotas. Les dés sont lancés à la main, les conditions et coûts d'utilisation doivent être appliqués selon leur texte. La défense de référence suppose le bouclier manié : les armes à deux mains affichées sont des alternatives à cette configuration.

## Limites explicites

Ce lot ne certifie pas tous les guerriers possibles. Les nouveaux rangs de peuple et d'historique sont bloqués dans ce parcours N10 en attendant leur audit. Les hybrides et voies de prestige ne sont pas ouverts au N10. Les tests multi-peuples conservent les capacités de peuple N1 ; ils n'attestent pas une progression de ces voies. Les fiches personnelles se sauvegardent sur l'appareil ; le serveur de campagne Bastide garde sa limite N3. La certification générale N1 n'est pas modifiée par ce lot.

## Preuves

`QA/N10/guerrier.json` : 80 parcours complets (8 peuples du livre de base × 5 voies prioritaires × 2 branches d'Armure lourde), sauvegarde/rechargement et export de fiche, plus exploration des répartitions de rangs des cinq voies. Oracle de PV, caractéristiques, DEF, initiative, attaques, dégâts et critique indépendant des fonctions de calcul de production. Ces répartitions ne représentent pas toutes les combinaisons de peuples, équipement et options. Les preuves au clic et PDF sont enregistrées séparément.

## Vérifications du 22 novembre 2026

- 80 parcours N1→N10 : huit peuples du livre de base, chacune des cinq voies prioritaire, deux branches d'Armure lourde. Les rangs de peuple restent ceux de la création.
- 8 534 transitions vérifiées, 1 681 configurations de rangs/étapes explorées depuis une base témoin ; 25 capacités de profil exercées. Cette couverture n'est pas une preuve de toutes les permutations ni de tous les équipements.
- Oracles indépendants : PV et CON rétroactive, FOR, trois attaques, DEF, initiative, DR, épée longue, critique et spécialisation.
- Dix véritables PDF N10 générés depuis le modèle officiel privé : caractéristiques, ressources, DEF/INIT et coches de rangs vérifiés. Le modèle privé n'est pas publié.
- Une création humaine puis neuf montées de niveau réalisées au clic sur GitHub Pages : dialogues, sauvegardes et ouverture de la fiche interactive N10. Résultat témoin : 92 PV, DEF 19, CON +3, 5 DR d10, épée +14 / 1d8+5 / critique 19–20.
- Non-régression : bases Bastide N2, 156 options N3, neuf profils natifs N2 ; 22 contrôles d'armure d'os et neuf pouvoirs à usages limités.

La demande « absolument tout » n'est pas clôturée : nouveaux rangs de peuple/historique, hybrides, extensions et toutes les interactions d'équipement restent hors certification N10. Les pouvoirs déclenchés gardent leurs textes complets et se résolvent avec les dés physiques ; la fiche n'automatise pas toutes leurs conditions de combat.

Parcours urgent : créer un guerrier classique, terminer sa fiche N1, choisir « Passer au niveau suivant », puis valider les neuf montées. Le carnet garde les décisions ; « Sauvegarder le carnet » exporte la sauvegarde, et « Ouvrir ma fiche interactive » ouvre la fiche du niveau acquis.

## Complément — capacités du profil dans la fiche interactive

Les 25 capacités de guerrier possèdent désormais une présentation propre avec calculs et contrôles des conditions. Le module partagé `ENGINE/guerrier-combat.js` est embarqué à l'identique dans la fiche ; `scripts/sync-guerrier-combat.cjs --check` empêche une divergence.

Parade et absorption : préparation, choix FOR/AGI, comparaison des jets, égalité à relancer, dommages, exception énorme/colossal et parade gratuite R5 avec dé malus. L'absorption et la parade partagent leur résolution par round ; le renvoi exige une absorption immédiatement précédente et refuse les sorts de zone. Le bonus de protection d'un allié reste un résultat à appliquer à cet allié, sans modifier sa fiche distante.

Attaques : puissance A/L, double, circulaire avec DEF par adversaire, parfaite et désarmement, riposte, Teigneux/Rempart et Piqûre de rappel. Les déclencheurs doivent être confirmés. Les dés évolutifs, dés bonus/malus, pénalités, critiques et bonus de dégâts sont calculés. Les résultats des dés physiques sont saisis ; les dégâts des adversaires restent gérés à la table.

Résistance : Prouesse retire réellement le résultat du dé évolutif aux PV. Les tests héroïques restent distincts des attaques. Dur à cuire permet le dernier round à 0 PV, puis le bouton de fin du dernier round applique l'inconscience si aucun soin n'est intervenu. Les états, quotas, postures et résultats sont conservés dans la sauvegarde de jeu. Les armes ajoutées à l'inventaire bénéficient aussi des prédilections ; la pique et la dague utilisée à distance ont été corrigées dans le moteur N1.

Les tests de cette passe sont `guerrier_integral_combat.cjs`, `guerrier_weapons.cjs` et `fiches-personnages/tests/guerrier-integral.cjs`. La couverture de ces tests porte sur les **25 capacités du profil guerrier pur N1–10**. Elle ne clôture pas les voies de peuple/d'historique, profils hybrides, règles de prestige ni interactions de tous les autres profils. Les données de création N1 et le catalogue de progression conservent leurs limites explicites.
