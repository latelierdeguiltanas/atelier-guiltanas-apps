window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "scanlan",
  "name": "Scanlan",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Export Forge of Heroes - 29 septembre 2026",
  "level": 1,
  "people": "Halfelin",
  "family": "Aventurier",
  "profile": "Barde",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "AGI": 1,
    "CON": 1,
    "FOR": -2,
    "PER": 0,
    "CHA": 3,
    "INT": 0,
    "VOL": 2
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 9,
    "pcMax": 6,
    "pmMax": 4,
    "recoveryDie": "D8",
    "recoveryMax": 3,
    "init": 10,
    "def": 14,
    "contact": -1,
    "distance": 2,
    "magic": 3,
    "silver": 0
  },
  "attacks": [
    {
      "id": "rapiere",
      "name": "Rapière",
      "type": "Contact",
      "attack": -1,
      "damage": "1d6-2",
      "range": "Contact",
      "special": ""
    },
    {
      "id": "dague-contact",
      "name": "Dague",
      "type": "Contact",
      "attack": -1,
      "damage": "1d4-2",
      "range": "Contact",
      "special": ""
    },
    {
      "id": "dague-distance",
      "name": "Dague",
      "type": "Distance",
      "attack": 2,
      "damage": "1d4",
      "range": "5 m",
      "special": ""
    }
  ],
  "equipment": [
    "Rapière",
    "Dague"
  ],
  "paths": [
    {
      "name": "Voie du peuple - Halfelin",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Petite taille",
          "text": "Le halfelin obtient un bonus de +1 en DEF et de +3 à tous les tests de discrétion ainsi qu’à tous les tests effectués pour subtiliser quelque chose (pickpocket, vol à l’étalage, etc.). En revanche, un halfelin ne peut pas utiliser à une main une arme dont les DM dépassent 1d6 (épée courte, masse, etc., mais pas rapière). Il lui faut utiliser les deux mains pour les armes qui infligent 1d8 à 1d10 de DM (épée longue) et il lui est interdit d’utiliser les armes qui infligent plus de 1d10 DM. Il ne peut pas utiliser d’arc long ni d’arbalète lourde.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 55,
            "section": "Voie du peuple - Halfelin — rang 1",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested"
          }
        },
        {
          "rank": 2,
          "owned": false,
          "name": "Résistance légendaire",
          "text": "Le halfelin obtient un bonus égal à son rang à tous les tests opposés d’attaque magique effectués pour résister à un sort.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 55,
            "section": "Voie du peuple - Halfelin — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested"
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Bon pour le moral",
          "text": "Un halfelin qui mange bien est un halfelin heureux. À chaque repas (jusqu’à 4 fois par jour, espacés d’au moins 3 h) au cours duquel le personnage boit et mange des mets de qualité et en quantité, il récupère 1d4° PV.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 55,
            "section": "Voie du peuple - Halfelin — rang 3",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested"
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Petit veinard",
          "text": "Le halfelin gagne 1 PC supplémentaire. De plus, il peut esquiver une attaque de son choix par combat (avant d’avoir pris connaissance des DM, mais pas un critique).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 56,
            "section": "Voie du peuple - Halfelin — rang 4",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested"
          }
        },
        {
          "rank": 5,
          "owned": false,
          "name": "Vif et bien nourri",
          "text": "Le halfelin augmente ses valeurs d’AGI et de CON de +1.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 56,
            "section": "Voie du peuple - Halfelin — rang 5",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested"
          }
        }
      ]
    },
    {
      "name": "Voie de la séduction",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Charmant",
          "text": "Le barde ajoute son rang + 2 aux tests effectués pour séduire, convaincre, mentir ou baratiner. Désormais, il peut dépenser 1 point de chance pour améliorer l’action d’un compagnon en vue, ce PC permet d’ajouter [1d4° + CHA] sur le résultat du test (au lieu de +10).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie de la séduction — rang 1",
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
          "name": "Dentelles et rapière",
          "text": "Le barde ne met pas d’armure, cela ne sied point en société. Sa seule armure est la dentelle, sa seule défense, la rapière. Lorsqu’il ne porte aucune armure, le barde ajoute son CHA en DEF (en plus de son AGI), toutefois ce bonus ne peut pas dépasser le rang atteint dans la voie.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie de la séduction — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "functionalStatus": "ADVANCED_N1_CONNECTED",
            "structured": true,
            "ageAccessibleN1": true,
            "semanticEngine": "N1_SEMANTIC_ENGINE_REPAIR",
            "engineConnected": true
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Baratineur de génie",
          "text": "Si le barde peut passer 10 minutes avec un humanoïde dont le niveau est inférieur ou égal à 1 (NC 1), il peut dépenser un 1 PC pour le charmer. La cible répond favorablement à vos requêtes dans la limite de ce que ferait un ami et ce lien peut se renforcer avec le temps. Si vous ne partagez pas une langue commune, cela vous coûte 2 PC.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie de la séduction — rang 3",
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
          "name": "Charisme héroïque",
          "text": "Le barde augmente sa valeur de CHA de +1. Désormais, il obtient un dé bonus aux tests de CHA. De plus, le barde peut désormais utiliser son CHA au lieu de sa VOL pour calculer le nombre de PM dont il dispose.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie de la séduction — rang 4",
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
          "name": "Suggestion (A)*",
          "text": "Le barde peut suggérer une action à une créature en réussissant un test opposé d’attaque magique. En cas de réussite, la créature fera tout son possible pour satisfaire cette demande pendant 1 heure ou jusqu’à avoir réussi. Elle évitera les actions suicidaires (ce qui lui donnerait immédiatement un test d’INT difficulté 10 pour échapper au sort). Le sort ne peut pas affecter une créature de niveau supérieur ou égal à celui du lanceur.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie de la séduction — rang 5",
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
      "name": "Voie du musicien",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Chant des héros (L)*",
          "text": "Le barde peut chanter et inspirer ses compagnons, tous ses alliés à portée de voix et lui obtiennent un bonus de +1 à tous leurs tests pendant un nombre de minutes égal à sa valeur de CHA. Pendant toute la durée du sort, il fredonne (action gratuite qui ne l’empêche pas de lancer d’autres sorts de barde). Le bonus passe à +2 au rang 5. En plus de ce sort, le barde ajoute son rang + 2 aux tests pour jouer d’un instrument de musique ou chanter.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du musicien — rang 1",
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
          "name": "Chant de réconfort (L)*",
          "text": "Le barde chante ou joue de la musique pendant toute la durée d’une récupération rapide (30 min). Le barde et ses alliés dans un rayon de 10 m, récupèrent 1d4° PV. Les soins passent à 2d4° au rang 4.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du musicien — rang 2",
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
          "name": "Attaque sonore (A)*",
          "text": "Le barde pousse un cri dont les effets sont dévastateurs (ou produit un son avec un instrument à cette même fin). Il inflige [2d4° + CHA] DM à toutes les cibles dans un cône de 10 m (de long et de large). Les cibles peuvent diviser les DM par 2 si elles réussissent un test de CON difficulté [10 + CHA du barde].",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du musicien — rang 3",
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
          "name": "Zone de silence (A)*",
          "text": "Le barde crée une zone de silence fixe de 5 m de diamètre, jusqu’à une portée de 30 m, pendant un nombre de minutes égal à sa valeur de CHA. Tous les sons émis dans cette sphère sont annulés. Dans cette zone, il faut réussir un test d’INT difficulté 10 pour lancer un sort.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du musicien — rang 4",
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
          "name": "Danse irrésistible (A)*",
          "text": "Le barde joue une gigue endiablée aux effets magiques. S’il réussit un test d’attaque magique opposé contre sa cible (portée 10 m), celle‑ci se met à danser pendant [1d4° + CHA] rounds, elle subit un dé malus aux tests d’attaque et ‑5 en DEF. Si la cible est d’un niveau (NC) supérieur ou égal au barde, elle ne danse qu’un seul round.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du musicien — rang 5",
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
      "name": "Voie de l’escrime",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Précision",
          "text": "Le barde peut remplacer sa FOR par son AGI pour ses tests d’attaque au contact (mais pas aux DM) lorsqu’il emploie une arme légère à une main (les armes légères sont la dague, l’épée courte et la rapière).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 66,
            "section": "Voie de l’escrime — rang 1",
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
          "owned": false,
          "name": "Feinte (L)",
          "text": "Le barde effectue une attaque fictive pour déséquilibrer son adversaire et réalise ensuite une attaque mortelle. Faites un test opposé de 1 0 CHA contre la PER de votre adversaire à ce round. Au round suivant, vous obtenez un bonus en attaque égal au double de votre rang dans la voie de l’escrime (+4 au rang 2, par exemple) sur votre première attaque au contact contre cet adversaire et, si votre feinte a réussi, +2d4° aux DM.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 66,
            "section": "Voie de l’escrime — rang 2",
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
          "name": "Intelligence du combat (M)",
          "text": "Une fois par combat, le barde peut au choix désarmer, renverser ou aveugler pour une durée de 1 round un adversaire dont le NC est inférieur au sien en emportant un test opposé d’INT. S’il a réussi une feinte contre cet adversaire à son tour précédent, il bénéficie d’un bonus de +5 au test d’INT.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie de l’escrime — rang 3",
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
          "name": "Attaque flamboyante (L)",
          "text": "Le style de combat du barde est flamboyant et surprenant : Il effectue une attaque de contact avec une arme légère et obtient un bonus d’attaque et de DM égal à son CHA (en plus de sa FOR ou de son AGI).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie de l’escrime — rang 4",
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
          "name": "Botte mortelle",
          "text": "Lors d’une attaque au contact avec une arme légère, s’il obtient un résultat d’attaque supérieur ou égal à (la DEF de son adversaire + 10 points), le barde obtient un bonus de +2d4° aux DM de son attaque (les dés bonus ne sont jamais multipliés en cas de critique).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie de l’escrime — rang 5",
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
      "name": "Voie du saltimbanque",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Acrobate",
          "text": "Le barde ajoute son rang + 2 à tous les tests qu’il effectue pour réaliser des acrobaties, tenir en équilibre, faire des sauts ou de l’escalade.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 67,
            "section": "Voie du saltimbanque — rang 1",
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
          "owned": false,
          "name": "Grâce féline",
          "text": "Le barde gagne son CHA en Initiative et +1 en DEF (+2 au rang 4). De plus, le barde ajoute son rang + 2 aux tests de danse, de mime ou de jonglerie.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie du saltimbanque — rang 2",
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
          "name": "Lanceur de couteau (G)",
          "text": "Une fois par round, en plus de ses autres actions, le barde peut lancer un couteau sur une cible à distance (portée 10 m) en réussissant un test d’attaque à distance. Cette attaque occasionne [1d4 + AGI] DM. Il peut exécuter cette action sans pénalité, même s’il est engagé en combat au contact avec un autre adversaire. Les DM passent à 1d4° au rang 5.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie du saltimbanque — rang 3",
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
          "name": "Liberté d’action",
          "text": "Le barde est immunisé à la peur et à tous les sorts qui asservissent l’esprit (possession, charme), il est immunisé aux états ralenti et immobilisé.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie du saltimbanque — rang 4",
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
          "name": "Esquive acrobatique (G)",
          "text": "Une fois par round, le barde peut réaliser une esquive en réussissant un test d’attaque à distance contre une difficulté égale au résultat obtenu par son adversaire, lors de son attaque. En cas de réussite, le barde ne subit aucun DM. Si cette attaque était un critique, il subit tout de même des DM normaux (il annule donc l’effet critique « dommages doublés »).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie du saltimbanque — rang 5",
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
      "name": "Voie du vagabond",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Rumeurs et légendes",
          "text": "À force de voyager, le barde possède une culture générale très vaste, il ajoute son rang + 2 1 0 aux tests d’INT pour se « souvenir » d’une information historique, politique, géographique ou occulte ou encore pour identifier un objet magique difficulté (25 – (2 x niveau de magie de l’objet)).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 68,
            "section": "Voie du vagabond — rang 1",
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
          "owned": false,
          "name": "Éclectique",
          "text": "Le barde obtient un bonus de +1 à tous les tests de compétence (absolument tous, de se cacher dans les ombres jusqu’à forger une épée, en passant par traduire une langue ancienne). Ce bonus ne peut se cumuler à aucun autre bonus de compétence sauf celui du rang 1 de la voie de peuple. Il augmente de +1 chaque fois qu’il atteint le rang 4 dans une voie de barde.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 69,
            "section": "Voie du vagabond — rang 2",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "SOURCE_VERIFIED",
            "functionalStatus": "ADVANCED_N1_CONNECTED",
            "structured": true,
            "ageAccessibleN1": true,
            "semanticEngine": "N1_SEMANTIC_ENGINE_REPAIR",
            "engineConnected": true
          }
        },
        {
          "rank": 3,
          "owned": false,
          "name": "Attirail",
          "text": "Le barde possède toutes sortes de choses dans son sac ou ses poches. En dépensant 1 PC, il peut sortir un objet improbable qu’il avait sur lui, mais qui n’est pas inscrit sur sa fiche de PJ, par exemple un livre de poésie, une bouteille d’un excellent vin, un jouet pour enfant, un os pour le chien, une lettre de recommandation, etc. (pour une valeur maximale de 10 pa). Il peut aussi bricoler un objet avec trois bouts de ficelles et un clou (système D).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 69,
            "section": "Voie du vagabond — rang 3",
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
          "name": "Compréhension des langues (A)*",
          "text": "Ce sort permet au barde de lire, écrire et parler une langue vivante étrangère. Le sort a une durée maximale de CHA heures, mais il peut aussi être lancé sur un allié au contact et dans ce cas, il ne dure que CHA minutes. À partir du rang 5, il peut aussi déchiffrer une inscription dans une langue morte.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 69,
            "section": "Voie du vagabond — rang 4",
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
          "name": "Déguisement (A)*",
          "text": "Ce sort permet au barde de prendre l’apparence de n’importe quelle humanoïde de taille à peu près équivalente (avec une marge d’environ 50 cm). S’il veut imiter une personne en particulier, il lui faudra réussir un test de CHA difficulté 15 (20 s’il ne la connaît pas mais l’a seulement vue, 10 s’il la connaît très bien). Le sort a une durée maximale de CHA heures, mais il peut aussi être lancé sur un allié au contact et dans ce cas, il ne dure que CHA minutes.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 69,
            "section": "Voie du vagabond — rang 5",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_ability_conflict_audit_pending",
            "functionalStatus": "not_tested"
          }
        }
      ]
    }
  ],
  "rulesAudit": "Textes COF2 confrontés au PDF officiel fourni ; historique relu sur son PDF. Les peuples Compagnon restent des conversions COF1 identifiées par leur source."
};
