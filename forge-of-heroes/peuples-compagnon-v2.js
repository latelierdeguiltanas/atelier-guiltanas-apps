(function (root) {
  'use strict';
  const suffix = ':addon-comp2017-cof2';
  const ids = { soul: 'people:ame-forgee'+suffix, fairy: 'people:fee'+suffix, sprite: 'people:lutin'+suffix };
  const paths = { soul: 'path:voie-de-lâme-forgée'+suffix, fairy: 'path:voie-de-la-fee:compagnon-cof2', sprite: 'path:voie-de-letre-feerique'+suffix };
  const rules = {
    soul: {
      name: 'Âme-forgée', path: 'Voie de l’Âme-forgée', def: 1,
      traits: ['Créature non vivante : ne respire, ne boit ni ne mange.', 'Rêve 4 h par jour ; −1 cumulatif aux tests par jour sans rêve.', 'Immunité aux poisons et aux maladies.', 'Ne nage pas ; marche au fond de l’eau en terrain difficile.', 'Soins magiques reçus divisés par deux. Réparation par un forgesort deux fois plus lente.'],
      ranks: [
        ['Métallique', '+1 DEF. Mains nues létales (1d3 + FOR). RD 5 contre le feu, le froid et les drains de vie. Immunité au saignement. Vision à 10 m dans le noir total comme en pénombre.', 7],
        ['Choc électrique', 'Une fois par round, ajoute 1d4° DM électriques à une attaque à mains nues réussie.', 7],
        ['Infiltration (M)', 'Une fois par jour, illusion visuelle d’humain, d’orc ou d’elfe durant 1 h par rang. Elle ne copie pas un individu et ne résiste pas à un examen tactile poussé. Activation ou désactivation par action de mouvement.', 8],
        ['Rayon ardent (L)', 'Une fois par combat à 30 m, test d’attaque magique contre la DEF. Inflige 4d4° + CON DM. Cristaux transparents : électricité ; rouges : feu ; bleus : froid.', 8],
        ['Machine de guerre', '+1 CON et +1 FOR.', 8]
      ]
    },
    fairy: {
      name: 'Lutin · Fée', path: 'Voie de la Fée', def: 2, maxForce: -2,
      traits: ['Très petite taille : FOR plafonnée à −2, +2 DEF. Bonus de +5 aux tests de discrétion.', 'Armes à une main : 1d4 DM. Armes à deux mains : 1d6 DM. Aucun modificateur de FOR aux DM d’arme.', 'Dés évolutifs supplémentaires des attaques physiques : un résultat maximal est compté comme 1.'],
      ranks: [
        ['Née d’une fleur', 'Vol de 10 m par action de mouvement. Vision à 20 m dans le noir total comme en pénombre. RD égale au rang de la voie contre les armes autres qu’en fer froid.', 27],
        ['Pirouette', 'Une fois par combat, après une attaque qui touche, ignore ses DM. Peut à volonté éclairer à 2 m autour de son corps.', 27],
        ['Poudre de fée', 'Choisis une capacité R1 de magicien ou d’ensorceleur sans bonus de DEF, ou un sort R2 utilisable sans armure. Trois utilisations par jour, sans coût ni gain de PM. Le choix R1 est utilisable en armure.', 27],
        ['Fée révérée', 'Trois fois par jour, taille humaine durant 1d4° + CHA minutes. Sous cette forme, +3 FOR et dégâts d’arme ordinaires.', 27],
        ['Lady fée', '+1 PER et +1 CHA.', 28]
      ]
    },
    sprite: {
      name: 'Lutin · Farfadet', path: 'Voie du Farfadet', def: 2, maxForce: -1,
      traits: ['Très petite taille : FOR plafonnée à −1, +2 DEF. Bonus de +5 aux tests de discrétion.', 'Armes à une main : 1d4 DM. Armes à deux mains : 1d6 DM. Aucun modificateur de FOR aux DM d’arme.', 'Dés évolutifs supplémentaires des attaques physiques : un résultat maximal est compté comme 1.'],
      ranks: [
        ['Né d’un chou', 'Vision à 20 m dans le noir total comme en pénombre. Téléportation de 10 m par action de mouvement vers un point visible au départ. RD égale au rang de la voie contre les armes autres qu’en fer froid.', 28],
        ['Langage des animaux', 'Obtient Langage des animaux (druide). Si déjà acquis, choisit une capacité R1 de rôdeur ou de druide. Un sort obtenu ainsi est utilisable en armure.', 28],
        ['Invisibilité (L)', 'Trois fois par jour, Invisibilité du magicien sans coût ni gain de PM, même en armure. Si déjà acquise, choisir Télékinésie ou Confusion dans les mêmes conditions.', 28],
        ['Monture féerique', 'Monture apprivoisée, éventuellement volante. Télépathie à 50 m. DEF 16, INIT 16, PV = 4 × niveau, attaque égale à l’attaque magique du héros. DM 1d4° +2 au sol, 1d4° en vol.', 28],
        ['Seigneur féerique', '+1 CHA et +1 VOL.', 28]
      ]
    }
  };
  const fold = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const kindFromId = id => Object.keys(ids).find(key => ids[key] === id);
  const smallDamage = hands => Number(hands) === 2 ? '1d6' : '1d4';
  function hubCharacter(character) {
    if (!character || character.companionPeopleVersion === 2) return character;
    const kind = { vivelame: 'soul', zepheline: 'fairy' }[character.id];
    if (!kind || !character.stats || !character.combat || !Array.isArray(character.paths)) return character;
    const legacyPath = kind === 'soul' ? paths.soul : paths.sprite;
    const index = character.paths.findIndex(p => p.pathId === legacyPath || (kind === 'soul' ? /voie du peuple.*ame.forgee/ : /voie du peuple.*(feerique|fee)/).test(fold(p.name)));
    if (index < 0) return character;
    const out = JSON.parse(JSON.stringify(character));
    const race = rules[kind], old = out.paths[index];
    const rank = Math.max(0, ...old.ranks.filter(r => r.owned).map(r => Number(r.rank)));
    out.companionPeopleVersion = 2;
    out.people = race.name;
    out.peopleId = ids[kind];
    out.traits = [...(out.traits || []).filter(t => !/vision dans le noir|vol :|discr[eé]tion|en DEF|FOR maximale|limit[eé]es au d4|armure l[eé]g[eè]re ajust|bouclier en vol/i.test(t)), ...race.traits];
    out.paths[index] = { ...old, pathId: paths[kind], kind: 'people', name: race.path,
      ranks: race.ranks.map(([name, text, page], i) => ({ rank: i+1, abilityId:kind==='fairy'?'ability:fee-r'+(i+1)+':'+paths.fairy:old.ranks.find(r=>r.rank===i+1)?.abilityId, owned: old.ranks.some(r => r.rank === i+1 && r.owned), name, text, source: { bookId: 'cof2-compagnon-v2', printedPage: page } })) };
    if (kind === 'fairy') {
      // The recovered Bastide sheet already has the Fée's −2 FOR. Keep this recorded value.
      // The old racial AGI and CON adjustments remain, and COF2 adds +1 CHA.
      out.stats.FOR = Math.min(Number(out.stats.FOR), -2);
      out.stats.CHA += 1;
      out.combat.pcMax += 1;
      out.combat.def += 1;
      if (rank >= 1) out.traits.push('Vol de 10 m, vision dans le noir à 20 m et RD '+rank+' contre les armes autres qu’en fer froid.');
      if (rank >= 3) {
        out.paths[index].ranks[2].text += ' Le sort de Zéphéline reste à choisir.';
        out.peoplePendingChoice = 'Poudre de fée : capacité ou sort à choisir.';
      }
    } else if (rank >= 1) {
      out.traits.push('RD 5 contre le feu, le froid et les drains de vie. Immunité au saignement. Vision dans le noir à 10 m.');
      out.attacks = (out.attacks || []).filter(a => !/main lourde|mains nues|choc electrique/.test(fold(a.name)));
      out.attacks.push({id:'ame-forgee-metallic',name:'Mains nues (Métallique)',type:'Contact',attack:out.combat.contact,
        damage:'1d3'+(out.stats.FOR ? (out.stats.FOR > 0 ? '+' : '')+out.stats.FOR : ''),range:'Contact',
        special:rank >= 2 ? '+1d4° électriques sur une réussite, une fois par round.' : 'Dégâts létaux.'});
    }
    return out;
  }
  const api = { ids, paths, rules, kindFromId, smallDamage, hubCharacter };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FOHCompanionPeopleV2 = api;
})(typeof window !== 'undefined' ? window : null);
