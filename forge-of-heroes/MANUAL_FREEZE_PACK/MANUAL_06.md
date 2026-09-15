# MANUAL_06 — Combattant aguerri R3

## Objectif

Choisir réellement une capacité accordée et vérifier séparément l’effet de **Combattant aguerri** et celui de la capacité accordée.

## Clics et construction exacte

1. Choisis le mode Standard.
2. Saisis un nom et choisis le peuple HUMAIN.
3. Choisis le profil Arquebusier.
4. Active les règles nécessaires puis l’âge vénérable.
5. Choisis la méthode STANDARD_SERIES.
6. Attribue exactement : FOR 2, AGI 1, CON 0, PER 1, INT 3, VOL 0, CHA -1.
7. Choisis les voies : Voie du mercenaire ; Voie de l’artilleur.
8. Choisis l’équipement : Pétoire, Épée longue, Dague ; armure armor:cuir-renforce:cof2-lb-2024 ; bouclier aucun.

## Options et valeurs attendues

- Capacités réellement acquises : Pilier de bar R1 ; Mécanismes R1 ; Diversité R1 ; Mort ou vif (L) R2 ; Combattant aguerri R3 ; Arme à répétition R2.
- Budget total : 4.
- Points dépensés : 4.
- Points restants : 0.
- PV 8; DEF 14; INIT 12; PC 3; PM 0.
- Attaques : Pétoire +1 / 1d10 ; Épée longue +3 / 1d8+2 ; Dague +3 / 1d4+2 ; Dague +1 / 1d4.
- Choix persistants : {"ability":{"ability:combattant-aguerri:classpath:voie-du-mercenaire:class-arquebusier:cof2-lb-2024:rank3:cof2-lb-2024":{"combattantAguerriAbility":"ability:archer-emerite:classpath:voie-de-l-archer:class-rodeur:cof2-lb-2024:rank1:cof2-lb-2024"},"ability:arme-a-repetition:classpath:voie-de-l-artilleur:class-arquebusier:cof2-lb-2024:rank2:cof2-lb-2024":{"repeatingWeapons":["weapon:powder-pistol"]}},"creation":{}}.

## Contrôle Combattant aguerri

1. Ouvre la liste de Combattant aguerri.
2. Avant l’acquisition de **Combattant aguerri R3**, relève DEF 13. Après l’acquisition de **Combattant aguerri R3**, relève DEF 14 : ce +1 DEF vient de Combattant aguerri et ne dépend pas du choix accordé.
3. Choisis **Archer émérite** comme capacité accordée.
4. Vérifie que **Archer émérite** apparaît dans les capacités accordées et que l’initiative passe de 11 à 12.
5. Le bonus de dégâts d’arc (+PER) est contrôlé par la sentinelle moteur dédiée : ce personnage de test ne possède légalement aucun arc. La Pétoire et les armes de mêlée ne doivent jamais recevoir ce bonus d’arc.

## Ce qui doit être bloqué

- Grant hors liste.
- Armure incompatible.

## Sauvegarde et verdict

1. Appuie sur **Sauvegarder**.
2. Ouvre **Mes héros**, reprends ce héros et retourne au Résumé.
3. Vérifie que les choix et toutes les valeurs ci-dessus sont identiques.
4. Coche : **PASS [ ]** ou **FAIL [ ]**.
