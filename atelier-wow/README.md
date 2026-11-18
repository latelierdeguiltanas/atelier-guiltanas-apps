# Atelier WoW — L'Atelier de Guiltanas

**Version initiale 0.1 : application mobile installable et addon de relevé local WoW Forever.**

**Site :** https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/atelier-wow/

## Ce qui est implémenté
- Vue compte entier : personnages, métiers et niveaux.
- Stocks additionnés avec emplacements et dates de relevé.
- Recettes apprises par personnage, catalogue et recherche.
- Planificateur : besoins, quantités possédées, quantités à farmer.
- Import et export JSON, stockage local, cache hors connexion.
- Catalogue communautaire ForeverDB en chargement optionnel (si API et CORS le permettent).
- Addon expérimental pour les sacs, banques ouvertes, rangs des métiers, recettes de la fenêtre de profession ouverte.

## Première synchronisation PC → téléphone
1. Dans World of Warcraft Forever, copier le dossier **AtelierWow** (contenant AtelierWow.toc et AtelierWow.lua) sous **Interface/AddOns** du client Forever.
2. Activer l'addon et se connecter sur Guiltanas.
3. Ouvrir les sacs, la banque et la banque de composants, puis chaque fenêtre de métier à relever.
4. Saisir la commande **/atelierwow scan**, puis **/reload**.
5. Faire la même chose sur Krisania et sur tous les personnages. Les relevés sont conservés ensemble au niveau du compte.
6. Après sortie du jeu ou /reload, trouver le fichier **WTF/Account/NOM_COMPTE/SavedVariables/AtelierWow.lua**. Attention : il n'est pas dans Interface/AddOns.
7. Depuis le PC avec Python 3 : **python atelierwow_convert.py "C:\...\SavedVariables\AtelierWow.lua"**. Cela crée **atelier-wow-compte.json**.
8. Transférer le JSON sur le téléphone via un moyen privé. Dans l'app : **Synchronisation → Importer un relevé JSON**.

La commande **/atelierwow etat** affiche un petit bilan dans le chat du jeu.

## Limites importantes
- **Pas de synchronisation automatique pour l'instant** : la connexion Battle.net et le pont sécurisé PC → mobile ne sont pas implémentés.
- L'addon ne peut pas connaître les données que le client n'expose pas. Banques jamais ouvertes, courrier, enchères, banques de guilde et autres comptes : non garantis.
- Les emplacements non re-scannés restent en cache ; une quantité peut être périmée.
- La collecte des recettes dépend des fenêtres du jeu et doit être testée sur le client Forever. **Code non encore validé en jeu.**
- Pour les patrons, sources et coordonnées, les données communautaires sont à vérifier. Les recettes impossibles ou exclusives exigent un traitement particulier.
- Les réservations de composants ne sont pas encore gérées, seuls les besoins totaux le sont.
- Les données sont sauvegardées dans le navigateur courant. Une suppression de ce stockage efface le suivi local : exporter une sauvegarde. **Ne pas publier son JSON d'inventaire dans un dépôt GitHub public.**
- Aucun mot de passe Battle.net n'est demandé.

## Données attendues
Format **atelierwow-v1**, tableau **characters**, facultativement **catalog** et **plans**. Les personnages possèdent des listes **items** (itemId, name, count, location, seenAt) et **professions** (name, skill, max, recipes).

## Étapes suivantes
OAuth Battle.net sur backend privé, synchronisation Windows opt-in vers téléphone, suivi de couverture pour toutes les banques, réservations, catalogue exhaustif et cartes de farm.

Documentation : [API de WoW Forever](https://mhuijskens.com/WoWForever/Api/) ; [ForeverDB](https://foreverdb.net/es/developers) ; [Addon Forever API](https://github.com/Atraeau/WoW-Addons/blob/main/docs/api/README.md).
