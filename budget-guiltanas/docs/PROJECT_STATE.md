# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Source fonctionnelle
Le classeur personnel `Comptes LCL 2026.xlsx` est l'oracle fonctionnel.
La formule mensuelle vérifiée est :

`BASE + TOTAL REVENUS - TOTAL CHARGES - TOTAL BUDGETS = RESTE`.

Contrôle réalisé sur septembre 2026 : résultat calculé `-1 490,36 €`, identique au classeur.

## Statut v0.2
- thème automne ;
- navigation Accueil / Plan / Données ;
- budgets, charges et revenus configurables ;
- opérations réelles distinguées des engagements prévus ;
- actualisation du solde bancaire avec réconciliation pour éviter les doubles comptes ;
- import/export JSON ;
- import complet 2026 préparé hors GitHub ;
- code Auth + synchronisation Supabase prêt ;
- schéma RLS dédié préparé.

## Synchronisation — étape bloquante restante
Créer un nouveau projet Supabase dédié au budget, appliquer `supabase/schema.sql`, récupérer URL + publishable key et les renseigner dans `index.html`.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages sert l'application depuis :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations
1. test mobile du thème et de la saisie ;
2. import du fichier privé Excel ;
3. création du projet Supabase budget ;
4. connexion du même compte foyer sur les deux téléphones ;
5. test de synchro bidirectionnelle ;
6. ensuite : comptes utilisateurs séparés / foyer multi-membres pour la version commercialisable.
