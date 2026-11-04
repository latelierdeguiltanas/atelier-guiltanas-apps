'use strict';
// Book pp.62-65. Concise play summaries; canonical full descriptions stay intact.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),write=process.argv.includes('--write');
const summaries={
 mecanismes:'Mécanismes et pièges mécaniques : tests +rang+2. Attaques avec une arme de siège : dé bonus.',
 'arme-a-repetition':'Jusqu’à 2 armes modifiées : chargeur de 2+INT projectiles, +1 par voie d’arquebusier au rang 3. Recharger : 1 action limitée par projectile.',
 'tir-de-barrage-l':'(L) Surveille 20 m de large jusqu’au prochain tour. Cible en mouvement touchée : elle choisit DM ×2 ou fin de son tour et déplacement sans DM. Tirs possibles tant que l’arme reste chargée.',
 'tir-de-grenaille-l':'Grenaille choisie au chargement. (L) Un test contre les DEF dans un cône 10 × 5 m ; moitié des DM habituels. Tests d’artificier : +rang+2.',
 demolition:'Préparation et pose : 3 rounds. Structure : 3d4°+INT DM, moitié de RD ignorée ; rayon 2 m : 2d4° DM. Rang charges/jour, partagées avec Piège explosif et Boulet explosif.',
 'poudre-puissante':'Armes à poudre : portée +10 m, DM +1 et projectiles magiques. DM +1 supplémentaire par voie d’arquebusier atteignant le rang 5.',
 'pilier-de-bar':'Tests sociaux en taverne/auberge et résistance à l’alcool : +rang+2. Mains nues : 1d4° DM non létaux. DM non létaux reçus divisés par 2.',
 'mort-ou-vif-l':'(L) Attaque contact/distance : DM normaux ou temporaires. Si NC cible <rang : désarmer, renverser ou affaiblir 1d4 rounds. Critique : cumule 2 effets.',
 'combattant-aguerri':'DEF +1. Choisit une capacité R1 de guerrier, voleur (armure de cuir) ou rôdeur (cuir renforcé).',
 'plus-vite-que-son-ombre':'Arme à poudre chargée en main : +5 Initiative pour tirer. Tir poudre/arbalète au contact : sans dé malus, sauf couleuvrine.',
 'ajuster-le-tir':'Après un tir raté déclaré tir de réglage : +5 à la prochaine attaque à distance sur la même cible avant la fin du round suivant.',
 'tir-double-l':'(L) Une pétoire ou arbalète de poing chargée par main : 2 attaques, chacune à −2. Même cible : aucun malus.',
 'joli-coup':'Tir à distance : couvert partiel sans malus ; couvert important −2 au lieu de −5.',
 'defaut-dans-la-cuirasse-a':'(A) Prépare une cible. Au round suivant : tirs contre DEF 10+AGI cible, résistance/RD ignorée sauf RD d’une cible immatérielle. Exception même round : Combat de masse R5.',
 'tir-precis':'Armes à distance : critiques sur 19–20 ; sur 18–20 à partir du rang 5.'
};
const start='// ARQ_N1_SOURCE_SUMMARIES_BEGIN',end='// ARQ_N1_SOURCE_SUMMARIES_END';
const block=start+'\nconst ARQ_N1_SOURCE_SUMMARIES='+JSON.stringify(summaries,null,2)+';\n'+end+'\n';
const original="function rankSummary(ability,limit=260){if(!ability)return '';";
const updated=original+"const slug=String(ability.id||'').split(':')[1];if(/class-(arquebusier|arbaletrier):/.test(String(ability.id||ability.path_id||ability.pathId||''))&&ARQ_N1_SOURCE_SUMMARIES[slug])return ARQ_N1_SOURCE_SUMMARIES[slug];";
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');const rows=[];
for(const file of ['progression/official-pdf-engine.js','index.html']){
 const fp=path.join(root,file),before=fs.readFileSync(fp,'utf8');let after=before;
 if(after.includes(start)){const a=after.indexOf(start),b=after.indexOf(end,a);assert(b>a);after=after.slice(0,a)+after.slice(b+end.length+1);}
 after=after.replace(updated,original);assert.equal(after.split(original).length-1,1,'Unique PDF summary function '+file);
 after=after.replace(original,block+updated);
 if(file.endsWith('.html'))for(const id of ['FOH_ENGINE_BUNDLE','FOH_DB_JSON']){const re=new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>');assert.equal(after.match(re)[1],before.match(re)[1]);}
 if(write)fs.writeFileSync(fp,after);else assert.equal(after,before,'Summaries not packaged '+file);
 rows.push({file,beforeSha256:hash(before),afterSha256:hash(after)});
}
console.log(JSON.stringify({status:'PASS',write,summaries:Object.keys(summaries).length,rows}));
