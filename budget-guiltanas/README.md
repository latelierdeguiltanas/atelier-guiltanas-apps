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


## v0.6 — rapprochement bancaire
- création de budget accessible directement depuis l'accueil ;
- gestion/suppression d'un budget via l'écran Plan > Budgets ;
- suppression d'un budget sans suppression des opérations déjà saisies ;
- date réelle obligatoire pour les nouvelles dépenses et nouveaux revenus ;
- référence bancaire vérifiée conservée séparément du solde théorique ;
- bouton « Contrôler le solde LCL » ;
- comparaison solde application / solde LCL à une date choisie ;
- écart toléré automatiquement : 0,05 € maximum ;
- recherche déterministe de causes possibles :
  - charge prévue mais non validée ;
  - revenu prévu mais non marqué reçu ;
  - écriture potentiellement en double ;
  - écriture enregistrée en trop ;
  - combinaison de 2 ou 3 écritures correspondant exactement à l'écart ;
- affichage des dates, montants et libellés des pistes ;
- si aucune piste connue ne correspond, l'application précise qu'une opération peut être absente et qu'un futur import de relevé bancaire sera nécessaire pour l'identifier avec certitude.

Le rapprochement ne remplace jamais automatiquement un écart important par le solde réel : cela éviterait de masquer une erreur de comptes.


## v0.7 — comptes multiples et épargne
- deux comptes courants totalement séparés :
  - LCL ;
  - Crédit Agricole ;
- le fonctionnement est identique sur les deux : mois, budgets, charges, revenus, point de reprise, rapprochement bancaire et historique ;
- migration automatique : toutes les données existantes sont conservées sur LCL ;
- Crédit Agricole démarre avec une comptabilité vierge indépendante ;
- le choix du compte affiché reste local à chaque téléphone ;
- l'import Excel s'applique uniquement au compte courant sélectionné ;
- nouvel onglet Épargne, séparé des comptes courants ;
- création/modification/suppression de plusieurs épargnes ;
- chaque épargne possède banque, nom, usage, solde et objectif optionnel ;
- regroupement visuel par banque (LCL / Crédit Agricole / Autre) ;
- total global de l'épargne affiché séparément du budget mensuel.


## v0.8 — import Crédit Agricole + épargnes
Audit des deux classeurs :
- `Comptes LCL 2026.xlsx` : historique LCL mensuel ; les lignes « Epargne » sont des sorties/virements mensuels, pas un registre autonome de livrets ;
- `Comptes CA 2026.xlsx` : historique du compte courant Crédit Agricole + onglet `EPARGNE`.

L'import Excel reconnaît automatiquement le type de classeur :
- fichier LCL → compte courant LCL ;
- fichier Crédit Agricole → compte courant Crédit Agricole ;
- fichier Crédit Agricole → import/mise à jour automatique des épargnes suivies dans `EPARGNE`.

Épargnes détectées dans le classeur CA :
- Crédit Agricole / Johanna / Travaux - charges maison ;
- Crédit Agricole / Mathieu / Parents Math ;
- LCL / Johanna / Parents Jo ;
- LCL / Mathieu / Voyages.

Chaque épargne importée conserve :
- solde courant ;
- solde d'ouverture ;
- titulaire ;
- banque ;
- objectif/libellé ;
- historique des mouvements ;
- source Excel.

Les réimports mettent à jour les mêmes épargnes au lieu de les dupliquer et conservent les objectifs saisis manuellement.
