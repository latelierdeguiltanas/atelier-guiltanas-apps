(function () {
  'use strict';
  const allowed = ['vax', 'hammerz', 'lelio', 'loris'];
  const params = new URLSearchParams(location.search);
  const playerId = (params.get('pj') || localStorage.getItem('iat_last_player') || '').toLowerCase();
  if (!allowed.includes(playerId) || !window.IAT_HANDOUTS) return;

  const style = document.createElement('style');
  style.textContent = '.discoveries{scroll-margin-top:88px}.discoveriesHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.discoveryTools{display:flex;align-items:center;gap:7px}.liveBadge,.alertButton{border:1px solid rgba(215,177,107,.3);border-radius:999px;color:#d7b16b;padding:6px 9px;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.alertButton{background:#102225;cursor:pointer}.alertButton.enabled{border-color:rgba(105,168,126,.55);color:#a9d9b7}.handoutGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:14px}.handoutCard{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#081416;color:inherit;text-align:left;padding:0}.handoutCard.image{cursor:pointer}.newMark{position:absolute;z-index:2;right:9px;top:9px;border-radius:999px;background:#e0ad43;color:#171005;padding:5px 8px;font-size:.64rem;font-weight:950;text-transform:uppercase;letter-spacing:.06em;box-shadow:0 0 18px rgba(255,205,99,.65)}.handoutPreview{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#050b0c}.handoutBody{padding:13px}.handoutType{color:#d7b16b;font-size:.67rem;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.handoutCard h3{font:700 1.05rem Georgia,serif;margin:5px 0}.handoutText{white-space:pre-wrap;color:#c7d1ce;font-size:.87rem;line-height:1.5;margin:8px 0 0}.handoutDate{display:block;color:#748783;font-size:.7rem;margin-top:9px}.readButton{margin-top:10px;border:1px solid rgba(105,168,126,.45);border-radius:10px;background:rgba(105,168,126,.12);color:#bde1c7;padding:8px 10px;font-weight:850;cursor:pointer}.readButton.viewed{cursor:default;opacity:.78}.emptyFinds{border:1px dashed rgba(215,177,107,.25);border-radius:15px;padding:18px;color:#9eadaa;margin-top:13px}.handoutViewer{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#030708;color:#fff}.handoutViewer::backdrop{background:#030708}.viewerBar{height:58px;display:flex;align-items:center;gap:8px;padding:8px 10px;background:#0b1517;border-bottom:1px solid #ffffff18}.viewerTitle{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:850}.viewerBtn{border:1px solid #ffffff20;border-radius:10px;background:#142326;color:#fff;padding:9px 12px;font-weight:850;text-decoration:none}.viewerStage{height:calc(100% - 58px);overflow:auto;display:flex;align-items:flex-start;justify-content:center;overscroll-behavior:contain;touch-action:pan-x pan-y pinch-zoom}.viewerStage img{display:block;width:100%;height:auto;max-width:none;transform-origin:top center}.viewerHelp{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);padding:6px 10px;border-radius:999px;background:#000a;color:#ddd;font-size:.7rem;pointer-events:none}@media(max-width:760px){.handoutGrid{grid-template-columns:1fr 1fr}.discoveriesHead{align-items:flex-start}.discoveryTools{flex-direction:column;align-items:flex-end}}@media(max-width:480px){.handoutGrid{grid-template-columns:1fr}.viewerBtn{padding:9px 10px}.viewerHelp{display:none}}';
  document.head.appendChild(style);

  const grid = document.querySelector('.grid');
  if (!grid) return;
  const panel = document.createElement('section');
  panel.className = 'panel wide discoveries';
  panel.id = 'decouvertes';
  panel.innerHTML = '<div class="discoveriesHead"><div><h2>Mes découvertes</h2><p>Cartes, objets et fragments confiés par le maître du jeu.</p></div><div class="discoveryTools"><span class="liveBadge">En direct</span><button class="alertButton" id="enableHandoutAlerts" type="button">Activer les alertes</button></div></div><div id="handoutList"><div class="emptyFinds">Ouverture de ton paquetage…</div></div>';
  grid.insertBefore(panel, grid.firstChild);

  const quickNav = document.querySelector('.quickNav');
  if (quickNav) {
    const link = document.createElement('a');
    link.href = '#decouvertes';
    link.textContent = 'Mes découvertes';
    quickNav.insertBefore(link, quickNav.children[1] || null);
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'handoutViewer';
  dialog.innerHTML = '<div class="viewerBar"><strong class="viewerTitle">Illustration</strong><button class="viewerBtn" data-zoom="out" aria-label="Réduire">−</button><button class="viewerBtn" data-zoom="fit">Ajuster</button><button class="viewerBtn" data-zoom="in" aria-label="Agrandir">+</button><a class="viewerBtn viewerOriginal" target="_blank" rel="noopener">Original</a><button class="viewerBtn" data-close aria-label="Fermer">✕</button></div><div class="viewerStage"><img alt=""></div><div class="viewerHelp">Fais glisser l’image après avoir zoomé</div>';
  document.body.appendChild(dialog);
  const viewerImage = dialog.querySelector('img');
  const viewerStage = dialog.querySelector('.viewerStage');
  let zoom = 1;
  function applyZoom() {
    viewerImage.style.width = (zoom * 100) + '%';
    viewerStage.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  }
  dialog.querySelector('[data-zoom="in"]').onclick = function () { zoom = Math.min(4, zoom + .5); applyZoom(); };
  dialog.querySelector('[data-zoom="out"]').onclick = function () { zoom = Math.max(.5, zoom - .5); applyZoom(); };
  dialog.querySelector('[data-zoom="fit"]').onclick = function () { zoom = 1; applyZoom(); };
  dialog.querySelector('[data-close]').onclick = function () { dialog.close(); };
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });

  const seenKey = 'iat_seen_handouts_' + playerId;

  function rememberViewed(handout, card) {
    handout._is_new = false;
    handout.viewed_at = handout.viewed_at || new Date().toISOString();
    const marker = card && card.querySelector('.newMark');
    if (marker) marker.remove();
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch (_) { seen = []; }
    const ids = Array.from(new Set(seen.concat(handout.id))).slice(-200);
    localStorage.setItem(seenKey, JSON.stringify(ids));
    if (window.IAT_HANDOUT_ALERTS) window.IAT_HANDOUT_ALERTS.refresh();
  }

  async function markViewed(handout, card) {
    if (handout.viewed_at) {
      rememberViewed(handout, card);
      return;
    }
    try {
      const data = await window.IAT_HANDOUTS.request('view', token, {
        method: 'POST',
        body: { player_id: playerId, handout_id: handout.id }
      });
      handout.viewed_at = data.viewed_at || new Date().toISOString();
      rememberViewed(handout, card);
    } catch (_) {
      // L’objet reste visible même si l’accusé de consultation doit être renvoyé plus tard.
    }
  }

  function openImage(handout, card) {
    markViewed(handout, card);
    zoom = 1;
    dialog.querySelector('.viewerTitle').textContent = handout.title;
    dialog.querySelector('.viewerOriginal').href = handout.image_url;
    viewerImage.src = handout.image_url;
    viewerImage.alt = handout.title;
    applyZoom();
    dialog.showModal();
  }

  function render(handouts) {
    const list = document.getElementById('handoutList');
    list.textContent = '';
    if (!handouts.length) {
      list.innerHTML = '<div class="emptyFinds">Rien dans ton paquetage pour le moment. Les découvertes apparaîtront ici dès que le MJ te les confiera.</div>';
      return;
    }
    const cards = document.createElement('div');
    cards.className = 'handoutGrid';
    handouts.forEach(function (handout) {
      const card = document.createElement(handout.kind === 'image' ? 'button' : 'article');
      card.className = 'handoutCard ' + handout.kind;
      if (handout._is_new) {
        const marker = document.createElement('span');
        marker.className = 'newMark';
        marker.textContent = 'Nouveau';
        card.appendChild(marker);
      }
      if (handout.kind === 'image') {
        const image = document.createElement('img');
        image.className = 'handoutPreview';
        image.src = handout.image_url;
        image.alt = '';
        image.loading = 'lazy';
        card.appendChild(image);
        card.onclick = function () { openImage(handout, card); };
      }
      const body = document.createElement('div');
      body.className = 'handoutBody';
      const type = document.createElement('span');
      type.className = 'handoutType';
      type.textContent = handout.kind === 'image' ? 'Carte ou illustration' : handout.kind === 'object' ? 'Objet' : 'Fragment découvert';
      const title = document.createElement('h3');
      title.textContent = handout.title;
      body.append(type, title);
      if (handout.content_text) {
        const content = document.createElement('p');
        content.className = 'handoutText';
        content.textContent = handout.content_text;
        body.appendChild(content);
      }
      const date = document.createElement('small');
      date.className = 'handoutDate';
      date.textContent = 'Reçu le ' + new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(handout.assigned_at));
      body.appendChild(date);
      if (handout.kind !== 'image') {
        const readButton = document.createElement('button');
        readButton.type = 'button';
        readButton.className = 'readButton' + (handout.viewed_at ? ' viewed' : '');
        readButton.textContent = handout.viewed_at ? '✓ Consulté' : 'Marquer comme consulté';
        readButton.disabled = Boolean(handout.viewed_at);
        readButton.onclick = async function () {
          readButton.disabled = true;
          readButton.textContent = 'Enregistrement…';
          await markViewed(handout, card);
          if (handout.viewed_at) {
            readButton.classList.add('viewed');
            readButton.textContent = '✓ Consulté';
          } else {
            readButton.disabled = false;
            readButton.textContent = 'Réessayer';
          }
        };
        body.appendChild(readButton);
      }
      card.appendChild(body);
      cards.appendChild(card);
    });
    list.appendChild(cards);
  }

  const tokenKey = 'iat_player_handout_token_' + playerId;
  const alertsButton = document.getElementById('enableHandoutAlerts');
  function updateAlertButton() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alertsButton.hidden = true;
      return;
    }
    if (Notification.permission === 'granted') {
      alertsButton.textContent = 'Alertes activées';
      alertsButton.classList.add('enabled');
    } else if (Notification.permission === 'denied') {
      alertsButton.textContent = 'Alertes bloquées';
    }
  }
  alertsButton.onclick = async function () {
    if (!window.IAT_HANDOUT_ALERTS) return;
    const result = await window.IAT_HANDOUT_ALERTS.enable();
    updateAlertButton();
    if (result === 'granted') window.IAT_HANDOUT_ALERTS.refresh();
  };
  updateAlertButton();
  const token = window.IAT_HANDOUTS.captureToken(tokenKey);
  if (!token) {
    document.getElementById('handoutList').innerHTML = '<div class="emptyFinds">Ton espace de découvertes n’est pas encore activé sur cet appareil. Ouvre une première fois le lien personnel envoyé par le MJ.</div>';
    return;
  }
  window.IAT_HANDOUTS.request('list', token, { query: { player: playerId } })
    .then(function (data) {
      let seen = [];
      try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch (_) { seen = []; }
      const seenSet = new Set(seen);
      const handouts = (data.handouts || []).map(function (item) {
        return Object.assign({}, item, { _is_new: !item.viewed_at && !seenSet.has(item.id) });
      });
      render(handouts);
    })
    .catch(function (error) {
      if (error.status === 401) localStorage.removeItem(tokenKey);
      document.getElementById('handoutList').innerHTML = '<div class="emptyFinds">' + (error.status === 401 ? 'Ce lien personnel n’est plus valable. Demande au MJ de t’en envoyer un nouveau.' : 'Impossible de charger les découvertes pour le moment.') + '</div>';
    });
})();
