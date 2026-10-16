# Carnet des héros — passage N1 → N2

Version du 16 octobre 2026. Six héros Bastide : Prépotante, Scanlan, Wilfried, Vivelame, Zéphéline et Faëlar. Les créations génériques et les niveaux 3+ ne sont pas couverts.

## Parcours joueur

1. Dans Forge, ouvrir le héros récupéré et « Niveau suivant », ou importer son JSON dans le Carnet.
2. Vérifier la base. « Utiliser la fiche actuelle du hub » permet de choisir explicitement la référence Bastide si la sauvegarde locale est ancienne. Prépotante utilise Roublard, conformément au hub.
3. Figer la base, dépenser les deux points et lire le bilan. Les textes complets sont dépliables ; les rangs futurs inaccessibles sont masqués.
4. Valider le niveau 2 et exporter **Fiche niveau 2 pour le hub**. La sauvegarde du carnet reste un fichier distinct.
5. Dans la fiche Bastide, **Importer mon niveau 2**. Le service vérifie l’identité et rejoue la progression avant enregistrement. La fiche est partagée entre les appareils via l’accès habituel. Objets, messages et notes ne sont pas remplacés.

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

Fixtures DOM/stockage et serveur simulé : aucune validation visuelle ni test au clic sur téléphone. L’impression utilise le navigateur, pas le formulaire officiel interactif. Les verrous et le rejeu ne constituent pas une signature cryptographique du MJ.
