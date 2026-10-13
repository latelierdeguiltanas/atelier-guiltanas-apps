window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "wilfried",
  "name": "Wilfried",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Export Forge of Heroes - 28 septembre 2026",
  "level": 1,
  "people": "Humain",
  "family": "Mystique",
  "profile": "Prêtre",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "AGI": 2,
    "CON": 0,
    "FOR": 0,
    "PER": 0,
    "CHA": 4,
    "INT": -1,
    "VOL": 1
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 8,
    "pcMax": 7,
    "pmMax": 2,
    "recoveryDie": "D8",
    "recoveryMax": 3,
    "init": 10,
    "def": 17,
    "contact": 1,
    "distance": 3,
    "magic": 2,
    "silver": 0
  },
  "attacks": [
    {
      "id": "masse",
      "name": "Masse",
      "type": "Contact",
      "attack": 1,
      "damage": "1d6",
      "range": "Contact",
      "special": ""
    }
  ],
  "equipment": [
    "Masse",
    "Chemise de mailles",
    "Petit bouclier"
  ],
  "paths": [
    {
      "name": "Voie du peuple - Humain",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Diversité",
          "text": "Un humain obtient un bonus de +3 aux tests de deux domaines associés à son origine géographique ou sociale (voir ci‑dessous). De plus, il gagne 1 PC supplémentaire.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 57,
            "section": "Voie du peuple - Humain — rang 1",
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
          "name": "Instinct de survie",
          "text": "Une fois par combat, lorsqu’une attaque devrait amener l’humain à 0 PV, les DM qu’elle inflige sont divisés par 2 (minimum 1). Après avoir bénéficié de cette capacité, l’humain gagne pour le reste du combat un bonus de +2 en DEF.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 57,
            "section": "Voie du peuple - Humain — rang 2",
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
          "name": "Touche-à-tout",
          "text": "Le personnage obtient une capacité de rang 1 ou 2 de n’importe quel profil au choix du joueur. Si la capacité est de rang 2 ou accorde un bonus de DEF, il doit respecter les limitations d’armure.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 57,
            "section": "Voie du peuple - Humain — rang 3",
            "verification": "Texte extrait du PDF officiel fourni"
          },
          "certification": {
            "scope": "n1",
            "sourceStatus": "reference_migrated_content_pending",
            "functionalStatus": "not_tested",
            "semanticEngine": "N1_SEMANTIC_ENGINE_REPAIR",
            "structured": true,
            "engineConnected": true
          }
        },
        {
          "rank": 4,
          "owned": false,
          "name": "Loup parmi les loups",
          "text": "Une fois par round, l’humain gagne +1d4° aux DM qu’il inflige lorsqu’il combat un adversaire humanoïde de taille moyenne. Ce bonus ne s’applique qu’aux DM initiaux d’une attaque, pas aux DM sur la durée.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 57,
            "section": "Voie du peuple - Humain — rang 4",
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
          "name": "Polyvalence",
          "text": "Le personnage augmente sa caractéristique la plus faible de +1 et sa Volonté de +1.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 57,
            "section": "Voie du peuple - Humain — rang 5",
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
      "name": "Voie des soins",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Récupération mineure (A)*",
          "text": "Le prêtre peut apposer les mains sur un allié au contact (ou sur lui‑même) pour le soigner. Le patient récupère [1d4°+CHA du prêtre] PV. Ce sort peut être lancé une fois par jour par rang atteint dans la voie, plus une fois supplémentaire chaque fois que le personnage atteint le rang 3 dans une autre voie de prêtre. En plus de ce sort, le prêtre ajoute son rang + 2 à tous les tests de médecine et de premiers soins.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 124,
            "section": "Voie des soins — rang 1",
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
        }
      ]
    },
    {
      "name": "Voie de la foi",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Prédicateur",
          "text": "Le prêtre ajoute son rang + 2 aux tests visant à convaincre ou convertir son auditoire. De plus, une fois par jour, il récupère 1 PC s’il réussit à convertir une créature (ou un groupe) à sa religion ou à convaincre une créature peu encline à le faire à suivre ses préceptes.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 122,
            "section": "Voie de la foi — rang 1",
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
        }
      ]
    },
    {
      "name": "Voie de la guerre sainte",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Arme bénie (A)*",
          "text": "Le prêtre effectue un court rituel et son arme est bénie pour une durée de 24 h. Lorsqu’il obtient un résultat de 1 sur son dé de DM, il relance le dé et garde le second résultat. Les DM de l’arme sont considérés comme magiques. L’arme n’est plus bénie si une autre créature l’utilise.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 123,
            "section": "Voie de la guerre sainte — rang 1",
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
        }
      ]
    },
    {
      "name": "Voie de la prière",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Bénédiction (L)*",
          "text": "Le prêtre entonne un chant pour encourager ses compagnons en vue. Ses alliés et lui bénéficient d’un bonus de +1 à tous leurs tests de caractéristique et d’attaque pendant CHA minutes. Ce bonus passe à +2 au rang 5. De plus, le prêtre obtient un bonus égal à son rang + 2 à tous les tests de théologie ou de cosmologie.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 124,
            "section": "Voie de la prière — rang 1",
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
        }
      ]
    },
    {
      "name": "Voie de la spiritualité",
      "ranks": [
        {
          "rank": 1,
          "owned": false,
          "name": "Vêtements sacrés",
          "text": "La tenue religieuse du prêtre est bénie et le protège. Lorsqu’il ne porte aucune armure (bouclier autorisé), il obtient un dé bonus à tous les tests pour résister à un contrôle mental (injonction, charme, domination…) et +2 en DEF. Ce bonus passe à +3 au rang 3 et +4 au rang 5. Éventuellement, si le prêtre prie une divinité guerrière, il peut choisir d’obtenir la maîtrise de la cotte de mailles (DEF +5) et l’autorisation d’utiliser les capacités des voies de prêtre avec cette armure (dans le cas d’un profil hybride, la maîtrise de la chemise de mailles est un prérequis pour bénéficier de cette variante).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 125,
            "section": "Voie de la spiritualité — rang 1",
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
        }
      ]
    }
  ],
  "rulesAudit": "Textes COF2 confrontés au PDF officiel fourni ; historique relu sur son PDF. Les peuples Compagnon restent des conversions COF1 identifiées par leur source."
};
