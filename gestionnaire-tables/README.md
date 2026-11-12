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


## Correction des liens de confirmation e-mail (11 novembre 2026)

Le 11 novembre 2026, l'e-mail de validation du compte MJ redirigeait vers `http://localhost:3000` même si le client demandait l'adresse du gestionnaire. Diagnostic : le retour GitHub Pages n'est pas autorisé dans Supabase Authentication. Le serveur a néanmoins confirmé le premier compte.

**Configuration indispensable dans Supabase Dashboard, projet `jitatmdbipjkvjstcgdc` :**
- Authentication → URL Configuration → **Site URL** : `https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/gestionnaire-tables/`
- **Redirect URLs** : ajouter exactement `https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/gestionnaire-tables/`
- Enregistrer. Les nouveaux liens doivent ensuite revenir à l'accueil du portail, pas à localhost.

Le frontend exige à présent l'URL canonique lors de l'inscription et du renvoi du mail. Il fournit « Renvoyer le mail de confirmation » et permet de revenir directement à la connexion après un lien consommé. Une adresse déjà validée peut utiliser immédiatement « Se connecter » ; inutile de recréer le compte.

**Important :** la configuration Authentication → URL Configuration relève du tableau de bord Supabase, et ne peut pas être changée via les outils de gestion de base/déploiement utilisés ici. La publication GitHub ne suffit pas à modifier les redirections Supabase. Aucun changement à la Bastide.


## Architecture modulaire — version 0.5 (12 novembre 2026)

Le produit n'est plus une déclinaison forcée de L'Île aux Tempêtes. C'est un gestionnaire de tables **neutre et extensible**.

### Parcours recommandé
1. Un compte MJ (e-mail + mot de passe) puis **Mes tables** ; création de table affichée en premier pour un nouveau compte.
2. Le MJ nomme sa table, choisit éventuellement un système (COF2, D&D5 ou libre), un scénario existant ou une trame originale, et active les modules.
3. Les modules sont réversibles : Scénario, Combat COF2 (sur table COF2), Boutique, Fiches PJ, Soundboard, Carnet et séances.
4. Aucune obligation d'activer les fiches, d'inviter des joueurs ou de renseigner un scénario. Les tables combat-seul ou notes-seules ne créent pas de modèle parasite en bibliothèque.
5. Le scénario peut être associé ou remplacé **après** la création de la table ; les liens PJ et les séances sont préservés, seules les scènes jouées sont réinitialisées.

### Studio Scénario
- Trames originales libres : one-shot à 3 actes, campagne à 3 chapitres, exploration par zones, page vierge.
- Gestion de sections et scènes avec narration et notes réservées au MJ.
- Ressources visuelles dans le même espace : zones/lieux, PNJ/rencontres, cartes, objets de scénario, boutique. Recherche et filtres par zone.
- Création, modification et suppression contrôlée (concerne seulement la table ouverte).
- Images par URL HTTPS ou import de fichier JPG/PNG/WebP jusqu'à 5 Mo dans le bucket privé `guiltanas-mj-media`. Les médias privés sont réservés au propriétaire via RLS ; un lien signé temporaire est utilisé à l'affichage.
- Les médias privés chargés par un MJ **ne sont pas encore recopiés dans le compte d'un MJ destinataire lors du partage**. Les liens d'images publiques HTTPS fonctionnent sur des copies de scénario ; une synchronisation sécurisée inter-MJ des médias reste à développer.
- Les ressources importées depuis la Bastide peuvent être regroupées automatiquement sous des zones proposées : Le Repos du Dragon, La côte et l'épave, Les grottes de Poussemer, L'observatoire de la Falaise et Autres lieux. Ce classement est une proposition modifiable ; il n'invente pas le déroulement des scènes.
- La bibliothèque de packs ne contient aucune aventure sous licence installée automatiquement. L'import depuis la Bastide exige une autorisation MJ et est uniquement en lecture.

### Concernant le combat COF2
Le bouton ouvre le moteur COF2 existant avec un espace cloud indépendant par compte MJ et par table. Les PJ de la Bastide ne sont **jamais** copiés. Les **rencontres originales préconfigurées du pack Île aux Tempêtes** ne sont pas encore toutes injectées dans la copie privée : la source actuelle enregistre surtout les définitions personnalisées. Ne pas confondre l'accès au moteur et un pack de combats 100 % prêt à jouer.

### Fonctionnalités encore non terminées
- Véritable espace joueur distant et partage sécurisé des cartes/PNJ.
- Liaison transactionnelle des fiches, inventaires, boutique et combat aux PJ.
- Import complet de la bibliothèque de combats de l'aventure dans une nouvelle table.
- Partage portable des images privées entre deux comptes MJ.
- Recette de bout en bout multi-navigateurs à deux comptes réels et paramétrage final des URL de confirmation e-mail dans Supabase.
- Distribution/licensing commercial du produit distinct du code public de démonstration.

La Bastide historique, ses personnages et ses données n'ont pas été modifiés par cette évolution.
