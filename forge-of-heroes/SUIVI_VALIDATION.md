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

### Lot 3 N1 — confrontation visuelle aux PDF, 28 octobre 2026

- Livre de base p.55 : omission du halfelin dans les restrictions de taille corrigée, avec le nombre de mains projeté et les refus d’armes interdits dans les trois modes. Preuve avant/après : `QA/N1/lot3/halfelin-before-after.json` ; 120 contrôles d’équipement sur les deux produits.
- Règles avancées p.153 : suppression du bonus résiduel PC/DR après changement de catégorie d’âge. Six cas fautifs avant correction, puis 24 cas conformes et 22 sauvegardes/relectures. Les attentes numériques et les budgets sont calculés indépendamment pour le voleur humain.
- Pages sources, lecture visuelle et empreintes PDF : `QA/N1/lot3/sources.json`. Les autres peuples/profils du Compagnon conservent leur statut d’adaptation Forge.
- N1 reste ouvert ; N2/N3 en attente. Les réserves détaillées du README demeurent actives, notamment parcours mobile et effets numériques non encore vérifiés indépendamment. Pas de clôture automatique à partir des compteurs.

- Extension des interactions jeune/très jeune aux 17 profils et 85 voies : 850 cas et 850 sauvegardes/relectures passent sur les deux produits. Chaque calcul est comparé à sa référence sans âge, avec seulement les écarts prévus par la règle. La validation numérique absolue de chaque capacité reste une réserve distincte.
