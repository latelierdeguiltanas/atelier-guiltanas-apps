# Lot 10 — oracle numérique indépendant et effets conservés

État : corrections ciblées et nouvelle couverture numérique ; **N1 reste ouvert**.

## Défauts reproduits et corrigés

- `before-defects.json` conserve six reproductions sur le commit `6b2aac2` : Éduqué du samouraï imposait une langue non prévue ; le chevalier à INT −1 ne pouvait apprendre sa langue gratuite ; le remplacement de la famille technique du mode sans profil effaçait les bonus de PV des voies et le PC humain.
- L'identification d'une langue obligatoire utilise les choix/mécaniques de la capacité, plus un test générique de validité, et non le titre « Éduqué ». Les deux capacités donnent la lecture/écriture ; seule celle du chevalier donne une langue supplémentaire, en plus des langues d'INT. Les choix par capacité et le champ historique sont conservés.
- Sans profil, seuls les socles de famille sont remplacés. Les effets déjà acquis de peuple/voie sont conservés. La recette MANUAL_11 corrige donc PC 2 → 3 : 2 −1 CHA +1 aventurier +1 humain.
- Le mode sans profil compose les maîtrises de bouclier `all`/`small`/`none` et ne refuse plus un petit bouclier à une paire comprenant une voie de druide/prêtre et une voie compatible. Les identifiants inconnus sont refusés.
- Le familier de l'invocateur donnait +2 INIT même absent et encore +2 lorsqu'il était visible. Le calcul direct des effets ne traite désormais que les ajouts permanents `add`/`add_flat`/`add_stat` ; la visibilité est déjà gérée par la projection contextuelle et donne +2 une seule fois.

## Preuves

- `educated-languages.json` : 72 créations/relectures, trois modes, INT −1/0/+3, choix de capacité ou champ historique, langue absente/illégale et dépassement de budget. Lecture visuelle de la page 86 COF2 et de la page 31 Compagnon ; empreintes dans `source-review.json`.
- `pair-numeric.json` : 7 600 tentatives sur les deux HTML : 7 140 couples sans profil (3 570 par produit), 220 couples ordinaires non mages, 240 couples mages avec les deux choix du R2. **7 480 créations conformes**, **120 refus de petit bouclier attendus explicitement** (60 par produit), zéro échec. Les refus sont définis par une liste de maîtrises indépendante, pas déduits du résultat produit. 85 voies R1 couvertes ; le R2 gratuit des mages est inclus.
- Les valeurs attendues PV/PC/DR/DEF/INIT et bases d'attaque sont écrites dans l'oracle depuis les règles, sans lecture des effets, traces, calculationRules, ni comparaison à une sortie initiale du moteur. Les PM natifs sont comptés depuis des listes explicites des sorts. La sauvegarde/relecture est échantillonnée tous les 59 cas.
- `familiar-context.json` : six cas de visibilité indéfinie/fausse/vraie, sur les deux HTML, valeurs +0/+0/+2, initiative du compagnon recalculée, sauvegarde/relecture.

## Limites conservées

Cet oracle porte sur un humain sans armure, une série officielle, sans activation ni contexte de combat, sans variante d'arme. Il ne prouve pas tous les choix, effets d'équipement, compétences, cultures, peuples, sorts activés, variantes ou interactions d'âge. Les R2 non mages accessibles par âge conservent leurs autres tests ciblés, et ne sont pas couverts tous ensemble par cet oracle de paires. Les conversions Compagnon restent des adaptations Forge, non des règles officielles COF2. Aucune recette Android n'est revendiquée. La clôture N1 reste à traiter séparément.

## Extension R2 du relais

Toutes les paires distinctes des 85 voies sont portées au R2 par les deux points d’âge mûr en mode sans profil : 7 140 tentatives sur les deux HTML, 7 020 créations conformes aux attentes numériques indépendantes et 120 refus de petit bouclier attendus. Même périmètre humain/série de base/sans armure ; AGI −1 d’âge appliqué. Les sorts actifs, variantes et interactions non exercés restent hors certification.

La première exécution contenait 166 erreurs du générateur (Arme à répétition sans arme possédée). Rapport conservé dans `r2-pair-before.json`. Après ajout explicite d’une arbalète légère, les 168 paires contenant Artilleur sont rejouées et passent (166 créations, 2 refus de bouclier). La synthèse finale relie les deux preuves et vérifie que chaque échec initial appartient au sous-ensemble rejoué ; elle ne prétend pas à un deuxième rejeu complet.

Correction PDF sans profil : colonnes non choisies et annexes du profil technique retirées dans les exporteurs natif/partagé ; douze exports recontrôlés et page 2 sans profil rendue/inspectée.
