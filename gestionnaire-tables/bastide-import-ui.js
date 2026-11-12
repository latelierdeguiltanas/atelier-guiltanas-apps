/* Importer son ancien hub MJ, séparé des invitations de partage entre MJ. */
(function(){
'use strict';
const A=window.TableManagerAPI,legacy=window.TableIntegration,mj=()=>window.MJAccount;
if(!A||!legacy)return;
const ROOT='https://latelierdeguiltanas.github.io/atelier-guiltanas-apps/';
const API='https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/guiltanas-mj-bastide-pack';
const PUBLISHABLE='sb_publishable_XKVr4_kE2qsywCTgurH0CQ_GTXrEFeU';
let busy=false;
function hasLegacyBrowserAccess(){return !!localStorage.getItem('iot_bastide_inventory_key_v1')}
function explainConnection(){
 const el=document.getElementById('legacy-import-feedback');
 const msg='Première association : ouvre le Gestionnaire de tables dans le navigateur où ton hub MJ Bastide fonctionne déjà (souvent ton téléphone). Connecte-toi avec ton compte Mathieu, puis appuie ici sur « Importer ma Bastide ». Après cette première association, tu pourras importer depuis n’importe quel appareil connecté à ton compte.';
 if(el){el.hidden=false;el.textContent=msg;el.scrollIntoView({block:'nearest',behavior:'smooth'});}
 else A.notify(msg);
}
async function importHub(){
 if(busy)return;
 busy=true;
 const button=document.getElementById('my-bastide-import');
 if(button){button.disabled=true;button.textContent='Vérification de ton accès MJ…'}
 try{
  const account=mj();
  if(!account?.active?.())throw Error('Connecte-toi d’abord à ton compte MJ.');
  if(!account.hasLinkedBastide()){
   if(!hasLegacyBrowserAccess()){explainConnection();return;}
   await account.markBastideLinked();
  }
  if(button)button.textContent='Copie des ressources en cours…';
  const {data:{session}}=await account.client.auth.getSession();
  if(!session?.access_token)throw Error('Session expirée. Reconnecte-toi.');
  const r=await fetch(API,{method:'POST',cache:'no-store',headers:{
   'apikey':PUBLISHABLE,'Authorization':'Bearer '+session.access_token,'Content-Type':'application/json'
  },body:'{}',signal:AbortSignal.timeout(30000)});
  let value={};try{value=await r.json()}catch{}
  if(!r.ok)throw Error(value.error||'Lecture des ressources indisponible.');
  const data=value.scenario||{};
  const scenario=legacy.buildPack({items:data.shop,scenario:data.scenarioItems,maps:data.maps},
   {encounters:data.encounters},{library:{campaigns:data.combat}});
  window.TableStudio?.organize?.(scenario);
  const a=scenario.assets;
  if(!confirm('Importer L’Île aux Tempêtes dans ta bibliothèque privée ?\n\n'+
    a.shop.length+' articles boutique\n'+a.scenarioItems.length+' objets\n'+a.maps.length+' cartes\n'+
    a.encounters.length+' PNJ / rencontres\n\nAucun PJ, aucune session de jeu et aucune clé privée copiés.'))return;
  A.getDb().scenarios.push(scenario);A.save();A.showLibrary();
  A.notify('L’Île aux Tempêtes a été importée, sans PJ, dans ta bibliothèque personnelle.');
 }catch(error){
  const el=document.getElementById('legacy-import-feedback');
  if(el){el.hidden=false;el.textContent='Import impossible : '+error.message;}
  A.notify('Import Bastide : '+error.message);
 }finally{
  busy=false;if(button){button.disabled=false;button.textContent='Importer ma Bastide';}
 }
}
function panel(){
 const node=document.createElement('section');
 node.className='panel';
 node.id='legacy-import-simple';
 node.innerHTML='<div class="eyebrow">IMPORTER MON HUB EXISTANT</div>'+
 '<h2>Ma Bastide → L’Île aux Tempêtes</h2>'+
 '<p>Pour copier les objets de quête, les cartes, les PNJ et la boutique de Mila dans ton compte MJ, <b>tu n’as aucun code à 64 caractères à saisir</b>.</p>'+
 '<div class="actions"><button class="button primary" id="my-bastide-import">Importer ma Bastide</button>'+
 '<a class="button" href="'+ROOT+'ile-aux-tempetes-bastide/mj/" target="_blank" rel="noopener noreferrer">Ouvrir ma Bastide</a></div>'+
 '<p class="note">'+(mj()?.hasLinkedBastide?.()?'Compte déjà relié à la Bastide : import possible directement.':
 'Première utilisation : une association depuis ton navigateur MJ Bastide est nécessaire, une seule fois.')+'</p>'+
 '<div id="legacy-import-feedback" class="alert" hidden></div>'+
 '<p class="note">Ce bouton n’ajoute pas les six PJ de ta Bastide et ne modifie pas ton hub d’origine.</p>';
 return node;
}
const previous=legacy.decorate;
legacy.decorate=function(ctx){
 previous?.(ctx);
 if(ctx.view!=='library'||!mj()?.active?.())return;
 const hero=document.querySelector('#app .hero');
 if(hero)hero.after(panel());
 const shared=document.querySelector('#app #mj-pack-import-code');
 if(shared){
  const parent=shared.closest('.mj-account-panel');
  const heading=parent?.querySelector('h2');
  if(heading)heading.textContent='Importer le scénario reçu d’un AUTRE MJ';
  const explanation=parent?.querySelector('p');
  if(explanation)explanation.textContent='Ici, on utilise un code d’invitation transmis par un autre MJ. Ce n’est PAS le chemin pour importer ton propre hub Bastide.';
 }
};
document.addEventListener('click',event=>{
 if(event.target.closest('#my-bastide-import'))importHub();
});
})();