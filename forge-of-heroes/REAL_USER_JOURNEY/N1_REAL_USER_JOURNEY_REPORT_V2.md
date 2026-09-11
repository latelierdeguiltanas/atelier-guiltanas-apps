FORGE N1 REAL USER JOURNEY ACCEPTANCE :
BLOCKED

HTTPS TEST DEPLOYMENT :
PASS

TEST URL :
https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/forge-of-heroes/

BROWSER EXECUTED :
YES

FIRST PASS :
0 / 12

ISSUES FOUND :
4

UI BLOCKERS :
1 — la session de navigateur cloud a cessé de répondre après le scénario 02 (timeouts CDP persistants malgré reconnexion).

WIRING BUGS :
1 — le paquetage Voleur annonce une armure prévue par le profil mais le récapitulatif affiche « Aucune ».

VALIDATION BUGS :
0 observé ; le scénario 02 a bien bloqué +5 et une troisième faiblesse.

STATE PERSISTENCE BUGS :
0 observé sur le scénario 01 ; sauvegarde et reprise ont conservé les valeurs affichées.

GHOST STATE BUGS :
NOT TESTED

ENGINE BUGS :
0 démontré. La divergence du scénario 01 avec son manuel doit être qualifiée canoniquement avant correction.

DISPLAY BUGS :
1 — la section Identité du récapitulatif n’affiche pas les valeurs Peuple/Profil/Famille alors que le panneau latéral les connaît.

SAVE LOAD BUGS :
0 observé sur le scénario 01.

CORRECTIONS APPLIED :
0 — premier passage interrompu ; aucune modification du Product Master sans cause racine démontrée.

FINAL RETEST :
0 / 12

N1 READY FOR MATH SMOKE TEST :
NO

INITIAL PRODUCT SHA :
565cc873e6429ce524fcea371d0a3fe11fe5ab96e6757e4177d4f7d8433b5559

PRODUCT MODIFIED :
NO

FINAL PRODUCT SHA :
565cc873e6429ce524fcea371d0a3fe11fe5ab96e6757e4177d4f7d8433b5559

## État par scénario

| Test | Navigateur | Résultat |
|---|---:|---|
| MANUAL_01 | YES | FAIL — attendu PV 9 / PC 3 / cuir simple ; observé PV 8 / PC 4 / aucune armure. Sauvegarde/reprise exécutée. |
| MANUAL_02 | YES | FAIL — PV 9, DEF 14, INIT 11, PC 3 et blocages +5/troisième faiblesse conformes ; armure affichée « Aucune » au lieu du cuir simple attendu. |
| MANUAL_03 à MANUAL_12 | NO | NOT EXECUTED — session navigateur devenue non réactive. |

## Déploiement vérifié

- Workflow : Deploy GitHub Pages
- Run : 34582858386, tentative 2
- Conclusion : success
- Commit déployé : fbef67d7561f47b7fef9f1fe5239bb139b8dd06b
- URL réellement ouverte : https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/forge-of-heroes/
