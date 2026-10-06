# Île aux Tempêtes — Table de la Bastide

## Périmètre impératif

- Travailler uniquement dans `ile-aux-tempetes-bastide/`.
- Ne jamais modifier `ile-aux-tempetes/` ni `forge-of-heroes/` pour une demande concernant la Bastide.
- Le scénario, les cartes, les scènes, le journal et les outils narratifs sont communs à la campagne.
- Les personnages, les sauvegardes et les règles de jeu sont propres à la Bastide.

## Système

- Système cible : Chroniques Oubliées Fantasy 2.
- Les anciennes fiches D&D/Nespresso ont été supprimées de cette instance.
- Le personnage `demo` est un test technique fondé sur Forge `MANUAL_02`; il ne doit pas être présenté comme un prétiré officiel BBE.
- Schéma courant des personnages : `bastide-character-v2`.
- Préfixe de sauvegarde : `iot_bastide_cof2_`.

## Fiche interactive commune

- Le moteur partagé se trouve dans `personnages/fiche.js` et sa présentation dans `personnages/fiche.css`.
- Les pages individuelles ne contiennent que le chargement de leur `data.js` puis du moteur commun.
- Toute nouvelle page de PJ charge uniquement son `data.js`, puis `../fiche.js` et `../fiche.css` ; une fiche existante sert de squelette minimal.
- La fiche commune comprend : ressources, vitesse en mètres et en cases de 1,5 m, attaques, actions propres au héros, états, capacités acquises, règles de combat essentielles, caractéristiques, équipement actuel, monnaie, récupération, usages limités et notes.
- Les dés restent physiques. Le suivi ne doit jamais lancer automatiquement un dé.
- Les états, usages, ressources et notes de partie restent locaux. L’inventaire, la monnaie, les achats et les transferts sont synchronisés dans l’inventaire partagé Bastide.
- Les objets équipables portent un profil mécanique `equipment` ; les armures et boucliers créés par un joueur peuvent recevoir un profil COF2 officiel et modifier réellement la DEF.
- Faëlar dispose d’un onglet synchronisé pour son loup : nom libre, PV, DEF, initiative, attaque, dégâts et progression calculée selon son niveau et son rang de compagnon.
- Les volets de détail d’inventaire restent ouverts pendant les actualisations automatiques afin de ne pas interrompre la lecture ou l’édition.

## Boutique et espaces personnels

- La boutique permet aux joueurs de revendre à Mila les objets non équipés reconnus dans son catalogue. La reprise est fixée à la moitié du prix courant, avec un minimum de 1 pa ; les objets inconnus nécessitent une estimation du MJ.
- Une vente crédite la monnaie du joueur, retire l’objet de son inventaire et remet les quantités dans le stock fini de Mila au cours d’une seule transaction.
- Les détails des produits restent ouverts pendant le rafraîchissement périodique du catalogue.
- `espaces/?kind=contracts` est la contrathèque privée de Vivelame. Chaque contrat possède un objet, un type, un état, un ou plusieurs signataires joueurs et, si nécessaire, le nom d’un PNJ.
- `espaces/?kind=confidences` est l’espace privé de Wilfried. Chaque fragment peut être attribué à un ou plusieurs joueurs.
- Un contrat ou une confidence n’apparaît sur la fiche d’un destinataire que lorsque son état est `active` ou `shared`. L’onglet correspondant est entièrement absent sans contenu validé. Modifier l’audience, archiver ou supprimer l’entrée révoque automatiquement cet affichage.
- Les contrats associés à un PNJ sont conservés et identifiés dans la contrathèque. Leur affichage sur une fiche PNJ nécessitera la création du registre et des fiches PNJ, qui n’existent pas encore dans le Hub Bastide.
- Zéphéline possède une Besace de pollen qui agit comme un véritable conteneur d’inventaire. Les objets rangés dedans restent consultables et synchronisés, mais sont affichés dans une section imbriquée.
- Le document joueur `documents/les-premiers-orages/` est une adaptation sans spoilers du contexte historique officiel : il s’arrête à l’affrontement d’un dragon bleu avec une dragonne de bronze non identifiée.

## État après création des premiers personnages

- Accueil Bastide différencié vert forêt / or.
- Espace joueurs organisé autour d’un carrousel textuel compact, mobile-first, sans menu inférieur.
- Six fiches COF2 Bastide sont intégrées : Prépôtante, Scanlan, Wilfried, Vivelame, Zéphéline et Faëlar.
- La fiche de démonstration reste présente techniquement mais n’est plus proposée dans le registre joueurs ni mise en avant dans l’espace MJ.
- Le gestionnaire de combat D&D a été retiré de Bastide.
- Six destinataires Bastide isolés sont actifs ; la distribution d’objets, d’indices et de monnaie est opérationnelle.
- Les six paquetages de départ COF2 sont installés avec 10 pa par héros. Le petit matériel de Mila suit les tarifs usuels du livre de base ; les potions de soins et de mana ordinaires coûtent 10 pa.

## Chroniques de Scanlan

- Le journal public `journal/` affiche uniquement les chroniques publiées de la Bastide.
- L’atelier privé `chroniqueur/` permet à Scanlan de créer ses propres brouillons, textes, paroles, images, dessins et pistes audio.
- L’accès chroniqueur utilise un lien personnel dont la clé est placée dans le fragment `#key=` puis conservée localement ; cette clé ne doit jamais être inscrite dans le dépôt.
- Les données passent par la fonction Edge `bastide-chronicles` et les tables préfixées `bastide_chronicle_`.
- Les médias utilisent le bucket privé `bastide-chronicles` et des URL signées temporaires.
- Cet accès ne donne aucun droit sur les fiches, les outils MJ, le scénario ou les données Nespresso.

## Import des personnages suivants

1. Exporter chaque héros depuis Forge ou relever la fiche papier.
2. Transformer les données dans le schéma `bastide-character-v2`.
3. Ajouter le personnage au registre Bastide.
4. Tester PV, DEF, INIT, PC/PM, attaques, capacités, équipement et sauvegarde locale.
5. Créer les destinataires Bastide du système de découvertes avant son activation.

## Laboratoire des récompenses

- La page MJ `mj/outils/recompenses/` rassemble les créations maison liées aux quatre lieux du scénario.
- Pas de bonus permanent brut en attaque, DEF ou dégâts pour les héros de niveau 1.
- Les objets consommables privilégient un seul effet, une scène ou une utilisation.
- La Voie de la Main du Maestro de Scanlan est un prototype à acheter rang par rang ; elle reste volontairement moins puissante que la Télékinésie de Zepheline.
