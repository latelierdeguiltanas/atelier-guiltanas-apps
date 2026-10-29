# Guiltanas Control — pilotage par projet

**Démarrage : 29 octobre 2026**

## But

Une seule ligne de progression officielle pour chaque application de l'Atelier de Guiltanas, indépendamment du nombre de conversations ChatGPT (actives, plantées ou archivées). Les chats sont des sources secondaires ; les projets sont les unités de travail.

## Sources de vérité

1. Google Drive — chaque projet possède son document « 00 — ÉTAT DU PROJET » : intention avant travail, résultats au fil de l'eau, preuves, risques, prochaine action.
2. GitHub — code réel, tests, commits et publication.
3. \`data/projects.json\` — **projection publique minimale** des états Drive, affichée par \`index.html\`.
4. Guiltanas Control — interface de consultation, non source de vérité.

## État actuel

- Interface mobile-first orientée projets : liste, étape actuelle, chronologie, preuve, prochaine action.
- Rafraîchissement automatique sur ouverture, retour d'onglet et toutes les 60 secondes (onglet visible).
- Bouton « Reprendre dans ChatGPT » : ouvre ChatGPT et copie un dossier de reprise basé sur l'état visible.
- Six projets initiaux. Seul Forge dispose d'un premier état de validation audité ; les autres restent « à consolider ».
- Pour Forge N1, le README et le pack MANUAL_FREEZE_PACK exigent douze parcours réels ; leur complétude actuelle n'a pas été établie. Aucun pourcentage de validation inventé.
- Drive et miroir GitHub mis à jour ensemble par l'assistant en cas de connexions disponibles.
- Passerelle technique gratuite automatisée \`Drive → GitHub\` préparée, non opérationnelle tant que les deux secrets GitHub et les permissions de lecture Drive ne sont pas définis.

## Procédure impérative pour les nouveaux chats

1. Identifier le projet et lire l'état canonique dans Drive, puis le code ciblé.
2. **AVANT d'intervenir** : noter objectif, périmètre et « EN COURS » dans Drive. Synchroniser le miroir public.
3. **À chaque jalon** : noter résultat, commits, tests réels/simulés, anomalies, nouvelles actions. Synchroniser le miroir public.
4. Clôturer avec un état « TERMINÉ », « PARTIEL » ou « BLOQUÉ ». Un chat interrompu n'est jamais une réussite implicite.
5. Une affirmation de l'assistant n'est pas une preuve. Toute mesure doit être fondée sur un dénominateur et des vérifications.

## Documents de référence

- [Méthode globale de travail](https://docs.google.com/document/d/1wLgscQzTrTsQhazt-4Y3L_tYSUtKA7fSHZc4yLFJnyo/edit)
- [État du projet Guiltanas Control](https://docs.google.com/document/d/1nRrlLCQoJyoNpuuzp9IUytq3YjdLP4SJFZB1I1NA4NQ/edit)
- [État du projet Forge of Heroes](https://docs.google.com/document/d/1LRxBDidAnSUbkamPzZzlt-Gcl-SUAAR3q8ZZ0MgmK1c/edit)
- [Détails d'activation de la synchronisation autonome](DRIVE_SYNC_SETUP.md)

## Confidentialité

Le dépôt GitHub Pages est public. Ne pas y déposer de données personnelles, conversations privées, jetons ou secrets. Le bloc \`GC_PUBLIC_STATE\` des documents Drive est explicitement destiné à la publication, et le script applique une liste blanche de champs autorisés. Le document Drive complet reste privé.


## Décision du 29 octobre 2026 — intégration au Cockpit existant

**Cette application est un prototype temporaire, et non la future interface officielle.** Le Cockpit `centre-synchronisation/` possède déjà une identité propriétaire, un registre riche de projets, une installation PWA, des vues GitHub, Supabase et Connexions, ainsi qu'un bouton d'actualisation. Le suivi Forge/Drive, la chronologie et la reprise ChatGPT doivent donc migrer dans **une seule application propriétaire : Pilotage Guiltanas**. Ne pas écraser les fiches existantes du registre Supabase par les six entrées de démonstration du prototype.

Le bouton `↻ Synchroniser` de ce prototype relit **uniquement la projection déjà publiée sur GitHub**, sans recharger la page. Il **ne provoque pas encore** une lecture directe de Drive ; ne jamais prétendre l'inverse. La vérification ne se déclenche qu'à l'ouverture de l'application et sur demande (la boucle toutes les 60 secondes est retirée). La vraie synchronisation instantanée Drive doit être intégrée à une action serveur sécurisée derrière l'accès propriétaire, avant suppression du prototype.

**Tri des conversations :** créer ultérieurement un catalogue privé à partir de l'export ChatGPT volontaire du propriétaire. Même un chat de titre anodin peut contenir des idées de plusieurs projets. Les chats défaillants sont conservés comme sources, classés « ne plus poursuivre » après récupération ; la suppression reste une décision explicite du propriétaire. Les informations privées ne doivent jamais être envoyées au GitHub Pages public.
