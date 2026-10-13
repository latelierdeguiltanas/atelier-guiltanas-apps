window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "vivelame",
  "name": "Vivelame",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Export Forge of Heroes - 30 septembre 2026",
  "level": 1,
  "people": "Âme-forgée",
  "family": "Aventurier",
  "profile": "Arquebusier",
  "age": "Vénérable",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "AGI": 2,
    "CON": 1,
    "FOR": 0,
    "PER": 0,
    "CHA": -2,
    "INT": 3,
    "VOL": 0
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 9,
    "pcMax": 1,
    "pmMax": 0,
    "recoveryDie": "D8",
    "recoveryMax": 3,
    "init": 10,
    "def": 16,
    "contact": 1,
    "distance": 3,
    "magic": 1,
    "silver": 0
  },
  "attacks": [
    {
      "id": "petoire",
      "name": "Pétoire",
      "type": "Distance",
      "attack": 3,
      "damage": "1d10",
      "range": "20 m",
      "special": ""
    },
    {
      "id": "javelot-vivelame",
      "name": "Javelot",
      "baseRule": "Épée longue",
      "type": "Contact",
      "attack": 1,
      "damage": "1d8",
      "damageType": "Perforant",
      "range": "Contact",
      "special": "Apparence personnalisée ; profil mécanique de l’épée longue"
    },
    {
      "id": "dague-contact",
      "name": "Dague",
      "type": "Contact",
      "attack": 1,
      "damage": "1d4",
      "range": "Contact",
      "special": ""
    }
  ],
  "equipment": [
    "Pétoire",
    "Javelot (profil mécanique : épée longue)",
    "Dague",
    "Cuir renforcé / broigne"
  ],
  "paths": [
    {
      "name": "Voie du peuple - Âme-forgée",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Main lourde",
          "text": "À mains nues, l’âme-forgée inflige 1d6 DM létaux.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 9,
            "chapter": "Nouveaux peuples",
            "section": "voie-de-lâme-forgée — rang 1"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_located",
            "ruleTextStatus": "present_non_certified",
            "conversionStatus": "FOH_VALIDATED",
            "functionalStatus": "tested_n1",
            "enabledInCertifiedN1": true,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "validated_lot_a_fix67",
            "validatedBy": "FIX67"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Choc électrique (L)",
          "text": "Sur une attaque à mains nues réussie, l’âme forgée inflige 1d6 dégâts d’électricité par rang dans cette voie, dégâts de l’attaque à mains nues inclus.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 9,
            "chapter": "Nouveaux peuples",
            "section": "voie-de-lâme-forgée — rang 2"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_located",
            "ruleTextStatus": "present_non_certified",
            "conversionStatus": "pending_individual_analysis",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated"
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Camouflage",
          "text": "Vous pouvez faire croire à ce qui vous entoure que vous êtes un humain pendant une heure. Vous ne pouvez utiliser cette capacité qu’une fois par jour. Vous ne pouvez pas prendre l’apparence d’une personne en particulier.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 9,
            "chapter": "Nouveaux peuples",
            "section": "voie-de-lâme-forgée — rang 3"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_located",
            "ruleTextStatus": "present_non_certified",
            "conversionStatus": "pending_individual_analysis",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated"
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Forgé dans la bataille",
          "text": "Une fois par combat, l’âme forgée peut totalement ignorer les dégâts subis par une attaque.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 9,
            "chapter": "Nouveaux peuples",
            "section": "voie-de-lâme-forgée — rang 4"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_located",
            "ruleTextStatus": "present_non_certified",
            "conversionStatus": "pending_individual_analysis",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "Machine de guerre",
          "text": "L’âme forgée devient une force impossible à ignorer sur le champ de bataille. Elle augmente ses scores de Constitution et de Force de +2.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 9,
            "chapter": "Nouveaux peuples",
            "section": "voie-de-lâme-forgée — rang 5"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_located",
            "ruleTextStatus": "present_non_certified",
            "conversionStatus": "pending_individual_analysis",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated"
          }
        }
      ]
    },
    {
      "name": "Voie du pistolero",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Plus vite que son ombre",
          "text": "Si son arme à poudre est chargée et tenue en main, l’arquebusier peut tirer avec un bonus de +5 à son Initiative. De plus, il ne subit plus de dé malus lorsqu’il tire avec une arme à poudre ou une arbalète en étant engagé en combat au contact (sauf avec la couleuvrine).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 65,
            "section": "Voie du pistolero — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "functionalStatus": "N1_CERTIFIED",
            "structured": true,
            "engineConnected": true,
            "oracleTested": true,
            "negativeTested": true,
            "crossTested": true,
            "validatedBy": "FIX73"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Ajuster le tir",
          "text": "Après avoir raté une attaque à distance, l’arquebusier déclare qu’il s’agissait d’un tir de réglage. Il obtient +5 sur le test de sa prochaine attaque à distance, si son prochain tir vise la même cible avant la fin du prochain round.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 65,
            "section": "Voie du pistolero — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "functionalStatus": "ADVANCED_N1_CONNECTED",
            "structured": true,
            "ageAccessibleN1": true
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Tir double (L)",
          "text": "L’arquebusier est capable de tirer simultanément avec une pétoire (ou une arbalète de poing) dans chaque main avec un malus de ‑2 à chaque attaque. S’il décharge ses deux armes sur la même cible, il ne subit aucun malus.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 65,
            "section": "Voie du pistolero — rang 3",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "functionalStatus": "ADVANCED_N1_CONNECTED",
            "structured": true,
            "ageAccessibleN1": true
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Agilité héroïque",
          "text": "L’arquebusier augmente sa valeur d’AGI de +1 et il obtient un dé bonus aux tests d’AGI.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 65,
            "section": "Voie du pistolero — rang 4",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_ability_conflict_audit_pending",
            "functionalStatus": "not_tested"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "As de la gâchette",
          "text": "Lors d’une attaque à distance avec une arme à poudre ou une arbalète, s’il obtient un résultat d’attaque supérieur ou égal à la DEF de son adversaire +10 points, l’arquebusier obtient un bonus de +2d4° aux DM de son attaque.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 65,
            "section": "Voie du pistolero — rang 5",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_ability_conflict_audit_pending",
            "functionalStatus": "not_tested"
          }
        }
      ]
    },
    {
      "name": "Voie des montagnes",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Habitant des montagnes",
          "text": "Le personnage obtient un bonus de +3 aux tests de discrétion et de survie en montagne.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 174,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Grimpeur",
          "text": "Le personnage obtient un bonus de +3 à tous les tests d’escalade et divise par deux tous les DM de chute.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 174,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Résistance au froid",
          "text": "Le personnage gagne une RD 3 contre les DM de froid.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 174,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Terrain de prédilection",
          "text": "Le personnage gagne +2 en attaque et en DEF lorsqu’il combat sur une forte déclivité. Cette capacité fonctionne aussi dans un escalier.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 174,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "Danger des montagnes",
          "text": "Le personnage obtient un bonus de +2 en DEF contre les attaques des géants et +1d4° aux DM de ses attaques.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 174,
            "scope": "Texte relu sur le PDF fourni"
          }
        }
      ]
    },
    {
      "name": "Voie du nomade",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Sens de l’orientation",
          "text": "Le personnage obtient un bonus de +3 pour s’orienter ainsi que pour prédire la météo dans les prochaines 24 h.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 180,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Voyageur",
          "text": "Le personnage gagne un bonus de +3 aux tests de récupération lorsqu’il dort à la belle étoile et au test de PER (Survie) pour déterminer les événements (voir les règles de voyage, COF page 233).",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 180,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Chasseur-cueilleur",
          "text": "Le personnage peut se nourrir tout en progressant à un rythme de déplacement normal. S’il réussit un test de PER (Survie) dont la difficulté dépend de la dangerosité de la région (voir les règles de voyage, COF page 233), il peut nourrir une autre personne en plus de lui.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 180,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Je suis déjà venu",
          "text": "Lorsque le personnage arrive dans une localité, le joueur peut dépenser (au choix) 1 DR ou 1 PC pour être déjà venu. Dans ce cas le MJ lui indique les lieux les plus connus et il obtient un contact de confiance dans la place. De plus, lorsqu’il fait du commerce dans cette localité, il réduit d’un niveau la rareté des objets qu’il recherche (par exemple, un objet très rare devient seulement rare). La dépense du DR ou du PC est valable pour toute l’aventure en cours.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 180,
            "scope": "Texte relu sur le PDF fourni"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "Attentif",
          "text": "Les routes sont parfois dangereuses et savoir éviter les combats est la meilleure façon de survivre au voyage. Le personnage gagne +1 en PER.",
          "source": {
            "document": "Voies d’historique — COF2",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 180,
            "scope": "Texte relu sur le PDF fourni"
          }
        }
      ]
    }
  ],
  "rulesAudit": "Textes COF2 confrontés au PDF officiel fourni ; historique relu sur son PDF. Les peuples Compagnon restent des conversions COF1 identifiées par leur source."
};
