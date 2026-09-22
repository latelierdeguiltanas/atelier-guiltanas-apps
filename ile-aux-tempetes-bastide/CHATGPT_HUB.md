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
- `ile-aux-tempetes/joueurs/aventurier.html` : espace personnel partagé des quatre PJ, chargé via `?pj=vax|hammerz|lelio|loris`.
- Depuis l'accueil et l'espace joueurs, cliquer sur un personnage ouvre désormais son espace personnel, pas directement la fiche interactive.
- Cet espace affiche un instantané de la fiche locale, les ressources, la monnaie, les accès campagne et une zone de notes personnelles saisie uniquement par le joueur, enregistrée localement et imprimable/PDF.
- Une barre/carrousel de raccourcis est placée en haut de l'espace personnel : Combat, Tests, Magie, Sac, Boutique, Journal, Cartes, Rencontres, Exploits.
- La navigation basse redondante de cet espace personnel est supprimée dynamiquement.

### Portraits / identité visuelle PJ
- `ile-aux-tempetes/assets/portrait-loader.js` : chargeur partagé des portraits HQ.
- Les portraits HQ remplacent les miniatures compressées sur les pages publiques, espaces personnels, fiches et espace MJ.
- Le chargeur observe aussi les images ajoutées dynamiquement, ce qui corrige le cas de l'espace personnel où le portrait est injecté après chargement.
- L'identité publique `Loris` est désormais affichée comme `Prométhée`; l'id technique historique `loris` est conservé pour ne pas casser les chemins/localStorage.

### Statistiques publiques
- `ile-aux-tempetes/assets/analytics.js` : chargeur GA4 partagé, consentement explicite et suivi des clics.
- Chargé sur l'accueil public, l'espace joueurs, l'espace aventurier, les quatre fiches PJ, la boutique, le journal, les rencontres, les cartes et les exploits.
- Les pages `mj/` / admin ne le chargent pas.
- GA4 actif avec l'ID `G-5T7R70G1ZG` ; collecte temps réel vérifiée le 12/09/2026.

### Gestion des personnages joueurs
- `ile-aux-tempetes/personnages/shared/engine.html` : moteur/interface joueur partagé.
- `ile-aux-tempetes/personnages/shared/rules-audit.js` : correctifs communs de règles D&D 2024 audités.
- `ile-aux-tempetes/personnages/shared/rules-audit-extra.js` : garde-fous ciblés propres aux fiches actuelles.
- `ile-aux-tempetes/personnages/shared/rules-audit-fix.js` : seconde passe de précision + liens profonds `?tab=home|combat|tests|magic|bag`.
- `ile-aux-tempetes/personnages/shared/rules-audit-daily.js` : choix après repos long du Paladin/Rôdeur.
- Chaque PJ charge le même empilement de scripts et fournit ses spécificités dans son `data.js`.

### Boutique
- `ile-aux-tempetes/boutique/index.html` : boutique commune.
- Depuis l'espace personnel, le lien transmet `?pj=<id>&auto=1` ; la boutique tente de sélectionner automatiquement le bon personnage pour éviter de repasser par l'écran de choix.
- Prochaine étape : connexion réelle achat ↔ monnaie ↔ inventaire du PJ.

### Cartes
- `ile-aux-tempetes/cartes/MAPS_SOURCE_AUDIT.md` : audit de la source PDF officielle.
- Cinq cartes repérées : île générale (p.5), Repos du Dragon (p.11), Grottes de Poussemer (p.18), Rose des Vents (p.25), Observatoire de la Falaise (p.30).
- Le PDF est un scan raster (~150 ppp par page) : stratégie retenue = extraction/cadrage fidèle puis couche interactive HTML/SVG, plutôt que redessin si l'objectif est la fidélité.

### Outils MJ
- `ile-aux-tempetes/mj/index.html`
- Combat : `ile-aux-tempetes/mj/outils/combat/`
- Soundboard : `ile-aux-tempetes/mj/outils/soundboard/`
- Scénario : `ile-aux-tempetes/mj/outils/scenario/`

### Autres espaces déjà présents
- `cartes/`
- `exploits/`
- `journal/`
- `rencontres/`

## 4. État courant vérifié — 12 septembre 2026

### Gestion PJ

- Hammerz, Lelio, Prométhée (id technique `loris`) et Vax utilisent tous la même architecture : `index.html` léger + `data.js` spécifique + moteur partagé.
- Audit statique D&D 2024 suffisamment avancé pour l'usage campagne ; pas de campagne de test formelle exigée avant de poursuivre l'écosystème joueur.
- Correctifs majeurs déjà intégrés : magie/slots, réactions hors tour, repos, dés de vie, concentration, préparation Druide, Sorcellerie innée, maîtrises, remplacement de sorts Paladin/Rôdeur, etc.

### Espace joueur vivant

- Hub personnel commun `joueurs/aventurier.html` actif.
- Chaque PJ a son entrée personnalisée avec identité, PV/CA/perception/niveau, monnaie, ressources restantes et raccourcis campagne.
- Le carrousel supérieur ouvre directement les bons onglets de la fiche via `?tab=`.
- La navigation basse redondante est retirée sur l'espace personnel.
- Le cadrage mobile du portrait personnel a été élargi pour respecter le format vertical 3:4 des visuels générés.
- La boutique reçoit automatiquement le PJ courant et tente de contourner son écran de sélection.
- Zone « Mes notes personnelles » volontairement libre : aucune connaissance/psychologie du PJ n'est préremplie.

### Statistiques publiques

- Infrastructure GA4 commune active sur les pages accessibles aux joueurs.
- Suivi : pages vues/sessions, temps d'engagement et événement `ui_click`.
- Consentement local obligatoire avant chargement de Google Analytics.
- Pages MJ/admin volontairement exclues.

## 5. Règles de travail

- Une passe = un objectif principal clairement défini.
- Ne pas relire tout le dépôt par défaut.
- Ne pas toucher à `forge-of-heroes/`.
- GitHub/main est la mémoire longue.
- Pour une modification importante : lire les fichiers directement concernés, modifier, vérifier, pousser.
- Git sert déjà de journal de versions : éviter un second changelog détaillé.

## 6. Priorité actuelle

Faire évoluer l'**espace joueur** en véritable compagnon numérique de campagne, sans automatiser ce que le joueur doit retenir ou interpréter lui-même.

Ordre actuel :
1. connecter boutique ↔ personnage (monnaie + inventaire local) ;
2. extraire et prototyper la carte générale interactive, puis les cartes de lieux ;
3. enrichir l'accueil personnel / « La dernière fois… », rencontres et exploits sans spoiler ;
4. soundboard ensuite.

---

Ce fichier est volontairement compact.