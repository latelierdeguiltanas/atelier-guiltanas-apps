import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const required=['Zombie humain','Goule','Harpie de l’épave','Calculer la composition','Exporter JSON','Initiative','Retarder ce tour'];
for(const value of required){if(!html.includes(value))throw new Error(`Élément absent : ${value}`)}
const ids=[...html.matchAll(/id:\s*'([^']+)'/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)throw new Error('Identifiants de données dupliqués');
if(/action bonus|jet de sauvegarde contre la mort|facteur de puissance/i.test(html))throw new Error('Résidu D&D détecté');
console.log(`OK — ${required.length} contrôles structurels, ${ids.length} identifiants uniques.`);
