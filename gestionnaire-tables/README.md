# Gestionnaire de tables — Atelier de Guiltanas (v0.2)

## Objectif
Gerer des tables independantes et creer des packs de scenarios reutilisables. Le hub original Bastide reste intact. Les donnees d'autres campagnes ne sont jamais melangees.

## La Bastide en lecture seule
La page **Mes tables** comprend une carte pour ouvrir directement la vraie Bastide, sa boutique et son combat synchronise. Le bouton « Verifier les donnees actuelles » lit uniquement l'etat depuis l'API existante si cet appareil possede deja une cle MJ valide. La carte n'est pas une migration des donnees.

## Importer le pack « Ile aux Tempetes » sans PJ
1. Sur le **meme navigateur et la meme origine GitHub Pages** que le hub MJ Bastide, ouvrir une fois le lien MJ prive existant (cela enregistre la cle localement dans le navigateur).
2. Ouvrir Gestionnaire de tables → Scenarios → **Importer depuis mon acces MJ Bastide**.
3. Le bouton verifie l'acces MJ, puis lit les ressources avec les API historiques en **GET uniquement**.
4. L'import cree un scenario local contenant les articles actifs de Mila, objets de scenario, cartes, PNJ et rencontres et les definitions de combats personnalises disponibles.
5. La bibliotheque permet ensuite de **creer une table vide de PJ**, ou d'exporter le modele JSON et de le transmettre a un MJ autorise, qui l'importe sur son propre appareil.
6. Les PJ sont rattaches manuellement via leurs liens HTTPS de fiches depuis l'onglet Personnages.

### Ce qui est exclu de l'import
- Aucun PJ historique, aucune fiche, aucun inventaire joueur, aucun evenement, aucun message, aucun historique de combat.
- Aucune cle MJ ou joueur et aucun token stocke ou exporte.
- Pas de synchronisation bidirectionnelle vers la Bastide, ni de modification de ses tables ou de ses fichiers.
- Les modules du scenario sont des **catalogues de lieux et rencontres**, pas une chronologie officielle complete.
- Aucune extraction/publication automatique des pages du scenario commercial sous licence : le MJ doit disposer de sa propre copie autorisee.

## Outils sur une nouvelle table
- Onglet **Ressources** : boutique de Mila (catalogue et stocks locaux), objets, cartes, PNJ et notes MJ.
- Onglet **Outils** : ouverture d'une campagne de combat COF2 scopee sur l'identifiant de la table, avec equipe initialement vide. Les definitions personnalisees du combat importe sont reprises si disponibles ; les rencontres du pack officiel COF2 non personnalisees ne sont pas automatiquement converties.
- **Dupliquer sans PJ** : cree une copie independante sans PJ, seances, progression.
- Les modifications de stock et la bibliotheque de combats sont locales a l'appareil : pas encore synchronisees avec les fiches joueurs.

## Limites importantes
- Version de prototype **sans comptes MJ, serveur dedie ni invitations joueurs**.
- L'import a besoin du navigateur deja autorise comme MJ de la Bastide. Sur un navigateur non autorise, aucun contenu prive n'est accessible.
- Les scenarios et tables sont dans localStorage : exporter regulierement une sauvegarde.
- Les packs exportes peuvent contenir les notes privees du MJ et du contenu sous licence : partage restreint a des utilisateurs autorises, jamais commercialise avec le gestionnaire.
- Ne pas ouvrir le combat Bastide depuis la nouvelle table : chaque mode utilise un lien et une cle de scope differents.

## Suivi
Priorites suivantes : backend multi-MJ isole avec authentification et RLS, bibliotheque privee de packs, invitations PJ, veritable synchronisation des fiches, boutique transactionnelle isolee, synchronisation des combats entre appareils.

## Tests techniques
Validation de syntaxe JavaScript, creation et duplication sans PJ, retention des objets/cartes/boutique/PNJ, exclusion des joueurs et des cles d'une simulation d'export pack.
