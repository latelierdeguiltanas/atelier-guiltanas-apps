# Carnet des héros — passage N1 → N2

Version du 16 octobre 2026. Six héros Bastide : Prépotante, Scanlan, Wilfried, Vivelame, Zéphéline et Faëlar. Les créations génériques et les niveaux 3+ ne sont pas couverts.

## Parcours joueur

1. Dans Forge, ouvrir le héros récupéré et « Niveau suivant », ou importer son JSON dans le Carnet.
2. Vérifier la base. « Utiliser la fiche actuelle du hub » permet de choisir explicitement la référence Bastide si la sauvegarde locale est ancienne. Prépotante utilise Roublard, conformément au hub.
3. Figer la base, dépenser les deux points et lire le bilan. Les textes complets sont dépliables ; les rangs futurs inaccessibles sont masqués.
4. Importer une fois le modèle officiel éditable ou sa fiche N1 déjà exportée (les annexes existantes sont retirées en mémoire). Valider N2 : le PDF officiel est préparé, le niveau sauvegardé, puis le téléchargement déclenché. Un échec de modèle ou de génération empêche la validation. Le bouton de retéléchargement reste disponible.
5. Depuis le lien « Passage de niveau » placé en haut de la fiche Bastide, le carnet récupère le niveau serveur et synchronise la validation automatiquement. Le JSON pour le hub et son import manuel restent disponibles. Le service contrôle l’identité et rejoue les choix. Objets, messages et notes ne sont pas remplacés.

## Sources

43 voies, 195 rangs : 170 entrées du livre COF2 (dont cinq dons de druide R1), 15 du Compagnon COF1 et 10 rangs d’historique transcrits des photos fournies. Les résumés d’ensorceleur et de prêtre sont remplacés par les paragraphes complets. Les renvois utiles de la fée et du loup sont inclus. Espaces, césures et mise en page sont normalisés. Le fichier text-audit.json répertorie provenance et empreintes.

Les trois voies Compagnon restent étiquetées COF1/adaptation de table. Elles ne sont pas des voies officielles COF2. Les valeurs N1 de la table sont conservées : cette livraison ne certifie pas rétroactivement tous les choix avancés de création.

## Calculs et transfert

PV de famille + CON, +1 aux attaques, PM des nouveaux sorts, nouveaux bonus permanents et progression Archer/loup. Les effets conditionnels restent dans les textes. Les historiques sont rejoués à l’import ; actualiser les textes ne permet pas de modifier chiffres ou choix. L’équipement exporté reste celui de référence ; l’inventaire de partie reste dans le hub.

Le service isolé bastide-character utilise les accès MJ/PJ existants et une table sans lecture publique. Il accepte uniquement FOH_HUB_CHARACTER niveau 2, contrôle les chiffres et refuse les conflits d’historique. Un import identique ne redonne pas les gains. Maxima PV/PM et ressources partagées sont enregistrés dans une transaction, en conservant les ressources déjà dépensées. Le déploiement ne passe automatiquement aucun personnage au niveau 2.

## Vérifications et limites

- 226 plans ordonnés N2 : calculs, budgets, prérequis, sauvegardes et corruptions.
- Six parcours de progression et six imports Forge/carnet sur stockage neuf.
- Six exports → handler serveur → relecture ; faux chiffres/mauvais héros refusés ; imports identiques sans double gain.
- Rendu JS des six fiches Bastide en vues simplifiée/complète et avec niveau 2 synchronisé.
- Transaction SQL avec rollback : ressources dépensées et concurrence. HTTP sans clé refusé (401).

Fixtures DOM/stockage et serveur simulé : aucune validation visuelle ni test au clic sur téléphone. L’impression simple reste disponible ; l’export officiel N2 est désormais généré automatiquement après préparation et sauvegarde réussies. Les verrous et le rejeu ne constituent pas une signature cryptographique du MJ.


## Complément du 16 octobre — PDF officiel et corrections

Les six PDF ont été générés avec un véritable formulaire officiel à 163 champs issu d’une fiche N1 fournie. Contrôle des valeurs NIVEAU/PV/PM/DEF/INIT/caractéristiques et des 25 coches de voies de profil ; présence des apparences, cohérence des champs et widgets. Les deux pages officielles sont suivies des annexes complètes et d’un complément attaques/compagnons. Rendu inspecté, notamment Faëlar page 2 et l’annexe de Zéphéline. Les tailles propres aux widgets PDF sont écrasées pour empêcher les débordements. La dépendance pdf-lib est copiée de la version déjà intégrée à Forge, sans nouvelle dépendance distante. Aucun modèle PDF privé n’est publié.

Les choix N2 restent corrigeables pendant 14 jours à compter de la première validation. Une correction rejoue les nouveaux choix depuis N1, conserve la date de départ, enregistre une chaîne de corrections et redéclenche le PDF. Le serveur accepte cette chaîne pendant la fenêtre ; une ancienne correction ne peut pas remplacer la plus récente. N3+ reste fermé.

Tests complémentaires : six PDF officiels, six corrections avec contrôle du délai et absence de double gain ; 16 parcours UI dont refus sans modèle/échec PDF sans validation, un téléchargement par validation/correction, récupération depuis un autre appareil et synchronisation automatique. Aucun test au clic réel sur téléphone : le navigateur peut demander d’autoriser le téléchargement ; le bouton PDF permet de réessayer.
