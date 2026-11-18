# Connexion Battle.net d'Atelier WoW

## État du 18 novembre 2026
L'interface mobile contient un écran de connexion Battle.net, puis une sélection de personnages WoW Forever. Le code du serveur OAuth est versionné sous `backend/atelierwow-bnet/index.ts`.

**Connexion NON ENCORE ACTIVE.** Il manque un client développeur Blizzard et un environnement backend isolé. Ce dépôt public ne contient aucun secret.

## Pour activer
1. Dans le [portail Blizzard développeur](https://develop.battle.net/access/clients), créer un client OAuth pour *Atelier WoW*. Autorisations attendues : `openid` et `wow.profile`.
2. Créer un **projet Supabase distinct** des hubs JDR, avec les fonctionnalités Edge Functions et Postgres.
3. Exécuter `backend/schema.sql` dans ce nouveau projet, vérifier que la table a bien RLS et n'a aucun accès public.
4. Déployer la fonction `backend/atelierwow-bnet/index.ts` sous le nom `atelierwow-bnet`, avec `verify_jwt = false`. La fonction valide elle-même les sessions privées, seules les routes OAuth sont publiques.
5. Déclarer comme redirect URI dans Blizzard (exemple) : `https://PROJECT_REF.supabase.co/functions/v1/atelierwow-bnet?action=callback`. Cette URL doit correspondre **exactement** à `ATW_REDIRECT_URI`.
6. Configurer **uniquement en secrets côté serveur** :

| Secret | Valeur |
|---|---|
| `ATW_BLIZZARD_CLIENT_ID` | identifiant du client créé chez Blizzard |
| `ATW_BLIZZARD_CLIENT_SECRET` | secret du client, à ne jamais placer dans GitHub |
| `ATW_REDIRECT_URI` | URL enregistrée chez Blizzard, avec `?action=callback` |
| `ATW_FRONTEND_URL` | `https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/atelier-wow/` |
| `ATW_TOKEN_ENCRYPT_KEY` | 32 octets aléatoires, encodés en base64, **confidentiels** |
| `SUPABASE_URL` | URL du nouveau projet |
| `SUPABASE_SERVICE_ROLE_KEY` | clé serveur du nouveau projet, **jamais dans le frontend** |

7. Dans `atelier-wow/blizzard-config.json`, renseigner seulement l'URL publique du backend (ce n'est **pas** un secret) :
`{"backendUrl":"https://PROJECT_REF.supabase.co/functions/v1/atelierwow-bnet"}`.

## Parcours utilisateur
- Au démarrage : **Se connecter avec Battle.net**.
- Redirection officielle Blizzard (l'app ne lit jamais le mot de passe).
- Retour à l'application avec **code temporaire à usage unique**.
- Échange contre une session temporaire propre à Atelier WoW ; le jeton Blizzard reste chiffré côté serveur.
- Récupération du profil WoW Forever EU via `/profile/user/wow?namespace=profile-forever-eu`, y compris les personnages sous le niveau 10.
- Affichage des personnages, cases à cocher et **validation** ; les fiches locales existantes et données d'addon sont préservées.

## Limitations à conserver visiblement
- Les URL de profil Forever ne sont pas encore documentées officiellement : elles sont issues d'observations communautaires, susceptibles d'évoluer.
- L'API Blizzard ne donne pas les stocks exhaustifs des banques, sacs et courriers. L'addon reste nécessaire.
- Aucun test d'authentification réelle n'a pu être réalisé sans les identifiants développeur et le backend.
- Session temporaire conservée dans le navigateur pour l'onglet actif ; nouvelle connexion requise après expiration.
- L'API des personnages renvoie les données connues de Blizzard, susceptibles d'être décalées par rapport au jeu.
- Éviter d'exposer un code d'échange dans des logs ou des services analytiques. Le code présent utilise le fragment URL et le retire avant tout accès API.
- Ajouter des limites de débit, purge des sessions expirées et validation dynamique des domaines de retour avant la mise en production à grande échelle.

## À tester avant d'annoncer « opérationnel »
- [ ] OAuth vrai compte EU, réussite, refus, annulation et code expiré.
- [ ] Sélection de Guiltanas et Krisania niveau < 10.
- [ ] Déconnexion côté serveur et expiration de session.
- [ ] Absence de fuite de jeton Blizzard ou de clé Supabase dans GitHub et le navigateur.
- [ ] CORS exact GitHub Pages, redirection Blizzard autorisée.
- [ ] Relevé addon qui ne remplace pas de façon destructive les données Battle.net.
