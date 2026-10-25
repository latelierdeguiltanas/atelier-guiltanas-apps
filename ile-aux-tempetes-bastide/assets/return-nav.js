/* Explicit, stable destinations also work from an installed app or a direct link. */
(()=>{
const base=new URL('../',document.currentScript.src),path=location.pathname.slice(base.pathname.length).replace(/index\.html$/,'');
if(!path||document.getElementById('bastide-return'))return;
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
document.body.prepend(nav);
const css=document.createElement('style');css.textContent='#bastide-return{position:sticky;top:0;z-index:80;display:flex;align-items:center;min-height:44px;padding:4px 12px;box-sizing:border-box;background:#102b20f7;border-bottom:1px solid #706343;backdrop-filter:blur(8px)}#bastide-return a{display:inline-flex;align-items:center;min-height:36px;padding:4px 12px;box-sizing:border-box;border:1px solid #a58d56;border-radius:8px;color:#f4e8c5;text-decoration:none;font:700 14px/1.3 system-ui}#bastide-return a:focus-visible{outline:3px solid #fff0b5;outline-offset:2px}.mj-navigation,.topnav{top:var(--bastide-return-height,0px)}';document.head.append(css);
function height(){document.documentElement.style.setProperty('--bastide-return-height',nav.offsetHeight+'px');}height();window.addEventListener('resize',height);
})();
