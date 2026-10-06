import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const required=['Zombie humain','Goule','Guivre-follette','Harpie de l’épave','Hibours contaminé','Kobold ailé','Sinensa','Pieuvre serviteur des spores','Serpent de feu','Strige','Thallophyte violette','Vrléclair','Runara','Tarak','Varnoth','Calculer la composition','Exporter JSON','Initiative','Retarder','Ajouter un renfort','Effets suivis','INIT de base','Variante COF2 prudente','Ordre d’initiative','vue globale','Personnages joueurs','Monstres et adversaires','openCombatant','Gérer les états','Gérer les effets','ouvrir la fiche','Personnages participants','Prépôtante','Scanlan','Wilfried','Zéphéline','Vivelame','Faëlar','Loup de Faëlar','Buff de groupe','Tous les PJ','openGroupBuffs','groupEffects','Charger le combat complet','newPlayerFighter'];
for(const value of required){if(!html.includes(value))throw new Error(`Élément absent : ${value}`)}
const monsterBlock=html.match(/const MONSTERS=([\s\S]*?)const ENCOUNTERS=/)?.[1]||'';
const ids=[...monsterBlock.matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw new Error('Identifiants de données dupliqués');
if(ids.length!==20)throw new Error(`Bestiaire incomplet : ${ids.length}/20 profils`);
const playerBlock=html.match(/const PLAYER_PRESETS=([\s\S]*?)const STATE_KEY=/)?.[1]||'';
const playerIds=[...playerBlock.matchAll(/id:'([^']+)'/g)].map(m=>m[1]);
if(playerIds.length!==7)throw new Error(`Équipe prédéfinie incomplète : ${playerIds.length}/7 participants`);
if(!/id:'fylar'[\s\S]*?name:'Faëlar'[\s\S]*?pv:10,def:14,init:14/.test(playerBlock))throw new Error('La fiche de combat de Faëlar ne correspond pas au rapport Forge');
if(!/id:'fylar-wolf'[\s\S]*?pv:4,def:13,init:14[\s\S]*?role:'companion'/.test(playerBlock))throw new Error('Le loup de Faëlar doit être distingué des PJ et reprendre son initiative');
if(/combatProfile|playerCombatProfile/.test(playerBlock))throw new Error('Faëlar ne doit pas embarquer une fiche plus complète que les autres PJ');
const encounterNames=['Plage — Marins noyés','Cloître — Marins noyés évités sur la plage','Île — Chaos aux sources chaudes','Île — Il court, il court, le hibours','Île — Renégats kobolds','B1 — Pieuvre serviteur des spores','B2 — Champignonnière','B3 — Nid de striges','B4 — Défense des myconides','B5 — Sanctuaire de Sinensa','B6 — Cristal : première vague','B6 — Après destruction du cristal','C4 — Quartiers du capitaine','C8 — Pont inférieur','Épave — Retour de la harpie','D2 — Ruines de la rotonde','D3 — Camp des kobolds','D5 — Vrléclair endormi','Final — Rituel de Vrléclair'];
for(const value of encounterNames){if(!html.includes(value))throw new Error(`Rencontre absente : ${value}`)}
if(!html.includes('<option>6</option>'))throw new Error('Le mode six PJ est absent');
if(!/marins:\{[\s\S]*?variants:\{1:\{zombie:1\}/.test(html))throw new Error('La rencontre d’ouverture COF2 doit proposer un zombie au niveau 1');
if(!html.includes('@media(max-width:620px)'))throw new Error('Le mode panneau PC étroit est absent');
if(!html.includes('class="combatBoards"'))throw new Error('La vue simultanée PJ/monstres est absente');
if(!html.includes('.overviewCard.buffed'))throw new Error('La surbrillance des buffs est absente');
if(!html.includes("size>=6&&e.sixth"))throw new Error('L’ajustement du sixième PJ est absent');
if(/function changeRec\([^\n]+forced/.test(html))throw new Error('La modification manuelle d’une composition est encore verrouillée');
const encounterBlock=html.match(/const ENCOUNTERS=([\s\S]*?)const DIFF=/)?.[1]||'';
const encounterIds=[...encounterBlock.matchAll(/^\s*(?:'([^']+)'|([\w-]+)):\{name:/gm)].map(m=>m[1]||m[2]);
if(encounterIds.length!==19)throw new Error(`Inventaire de rencontres incomplet : ${encounterIds.length}/19`);
const balanceNotes=[...encounterBlock.matchAll(/balance:'([^']+)'/g)];
if(balanceNotes.length!==19)throw new Error(`Justifications d’équilibrage incomplètes : ${balanceNotes.length}/19`);
for(const ref of [...encounterBlock.matchAll(/allowed:\[([^\]]*)\]/g)].flatMap(m=>[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]))){if(!ids.includes(ref))throw new Error(`Profil de rencontre absent du bestiaire : ${ref}`)}
if(!/['"]b3-striges['"]:\{[\s\S]*?variants:\{1:\{stirge:3\},2:\{stirge:4\}/.test(html))throw new Error('Les striges conservent encore les quantités D&D');
if(/action bonus|jet de sauvegarde contre la mort|facteur de puissance/i.test(html))throw new Error('Résidu D&D détecté');
if(/function targetBudget/.test(html))throw new Error('Ancienne formule de budget NC encore présente');
if(/COMBATTANT ACTIF|Nouveau round|Tour suivant|function nextTurn|function newRound|function renderActive/.test(html))throw new Error('Ancien moteur de tours encore présent');
console.log(`OK — ${required.length} contrôles structurels, ${ids.length} identifiants uniques.`);
