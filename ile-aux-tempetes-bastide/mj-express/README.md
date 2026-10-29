# MJ Express — Notifications / icône officielle (29 octobre 2026)

## Identité visuelle
Icône officielle **cor de guerre enchanté doré** (distinct du cockpit à halo violet), extraite du visuel validé. Formats :
- `icons/mj-express-180.png` : Apple touch icon
- `icons/mj-express-192.png` : PWA Android/favicon/service-worker notification
- `icons/mj-express-512.png` : PWA haute résolution

Le manifeste est versionné et l'interface affiche le nouveau logo. Service worker dédié au sous-dossier `mj-express/`.

## Diagnostic : deux tests à ne pas confondre
1. **Tester l'affichage sur ce téléphone** : appelle directement `ServiceWorkerRegistration.showNotification()` sur le navigateur et affiche une erreur si la permission n'est pas accordée. La réussite de l'appel ne garantit pas que l'OS présente la notification dans sa barre.
2. **Tester l'envoi depuis le serveur** : `guiltanas-push?action=test` publie vers la passerelle du navigateur et crée un reçu `guiltanas_push_tests` protégé par RLS. Le service worker traite le push, tente l'affichage, puis poste un reçu `test-ack` à usage diagnostic avec un secret imprévisible inclus dans le payload chiffré du Push. L'interface consulte `test-status` et distingue acceptation par la passerelle, notification traitée et erreur d'affichage.
3. Si le téléphone verrouillé suspend l'onglet, l'interface relit le reçu au retour à l'écran.

### Point important
L'ancien message « Notification test envoyée » était trompeur : `sendNotification()` ne signifie pas qu'Android l'a affichée. Cela confirme une **acceptation par la passerelle Push**, pas la réception par le navigateur ni la présence de l'icône dans la barre Android.

### Permission Android
Le test d'autorisation s'effectue désormais directement pendant le geste utilisateur, **avant tout await réseau**. Samsung Internet et Chrome supportent Web Push ; leurs permissions Android et les restrictions batterie / données en arrière-plan peuvent influencer la réception.

### Données et sécurité
- La table `guiltanas_push_tests` ne contient aucun message de joueur ; elle garde ID de diagnostic, statut passerelle, indicateurs du service worker et dates.
- La table conserve RLS actif sans lecture publique. L'API de contrôle est accessible seulement au MJ Bastide ; seul le reçu secret du worker peut être posté sans cette clé.
- Les abonnements existants ne sont pas effacés par la mise à jour.
- Aucun service tiers payant ajouté.

## Vérifications faites
- Syntaxe du JS interface et du service worker validée.
- Manifeste et trois images PNG vérifiés sur GitHub ; GitHub Pages publié avec succès.
- Fonction Supabase `guiltanas-push` ACTIVE, table test RLS, aucun test réel reçu avant l'essai utilisateur.
- **Pas de test réel sur Android écran verrouillé** : il faut un essai sur l'appareil.
