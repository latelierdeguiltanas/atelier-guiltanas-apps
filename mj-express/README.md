# MJ Express — PWA et communications multi-campagnes

## Situation réelle — 29 octobre 2026
- App PWA autonome : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/mj-express/
- Dossier frère du hub Bastide, ID PWA propre, service worker isolé. Le lien ancien redirige.
- **Moteur métier actuel : Bastide uniquement**. Messages et boutique existants, pas de copie des données.
- Web Push : fonction `guiltanas-push`, suivi distinct passerelle/worker/notification. Sans confirmation Android, ne jamais déclarer « reçu ».
- Autorisations notifications : par origine GitHub Pages, et distinctes des permissions Android de Samsung Internet. Ne pas effacer le stockage de l'origine, qui héberge d'autres outils.
- Correction `requestPermission` : attendre la Promise OU le callback ancien ; le précédent code pouvait poursuivre avant la réponse de deux fenêtres d'autorisation.
- Bouton « Réparer les autorisations » : vérifier les notifications du domaine GitHub Pages dans Samsung Internet, puis les notifications Android du navigateur.
- Installation : capturer `beforeinstallprompt` très tôt et appeler `prompt()` lors du tap ; sinon il faut utiliser le menu/installateur du navigateur. JS ne peut pas forcer une installation. Plusieurs PWA au même domaine peuvent entrer en conflit sur certaines versions Chromium (incident signalé octobre 2026), même avec IDs différents.
- Icône : cor enchanté doré validé en PNG 180/192/512.
- Pas de test réel concluant d'installation WebAPK ni notification écran verrouillé sur le Samsung utilisateur à ce jour.

## Évolution multi-hubs — future, non réalisée
Une seule application MJ Express installable, plusieurs espaces MJ choisis dans l'interface : Bastide COF2, Nespresso D&D et Hub configurable. Authentification par campagne via des connecteurs dédiés, couche de messagerie et boutique existante réutilisée, sans deuxième moteur métier ni synchronisation fantôme. Notifications consolidées, toujours avec contrôle d'accès. Le code PWA est autonome, **les données restent dans les hubs qu'il supervise**. Ne pas prétendre que Nespresso ou le générique sont intégrés avant les tests.

PJ Express : idée distincte enregistrée au cockpit, version joueur de la messagerie et des notifications, non développée.

## Décision possible si installation toujours impossible
Une origine HTTPS dédiée à MJ Express (hébergement gratuit distinct ou domaine existant) pourrait résoudre simultanément le conflit d'installation multi-PWA et l'ancien blocage d'autorisation propre à GitHub Pages. Cela exige un hébergement/configuration supplémentaire et éventuellement un mécanisme sûr d'appariement d'accès MJ ; ne pas migrer sans vérifier. Alternativement un APK Android signé exigerait une chaîne de distribution et de mise à jour. Ne pas mettre de clés privées dans un dépôt public.
