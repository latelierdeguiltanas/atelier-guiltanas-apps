# Icônes et raccourcis — 16 octobre 2026

Composant commun install.js / install.css, chargé en defer dans les pages HTML. Icônes originales SVG et déclinaisons PNG 180/192/512. Palette forêt/or, symboles propres aux familles. Manifest statique par page : démarrage sur son chemin public sans query ni fragment, identifiant distinct par chemin. Les accès restent soumis aux mécanismes existants de chaque outil.

Bouton dans le flux en haut, pas de menu flottant en bas. beforeinstallprompt déclenché uniquement sur clic et consommé une seule fois ; appinstalled et mode standalone masquent le bouton. Sans événement natif : dialog avec aide Samsung Internet, iOS/Safari, Android et ordinateur. Pas de service worker ajouté ni de cache modifié. Aucune promesse de fonctionnement hors ligne. Aucun lien, jeton ou contenu personnel transmis ou enregistré par le composant. Pas de bouton dans les iframes pour éviter les doublons.

Périmètre : toutes les 69 pages HTML existantes de atelier-guiltanas-apps, Soundboard_final (Index.html et index.html) et soundboard. Le dépôt index ne contient aucun fichier sur sa branche main ; aucune application à modifier. Cette demande autorise explicitement les ajouts visuels aussi à Forge et au hub D&D ; code métier conservé.

Vérifications sans navigateur : comparaison du code hors déclarations icônes et bloc ajouté ; existence des chemins ; manifests sans paramètres privés ; dimensions PNG ; événements natifs/refus/acceptation/mode standalone/aides par appareil en VM. Le comportement d’ajout réel reste à vérifier sur téléphone par Math. Recréer les anciens raccourcis peut être nécessaire pour rafraîchir leurs icônes.

Publication : 66 pages du dépôt principal prêtes. Les trois pages des deux anciens dépôts soundboard et Soundboard_final sont préparées mais non publiées : GitHub retourne 403 Resource not accessible by integration sur les écritures. Aucun accès n’a été remplacé.
