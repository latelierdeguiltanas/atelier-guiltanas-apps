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
- Les usages et notes de partie restent locaux. Les PV et PM disposent désormais d’une synchronisation dédiée via bastide-session ; les effets pilotés par le MJ sont partagés en lecture aux joueurs. L’inventaire, la monnaie, les achats et les transferts sont synchronisés dans l’inventaire partagé Bastide.
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

## Accès individuel aux fiches

- Le portail joueurs appelle `bastide-inventory?action=identity` et propose uniquement la fiche correspondant à la clé validée ; une clé MJ valide conserve les six liens.
- Le moteur commun vérifie l’identité avant le chargement des sauvegardes et l’affichage. Un lien vers un autre PJ redirige vers le propriétaire de la clé ; sans clé valide ou en cas d’échec, la fiche reste verrouillée.
- Le serveur refuse désormais `state` et `bootstrap` si une clé joueur demande un autre `playerId`. L’identité est déterminée par la clé, jamais par un indicateur MJ local.
- L’attribution automatique d’une clé MJ en clair dans la page MJ a été retirée. Les accès MJ nécessitent la clé existante valide ; aucune rotation effectuée.
- Limite : les données statiques `data.js` et l’historique GitHub restent publics sur GitHub Pages. Le verrouillage de l’interface ne rend pas ces fichiers confidentiels. Une confidentialité complète exige leur déplacement vers une API authentifiée et la rotation de la clé MJ anciennement publiée, à préparer sans invalider les liens à l’insu du MJ.

## Supervision MJ des espaces particuliers

- La clé MJ Bastide existante permet une consultation en lecture seule de la Contrathèque et des confidences, y compris brouillons, archives et audiences. Les écritures restent réservées au propriétaire.
- `bastide-chronicles` reconnaît la même clé MJ via `x-bastide-key` pour `verify` et `dashboard` : toutes les chroniques et tous les hymnes, brouillons et médias signés inclus. Les écritures MJ sont explicitement refusées ; l’éditeur Scanlan conserve ses permissions.
- La table MJ comporte les raccourcis atelier de Scanlan, Contrathèque, confidences, loup de Faëlar et besace de Zéphéline. Elle lit les fragments des liens MJ existants sans créer ni remplacer de clé.
- Lors de cette intervention, une divergence a été constatée : le code déployé des chroniques comprenait les hymnes alors que le fichier GitHub était ancien. Le correctif repart de la version déployée et rétablit sa concordance avec GitHub, sans supprimer les hymnes.
- Les notes et compteurs personnels conservés uniquement sur le téléphone d’un joueur ne sont pas accessibles à distance au MJ ; les données synchronisées sont consultables.

## Correction Zéphéline — Invocation

- À la demande du MJ, Invocation rangs 1 et 2 remplace Divination rangs 1 et 2 ; nombre total de rangs acquis conservé. Divination reste uniquement dans les voies non acquises.
- Choc et Serviteur invisible repris des données actuelles Forge (lecture seulement de Forge). Choc ajouté aux attaques magiques ; coût PM suivi par le moteur commun.
- Bonus Divination retiré : initiative 12 → 11, DEF 14 → 13 avant effets d’équipement. Autres voies, caractéristiques, ressources maximales et inventaire inchangés. Aucun accès ni état Supabase modifié.
- Cache de data.js versionné sur la page Zéphéline ; vérification des données et des changements sans navigateur. Le MJ/joueur doit actualiser sa fiche existante.

## Mise à jour après séance — 13 octobre 2026

- Gestionnaire COF2 indépendant : `gestionnaire-combat-cof2/`. La liaison est optionnelle dans `bridge.js` ; le gestionnaire reste autonome et conserve sa sauvegarde locale. Le MJ clique sur Connecter puis Partager ce combat. Masquer aux joueurs retire la frise et les effets partagés.
- Nouvelle fonction `bastide-session` version 1, même clé personnelle Bastide, aucune clé tournée. Authentification côté serveur avant tout accès. Les tables messages, battle, resources et backgrounds ont RLS activée et aucun privilège direct anon/authenticated ; RPC uniquement service_role.
- La réponse PJ est construite côté serveur : noms dans l’ordre uniquement (pas de PV, DEF ou valeurs d’initiative des monstres), effets du seul PJ et ressources du seul PJ. Les commandes de combat et backgrounds sont réservées au MJ.
- Un bandeau personnel fixe donne les effets et l’accès aux échanges privés sur les pages joueurs. La rubrique Mon tour réunit attaques, caractéristiques et frise ; les règles générales sont explicitement séparées. Ce choix découle de l’audit du parcours actuel, sans ajouter de gestionnaire MJ sur les fiches.
- PV/PM : initialisation depuis la première fiche connectée, ou depuis le gestionnaire lors de sa première modification ; les connexions suivantes relisent l’état partagé. Version et verrou de ligne empêchent l’écrasement silencieux. Les usages/PC/DR restent locaux. Aucun dé ni durée de buff n’est résolu automatiquement.
- Messages privés PJ ↔ MJ et objets PJ → MJ : `/messages/`. Transfert transactionnel et identifiant d’envoi unique ; le MJ peut rendre un objet reçu une seule fois. Les envois d’objets MJ → PJ existants restent dans l’outil inventaires.
- Backgrounds : `mj/outils/backgrounds/`, six dossiers privés et champs résumé, déclencheurs, situation, prochaine scène et journal. Le texte existant de Wilfried a été importé en base ; les autres histoires complètes ne sont pas disponibles et ne sont pas inventées. Les écrits/contrats existants sont consultables depuis ce suivi. Les déclencheurs sont aussi accessibles dans les cartes MJ du gestionnaire.
- Voies : 84 rangs COF2 extraits du livre officiel fourni, 10 rangs historiques relus sur le PDF d’historique et 15 rangs Compagnon repris avec origine COF1/conversion explicitement indiquée. Prépotente : assassin R1 retiré, roublard R1 activé, aventurier R1 conservé, +1 DM pour dagues lancées. Scanlan : Feinte retrouve le bonus d’attaque même si le test de feinte échoue ; les +2d4° DM demandent une réussite. Son rang n’est pas acquis et n’a pas été activé. Dentelles ne se cumule pas avec une armure portée.
- Zéphéline : sac d’aventurier retiré en base, sac de pollen principal conservé, 14 autres entrées déplacées dedans (15 entrées totales), quantités et propriétés préservées. Les sorties restent possibles ; les nouveaux objets pourront être rangés manuellement.
- Monstres nouvellement ajoutés : repère `[numéro]` visible dans le gestionnaire et dans la frise partagée. Les anciens combattants sauvegardés conservent leurs noms pour ne pas modifier une rencontre en cours.
- Vérifications sans navigateur : 63 contrôles serveur (lectures croisées, écritures MJ refusées, projection sans stats), six rendus de fiches simulés, 45 contrôles du gestionnaire existant. Tests transactionnels SQL annulés : envoi/réessai, retour unique, conservation des quantités et conflit de ressources. Code déployé relu et identique. Les tests simulés ne prouvent pas une session réelle sur téléphone.
- Catalogue : 55 objets audités, 33 descriptions joueur réécrites dans un projet local, séparation player_description/mj_notes préparée. Deux réécritures en masse ont été rejetées par le contrôle automatique (textes joueur jugés non revus, notamment journal et lore). Aucun texte ni inventaire n’a été modifié par ces requêtes. Les modifications de l’outil inventaires et de bastide-inventory liées à ce catalogue ne sont pas publiées afin de conserver les envois actuels. Ce chantier reste à valider explicitement sur le contenu préparé.
- Limite antérieure toujours présente : clé MJ historiquement publiée dans Git et données statiques publiques. Aucune rotation effectuée. L’autorisation API dépend de la possession de la clé.


## 2026-10-13 — Ergonomie MJ et valeurs des trésors
Navigation persistante commune aux outils MJ (latérale ≥1150px, défilante sinon). Accueil compact et couleurs des outils harmonisées. Bibliothèque par zones, recherche et descriptions repliables ; onglet scénario affiché par défaut. Boutique Mila : liste pleine largeur, recherche et formulaire replié ouvert à la modification.
Adaptation économique de campagne (pas un taux officiel inter-jeux) : 1 PO D&D de trésor = 1 PA COF2 ; 1 PA D&D = 1 PC COF2. Catalogue : 17 valeurs de trésors et cinq réserves monétaires corrigées ; boussole distribuée 25 PA et quatre copies de spores 30 PA corrigées. Soldes des PJ et prix de Mila inchangés. Script rejouable supabase/bastide_currency_adaptation_20261013.sql. Les descriptions joueur proposées restent non validées/non publiées.
Vérifications : syntaxe JS des outils, chemins du menu, tests VM recherche/filtres/boutique, contrôle SQL des valeurs et soldes. Aucun navigateur utilisé ; rendu réel encore à vérifier par le MJ.

## 2026-10-13 — Carnet du pacte et échanges lisibles
- `pacte/` : carnet privé Wilfried/MJ, lien permanent sur sa fiche et accès depuis le menu MJ et les backgrounds. Lecture pleine page ivoire, 18/21/24 px, paragraphes conservés.
- Propositions joueur en attente ; seul le MJ publie, refuse ou garde un brouillon privé. Modifications avec contrôle de révision et historique ; brouillons et leurs versions exclus des réponses joueur. Lecture d’une décision marque sa version lue ; badge Nouveau sur le bandeau personnel. Aucun calcul automatique de malédiction.
- `bastide-session` version 2 : nouvelles routes pact/pact-save/pact-seen, authentification existante, restrictions serveur à Wilfried et MJ. Table bastide_pact_entries avec RLS, aucun privilège direct anon/authenticated ; SQL rejouable dans ile-aux-tempetes-bastide/supabase/pact_carnet_setup.sql.
- Première décision validée par le MJ en conversation : zombie et goule ne rompent pas le pacte, âme conservée et Lyséa vivante ; acharnement = avertissement narratif, aucune pénalité mécanique. Révélation publiée uniquement dans la base privée ; source narrative non inscrite dans Git. Situation MJ actualisée.
- Chat existant `messages/` conservé pour les six PJ : texte 18 px, interligne 1,85, formulaire non collant, rafraîchissements sans reconstruire les messages inchangés, brouillons préservés lors du changement de conversation et envoi verrouillé pendant la requête. Carnet et chat restent distincts.
- Vérification sans navigateur : 90 contrôles serveur, syntaxe JS, accès SQL et code déployé. Les sessions réelles MJ/Wilfried et le rendu téléphone restent à vérifier avec les liens existants. Aucun accès régénéré.

## 2026-10-13 — Espace MJ épuré
- Quatre rubriques permanentes : Accueil, Personnages, Objets, Séance. Plus de carrousel de onze outils ni de menu latéral exhaustif. Navigation par hash dans l’accueil : une rubrique visible à la fois, sans retour arrière requis.
- Accueil réduit à trois accès rapides : combat, messages, objets/envois. Personnages regroupe messages, backgrounds et six lignes repliées : pacte/confidences Wilfried, atelier/chroniques/hymnes Scanlan, contrathèque Vivelame, fiches des autres PJ.
- Objets regroupe inventaires/boutique/envois et créations/récompenses. Séance regroupe combat, cartes, rencontres/PNJ et ambiances. Aucun suivi de scénario ni journal de séance MJ.
- Module MJ Scénario et scènes supprimé à la demande du MJ. Raccourcis loup de Faëlar et besace retirés du tableau de bord ; fonctions des fiches joueurs conservées.
- Navigation et chemins vérifiés sans navigateur ; rendu réel et préférence ergonomique à confirmer par le MJ.

## 2026-10-13 — Fiches à deux vues et repères lumineux
- Fiche commune : Simplifiée par défaut / Complète, préférence par héros et appareil, bascule sans modification des ressources ni inventaire. Texte Normal/Grand/Très grand, préférence appareil.
- Simplifiée : PV/DEF/vitesse visibles ; autres ressources dans une fenêtre. Tests, règles du tour, états, mana, équipement et capacités consultables en dialog natif avec fermeture/Escape. Texte complet des capacités et actions de suivi conservés. Rubrique Plus pour caractéristiques, notes et espaces particuliers. Complète conserve tous les onglets et contenus.
- Bandeau joueur : bouton Effets ouvre une fenêtre dédiée ; halo fixe violet=bonus, rouge=malus, ambre=autre, combinaison violet/rouge si coexistence. Boutons messages et objets avec badges. Impulsion bleue pour message et or pour envoi/décision de pacte ; événements reçus distingués des achats et envois sortants, dédoublonnage par identifiant/version et joueur. Repères désactivables, animation adaptée à prefers-reduced-motion.
- Gestionnaire : choix nature Bonus/Malus/Autre pour les buffs de groupe ; bridge transmet cette nature et classe les états manuels comme malus, les effets individuels non typés comme autres. Les anciens buffs de groupe conservent leur repère violet. Aucun bonus/durée/jet automatiquement résolu. bastide-session conserve uniquement une nature autorisée dans la projection privée du PJ.
- Fonctionne page ouverte et connexion active : pas de notification système téléphone fermé. Combat partagé obligatoire ; arrêt du partage enlève les effets. Données précédentes conservées avec avertissement en cas de rupture de liaison.
- Tests sans navigateur : deux rendus pour chacun des six PJ et bascule sans perte d’état ; 98 contrôles serveur ; 13 contrôles signaux/anti-répétition/isolation ; 45 contrôles gestionnaire. Session réelle et rendu téléphone à valider par le MJ.


## 2026-10-14 — Critiques, essai pour le 19 octobre
Nouvel outil MJ dans mj/outils/critiques/, lien rubrique Séance. Deux résultats, neuf catégories, trois suggestions immédiates ; filtres discrétion/matériel, renouvellement sans répétition quand le pool le permet, choix sans conséquence, édition libre, historique local limité à 100 décisions et export JSON. Aucune API ni modification de fiche, aucun envoi joueur ; idées narratives de campagne, non règles officielles. Réinitialiser les circonstances avec Nouvelle situation. Stockage indisponible signalé ; export possible pendant la session. Tests sans navigateur : 72 combinaisons catégories/résultats/filtres, syntaxe JS et renouvellement. Test réel lundi 19 octobre 2026 ; pas de synchronisation de l’historique entre appareils.


## 2026-10-15 — Orthographe de la marque
Accueil Bastide : « L’Atelier de Guiltanas » corrigé (U manquant). Modification de libellé uniquement.
