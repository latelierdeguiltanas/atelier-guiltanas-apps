(() => {
  'use strict';
  const drawer = document.getElementById('drawer-content');
  if (!drawer) return;
  function addForgeQuality() {
    const header = drawer.querySelector('.project-drawer-head');
    if (!header || !/forge/i.test(header.textContent || '')) return;
    if (drawer.querySelector('#foh-quality-toggle')) return;
    const section = document.createElement('section');
    section.className = 'project-milestone-box';
    section.style.margin = '12px 0';
    section.innerHTML = [
      '<h3>Certification de la création N1</h3>',
      '<p class="minihelp">17 profils et 16 peuples représentés dans les preuves. Les contrôles du socle sont acquis ; les certifications exhaustives restent distinctes.</p>',
      '<button id="foh-quality-toggle" type="button" class="smallbutton primary" aria-expanded="false" aria-controls="foh-quality-frame">☷ Ouvrir le tableau de validation par profil</button>',
      '<div id="foh-quality-frame" hidden style="margin-top:12px">',
      '<p class="minihelp">Suivi intégré au Copilote. La fenêtre ci-dessous est en lecture seule ; elle ne modifie aucun personnage.</p>',
      '<iframe title="Validation Forge N1 — détail par profil" loading="lazy" style="display:block;width:100%;height:77vh;min-height:500px;border:1px solid #605344;border-radius:12px;background:#100f0d"></iframe>',
      '</div>'
    ].join('');
    const lead = drawer.querySelector('.project-hero-summary') || header;
    lead.insertAdjacentElement('afterend', section);
    const button = section.querySelector('#foh-quality-toggle');
    const frame = section.querySelector('#foh-quality-frame');
    button.addEventListener('click', () => {
      const open = frame.hidden;
      frame.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '▴ Masquer le tableau de validation' : '☷ Ouvrir le tableau de validation par profil';
      if (open) {
        const iframe = frame.querySelector('iframe');
        if (!iframe.src) iframe.src = './forge-n1/';
      }
    });
  }
  new MutationObserver(addForgeQuality).observe(drawer, {childList: true, subtree: false});
  addForgeQuality();
})();