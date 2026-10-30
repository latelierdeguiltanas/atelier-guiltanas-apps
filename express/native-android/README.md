# Guiltanas Express — notifications Android natives (cadrage validé par les besoins)
Date : 2026-10-30. **Statut : conception, PAS encore fonctionnel / déployé.**

## Pourquoi sortir du Web Push
Les essais réels Samsung Internet 30 sur Android indiquent que :
- consentement site et Android accordés, abonnement Web Push local et Supabase présents ;
- la passerelle accepte le Push, le service worker le traite et `showNotification()` réussit ;
- `getNotifications()` trouve la notification, mais aucune bannière ni entrée d'historique Android n'apparaît.
Ne pas demander aux utilisateurs de vider des caches, de réinstaller ou d'explorer les catégories Android. Ce comportement n'autorise pas à déclarer « notification reçue ».

## Architecture retenue
- **UNE seule application « Guiltanas Express »** avec mode PJ / MJ et sélection de campagne, pas une APK par hub.
- Les hubs Bastide, Nespresso et le hub configurable restent sources de vérité pour leurs messages, boutiques, fiches et accès privés.
- L'interface existante `express/` reste la façade web/PWA sur PC et appareils non natifs.
- L'app Android possède sa propre **intégration native FCM** : `FirebaseMessagingService`, canal de notification système Android, permission `POST_NOTIFICATIONS` demandée UNE SEULE fois lors de l'entrée dans l'app, clic notification → campagne/conversation adéquate.
- L'app mobile peut embarquer l'interface web, mais **une simple TWA/WebView sans FCM natif NE résout PAS ce problème**.
- Réutiliser Supabase pour les événements, la sécurité, le routage et le stockage des périphériques : FCM ne remplace pas la base.
- Après une authentification validée côté serveur (MJ/PJ de chaque campagne), associer le token FCM de l'appareil à un destinataire autorisé. Ne jamais accepter `role=admin` venant seulement d'un appel client.
- Messages FCM minimaux : `event_id`, `campaign_id`, `conversation_id`, pas de contenu privé exposé sur le verrouillage, puis récupération sécurisée après ouverture.
- Idempotence par `event_id`, rotation/retrait des tokens FCM, désabonnement/connexion d'un autre compte, suivi accepté/livré/lu distinct, protection contre les doubles alertes si PWA et app native coexistent.
- Possibilité future d'un repli e-mail **opt-in**, sans nouvelle application, si l'utilisateur a communiqué et confirmé une adresse ; ne jamais inventer ni extraire silencieusement les adresses.
- Ne pas envoyer de messages sous forme de notifications aux joueurs tant que le moteur de messagerie commun et les vérifications de droits ne sont pas prêts.

## Simplicité côté utilisateur
1. Installer **une seule** application officielle.
2. Accepter l'autorisation Android standard de notifications.
3. Choisir/associer sa campagne ou son personnage une fois via son lien ou code déjà existant.
Toutes les inscriptions FCM, changements de token, contrôles et diagnostics sont automatiques. Aucun passage par les réglages de Samsung Internet.

## Coûts vérifiés 2026-10-30
- FCM : service « No-cost » selon https://firebase.google.com/pricing.
- Distribution Android limitée : gratuit mais **maximum 20 appareils**, échanges de liens/QR, destiné aux groupes privés et usage personnel ; **pas** une stratégie de commercialisation généraliste.
- Distribution Android complète : compte développeur Android frais **uniques de 25 USD** (source Google : https://support.google.com/android-developer-console/answer/16640817?hl=en). NE PAS activer sans accord ; respecte zéro service récurrent payant mais pas « zéro euro » absolu.
- iOS : application native distribuée normalement = Apple Developer Program **99 USD/an** (https://developer.apple.com/programs/enroll/). Pour le zéro euro strict : conserver web/PWA avec limitations connues ou alerte e-mail consentie ; ne pas promettre une livraison push native iPhone gratuite et sans manipulation.
- Les autorisations Android (Android 13+) ne peuvent légalement pas être préaccordées ; un dialogue système initial reste nécessaire.

## Dépendance bloquante
Pas de projet Firebase/FCM ni d'identifiants d'envoi vérifiés dans les connexions actuellement autorisées. Il faut d'abord que le propriétaire relie/crée le projet **Firebase** ; les identifiants de service ne doivent JAMAIS être écrits dans GitHub public ni dans le JS du navigateur. Une intégration Firebase est disponible dans ChatGPT et a été proposée au propriétaire.

## Tests d'acceptation obligatoires AVANT publication
1. Installer la même application sur Android Samsung via canal de distribution approuvé.
2. Activer la permission native une fois et vérifier la création du canal système.
3. Envoyer un message joueur, téléphone MJ écran verrouillé et application complètement fermée : notification visible dans la barre ET dans l'historique.
4. Cliquer et arriver dans la bonne conversation, sans fuite de données privées.
5. Faire le même test MJ→PJ, puis plusieurs campagnes sur le même téléphone.
6. Changer de compte, se déconnecter, renouveler token, supprimer un appareil, tester hors réseau/reconnexion.
7. Vérifier les coûts et le respect du nombre maximal d'appareils (si distribution limitée).

## Préservation
NE PAS remplacer les hub Bastide, Nespresso ou générique ni supprimer l'actuel MJ Express/PWA. Conserver une notification web facultative seulement là où elle fonctionne. Aucune création de service payant, ni publication sur les stores sans décision du propriétaire.
