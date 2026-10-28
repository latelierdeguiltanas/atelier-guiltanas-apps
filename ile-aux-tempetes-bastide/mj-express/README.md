# MJ Express — état au 28 octobre 2026

## But
Compagnon MJ **entre séances**, mobile-first, même moteur de messages et de boutique que la Bastide, sans dupliquer l'état. Socle de Web Push générique prévu pour réutilisation future sur Nespresso / hub configurable.

## En production (première intégration)
- `/ile-aux-tempetes-bastide/mj-express/` — PWA autonome, manifeste et service worker dédié.
- Bouton d'accès depuis `/ile-aux-tempetes-bastide/mj/`.
- Boîte de réception des six personnages avec sélection rapide et réponse privée.
- Message collectif : boucle d'envois **privés distincts**, avec confirmation préalable. En cas d'interruption, ne pas réenvoyer les précédents sans vérifier.
- Boutique : consultation d'état, ouverture/fermeture confirmées par Supabase, renvoi vers l'éditeur existant (articles et stock) et le suivi de négociations/vols.
- Diagnostic d'accès MJ, de messages, du combat publié et du service push sur l'appareil courant.
- Abonnement Web Push optionnel, test push et désabonnement sur l'appareil courant. Liste des appareils abonnés à ce compte.

## Backend push
- Trois tables distinctes `public.guiltanas_push_keys`, `guiltanas_push_subscriptions`, `guiltanas_push_dispatches` avec RLS et aucun accès direct aux rôles publics; service role serveur uniquement.
- Edge Function `guiltanas-push` authentifie les liens Bastide existants par hash SHA-256 côté serveur, n'enregistre que ses abonnements, et ne déclenche que ses messages récents. Secret VAPID privé stocké côté serveur, jamais distribué aux clients.
- Dispatch depuis MJ Express ou l'ancienne page de chat, **après confirmation de sauvegarde du message**. Anti-doublon sur `message_id`.
- Les messages restent la source de vérité même si un push est refusé / perdu.
- Aucune souscription tiers payante ajoutée. Projet existant Supabase Free, sous réserve de ses quotas.
- Les notifications iOS exigent l'ajout du site à l'écran d'accueil, une autorisation explicite et compatibilité du navigateur / OS.
- La réception en conditions réelles sur téléphone verrouillé et l'installation sur Android / PC restent **à valider manuellement**. Une fonction déployée n'est pas un test de livraison de push.
- Les autres outils devront intégrer l'appel de dispatch côté serveur ou via l'API commune pour bénéficier de la même fiabilité. Version actuelle : flux de messages Bastide intégrés, pas de garantie universelle sur tous les points d'entrée.

## Synchronisation — source de vérité
| Outil | Serveur | Stockage local | Contrôle à faire |
| --- | --- | --- | --- |
| Bastide — messages, boutique, fiches | Supabase via Edge Functions | Liens d'accès et caches navigateur | Test de lecture/écriture multi-session |
| Bastide — combat partagé | `bastide-session` / table `bastide_battle` | Cache du gestionnaire | Vérifier accès et révision |
| Gestionnaire générique COF2 | Stockage distant par espace avec versionnement | Cache local par UUID d'espace | Comparer révisions; traiter conflits |
| Hub configurable bêta 2 | `hcfg_private` via RPC `hcfg_link_api` | IndexedDB avec file offline | Ne PAS se fier aux anciennes tables `public.hcfg_*` pour les statistiques d'usage |
| Soundboard | non garanti synchrone pour les fichiers audio | Sons locaux | Diagnostiquer par appareil |

### Important
Une session de navigateur Windows et une autre session Windows n'ont **pas** le même localStorage / IndexedDB. Le téléphone a encore un troisième espace local. Être connecté à Supabase ne garantit pas que tous les caches locaux, audio, clés d'accès ou modifications hors ligne soient présents à l'identique.

Le panneau 'Connexions' affiche une série de tests **sur l'appareil qui l'ouvre**, pas une carte de présence multi-appareils fiable. Les données locales des autres appareils ne sont pas détectables sans un agent autorisé de contrôle/signalement.

## Suite prévue — Centre de synchronisation indépendant
- Enregistrement volontaire de chaque appareil/session, nom donné par le propriétaire (Téléphone MJ, PC Atelier, PC JDR), dernier contact.
- Pour chaque outil, statut distinct : accès présent / serveur joint / dernière révision publiée / données locales non envoyées / cache uniquement local.
- Ne montrer 'à jour' que si la révision locale a été comparée à la révision serveur, sinon 'non vérifié' ou 'hors ligne'.
- Contrôle du hub configurable dans sa table/schéma actif, jamais uniquement par les anciennes `hcfg_campaigns`.
- Aucune exposition au MJ des adresses privées, secrets ou détails des appareils de joueurs sans leur accord ; ne pas présumer qu'un joueur est en ligne parce qu'il a ouvert un lien dans le passé.

## Vérifications réalisées
- Dépôt et données Supabase examinés, tables push créées, RLS appliqué, fonction Edge active.
- Syntaxe JS de MJ Express, du SW et de la page des messages vérifiée via parseur JS.
- **Tests réels de navigateur, permissions OS, alertes écran verrouillé, exécution Edge d'envoi, et gestion du conflit multi-appareils NON ENCORE VALIDÉS**.
