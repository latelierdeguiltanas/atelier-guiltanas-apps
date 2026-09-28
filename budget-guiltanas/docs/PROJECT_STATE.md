# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Architecture v0.7
L'application gère maintenant deux domaines distincts :

### 1. Comptes courants
Deux comptabilités indépendantes :
- **LCL**
- **Crédit Agricole**

Chaque compte courant possède ses propres :
- mois ;
- base/report mensuel ;
- budgets ;
- charges fixes ;
- revenus ;
- opérations ;
- point de reprise ;
- référence bancaire ;
- rapprochement et analyse d'écart ;
- règles de catégorisation ;
- historique/import.

Le moteur est le même pour les deux comptes mais aucune donnée mensuelle n'est partagée entre eux.

### Migration
Au premier chargement de la v0.7 :
- toutes les données historiques existantes sont automatiquement affectées au compte **LCL** ;
- le compte **Crédit Agricole** est créé vierge ;
- aucune donnée LCL n'est copiée dans Crédit Agricole.

Test d'isolation effectué :
- budget LCL de test : 400 € ;
- budget Crédit Agricole modifié à 999 € ;
- retour LCL : budget resté à 400 € ;
- point de reprise LCL du 14/08 conservé.

### 2. Épargnes
Nouvel onglet indépendant des comptes courants.

Chaque épargne possède :
- nom ;
- banque (LCL / Crédit Agricole / Autre) ;
- usage / objectif libre ;
- solde ;
- objectif financier optionnel.

Exemples prévus :
- Vacances ;
- Coup dur ;
- Enfant 1 ;
- Enfant 2 ;
- autres livrets ou poches.

Les épargnes ne participent pas aux calculs de budget mensuel des comptes courants.

## Navigation multi-appareils
Le compte courant actuellement affiché est un choix local au téléphone.
La future synchronisation partage les données mais ne doit pas forcer l'autre téléphone à afficher le même compte.

## Import
L'import Excel s'applique au compte courant actuellement sélectionné.
Le classeur actuel `Comptes LCL 2026.xlsx` doit donc être importé lorsque **LCL** est sélectionné.

## Rapprochement bancaire
Le rapprochement fonctionne indépendamment pour LCL et Crédit Agricole.
Chaque compte conserve sa propre référence bancaire vérifiée et son propre point de reprise.

## Synchronisation
La synchronisation Supabase est préparée mais pas encore activée.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations utilisateur
1. vérifier que l'historique importé est toujours présent côté LCL ;
2. passer sur Crédit Agricole et confirmer qu'il est vierge ;
3. créer un budget CA et vérifier qu'il n'apparaît pas sur LCL ;
4. créer plusieurs épargnes (Vacances / enfants / coup dur) ;
5. vérifier la modification et la suppression d'une épargne ;
6. poursuivre ensuite avec la synchronisation privée des deux téléphones.
