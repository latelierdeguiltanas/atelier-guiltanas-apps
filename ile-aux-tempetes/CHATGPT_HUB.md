# Île aux Tempêtes — ChatGPT Project Hub

> Point d'entrée unique pour reprendre le projet sans recharger tout l'historique des chats.
> Source de vérité : GitHub, branche `main`.

## 1. Verrou de périmètre

- Travailler UNIQUEMENT dans `ile-aux-tempetes/`.
- Ne jamais modifier `forge-of-heroes/` depuis un travail Île aux Tempêtes.
- Ne jamais déplacer, renommer ou supprimer un fichier hors de `ile-aux-tempetes/`.
- En cas d'ambiguïté, s'arrêter avant toute écriture hors périmètre.

## 2. Protocole de reprise ultra-léger

Au début d'un nouveau chat de travail :

1. Lire CE fichier uniquement.
2. Lire ensuite seulement le ou les fichiers directement concernés par la tâche demandée.
3. Ne pas explorer tout le dépôt par défaut.
4. Utiliser l'historique Git uniquement si une décision ou une régression doit être retrouvée.
5. Faire les modifications directement dans `ile-aux-tempetes/` puis pousser sur `main`, sauf demande contraire explicite de Math.
6. À la fin d'une étape importante, mettre à jour la section **État courant** de ce fichier si nécessaire.

Le chat n'est pas la mémoire longue du projet : GitHub l'est.

## 3. Architecture utile

### Portail général
- `ile-aux-tempetes/index.html`

### Portail joueurs
- `ile-aux-tempetes/joueurs/index.html`

### Gestion des personnages joueurs
- `ile-aux-tempetes/personnages/shared/engine.html` : moteur/interface joueur partagé.
- `ile-aux-tempetes/personnages/hammerz/`
- `ile-aux-tempetes/personnages/lelio/`
- `ile-aux-tempetes/personnages/loris/`
- `ile-aux-tempetes/personnages/vax/`
- Portraits : `ile-aux-tempetes/assets/personnages/`

### Outils MJ
- `ile-aux-tempetes/mj/index.html`
- Combat : `ile-aux-tempetes/mj/outils/combat/`
- Soundboard : `ile-aux-tempetes/mj/outils/soundboard/`
- Scénario : `ile-aux-tempetes/mj/outils/scenario/`

### Autres espaces déjà présents
- `boutique/`
- `cartes/`
- `exploits/`
- `journal/`
- `rencontres/`

## 4. État courant vérifié — 12 septembre 2026

### Gestion PJ

Le chantier principal en cours est le gestionnaire / interface des quatre PJ.

État constaté dans GitHub :

- Un moteur partagé existe dans `personnages/shared/engine.html`.
- Ce moteur partagé a été construit à partir du modèle Hammerz.
- Lelio et Loris ont été migrés vers cette interface partagée.
- Les portraits des quatre personnages sont présents dans `assets/personnages/` et ont été intégrés à l'interface joueur.
- Une passe récente a restauré une interface riche et pensée pour des joueurs débutants.
- Une passe récente a ajouté la gestion des ressources limitées et des maîtrises sélectionnées.
- Vax possède encore son propre ensemble de fichiers dans `personnages/vax/` ; ne pas supposer qu'il est déjà totalement convergé avec le moteur partagé sans vérification ciblée.

Commits de repère récents :

- `e065df3978d6d86c1aefccd1e0bd7e66855ed82a` — ressources limitées et maîtrises sélectionnées.
- `b5db7f82073d80cfe52364927828f5d86170964f` — restauration du moteur joueur partagé riche.
- `5f8b78e51479a214a1b9edbebe91e768537af101` — portraits intégrés dans Vax et Hammerz.
- `80703eb6cfb1f140ac940b1f9d04bac8e081a01c` — Loris migré vers l'interface partagée.
- `5f890b803d3c925d0ca2aa1e517ac6b7d1f32640` — Lelio migré vers l'interface partagée.
- `858a9029da060b240eb344628d9e0f964068dde9` — création de l'interface partagée depuis Hammerz.
- `dac0e13d8768af2a9d93188c9e2e1ab615797622` — publication de l'application joueur Vax complète.

### Outils MJ déjà publiés

- Gestionnaire de combat actif dans `mj/outils/combat/`.
- Soundboard actif dans `mj/outils/soundboard/`.
- Portail MJ présent.

## 5. Règles de travail pour éviter les chats qui meurent

- Une passe = un objectif principal clairement défini.
- Ne pas relire tous les PJ si un seul est concerné.
- Ne pas relire le combat, le soundboard ou le scénario si la tâche concerne uniquement les fiches PJ.
- Éviter les audits globaux répétés ; préférer des vérifications ciblées.
- Réutiliser les fichiers GitHub comme contexte au lieu de recopier de longs blocs dans le chat.
- Pour une modification importante : lire le fichier cible + éventuellement son commit de référence, modifier, vérifier, pousser.
- Ne pas reconstruire un fichier complet depuis zéro si une correction locale suffit.
- Ne pas créer de fichiers temporaires dans le dépôt sauf nécessité réelle.
- Git sert déjà de journal de versions : ne pas maintenir un deuxième changelog détaillé inutilement.

## 6. Contrat de fin de passe

À la fin d'une passe de développement :

- le code utile est poussé sur GitHub ;
- le chemin du ou des fichiers modifiés est connu ;
- le commit final est indiqué ;
- ce hub n'est mis à jour que si l'architecture, l'état du chantier ou les règles de reprise ont réellement changé.

## 7. Priorité actuelle

Continuer et finaliser le **gestionnaire PJ / interface joueur des quatre personnages** sans repartir de zéro.

Avant de modifier cette partie, vérifier de façon ciblée :

- `personnages/shared/engine.html` ;
- le dossier du PJ concerné ;
- le dernier commit pertinent si une régression est suspectée.

Objectif de convergence : une expérience cohérente, intuitive et fiable pour Hammerz, Lelio, Loris et Vax, tout en conservant les spécificités de chacun.

---

Ce fichier est volontairement compact. S'il devient long, le simplifier plutôt que d'empiler l'historique : l'historique complet existe déjà dans Git.