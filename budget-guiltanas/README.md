# Budget — Atelier de Guiltanas

Gestionnaire de budget familial ultra mobile-first.

## Isolation stricte
Le projet vit exclusivement dans `budget-guiltanas/` du dépôt `atelier-guiltanas-apps`.
Aucune modification hors de ce dossier sans demande explicite.

## v0.2 — Automne
- thème automnal rouge / orange / jaune ;
- moteur de calcul fidèle au classeur : `base + revenus - charges - budgets` ;
- distinction entre projection mensuelle et solde bancaire prévisionnel ;
- ajout rapide dépense / revenu ;
- enveloppes avec engagé, réellement sorti et dépassement ;
- programmation et modification des charges, revenus et budgets ;
- préparation automatique du mois suivant ;
- import privé JSON généré depuis le classeur Excel ;
- sauvegarde / restauration JSON ;
- synchronisation Supabase prête pour un compte foyer partagé sur deux téléphones.

## Confidentialité
Aucune donnée financière personnelle issue du fichier Excel n'est versionnée sur GitHub.
Le fichier d'import personnel reste local à l'utilisateur puis sera synchronisé uniquement dans la base privée authentifiée.

## Synchronisation
Le frontend utilise `@supabase/supabase-js` **2.117.1**.
La clé frontend attendue est une **publishable key** ; aucune secret key / service role ne doit être exposée dans le navigateur ou dans GitHub.
Le schéma préparé se trouve dans `supabase/schema.sql`.


## v0.4 — historique mensuel
- import direct du fichier Excel `.xlsx` complet dans le navigateur ;
- reconnaissance des onglets mensuels JANVIER → DECEMBRE ;
- navigation mois précédent / suivant + sélection directe d'un mois ;
- mois historiques identifiés comme clôturés ;
- récupération des dates depuis les statuts Excel `ok le …` quand elles existent ;
- état visuel des enveloppes :
  - vert : moins de 50 % consommé ;
  - orange : au moins 50 % consommé ;
  - rouge : 50 € ou moins restants, ou dépassement ;
- aucune limite bloquante : une enveloppe peut passer en négatif.

Le parseur a été contrôlé sur le classeur 2026 actuel : 9 mois, janvier à septembre, avec correspondance des budgets, charges et opérations.
