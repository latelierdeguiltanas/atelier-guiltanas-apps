'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const read = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const source = read('function storageNotice(', 'function fillMissingFromState(');
const KEY = 'foh-guiltanas-heroes-v1';
function fixture(raw = null, failKey = '') {
  const data = new Map(raw === null ? [] : [[KEY, raw]]), status = {textContent: ''};
  const draft = {step: 3, name: 'Zéphiline', path1: 'air', acquisitionPurchases: [{pathId: 'air', rank: 3}]};
  const box = {KEY, crypto: {randomUUID: () => 'new-id'}, q: () => status, window: {__FOH_DIAGNOSTICS__: []}, dirty: true,
    localStorage: {getItem: key => data.get(key) ?? null, setItem: (key, value) => {if(key === failKey) throw Error('QuotaExceededError'); data.set(key, value);}},
    uid: () => 'new-id', updateLive: () => ({meta: {name: draft.name}}), renderHeroes: () => {},
    P: {buildState: () => ({}), getDraft: () => JSON.parse(JSON.stringify(draft)), setHeroLibraryId: id => draft.heroLibraryId = id},
    E: {computeCharacterN1: () => ({sticky: {characterState: {}}, errors: []}), createHeroSavePayload: (d, canonical, meta) => ({...meta, draft: {...d, heroLibraryId: meta.id}, characterState: canonical})}
  };
  vm.createContext(box); vm.runInContext(source, box);
  return {box, data, status, draft};
}
let checks = 0;
function test(name, run) {run(); checks++; console.log('PASS', name);}
test('first save and repeated save preserve one identity and exact choices', () => {
  const f = fixture(); const first = f.box.saveCurrent();
  f.draft.name = 'Zéphiline modifiée'; f.box.saveCurrent();
  const heroes = JSON.parse(f.data.get(KEY));
  assert.equal(heroes.length, 1); assert.equal(heroes[0].id, first.id);
  assert.equal(heroes[0].name, f.draft.name); assert.deepEqual(heroes[0].draft.acquisitionPurchases, f.draft.acquisitionPurchases);
  assert.equal(JSON.parse(f.data.get('foh-fix83-draft')).heroLibraryId, first.id);
});
for (const raw of ['{broken', '{}', 'null', '[null]', '[{"id":"old"}]']) {
  test('unreadable library stays byte-for-byte intact: ' + raw, () => {
    const f = fixture(raw); assert.equal(f.box.saveCurrent(), null);
    assert.equal(f.data.get(KEY), raw); assert.equal(f.data.has('foh-fix83-draft'), false);
    assert.equal(f.draft.heroLibraryId, undefined); assert.equal(f.box.dirty, true);
    assert.match(f.status.textContent, /non effectuée/);
    assert.throws(() => f.box.storeHeroes([])); assert.equal(f.data.get(KEY), raw);
  });
}
test('quota failure preserves existing hero and unsaved state', () => {
  const raw = JSON.stringify([{id: 'old', draft: {name: 'Ancien'}}]), f = fixture(raw, KEY);
  assert.equal(f.box.saveCurrent(), null); assert.equal(f.data.get(KEY), raw);
  assert.equal(f.box.dirty, true); assert.equal(f.draft.heroLibraryId, undefined);
});
test('draft quota failure retains durable hero and prevents duplicate on retry', () => {
  const f = fixture(null, 'foh-fix83-draft'); assert.ok(f.box.saveCurrent());
  assert.equal(f.box.dirty, false); assert.match(f.status.textContent, /depuis Mes héros/);
  f.box.saveCurrent(); assert.equal(JSON.parse(f.data.get(KEY)).length, 1);
});
test('storage access denied does not escape the save handler', () => {
  const f = fixture(); f.box.localStorage.getItem = () => {throw Error('SecurityError');};
  assert.equal(f.box.saveCurrent(), null); assert.equal(f.data.size, 0); assert.equal(f.box.dirty, true);
});
test('automatic save does not replace failure notice with success', () => {
  assert.ok(!html.includes("saveCurrent();q('#save-status').textContent='Personnage validé et sauvegardé automatiquement.'"));
  assert.ok(html.includes("if(saveCurrent())q('#hero-reveal-dialog').close()"));
});
test('every executable inline script parses', () => {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type=["']application\/json/i.test(match[1])) continue;
    new vm.Script(match[2]);
  }
});
console.log(`${checks} storage and syntax checks passed.`);
