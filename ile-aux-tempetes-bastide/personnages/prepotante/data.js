window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "prepotante",
  "name": "Prépôtante",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Export Forge of Heroes - 29 septembre 2026",
  "level": 1,
  "people": "Gobelin",
  "family": "Aventurier",
  "profile": "Voleur",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "AGI": 3,
    "CON": 1,
    "FOR": 1,
    "PER": 2,
    "CHA": -2,
    "INT": 0,
    "VOL": 2
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 9,
    "pcMax": 1,
    "pmMax": 0,
    "recoveryDie": "D8",
    "recoveryMax": 3,
    "init": 15,
    "def": 16,
    "contact": 2,
    "distance": 4,
    "magic": 3,
    "silver": 0
  },
  "attacks": [
    {
      "id": "rapiere",
      "name": "Rapière",
      "type": "Contact",
      "attack": 2,
      "damage": "1d6+1",
      "range": "Contact",
      "special": ""
    },
    {
      "id": "dague-contact",
      "name": "Dague",
      "type": "Contact",
      "attack": 2,
      "damage": "1d4+1",
      "range": "Contact",
      "special": ""
    },
    {
      "id": "dague-distance",
      "name": "Dague",
      "type": "Distance",
      "attack": 4,
      "damage": "1d4+1",
      "range": "5 m",
      "special": "Doigts agiles : +1 DM aux dagues et couteaux lancés."
    }
  ],
  "equipment": [
    "Rapière",
    "5 dagues",
    "Armure de cuir simple"
  ],
  "paths": [
    {
      "name": "Voie du peuple - Gobelin",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Rapide comme son ombre",
          "text": "Le gobelin obtient un bonus de +3 aux tests de discrétion et en Initiative.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 15,
            "chapter": "Nouveaux peuples",
            "section": "voie-du-gobelin — rang 1"
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
          "owned": false,
          "name": "Jeune worg",
          "text": "Le gobelin dresse un jeune worg et il peut le chevaucher. À dos de worg, il peut agir normalement sans pénalité. Il peut donner l'ordre à sa monture d'attaquer au prix d'une action de mouvement. Il peut utiliser sa seconde action pour la faire se déplacer de 20 mètres ou pour faire lui-même une action d'attaque.\n\nStats du jeune worg :\nInitiative : égale à l'initiative du gobelin.\nDEF : 14\nPV : niveau x4\nAttaque au contact : niveau du gobelin\nDM : 1d6 + 1\nFOR +1, DEX +1, CON +1, INT -3, SAG +2, CHA -3.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 15,
            "chapter": "Nouveaux peuples",
            "section": "voie-du-gobelin — rang 2"
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
          "name": "Miam",
          "text": "Un gobelin est capable de manger tout et n'importe quoi : une chaussure, une armure en cuir, l'écorce d'un arbre et bien entendu des mets avariés. Il obtient un bonus de +5 à tous les tests pour résister au poison et aux toxines ingérées et il ne souffre de pénalités pour cause de faim que si aucune matière organique n'est disponible. Enfin, à la place d'une attaque à mains nues, il peut infliger une attaque de morsure qui inflige 1d4 + son modificateur de Force de DM.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 15,
            "chapter": "Nouveaux peuples",
            "section": "voie-du-gobelin — rang 3"
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
          "name": "Grand worg",
          "text": "Le worg devient plus grand et puissant. Désormais, lorsqu'il est en selle, le gobelin peut faire attaquer son worg une fois par tour en action gratuite à la même initiative que lui.\n\nStats du grand worg :\nInitiative : égale à l'initiative du gobelin.\nDEF : 17\nPV : niveau x4\nAttaque au contact : niveau du gobelin +2\nDM : 1d6 + 5\nFOR +1, DEX +1, CON +1, INT -3, SAG +2, CHA -3.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 15,
            "chapter": "Nouveaux peuples",
            "section": "voie-du-gobelin — rang 4"
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
          "name": "Vif et alerte",
          "text": "Le gobelin est plus agile et résistant aux mauvais traitements que jamais. Il pousse son instinct de survie à son paroxysme et augmente ses valeurs de Dextérité et de Constitution de +2.",
          "source": {
            "bookId": "cof1-compagnon-2017",
            "edition": "Chroniques Oubliées Fantasy 1re édition",
            "printedPage": 15,
            "chapter": "Nouveaux peuples",
            "section": "voie-du-gobelin — rang 5"
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
      "name": "Voie de l’assassin",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Discrétion",
          "text": "Le voleur ajoute son rang + 2 à tous les tests de discrétion, de déguisement ou pour cacher une arme sur lui. Il apprend le langage silencieux à base de signe des voleurs (argotien) et enfin il obtient un dé bonus en attaque lorsqu’il attaque un adversaire surpris.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 74,
            "section": "Voie de l’assassin — rang 1",
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
          "name": "Attaque sournoise (L)",
          "text": "Une fois par round, quand il attaque un adversaire surpris ou de dos** avec une arme légère, le voleur inflige +2d4° DM supplémentaires. Les DM infligés par cette capacité augmentent de 1d4° à chaque fois qu’il atteint le rang 4 dans une voie de voleur (pour un maximum de 7d4°). Cette capacité nécessite l’utilisation d’une arme légère (dague, éventuellement lancée, épée courte, rapière) dans tous les autres cas, le bonus aux DM est divisé par deux (cela comprend les armes à distance).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 74,
            "section": "Voie de l’assassin — rang 2",
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
          "name": "Attaque par surprise (A)",
          "text": "Contre un adversaire surpris, le voleur peut réaliser une attaque sournoise en utilisant une action d’attaque plutôt qu’une action limitée et il augmente les DM de son attaque sournoise de 2d4°.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’assassin — rang 3",
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
          "name": "Disparition (M)",
          "text": "Une fois par combat, le voleur peut disparaître dans un flash lumineux et un nuage de fumée. Aucun adversaire ne peut l’attaquer pendant qu’il a disparu, mais il peut subir des DM de zone. Il ne réapparaît qu’au début de son prochain tour à une distance maximale de 20 m de sa position initiale. À ce moment, si le voleur a l’initiative, il peut réaliser une attaque sournoise.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’assassin — rang 4",
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
          "name": "Ouverture mortelle (L)",
          "text": "Une fois par combat, le voleur obtient une réussite critique automatique contre la cible de son choix. Il profite donc d’une réussite automatique, des dommages multipliés par 2 prévus dans ce cas et d’une attaque sournoise (dont les DM ne sont pas doublés).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’assassin — rang 5",
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
      "name": "Voie de l’aventurier",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Baratin",
          "text": "Le voleur ajoute son rang + 2 aux tests destinés à baratiner, séduire, négocier, mentir ou pour trouver un objet au marché noir. De plus, il devient capable d’utiliser les parchemins ou les baguettes magiques en réussissant un test d’attaque magique (L) contre une difficulté de (10 + (2 x rang du sort inscrit)). En cas d’échec, le sort n’est pas lancé et le voleur peut faire une nouvelle tentative.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’aventurier — rang 1",
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
          "name": "Provocation (L)",
          "text": "Le voleur maîtrise l’art de se rendre désagréable, voire insupportable. S’il emporte un test opposé de CHA contre INT d’un adversaire humanoïde à moins de 10 m, il force la cible à l’attaquer à son prochain tour. À ce moment‑là, si le voleur est au contact, il peut riposter par une attaque de contact gratuite pour laquelle il bénéficie au choix d’une attaque sournoise ou d’un bonus de 1d4° aux DM.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’aventurier — rang 2",
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
          "name": "Souplesse du félin",
          "text": "Le voleur possède une démarche et une façon de se déplacer à la fois élégante, féline et souple. Il ajoute +2 en DEF et en Initiative. Ce bonus passe à +3 au rang 5. Il lui faut seulement une action de mouvement pour se relever.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’aventurier — rang 3",
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
          "text": "Le voleur augmente sa valeur de CHA de +1. Désormais, il obtient un dé bonus aux tests de CHA.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’aventurier — rang 4",
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
          "name": "Attaque paralysante (L)",
          "text": "Une fois par combat, le voleur peut, en réussissant une attaque de contact, paralyser un adversaire humanoïde de douleur. La cible ne subit aucun DM, mais elle est immobilisée pendant 1d4 rounds ou, si son NC est inférieur à la moitié du niveau du voleur, elle est paralysée. De plus, le voleur peut désormais utiliser au choix l’attaque sournoise (s’il détient cette capacité) ou infliger +1d4° DM contre tout adversaire immobilisé ou paralysé.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie de l’aventurier — rang 5",
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
      "name": "Voie du déplacement",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Agile",
          "text": "Le voleur ajoute son rang + 2 à tous tests liés à un déplacement (esquive, saut, course, équilibre, escalade, se glisser entre des barreaux ou échapper à une créature qui l’agrippe). De plus, il bénéficie d’un bonus de +1 en DEF et en Initiative. Ce bonus passe à +2 au rang 3 et +3 au rang 5.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 75,
            "section": "Voie du déplacement — rang 1",
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
          "name": "Réflexes félins",
          "text": "Le voleur divise par 2 tous les DM de chute. De plus, une fois par combat, il obtient une action de mouvement supplémentaire à son tour. Au rang 5, il peut réaliser cet exploit 2 fois par combat (mais pas plus d’une fois par round).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du déplacement — rang 2",
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
          "name": "Acrobaties (G)",
          "text": "Une fois par round, si le voleur réussit un test d’AGI difficulté 15, il peut effectuer une acrobatie pour franchir un obstacle (qui peut être un adversaire) ou attaquer de dos un adversaire au contact. Il peut alors au choix utiliser l’attaque sournoise ou infliger +1d4° DM.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du déplacement — rang 3",
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
          "text": "Le voleur augmente sa valeur d’AGI de +1. Désormais, il obtient un dé bonus aux tests d’AGI.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du déplacement — rang 4",
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
          "name": "Esquive de la magie (G)",
          "text": "Une fois par round, lorsqu’un sort qui inflige des DM physiques (feu, froid, projectile magique, etc.) le prend pour cible (y compris un sort de zone ou l’affectant en plus de la personne visée), le voleur peut effectuer un test d’attaque à distance opposé à un test d’attaque magique du lanceur sort. S’il réussit, il échappe au sort. S’il échoue, il subit les DM normaux.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du déplacement — rang 5",
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
      "name": "Voie du roublard",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Doigts agiles",
          "text": "Le voleur ajoute son rang + 2 aux tests liés à la précision manuelle (crocheter une serrure, désamorcer un piège, pickpocket…) ainsi qu’aux tests pour évaluer un objet précieux (joyaux, bijoux, etc.). De plus il obtient +1 aux DM des attaques à distance avec les dagues et couteaux. Ce bonus passe à +2 au rang 3 de la voie et +3 au rang 5.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du roublard — rang 1",
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
          "name": "Aux aguets",
          "text": "Le voleur ajoute son rang + 2 aux tests effectués pour fouiller une pièce à la recherche d’un trésor, détecter un piège (même magique), un passage secret ou même une embuscade (Vigilance). De plus, il divise par 2 les DM infligés par des pièges.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du roublard — rang 2",
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
          "name": "Feindre la mort (G)",
          "text": "Une fois par combat, le voleur peut feindre la mort après avoir reçu une blessure (même à 0 PV). Il peut ainsi passer pour mort aussi longtemps qu’il le souhaite et un test d’INT difficulté 20 est nécessaire pour révéler la supercherie. Lorsqu’il décide de se relever (action gratuite), le voleur récupère immédiatement 1d4° PV et s’il est au contact d’un adversaire, celui‑ci est surpris. Un adversaire qui a déjà été victime de cette stratégie du voleur lors d’un précédent combat ne se laisse pas surprendre une seconde fois (sauf si son INT est de ‑4).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du roublard — rang 3",
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
          "name": "Expert en criminalité",
          "text": "Le voleur obtient un dé bonus sur tous les tests de recherche d’indice (Trouver une preuve [PER], Faire une déduction [INT] et Obtenir un aveu [CHA]) ainsi que pour tous les tests réalisés pour brouiller des pistes, réaliser de faux indices ou de faux documents. De plus, lorsqu’il est dans un lieu, s’il dépense 1 PC, le MJ devra lui donner un indice qui lui a échappé jusque‑là. S’il n’y a pas d’indice, le PC n’est pas dépensé.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du roublard — rang 4",
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
          "name": "Maître du poison",
          "text": "Le voleur peut utiliser 3 doses de poison par jour sans risque de s’empoisonner lui‑même. Une dose permet d’enduire une dague, une flèche ou un carreau pour infliger +2d4° DM supplémentaire et demande un test de CON difficulté (10 + INT du voleur) ou une cible vivante est affaiblie pour le reste du combat. Alternativement, une dose peut être versée dans les aliments pour une personne ; si la cible rate son test de CON, elle sombre dans l’inconscience pour 2d6 min (4d6 min pour 2 doses, etc.).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 76,
            "section": "Voie du roublard — rang 5",
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
      "name": "Voie du spadassin",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Attaque en finesse",
          "text": "Le voleur ajoute son AGI à son Init. et peut remplacer sa FOR par son AGI pour ses tests d’attaque au contact (mais pas aux DM) lorsqu’il utilise une arme légère à une main (dague, épée courte ou rapière). Enf in, il obtient un bonus égal à son rang + 2 aux tests d’intimidation.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 77,
            "section": "Voie du spadassin — rang 1",
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
          "name": "Esquive fatale (G)",
          "text": "Une fois par combat, le voleur peut esquiver une attaque et s’arranger pour que celle‑ci affecte un autre adversaire à son contact. Comparez le test d’attaque à la DEF de la nouvelle cible pour savoir si celle‑ci subit des DM. Cette capacité ne peut pas être utilisée si le voleur n’a qu’un seul adversaire au contact et jamais contre une réussite critique (un critique touche toujours sa cible).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 77,
            "section": "Voie du spadassin — rang 2",
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
          "name": "Frappe chirurgicale",
          "text": "Par sa science de l’escrime (et de la fourberie), le voleur augmente ses chances de faire des coups critiques avec une arme légère de 2 points (ainsi, au lieu de 20, le critique standard est obtenu entre 18 et 20). Toutefois, la valeur minimale requise pour obtenir un critique ne peut être inférieure à 16 (voir page 213).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 77,
            "section": "Voie du spadassin — rang 3",
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
          "name": "Ambidextrie (G)",
          "text": "Avec sa main gauche, le voleur peut effectuer une attaque au contact gratuite avec une dague ou une épée courte à chaque round. Cette attaque ne peut pas bénéficier des avantages d’une attaque sournoise.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 77,
            "section": "Voie du spadassin — rang 4",
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
          "name": "Botte secrète",
          "text": "Lorsque le voleur obtient un critique sur le dé d’une attaque au contact de sa main principale avec une arme légère (mais pas sur une ouverture mortelle), il inflige à sa cible un état préjudiciable au choix parmi affaibli, aveuglé, étourdi, immobilisé ou ralenti pendant 1 round. Vous ne pouvez infliger chaque état préjudiciable qu’une seule fois par combat. Alternativement, le voleur peut choisir que l’attaque devienne une attaque sournoise dont les DM s’ajoutent au critique (au lieu d’infliger un état préjudiciable).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 77,
            "section": "Voie du spadassin — rang 5",
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
