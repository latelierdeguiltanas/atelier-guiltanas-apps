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

## Vérifications

- Syntaxe des modules JavaScript et validation du moteur.
- Test de copie de ressources et suppression de données PJ, clés et historiques.
- Existence des politiques RLS, absence de privilège SELECT pour les comptes anonymes sur les quatre tables.
- Déploiement de la fonction sécurisée de consommation d'invitation.
- La recette complète de deux comptes MJ avec confirmation d'e-mail et échanges entre appareils reste à réaliser avant commercialisation.
