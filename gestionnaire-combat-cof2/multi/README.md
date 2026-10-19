# Gestionnaire COF2 — campagnes et one-shots

Édition générique issue du gestionnaire historique voisin. Moteur de combat manuel et profils existants repris, sans bridge Bastide ni PJ préchargés dans les campagnes génériques.

- Accueil général sans fiche, rencontre ou combat affiché avant le choix d’un environnement.
- Cartes séparées pour chaque campagne et one-shot, avec retour possible à l’accueil depuis le gestionnaire.
- Île aux Tempêtes proposée uniquement par l’accès privé `?pack=island` ou lorsqu’elle est déjà installée dans l’espace ; elle n’apparaît pas chez les autres MJ.
- À la première installation du pack privé, reprise possible de l’état local du gestionnaire historique et, à défaut, chargement des sept participants préparés.

- Entrée depuis le hub : Outils de séance.
- Campagnes et one-shots : mêmes fonctions, états indépendants.
- Pack privé Île aux Tempêtes : 19 rencontres ; base commune de 20 profils existants, adaptations clairement signalées.
- Monstres personnalisés : caractéristiques, PV, DEF, initiative, NC, attaques, capacités, source et notes. Variantes copiées sans altérer les profils de base.
- Préparations personnalisées : composition manuelle, notes et niveau de référence ; aucun équilibrage automatique garanti.
- Import explicite des valeurs essentielles des PJ du cache local du hub, sans mise à jour des fiches ni du combat déjà chargé.
- Cache local séparé par UUID d’espace hub, complété par une synchronisation distante lorsqu’on ouvre l’outil depuis un lien MJ du hub. Audio du Soundboard indépendant. Aucun jet automatique.
- Sauvegarde JSON complète des campagnes de cet espace, incluant monstres et états. Import validé en nouvelles copies ; aucun écrasement. Les exports historiques du gestionnaire voisin restent à utiliser avec sa propre URL.
- Le même lien MJ retrouve les campagnes, bestiaires personnels, rencontres, PJ et combats en cours sur téléphone et ordinateur. Une copie locale reste disponible en cas de coupure et l’export JSON demeure recommandé avant une modification importante.
- À la première ouverture depuis le hub sur l’appareil qui possède déjà les préparations historiques, la bibliothèque autonome est reprise dans l’espace synchronisé avant son premier envoi.
- Un conflit entre deux appareils modifiant simultanément le même espace n’est jamais écrasé silencieusement : les données locales sont conservées et l’outil demande un export avant rechargement.
- Gestionnaire historique et données Bastide inchangés.

Tests : `node tests/campaigns.test.mjs` ; pas de test navigateur IA.
