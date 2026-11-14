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
      '<h3>Certification N1 · profil complet et peuples séparés</h3>',
      '<p class="minihelp">Profil prioritaire : Arquebusier et ses cinq voies, avec une seule progression globale. Les huit peuples disposent chacun d’une progression raciale indépendante. Les autres profils attendent leur tour. Affichage automatique.</p>',
      '<iframe title="Certification par profil entier et peuples séparés COF2 N1" src="./forge-n1/purs.html" loading="eager" style="display:block;width:100%;height:79vh;min-height:560px;border:1px solid #605344;border-radius:12px;background:#161410" referrerpolicy="no-referrer"></iframe>',
      '<p class="minihelp"><a href="./forge-n1/purs.html" target="_blank" rel="noopener noreferrer">Afficher le suivi des profils purs en plein écran</a></p>'
    ].join('');
    const lead=drawer.querySelector('.project-hero-summary')||head;
    lead.insertAdjacentElement('afterend',section);
    const companion=document.createElement('section');
    companion.className='project-milestone-box';
    companion.id='foh-compagnon-v2-certification';
    companion.style.margin='14px 0';
    companion.innerHTML='<h3>Compagnon COF2 V2 · nouveaux peuples</h3><p class="minihelp">Chargement du registre de validation V2…</p>';
    section.insertAdjacentElement('beforebegin',companion);
    fetch('./data/forge-compagnon-v2-progress.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Registre non disponible');return r.json();}).then(data=>{
      if(!companion.isConnected)return;
      companion.replaceChildren();const title=document.createElement('h3');title.textContent='Compagnon COF2 V2 · nouveaux peuples';companion.append(title);
      const score=document.createElement('p');score.textContent=data.percent.toLocaleString('fr-FR')+' % des critères de couverture ; certification ouverte';companion.append(score);
      const bar=document.createElement('progress');bar.max=100;bar.value=data.percent;bar.style.width='100%';companion.append(bar);
      for(const p of data.peoples){const row=document.createElement('p');row.className='minihelp';row.textContent=p.name+' — '+p.passed+'/'+p.total+' critères, '+p.percent.toLocaleString('fr-FR')+' %';companion.append(row);}
      const note=document.createElement('p');note.className='minihelp';note.textContent='10/10 créations et sauvegardes au clic Chromium. Effets exhaustifs, PDF officiel, Android physique, progression et migrations restent ouverts.';companion.append(note);
      const link=document.createElement('a');link.href='https://github.com/latelierdeguiltanas/atelier-guiltanas-apps/actions/runs/43620046027';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Preuve de recette tactile';companion.append(link);
    }).catch(()=>{const p=companion.querySelector('p');if(p)p.textContent='Registre V2 inaccessible.';});
  }
  new MutationObserver(insertN1PureBoard).observe(drawer,{childList:true,subtree:false});
  insertN1PureBoard();
})();