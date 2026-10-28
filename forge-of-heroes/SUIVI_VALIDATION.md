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

Lot 2 : restrictions de taille communes aux trois modes de création, armes 2d6 et tenue à deux mains corrigées, variante semi-aléatoire à sept +1 intégrée. Les 27 familles de refus antérieures et les 27 groupes actuels ont leur revue avec exemples et contreparties. 27 suites passent ; la matrice est rejouée sur le nouveau moteur. Voir les preuves `QA/N1/lot2/`. N1 reste ouvert ; N2 et N3 attendent.
