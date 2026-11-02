# Vérifications Nespresso

Les tests ne créent aucune session utilisateur et ne publient aucun combat réel.

- `node --disable-warning=ExperimentalWarning ile-aux-tempetes/tests/battle-server.cjs` : traitement du service, rôles et données filtrées.
- `ile-aux-tempetes/tests/battle.sql` : à exécuter via SQL dans une transaction annulée ; vérifie publications, masquage, idempotence et conflits.
- `npm install --prefix /tmp/nespresso-dom --no-audit --no-fund jsdom@26.1.0`, puis `node ile-aux-tempetes/tests/interface-connections.cjs` : DOM simulé, boutique réelle et moteur V18 complet. `NESPRESSO_JSDOM` peut désigner une autre installation de jsdom. Aucune navigation de navigateur, aucune clé réelle.
- Les tests existants `economy-api.cjs`, `automatic-import.cjs`, `supervision.cjs` restent applicables.

Source de restauration V18 : fichier original fourni au projet, contrôlé par SHA-256 dans CHATGPT_HUB.md. Les formules, données, sauvegardes et scripts internes de ce fichier ne sont pas réécrits.
