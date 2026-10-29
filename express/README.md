# Guiltanas Express · compagnon universel MJ / PJ
État : première version mobile publiée le 29/10/2026.

**Entrée unique destinée aux utilisateurs :** `https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/express/`.

## Déjà en place
- Application PWA autonome `express/`, rôles PJ / MJ, sélection Bastide, Nespresso et hub configurable.
- Intégration **par réutilisation des outils existants**, en vue embarquée : MJ Bastide ouvre MJ Express et sa boutique/messagerie ; PJ sans campagne ouvre la bibliothèque COF2 `fiches-personnages/` ; les liens personnels PJ Bastide/Nespresso/hub configurable peuvent être enregistrés sur l'appareil.
- Les campagnes non encore raccordées à une messagerie Express native sont explicitement marquées « Hub à connecter » ; aucun faux accès ni synchronisation inventée.
- Une seule application PWA installée comme porte d'entrée ; l'ancien `mj-express/` demeure disponible pour les MJ Bastide existants, sans suppression.
- L'authentification reste celle de chaque hub, avec ses accès privés. Le lanceur ne duplique ni messages, ni boutique, ni données de personnages.

## Fiches COF2 indépendantes
- La bibliothèque existante (`fiches-personnages/`) réutilise Forge pour la création et la progression ; version N2 admise dans les données et affichage via `fiche/fiche.js`.
- Nouveau `fiches-personnages/cloud.js` + Edge Function `guiltanas-player-vault` : espace privé créé au moyen d'un code récupérable, à recopier sur un deuxième appareil. Le navigateur conserve la copie locale ; la sauvegarde réseau s'effectue avec un compteur de version et échoue sans écrasement en cas de conflit.
- Stockage privé `public.guiltanas_player_vaults` : RLS sans accès direct public, clé de coffre de 256 bits ; la clé n'est jamais stockée en clair côté serveur.
- La page permet création coffre, liaison d'un appareil, synchronisation manuelle ou déclenchée par les modifications PV/PM/PC/notes/inventaire, avec bandeau discret « ☁ » sur la fiche.
- Les données du niveau 2 **n'ont pas fait l'objet d'un audit complet de règles dans cette livraison**. Les chemins Forge → Validation N2 → Fiche → Deux appareils doivent être testés avec un personnage réel. Les PDF officiels et leurs droits restent des chantiers distincts.

## Notifications
- Les tests serveur récents ont confirmé deux Push acceptés, deux service workers ayant reçu les messages, deux demandes d'affichage réussies. Le téléphone Samsung n'a pas affiché de bannière visible.
- L'ancien MJ Express permet maintenant `getNotifications()` pour mesurer les notifications enregistrées dans le navigateur. Il ne peut pas contourner le blocage de l'affichage Android.
- L'aide Samsung intégrée précise les catégories, les options de pop-up, la veille prolongée et « Ne pas déranger ».
- **Les notifications PJ communes ne sont pas encore déployées** ; elles nécessitent la couche de messagerie partagée et des permissions par campagne.

## Prochaines étapes
1. Validation réelle de la sauvegarde cloud sur téléphone + PC (dont conflit et restauration).
2. Audit des données N2 de Forge dans la fiche interactive et du recalcul des bonus.
3. Connecteurs serveur de messages MJ/PJ par campagne, sans déplacer les historiques ou dupliquer les moteurs ; puis Web Push PJ.
4. Suivi qualité des notifications sur Samsung Android, contrôles d'alertes système.
