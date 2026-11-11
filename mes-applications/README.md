# Portail Mes applications — L’Atelier de Guiltanas

Application autonome, sans connexion au hub Bastide ni à Supabase.

## Fonctionnement
- Au premier chargement et toutes les 15 minutes au maximum, interroge l'API publique GitHub pour détecter les dossiers contenant un `index.html` dans le dépôt `latelierdeguiltanas/atelier-guiltanas-apps` (branche `main`).
- Découvre les autres dépôts publics de `latelierdeguiltanas` dont GitHub Pages est activé (leur point d'entrée uniquement).
- Montre les applications principales ; une case à cocher révèle tous les sous-outils dont le chemin contient plusieurs niveaux.
- Recherche, filtres, favoris, ajout/suppression de liens manuels HTTPS.
- Catalogue et réglages enregistrés localement ; en cas de panne GitHub, une version en cache ou quelques liens de secours restent visibles.
- Pour les nouvelles applications, elles doivent avoir un `index.html` publié dans le dépôt principal ; les dépôts privés ne sont pas visibles automatiquement.

## Important
- Ce portail recense les **liens disponibles dans le code public**, sans garantir à 100 % qu'un site GitHub Pages est déjà déployé ou qu'il est fonctionnel.
- Liens manuels et favoris restent propres à chaque navigateur/appareil : pas de synchronisation inter-appareils.
- L'API publique GitHub limite le nombre d'appels anonymes ; il existe un cache de 15 minutes.
- Aucun secret, mot de passe ni token personnel n'est stocké dans l'application.
- Aucun fichier du hub Bastide n'a été modifié.