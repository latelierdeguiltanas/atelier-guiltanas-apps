# MANUAL_05 — Arme à répétition R2

## Objectif

Tester réellement une, deux puis trois armes et la capacité du chargeur.

## Clics et construction exacte

1. Choisis le mode Standard.
2. Saisis un nom et choisis le peuple HUMAIN.
3. Choisis le profil Arquebusier.
4. Active les règles nécessaires puis l’âge mature.
5. Choisis la méthode STANDARD_SERIES.
6. Attribue exactement : FOR 2, AGI 1, CON 0, PER 1, INT 3, VOL 0, CHA -1.
7. Choisis les voies : Voie de l’artilleur ; Voie des explosifs.
8. Choisis l’équipement : Pétoire, Épée longue, Dague ; armure armor:cuir-renforce:cof2-lb-2024 ; bouclier aucun.

## Options et valeurs attendues

- Capacités réellement acquises : Mécanismes R1 ; Tir de grenaille (L) R1 ; Diversité R1 ; Arme à répétition R2 ; Démolition R2.
- Budget total : 2.
- Points dépensés : 2.
- Points restants : 0.
- PV 9; DEF 13; INIT 11; PC 3; PM 0.
- Attaques : Pétoire +1 / 1d10 ; Épée longue +3 / 1d8+2 ; Dague +3 / 1d4+2 ; Dague +1 / 1d4.
- Choix persistants : {"ability":{"ability:arme-a-repetition:classpath:voie-de-l-artilleur:class-arquebusier:cof2-lb-2024:rank2:cof2-lb-2024":{"repeatingWeapons":["weapon:powder-pistol"]}},"creation":{}}.

## Contrôle Arme à répétition

1. Coche Pétoire seule : le choix est accepté et le chargeur vaut 5 (2 + INT 3).
2. Ajoute une seconde **Pétoire** possédée, puis coche-la : les deux Pétoires sont les deux armes exactes éligibles et le choix reste accepté.
3. Ajoute puis tente de cocher une troisième **Pétoire** : elle doit être refusée immédiatement avec « Tu peux choisir au maximum 2 armes. ».
4. Vérifie après sauvegarde que `repeatingWeapons` contient exactement les armes cochées.

## Ce qui doit être bloqué

- Troisième arme — message « maximum 2 armes ».

## Sauvegarde et verdict

1. Appuie sur **Sauvegarder**.
2. Ouvre **Mes héros**, reprends ce héros et retourne au Résumé.
3. Vérifie que les choix et toutes les valeurs ci-dessus sont identiques.
4. Coche : **PASS [ ]** ou **FAIL [ ]**.
