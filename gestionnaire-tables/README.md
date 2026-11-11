# Gestionnaire de tables — Atelier de Guiltanas (v0.3, portail MJ)

Application : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/gestionnaire-tables/

## Espaces MJ sécurisés

- Chaque MJ crée un compte par e-mail et mot de passe, géré par Supabase Auth (confirmation e-mail potentiellement nécessaire).
- Son profil, ses tables, ses scénarios et ses packs restent dans son espace privé synchronisé.
- Quatre nouvelles tables dédiées : guiltanas_mj_profiles, guiltanas_mj_workspaces, guiltanas_mj_packs, guiltanas_mj_pack_shares.
- Toutes possèdent des politiques RLS limitant les opérations de lecture et écriture au propriétaire authentifié. Le rôle anonyme n'a aucun droit de lecture.
- Les sauvegardes de tables utilisent une révision optimiste. Conflit entre deux appareils = pas d'écrasement automatique.
- Les copies locales sont préfixées par UUID de compte. Elles ne constituent pas une autorisation côté serveur.
- Les tables et Edge Functions historiques Bastide restent inchangées.

## Pour le MJ de la Bastide

1. Créer son compte MJ dans le Gestionnaire.
2. Ouvrir sur le même navigateur son lien MJ privé Bastide pour installer sa clé personnelle, qui n'est jamais partagée.
3. Dans Scénarios, cliquer sur « Importer depuis mon accès MJ Bastide » ; lecture GET uniquement.
4. Le modèle apparaît sous « L’Île aux Tempêtes » : aucun PJ, inventaire personnel, historique joueur ni clé.
5. Dans la bibliothèque, cliquer sur « Partager ce scénario » et transmettre à son ami le lien d'invitation. Un code aléatoire de 256 bits est valable sept jours, pour un seul import.

## Pour un autre MJ

1. Ouvrir le lien d'invitation et créer son compte MJ.
2. Après connexion, le scénario est copié dans son espace et une table sans PJ est créée automatiquement.
3. Ajouter ses personnages via des URLs HTTPS depuis Personnages.
4. Utiliser les ressources, objets, cartes, PNJ, boutique Mila locale et liens combat COF2 et Soundboard.

Si la confirmation e-mail ouvre un autre onglet, le code peut être collé dans Scénarios → Importer un scénario privé.

## Limites actuelles

- Les fiches rattachées par URL ne synchronisent pas encore automatiquement leurs PV, inventaires et états.
- La boutique Mila est actuellement un catalogue à stocks indépendants dans le workspace MJ, non une boutique transactionnelle connectée aux fiches des PJ.
- Le combat COF2 possède un espace local par table ; sa frise n'est pas encore partagée entre MJ et PJ. Le pack COF2 officiel préconfiguré n'est pas intégralement converti.
- Le Soundboard reste un outil externe.
- Le pack importe les ressources du hub Bastide, pas le texte intégral du scénario sous licence.
- Le partage est privé et destiné aux MJ ayant les droits nécessaires sur le scénario. Ne pas commercialiser le pack sous licence.
- Les scénarios du prototype anonyme restent en stockage local ancien et ne migrent pas automatiquement : utiliser l'export/import JSON pour les conserver.


## Accès multi-appareils de Camille (v0.4)

- **Un seul compte MJ**, avec son adresse e-mail et son mot de passe, utilisé depuis le PC de préparation et son téléphone ou PC personnel. Pas de transfert de fichier ou de lien MJ secret pour se reconnecter.
- Authentification Supabase ; les nouveaux appareils rechargent le même workspace dans la base de données avec les scénarios, tables, personnages rattachés et stocks Mila.
- Sauvegarde cloud : modifications envoyées après une courte temporisation, statut visible « Sauvegardé en ligne ». Si Internet coupe, une copie locale d'attente est conservée par compte et récupérée lors de la reconnexion.
- Si un autre appareil a enregistré entre-temps, le contrôle de révision refuse l'écrasement. Le bouton « Secours / conflit » exporte d'abord une copie locale avant de permettre de reprendre le cloud.
- Bouton **Test PC ↔ tél.** : le premier appareil envoie un code de vérification stocké côté serveur, le second confirme avec le même compte. La confirmation doit provenir d'un autre navigateur ; aucun identifiant privé ni contenu des tables n'est transmis par ce test.
- La déconnexion utilise explicitement le mode **local**, donc quitter le PC de préparation n'invalide pas la session du téléphone.
- Le combat COF2 passe désormais par **gestionnaire-tables/combat/?table=UUID**. Le pont cloud, isolé par compte + table, conserve les préparations/états de combat et empêche les écrasements simultanés. Si l'autre appareil modifie le combat pendant qu'il est ouvert, un rechargement explicite est demandé. Les joueurs n'ont pas encore de frise synchronisée.
- La Bastide historique ne peut être liée qu'à **un seul compte MJ** via une vérification serveur de sa clé privée. La liaison ne modifie pas les données Bastide.

### Test obligatoire avant la visite

1. Créer le vrai compte Camille dans un navigateur privé sur le PC de préparation, avec une adresse e-mail à lui et un mot de passe choisi par lui.
2. Importer dans son compte le pack personnel reçu par invitation, puis créer sa table ; vérifier les personnages (initialement zéro), Mila, les objets de scénario, les cartes et les rencontres.
3. Ajouter une fiche de test, puis attendre le statut **Sauvegardé en ligne ✓**.
4. Sur son téléphone, ouvrir la même URL, choisir **Se connecter**, entrer la même adresse e-mail et le même mot de passe et vérifier les mêmes ressources.
5. Depuis le PC, utiliser **Test PC ↔ tél. → Envoyer le signal** ; sur le téléphone **Confirmer depuis cet appareil**, puis sur PC **Vérifier la réponse**.
6. Sauvegarder un combat sur le PC, fermer le combat après confirmation du cloud, ouvrir sur téléphone et retrouver les préparations.
7. Se déconnecter sur le PC, puis actualiser le téléphone. La session du téléphone doit rester active.

**Limite de validation :** les fonctions et règles serveur sont déployées et vérifiables, mais la recette à deux comptes et deux appareils réels doit encore être effectuée avant de déclarer le parcours validé pour Camille. Une connexion Internet est requise pour se connecter et synchroniser.

## Vérifications

- Syntaxe des modules JavaScript et validation du moteur.
- Test de copie de ressources et suppression de données PJ, clés et historiques.
- Existence des politiques RLS, absence de privilège SELECT pour les comptes anonymes sur les quatre tables.
- Déploiement de la fonction sécurisée de consommation d'invitation.
- La recette complète de deux comptes MJ avec confirmation d'e-mail et échanges entre appareils reste à réaliser avant commercialisation.
