# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Source fonctionnelle
Le classeur personnel `Comptes LCL 2026.xlsx` est l'oracle fonctionnel.
Formule mensuelle vérifiée : `BASE + TOTAL REVENUS - TOTAL CHARGES - TOTAL BUDGETS = RESTE`.
Contrôle septembre 2026 : `-1 490,36 €`, identique au classeur.

## Statut v0.3 — suivi des sorties réelles
- thème automne ;
- charges fixes toujours comptées dans la projection, qu'elles soient sorties ou non ;
- charges non sorties affichées en gris ;
- validation manuelle d'une charge fixe avec date réelle de débit ;
- charge validée réversible en « pas encore sortie » ;
- modification d'une charge déjà sortie répercute nom et montant dans l'historique ;
- suppression d'une charge/revenu nettoie son écriture liée ;
- suppression d'un budget conserve les dépenses mais les bascule hors budget ;
- dépassement d'enveloppe autorisé sans blocage, solde d'enveloppe pouvant devenir négatif ;
- bouton d'annulation sur les opérations réelles de l'historique ;
- budgets, charges et revenus configurables ;
- import/export JSON ;
- synchronisation Supabase préparée mais pas encore activée.

## Synchronisation — étape bloquante restante
Créer un projet Supabase dédié au budget, appliquer `supabase/schema.sql`, récupérer URL + publishable key et les renseigner dans le frontend.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations
1. test mobile du suivi des charges fixes ;
2. validation date + retour en attente ;
3. dépassement volontaire d'un budget ;
4. import du fichier privé Excel ;
5. activation de la synchronisation privée à deux téléphones.
