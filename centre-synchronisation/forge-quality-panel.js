(() => {
  'use strict';
  const drawer=document.getElementById('drawer-content');
  if(!drawer)return;
  function insertN1PureBoard(){
    const head=drawer.querySelector('.project-drawer-head');
    if(!head||!/forge/i.test(head.textContent||''))return;
    if(drawer.querySelector('#foh-pure-certification'))return;
    const section=document.createElement('section');
    section.id='foh-pure-certification';
    section.className='project-milestone-box';
    section.style.margin='14px 0';
    section.innerHTML=[
      '<h3>Création de personnages N1 · certification des profils purs</h3>',
      '<p class="minihelp">14 profils × 8 peuples du livre de base. Pour chaque personnage : caractéristiques, voies, pouvoirs, règles validées et éléments restant à contrôler. Suivi automatiquement affiché. Hybrides et sans profil viendront après.</p>',
      '<iframe title="Certification des 112 personnages purs COF2 N1" src="./forge-n1/purs.html" loading="eager" style="display:block;width:100%;height:79vh;min-height:560px;border:1px solid #605344;border-radius:12px;background:#161410" referrerpolicy="no-referrer"></iframe>',
      '<p class="minihelp"><a href="./forge-n1/purs.html" target="_blank" rel="noopener noreferrer">Afficher le suivi des profils purs en plein écran</a></p>'
    ].join('');
    const lead=drawer.querySelector('.project-hero-summary')||head;
    lead.insertAdjacentElement('afterend',section);
  }
  new MutationObserver(insertN1PureBoard).observe(drawer,{childList:true,subtree:false});
  insertN1PureBoard();
})();