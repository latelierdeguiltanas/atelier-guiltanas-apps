# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Source fonctionnelle
Le classeur personnel `Comptes LCL 2026.xlsx` est l'oracle fonctionnel.
Formule mensuelle vérifiée : `BASE + TOTAL REVENUS - TOTAL CHARGES - TOTAL BUDGETS = RESTE`.
Contrôle septembre 2026 : `-1 490,36 €`, identique au classeur.

## Statut v0.4 — historique et lecture visuelle
- thème automne ;
- import direct du fichier Excel complet `.xlsx` sans upload vers GitHub ;
- parseur des onglets mensuels JANVIER → DECEMBRE ;
- classeur actuel contrôlé : 9 mois, janvier à septembre 2026 ;
- navigation rapide mois précédent / suivant et liste de tous les mois ;
- mois antérieurs marqués « Clôturé » ;
- charges fixes toujours comptées dans la projection, qu'elles soient sorties ou non ;
- charges non sorties grisées ;
- validation d'une charge avec date réelle et retour possible en attente ;
- dates historiques récupérées depuis les statuts `ok le …` quand disponibles ;
- budgets sans blocage de dépassement ;
- carte budget verte si moins de 50 % consommé ;
- orange à partir de 50 % consommé ;
- rouge à 50 € ou moins du plafond, ainsi qu'en dépassement ;
- annulation des opérations réelles depuis l'historique ;
- import/export JSON toujours disponible en sauvegarde ;
- synchronisation Supabase préparée mais pas encore activée.

## Contrôle du parseur Excel
Sur le fichier 2026 actuel, le mapping retrouve pour chaque mois les mêmes volumes que l'import de référence :
- janvier : 6 budgets / 16 charges / 48 écritures ;
- février : 6 / 25 / 41 ;
- mars : 6 / 26 / 43 ;
- avril : 6 / 31 / 50 ;
- mai : 6 / 32 / 60 ;
- juin : 6 / 30 / 53 ;
- juillet : 6 / 30 / 96 ;
- août : 6 / 28 / 80 ;
- septembre : 6 / 13 / 9.

## Synchronisation — étape bloquante restante
Créer un projet Supabase dédié au budget, appliquer `supabase/schema.sql`, récupérer URL + publishable key et les renseigner dans le frontend.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations utilisateur
1. importer directement `Comptes LCL 2026.xlsx` depuis l'onglet Données ;
2. parcourir janvier → septembre avec les flèches / la liste ;
3. comparer visuellement un mois ancien avec l'onglet Excel correspondant ;
4. contrôler les couleurs vert / orange / rouge des enveloppes ;
5. ensuite activer la synchronisation privée entre les deux téléphones.
