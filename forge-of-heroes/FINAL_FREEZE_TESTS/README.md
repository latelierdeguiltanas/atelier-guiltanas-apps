# N1 — Final Precision Gate

Cette barrière combine le fuzz stratifié SHA-locké et des contrats mécaniques précis. Le Product Master a été corrigé uniquement après reproduction d’un résidu de choix legacy, puis le fuzz accepté a été rejoué intégralement.

Depuis la racine du ZIP :

1. `node FINAL_FREEZE_TESTS/trustworthy_massive_runner.js`
2. `node FINAL_FREEZE_TESTS/precision_transition_runner.js`
3. `node FINAL_FREEZE_TESTS/manual_scenario_assertions.js`
4. `node FINAL_FREEZE_TESTS/finalize_precision_gate.js`

`certification_evaluators.js` est partagé par le runner et les sabotages anti-faux-vert. Il calcule les chemins modifiés, les changements attendus manquants, les changements inattendus, les valeurs exactes, l’égalité A→B→A, les résidus ghost et la parité stricte des raisons de rejet.

Les anciennes preuves volumétriques de modification/A-B-A et l’ancien ghost par copie globale ne participent plus au Freeze Gate. Chromium reste volontairement `UNAVAILABLE`; les 12 tests Math restent requis.
