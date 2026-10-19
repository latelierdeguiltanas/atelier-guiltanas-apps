# Hub configurable — bêta 2, sans inscription

Adresse : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/hub-configurable/

## Pour chaque MJ

1. Ouvrir le lien commun et choisir **Créer mon espace MJ**.
2. Nommer l’aventure et choisir **Campagne** ou **One-shot**. Les deux formats disposent des mêmes outils et ce choix reste modifiable.
3. Conserver le **lien MJ** proposé : ouvrir ce lien sur un autre téléphone ou PC retrouve le même espace synchronisé, sans compte.
4. Dans **Personnages**, créer une fiche manuelle ou **Importer une fiche PDF / JSON**.
5. Sur chaque personnage, utiliser **Lien joueur**, puis envoyer soi-même le lien au joueur. Celui-ci ouvre directement son personnage et les contenus partagés, sans inscription ni activation par Math.
6. Dans **Réglages & accès**, choisir les outils affichés et la présentation de l’aventure.

## Liens et synchronisation

- Le lien MJ donne accès à l’administration de son aventure. Le lien joueur donne accès à un seul personnage, aux échanges et aux contenus partagés. Les notes MJ et les autres fiches ne sont pas renvoyées avec ce lien.
- Chaque espace et lien disposent d’une copie locale séparée dans IndexedDB. Aucune adresse e-mail, aucun mot de passe et aucun compte Supabase Auth ne sont demandés ou créés.
- Les données se synchronisent à l’ouverture et après une modification, puis toutes les 30 secondes tant que le hub est visible et qu’aucun formulaire n’est ouvert.
- Depuis **Outils de séance**, le gestionnaire de combat reçoit le même accès MJ. Ses campagnes, rencontres, monstres personnels, PJ et combats sont synchronisés dans un stockage séparé du hub, mais protégé par le même lien.
- Les modifications hors connexion sont conservées en file locale. Elles sont envoyées au retour du réseau. La première synchronisation est nécessaire avant de pouvoir ouvrir l’espace sur un autre appareil ou créer un lien joueur.
- Les conflits sur une même fiche ne sont pas écrasés : exporter les saisies locales puis récupérer la version en ligne pour reporter les changements utiles.
- Une opération réémise après un problème réseau n’est appliquée qu’une fois côté serveur.
- « Désactiver le lien » révoque l’ancien accès joueur. Le MJ peut ensuite en créer un nouveau. Une copie déjà téléchargée sur un appareil ne peut pas être effacée à distance.
- L’application peut être rouverte hors ligne après une première visite en ligne complète et l’installation automatique de son cache. Le service worker est limité à `hub-configurable/`.

## Fiches et sauvegardes

- PDF jusqu’à 2 Mo : document original conservé. Les champs de formulaire sont récupérés, éditables, synchronisés et exportables dans le PDF rempli.
- Les valeurs manuelles COF2 et les champs du PDF restent deux ensembles indépendants : pas de calcul des règles ni de correspondance automatique supposée.
- Un PDF figé est consultable ; ses valeurs doivent être renseignées manuellement. Aucun OCR automatique n’est annoncé.
- JSON accepté : fiche exportée par ce hub ou personnage générique avec nom, données/champs et PDF éventuel. Les autres formats nécessitent un adaptateur.
- **Sauvegarde complète** : conserve l’espace, ses liens et ses modifications en attente. Importer cette sauvegarde sur un autre appareil restaure le même accès.
- **Modèle** : réglages, notes, documents et objets ; sans personnage, conversation, accès ou retour. L’import crée un nouvel espace indépendant.
- Les sauvegardes de la bêta 1 peuvent être importées en tant que nouveaux espaces sans inscription.

## Technique et périmètre

- Nouveau dossier indépendant du dépôt `latelierdeguiltanas/atelier-guiltanas-apps`. Aucun fichier de Bastide ou Nespresso modifié.
- Projet Supabase existant, nouvelles tables privées `hcfg_private.link_*` et RPC `hcfg_link_api`. Autorisation par liens aléatoires 256 bits dont seul le hachage est conservé côté serveur. Aucune clé service-role utilisée par l’application.
- Le serveur valide le rôle et le personnage du lien pour chaque lecture/écriture ; aucune table privée directement accessible aux visiteurs.
- La migration `hcfg_beta2_bearer_links_no_accounts` est additive. Le schéma de la bêta 1 reste en place mais n’est plus utilisé par le site. Les réglages Auth et les fonctions des autres hubs ne changent pas.
- Style dérivé de la base générique G1/Bastide. Le Soundboard reste indépendant ; le gestionnaire de combat COF2 est relié à chaque espace MJ. Cette bêta n’est pas une reprise intégrale de toutes les fonctions Bastide.
- Hébergement GitHub Pages et projet de données partagés, avec fichiers, tables et autorisations séparés.

Tests : `node --test hub-configurable/tests/*.test.mjs`. Tests de droits sans compte : `tests/links.sql` (transaction annulée). La bibliothèque PDF-lib est vendue dans `assets/`, avec sa licence dans `docs/`.
