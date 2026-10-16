# Gestionnaire COF2 — campagnes et one-shots

Édition générique issue du gestionnaire historique voisin. Moteur de combat manuel et profils existants repris, sans bridge Bastide ni PJ préchargés.

- Entrée depuis le hub : Outils de séance.
- Campagnes et one-shots : mêmes fonctions, états indépendants.
- Pack Île aux Tempêtes facultatif : 19 rencontres ; base commune de 20 profils existants, adaptations clairement signalées.
- Monstres personnalisés : caractéristiques, PV, DEF, initiative, NC, attaques, capacités, source et notes. Variantes copiées sans altérer les profils de base.
- Préparations personnalisées : composition manuelle, notes et niveau de référence ; aucun équilibrage automatique garanti.
- Import explicite des valeurs essentielles des PJ du cache local du hub, sans mise à jour des fiches ni du combat déjà chargé.
- localStorage séparé par UUID d’espace hub. Audio du Soundboard indépendant. Aucun jet automatique.
- Sauvegarde JSON complète des campagnes de cet espace, incluant monstres et états. Import validé en nouvelles copies ; aucun écrasement. Les exports historiques du gestionnaire voisin restent à utiliser avec sa propre URL.
- Pas de synchronisation distante dans cette édition : exporter/importer pour changer d’appareil. Pas de service worker autonome pour les combats.
- Gestionnaire historique et données Bastide inchangés.

Tests : `node tests/campaigns.test.mjs` ; pas de test navigateur IA.
