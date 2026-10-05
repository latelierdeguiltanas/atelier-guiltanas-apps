import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const required=['Zombie humain','Goule','Harpie de l’épave','Hibours contaminé','Kobold ailé','Sinensa','Pieuvre serviteur des spores','Serpent de feu','Strige','Thallophyte violette','Vrléclair','Runara','Tarak','Varnoth','Calculer la composition','Exporter JSON','Initiative','Retarder','Ajouter un renfort','Effets suivis','INIT de base','Variante de campagne préparée','Ordre d’initiative','vue globale','Personnages joueurs','Monstres et adversaires','openCombatant','Gérer les états','Gérer les effets','toucher pour ouvrir la fiche','Personnages participants','Prépôtante','Scanlan','Wilfried','Zéphéline','Vivelame','Charger le combat complet','newPlayerFighter'];
for(const value of required){if(!html.includes(value))throw new Error(`Élément absent : ${value}`)}
const monsterBlock=html.match(/const MONSTERS=([\s\S]*?)const ENCOUNTERS=/)?.[1]||'';
const ids=[...monsterBlock.matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw new Error('Identifiants de données dupliqués');
if(ids.length!==19)throw new Error(`Bestiaire incomplet : ${ids.length}/19 profils`);
const playerBlock=html.match(/const PLAYER_PRESETS=([\s\S]*?)const STATE_KEY=/)?.[1]||'';
const playerIds=[...playerBlock.matchAll(/id:'([^']+)'/g)].map(m=>m[1]);
if(playerIds.length!==5)throw new Error(`Équipe prédéfinie incomplète : ${playerIds.length}/5 PJ`);
const encounterNames=['Prologue — Marins noyés','Île — Hibours contaminé','Île — Groupe de kobolds','Île — Kobolds bricoleurs','Grottes — Myconides','Grottes — Sanctuaire de Sinensa','Grottes — Pieuvre serviteur des spores','Épave — Harpie','Épave — Morts de l’épave','Monastère — Serpents de feu','Monastère — Nuée de striges','Monastère — Thallophytes violettes','Observatoire — Vrléclair'];
for(const value of encounterNames){if(!html.includes(value))throw new Error(`Rencontre absente : ${value}`)}
if(/action bonus|jet de sauvegarde contre la mort|facteur de puissance/i.test(html))throw new Error('Résidu D&D détecté');
if(/function targetBudget/.test(html))throw new Error('Ancienne formule de budget NC encore présente');
if(/COMBATTANT ACTIF|Nouveau round|Tour suivant|function nextTurn|function newRound|function renderActive/.test(html))throw new Error('Ancien moteur de tours encore présent');
console.log(`OK — ${required.length} contrôles structurels, ${ids.length} identifiants uniques.`);
