(()=>{'use strict';const source=document.currentScript.src,base=new URL('../',source),p=new URLSearchParams(location.search),admin=location.pathname.includes('/mj/')||p.get('mj')==='1';
const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('assets/social.css?v=1',base);if(!document.querySelector('link[href*="social.css"]'))document.head.appendChild(css);
if(!admin||document.querySelector('.ns-nav'))return;const nav=document.createElement('nav');nav.className='ns-nav';nav.setAttribute('aria-label','Rubriques du maître du jeu');
for(const[id,label]of [['accueil','Accueil'],['personnages','Personnages'],['objets','Objets'],['seance','Séance']]){const a=document.createElement('a');a.href=new URL('mj/#'+id,base);a.textContent=label;a.dataset.section=id;nav.appendChild(a);}
const host=document.getElementById('mjcontent')||document.body;host.prepend(nav);
const home=location.pathname===new URL('mj/',base).pathname||location.pathname===new URL('mj/index.html',base).pathname;
if(!home){nav.style.cssText='position:fixed;top:0;left:0;right:0;width:100%;z-index:900';document.body.style.paddingTop='64px';}
function draw(){let id=home?location.hash.slice(1):/economie/.test(location.pathname)?'objets':/messages|backgrounds|informations/.test(location.pathname)?'personnages':'seance';if(!['accueil','personnages','objets','seance'].includes(id))id='accueil';nav.querySelectorAll('a').forEach(a=>{if(a.dataset.section===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(home)document.querySelectorAll('[data-ns-section]').forEach(el=>el.hidden=el.dataset.nsSection!==id);}
window.addEventListener('hashchange',draw);draw();})();
