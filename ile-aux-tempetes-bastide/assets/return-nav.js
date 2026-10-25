/* Explicit, stable destinations also work from an installed app or a direct link. */
(()=>{
const base=new URL('../',document.currentScript.src),path=location.pathname.slice(base.pathname.length).replace(/index\.html$/,'');
if(document.getElementById('bastide-return'))return;
const names={wilfried:'Wilfried',scanlan:'Scanlan',prepotante:'Prépôtante',vivelame:'Vivelame',zepheline:'Zéphéline',faelar:'Faëlar',demo:'démonstration'};
const sheet=path.match(/^personnages\/([^/]+)\//)?.[1];
try{if(names[sheet])sessionStorage.setItem('bastide_last_sheet',sheet);}catch{}
let target='joueurs/',label='← Espace joueurs';
const personal={'hymnes/':'wilfried','pacte/':'wilfried','chroniqueur/':'scanlan'};
if(path==='joueurs/'||path==='mj/'){target='';label='← Accueil de la campagne';}
else if(path.startsWith('mj/')){target='mj/';label='← Table du MJ';}
else if(!sheet){
 let id=personal[path]||new URLSearchParams(location.search).get('playerId');
 if(!names[id]){try{const ref=new URL(document.referrer);if(ref.origin===base.origin&&ref.pathname.startsWith(base.pathname))id=ref.pathname.slice(base.pathname.length).match(/^personnages\/([^/]+)\//)?.[1];}catch{}}
 if(!names[id]){try{id=sessionStorage.getItem('bastide_last_sheet');}catch{}}
 if(names[id]){target='personnages/'+id+'/';label='← Fiche de '+names[id];}
}
const nav=document.createElement('nav');nav.id='bastide-return';nav.setAttribute('aria-label','Retour');
const back=document.createElement('a');back.href=new URL(target,base).href;back.textContent=label;nav.append(back);
back.textContent='← Retour';back.title=label.replace('← ','');
back.addEventListener?.('click',e=>{if(window.BastideBack?.closeLayer()){e.preventDefault();return;}try{const ref=new URL(document.referrer);if(ref.origin===base.origin&&ref.pathname.startsWith(base.pathname)&&ref.href!==location.href&&window.history.length>1){e.preventDefault();window.history.back();}}catch{}});
function closeLayer(){const dialog=[...document.querySelectorAll('dialog[open]')].at(-1);if(dialog){const cancel=new Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);if(!cancel.defaultPrevented&&dialog.open)dialog.close();return true;}const group=document.querySelector?.('.kobold-group[open]');if(group){group.open=false;group.querySelector('summary')?.focus();return true;}const viewer=document.getElementById('viewer');if(viewer&&!viewer.hidden){const close=document.getElementById('close');if(close)close.click();else viewer.hidden=true;return true;}return false;}
window.BastideBack={closeLayer};
function layerButtons(){document.querySelectorAll('dialog').forEach(dialog=>{if(dialog.querySelector('[data-layer-back]'))return;const button=document.createElement('button');button.type='button';button.dataset.layerBack='';button.textContent='← Retour';button.style.cssText='position:sticky;top:4px;z-index:20;padding:8px 12px;border:1px solid #a58d56;border-radius:8px;background:#102b20;color:#f4e8c5;cursor:pointer';button.onclick=()=>{const cancel=new Event('cancel',{cancelable:true});dialog.dispatchEvent(cancel);if(!cancel.defaultPrevented&&dialog.open)dialog.close();};dialog.prepend(button);});const viewer=document.getElementById('viewer');if(viewer){const button=viewer.querySelector('#close');if(button&&button.textContent!=='← Retour')button.textContent='← Retour';}}
if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver(layerButtons);observer.observe(document.body,{childList:true,subtree:true});layerButtons();}
document.body.prepend(nav);
const notifications=document.createElement('script');notifications.src=new URL('assets/notifications.js?v=1',base).href;document.head.append(notifications);
const css=document.createElement('style');css.textContent='#bastide-return{position:sticky;top:var(--bastide-session-height,0px);z-index:80;display:flex;align-items:center;min-height:44px;padding:4px 12px;box-sizing:border-box;background:#102b20f7;border-bottom:1px solid #706343;backdrop-filter:blur(8px)}#bastide-return a{display:inline-flex;align-items:center;min-height:36px;padding:4px 12px;box-sizing:border-box;border:1px solid #a58d56;border-radius:8px;color:#f4e8c5;text-decoration:none;font:700 14px/1.3 system-ui}#bastide-return a:focus-visible{outline:3px solid #fff0b5;outline-offset:2px}.mj-navigation,.topnav{top:var(--bastide-return-height,0px)}';document.head.append(css);
function height(){document.documentElement.style.setProperty('--bastide-return-height',nav.offsetHeight+'px');}height();window.addEventListener('resize',height);
})();
