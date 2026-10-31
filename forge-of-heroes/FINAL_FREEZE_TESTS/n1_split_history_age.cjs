'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { load, standardState } = require('./forge_product_runner');
const root = path.resolve(__dirname, '..');
const file = process.argv[2] || 'index.html';
const { db, engine } = load(path.join(root, file));
const histories = db.tables.history_paths;
const results = { file, cases: 0, failures: [] };
for (const geo of histories.filter(h => h.category === 'geographic')) {
  for (const pro of histories.filter(h => h.category === 'professional')) {
    for (const age of ['mature', 'venerable']) {
      const rank = age === 'mature' ? 2 : 3;
      const state = standardState(db, 'class:guerrier:cof2-lb-2024', 'classpath:voie-du-soldat:class-guerrier:cof2-lb-2024');
      state.voies.profilePathIds = state.voies.profilePathIds.slice(0, 1);
      state.advancedRules.age = true;
      state.advancedRules.histories = true;
      state.history = { geographicPathId: geo.id, professionalPathId: pro.id };
      state.age = { categoryId: age, spending: [] };
      for (let r = 2; r <= rank; r++) {
        for (const h of [geo, pro]) state.age.spending.push({ pathId: h.id, rank: r });
      }
      for (const ability of engine.previewAcquiredAbilities(state)) {
        for (const choice of engine.getPersistentChoicesForAbility(state, ability.id)) {
          const values = state.abilityChoices[ability.id] ||= {};
          if (choice.type === 'boolean') values[choice.id] = false;
          else if (choice.type === 'entity') values[choice.id] = {type:'animal', species:'chat', name:'Témoin'};
          else if (choice.options?.length) values[choice.id] = choice.options[0].id;
        }
      }
      results.cases++;
      try {
        const result = engine.computeCharacterN1(state);
        assert.equal(result.errors.length, 0, result.errors.join(' | '));
        const cs = result.sticky.characterState;
        const budget = age === 'mature' ? 2 : 4;
        assert.equal(cs.capacityBudget.age.available, budget);
        assert.equal(cs.capacityBudget.age.spent, budget);
        for (const h of [geo, pro]) {
          const ranks = Array.from(result.sticky.acquiredAbilities).filter(a => a.pathId === h.id).map(a => a.rank).sort();
          assert.deepEqual(ranks, Array.from({length:rank}, (_, i) => i + 1));
        }
        const saved = engine.createHeroSavePayload(state, cs, {id:'split-history'});
        const replay = engine.computeCharacterN1(engine.restoreHeroSavePayload(JSON.parse(JSON.stringify(saved))).draft);
        assert.equal(replay.errors.length, 0);
        for (const key of ['derived', 'paths','capacityBudget']) assert.deepEqual(replay.sticky.characterState[key], cs[key]);
      } catch (e) { results.failures.push({geo:geo.id, pro:pro.id, age, error:e.message}); }
    }
  }
}
console.log(JSON.stringify(results, null, 2));
if (results.failures.length) process.exitCode = 1;
