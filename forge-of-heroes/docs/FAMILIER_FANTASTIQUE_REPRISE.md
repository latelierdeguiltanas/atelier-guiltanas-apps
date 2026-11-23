# Reprise de la certification du guerrier — 23 novembre 2026

La demande de guerrier intégral N1–10 n’est pas clôturée. État vérifiable : 25 capacités du profil ; 13 voies de prestige complètes jusqu’aux rangs accessibles avant N11 ; Familier fantastique disponible au seul rang 3 pour le guerrier pur avec compagnon rencontré. Ne pas annoncer « 14 voies complètes » ni « 100 % ».

## Sources déjà localisées

Livre de base COF2 fourni : p. 132–133 pour la voie et son exception de rang ; p. 133–136 pour les douze familles, treize choix avec fée/lutin séparés. Bestiaire, section types de créatures : non-vivant intelligent immunisé aux poisons, maladies et attaques exigeant un test de CON, sans immunité mentale générale.

Le rang 3 coûte deux points, niveau minimal 3. Le rang 4 attend N5, R5 N7 et R6 N9 ; R7 ne concerne pas N10. La récupération rapide restaure les PV du familier présent, la récupération complète permet le retour d’un familier vaincu. Ne pas ressusciter un compagnon dont la mort inéluctable a été confirmée : nouveau familier au niveau suivant. Le sort Familier préexistant demande encore un parcours de création/progression avec capacités magiques ; son origine n’est pas offerte gratuitement au guerrier pur.

## Suite à implémenter

1. R4 : pouvoirs mineurs propres aux familles. Animal céleste : Compréhension des langues orale 1/jour. Mort-vivant : Siphon des âmes, effet doublé si déjà acquis. Araignée : Toile, portée 5 m, attaque magique, 1/combat, durée 1d6 rounds et libération FOR 12 (M). Diablotin : transformation animale (M). Dragon féérique : Image décalée 2/jour. Fée/lutin : Invisibilité 2/jour. Grig : Prison végétale 2/jour. Lézard : Sous tension 2/jour (renvoi de rang incohérent dans le texte : vérifier la capacité réelle). Minimoi : Imitation 1/jour. Pseudo-dragon : Télépathie 50 m, langage commun nécessaire. Pantin : Serviteur invisible 3/jour. Strige : Saignement 3/jour.
2. R5 : RD de 1 par rang, choix de sort R1/R2 du profil indiqué (quotas 2/jour ou 1/jour). Minimoi : capacité R1/R2 du profil principal même non magique. Le texte du pantin évoque un cumul de sa RD 5 « à partir du rang 6 » : conserver l’ambiguïté comme point à résoudre ; ne pas choisir silencieusement une interprétation.
3. R6 : rappel téléporté au contact (M), +1 PC permanent dans progression, PDF et fiche ; préserver les PC dépensés pendant l’actualisation.
4. Vérifier les interactions des pouvoirs prêtés avec les capacités déjà connues, les choix sauvegardés, le rang effectif, l’armure, les coûts/quota spécifiques et les remises à zéro. Les pouvoirs R7 et la caractéristique associée restent fermés avant N11.
5. Expert reste bloqué : les prérequis et le choix des sources ont leurs validateurs, les capacités empruntées ne sont pas encore intégrées dans tous les contrôleurs. Chevalier dragon et Guerrier-mage demandent leurs vrais parcours hors guerrier pur. Nouveaux rangs de peuple/historique non certifiés N10.

## Fichiers et preuves

- `ENGINE/familier-fantastique.js` : calculs et état R3, aucune capacité R4/R5 accordée.
- `progression/prestige.js` : porte R3 exceptionnelle ; R4+ explicitement bloqués.
- `progression/warrior.js` : projection du compagnon dans les annexes PDF.
- `fiches-personnages/fiche/fiche.js` : contrôles embarqués à synchroniser via `scripts/sync-familier-fantastique.cjs`.
- Miroirs serveur dans `supabase/functions/bastide-character/` ; le chemin require du module familier y est adjacent.
- `FINAL_FREEZE_TESTS/familier_fantastique.cjs`, `fiches-personnages/tests/familier-fantastique.cjs`, `FINAL_FREEZE_TESTS/familier_fantastique_pdf.cjs`.
- `QA/N10/familier-fantastique-r3*.json` ; certification générale dans `guerrier-prestige-certification.json`, statut PARTIAL.

Les tests PDF nécessitent le modèle officiel privé fourni : ne pas le publier. Ne pas modifier les projets Île aux Tempêtes en travaillant sur ce lot. GitHub reste la source durable ; conserver les tests et preuves en ligne.
