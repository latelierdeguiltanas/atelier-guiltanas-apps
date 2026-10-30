'use strict';
// Semantic sentinels are authored independently from the renderer, from source rules.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),{load}=require('./forge_product_runner'),{db,html}=load(root+'/index.html'),PDFLib=require('../progression/pdf-lib');
function native(h){const box={window:{__FOH_PRODUCT__:{},__FOH_ENGINE__:{}},PDFLib,setTimeout,clearTimeout,Uint8Array,ArrayBuffer,crypto:crypto.webcrypto,document:{querySelector:s=>s==='#FOH_DB_JSON'?{textContent:h.match(/id="FOH_DB_JSON"[^>]*>([\s\S]*?)<\/script>/)[1]}:null},MutationObserver:class{observe(){}},requestAnimationFrame(){},console};vm.createContext(box);vm.runInContext(fs.readFileSync(root+'/progression/pdf-lib.js','utf8'),box);vm.runInContext(h.match(/<script id="FORGE_OFFICIAL_PDF_EXPORT_FIX121">([\s\S]*?)<\/script>/)[1],box);return box.window.__FOH_OFFICIAL_PDF__;}
const cases=[
  {
    "id": "ability:mecanismes:classpath:voie-de-l-artilleur:class-arquebusier:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Mécanismes",
    "required": [
      "rang+2",
      "siège",
      "dé bonus"
    ]
  },
  {
    "id": "ability:tir-de-grenaille-l:classpath:voie-des-explosifs:class-arquebusier:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Tir de grenaille (L)",
    "required": [
      "rang+2",
      "10 × 5",
      "moitié"
    ]
  },
  {
    "id": "ability:pilier-de-bar:classpath:voie-du-mercenaire:class-arquebusier:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Pilier de bar",
    "required": [
      "rang+2",
      "alcool",
      "non létaux",
      "2"
    ]
  },
  {
    "id": "ability:mort-ou-vif-l:classpath:voie-du-mercenaire:class-arquebusier:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Mort ou vif (L)",
    "required": [
      "désarmer",
      "renverser",
      "affaiblir",
      "1d4",
      "NC",
      "rang"
    ]
  },
  {
    "id": "ability:defaut-dans-la-cuirasse-a:classpath:voie-de-la-precision:class-arquebusier:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Défaut dans la cuirasse (A)",
    "required": [
      "10+AGI",
      "immatériel",
      "round suivant"
    ]
  },
  {
    "id": "ability:feinte-l:classpath:voie-de-l-escrime:class-barde:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Feinte (L)",
    "required": [
      "2×rang",
      "2d4°",
      "CHA/PER"
    ]
  },
  {
    "id": "ability:charmant:classpath:voie-de-la-seduction:class-barde:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Charmant",
    "required": [
      "rang+2",
      "1 PC",
      "1d4°+CHA"
    ]
  },
  {
    "id": "ability:eclectique:classpath:voie-du-vagabond:class-barde:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Éclectique",
    "required": [
      "aucun cumul",
      "R1 de peuple"
    ]
  },
  {
    "id": "ability:survie:classpath:voie-de-la-survie:class-rodeur:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Survie",
    "required": [
      "rang+2",
      "1d4°"
    ]
  },
  {
    "id": "ability:nature-nourriciere:classpath:voie-de-la-survie:class-rodeur:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Nature nourricière",
    "required": [
      "1d6 h",
      "1d4° PV par rang",
      "10 min"
    ]
  },
  {
    "id": "ability:discretion:classpath:voie-de-l-assassin:class-voleur:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Discrétion",
    "required": [
      "rang+2",
      "argotien",
      "surpris"
    ]
  },
  {
    "id": "ability:attaque-en-finesse:classpath:voie-du-spadassin:class-voleur:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Attaque en finesse",
    "required": [
      "rang+2",
      "Intimidation",
      "AGI",
      "pas aux DM"
    ]
  },
  {
    "id": "ability:esquive-fatale-g:classpath:voie-du-spadassin:class-voleur:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Esquive fatale (G)",
    "required": [
      "sauf critique",
      "second adversaire"
    ]
  },
  {
    "id": "ability:tour-de-force-g:classpath:voie-de-la-brute:class-barbare:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Tour de force (G)",
    "required": [
      "chemise de mailles",
      "1d4°",
      "+10"
    ]
  },
  {
    "id": "ability:peau-de-pierre:classpath:voie-du-pagne:class-barbare:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Peau de pierre",
    "required": [
      "CON",
      "AGI",
      "plafond",
      "+1"
    ]
  },
  {
    "id": "ability:cri-de-guerre-g:classpath:voie-de-la-rage:class-barbare:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Cri de guerre (G)",
    "required": [
      "rang+2",
      "VOL",
      "10 m"
    ]
  },
  {
    "id": "ability:piqures-d-insectes:classpath:voie-du-preux:class-chevalier:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Piqûres d’insectes",
    "required": [
      "RD 1",
      "2 en mailles",
      "3 en plaques"
    ]
  },
  {
    "id": "ability:intercepter-g:classpath:voie-du-meneur-d-homme:class-chevalier:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Intercepter (G)",
    "required": [
      "sa DEF",
      "rang aux DM",
      "avant le résultat"
    ]
  },
  {
    "id": "ability:proteger-un-allie-g:classpath:voie-du-bouclier:class-guerrier:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Protéger un allié (G)",
    "required": [
      "rang+2",
      "surprise",
      "avant le résultat"
    ]
  },
  {
    "id": "ability:resilient:classpath:voie-de-la-resistance:class-guerrier:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Résilient",
    "required": [
      "rang",
      "étourdi",
      "affaibli"
    ]
  },
  {
    "id": "ability:langage-des-animaux:classpath-voie-des-animaux-class-druide-cof2-lb-2024:r1",
    "label": "Rang 1 — Langage des animaux",
    "required": [
      "mammifères",
      "rang+2"
    ]
  },
  {
    "id": "ability:baies-magiques:classpath-voie-du-protecteur-class-druide-cof2-lb-2024:r1",
    "label": "Rang 1 — Baies magiques (L)*",
    "required": [
      "1 effet/jour/personnage",
      "rang+2"
    ]
  },
  {
    "id": "ability:peau-d-ecorce:classpath-voie-des-vegetaux-class-druide-cof2-lb-2024:r1",
    "label": "Rang 1 — Peau d’écorce (M)*",
    "required": [
      "pas de cumul",
      "armure métallique",
      "rang+2"
    ]
  },
  {
    "id": "ability:soins:classpath:voie-des-soins:class-pretre:cof2-lb-2024:r1",
    "label": "Rang 1 — Récupération mineure (A)*",
    "required": [
      "Usages/jour = rang",
      "rang+2"
    ]
  },
  {
    "id": "ability:armure-de-mana:classpath-voie-de-la-magie-protectrice-class-magicien-cof2-lb-2024:r1",
    "label": "Rang 1 — Armure de mana (M)*",
    "required": [
      "Ne se cumule jamais",
      "armure",
      "+3"
    ]
  },
  {
    "id": "ability-r1-class-ensorceleur-divination-divination-cof2-lb-2024",
    "label": "Divination (L)*",
    "required": [
      "NC <niveau",
      "Volontaire",
      "Init/DEF"
    ]
  },
  {
    "id": "ability-r1-class-ensorceleur-illusions-mirage-cof2-lb-2024",
    "label": "Mirage (L)*",
    "required": [
      "rang+2",
      "50 m"
    ]
  },
  {
    "id": "ability:detection-invisible:classpath:voie-de-la-divination:class-ensorceleur:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Détection de l’invisible (L)*",
    "required": [
      "invisibles",
      "CHA min",
      "20 m"
    ]
  },
  {
    "id": "ability:sommeil:classpath:voie-de-l-envouteur:class-ensorceleur:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Sommeil (L)*",
    "required": [
      "CHA min",
      "NC <1",
      "1/combat"
    ]
  },
  {
    "id": "ability:maitrise-des-elements-m:classpath:voie-de-la-magie-elementaire:class-magicien:cof2-lb-2024:rank2:cof2-lb-2024",
    "label": "Maîtrise des éléments (M)*",
    "required": [
      "échanger",
      "rang+2",
      "INT min"
    ]
  },
  {
    "id": "ability:foh81:invocateur:voie-des-mutations:r2",
    "label": "Rang 2 — Mutation protectrice",
    "required": [
      "une mutation",
      "DEF +rang",
      "immunité"
    ]
  },
  {
    "id": "ability:foh81:psionique:voie-de-la-telepathie:r2",
    "label": "Rang 2 — Radar mental",
    "required": [
      "+2/rang",
      "pas de malus",
      "invisible"
    ]
  },
  {
    "id": "ability:reference:classpath:voie-du-fauve:class-druide:cof2-lb-2024:rank2",
    "label": "Panthère",
    "required": [
      "Panthère",
      "DEF 13+rang",
      "PV 4×niveau",
      "1d4+2"
    ]
  },
  {
    "id": "ability:reference:classpath:voie-des-vegetaux:class-druide:cof2-lb-2024:rank2",
    "label": "Prison végétale (L)*",
    "required": [
      "10 m",
      "20 m",
      "PER min",
      "pas alliés"
    ]
  },
  {
    "id": "ability:reference:classpath:voie-de-la-priere:class-pretre:cof2-lb-2024:rank2",
    "label": "Sanctuaire (L)*",
    "required": [
      "Action offensive",
      "fin immédiate",
      "récupération rapide"
    ]
  },
  {
    "id": "ability:reference:classpath:voie-des-soins:class-pretre:cof2-lb-2024:rank2",
    "label": "Vigueur divine (L)*",
    "required": [
      "rang+2",
      "maladies",
      "poisons"
    ]
  },
  {
    "id": "ability:petite-taille:path:voie-du-halfelin:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Petite taille",
    "required": [
      "d6",
      "d8–d10",
      ">d10",
      "interdits"
    ]
  },
  {
    "id": "ability:don-trange:path:voie-du-gnome:cof2-lb-2024:rank1:cof2-lb-2024",
    "label": "Don étrange",
    "required": [
      "Sciences",
      "10 m",
      "1/jour"
    ]
  },
  {
    "id": "ability:violence-cibl-e:path:voie-du-demi-ogre:addon-comp2017-cof2:rank2:cof2-lb-2024",
    "label": "Violence ciblée",
    "required": [
      "1d4 rounds",
      "Même jour",
      "Provocation volontaire"
    ]
  }
];
const abilities=[...db.tables.abilities_class,...db.tables.abilities_people].filter(a=>Number(a.rank)<=2),api=native(html);global.PDFLib=PDFLib;require('../progression/official-pdf-engine');const shared=global.FOHOfficialPDF.create({PDFLib,DB:db}),report={schema:'FOH_N1_PDF_SUMMARY_SEMANTICS',scope:'All 210 R1/R2 native/shared summary parity, unchanged full descriptions, 39 independent semantic sentinels. No source-completeness or mechanical certification implied.',status:'PASS',summaryCount:abilities.length,sentinels:cases.length,rows:[]};
for(const a of abilities){assert.ok(api.rankSummary(a).trim(),a.id);assert.equal(api.rankSummary(a),shared.rankSummary(a),a.id+' native/shared parity');assert.ok(!/\.\.\.|…|\[object Object\]/.test(api.rankSummary(a)),a.id+' truncation');}
for(const c of cases){const a=abilities.find(a=>a.id===c.id);assert.ok(a,c.id);const summary=api.rankSummary(a);for(const token of c.required)assert.ok(summary.includes(token),c.label+' loses '+token+': '+summary);report.rows.push({abilityId:c.id,label:c.label,required:c.required,summary,passed:true});}
const reviewed=JSON.parse(fs.readFileSync(root+'/QA/N1/lot10/pdf-summary-review.json','utf8'));for(const c of reviewed.cases){const a=abilities.find(a=>a.id===c.abilityId);assert.equal(crypto.createHash('sha256').update(a.desc).digest('hex'),c.sourceSHA256,'Source rewritten: '+c.label);}
const before=cp.execFileSync('git',['show','6b2aac2:forge-of-heroes/index.html'],{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024}),old=native(before);report.baselineFailures=cases.map(c=>({label:c.label,missing:c.required.filter(token=>!old.rankSummary(abilities.find(a=>a.id===c.id)).includes(token))})).filter(x=>x.missing.length);assert.ok(report.baselineFailures.length>=20,'Sentinels must reproduce real omissions in baseline');
fs.mkdirSync(root+'/QA/N1/lot10',{recursive:true});fs.writeFileSync(root+'/QA/N1/lot10/pdf-summary-semantics.json',JSON.stringify(report,null,2)+'\n');console.log('PASS '+abilities.length+' native/shared R1/R2 summaries, '+cases.length+' semantic sentinels, '+report.baselineFailures.length+' baseline omissions reproduced; '+reviewed.cases.length+' full descriptions unchanged.');
