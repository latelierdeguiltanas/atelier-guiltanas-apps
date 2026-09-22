# Audit des cartes — Les Dragons de l’Île aux Tempêtes

Source étudiée : PDF officiel français de 48 pages, version scannée/rasterisée (~150 ppp par page).

## Cartes repérées dans le PDF

- Page PDF 5 : carte générale de l’Île aux Tempêtes.
- Page PDF 11 : carte du Repos du Dragon.
- Page PDF 18 : carte des Grottes de Poussemer.
- Page PDF 25 : carte de l’épave de la Rose des Vents.
- Page PDF 30 : carte de l’Observatoire de la Falaise.

Ces cinq cartes sont les cartes de jeu clairement identifiables dans le PDF.

## Nature technique de la source

Le PDF n’embarque pas les cartes comme images vectorielles ou fichiers séparés. Chaque page est une image JPEG pleine page d’environ 1100 × 1600 px à ~150 ppp. Pour conserver la fidélité exacte, la meilleure méthode est donc :

1. extraire/rendre la page source sans recompression destructive ;
2. recadrer précisément la zone de la carte ;
3. conserver une version maître haute qualité ;
4. produire une version web optimisée uniquement pour l’affichage ;
5. superposer l’interactivité en HTML/CSS/SVG sans modifier l’image de fond.

## Recommandation pour le hub

Ne pas redessiner les cartes si l’objectif est la fidélité au PDF. Utiliser les cartes extraites comme fonds de référence et rendre l’interactivité indépendante :

- zoom et déplacement tactile ;
- zones cliquables ;
- lieux découverts / non découverts ;
- marqueurs du groupe ;
- fiches de lieux et rencontres liées ;
- brouillard de guerre ou masques MJ ;
- version joueur sans informations cachées ;
- version MJ avec repères et notes privés.

Cette architecture permet de garder le dessin officiel intact tout en transformant la carte en interface vivante.

## Vigilance spoilers

Avant exposition aux joueurs, chaque carte doit être contrôlée individuellement : numéros, repères, noms ou éléments graphiques peuvent révéler des zones ou informations que le groupe n’a pas encore découvertes. L’espace joueur doit donc afficher uniquement une version validée « joueur » ou appliquer des masques par progression.

## Prochaine passe recommandée

Extraire les cinq cartes dans `cartes/assets/`, définir pour chacune un cadrage maître, puis construire le premier prototype interactif sur la carte générale de l’île avant de décliner le système aux quatre cartes de lieux.
