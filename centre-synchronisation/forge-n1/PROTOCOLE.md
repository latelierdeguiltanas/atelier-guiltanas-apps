# Première certification N1 — chaque personnage à profil pur

Le Copilote suit d'abord **112 combinaisons : 14 profils du Livre de base × 8 peuples du Livre de base, exclusivement en profil pur**. Un profil peut être validé avec un peuple et encore ouvert avec un autre. Pour chaque combinaison, le registre `purs.json` liste les cinq voies et les rangs 1 à 3, les avantages raciaux, les caractéristiques, les valeurs de combat, les restrictions d'armes et d'armure, les âges, historiques, sauvegardes, interfaces et PDF. Les tests historiques restent des preuves à exploiter, pas l'écran de suivi.

**Trois états distincts** : la création témoin a réussi ; les effets des capacités restent à vérifier ; la création du personnage est totalement certifiée. Un texte de rang présent ne vaut PAS un bonus ou un effet validé. Un rang accessible au niveau 1 via l'âge n'est pas écarté parce que son numéro est 2 ou 3. Le refus d'un paquetage interdit (petite taille Halfelin, bouclier, etc.) impose de vérifier les alternatives légales et non de déclarer automatiquement un bug.

**Pourcentage par personnage** = nombre de ses **14 critères explicitement acquis / 14** ; un critère partiellement vérifié reste ouvert. Les anciens 69 % par profil/peuple tous modes confondus sont un autre indicateur, conservé dans les archives ; ils ne doivent PAS être recopiés dans la grille des 112. Le numéro de version du moteur est enregistré ; 100 % nécessite toutes les variantes légales de la combinaison, les effets conditionnels, les rangs accessibles, les choix et équipements, les PDF et le parcours complet. Ce point de référence devient le certificat gelé ; tout changement ultérieur ne réouvre que les règles affectées.

**Ordre des phases** : (1) personnages à profils purs 112/112 ; (2) hybrides et mode sans profil ; (3) extensions Compagnon COF2 V2 sur leurs PDF actualisés. Ces derniers n'empêchent pas de clôturer les personnages purs officiels.

---

# Certification Forge N1 — livre de base COF2 — contrat de gel

## Périmètre qui doit atteindre 100 %
- **8 peuples officiels** : Demi-elfe, Demi-orc, Elfe haut, Elfe sylvain, Gnome, Halfelin, Humain et Nain.
- **14 profils officiels** : Arquebusier, Barbare, Barde, Chevalier, Druide, Ensorceleur, Forgesort, Guerrier, Magicien, Moine, Prêtre, Rôdeur, Sorcier et Voleur.
- Les **8 peuples et 3 profils Compagnon adaptés de COF1** restent documentés à part, sans entrer dans le dénominateur de fermeture, tant que le PDF Compagnon COF2 V2 n'a pas été fourni et étudié.
- Le mode « sans profil » est inclus pour les voies des 14 profils officiels ; « sans aucune voie » reste un choix non permis par le moteur actuel et par la création standard N1.

## Mesure suivie par le Copilote
Données publiques techniques, non personnelles : `centre-synchronisation/forge-n1/progress.json` ; génération à partir de `FINAL_FREEZE_TESTS/n1_official_progress_ledger.cjs`. Les 16 contrôles *explicitement nommés* de chaque item sont le dénominateur. Le pourcentage est `100 × contrôles PASS / contrôles applicables`, arrondi à l'unité ; les contrôles partiels valent zéro tant que l'ensemble de leur périmètre n'est pas démontré. La liste précise ce qui manque. Ce n'est ni un pourcentage de test cases qui réussissent ni une probabilité qu'un utilisateur ne rencontre aucun bug.

## Preuves actuellement préservées
- Matrice N1 de 179 120 essais ; empreintes moteur et données réutilisables sur la révision du 02/11/2026 (`QA/N1/version-parity.json`).
- 37/37 régressions, puis 5/5 vérifications de socle par profil (`QA/N1/profile-checkpoint.json`).
- Oracle de peuples R1/R2 du livre de base rejoué sur le moteur actuel (`QA/N1/lot10/people-source.json`).
- Contrôles répartis par item : 56 840 tentatives, 55 475 acceptées, 1 365 refus initialement classés d'après la source et les preuves de restrictions, zéro erreur d'assertion sur les acceptés (`QA/N1/native-items.json`, `QA/N1/native-rejection-legality.json`).
- Demi-elfe : 672 cas d'héritage et d'ajustement R1/R2 sur 14 profils et deux versions, 672 réussis après correction des fixtures illégales (`QA/N1/demi-elfe-source-r1-r2.json`).
- Cas Chrome ciblés antérieurs et Android émulé : témoins de fonctionnement, pas des certificats universels.

## À 100 % d'un item
Conserver les preuves, la liste de cas/refus légal, les versions du moteur, de la DB, des règles, du rendu UI et du PDF, et la date. Geler son certificat au périmètre vérifié. Ne plus relancer les suites massives d'un item gelé sauf si ses dépendances ont effectivement changé. Ne jamais convertir un rapport global en certificat individuel.

## Clôture définitive du N1 officiel
Attendre **8/8 peuples + 14/14 profils à 100 %**, 0 anomalie non qualifiée, recette réelle des parcours N1 sur la version finale, PDF officiel et sauvegarde/reprise validés, toutes les options et rangs accessibles au N1 (y compris âge, historiques, mage, équipements et hybridation légale). Publier un certificat avec empreintes et commit figés. Les extensions Compagnon V2 ultérieures auront **leur propre périmètre** et ne doivent pas remettre à zéro la certification historique du livre de base. Un changement ultérieur de règle ou de moteur partagé impose uniquement les contrôles des dépendances modifiées, pas un effacement de la validation acquise.

**Le travail est réalisé par l'assistant** via des tests et vérifications reproductibles. Aucune recette n'est imposée à l'utilisateur.
