# L’Atelier de Guiltanas — Gestionnaire de tables (prototype v0.1)

Prototype autonome de **gestion de tables JDR**, pensé pour servir de base à un produit commercial. Ouvrir `index.html` dans un navigateur moderne ; conserver les quatre fichiers `index.html`, `style.css`, `domain.js`, `app.js` dans le même dossier.

## Capacités déjà utilisables
- Création de tables isolées, à partir d'un scénario original ou d'un scénario JSON importé.
- Duplication de table avec remise à zéro des séances et scènes jouées. Personnages copiés avec de nouveaux identifiants, sans synchronisation des fiches.
- Bibliothèque de scénarios, création d'un scénario vierge, duplication et export de modèles.
- Ajout de modules et de scènes propres à une table.
- Personnages : liste avec nom, joueur, niveau, URL HTTPS de fiche personnelle (raccourci uniquement).
- Gestion de séances, compte rendu, notes MJ, progression des scènes.
- Export/import de sauvegarde JSON complète ; aucune connexion nécessaire.
- Interface responsive mobile/desktop.

## Important — ce qui n'est PAS encore prêt
- Pas d'authentification multi-MJ ni de mots de passe.
- Pas d'invitations PJ, de rôles ni de synchronisation en temps réel.
- Pas de synchronisation de personnages avec Forge of Heroes.
- Les liens vers les outils de combat et de fiches ouvrent les applications existantes **sans transmission de données**.
- Stockage local dans le navigateur : sauvegarder régulièrement. Ce prototype n'est pas un service commercial en production.

## Isolation et propriété intellectuelle
- Aucun fichier ni donnée du hub Bastide n'est importé, modifié ou migré.
- Aucun accès au serveur Supabase Bastide, aucune clé de sa campagne, aucun ancien compte MJ.
- Le scénario démonstration **Le Phare des Brumes** est original.
- Les contenus sous licence doivent rester des packs externes/importés en usage autorisé ; ne pas les inclure dans une distribution commerciale sans droits.

## Modèle de scénario JSON
```
{"name":"Mon aventure","category":"one-shot","system":"COF2","copyright":"external-personal-use","description":"Résumé","modules":[{"name":"La forêt","duration":60,"summary":"Explorer","scenes":[{"title":"Rencontre","description":"Ce que voient les joueurs","gmNotes":"Ce que sait le MJ","encounters":[{"name":"Une menace","notes":"Stats à définir"}]}]}]}
```

## Prochaine étape technique
Développer un backend **isolé de celui de la Bastide** (auth, tables, invitations, memberships, RLS) avant tout vrai partage multi-MJ. Tester les restrictions entre deux MJ, la sauvegarde multi-appareils et les droits de lecture/écriture des fiches.

## Test
`node tests.mjs`