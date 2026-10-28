# Centre de synchronisation — Bastide / écosystème, v1
Page : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/centre-synchronisation/

## État de la première version
- Indépendant de MJ Express, accessible depuis la Table MJ et depuis MJ Express.
- Vérifie sur **l'appareil qui ouvre la page** : accès privé MJ Bastide, API de messages, statut boutique, révision du combat partagé, révision de bibliothèque de combat.
- Inspecte localement IndexedDB `guiltanas-hub-configurable-v2` (si le navigateur permet une découverte sans création de base), compte les modifications en attente et compare sans écriture les révisions avec l'espace Supabase via `hcfg_link_api`.
- Indique explicitement quand le Soundboard est local ou quand un composant ne peut pas être vérifié.
- Un appareil/sessions de navigateur est volontairement nommé, reporté via `guiltanas-sync` après authentification MJ Bastide, et montré dans le tableau de bord avec sa date de dernier passage.
- `guiltanas_sync_devices` est protégé par RLS, avec les accès publics révoqués. Ne stocke ni les clés privées, ni les messages, ni les fichiers de personnage. Une Edge Function authentifie les rapports.
- Pas de rapport de présence des joueurs sans instrumentation et autorisation ; pas de prétendue comparaison des fichiers locaux des autres appareils.
- Les 2 profils Windows (Atelier et JDR) possèdent normalement des stocks locaux et clés distincts, ils doivent ouvrir chacun le centre pour être répertoriés.
- La création d'un rapport ne modifie ni la campagne ni son état de combat.

## Source de vérité
- Bastide : messages, boutique, état partagé sur Supabase ; cache local non équivalent.
- Gestionnaire : compare ici la révision **serveur**, pas les modifications locales cachées dans l'outil. Synchronisation non garantie sans lien valide.
- Hub configurable : un code G2 portable représente le lien MJ existant, permet de rouvrir **l'état courant** dans le cloud, et ne restaure pas une révision historique.
- Soundboard : fichiers audio pouvant rester seulement dans le navigateur local.

## Limites et évolutions
- Réception de Web Push et installation PWA sur mobile : à tester physiquement.
- Le centre ne surveille pas les appareils éteints ou n'ayant jamais ouvert le panneau ; dernier rapport ≠ connecté maintenant.
- Les diagnostics génériques de MJ tiers ne sont pas encore inscrits dans un registre mutualisé (seul le MJ Bastide a accès au registre inter-appareils pour le moment).
- Future version : modules de diagnostic par outil, remontée explicite de la file offline du gestionnaire, versions historiques chiffrées du hub générique, contrôle guidé des conflits et inscription opt-in PJ.
- **Tests réels navigateur nécessaires** : 2 profils Windows + Android, accès distant, sauvegarde cloud, reprise du code G2 et contrôle des révisions.
