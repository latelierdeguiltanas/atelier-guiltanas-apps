# Forge N1 · trois personnages témoins sur téléphone

[Ouvrir Forge](https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/forge-of-heroes/). Utilise trois **nouveaux** héros, nommés Clic A, Clic B et Clic C. Si un bouton bloque alors que le choix demandé est rempli, arrête-toi là. Une capture avec l’étape et le dernier choix suffit. Si A bloque, inutile de faire B et C.

**Réglage commun** pour pouvoir comparer les chiffres : humain, série expert, FOR +2, AGI +1, CON 0, PER +1, INT +3, VOL 0, CHA −1. Choisis **CON** pour le bonus humain. Garde le premier paquetage proposé sauf pour A.

### A · Standard — puis-je finir, modifier et retrouver la bonne fiche ?

1. Commence en standard, sans règle avancée. Avant de saisir le nom, vérifie que **Continuer** est bloqué. Nomme le héros Clic A et poursuis avec un **ensorceleur**.
2. Garde la voie de peuple humaine. Choisis **Air** et **Divination**, avec le rang 2 gratuit en **Air**. En équipement, prends le paquetage de l’arme supplémentaire (« extra mastered ») et sélectionne **Arbalète légère**.
3. Atteins la fiche. Elle doit montrer **Sous tension R2**, l’arbalète légère, **7 PV, 3 PM, DEF 13, INIT 13**. Reviens à l’équipement, change l’arbalète en **rapière** et retourne à la fiche. La rapière doit avoir remplacé l’arbalète.
4. Sauvegarde le dernier état, recharge l’onglet, puis rouvre **Clic A** dans **Mes héros**. Tu dois retrouver la rapière et Sous tension. Cela vérifie que le dernier choix survit à une vraie réouverture.

### B · Hybride — le verrou MJ se débloque-t-il et les deux profils arrivent-ils sur la fiche ?

1. Crée Clic B en hybride, **voleur principal et arquebusier secondaire**. À l’étape des profils, laisse l’accord du MJ décoché : **Continuer** doit être bloqué. Coche-le : tu dois pouvoir avancer.
2. Prends **Assassin** côté voleur et **Artilleur** côté arquebusier. Garde l’équipement de départ du voleur, y compris l’armure.
3. Termine et sauvegarde. La fiche doit afficher **Discrétion R1 et Mécanismes R1**, **9 PV, DEF 13, INIT 11**. L’absence d’une des deux capacités est un échec, même si les chiffres sont justes.

### C · Sans profil — les historiques et le budget d’âge fonctionnent-ils au doigt ?

1. Pour Clic C, active **Âge variable** et **Historiques**. Choisis **Sans profil**, puis **Vénérable**, origine **Campagnes**, profession **Courtisan**, et **Soldat** comme seule voie issue d’un profil. Garde les pénalités d’âge par défaut.
2. Dans les achats de rangs, monte Campagnes et Courtisan au **rang 3 chacun**. Le compteur doit arriver à **0 point restant**. Touche **Annuler le dernier rang** pour Courtisan : **1 point** revient et **Continuer** se bloque. Rachète le rang 3 : le compteur revient à zéro et le passage se débloque.
3. Garde le premier paquetage du Soldat, armure portée. Termine, sauvegarde et rouvre Clic C. Tu dois retrouver **Sans profil**, **les deux historiques R3**, **Soldat R1**, **10 PV, DEF 16, INIT 11**. Aucun deuxième choix de voie de profil ne doit être exigé.

**Retour minimal** : « A OK, B OK, C OK », ou « C, étape 2 : après avoir racheté Courtisan, Continuer reste grisé », par exemple. Le résultat initial des trois parcours est **à tester sur Android**. Les valeurs de référence ont été vérifiées sur le moteur publié ab9c389. Ces trois parcours contrôlent les trois modes, la navigation, les choix conditionnels, le recalcul et la persistance. Le PDF, l’achat de caractéristiques et les autres pouvoirs particuliers restent couverts séparément.
