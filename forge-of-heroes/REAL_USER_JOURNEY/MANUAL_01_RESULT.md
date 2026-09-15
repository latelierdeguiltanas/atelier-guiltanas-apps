# MANUAL_01 — Résultat navigateur HTTPS

- STATUS : PASS
- BROWSER_EXECUTED : YES
- START STATE : Nouvelle création classique, nom Athéna Manual 01.
- ACTIONS PERFORMED : Standard → Humain → Voleur → série Expert attribuée FOR 2, AGI 1, CON 0, PER 1, INT 3, VOL 0, CHA -1 → bonus humain +1 CON → Voie de l’assassin + Voie de l’aventurier → paquetage standard → Résumé → Sauvegarder dans Mes héros → Mes héros → Ouvrir.
- EXPECTED : PV 9 ; DEF 13 ; INIT 11 ; PC 3 ; PM 0 ; cuir simple.
- OBSERVED : PV 9 ; DEF 13 ; INIT 11 ; PC 3 ; PM 0 ; cuir simple.
- NEGATIVE CHECKS : Continuer était bien verrouillé avant saisie du nom.
- FINAL VALUES : FOR +2, AGI +1, CON +1, PER +1, INT +3, VOL +0, CHA -1 ; PV 9 ; DEF 13 ; INIT 11 ; PC 3 ; PM 0.
- ISSUES : aucun défaut produit résiduel observé. Le scénario omettait le choix du bonus humain alors que ses valeurs attendues imposaient +1 CON.
- CORRECTIONS : scénario complété avec le choix +1 CON ; aperçu équipement corrigé pour afficher le nom canonique de l’armure.
- RETEST STATUS : PASS — identité, valeurs, voies, capacités, attaques et équipement restaurés à l’identique après sauvegarde/reprise.
