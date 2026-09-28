# Budget — Atelier de Guiltanas

Gestionnaire de budget familial mobile-first.

## Isolation du projet
Ce projet vit exclusivement dans `budget-guiltanas/` au sein du dépôt `atelier-guiltanas-apps`.

**Règle stricte :** les travaux sur ce gestionnaire ne doivent jamais modifier les autres dossiers du dépôt sans demande explicite.

## Version actuelle
Prototype v0.1 :
- tableau de bord mobile ;
- solde bancaire et projection ;
- enveloppes mensuelles ;
- ajout rapide dépense/revenu ;
- proposition de catégorie ;
- catégorie Divers / Joker ;
- historique local ;
- aucune donnée financière personnelle versionnée.

Les données sont actuellement enregistrées dans le `localStorage` du navigateur : deux téléphones n'ont donc pas encore les mêmes données. La synchronisation privée multi-utilisateurs sera une étape suivante.
