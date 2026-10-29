# Forge of Heroes — suivi de validation

Décision du 28 octobre 2026 : **terminer N1 avant de poursuivre N2, puis N3**. Les besoins urgents antérieurs ne constituent pas une certification générale.

| Phase | État | Condition de sortie |
| --- | --- | --- |
| Création N1 | EN COURS | Fermer les réserves de `QA/N1/README.md`, avec preuves liées à la version |
| Passage N2 | EN ATTENTE | Certification N1 clôturée |
| Passage N3 | EN ATTENTE | Certification N2 clôturée |

La branche `qa/forge-n1-certification` contient le nouveau suivi N1. Les corrections N2/N3 du précédent lot restent sur la branche de travail distincte `fix/forge-n1-n3-resume-audit` ; elles ne font pas partie de cette livraison N1 et ne sont pas réputées déployées.

## Point d'entrée

Lire [le bilan N1](QA/N1/README.md), [la matrice](QA/N1/matrix.json), [les régressions](QA/N1/regressions.json) et [le contrôle au clic/PDF](QA/N1/browser-and-pdf.json).

Chaque défaut doit conserver : état reproductible, résultat attendu et source, résultat obtenu, cause, correction et test. Un refus de création doit être classé : restriction légitime, choix manquant, défaut du générateur de test ou défaut du produit. Il n'est jamais compté silencieusement comme une création valide.

La présence d'un texte, un grand nombre de tests ou la réussite d'un seul personnage ne suffisent pas à clôturer une phase. Les effets conditionnels doivent être décrits et contrôlés selon leurs conditions, sans leur inventer un bonus permanent.

## Dernier lot N1

Dernier point : lots 8 et 9, règles peuples/historiques et origine de Diversité. Les preuves et limites sont détaillées plus bas et dans `QA/N1/README.md`. N1 reste ouvert ; N2/N3 attendent.

### Lot 2 N1 — restrictions et méthodes

Restrictions de taille communes aux trois modes, armes 2d6 et tenue à deux mains corrigées ; variante semi-aléatoire à sept +1 intégrée. Les 27 familles de refus ont leurs contreparties testées. Les 27 suites de cette étape passaient ; voir `QA/N1/lot2/`.

### Lot 3 N1 — confrontation visuelle aux PDF, 28 octobre 2026

- Livre de base p.55 : omission du halfelin dans les restrictions de taille corrigée, avec le nombre de mains projeté et les refus d’armes interdits dans les trois modes. Preuve avant/après : `QA/N1/lot3/halfelin-before-after.json` ; 120 contrôles d’équipement sur les deux produits.
- Règles avancées p.153 : suppression du bonus résiduel PC/DR après changement de catégorie d’âge. Six cas fautifs avant correction, puis 24 cas conformes et 22 sauvegardes/relectures. Les attentes numériques et les budgets sont calculés indépendamment pour le voleur humain.
- Pages sources, lecture visuelle et empreintes PDF : `QA/N1/lot3/sources.json`. Les autres peuples/profils du Compagnon conservent leur statut d’adaptation Forge.
- N1 reste ouvert ; N2/N3 en attente. Les réserves détaillées du README demeurent actives, notamment parcours mobile et effets numériques non encore vérifiés indépendamment. Pas de clôture automatique à partir des compteurs.

- Extension des interactions jeune/très jeune aux 17 profils et 85 voies : 850 cas et 850 sauvegardes/relectures passent sur les deux produits. Chaque calcul est comparé à sa référence sans âge, avec seulement les écarts prévus par la règle. La validation numérique absolue de chaque capacité reste une réserve distincte.

### Lot 4 N1 — calculs issus du Livre de base et cohérence des rangs (29 octobre 2026)

- Quinze capacités officielles confrontées aux règles source : 74 créations avec valeurs exactes et sauvegardes/relectures, sur les deux produits. Rapport `QA/N1/lot4/source-numeric.json`, pages sources dans chaque cas.
- Défaut trouvé et corrigé : rang 2 initial des mages absent ou enregistré au rang 1 dans la projection sauvegardée des voies. La Voie du mage est désormais incluse lorsqu’elle est choisie. Les capacités données par un don ne font pas progresser une voie.
- Preuve : 90 cas avant correction ; 180 cas après correction sur les deux produits, avec 180 sauvegardes/relectures et deux contrôles des dons. Douze anciennes sauvegardes sont réouvertes sans changement de statistiques.
- N1 reste ouvert sur les effets et combinaisons non encore couverts et la recette mobile utilisateur. Aucune progression N2/N3 ni publication du site incluse dans ce lot.

### Lot 5 N1 — historiques (29 octobre 2026)

- Relecture visuelle des six pages source. Quatre écarts corrigés : dégâts du garde du corps, difficulté répétée d’Au-dessus des lois, attaque dans Fendre la foule et condition ajoutée à Se mettre à l’abri.
- 684 créations et sauvegardes/relectures passent sur les deux produits : 72 couples origine/profession, 17 voies jusqu’au rang 5, choix de l’expert et ordre des achats. Valeurs numériques et coût des rangs contrôlés indépendamment.
- Quatre exports PDF natifs/partagés contrôlent les corrections dans les annexes et les PV des champs ; annexe native du nanti inspectée visuellement.
- Rapports dans `QA/N1/lot5`. Les effets contextuels non automatisés, les autres combinaisons et la recette mobile restent des réserves ; aucune clôture globale prématurée.

### Lot 6 N1 — prêtres spécialistes (29 octobre 2026)

- Règle source p.122 : rang 1 remplacé conservé comme prérequis ; capacité divine de rang 2/3 substituée lors des achats d’âge, en premier à son rang ; choix de la voie remplacée dans l’interface.
- Cinq références canoniques de religions reliées. Pas de capacité de rang 4 accordée au N1.
- Attaques et exports reconstruits depuis la capacité réellement acquise. Fiche officielle et annexes affichent le remplacement.
- 360 créations/sauvegardes-relectures, 240 inversions d’achat, 20 contrôles DOM et six exports PDF. Rapports dans `QA/N1/lot6` ; source avant correction : 136 échecs sur 180 cas.
- Périmètre et limites documentés. La phase N1 n’est pas clôturée par le seul passage des tests de ce lot.

### Lot 7 N1 — paquetages et valeurs exactes

- Accès à l’échange de matériel validé par le MJ dans les deux interfaces ; choix d’armes, armure et bouclier persistants et réversibles.
- 36 scénarios DOM→constructeur→moteur et sauvegardes/relectures ; 30 armes trop grandes toujours refusées. Le moteur et les données restent identiques au lot 6.
- Revue numérique étendue : 25 capacités / 132 cas, dont Tour de magie R3 sur les six profils mages. 35 suites passent.
- Les contrôles DOM ne remplacent pas une recette utilisateur Android. Les réserves et les limites restent explicites.


## Lot 8 — peuples et historiques, texte intégral de Diversité

Source : Voies d’historique p.172 et Livre de base pp.57–58. L’humain avec historiques reçoit +5 dans une profession/loisir cohérent avec sa voie professionnelle ; son +1 PC reste acquis. L’elfe sylvain remplace le milieu forestier par son origine et augmente son bonus géographique de +3 à +5 ; cités et campagnes lui sont interdites. Ces règles concernent les peuples explicitement nommés : elles ne sont pas extrapolées au demi-elfe qui choisit leur voie.

Le moteur, les choix d’interface persistants et les exports natif/partagé appliquent ces règles, y compris quand la voie du mage conserve la capacité de peuple. Une ancienne origine interdite reste visible comme invalide jusqu’à correction, sans réécriture silencieuse. Le texte de Diversité est complété avec les six origines et les conditions des choix personnalisés, auparavant omis après « voir ci-dessous ». Les choix ordinaires de métier/origine hors historiques restent textuels ; ce lot ne prétend pas les automatiser.

Preuves dans `lot8/` : **288 cas**, dont **272 créations/relectures**, **16 refus attendus**, **272 désactivations du module** ; deux fixtures d’interface. La référence avant correction donne 72 échecs sur 144 cas. **Huit vrais exports PDF** vérifient les champs et les annexes, dont la capacité conservée par le mage ; page des voies de l’elfe et annexe du mage humain inspectées visuellement. **550 textes source correspondent** à leur source extractible : ce contrôle ne prouve pas que tous les paragraphes connexes sont présents.

État après correction : **36 suites PASS**, matrice complète de **179 120 tentatives**, **zéro échec d’assertion**, 27 familles de refus relues, empreintes moteur/données à jour. Les contrôles automatiques du statut passent. La clôture globale reste distincte des preuves de ce lot ; parcours Android et réserves listées plus haut non déclarés réalisés.


## Lot 9 — origine de Diversité enregistrée et exportée

Le choix des six origines du Livre de base pp.57–58 est désormais disponible pour la capacité Diversité, aussi lorsqu’elle est choisie par le demi-elfe ou conservée par la voie du mage. Le nomade enregistre son climat ; un des deux domaines peut être remplacé par une origine sociale ou un gagne-pain. Une origine personnalisée contient deux domaines distincts et un accord MJ. Le moteur refuse les origines inconnues, les champs personnalisés incomplets et le choix d’un profil comme gagne-pain. Les bonus sont de **+3, explicitement hors combat**, sans modification des attaques ni des statistiques permanentes. Le +1 PC préexistant est conservé.

Une ancienne création sans origine enregistrée garde son fonctionnement manuel : aucune origine ni bonus de compétence n’est inventé. Le choix est enregistré dans le brouillon et l’état exporté. Avec les historiques, l’humain utilise la règle +5 du lot 8 ; une origine +3 résiduelle ne se cumule pas. La capacité de la voie humaine choisie par un demi-elfe conserve sa règle propre.

`lot9/origins.json` : **2 856 créations et sauvegardes/relectures**, 17 profils, humain/demi-elfe, profil pur/hybride/sans profil, sept variantes d’origine (les deux climats du nomade), avec/sans remplacement social, sur les deux HTML. Les valeurs des deux domaines sont indépendantes des données du moteur ; statistiques et attaques sont comparées à leur référence sans origine. S’ajoutent **14 refus**, six interactions avec les historiques, huit contrôles personnalisés/compatibilité et deux fixtures d’interface reliées au constructeur des choix de peuple.

La référence précédente donne **1 428 créations sans origine projetée**, plus sept refus non appliqués et deux cas personnalisés non projetés : 1 437 assertions en échec. Le rapport `origins-before.json` distingue ces contrôles. Les erreurs de paquetage du générateur de test ont été corrigées avant cette comparaison finale ; elles ne sont pas comptées comme défauts du produit.

`lot9/pdf-origins.json` : **16 vrais exports** natifs/partagés pour humain/demi-elfe, voie humaine directe/conservée par le mage, origine sociale/personnalisée. Champs officiels, domaines choisis, +1 PC, +3 hors combat et texte source intégral sont contrôlés. Le résumé d’occultisme utilise le rang réel de la voie du mage : +4 au rang 2. Annexe du demi-elfe mage inspectée après rendu. Les huit exports historiques du lot 8 sont rejoués.

Fin de lot : **37 suites PASS** (36 suites de la campagne générale et la nouvelle suite ciblée), matrice complète rejouée sans échec d’assertion, revue des 27 familles actualisée. Le dernier changement de résumé PDF est extérieur au moteur ; le contrôle d’équipement lié au HTML a été réexécuté après ce changement. Les preuves ne constituent pas une recette au clic sur Android, et ne clôturent pas les réserves globales encore listées.
