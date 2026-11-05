# Forge N1 — réconciliation des pourcentages après suppression du produit maître

Date : 2026-11-05. **Produit unique : `forge-of-heroes/index.html`**. Aucun test ni correctif ne doit maintenir un second HTML Forge.

## Empreintes du vrai produit publié

- `index.html` SHA-256 : `a423612a720bd568802b4195452019fc97524440ea86b870da3598c8fdd4a4a4`
- moteur embarqué SHA-256 : `8101edad805fa44c90e1d185a56394de168b565914c515f529ed06d82e5ea022`
- base embarquée SHA-256 : `8ced62df8ee6381ac3c23c269c27623ea8d35c76cf2e77f6299b1525888bad2d`

Les anciens rapports contenant le fichier `FORGE_OF_HEROES_ATELIER_GUILTANAS_PRODUCT_MASTER.html` sont **historiques** ; leur portion concernant `index.html` n'est réutilisable que si l'empreinte exacte du fichier testé coïncide avec celle ci-dessus. Le maître HTML et son manifeste ont été supprimés. Les scripts encore nécessaires à la recette sont dirigés vers `index.html`.

## Valeurs et certifications

| Ligne | Indicateur | Statut après contrôle |
| --- | --- | --- |
| Arquebusier + variante Arbalétrier | **14/16 = 88 %** | Revalidé sur le SHA d'index courant, **NON certifié** |
| 13 autres profils du Livre de base | anciens **11/16 = 69 %** chacun dans `progress.json` | Archive du 3 novembre, SHA moteur antérieur : **non certifié sur la version actuelle** |
| 8 peuples du Livre de base | anciens **6/10 = 60 %** chacun dans `focus.json` | Le socle de six points dépend d'un ancien moteur ; requalification **partielle seulement** sur l'actuel |
| Forge N1 officielle | 0 profil, 0 peuple à 100 % | **NON certifiée globalement** |

Ces pourcentages sont des proportions de critères de validation finis, **pas des probabilités de fiabilité**.

## Contrôles exécutés sur le seul `index.html`

- Méthodes : **1 008/1 008 PASS**, zéro échec/refus ; séries, achat et semi-aléatoire × 14 profils × 8 peuples, projection et persistance (rapport : `QA/N1/official-methods-cross.json`, [run 42040604670](https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/42040604670)).
- Options raciales : **392/392 PASS**, zéro échec ; choix de caractéristiques et héritages possibles sur 14 profils × 8 peuples, sauvegarde et dérivés (rapport : `QA/N1/official-racial-options.json`, [run 42041636496](https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/42041636496)).
- Historiques pour l'Arquebusier pur : **1 152 cas**, dont **1 120 créations PASS**, **32 refus légaux explicitement attendus**, **0 échec** ; vénérable, paires géographiques/professionnelles, sauvegarde et relecture (rapport : `QA/N1/arquebusier-history-people-cross.json`, [run 42042036344](https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/42042036344)).
- Copilote mobile : tests de rendu et d'actualisation, une ligne de profil, huit peuples et quatorze positions PASS ([run 42042256674](https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/42042256674)).
- Consolidation d'un seul produit : suppression du maître, checks syntaxiques et chargement moteur PASS ([run 42037838599](https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/42037838599)).

## Ce qui reste à valider pour le profil prioritaire

1. **Rang 3 / dons accordés** : les cinq capacités R3 des voies de profil sont présentes et leurs effets de base sont ciblés. Clôturer au clic et dans les calculs **chacune des conditions des quinze capacités accordables par Combattant aguerri**, notamment Vivacité (mouvement 1/combat), Teigneux (réaction face au déplacement ennemi), Attaque à suivre (seconde main après échec) et Protéger un allié (bouclier, timing, non-surprise, 1/round). Couvrir aussi les refus, restrictions d'armure et rechargements et la persistance. Aucun effet contextuel ne doit devenir permanent par erreur.
2. **Historiques avancés** : les 17 voies et leur validation de parcours sont prouvées dans la matrice courante ; clôturer **tous les effets permanents et contextuels encore non prouvés individuellement**, ainsi que les choix persistants, origines interdites et leur restitution sur la fiche PDF officielle et ses annexes. Les 1 152 parcours ne certifient pas chaque effet.
3. Refaire les tests complets au clic, sur mobile et PDF **sur l'empreinte finale** après tout correctif susceptible de changer le produit. Seuls les critères complètement couverts peuvent passer au vert ; ensuite fermer le profil Arquebusier à 16/16 et ouvrir Barbare.

Pas de travaux Compagnon dans ce périmètre ; Guide du joueur à intégrer quand la référence sera fournie. Les adaptations COF1 ne comptent pas dans les quatorze profils/huit peuples officiels.
