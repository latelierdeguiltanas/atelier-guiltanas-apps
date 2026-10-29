# Protocole de continuité des interventions — Atelier de Guiltanas
Version initiale : 29 octobre 2026. Source canonique : le document Drive « 00 — MÉTHODE GLOBALE DE TRAVAIL — PROJETS » et l’état Drive de chaque projet.

## Pourquoi
Les anciens chats peuvent se saturer, s'interrompre ou devenir inaccessibles. La réponse ChatGPT n'est jamais la seule preuve de travail. Le dossier Drive du projet et les commits/tests constituent la passation. Le Copilote affiche le dernier jalon connu et **n'affirme pas qu'un chat est planté** seulement parce qu'aucune modification récente n'existe.

## Règles à appliquer à CHAQUE intervention de travail
1. **Avant toute modification** : lire les documents canoniques Drive + dépôt GitHub du projet ; consigner dans l'état Drive le périmètre, les résultats attendus, l'identifiant du projet, le statut « EN COURS », l'heure et les jalons prévus. Si les outils Supabase le permettent, ouvrir une entrée `guiltanas_work_runs` avec identifiant unique ; un chat Work n'a pas nécessairement de lien de conversation connu et il ne faut pas en inventer.
2. **Après chaque lot significatif** : sauvegarder le code/test puis ajouter dans Drive le commit, l'état « FAIT / PARTIEL / ÉCHEC », la preuve vérifiée, les écarts, les risques et le lot suivant. Refléter le jalon dans `guiltanas_work_runs` quand l'accès est disponible. Ne pas « minuter » artificiellement les jalons : seul un travail réellement enregistré compte.
3. **Avant la réponse finale** : consigner dans Drive ce qui est livré / non livré, les tests de code vs tests au clic, la dernière version et les travaux restants. Clôturer le journal de l'intervention en « TERMINÉ » ou « PARTIEL ». Un résultat sans preuve est « À VÉRIFIER », pas « validé ».
4. **Après interruption** : reprendre depuis les preuves Drive/GitHub et le dernier jalon, sans rejouer aveuglément tous les tests ni pousser du code deux fois. S'il n'existe pas d'état final, marquer « REPRISE À VÉRIFIER » uniquement après vérification des journaux, pas « bug confirmé ».

## Sémantique des indicateurs
- `en_cours` : intention ou jalon explicitement enregistrés.
- `en_attente` : une autorisation, information ou action est attendue, pas une panne.
- `partiel` : travail inachevé dont le résultat intermédiaire est conservé.
- `termine` : dernier résultat enregistré et documenté ; **ne signifie pas** que tout le projet est validé.
- `reconstitue` : traces anciennes retrouvées après coup ; impossible de certifier un cycle de chat ou une date de lancement.
- Intervention ouverte sans jalon > 6 h : « aucun jalon récent ».
- Intervention ouverte sans jalon > 24 h : « reprise à vérifier » ; ce **n'est pas** un diagnostic de plantage, ni un seuil garanti pour la durée d'une tâche Work.

## Où est stocké quoi ?
- **Drive privé** : objectifs, décisions, bugs et preuves de validation — vérité éditoriale.
- **GitHub** : code, PR, commits et tests automatisés.
- **Supabase privé** `guiltanas_work_runs` : journal structuré de présentation Copilote ; accès via fonction propriétaire `guiltanas-chat-inventory?action=work-runs`.
- **Copilote** : interface de lecture synthétique et accès aux preuves, sans secrète dans le dépôt public.
- **ChatGPT Work** : peut poursuivre de manière distante ou attendre un accord sans nouvelle écriture GitHub. Aucun connecteur dans cette session ne peut lire les processus internes des autres chats.

## Pour reprendre un projet
Depuis la fiche Projet → « Reprendre dans ChatGPT », utiliser un contexte de reprise comprenant ce protocole, l’identifiant de projet, l’état Drive et les dernières preuves GitHub. Les nouveaux chats doivent suivre le protocole eux-mêmes ; **la présence de ce fichier ne force pas les autres conversations déjà ouvertes à l'appliquer rétroactivement**.

## Diagnostic navigateur en cas de blocage du chat
Le fichier HAR et la console du navigateur ChatGPT peuvent aider à identifier un code HTTP en erreur, un WebSocket coupé ou une extension bloquante **seulement s'ils sont collectés avec une session autorisée**. Le Copilote GitHub Pages est d'une autre origine et ne peut pas lire la console, le réseau ou les cookies de chatgpt.com. Ne jamais aspirer les cookies ou les HAR contenant jetons/mots de passe. Passer au support OpenAI pour un vrai incident de service.
