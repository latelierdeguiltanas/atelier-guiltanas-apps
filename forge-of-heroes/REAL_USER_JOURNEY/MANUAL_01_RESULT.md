# MANUAL_01 — Résultat navigateur HTTPS

- STATUS : FAIL
- BROWSER_EXECUTED : YES
- START STATE : Nouvelle création classique, nom Athéna Manual 01.
- ACTIONS PERFORMED : Standard → Humain → Voleur → série Expert attribuée FOR 2, AGI 1, CON 0, PER 1, INT 3, VOL 0, CHA -1 → Voie de l’assassin + Voie de l’aventurier → paquetage standard → Résumé → Sauvegarder dans Mes héros → Mes héros → Ouvrir.
- EXPECTED : PV 9 ; DEF 13 ; INIT 11 ; PC 3 ; PM 0 ; cuir simple.
- OBSERVED : PV 8 ; DEF 13 ; INIT 11 ; PC 4 ; PM 0 ; armure « Aucune ».
- NEGATIVE CHECKS : Continuer était bien verrouillé avant saisie du nom.
- FINAL VALUES : FOR +2, AGI +1, CON +0, PER +1, INT +3, VOL +0, CHA +0 ; PV 8 ; DEF 13 ; INIT 11 ; PC 4 ; PM 0.
- ISSUES : divergence avec le manuel sur PV/PC ; paquetage annoncé avec armure mais résumé « Aucune » ; champs Peuple/Profil/Famille vides dans la carte Identité.
- CORRECTIONS : aucune avant qualification canonique et fin du premier passage.
- RETEST STATUS : sauvegarde/reprise exécutée, valeurs restaurées identiques ; scénario reste FAIL.
