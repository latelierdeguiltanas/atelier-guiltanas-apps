import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const required=['Zombie humain','Goule','Harpie de l’épave','Hibours contaminé','Kobold ailé','Sinensa','Pieuvre serviteur des spores','Serpent de feu','Strige','Thallophyte violette','Vrléclair','Runara','Tarak','Varnoth','Calculer la composition','Exporter JSON','Initiative','Retarder','Ajouter un renfort','Effets / dégâts sur la durée','INIT de base','Variante de campagne préparée','Ordre de passage','Déjà joué','Tour actuel','À venir','timelineStatus'];
for(const value of required){if(!html.includes(value))throw new Error(`Élément absent : ${value}`)}
const ids=[...html.matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw new Error('Identifiants de données dupliqués');
if(ids.length!==19)throw new Error(`Bestiaire incomplet : ${ids.length}/19 profils`);
const encounterNames=['Prologue — Marins noyés','Île — Hibours contaminé','Île — Groupe de kobolds','Île — Kobolds bricoleurs','Grottes — Myconides','Grottes — Sanctuaire de Sinensa','Grottes — Pieuvre serviteur des spores','Épave — Harpie','Épave — Morts de l’épave','Monastère — Serpents de feu','Monastère — Nuée de striges','Monastère — Thallophytes violettes','Observatoire — Vrléclair'];
for(const value of encounterNames){if(!html.includes(value))throw new Error(`Rencontre absente : ${value}`)}
if(/action bonus|jet de sauvegarde contre la mort|facteur de puissance/i.test(html))throw new Error('Résidu D&D détecté');
if(/function targetBudget/.test(html))throw new Error('Ancienne formule de budget NC encore présente');
console.log(`OK — ${required.length} contrôles structurels, ${ids.length} identifiants uniques.`);
