# Hub configurable — bêta 1

Projet indépendant dans le dépôt `latelierdeguiltanas/atelier-guiltanas-apps`, dossier `hub-configurable/`.

Adresse : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/hub-configurable/

## Prise en main

1. Créer un compte avec une adresse e-mail et un mot de passe, puis confirmer l’adresse. Pour rester dans ce hub sans changer les redirections des autres applications, copier le lien reçu dans « Valider un lien reçu par e-mail ».
2. Créer une campagne COF2 et choisir son nom de MJ.
3. Dans Réglages & invitations, personnaliser la campagne et les outils visibles.
4. Générer et envoyer soi-même le lien d’invitation. Chaque joueur crée son compte, rejoint le groupe et choisit son nom.
5. Ajouter les personnages, documents par lien, chroniques, catalogue d’objets et notes MJ. Les joueurs peuvent écrire des messages et des retours et gérer leurs propres fiches.
6. Exporter régulièrement une sauvegarde complète. Un modèle exclut personnages, échanges, chroniques et retours. L’import crée une nouvelle campagne et ne reprend aucun accès.

## État et limites

- Campagnes et droits séparés côté PostgreSQL ; propriétaire MJ et membres par campagne.
- Les secrets MJ ne sont pas transmis au navigateur des joueurs.
- Fiches COF2 manuelles : caractéristiques, PV, DEF, INIT, attaques, voies, inventaire et ressources. Aucun calcul automatique ni moteur de règles officiel embarqué.
- Vue simplifiée/complète, navigation haute sur mobile, synchronisation par interrogation toutes les 30 secondes (en pause pendant une saisie).
- Contrôle de révision sur les mises à jour pour refuser les écritures périmées.
- Documents ajoutés par URL. Pas d’hébergement de fichiers, ni de soundboard, boutique transactionnelle, combat avancé ou interludes dans cette bêta.
- Ce socle n’est pas une copie fonctionnelle intégrale de Bastide. Son identité visuelle dérive de la base générique G1 ; les accès et la logique multicampagne sont nouveaux.
- Inscription standard Supabase activée et confirmation obligatoire. La livraison des e-mails externes n’a pas été vérifiée. Si le projet utilise le SMTP par défaut, un service SMTP dédié sera nécessaire avant l’inscription autonome des testeurs. Aucun paramètre Auth global n’a été modifié.
- Aucune donnée de Bastide ou Nespresso importée. Les futurs droits commerciaux sur le contenu ajouté restent à vérifier avant vente ; aucun texte des livres de règles n’est fourni.

## Structure

- `index.html`, `assets/` : interface statique et client REST, sans dépendance CDN.
- `supabase/schema.sql` : schéma additif déployé, tables `hcfg_*` et schéma privé `hcfg_private`.
- `tests/access.sql` : intégration des droits avec utilisateurs synthétiques et transaction annulée.
- `tests/*.test.mjs` : contrôles du modèle, des liens et du client API (`node --test hub-configurable/tests/*.test.mjs`).
- `docs/ETAT_DU_PROJET.md` : passation et limites de validation.

Le site est hébergé par le déploiement GitHub Pages existant. Il a sa propre URL mais partage le dépôt, le déploiement Pages et le projet Supabase existants ; ses fichiers et ses tables sont indépendants. Pour une isolation d’infrastructure complète, il faudra ultérieurement un hébergement et un projet de données dédiés.
