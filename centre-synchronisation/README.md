# Pilotage Guiltanas — Cockpit applicatif (28/10/2026)

Adresse : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/centre-synchronisation/

## Intention
Tableau de bord du patrimoine **applicatif** de l'Atelier (hors Skeryon), utilisable sur téléphone ou ordinateur, moins de texte au premier niveau. Vue en graphe interactif GitHub → outils → stockage, fiches latérales, inventaire des dépôts et de leurs accès, état Supabase, métriques de sessions **mesurées** et diagnostics d'appareil. Lexique en fenêtre modale.

## Architecture déployée
- Interface GitHub Pages : `centre-synchronisation/index.html`, `pilotage.css`, `pilotage.js`.
- La version technique antérieure du diagnostic reste dans `centre-synchronisation/diagnostic/` : pas de perte de fonctions.
- Entrées depuis le hub Bastide (`mj/`) et MJ Express.
- Fonction Supabase `guiltanas-cockpit` : **seul le lien MJ Bastide valide** permet de lire la réponse. Il n'y a ni secret de service role dans la page, ni jeton GitHub embarqué.
- RPC `public.guiltanas_cockpit_metrics()` : lecture agrégée de données Bastide / Nespresso / hub configurable / instrumentation. Exécution uniquement accordée au `service_role`, pas à `anon` ou `authenticated`.
- Inventaire statique des dépôts et relations côté fonction serveur, établi sur la base des connecteurs GitHub du 28/10/2026. **Il ne se rafraîchit pas automatiquement quand un nouveau dépôt apparaît**.
- Les métriques Supabase, elles, sont recalculées lors du chargement. Les appels n'écrivent pas dans les campagnes et ne lisent pas les messages privés, les fichiers de joueur ou les données financières individuelles.

## Inventaire GitHub vérifié à date
6 dépôts accessibles par la connexion :
- atelier-guiltanas-apps — public, actif, **multitude d'outils dans des sous-dossiers**
- latelierdeguiltanas-site — public, actif, site vitrine
- Soundboard_final — public, actif, audio
- guiltanas-produits — **privé**, actif, travaux commerciaux
- soundboard — public, archivé
- audioboard_full — **privé**, archivé

Un dépôt == un repository. **Dépôt public != application effectivement en service** et ne garantit pas les droits commerciaux.

## Supabase vérifié
- Organisation connectée `latelierdeguiltanas's Org` — Free
- Projet `ile-aux-tempetes-hub` — région `eu-west-3` (Paris), ID public `jitatmdbipjkvjstcgdc`
- Tables `public` et `hcfg_private`, routines RPC et fonctions Edge
- Usage hub générique : `hcfg_private.link_spaces` et `hcfg_private.usage_events`, pas les anciennes tables de bêta 1 `public.hcfg_*`.
- Séances / 30 jours : distinctes par ID de session navigateur. Elles ne prouvent pas le nombre d'utilisateurs uniques ni les appareils actuellement connectés.
- Aucun mot de passe personnel, jeton privé, clé service role ou lien MJ n'est affiché dans le cockpit.

## Modèle de synchronisation (états différents)
- **Cloud** : les données sont enregistrées dans Supabase via les fonctions de l'application.
- **Hybride** : cache local + sauvegarde en ligne selon le contexte, avec éventuellement file de modifications et conflits.
- **Local** : ce navigateur / cet appareil. Impossible de vérifier ses fichiers à distance sans instrumentation.
- **À vérifier** : existence d'une intégration mais pas de preuve que les données sont partagées sur chaque appareil.
- Les diagnostics déjà enregistrés via `guiltanas-sync` représentent **le dernier rapport reçu**, pas une session persistante ni une présence en direct.

## Accès ChatGPT et propriété
- La connexion GitHub actuelle permet d'inventorier les dépôts accessibles, y compris privés, et d'écrire dans les dépôts autorisés.
- La connexion Supabase actuelle donne accès à l'organisation/projet vus et permet l'administration de la base et des Edge Functions.
- Cela ne donne pas accès aux mots de passe personnels ni aux clés privées de l'utilisateur; les connexions peuvent être contrôlées/révoquées dans les réglages du service.
- **Limite v1 :** autorisation de pilotage basée sur le lien MJ Bastide. Il faut prévoir une identité propriétaire de l'Atelier indépendante de la campagne avant un partage à des co-MJ ou une distribution de l'application.
- Les caractéristiques privées des deux dépôts non publics sont envoyées **uniquement par la fonction protégée**, jamais codées en dur dans le JavaScript du site public.

## Qualité & vérifications
- Inventaire obtenu par les connexions GitHub et Supabase.
- RPC statistique exécutée en lecture; droits publics refusés vérifiés par SQL.
- Syntaxe du JavaScript validée. Statut de la fonction Edge Supabase ACTIVE confirmé.
- **Pas de validation navigateur final ni de lecture des permissions réelles du système d'exploitation**, et pas de garantie de publication immédiate GitHub Pages après le dernier commit.
- L'état d'un déploiement GitHub Pages et les logs détaillés de fonctions doivent être confirmés dans les consoles GitHub Actions / Supabase Logs.
- Aucune modification n'a été effectuée sur les données métier des campagnes.

## Prochaines étapes conseillées
1. Valider sur Android, PC Atelier et PC JDR; corriger toute navigation/carte mobile.
2. Introduire un véritable compte propriétaire séparé de l'accès MJ.
3. Ajouter pour chaque application une instrumentation minimale de sessions agrégées, documentée côté utilisateur, sans collecter l'identité des joueurs.
4. Étendre le suivi de version locale/serveur au gestionnaire, à Forge et au hub configurable; séparer toujours les données vérifiées des suppositions.
5. Proposer une mise à jour autorisée et planifiée de l'inventaire des dépôts via connexion GitHub, sans exposer de jeton dans GitHub Pages.

## Registre de tous les projets (extension 28/10/2026)
- Source de vérité de l'inventaire **applicatif**, même sans dépôt : `public.guiltanas_project_registry` (RLS, aucune lecture publique directe) ; 21 fiches initiales, classées `Jouer & raconter`, `Créer & fabriquer`, `Vie numérique`.
- Statuts indépendants : **actif / développement / brouillon / pause / idée / archive** et **en ligne / local / non publié / inconnu**. Ne pas assimiler un fichier HTML hébergé à une application terminée.
- Éléments distincts : Hub Bastide, Hub Nespresso, Hub configurable bêta, Hub générique produit privé ; Soundboard générique Soundboard_final, Soundboard Île aux Tempêtes avec sons locaux, anciennes archives ; gestionnaires COF2 et D&D ; Forge, fiches, MJ Express, cockpit, budget, missions privées, applications enfants/famille et micro-outils.
- Les fiches peuvent être ajoutées/modifiées depuis le cockpit (dernier état retrouvé, prochaine étape, dépôt/dossier, famille). Accès uniquement via le lien privé MJ Bastide jusqu'à création d'une identité Atelier indépendante. Pas de suppression côté interface.
- Historique : `public.guiltanas_project_history` archive l'état précédent lors des modifications ; pas d'écran de restauration encore.
- `guiltanas-registry` (Edge Function) : lecture/écriture authentifiées; découvre les dépôts **publics** GitHub et les nouveaux dossiers au premier niveau de `atelier-guiltanas-apps`. Interroge GitHub au plus toutes les 15 minutes lors du chargement, ou immédiatement via **Vérifier GitHub**. Les découvertes inconnues sont créées comme brouillons « À classer », **jamais déclarées automatiquement opérationnelles**. Une erreur de l'API GitHub apparaît dans le cockpit.
- Les dépôts **privés** ne peuvent pas être inventoriés par l'API publique anonyme du serveur. Contrôle complémentaire planifié via les connecteurs GitHub et Drive autorisés, avec remontée uniquement en cas de changement/échec ; il ne constitue ni un webhook temps réel ni une preuve de couverture exhaustive.
- Aucune connexion continue aux nouvelles conversations ChatGPT : une idée seulement évoquée en chat n'est pas garantie détectable instantanément. Elle doit avoir une fiche dans le registre ou être intégrée lors du prochain inventaire explicite.
- L'inventaire source des projets est **distinct** du schéma de cartographie technique `guiltanas-cockpit` (listes des services et liens audités, susceptible d'avoir un rythme de mise à jour différent). À réconcilier en cas de découverte.

## Bouton de synchronisation des joueurs Bastide
- `ile-aux-tempetes-bastide/assets/return-nav.js` propose sur chaque fiche un raccourci **↻ Synchronisation**.
- Ouvre `joueurs/verifier/?auto=1` et effectue la lecture de l'état du combat et des messages depuis **ce navigateur** ; un résultat n'est marqué réussi qu'après accusé du service `guiltanas-player-check`.
- Un lien équivalent apparaît dans le menu de l'accueil joueur. Le nouveau fichier commun est chargé avec une version d'URL changée sur les six fiches.
- Les confirmations sont enregistrées dans `guiltanas_player_checks` sans IP, localisation ou contenu de messages ; l'espace MJ peut consulter la date et la révision reçue via le cockpit.
- Important : une ancienne confirmation n'est pas une présence en direct. Une mise à jour de l'inventaire PJ et tous les caches locaux n'est pas prouvée par ce seul test.

## Ergonomie v6 — 28 octobre 2026
- La carte ne commence plus par le compte « Atelier de Guiltanas », puisque le cockpit ne gère qu'une entreprise.
- **Mobile (jusqu'à 850 px)** : explorateur compact par dépôt GitHub, accordéon. Un appui sur un dépôt dévoile ses applications; un appui sur une application révèle uniquement sa liste de dépendances identifiées (Supabase, stockage local, liens directs) et son accès à la fiche détaillée. Aucun défilement horizontal du graphe.
- **Grand écran** : vue de six dépôts sans flèches par défaut, sélection d'un dépôt pour révéler ses applications, puis d'une application pour ses seuls liens. Raccordement dépôt → applications représenté par un **tronc vertical et des branches horizontales**, sans maillage croisé.
- Avoir deux outils dans un même dépôt / projet Supabase ne signifie **pas** qu'ils partagent leurs données. Hub Bastide et Hub Nespresso demeurent indépendants tant qu'une connexion directe n'est pas identifiée.
- **Navigation Android / PWA** : états internes dans l'historique navigateur (onglets, dépôts, choix d'application, fiches détaillées, modales). Flèche Retour système → vue précédente / fermeture de la fiche, avant toute sortie éventuelle de l'application. Bouton Retour secondaire visible dans la barre haute après la première navigation. Historique restauré après rechargement des données.
- Les dépôts historiques Soundboard **n'ont pas été modifiés, archivés ou supprimés** dans cette opération ; leur nettoyage nécessite un audit et une décision distincts.
- Tests : syntaxe JS, simulation de l'historique Retour pour deux onglets, modèle du sélecteur mobile et graphe sans colonne racine. Validation visuelle/gestuelle sur vrai Android à effectuer.

## Accès propriétaire indépendant — octobre 2026
Le cockpit ne demande **plus aucun lien MJ Bastide** pour fonctionner sur les appareils. La première configuration se fait par un **code d'activation Atelier à usage unique**, remis uniquement au propriétaire, et son choix personnel d'une phrase secrète (au moins 14 caractères). Sur les nouveaux navigateurs, seule cette phrase secrète est nécessaire. Ne pas intégrer le code initial dans les sources publiques.

Backend dédié : `guiltanas-owner-auth` et tables `guiltanas_owner_credentials`, `guiltanas_owner_sessions`, `guiltanas_owner_bootstrap`, toutes sous RLS sans accès public direct. Les vérificateurs sont dérivés avec PBKDF2-SHA256 salé et les sessions sont stockées hachées côté serveur, avec expiration. `guiltanas-cockpit`, `guiltanas-registry`, `guiltanas-sync` et les bilans MJ de `guiltanas-player-check` vérifient la session propriétaire Atelier. Les joueurs Bastide restent contrôlés par leurs propres accès sur **leur** application, car le cockpit ne les authentifie pas.

L'interface publique ne charge plus `bastide/assets/inventory-api.js`, et le diagnostic utilise désormais les API owner / statistiques. Le cockpit reste hébergé dans GitHub Pages et utilise le projet Supabase actuel comme infrastructure, mais son **authentification, son registre et ses sessions** sont indépendants des autres outils. Un incident général Supabase ou GitHub Pages peut néanmoins affecter plusieurs applications : l'indépendance ne garantit pas une infrastructure physiquement séparée.

Un utilisateur qui oublie la phrase secrète ne peut pas se réinitialiser via un lien Bastide. Un processus administratif de récupération sécurisé sera à prévoir, sans mot de passe ni code de secours exposé publiquement. Vérifications par navigateur / installation PWA sur chaque appareil encore nécessaires.


## Décision d'architecture — 29 octobre 2026 : suivi des chats et développement

Le Cockpit/Pilotage Guiltanas (`centre-synchronisation/`) est l'application propriétaire **canonique**. Il possède déjà authentification propriétaire, PWA, registre des projets, cartographie GitHub → outils → Supabase, métriques et bouton `#reload`. Le prototype `guiltanas-control/` a servi à expérimenter le suivi d'avancement par projet et ne doit pas devenir un second registre concurrent.

**Fusion cible (non encore réalisée dans le code du Cockpit)** : ajouter au Cockpit une vue « Développement » ou « Suivi des projets » avec jalons, état Drive canonique, tests et preuves, interventions en cours, reprise ChatGPT, références croisées de conversations. Réutiliser `guiltanas-registry` et l'authentification `guiltanas-owner-auth` au lieu de publier des données sensibles dans un GitHub Pages public. Garder intactes les vues existantes GitHub, Supabase, Usage, Connexions et l'installation PWA. Ne pas dupliquer les projets : réconcilier les six entrées expérimentales avec le registre beaucoup plus complet déjà alimenté dans le Cockpit avant tout import.

**Synchronisation UX** : le propriétaire privilégie un bouton manuel « Synchroniser maintenant », sans rechargement de page ni requête périodique chaque minute. Distinguer clairement (a) lecture de la dernière publication, (b) vraie lecture Drive et (c) actualisation des statistiques GitHub/Supabase. Une synchronisation valide doit confirmer la source et la date/heure. Le prototype Guiltanas Control possède désormais un bouton d'actualisation manuelle du miroir GitHub ; l'accès direct à Drive et la fusion dans le Cockpit sont encore à réaliser.

**Archives ChatGPT** : pas d'accès direct du site à toutes les conversations privées ni de pouvoir d'archivage/suppression par API. Privilégier un inventaire à partir d'un export ponctuel fourni volontairement par le propriétaire, traitement privé et classement par projet, notamment extraction des idées des chats multi-sujets. Chaque conversation peut être liée à plusieurs projets et à plusieurs jalons. Aucun chat ne doit être supprimé automatiquement ; proposer archive après extraction et validation, avec suivi spécifique des chats défaillants.


## Extension vérifiée le 29/10/2026 — suivi par projet et première passe d'inventaire

**Interface officielle unique :** `centre-synchronisation/` (authentification propriétaire inchangée). L'onglet **Projets** utilise le registre privé `public.guiltanas_project_registry` : **31 fiches** au contrôle du 29/10 (8 actifs, 8 en développement, 3 en pause, 9 brouillons, 2 idées, 1 archive). Ces statuts ne certifient ni le code ni la recette utilisateur. Aucun enregistrement n'était explicitement classé « abandonné » dans ce registre. Certains objets sont des modules, des archives ou des prototypes liés au même projet.

**Ajouts UI :** panneau synthétique dans l'onglet Projets avec ces compteurs issus du registre privé, focus Forge, distinctions entre éléments documentés et validations non prouvées, bouton « Actualiser les projets » relisant le registre sans recharger toute la page, preuves dans la fiche d'un projet prioritaire et bouton « Reprendre dans ChatGPT » avec contexte copié. Toutes les autres vues et l'authentification propriétaire restent en place. Pas de migration ni d'écriture Supabase effectuée dans cette passe.

**Preuves et limites :** `index.html`, `pilotage.js`, `pilotage.css` relus sur GitHub, syntaxe JavaScript vérifiée, références des éléments UI contrôlées. **Aucun essai réel au clic sur smartphone ni recette fonctionnelle du service privé ne sont attestés**. Forge N1 : des suites techniques sont documentées, mais la certification exhaustive de la version actuelle n'est pas établie ; aucun pourcentage fictif. La fiche Forge pointe vers le pack de 12 scénarios de recette réels.

**Inventaire des anciens chats :** les échanges disponibles ont permis d'identifier des *groupes thématiques*, mais pas toutes les conversations ni leurs liens. Le détail est dans le document Drive privé « 02 — INVENTAIRE INITIAL DES PROJETS ET TRACES DE CHATS — 2026-10-29 » ; une exportation ChatGPT volontaire permettra ultérieurement l'attribution fiable de chaque conversation à un ou plusieurs projets. Ne rien supprimer ou archiver en masse avant récupération et décision explicite de l'utilisateur.

**Évolution recommandée :** fusionner progressivement les états Drive structurés, les tests certifiés et les conversations récupérées dans cette interface déjà authentifiée. Ne pas réimporter les six entrées de démonstration du prototype `guiltanas-control/` comme nouveaux projets ; consolider les 31 fiches déjà présentes. Les mots de passe, clés, contenus privés et données financières ne doivent jamais être copiés dans les fichiers publics GitHub Pages.


## 29 octobre 2026 — Écosystème parent et inventaire privé des conversations

**Fonctionnalités installées dans le Cockpit officiel** (sans second tableau de bord) :
- Dans l’onglet **Projets**, l'Écosystème Atelier de Guiltanas est la racine visuelle. Les 31 fiches conservées sont regroupées sous Applications/outils JDR, Créations/ressources, Pilotage/présence et Autres projets ; aucun projet existant n'est supprimé ou dupliqué.
- Une section repliable **Conversations** permet de visualiser, par projet, le nombre de conversations importées, les signalements « bloqué », les fils longs « à examiner » et les non-vérifiés. Le statut est modifiable et stocké dans Supabase privé, pas dans les sources publiques GitHub.
- L'import ponctuel de **conversations.json** analyse les conversations dans le navigateur et n'envoie au serveur que ID, titre, tags de projet, nombre de messages et date. **Aucun message, pièce jointe ou texte intégral du chat n'est envoyé.**
- Une même conversation peut être liée à plusieurs projets. La classification automatique utilise des indices de vocabulaire et reste **à confirmer** ; elle n'est pas un diagnostic de panne.
- La synchronisation manuelle de l’onglet Projets relit le registre privé Supabase et le dernier inventaire de chats stocké. Elle **ne peut pas interroger ni tester les conversations privées encore absentes de cet inventaire** ; ChatGPT ne fournit pas de connecteur de santé de conversation.
- Les chats longs de 240 messages ou plus peuvent être marqués « à examiner » par l'import. Un chat « bloqué signalé » n'est créé que par un marquage explicite dans le registre, jamais par une heuristique de longueur.
- Aucun archivage/suppression native ChatGPT n'est effectué depuis le Cockpit.

**Infrastructure :** migration privée `guiltanas_private_chat_inventory_v1`, table `public.guiltanas_chat_inventory` avec RLS activée, aucun accès `anon/authenticated`, lecture/écriture uniquement via la fonction Edge `guiltanas-chat-inventory` autorisée par la session propriétaire Atelier. Version 2 de la fonction déployée. Les fonctions précédentes du Cockpit et les données des campagnes restent inchangées.

**Contrôles :** migrations confirmées, fonction Edge ACTIVE, syntaxe JavaScript du Cockpit vérifiée et fichiers GitHub relus. Recette navigateur au clic, import d'export réel et autorisation au travers de la session propriétaire **pas encore testés sur un téléphone réel**. La table de chats est vide jusqu'à un import volontaire : ne pas annoncer « tous les chats analysés » ni « tous les bugs détectés » avant une preuve.

**À suivre :** import privé ponctuel de conversations.json (dans la rubrique Conversations), correction des affectations multi-projets, contrôles utilisateurs sur les chats réellement bloqués ; ajout des jalons Drive avec preuves à chaque fiche. La synchronisation automatique Drive → Supabase reste un chantier séparé non certifié.

## 29/10/2026 soir — Correction de l'inventaire des chats : aucune importation exigée

**Consigne utilisateur faisant autorité :** ne pas demander d'export ni d'import de l'intégralité des chats. Le Cockpit doit être **orienté projets**, très lisible et utilisable sur téléphone. La collecte doit être effectuée par l'assistant à partir des conversations et documents qu'il peut réellement retrouver, avec provenance.

**Application modifiée :** le bouton/fichier d'import `conversations.json` a été retiré de l'interface. Dans l'onglet Projets, les conversations de travail Work ont un panneau repliable alimenté par les signalements privés retrouvés dans les échanges accessibles, **pas** par des fils inventés ni par l'historique complet. Chaque entrée conserve sa date, son périmètre, la preuve du signalement et deux états distincts « Android » et « Web ». Par défaut ces deux états sont **non testés**. Un signalement historique n'est pas une preuve que la conversation est encore inutilisable.

**Accès :** table privée `public.guiltanas_work_chat_findings`, RLS activée, accès anonyme et authenticated révoqué, service role seulement via fonction Edge `guiltanas-chat-inventory` (action GET findings, session propriétaire Atelier obligatoire). Aucun lien direct de chat n'est forgé. Les entrées « Reprise et certification Forge » ou « Dragonlance phase 2C » sont des *signalements historiques* parfois susceptibles de recouvrir plusieurs interventions, et non des threads identifiés par leur ID.

**Projet parent :** « Écosystème · Atelier de Guiltanas » est visible dans l'onglet Projets, avec les sous-ensembles d'applications et créations repliables ; les chantiers plus personnels comme Budget et Missions restent dans une rubrique distincte. Les signalements de chat figurent sous les projets concernés, sans créer un projet par chat.

**Découvertes complémentaires :** Gestionnaire de scénarios HTML (ancien livrable local), Identité et architecture de marque (Gates 01–03 historiques), Skeryon (univers créatif) ont été ajoutés au registre existant avec état actuel **à requalifier**. Aucune suppression de projet ancien.

**Limite technique essentielle :** cette application n'a pas de connexion capable de parcourir et tester les sessions privées ChatGPT sur Android et sur le site web. Son bouton d'actualisation relit les rapports/états déjà accessibles dans Supabase, il **ne détecte pas automatiquement** qu'un chat vient de planter. Tester directement des conversations sur un navigateur web signé nécessite une session de navigation autorisée ; le comportement de l'application Android ne peut pas être déduit d'un test web. Ne jamais afficher « fonctionnel » ou « bugué confirmé » sans test source sur la plateforme correspondante.

**Vérifications réalisées :** source de l'interface GitHub relue, syntaxe JavaScript passée, Edge Function active, contrôle SQL des permissions RLS ; aucune preuve de test interactif sur navigateur authentifié ou appareil Android dans cette intervention. Ne pas annoncer une synchronisation live des chats ChatGPT comme livrée.
