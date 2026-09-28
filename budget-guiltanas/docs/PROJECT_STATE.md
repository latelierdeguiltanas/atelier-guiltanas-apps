# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Source fonctionnelle
Le classeur personnel `Comptes LCL 2026.xlsx` reste l'oracle fonctionnel.
La continuité mensuelle est automatique : le résultat calculé d'un mois devient la base du mois suivant.

## Statut v0.6 — rapprochement bancaire
### Budgets
- création directe via « + Budget » ;
- gestion via Plan > Budgets ;
- modification et suppression ;
- une suppression conserve les écritures historiques et les bascule hors budget ;
- dépassements autorisés sans blocage.

### Point de reprise
- date globale « comptes vérifiés jusqu'au … » ;
- reprise au lendemain ;
- statuts Vérifié / En reprise / À rattraper / Planifié ;
- solde bancaire optionnel au point de reprise ;
- ce solde devient une référence bancaire datée.

### Rapprochement LCL
- bouton « Contrôler le solde LCL » sur l'accueil ;
- saisie d'une date et du solde réel LCL ;
- reconstruction du solde théorique depuis la dernière référence vérifiée ;
- comparaison sans écraser la référence existante ;
- tolérance de validation automatique : 0,05 € ;
- diagnostic des écarts avec dates, montants et libellés ;
- recherche de :
  - charges fixes non validées ;
  - revenus prévus non reçus ;
  - doublons potentiels ;
  - écritures potentiellement en trop ;
  - combinaisons de 2 ou 3 éléments expliquant exactement l'écart ;
- si aucun candidat ne correspond, l'application signale qu'une opération peut être totalement absente ;
- futur complément recommandé : import du relevé bancaire LCL (CSV/Excel/OFX si LCL le permet) pour détecter automatiquement les opérations absentes.

### Dates d'opérations
Les nouvelles dépenses/revenus demandent leur vraie date.
Une opération saisie pendant un rattrapage d'août reste donc une opération d'août, même si elle est saisie en octobre.

## Test technique du moteur de rapprochement
Cas vérifié :
- référence bancaire : 1 000 € au 14/08 ;
- dépense saisie : 100 € le 15/08 ;
- solde application : 900 € ;
- solde réel LCL : 850 € ;
- écart : -50 € ;
- charge EDF prévue non validée : 50 € ;
- résultat du diagnostic : EDF est retrouvée comme explication exacte de l'écart.

## Synchronisation
La synchronisation Supabase est préparée mais pas encore activée.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations utilisateur
1. créer puis supprimer un budget de test ;
2. définir un point de reprise avec un vrai solde LCL ;
3. ajouter une opération avec sa vraie date ;
4. lancer « Contrôler le solde LCL » ;
5. provoquer volontairement un petit écart connu et contrôler les pistes ;
6. ensuite activer la synchronisation privée des deux téléphones.
