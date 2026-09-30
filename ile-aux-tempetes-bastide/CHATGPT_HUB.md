# Île aux Tempêtes — Table de la Bastide

## Périmètre impératif

- Travailler uniquement dans `ile-aux-tempetes-bastide/`.
- Ne jamais modifier `ile-aux-tempetes/` ni `forge-of-heroes/` pour une demande concernant la Bastide.
- Le scénario, les cartes, les scènes, le journal et les outils narratifs sont communs à la campagne.
- Les personnages, les sauvegardes et les règles de jeu sont propres à la Bastide.

## Système

- Système cible : Chroniques Oubliées Fantasy 2.
- Les anciennes fiches D&D/Nespresso ont été supprimées de cette instance.
- Le personnage `demo` est un test technique fondé sur Forge `MANUAL_02`; il ne doit pas être présenté comme un prétiré officiel BBE.
- Schéma cible des personnages : `bastide-character-v1`.
- Préfixe de sauvegarde : `iot_bastide_cof2_`.

## État après création des premiers personnages

- Accueil Bastide différencié vert forêt / or.
- Espace joueurs réorganisé autour d’un accès principal à la fiche.
- Trois fiches COF2 Bastide sont intégrées : Prépôtante, Scanlan et Wilfried.
- La fiche de démonstration reste présente techniquement mais n’est plus proposée dans le registre joueurs.
- Le gestionnaire de combat D&D a été retiré de Bastide.
- La distribution en ligne des découvertes doit rester désactivée tant que les destinataires Bastide ne sont pas isolés du groupe Nespresso côté données.

## Import des personnages suivants

1. Exporter chaque héros depuis Forge ou relever la fiche papier.
2. Transformer les données dans le schéma `bastide-character-v1`.
3. Ajouter le personnage au registre Bastide.
4. Tester PV, DEF, INIT, PC/PM, attaques, capacités, équipement et sauvegarde locale.
5. Créer les destinataires Bastide du système de découvertes avant son activation.
