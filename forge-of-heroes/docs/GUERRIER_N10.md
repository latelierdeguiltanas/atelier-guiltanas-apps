# Guerrier : progression urgente N1 → N10

Le carnet accepte désormais un guerrier pur sauvegardé dans Forge, dans ses cinq voies de profil. Les autres profils gardent leurs limites précédentes. Aucun personnage existant n'est monté automatiquement.

## État actuel — 23 novembre 2026

Les 25 capacités du guerrier pur sont couvertes jusqu’au N10. Quatorze voies de prestige sont intégrées jusqu’au rang 6 : les treize précédentes et **Expert**. L’Expert propose 45 capacités sources de barbare, chevalier et guerrier, avec voies distinctes, rang source R1/R2/R3, rang de résolution de l’Expert et compétences évolutives plafonnées à +7. Les choix d’arme, armure lourde, tatouage et langue sont sauvegardés et exportés. Les compétences, PV, DEF, initiative, critiques, rage, compagnons, réactions et récupérations empruntées ont leur contrôleur ou projection propre dans la fiche.

Le **Familier fantastique est ouvert aux rangs 3 et 4**, pour treize variantes. Son pouvoir mineur suit portées, conditions, durées, quotas et sauvegarde. Les rangs 5 et 6 restent bloqués : le choix et les effets du sort appris au rang 5 ne sont pas certifiés. Chevalier dragon et Guerrier-mage restent hors du parcours du guerrier pur. Les progressions de peuple/historique et les hybrides ne sont pas certifiées N10. **La demande intégrale n’est donc pas à 100 %.**

Le gain de PV applique la vigueur propre à la voie de prestige lorsqu’un de ses rangs est acheté (Livre de base p.42) : 4 pour le Familier, au lieu de 5 pour le Guerrier. Les anciens carnets Familier R3 ne sont corrigés que si leur tête correspond exactement à l’ancien résultat ; leur base et leurs décisions restent immuables.

Preuves supplémentaires : `QA/N10/guerrier-expert.json`, `guerrier-expert-progression-dom.json`, `familier-fantastique-r4.json`, `guerrier-urgence-dom.json` et `guerrier-urgence-pdf.json`. Ce dernier contrôle 58 PDF officiels N10 : 45 Expert et 13 Familier R4. Les vérifications précédentes et les limites ci-dessous restent pertinentes ; leurs mentions d’Expert bloqué ou du familier limité à R3 décrivent les versions antérieures.

## Reprise des anciens carnets et import sur un autre appareil

Un texte historique du catalogue des capacités pouvait faire rejeter un carnet dont tous les calculs et décisions étaient corrects, notamment après l’erratum des armes de prédilection à mains nues. Le contrôle actualise maintenant ce texte dérivé comme les descriptions des voies. Coûts de mana, quotas, identifiants, caractéristiques, combat, base N1 et historique restent contrôlés ; les textes ne permettent pas de masquer une modification mécanique.

Un carnet effectivement incohérent est conservé, signalé et bloqué individuellement. Les autres héros restent accessibles et peuvent évoluer ; leurs sauvegardes conservent intégralement les carnets bloqués. L’export de récupération reprend le contenu complet, même si le JSON est illisible. Un import ne peut pas remplacer un carnet bloqué sans récupération explicite. Les conflits entre onglets restent refusés.

Un carnet personnel Forge valide peut aussi être importé sur un autre appareil sans héros préalablement créé sur cet appareil. La fiche de départ est récupérée dans le carnet validé et reste disponible après rechargement. Les niveaux précédemment validés ne peuvent pas être remplacés.

Preuves : `FINAL_FREEZE_TESTS/carnet_isolation.cjs` et `fiches-personnages/tests/carnet-recovery.cjs`. Le serveur de campagne conserve ses limites précédentes et le statut de certification intégrale reste partiel.

## Recette en ligne de la reprise Expert

La version `ae870de22e175c5c6cc0781147130bc6404838fd` a passé la chaîne guerrier (`45219521119`) et son déploiement Pages (`45219520897`). Une recette manuelle sur le site a importé un carnet humain N4 sans héros préalablement enregistré, acheté les six niveaux suivants, puis ouvert automatiquement la fiche N10. Les trois emprunts étaient Éduqué, Tour de force et Tatouages (CON), chacun dans une voie distincte. Langue, choix et progression ont été conservés après reprise.

Le carnet N10 réellement téléchargé a ensuite été vérifié séparément : 65 PV maximum, DEF 20, INIT 14, attaques 13/12/10, base N1 et décisions N2–N4 inchangées. Tour de force a prélevé 8 PV (57/65 après rechargement) ; le test du tatouage CON a donné 10 + 1 + 3 = 14. Cette recette part du N4, elle ne certifie pas un parcours complet N1–N10 au clic ni toutes les combinaisons de peuple et d’Expert. Preuve : `QA/N10/guerrier-urgence-live.json`.

## Utilisation

Créer et sauvegarder le guerrier dans la Forge habituelle. Depuis Mes héros, choisir le passage de niveau, vérifier la base N1, puis dépenser deux points et valider chacun des niveaux jusqu'à N10. Le carnet reste ouvert entre les niveaux pour accélérer cette préparation. « Ouvrir ma fiche interactive » et le téléchargement PDF sont disponibles à partir du N2. Au N10, la fiche interactive s'ouvre automatiquement. Exporter le carnet pour conserver une sauvegarde transférable.

## Règles intégrées

Source : Livre de base COF2 fourni, pages imprimées 39 et 87–90. R1/R2 coûtent un point, R3/R4/R5 deux points ; niveaux minimaux 1/2/3/5/7. Gain par niveau : vigueur du guerrier (5) ou de la voie de prestige acquise ce niveau (Familier : 4), puis CON ; progression des trois attaques jusqu'au N10. Constitution héroïque recalcule les PV rétroactivement et les dés de récupération. Force héroïque modifie contact et dégâts de contact. Robustesse et les compétences suivent le rang courant. Bouclier, Dur à cuire, Rempart et le choix +1 DEF d'Armure lourde modifient la défense. L'autre choix donne la maîtrise des plaques sans créer ni équiper une armure gratuitement. Prédilection, critique, spécialisation, nouvelles catégories et bonus supplémentaires lors des rangs 5 sont persistés.

Les capacités conditionnelles conservent leurs textes et quotas. Les dés sont lancés à la main, les conditions et coûts d'utilisation doivent être appliqués selon leur texte. La défense de référence suppose le bouclier manié : les armes à deux mains affichées sont des alternatives à cette configuration.

## Limites explicites

Ce lot ne certifie pas tous les guerriers possibles. Les nouveaux rangs de peuple et d'historique sont bloqués dans ce parcours N10 en attendant leur audit. Les hybrides restent fermés ; les quatorze voies de prestige complètes et le familier partiel sont détaillés plus bas. Les tests multi-peuples conservent les capacités de peuple N1 ; ils n'attestent pas une progression de ces voies. Les fiches personnelles se sauvegardent sur l'appareil ; le serveur de campagne Bastide garde sa limite N3. La certification générale N1 n'est pas modifiée par ce lot.

## Preuves

`QA/N10/guerrier.json` : 80 parcours complets (8 peuples du livre de base × 5 voies prioritaires × 2 branches d'Armure lourde), sauvegarde/rechargement et export de fiche, plus exploration des répartitions de rangs des cinq voies. Oracle de PV, caractéristiques, DEF, initiative, attaques, dégâts et critique indépendant des fonctions de calcul de production. Ces répartitions ne représentent pas toutes les combinaisons de peuples, équipement et options. Les preuves au clic et PDF sont enregistrées séparément.

## Vérifications du 22 novembre 2026

- 80 parcours N1→N10 : huit peuples du livre de base, chacune des cinq voies prioritaire, deux branches d'Armure lourde. Les rangs de peuple restent ceux de la création.
- 8 534 transitions vérifiées, 1 681 configurations de rangs/étapes explorées depuis une base témoin ; 25 capacités de profil exercées. Cette couverture n'est pas une preuve de toutes les permutations ni de tous les équipements.
- Oracles indépendants : PV et CON rétroactive, FOR, trois attaques, DEF, initiative, DR, épée longue, critique et spécialisation.
- Dix véritables PDF N10 générés depuis le modèle officiel privé : caractéristiques, ressources, DEF/INIT et coches de rangs vérifiés. Le modèle privé n'est pas publié.
- Une création humaine puis neuf montées de niveau réalisées au clic sur GitHub Pages : dialogues, sauvegardes et ouverture de la fiche interactive N10. Résultat témoin : 92 PV, DEF 19, CON +3, 5 DR d10, épée +14 / 1d8+5 / critique 19–20.
- Non-régression : bases Bastide N2, 156 options N3, neuf profils natifs N2 ; 22 contrôles d'armure d'os et neuf pouvoirs à usages limités.

La demande « absolument tout » n'est pas clôturée : nouveaux rangs de peuple/historique, hybrides, extensions et toutes les interactions d'équipement restent hors certification N10. Les pouvoirs déclenchés gardent leurs textes complets et se résolvent avec les dés physiques ; la fiche n'automatise pas toutes leurs conditions de combat.

Parcours urgent : créer un guerrier classique, terminer sa fiche N1, choisir « Passer au niveau suivant », puis valider les neuf montées. Le carnet garde les décisions ; « Sauvegarder le carnet » exporte la sauvegarde, et « Ouvrir ma fiche interactive » ouvre la fiche du niveau acquis.

## Complément — capacités du profil dans la fiche interactive

Les 25 capacités de guerrier possèdent désormais une présentation propre avec calculs et contrôles des conditions. Le module partagé `ENGINE/guerrier-combat.js` est embarqué à l'identique dans la fiche ; `scripts/sync-guerrier-combat.cjs --check` empêche une divergence.

Parade et absorption : préparation, choix FOR/AGI, comparaison des jets, égalité à relancer, dommages, exception énorme/colossal et parade gratuite R5 avec dé malus. L'absorption et la parade partagent leur résolution par round ; le renvoi exige une absorption immédiatement précédente et refuse les sorts de zone. Le bonus de protection d'un allié reste un résultat à appliquer à cet allié, sans modifier sa fiche distante.

Attaques : puissance A/L, double, circulaire avec DEF par adversaire, parfaite et désarmement, riposte, Teigneux/Rempart et Piqûre de rappel. Les déclencheurs doivent être confirmés. Les dés évolutifs, dés bonus/malus, pénalités, critiques et bonus de dégâts sont calculés. Les résultats des dés physiques sont saisis ; les dégâts des adversaires restent gérés à la table.

Résistance : Prouesse retire réellement le résultat du dé évolutif aux PV. Les tests héroïques restent distincts des attaques. Dur à cuire permet le dernier round à 0 PV, puis le bouton de fin du dernier round applique l'inconscience si aucun soin n'est intervenu. Les états, quotas, postures et résultats sont conservés dans la sauvegarde de jeu. Les armes ajoutées à l'inventaire bénéficient aussi des prédilections ; la pique et la dague utilisée à distance ont été corrigées dans le moteur N1.

Les tests de cette passe sont `guerrier_integral_combat.cjs`, `guerrier_weapons.cjs` et `fiches-personnages/tests/guerrier-integral.cjs`. La couverture de ces tests porte sur les **25 capacités du profil guerrier pur N1–10**. Elle ne clôture pas les voies de peuple/d'historique, profils hybrides, règles de prestige ni interactions de tous les autres profils. Les données de création N1 et le catalogue de progression conservent leurs limites explicites.

## Extension prestige COF2 du 23 novembre 2026

Le catalogue officiel du Livre de base COF2 (p. 128–153) est distinct des conversions du Compagnon COF1. Les 17 voies génériques/de combattant et leurs 85 textes sont conservés dans `progression/prestige-cof2.json`. Une seule voie de prestige peut être acquise. Les rangs 4, 5 et 6 coûtent chacun deux points et nécessitent respectivement les niveaux 5, 7 et 9. Les rangs 7 et 8 restent fermés avant les niveaux 11 et 13. Le familier fantastique est une exception, commençant au rang 3 (p. 133).

Treize voies sont ouvertes dans le parcours du guerrier pur : spécialiste, lycanthrope, sang-dragon, armes à deux mains, arme liée, combattant des tunnels, combat du mal, colosse, danseur de guerre, écorcheur, ours, porteur de bouclier et tueur de géants. Les choix persistants, prérequis de FOR, condition d'armure et confirmation de l'ouverture narrative sont contrôlés. Les capacités conditionnelles disposent d'un contrôleur dans la fiche. Les dés restent physiques et les effets sur les autres acteurs sont affichés pour la table.

Les transformations utilisent leur propre vue de combat. L'ours conserve des PV séparés et interdit les capacités de profil ; les formes de lycanthrope partagent les PV humains. Les résistances, dés évolutifs, quotas, armes liées, tests opposés, boucliers et conditions de cibles sont vérifiés. La colonne prestige du PDF utilise cinq cases pour les vrais rangs 4–8 ; les rangs 4–6 acquis sont cochés, avec les textes et choix en annexe.

**La demande de certification intégrale reste ouverte.** Expert reste bloqué. Le Familier fantastique est désormais disponible au seul rang 3, comme détaillé dans le complément ci-dessous ; ses pouvoirs des rangs suivants restent bloqués. Chevalier dragon et guerrier-mage exigent respectivement un parcours avec cavalier/drake et un parcours combattant/mage, en dehors du guerrier pur. Les nouveaux rangs de peuple/historique et les hybrides restent également hors de la certification N10 précédente. Aucun pourcentage global de certification n'est augmenté artificiellement.

Preuves reproductibles : `FINAL_FREEZE_TESTS/guerrier_prestige.cjs`, `fiches-personnages/tests/guerrier-prestige.cjs`, `FINAL_FREEZE_TESTS/guerrier_prestige_pdf.cjs`. Rapports : `QA/N10/guerrier-prestige*.json`. Le test PDF exige le modèle officiel fourni par l'utilisateur, qui n'est pas publié dans le dépôt.

## Complément du 23 novembre — mains nues, équipement et reprise des carnets

La correction de l’auteur sur le forum Black Book (sujet 80411, Laurent Kegron Bernasconi) ajoute les mains nues aux catégories de prédilection. La sixième catégorie est proposée dès la création et pendant la progression. Les attaques à mains nues portent leurs bonus de prédilection, critique et spécialisation, y compris quand elles sont choisies après N1. Elles apparaissent dans les trois emplacements du PDF officiel lorsqu’elles sont choisies en prédilection. Leur caractère temporaire et leur critique amélioré sont imprimés.

Spécialiste AGI respecte le plafond de DEF de l’armure. Colosse améliore aussi le dé des attaques à mains nues dans le carnet et le PDF. Les carnets anciens ne sont corrigés que si leur tête correspond exactement au résultat historique de ces deux erreurs : la base N1 et les choix restent figés, toute autre divergence est refusée. Au niveau 10, le bouton d’actualisation personnelle réexporte la fiche corrigée et conserve inventaire, notes et ressources de jeu.

L’arme liée reconnaît l’exemplaire original après équipement ou attribution d’un profil mécanique. Un exemplaire identique acheté ensuite ne bénéficie pas automatiquement du lien. Le changement exige la confirmation du rituel et est limité à une fois par niveau, sans recharger les pouvoirs dépensés. Le niveau d’acquisition est extrait de l’historique validé.

Le repos complet restitue un DR, sans dépasser le maximum ; la guérison reste saisie par le joueur après son jet. La récupération rapide terminée réactive les usages de guerrier et de prestige, sans régénération de ressources. Les formes expirent selon leur durée. Un dernier round à 0 PV se termine par l’inconscience si aucun soin n’a été reçu.

Preuves supplémentaires : `guerrier_suite.cjs` (144 contrôles, dont 80 parcours mains nues N1–10), `fiches-personnages/tests/guerrier-suite.cjs` (11 scénarios sur la vraie fiche et la vraie bibliothèque personnelle), `guerrier_suite_pdf.cjs` (5 PDF officiels N10). Les tests de régression du profil et des treize voies ouvertes restent distincts. Les prérequis et choix d’Expert disposent de contrôles préparatoires, mais Expert reste bloqué : cela ne valide pas encore les capacités empruntées. Ces correctifs ne débloquent pas les rangs de prestige encore non intégrés.

Référence de l’erratum : https://black-book-editions.fr/forums.php?topic_id=80411

## Familier fantastique — premier rang opérationnel, voie encore partielle

Le rang 3 peut être acquis dès le niveau 3 pour deux points, avec confirmation de la rencontre par le MJ. Treize choix représentent les douze familles du Livre de base p. 132–136 (fée et lutin sont distingués). Seul le compagnon rencontré est ouvert pour le guerrier pur : aucun sort Familier ni bonus de DEF/INIT correspondant n’est accordé gratuitement. Les rangs 4 et suivants restent bloqués. Cela ne constitue pas une quatorzième voie de prestige complète.

La fiche suit une réserve séparée de 2 PV par niveau, DEF 17 au rang 3 et INIT du personnage. Elle distingue fuite, inconscience, mort inéluctable et remplacement au niveau suivant. Une récupération rapide restaure les PV d’un familier accessible sur place, y compris inconscient ; un familier qui a fui attend la récupération complète pour revenir. une récupération complète permet le retour d’un familier vaincu, sans ressusciter celui dont la mort a été confirmée. Les ressources du guerrier sont conservées. Les caractéristiques du minimoi, du lézard, de la fée et du lutin remplacent celles du bloc commun. Les autres variantes conservent leurs aptitudes de déplacement, de perception ou de communication décrites.

Les attaques de base disposent de contrôles dédiés : drain contre une créature vivante et soin de 1 PV, morsure et poison de l’araignée, décharge électrique, poison du pseudo-dragon selon le NC, agrippement et dégâts par round de la strige. Le minimoi reçoit des PV transférés réellement depuis la réserve du maître. Le Grig suit son usage quotidien de Danse irrésistible ; son total d’attaque magique est renseigné avec le MJ, le bloc officiel ne donnant pas de valeur d’attaque propre à ce pouvoir. Les effets sur un adversaire sont affichés pour la table, sans modification de sa fiche. Les conditions et l’initiative de chaque créature restent gérées à la table ; aucune intégration au gestionnaire de combat distant n’est certifiée par ce lot.

Preuves : `FINAL_FREEZE_TESTS/familier_fantastique.cjs` (38 contrôles, treize trajectoires), `fiches-personnages/tests/familier-fantastique.cjs` (19 scénarios sur la fiche), `FINAL_FREEZE_TESTS/familier_fantastique_pdf.cjs` (treize PDF N10, rang 3 coché, rangs 4–7 non acquis). Rapports `QA/N10/familier-fantastique-r3*.json`. Les treize voies complètes précédemment ouvertes restent couvertes séparément. Expert, les rangs suivants du familier, Chevalier dragon, Guerrier-mage et les progressions de peuple/historique restent hors certification intégrale.

Les deux familiers de type non-vivant (animal mort-vivant et pantin) appliquent aussi les immunités de type du bestiaire : maladies, poisons et attaques exigeant un test de CON. Leur intelligence positive ne donne pas d’immunité mentale générale.

La recette réelle a également révélé un défaut de la bibliothèque : plusieurs fiches importées valides sans date de modification faisaient échouer le tri et masquaient toute la liste. Le tri accepte désormais les dates absentes, sans modifier les sauvegardes. Régression : `fiches-personnages/tests/library-optional-dates.cjs`.
