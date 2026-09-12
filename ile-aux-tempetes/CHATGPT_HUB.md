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

### Statistiques publiques
- `ile-aux-tempetes/assets/analytics.js` : chargeur GA4 partagé, consentement explicite et suivi des clics.
- Chargé sur l'accueil public, l'espace joueurs, les quatre fiches PJ, la boutique, le journal, les rencontres, les cartes et les exploits.
- Les pages `mj/` / admin ne le chargent pas.
- Collecte inactive tant qu'un identifiant GA4 `G-XXXXXXXXXX` réel n'est pas renseigné dans `IAT_GA_MEASUREMENT_ID`.

### Gestion des personnages joueurs
- `ile-aux-tempetes/personnages/shared/engine.html` : moteur/interface joueur partagé.
- `ile-aux-tempetes/personnages/shared/rules-audit.js` : correctifs communs de règles D&D 2024 audités.
- `ile-aux-tempetes/personnages/shared/rules-audit-extra.js` : garde-fous ciblés propres aux fiches actuelles.
- `ile-aux-tempetes/personnages/shared/rules-audit-fix.js` : seconde passe de précision + branchement analytics commun aux 4 fiches.
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

- Hammerz, Lelio, Loris et Vax utilisent tous la même architecture : `index.html` léger + `data.js` spécifique + moteur partagé.
- Les anciennes charges compressées de Hammerz et Vax restent seulement comme archives.
- Les portraits des quatre personnages sont intégrés.
- Audit statique D&D 2024 en cours sur les quatre fiches.
- Correctifs déjà appliqués : limite d'un emplacement de sort dépensé par tour, gestion correcte des réactions lancées pendant le tour d'une autre créature, repos long conforme, repos court pour tous les PJ avec dé de vie, concentration après dégâts et à 0 PV, préparation complète du Druide après repos long, Sorcellerie innée de Loris active et suivie.
- Garde-fous ciblés : descriptions des maîtrises, don Guérisseur de Hammerz masqué sans trousse de soins, rappel du +1d6 de Marque du chasseur sur les attaques de Vax.
- Reste à faire avant validation complète : audit final des données et interactions restantes, notamment préparation/remplacement de sorts propres au Paladin et au Rôdeur, puis test navigateur/clic réel.

### Statistiques publiques

- Infrastructure GA4 commune ajoutée aux pages accessibles aux joueurs.
- Suivi prévu : pages vues/sessions via GA4, temps d'engagement GA4, événement `ui_click` avec page, type d'élément, libellé et lien.
- Consentement local obligatoire avant chargement de Google Analytics.
- Pages MJ/admin volontairement exclues.
- Il reste uniquement à renseigner l'identifiant de mesure GA4 réel pour démarrer la collecte.

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

Architecture commune : moteur `personnages/shared/engine.html` + correctifs `rules-audit*.js` + un `data.js` par personnage.

Objectif immédiat : terminer l'audit statique des quatre PJ, corriger les défauts objectifs restants, puis réaliser un test navigateur/clic final avant de passer au soundboard.

---

Ce fichier est volontairement compact. S'il devient long, le simplifier plutôt que d'empiler l'historique : l'historique complet existe déjà dans Git.