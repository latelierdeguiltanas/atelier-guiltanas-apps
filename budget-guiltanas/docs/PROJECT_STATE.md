# ÉTAT DU PROJET

Projet : `budget-guiltanas`

Emplacement GitHub : `latelierdeguiltanas/atelier-guiltanas-apps/budget-guiltanas/`

## Règle d'isolation
Aucune modification hors de `budget-guiltanas/` lors des travaux sur ce projet, sauf demande explicite de l'utilisateur.

## v0.8 — audit croisé LCL / Crédit Agricole

### Classeur LCL
Feuilles mensuelles janvier → septembre 2026 + `A PREVOIR`.

Le libellé **Epargne** présent dans les mois correspond à des sorties récurrentes du compte courant, notamment :
- Virement Permanent Filles ;
- Total Option mi-mois ;
- Total Option fin de mois.

Il n'existe pas de feuille autonome de soldes d'épargne dans ce classeur.
Ces lignes restent donc des mouvements/charges LCL et ne créent pas artificiellement de livrets.

### Classeur Crédit Agricole
Feuilles de compte courant :
- janvier → août 2026.

Feuilles annexes détectées :
- `EPARGNE` ;
- `PRIME 2026` ;
- `SUIVI REMBOURSEMENTS` ;
- `ANNUEL`.

Les trois dernières sont conservées comme modules identifiés mais ne sont pas mélangées automatiquement aux comptes courants ou à l'épargne.

### Épargne réellement suivie dans EPARGNE
Quatre comptes/pochettes sont identifiés :

1. Crédit Agricole — JOHANNA — TRAVAUX / CHARGES MAISON
   - solde d'ouverture : 769,48 €
   - solde actuel : 217,79 €
   - 26 mouvements importables

2. Crédit Agricole — MATHIEU — PARENTS MATH
   - solde d'ouverture : 1 904,86 €
   - solde actuel : 65,03 €
   - 18 mouvements importables

3. LCL — JOHANNA — PARENTS JO
   - solde d'ouverture : 67,05 €
   - solde actuel : 12,92 €
   - 15 mouvements importables

4. LCL — MATHIEU — VOYAGES
   - solde d'ouverture : 23,85 €
   - solde actuel : 13,20 €
   - 27 mouvements importables

Total du tableau d'épargne actuel : **308,94 €**.

Aucun compte explicitement nommé « enfant » n'a été identifié dans l'onglet EPARGNE. Ne pas en inventer ; ils pourront être ajoutés manuellement ou importés depuis une autre source.

## Import v0.8
Le lecteur Excel reconnaît automatiquement le classeur :
- LCL → compte courant LCL ;
- Crédit Agricole → compte courant Crédit Agricole.

Le fichier Crédit Agricole importe en une seule opération :
- tous les mois de compte courant disponibles ;
- les 4 épargnes de l'onglet `EPARGNE` ;
- leurs soldes ;
- leurs titulaires ;
- leur banque ;
- leur historique de mouvements.

Un réimport :
- met à jour les épargnes par identifiant de source ;
- n'en crée pas de doublons ;
- préserve un nom personnalisé et un objectif d'épargne saisi dans l'application ;
- remplace les mois présents dans le fichier mais conserve les mois plus récents créés manuellement dans l'application.

## Comptes courants
LCL et Crédit Agricole restent totalement séparés :
- mois ;
- charges ;
- revenus ;
- budgets ;
- point de reprise ;
- rapprochement bancaire ;
- historique.

Les charges déjà marquées « ok » dans les Excel sont désormais aussi importées comme écritures réelles datées, ce qui fiabilise le rapprochement bancaire.

## Épargne
L'onglet Épargne reste indépendant des comptes courants.
Une épargne peut maintenant contenir :
- banque ;
- titulaire/personne ;
- nom ;
- usage ;
- solde actuel ;
- objectif facultatif ;
- solde d'ouverture ;
- historique importé.

## Synchronisation
La synchronisation Supabase reste préparée mais pas encore activée.
Ne pas réutiliser le projet Supabase `ile-aux-tempetes-hub`.

## Déploiement
GitHub Pages :
`/atelier-guiltanas-apps/budget-guiltanas/`

## Prochaines validations utilisateur
1. sélectionner/importer `Comptes CA 2026.xlsx` depuis Données ;
2. vérifier que l'application bascule automatiquement sur Crédit Agricole ;
3. parcourir janvier → août côté CA ;
4. ouvrir Épargne et vérifier les 4 soldes importés ;
5. ouvrir une épargne et contrôler l'historique de mouvements ;
6. vérifier que les données LCL précédemment importées restent intactes.
