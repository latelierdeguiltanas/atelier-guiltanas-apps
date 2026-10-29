# Guiltanas Control — synchronisation Drive → GitHub

## Ce qui fonctionne déjà

- Les assistants connectés à Drive et GitHub peuvent inscrire **avant le travail** leur objectif dans « 00 — ÉTAT DU PROJET » sur Drive.
- Ils mettent ce document à jour **à chaque jalon** et synchronisent aussitôt la projection non sensible dans \`data/projects.json\`. L'utilisateur ne synchronise rien.
- Le tableau de bord GitHub Pages lit automatiquement \`data/projects.json\` à l'ouverture, au retour sur la page et toutes les 60 s lorsque la page est visible.
- Les résultats sont fondés sur des preuves, pas sur le nombre de chats.

## Passage à une lecture automatique de Drive, même si un chat oublie de publier

La passerelle existe dans \`scripts/sync-drive-status.cjs\` et \`.github/workflows/guiltanas-control-drive-sync.yml\` mais **elle est désactivée de fait tant que les secrets ne sont pas configurés**. Elle vérifie Drive toutes les cinq minutes via GitHub Actions, avec un délai d'exécution possible. Cette configuration n'est à faire **qu'une fois**.

### Activation ponctuelle

1. Créer un compte de service dans un projet Google Cloud auquel l'API Google Docs est activée. Générer une clé JSON pour ce compte de service. Ne jamais envoyer cette clé dans un chat, un dépôt ou un fichier web public.
2. Partager en **lecture seule** les documents Drive d'état concernés avec l'adresse e-mail du compte de service (minimum nécessaire). Éviter l'accès à l'ensemble du Drive.
3. Dans GitHub → dépôt \`atelier-guiltanas-apps\` → Settings → Secrets and variables → Actions, ajouter :
   - \`GC_DRIVE_SA_JSON\` : contenu intégral de la clé JSON du compte de service ;
   - \`GC_DRIVE_DOC_IDS\` : objet JSON privé associant chaque identifiant public de projet à l'ID de son document Drive. Exemple de structure : \`{"forge":"ID_DU_DOC_FORGE","guiltanas-control":"ID_DU_DOC_CONTROL"}\`. Les vrais IDs restent dans ce secret.
4. Exécuter une première fois le workflow « Guiltanas Control — Drive status mirror » via l'onglet Actions, puis contrôler le fichier \`data/projects.json\` et l'application.

**Aucune API OpenAI payante** n'est nécessaire. Google et GitHub appliquent leurs quotas et règles d'utilisation gratuits ; ne pas garantir un délai fixe de synchronisation.

### Format du document Drive

Les documents d'état contiennent un bloc explicitement public :

\`\`\`text
GC_PUBLIC_STATE_BEGIN
{"id":"forge","name":"Forge of Heroes", ...}
GC_PUBLIC_STATE_END
\`\`\`

La passerelle prend le **dernier** bloc valide du document et publie uniquement des champs autorisés, jamais le reste du document. Les valeurs restent publiques sur GitHub Pages : ne jamais écrire de données privées dans ce bloc. Les actions de l'assistant doivent remplacer ou ajouter un nouveau bloc après chaque jalon avec un état complet.

### Résilience

- Si un chat s'interrompt après l'inscription de « EN COURS », aucune tâche ne passe automatiquement à « terminée ».
- Si la connexion est indisponible, l'écriture doit être déclarée comme non effectuée, jamais simulée.
- La synchronisation ne récupère pas automatiquement le contenu des anciens chats privés. Leur reconstitution nécessite les contenus réellement accessibles ou un export.
- Le tableau de bord est une **projection**, pas un substitut au document Drive ou aux tests réels.
