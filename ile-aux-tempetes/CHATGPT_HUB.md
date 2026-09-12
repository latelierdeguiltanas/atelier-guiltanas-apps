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
- GA4 actif avec l'ID `G-5T7R70G1ZG` ; collecte temps réel vérifiée le 12/09/2026.

### Gestion des personnages joueurs
- `ile-aux-tempetes/personnages/shared/engine.html` : moteur/interface joueur partagé.
- `ile-aux-tempetes/personnages/shared/rules-audit.js` : correctifs communs de règles D&D 2024 audités.
- `ile-aux-tempetes/personnages/shared/rules-audit-extra.js` : garde-fous ciblés propres aux fiches actuelles.
- `ile-aux-tempetes/personnages/shared/rules-audit-fix.js` : seconde passe de précision.
- `ile-aux-tempetes/personnages/shared/rules-audit-daily.js` : choix après repos long du Paladin/Rôdeur (1 remplacement de sort + changement des 2 maîtrises d'armes).
- Chaque PJ charge le même empilement de scripts ; `rules-audit-daily.js` est sans effet sur Lelio/Loris.
- Chaque PJ fournit ses spécificités dans son `data.js`.
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
- Hammerz et Vax : après repos long, possibilité réelle de remplacer un seul sort de classe préparé et de rechoisir leurs deux maîtrises d'armes ; listes officielles N1 intégrées dans le moteur partagé pour ces choix.
- Garde-fous ciblés : descriptions des maîtrises, don Guérisseur de Hammerz masqué sans trousse de soins, rappel du +1d6 de Marque du chasseur sur les attaques de Vax.
- Reste à faire avant validation complète : audit final des données/effets spécifiques et cohérence UX, puis test navigateur/clic réel sur les quatre fiches.

### Statistiques publiques

- Infrastructure GA4 commune active sur les pages accessibles aux joueurs.
- Suivi : pages vues/sessions, temps d'engagement et événement `ui_click` avec page, type d'élément, libellé et lien.
- Consentement local obligatoire avant chargement de Google Analytics.
- Pages MJ/admin volontairement exclues.
- Temps réel confirmé fonctionnel avec plusieurs pages et utilisateurs actifs visibles dans GA4.

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

Objectif immédiat : terminer l'audit statique des effets/données spécifiques, vérifier la cohérence UX, puis réaliser un test navigateur/clic final avant de passer au soundboard.

---

Ce fichier est volontairement compact. S'il devient long, le simplifier plutôt que d'empiler l'historique : l'historique complet existe déjà dans Git.