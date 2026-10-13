window.BASTIDE_CHARACTER={
  "schema": "bastide-character-v2",
  "id": "faelar",
  "name": "Faëlar",
  "status": "BASTIDE_PLAYER_CHARACTER",
  "source": "Rapport Forge of Heroes FIX135 - 3 octobre 2026",
  "level": 1,
  "people": "Elfe sylvain",
  "family": "Aventurier",
  "profile": "Rôdeur",
  "age": "Jeune",
  "heroicIdeal": "",
  "flaw": "",
  "stats": {
    "FOR": 1,
    "AGI": 1,
    "CON": 2,
    "PER": 3,
    "INT": 1,
    "VOL": 0,
    "CHA": -1
  },
  "combat": {
    "speedMeters": 10,
    "pvMax": 10,
    "pcMax": 2,
    "pmMax": 0,
    "recoveryDie": "D8",
    "recoveryMax": 4,
    "init": 14,
    "def": 14,
    "contact": 2,
    "distance": 2,
    "magic": 1,
    "silver": 0
  },
  "traits": [
    "Lumière des étoiles — capacité de peuple acquise au rang 1",
    "Instinct de chasse — Zombies : après le combat de la plage, Faëlar a compris que les armes tranchantes percent leur résistance ; les autres dégâts physiques ont été réduits de moitié."
  ],
  "attacks": [],
  "equipment": [
    {
      "id": "epee-longue",
      "name": "Épée longue",
      "base": "Épée longue",
      "category": "Arme",
      "quantity": 1,
      "equipped": false,
      "notes": "Attaque au contact : +2 · 1d8+1 DM.",
      "equipment": {
        "slot": "main_hand",
        "effect": "Arme de contact.",
        "weapon": {
          "modes": [
            {
              "label": "Contact",
              "attackType": "contact",
              "damage": "1d8",
              "damageStat": "FOR",
              "damageType": "tranchant",
              "range": "Contact",
              "attackBonus": 0,
              "damageBonus": 0
            }
          ]
        }
      }
    },
    {
      "id": "arc-court",
      "name": "Arc court",
      "base": "Arc court",
      "category": "Arme",
      "quantity": 1,
      "equipped": true,
      "notes": "Attaque à distance : +2 · 1d6+3 DM · portée 30 m.",
      "equipment": {
        "slot": "main_hand",
        "effect": "Arme à distance à deux mains.",
        "weapon": {
          "modes": [
            {
              "label": "Distance",
              "attackType": "distance",
              "damage": "1d6",
              "damageStat": "PER",
              "damageType": "perforant",
              "range": "30 m",
              "attackBonus": 0,
              "damageBonus": 0
            }
          ]
        }
      }
    },
    {
      "id": "dague",
      "name": "Dague",
      "base": "Dague",
      "category": "Arme",
      "quantity": 1,
      "equipped": false,
      "notes": "Contact : +2 · 1d4+1 DM. Lancer : +2 · 1d4 DM · portée 5 m.",
      "equipment": {
        "slot": "main_hand",
        "effect": "Arme légère utilisable au contact ou au lancer.",
        "weapon": {
          "modes": [
            {
              "label": "Contact",
              "attackType": "contact",
              "damage": "1d4",
              "damageStat": "FOR",
              "damageType": "perforant",
              "range": "Contact",
              "attackBonus": 0,
              "damageBonus": 0
            },
            {
              "label": "Distance",
              "attackType": "distance",
              "damage": "1d4",
              "damageType": "perforant",
              "range": "5 m",
              "attackBonus": 0,
              "damageBonus": 0
            }
          ]
        }
      }
    },
    {
      "id": "cuir-renforce",
      "name": "Cuir renforcé / broigne",
      "base": "Cuir renforcé, broigne",
      "category": "Protection",
      "quantity": 1,
      "equipped": true,
      "notes": "Armure portée à la création.",
      "equipment": {
        "slot": "armor",
        "effect": "Armure équipée : valeur d’armure 3.",
        "bonuses": {
          "armorDef": 3
        }
      }
    }
  ],
  "paths": [
    {
      "name": "Voie de l’elfe sylvain",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Lumière des étoiles",
          "text": "Pour un elfe sylvain, l’obscurité de la nuit sous la lumière des étoiles est considérée comme de la pénombre. De plus, l’elfe gagne un bonus de +3 à tous les tests de survie en forêt (escalade, discrétion, chasse, etc.).",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 52,
            "section": "Voie de l’elfe sylvain — rang 1",
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
      "name": "Voie de l’archer",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Archer émérite",
          "text": "Le rôdeur ajoute sa PER aux DM qu’il inflige à l’arc et +1 par rang dans la voie en initiative. Le joueur peut souhaiter une variante de cette capacité s’appliquant aux armes de jet (dague, hachette, javelot) plutôt qu’à l’arc (rebaptisez‑la voie du lancer). Dans ce cas, le PJ ajoute sa FOR aux DM qu’il inflige et double la portée de jet (pas de bonus d’Init.). Par ailleurs, toutes les capacités de la voie qui suivent s’appliquent aux armes de jet plutôt qu’à l’arc.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 70,
            "section": "Voie de l’archer — rang 1",
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
      "name": "Voie du compagnon animal",
      "ranks": [
        {
          "rank": 1,
          "owned": true,
          "name": "Le loup",
          "text": "Le rôdeur obtient un loup pour compagnon animal. En combat, le loup attaque en même temps que le rôdeur. Le loup comprend des ordres simples comme : garde, reste, apporte, attaque, etc. W W LOUP CRÉATURE VIVANTE | AGI +1 | CON +1* | FOR +2 | PER +2* | | CHA ‑2 | INT ‑3 | VOL +2 | (S) Défense [12 + rang dans la voie] (V) Points de vigueur [niv. du rôdeur × 4] (I) Initiative [Init. du rôdeur] Attaque au contact [attaque magique du rôdeur] DM 1d4+2 *Le loup obtient un dé bonus sur ses tests.",
          "source": {
            "bookId": "cof2-livre-base-2024",
            "edition": "Chroniques Oubliées Fantasy 2e édition",
            "printedPage": 71,
            "section": "Voie du compagnon animal — rang 1",
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
