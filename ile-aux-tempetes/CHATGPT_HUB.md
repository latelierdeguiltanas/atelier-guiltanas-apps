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
- Chaque PJ charge ce moteur via son `index.html` et fournit ses spécificités dans son `data.js`.
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
- Hammerz, Lelio, Loris et Vax utilisent désormais tous la même architecture : `index.html` léger + `data.js` spécifique + moteur partagé.
- Les anciennes charges compressées de Hammerz et Vax peuvent rester en archive dans leurs dossiers mais ne sont plus la voie active de chargement.
- Les portraits des quatre personnages sont présents dans `assets/personnages/` et intégrés à l'interface joueur.
- Une passe récente a restauré une interface riche et pensée pour des joueurs débutants.
- Une passe récente a ajouté la gestion des ressources limitées et des maîtrises sélectionnées.
- Prochaine étape : audit statique complet puis test navigateur réel des interactions des quatre fiches.

Commits de repère récents :

- `fb010a15550afa55acfee50dd74335d45c182277` — Vax basculé sur le moteur partagé.
- `b52f32b0903703a025d891122b5b4da54bc9de44` — Hammerz basculé sur le moteur partagé.
- `ce99eb1320da9bb09e46c56cffcf8d563f5bd27b` — données Vax pour le moteur partagé.
- `dff646de80cb22a58bc54fa0e22f8f584dbf56c2` — données Hammerz pour le moteur partagé.
- `e065df3978d6d86c1aefccd1e0bd7e66855ed82a` — ressources limitées et maîtrises sélectionnées.
- `b5db7f82073d80cfe52364927828f5d86170964f` — restauration du moteur joueur partagé riche.
- `80703eb6cfb1f140ac940b1f9d04bac8e081a01c` — Loris migré vers l'interface partagée.
- `5f890b803d3c925d0ca2aa1e517ac6b7d1f32640` — Lelio migré vers l'interface partagée.

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

Finaliser le **gestionnaire PJ / interface joueur des quatre personnages**.

Architecture désormais commune : moteur `personnages/shared/engine.html` + un `data.js` par personnage.

Objectif immédiat : vérifier les données D&D 2024 et toute la logique interactive de chaque PJ, corriger les défauts objectifs, puis réaliser un test navigateur/clic final.

---

Ce fichier est volontairement compact. S'il devient long, le simplifier plutôt que d'empiler l'historique : l'historique complet existe déjà dans Git.