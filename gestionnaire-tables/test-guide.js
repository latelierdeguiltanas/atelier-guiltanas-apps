/* Parcours de recette de deux vrais comptes MJ, sans accès aux clés privées. */
(function(){
'use strict';
const account=()=>window.MJAccount, app=()=>window.TableManagerAPI;
const tasks=[
['owner','Créer mon compte Mathieu et confirmer ma connexion'],
['legacy','Associer la Bastide à mon compte uniquement'],
['pack','Importer L’Île aux Tempêtes sans les PJ de la Bastide'],
['share','Générer et copier une invitation privée pour le scénario'],
['second','Créer un compte MJ Test avec une deuxième adresse e-mail'],
['isolation','Sur MJ Test : aucune table Bastide ou fiche existante'],
['import','Importer le scénario via le code reçu'],
['resources','Retrouver Mila, les objets, les cartes et les PNJ'],
['empty','Vérifier que la nouvelle table a 0 personnage au départ'],
['sheet','Raccorder une fiche HTTPS de test'],
['battle','Ouvrir un combat vierge propre à MJ Test'],
['sync','Actualiser la page et retrouver la table avec ses ressources']
];
let namespace='invite';
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=()=>('guiltanas.recette.mj.'+namespace);
const read=()=>{try{return JSON.parse(localStorage.getItem(key())||'{}')}catch{return {}}};
const write=v=>localStorage.setItem(key(),JSON.stringify(v));
function stats(){
 const connected=!!account()?.active?.();
 const db=connected?app()?.getDb?.():null;
 const pack=(db?.scenarios||[]).find(s=>/île aux tempêtes/i.test(s.name||''));
 const table=(db?.tables||[]).find(t=>/île aux tempêtes/i.test(t.scenario?.name||''));
 const assets=table?.scenario?.assets||pack?.assets||{};
 return {connected,tables:db?.tables?.length||0,scenarios:db?.scenarios?.length||0,pack:!!pack,
  hasBastide:!!account()?.hasLinkedBastide?.(),emptyPJ:table?table.characters.length===0:null,
  shop:assets.shop?.length||0,items:assets.scenarioItems?.length||0,maps:assets.maps?.length||0,npcs:assets.encounters?.length||0};
}
function render(){
 const dialog=document.getElementById('mj-test-guide'),x=stats(),checks=read(),count=tasks.filter(t=>checks[t[0]]).length;
 dialog.innerHTML='<header class="mj-test-head"><div><p class="eyebrow">RECETTE DU PORTAIL MJ</p><h2>Répétition avant la séance</h2><p>Valide chaque action réellement effectuée. Les indicateurs sont lus depuis le compte connecté, sans donnée secrète.</p></div><button data-test="close">Fermer</button></header>'+
 '<div class="mj-test-health">Compte : '+(x.connected?'connecté':'non connecté')+' · Tables : '+x.tables+' · Scénarios : '+x.scenarios+
 ' · Pack : '+(x.pack?'oui':'non')+' · Bastide associée : '+(x.hasBastide?'oui':'non')+
 ' · Mila : '+x.shop+' · Objets : '+x.items+' · Cartes : '+x.maps+' · PNJ : '+x.npcs+
 '</div><p class="mj-test-progress">'+count+' / '+tasks.length+' étapes cochées</p>'+
 '<div class="mj-test-checks">'+tasks.map((t,i)=>'<label><input type="checkbox" data-test-step="'+t[0]+'" '+(checks[t[0]]?'checked':'')+'><span>'+(i+1)+'. '+clean(t[1])+'</span></label>').join('')+'</div>'+
 '<p class="mj-test-warning"><b>Séparation indispensable :</b> utilise une fenêtre privée pour MJ Test, avec une autre adresse e-mail. N’ouvre jamais ton lien MJ Bastide dans cette fenêtre. Seul le lien de partage du scénario doit y être utilisé.</p>'+
 '<div class="mj-test-actions"><a target="_blank" rel="noopener noreferrer" href="'+location.pathname+'?mode=test">Formulaire Compte MJ Test</a><button data-test="copy">Copier le bilan</button><button data-test="clear">Effacer les coches</button></div>';
}
async function openGuide(){
 try{const r=await account()?.client?.auth?.getSession?.();namespace=r?.data?.session?.user?.id||'invite';}catch{namespace='invite'}
 render();const d=document.getElementById('mj-test-guide');if(!d.open)d.showModal();
}
const styles=document.createElement('style');
styles.textContent='#mj-test-guide{max-width:min(760px,96vw);max-height:90vh;overflow:auto;background:#13281b;color:#eee;border:1px solid #aa8b54;border-radius:14px;padding:18px}#mj-test-guide::backdrop{background:#000b}.mj-test-head{display:flex;gap:12px;justify-content:space-between}.mj-test-head h2{font-size:22px;margin:6px 0;color:#e8d08f}.mj-test-head p{font-size:13px;color:#cbd5ca}.mj-test-head button,.mj-test-actions button{background:#294332;color:#fff;border:1px solid #668568;border-radius:8px;padding:9px}.mj-test-health{background:#243c2b;border-radius:9px;padding:12px;font-size:12px;line-height:1.7}.mj-test-progress{color:#e2be71;font-weight:bold}.mj-test-checks{display:grid;gap:7px}.mj-test-checks label{display:flex;align-items:start;gap:9px;padding:10px;border-radius:8px;background:#1d3525;border:1px solid #426548;font-size:13px}.mj-test-checks input{accent-color:#d6ad57}.mj-test-warning{border-left:3px solid #d6ad57;padding:11px;background:#392f21;font-size:13px}.mj-test-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}.mj-test-actions a{background:#d6ad57;color:#182117;text-decoration:none;padding:10px 13px;border-radius:8px;font-weight:750}';
document.head.append(styles);
const dialog=document.createElement('dialog');dialog.id='mj-test-guide';document.body.append(dialog);
const button=document.createElement('button');button.className='button subtle';button.type='button';button.textContent='Recette de test MJ';button.onclick=openGuide;
document.querySelector('.top-actions')?.prepend(button);
dialog.addEventListener('change',event=>{const item=event.target.closest('[data-test-step]');if(!item)return;const o=read();o[item.dataset.testStep]=item.checked;write(o);render()});
dialog.addEventListener('click',async event=>{
 const b=event.target.closest('[data-test]');if(!b)return;
 if(b.dataset.test==='close')dialog.close();
 if(b.dataset.test==='clear'&&confirm('Réinitialiser seulement le suivi des essais de ce compte ?')){write({});render()}
 if(b.dataset.test==='copy'){
  const s=stats(),c=read();
  const report=['BILAN DE RECETTE — '+new Date().toLocaleString('fr-FR'),'Compte connecté : '+s.connected,'Tables : '+s.tables,'Scénario privé : '+s.pack,'Boutique '+s.shop+', objets '+s.items+', cartes '+s.maps+', PNJ '+s.npcs,...tasks.map(t=>(c[t[0]]?'OK : ':'NON VÉRIFIÉ : ')+t[1])].join('\n');
  try{await navigator.clipboard.writeText(report);app()?.notify?.('Bilan copié sans données privées');}catch{app()?.notify?.('Copie impossible sur cet appareil')}
 }
});
})();