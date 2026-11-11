(()=>{'use strict';
const params=new URLSearchParams(location.search);
if(params.get('atelier')==='1')document.body.classList.add('mj-embedded');
const views=[...document.querySelectorAll('[data-mj-view]')];
if(views.length){
 const select=()=>{const requested=location.hash.slice(1),view=views.some(p=>p.dataset.mjView===requested)?requested:'envoyer';views.forEach(p=>p.hidden=p.dataset.mjView!==view);document.querySelectorAll('.mj-views a').forEach(a=>{if(a.hash==='#'+view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});};
 addEventListener('hashchange',select);select();
}
const combat=document.getElementById('combat');
if(!combat||typeof showPage!=='function')return;
const host=document.querySelector('header');
if(!host)return;
const dialog=document.createElement('dialog');
dialog.className='mj-combat-drawer';
dialog.setAttribute('aria-labelledby','mj-drawer-title');
dialog.innerHTML='<div class="mj-drawer-bar"><strong id="mj-drawer-title">Objets et inventaires</strong><button type="button">← Revenir au combat</button></div><iframe title="Objets et inventaires du MJ"></iframe>';
document.body.append(dialog);
const frame=dialog.querySelector('iframe');
let opener=null;
dialog.querySelector('button').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>opener?.focus());
const tools=document.createElement('div');tools.className='mj-combat-tools';
const open=(label,view)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{opener=button;const url=new URL('../economie/?atelier=1#'+view,location.href);if(!frame.hasAttribute('src'))frame.src=url.href;else frame.contentWindow.location.hash=view;dialog.showModal();};return button;};
tools.append(open('Envoyer une récompense','envoyer'),open('Voir les sacs des PJ','sacs'));
document.body.classList.add('mj-single-screen');
const nav=document.querySelector('.ns-nav');
const quick=document.createElement('div');quick.className='mj-session-bar';
const home=document.createElement('a');home.href='../../';home.textContent='← Table MJ';quick.append(home,tools);
if(nav)nav.remove();host.prepend(quick);
const title=host.querySelector('.title');if(title)title.textContent='Combat D&D · Nespresso';
const measure=()=>{const h=host.getBoundingClientRect().height,t=combat.querySelector('.toolbar')?.getBoundingClientRect().height||0;document.body.style.setProperty('--mj-header',h+'px');document.body.style.setProperty('--mj-controls',t+'px');};
if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(measure);observer.observe(host);const toolbar=combat.querySelector('.toolbar');if(toolbar)observer.observe(toolbar);}
measure();
showPage('combat',document.querySelector('#tabs button[onclick*="combat"]'));
})();
