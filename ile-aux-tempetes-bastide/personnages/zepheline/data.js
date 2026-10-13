window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "zepheline",
  "name": "Zepheline",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Export Forge of Heroes - 30 septembre 2026 ; correction MJ : Invocation R1–R2 remplace Divination",
  "level": 1,
  "people": "Fée",
  "family": "",
  "profile": "Ensorceleur",
  "age": "Vénérable",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "AGI": 1,
    "CON": -2,
    "FOR": -2,
    "PER": 0,
    "CHA": 2,
    "INT": 2,
    "VOL": 3
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 4,
    "pcMax": 4,
    "pmMax": 8,
    "recoveryDie": "D6",
    "recoveryMax": 0,
    "init": 11,
    "def": 13,
    "contact": -1,
    "distance": 2,
    "magic": 4,
    "silver": 0
  },
  "traits": [
    "Vision dans le noir à 30 m",
    "Vol : 10 m par action ; doit rester en mouvement et chute si elle est immobilisée ou incapable d’agir",
    "+3 aux tests de discrétion",
    "+1 en DEF",
    "FOR maximale : -1",
    "Armes limitées au d4",
    "Armure légère ajustée uniquement",
    "Aucun bouclier en vol"
  ],
  "attacks": [
    {
      "id": "sous-tension",
      "name": "Sous tension (M)*",
      "type": "Magique",
      "attack": 4,
      "damage": "1d4+CHA",
      "range": "10 m",
      "special": "Pendant CHA minutes : 1d4° DM à qui la blesse ou la touche au contact"
    },
    {
      "id": "choc",
      "name": "Choc (A)*",
      "type": "Magique",
      "attack": 4,
      "damage": "1d4° + CHA",
      "range": "20 m",
      "special": "Si le NC de la cible est inférieur à 2 : test de FOR difficulté 10 ou cible renversée."
    }
  ],
  "equipment": [
    {
      "id": "arc-feerique",
      "name": "Arc féerique",
      "base": "Arc adapté à une Fée",
      "category": "Arme",
      "quantity": 1,
      "equipped": true,
      "equipment": {
        "slot": "main_hand",
        "effect": "Arc adapté à sa taille.",
        "weapon": {
          "modes": [
            {
              "label": "Distance",
              "attackType": "distance",
              "damage": "1d4",
              "damageType": "perforant",
              "range": "30 m",
              "attackBonus": 0,
              "damageBonus": 0
            }
          ]
        }
      }
    }
  ],
  "paths": [
    {
      "name": "Voie du peuple - Être féerique",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Langage des animaux",
          "text": "Le personnage comprend et peut parler aux animaux. Il gagne +3 aux tests destinés à les comprendre, les calmer ou communiquer avec eux.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 19,
            "chapter": "Nouveaux peuples",
            "section": "voie de l’être féerique — rang 1"
          },
          "certification": {
            "scope": "n1_extension",
            "sourceStatus": "official_cof1_source_extracted",
            "ruleTextStatus": "certified_source_text",
            "conversionStatus": "FOH_VALIDATED",
            "functionalStatus": "tested_n1",
            "enabledInCertifiedN1": true,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "validated_lot_b_fix68",
            "legacyAdaptationStatus": "replaced",
            "validatedBy": "FIX68"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Invisibilité (L)",
          "text": "Le personnage peut se rendre invisible comme s’il utilisait la capacité de magicien du même nom (Voie de la magie universelle) une fois par jour par rang atteint dans la Voie. S’il possède déjà cette capacité, il obtient une capacité d’ensorceleur de rang 1 de son choix.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 19,
            "chapter": "Nouveaux peuples",
            "section": "voie de l’être féerique — rang 2"
          },
          "certification": {
            "scope": "future_progression",
            "sourceStatus": "official_cof1_source_extracted",
            "ruleTextStatus": "certified_source_text",
            "conversionStatus": "ANALYSIS_PENDING",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated",
            "legacyAdaptationStatus": "replaced",
            "validatedBy": "FIX68_SOURCE_ONLY"
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Monture féerique",
          "text": "Le personnage apprivoise un animal qui lui sert de monture, souvent une monture volante comme un aigle pour un lutin et une monture terrestre comme un loup ou une panthère pour une fée. Monture : Init 16, DEF 16, PV [niveau x 4], attaque au contact = [niveau du personnage +1], DM 1d6+2, FOR +2, DEX +2*, CON +2*, INT -2, SAG +2*, CHA -2. La monture volante inflige seulement 1d6 DM avec une FOR de +0.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 19,
            "chapter": "Nouveaux peuples",
            "section": "voie de l’être féerique — rang 3"
          },
          "certification": {
            "scope": "future_progression",
            "sourceStatus": "official_cof1_source_extracted",
            "ruleTextStatus": "certified_source_text",
            "conversionStatus": "ANALYSIS_PENDING",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated",
            "legacyAdaptationStatus": "replaced",
            "validatedBy": "FIX68_SOURCE_ONLY"
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Grande taille (L)",
          "text": "Le lutin ou la fée est capable de prendre une taille humaine pendant [1d6 + Mod. de CHA] minutes trois fois par jour. Sous cette forme, il obtient un bonus de +2 au Mod. de FOR (et donc en attaque et aux DM) et il peut infliger des DM normalement selon l’arme utilisée.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 19,
            "chapter": "Nouveaux peuples",
            "section": "voie de l’être féerique — rang 4"
          },
          "certification": {
            "scope": "future_progression",
            "sourceStatus": "official_cof1_source_extracted",
            "ruleTextStatus": "certified_source_text",
            "conversionStatus": "ANALYSIS_PENDING",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated",
            "legacyAdaptationStatus": "replaced",
            "validatedBy": "FIX68_SOURCE_ONLY"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "Seigneur féerique",
          "text": "Le personnage devient plus sage et charismatique, il est considéré parmi les siens comme un individu de haut rang. Il augmente ses valeurs de SAG et de CHA de +2.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 19,
            "chapter": "Nouveaux peuples",
            "section": "voie de l’être féerique — rang 5"
          },
          "certification": {
            "scope": "future_progression",
            "sourceStatus": "official_cof1_source_extracted",
            "ruleTextStatus": "certified_source_text",
            "conversionStatus": "ANALYSIS_PENDING",
            "functionalStatus": "not_tested",
            "enabledInCertifiedN1": false,
            "origin": "official_cof1",
            "conversion": "foh_cof2_canonical",
            "balanceStatus": "not_validated",
            "legacyAdaptationStatus": "replaced",
            "validatedBy": "FIX68_SOURCE_ONLY"
          }
        }
      ]
    },
    {
      "name": "Voie de l’air",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Murmures dans le vent (G)*",
          "text": "L’ensorceleur chuchote un message d’une dizaine de mots qui voyage jusqu’à son destinataire. Il peut entendre sa réponse immédiatement. La portée est de CHA × 100 m et le personnage doit connaître la cible ou la voir. En plus de ce sort, l’ensorceleur gagne un bonus permanent de +1 en Init. et en DEF, car parfois une bourrasque venue de nulle part vient gêner son attaquant, dévier un projectile ou lui permettre d’entendre un adversaire.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 93,
            "section": "Voie de l’air — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Sous tension (M)*",
          "text": "L’ensorceleur se charge d’énergie électrique pour CHA minutes. Pendant toute la durée du sort, une créature qui le blesse par une attaque de contact ou le touche reçoit une décharge infligeant 1d4° DM. De plus, il peut utiliser une action d’attaque à chaque round pour délivrer une décharge électrique (test d’attaque magique contre DEF de la cible, portée 10 m) infligeant [1d4°+CHA] DM.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 93,
            "section": "Voie de l’air — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 3,
          "owned": true,
          "name": "Télékinésie (A)*",
          "text": "L’ensorceleur peut déplacer dans les airs un objet inerte (qui n’est pas tenu par un adversaire) ou une cible volontaire (par exemple lui‑même) dont le poids n’excède pas 50 kg par rang, à une portée de 20 m et pendant CHA minutes. L’objet peut être maintenu en l’air ou déplacé de 5 m par action de mouvement. Il est possible de faire tomber un objet sur une cible surprise (test d’attaque magique, DM 1d6 par tranche de 50 kg).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 93,
            "section": "Voie de l’air — rang 3",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "advanced_creation",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "functionalStatus": "ADVANCED_CREATION_CERTIFIED",
            "certifiedIn": "FIX125"
          }
        }
      ]
    },
    {
      "name": "Voie de la divination",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Divination (L)*",
          "text": "S’il emporte un test opposé d’attaque magique contre une créature de NC inférieur à son niveau (portée 10 m), l’ensorceleur devine son nom d’usage, son métier et quelques autres renseignements, tous de notoriété publique (si la cible agit sous couverture, ce sont les informations qui concernent la couverture que l’ensorceleur apprend). Si la cible du sort est volontaire et qu’il lit les lignes de sa main, il n’y a pas besoin de test et l’ensorceleur peut utiliser ce sort sur une créature de NC supérieur ou égal à son niveau. En plus de ce sort, l’ensorceleur gagne +1 en Init. et en DEF. Ce bonus augmente de +1 au rang 3 de la voie et de +1 chaque fois que le personnage atteint le rang 5 dans une voie d’ensorceleur.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 93,
            "section": "Voie de la divination — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 2,
          "owned": false,
          "name": "Détection de l’invisible (L)*",
          "text": "Pendant CHA minutes, l’ensorceleur détecte les créatures invisibles (le sort révèle une silhouette, mais pas l’apparence exacte de la créature) ou cachées à moins de 20 m et si un sort de Clairvoyance affecte l’endroit. Aveuglé (par magie ou dans l’obscurité), ce sort lui permet de détecter les créatures présentes (et donc d’attaquer sans malus), mais pas de distinguer son environnement.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 93,
            "section": "Voie de la divination — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        }
      ]
    },
    {
      "name": "Voie de l’envoûteur",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Injonction (A)*",
          "text": "L’ensorceleur donne un ordre simple (mais pas suicidaire) de deux ou trois mots que la cible doit pouvoir comprendre. S’il réussit un test opposé d’attaque magique contre une cible à une portée de 20 m, la victime doit exécuter l’ordre pendant son prochain tour. En plus de ce sort, l’ensorceleur ajoute son rang + 2 aux tests de persuasion ou de séduction.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 94,
            "section": "Voie de l’envoûteur — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 2,
          "owned": false,
          "name": "Sommeil (L)*",
          "text": "Une fois par combat, l’ensorceleur vise une zone de 10 m de diamètre à une portée maximale de 20 m. Le sort affecte jusqu’à [1d4° + CHA] créatures vivantes de NC inférieur à 1. Le sort affecte les créatures de NC inférieur à 2 au rang 4 puis à 3 au rang 5. Les créatures perdent conscience pendant CHA minutes. Il est possible de les réveiller en les cognant violemment (action d’attaque, 1 DM).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 94,
            "section": "Voie de l’envoûteur — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        }
      ]
    },
    {
      "name": "Voie des illusions",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Mirage (L)*",
          "text": "L’ensorceleur crée une illusion visuelle et sonore immobile d’une durée de CHA minutes. Le volume maximal de l’illusion est de 2 m de côté par rang dans la voie (portée 50 m). À partir du rang 4, l’illusion peut être animée, mais dans ce cas sa durée est exprimée en rounds. En plus de ce sort, l’ensorceleur ajoute son rang + 2 aux tests de supercherie ou à tout test qui lui servirait à mentir.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 95,
            "section": "Voie des illusions — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 2,
          "owned": false,
          "name": "Image décalée (M)*",
          "text": "L’ensorceleur crée des images décalées qui se superposent à sa silhouette pendant [1d4 + CHA] rounds. Lorsqu’une attaque au contact ou à distance le touche, l’ensorceleur lance 1d6 : sur 5‑6, il ne subit pas les DM.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 95,
            "section": "Voie des illusions — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        }
      ]
    },
    {
      "name": "Voie de l’invocation",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Choc (A)*",
          "text": "Si l’ensorceleur réussit un test d’attaque magique réussi contre la DEF de son adversaire situé à une portée de 20 m, il lui inflige [1d4° + CHA] DM. Si la cible a un NC inférieur au rang atteint par l’ensorceleur dans la voie, elle doit réussir un test de FOR difficulté 10 pour ne pas être renversée.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 96,
            "section": "Voie de l’invocation — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        },
        {
          "rank": 2,
          "owned": true,
          "name": "Serviteur invisible (L)*",
          "text": "Ce sort crée une force invisible pendant CHA minutes. Le serviteur peut effectuer à distance des tâches simples ne nécessitant pas de test de réussite avec une AGI et une INT de +0 et une FOR égale au CHA de l’ensorceleur (portée 20 m). Il peut par exemple rapporter un objet ou actionner un levier, voire faire la vaisselle. Le serviteur invisible se déplace à la même vitesse que l’ensorceleur, ne pèse rien, ne parle pas, n’a pas vraiment d’existence et peut se déplacer dans toutes les directions. Concevez‑le davantage comme une force qui obéit aux injonctions télépathiques de son créateur que comme une créature. Il n’attaque pas et ne peut pas être combattu, mais il peut être dissipé grâce au sort de maîtrise de la magie.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 96,
            "section": "Voie de l’invocation — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "structuredStatus": "STRUCTURED",
            "engineStatus": "ENGINE_CONNECTED",
            "oracleStatus": "ORACLE_TESTED",
            "negativeStatus": "NEGATIVE_TESTED",
            "crossStatus": "CROSS_TESTED",
            "functionalStatus": "N1_CERTIFIED",
            "certifiedIn": "FIX70"
          }
        }
      ]
    }
  ],
  "rulesAudit": "Textes COF2 confrontés au PDF officiel fourni ; historique relu sur son PDF. Les peuples Compagnon restent des conversions COF1 identifiées par leur source."
};
