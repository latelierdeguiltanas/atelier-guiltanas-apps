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

## Point de reprise opérationnel

- Incident encore ouvert : les inventaires peuvent afficher « Hors connexion — copie locale conservée » alors que la boutique reste accessible. Ne pas considérer ce point comme résolu tant qu’un test authentifié n’a pas chargé les données Supabase depuis un lien MJ valide puis depuis un lien personnel de joueur valide.
- Le correctif courant autorise la consultation MJ en lecture d’un inventaire au moyen de `playerId`, sans permettre à ce mode de consultation d’écraser les données du joueur.
- Les clés d’accès sont conservées uniquement dans le fragment `#key=` et le stockage local. Elles ne doivent jamais être inscrites dans le dépôt ou dans Drive. Ne pas les régénérer sans vérifier les enregistrements Supabase et l’impact sur les liens déjà distribués.
- Le workflow `Player sheets E2E` peut être globalement rouge à cause des anciens tests D&D de `ile-aux-tempetes/`. Le sous-test Bastide valide actuellement la navigation des six fiches et l’atelier de Scanlan, mais il ne teste pas une session Supabase authentifiée ni le chargement réel des inventaires.
- Cause confirmée dans les logs : `state` échoue après authentification avec HTTP 500 / PostgreSQL `22P02` (`Token "wilfried" is invalid`). Le filtre `.contains("audience", [p.id])` envoyait une syntaxe de tableau PostgreSQL à la colonne JSONB. Le message « Hors connexion » masquait cette erreur serveur ; le catalogue boutique est public et ne prouve pas l’authentification.
- Correctif `5e2adb8` : `.contains("audience", JSON.stringify([p.id]))`, déployé dans `bastide-inventory` version 16. Le code déployé avant correction était identique au fichier GitHub. Aucun changement de clé ou de données.
- Vérification effectuée : requête JSONB corrigée exécutée pour les six personnages ; inventaires présents (Faëlar 13, Prépôtante 13, Scanlan 12, Vivelame 11, Wilfried 9, Zéphéline 12 objets). La validation SQL ne remplace pas les deux lectures HTTP authentifiées.
- Prochaine action prioritaire : prouver le chargement réel depuis les liens MJ et joueur existants. Les accès de gestion GitHub/Supabase sont opérationnels, mais ils ne fournissent pas les clés personnelles en clair, seulement leurs empreintes en base. Ne pas régénérer les clés pour contourner cette limite. Incident maintenu ouvert jusqu’à ces deux vérifications.
