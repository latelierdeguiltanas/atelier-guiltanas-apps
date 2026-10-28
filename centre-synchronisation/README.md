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
