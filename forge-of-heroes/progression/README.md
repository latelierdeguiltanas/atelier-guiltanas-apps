# Le Carnet des héros — progression COF2

Independent static page at `forge-of-heroes/progression/`, first release PROGRESSION-1 (12 October 2026). The Forge N1 engine, database, seeds and recovery calculation core are unchanged. The parent page only adds a link and local progression locks.

## Supported scope

Six Bastide recovered N1 heroes. Existing local `foh-guiltanas-heroes-v1` snapshots take priority over reference seeds; multiple conflicting local snapshots require an explicit import. The displayed N1 snapshot is frozen on **Figer et préparer le niveau 2**, after confirmation. Selection of N2 gains remains editable and persists across reloads. Final N2 validation consumes exactly two points and appends an immutable ledger row. N1 and validated choices have no edit/delete UI.

The progression library has its own single storage key `foh-progression-v1`. All records contain the original hero, canonical base, locked timestamp, validated levels, pending picks and recomputed head. Load/import replays the validated choices; inconsistent totals and histories are rejected. Imports may extend a matching ledger but never replace its base, earlier choices or higher level. A stale-tab write and storage failure produce an error instead of success. This does not provide a server transaction or cryptographic signature.

Exports are `FOH_PROGRESSION` or `FOH_PROGRESSION_LIBRARY`, **not** N1 Forge transfer files. Players import these in the Carnet. Printing uses the browser's print/PDF workflow; it is not the official fillable PDF export.

## Data and calculation

43 paths / 195 ranks: all five base paths of each of the six profiles (150 ranks), six people paths (30), the two histories actually chosen by Vivelame (10), plus five druid R1 gifts available through Enfant de la forêt. Missing priest and sorcerer entries were supplemented with summaries from the provided COF2 base book, pages 93–96 and 122–125. History summaries were checked against the attached history pages 174 and 180. Goblin, forged soul and fairy data retain the existing COF1 table adaptations.

This is exhaustive for that **defined catalogue**, not all COF2 profiles, prestige paths, multiclassing or optional advanced paths. Only N1→N2 is open. N3+ remains closed until the complete data/mechanics audit, including retrospective CON changes, heroic attributes, spell resource modifiers, equipment choices and cross-path formulas. Do not remove the level gate merely because later texts are present.

N2 adds family PV + CON, +1 base attacks, and PM for newly acquired spells. Permanent effects added this level and archer path growth are applied as deltas to the frozen totals, without reapplying N1 effects. Temporary/conditional combat bonuses remain in capability text; they are not permanent sheet bonuses. Equipment remains reference inventory. Existing wolf and acquired young worg are derived from the new owner's level and final totals. Optional Éclaireur resource exchange and sylvan R1 gift are recorded in the acquisition row.

No N1 legal certification is added: absent creation choices remain absent, and the existing snapshots and MJ adjustments are preserved.

## Verification

`node forge-of-heroes/FINAL_FREEZE_TESTS/progression_runner.js`: 13 groups, including 226 ordered N2 plans, ledger replay, exact independent totals, invalid choices, import rollback, storage failures and parent Forge guard.

`node forge-of-heroes/FINAL_FREEZE_TESTS/progression_ui_journey_runner.js`: six production UI journeys (freeze → select → fresh JS session → validate → export → fresh session) and one quota failure. These use minimal DOM/storage fixtures, **not a real browser or phones**.

Existing storage, budget, equipment, calculation trace, recovery and persistence runners continue passing (76 checks). No browser screenshots or official editable PDF visual verification in this release.

## Trust boundary

Local locks stop normal interface changes and stale imports on the same origin/device. A user who clears browser data, edits JSON deliberately, or opens a fresh device can create another baseline. Canonical base comparison is an integrity check, not an unforgeable signature. Strict campaign enforcement requires a future MJ-controlled server baseline/approval. Do not claim anti-cheat guarantees from local storage.
