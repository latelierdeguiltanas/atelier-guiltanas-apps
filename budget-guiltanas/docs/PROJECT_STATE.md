# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## Source fonctionnelle
Le classeur personnel `Comptes LCL 2026.xlsx` reste l'oracle fonctionnel.
La continuité mensuelle est désormais automatique : le résultat calculé d'un mois devient la base du mois suivant.

## Statut v0.5 — point de reprise des comptes
- historique mensuel janvier → septembre importable directement depuis Excel ;
- point global « comptes vérifiés jusqu'au … » ;
- reprise automatique au lendemain de cette date ;
- nombre de jours à rattraper visible sur l'accueil ;
- statut par mois : Vérifié / En reprise / À rattraper / Planifié ;
- le point de reprise peut être avancé ou reculé à tout moment ;
- un solde bancaire peut être associé au point de vérification ;
- les opérations antérieures à ce point sont alors considérées réconciliées ;
- estimation initiale du point de reprise depuis les mentions Excel `ok le …` quand elles existent ;
- report automatique du résultat du mois précédent vers la base du mois suivant ;
- seules les données du premier mois gardent une base manuelle ;
- les dépassements d'enveloppes réduisent désormais réellement la projection de fin de mois ;
- aucune limite ne bloque un dépassement.

## Exemple de fonctionnement attendu
Si les comptes sont vérifiés jusqu'au 14/08 :
- août affiche « En reprise » ;
- l'accueil indique « Reprendre à partir du 15/08 » ;
- septembre affiche « À rattraper » tant qu'août n'est pas terminé ;
- lorsque le point passe au 31/08, août devient « Vérifié » et septembre devient le mois à reprendre ;
- toute correction d'août recalcule automatiquement la base de septembre, puis des mois suivants.

## Synchronisation
La synchronisation Supabase est préparée mais pas encore activée.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations utilisateur
1. vérifier le point de reprise estimé après rechargement ;
2. ajuster manuellement la date si nécessaire (ex. 14/08/2026) ;
3. simuler la reprise au 15/08 et l'avancement jusqu'au 31/08 ;
4. vérifier que septembre reprend automatiquement le résultat d'août ;
5. activer ensuite la synchronisation privée des deux téléphones.
