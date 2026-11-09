# Bastide : objets et installations — 9 novembre 2026

## Installations

- Bastide conserve son identité historique `/` et ouvre explicitement le hub. La bibliothèque « Mes fiches » a une identité propre, distincte de celles de ses fiches individuelles. Le manifeste statique et celui du service worker concordent. Référence : [W3C, identité du manifeste](https://www.w3.org/TR/appmanifest/#id-member).
- La bibliothèque propose son bouton d’installation et un lien vers la Bastide. Revenir d’une fiche à la bibliothèque restaure le manifeste de la bibliothèque et invalide la demande d’installation de la fiche. Les retours de la Bastide ont une destination explicite.
- La mise à jour remplace le cache de ressources de Mes fiches ; elle ne supprime ni données locales, ni coffres, ni fiches. La mise à jour des raccourcis précédemment installés dépend du navigateur de l’appareil.

## Catalogue et préparation

Le script [bastide_fire_scales_20261109.sql](../supabase/bastide_fire_scales_20261109.sql) n’écrit que dans le catalogue MJ, pour six identifiants fixes. Un second passage avec les mêmes valeurs ne réécrit pas les lignes.

- Harnais des braises : une réduction manuelle de 2 DM pour le loup par combat, minimum 0.
- Bouclier du Refuge : petit bouclier, DEF +1 en remplacement de l’ancien bouclier. Une fois par combat, porteur conscient et bouclier équipé, un allié adjacent reçoit +2 DEF pour une seule attaque, sur déclaration avant le jet adverse.
- Dé à coudre : +2 à un test de manipulation précise, déclaré avant le jet, une fois par scène.
- Bague : après une attaque réussie pendant son tour, +2 DM non multipliés par le critique, ou déplacement d’un petit objet libre, une fois par combat.
- Pince et épingle : effets utilitaires, sans bonus chiffré.

Les effets limités sont suivis manuellement. La page « Objets et envois » charge désormais le script de préparation avant son utilisation. Elle prépare un objet non équipé et garde les notes MJ privées.

## Vérifications du correctif

- Tests d’identités du hub, de la bibliothèque et de deux fiches ; retours directs et fermeture des couches ; aucun secret transmis pour un objet non identifié.
- Test du vrai gestionnaire de clic avec six confirmations annulées, sans appel réseau ; profils conservés après filtrage serveur ; bouclier testé sans cumul de DEF.
- En production avant l’opération : aucune ligne correspondant aux six objets, clé primaire sur `id`, aucun déclencheur sur le catalogue, six inventaires et 97 événements d’inventaire relevés. Le relevé avant/après est réalisé séparément de ce commit.
