# Validation ciblée — six carnets réels N3 et halfelin sorcier/moine N2

## Périmètre et résultat

- Les six carnets serveur ont été lus le 30 octobre 2026, tous niveau 2. Aucun carnet réel n’a été modifié par les tests. Révisions : Faëlar/Prépotante/Wilfried/Zéphéline 1, Vivelame 2, Scanlan 3. Les empreintes des transferts exacts sont dans `all-choices-live.json` ; les données privées ne sont pas copiées dans ce dossier.
- **176 plans N3 passent** : Faëlar 75, Prépotante 23, Scanlan 11, Vivelame 28, Wilfried 31, Zéphéline 8. La construction des plans utilise les coûts/prérequis légaux indépendamment du grisement du produit. Variantes : dons sylvains, échange PC/DR, deux montures et chargeurs ; historiques jusqu’au rang 4 lorsqu’ils sont accessibles. Les chiffres permanents attendus sont écrits depuis les règles ; les bonus de contexte ne sont pas inventés permanents.
- **420 créations et 54 520 plans N2 passent** pour le halfelin sorcier/moine : 25 paires de voies, deux profils principaux, bonus AGI/VOL, remplacement Mage où légal, tous les emplacements R2 gratuits et choix FOR/AGI, FOR/VOL à la création ou pendant la progression. La série expert et l’absence d’armure sont le référentiel de ce contrôle. Les options âge/historiques/voies supplémentaires et équipements différents restent hors de cette certification ciblée ; les méthodes de caractéristiques ont leurs preuves N1 séparées.
- Régressions : 156 plans N3 de référence, six parcours UI et serveur simulés, idempotence/refus de chiffres modifiés, 150 hybrides N2, 8 profils natifs, 8 variantes de poings, 13 groupes de progression et 11 groupes de stockage/syntaxe passent.
- **12 vrais PDF officiels passent** : huit N3 construits depuis les carnets réels et quatre N2 halfelins couvrant FOR/AGI × FOR/VOL. Champs, attaques/dégâts, PV/DEF et apparences contrôlés ; les choix de monture et de chargeur sont retrouvés dans les annexes. Pages de Scanlan et du halfelin rendues et inspectées. Les PDF restent des tests locaux, pas des niveaux réellement attribués.

## Défauts corrigés

1. Scanlan : Dentelles et rapière R3 augmente le plafond du bonus de DEF ; DEF 15 au lieu de 14 dans ce choix. Source COF2 p.68.
2. Prépotante : Doigts agiles R3 augmente le bonus aux dagues lancées à +2 ; `1d4+2` au lieu de `1d4+1`. Source COF2 p.76.
3. Zéphéline : choix de monture terrestre/volante conservé et exporté ; FOR +2/0, DM 1d6+2/1d6, PV 12 au N3. Adaptation de table du Compagnon, distincte d’une règle officielle COF2.
4. Vivelame : choix des armes possédées à modifier avec Arme à répétition, chargeur recalculé selon INT et voies R3, rythme de rechargement indiqué. Dialogues et choix invalides contrôlés.
5. Nouveaux personnages natifs : sans Poings de fer, Mains d’énergie ne transforme plus 1d3 en 1d4 au N2. Source COF2 pp.119 et 183. La version de projection native passe à 3 ; les carnets anciens conservent leur règle de référence au rejeu.
6. Les nouvelles progressions natives conservent les bonus de tests, traits passifs et langues de création ; la résistance légendaire du halfelin au R2 reste un bonus au test opposé contre un sort, sans changer l’attaque magique ordinaire.

Les incréments de Divination et Vêtements sacrés sont aussi calculés selon le rang avant/après, sans réappliquer les bonus déjà acquis. Aucun PV ou choix supplémentaire n’est attribué à un joueur réel.

## Rejouer

```sh
node forge-of-heroes/FINAL_FREEZE_TESTS/bastide_n3_all_choices_runner.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/bastide_n3_all_choices_runner.cjs CHEMIN_DES_TRANSFERTS_PRIVES
node forge-of-heroes/FINAL_FREEZE_TESTS/bastide_n3_choice_dialogs.cjs CHEMIN_DES_TRANSFERTS_PRIVES
node forge-of-heroes/FINAL_FREEZE_TESTS/halfelin_sorcerer_monk_all_choices.cjs
node forge-of-heroes/FINAL_FREEZE_TESTS/bastide_n3_live_pdf_runner.cjs CHEMIN_DES_TRANSFERTS_PRIVES MODELE_PRIVE DOSSIER_TEMPORAIRE
node forge-of-heroes/FINAL_FREEZE_TESTS/halfelin_n2_pdf_choices.cjs MODELE_PRIVE DOSSIER_TEMPORAIRE
```

Les parcours UI utilisent des fixtures DOM/stockage, pas un navigateur Android réel. Ce bilan valide le périmètre ciblé ci-dessus ; il ne constitue pas une garantie universelle de l’ensemble de Forge N1/N2/N3. Le verrouillage global N1 reste suivi dans `QA/N1/README.md`.
