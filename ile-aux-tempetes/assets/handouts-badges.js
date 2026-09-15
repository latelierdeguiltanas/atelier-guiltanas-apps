(function () {
  'use strict';
  if (!window.IAT_HANDOUTS) return;
  const players = ['vax', 'hammerz', 'lelio', 'loris'];
  const names = { vax: 'Vax’Ildan', hammerz: 'Hammerz', lelio: 'Lelio', loris: 'Loris' };
  const scriptUrl = document.currentScript.src;
  const workerUrl = new URL('../sw.js', scriptUrl).toString();
  const playerUrl = function (id) {
    return new URL('../joueurs/aventurier.html?pj=' + encodeURIComponent(id) + '#decouvertes', scriptUrl).toString();
  };

  const style = document.createElement('style');
  style.textContent = '.iat-new-badge{position:absolute;z-index:8;right:10px;top:10px;min-width:28px;height:28px;padding:0 8px;border:2px solid #fff3c8;border-radius:999px;display:grid;place-items:center;background:#e0ad43;color:#1b1306;font:900 .76rem system-ui;box-shadow:0 0 0 5px rgba(224,173,67,.18),0 0 24px rgba(255,204,100,.92);animation:iatPulse 1.8s ease-in-out infinite}.iat-new-badge:before{content:"";position:absolute;inset:-7px;border:1px solid rgba(255,218,139,.65);border-radius:inherit;animation:iatRing 1.8s ease-out infinite}.iat-has-new{border-color:rgba(255,210,116,.8)!important;box-shadow:0 0 0 2px rgba(224,173,67,.2),0 18px 48px rgba(224,173,67,.23)!important}@keyframes iatPulse{50%{transform:scale(1.08)}}@keyframes iatRing{to{inset:-15px;opacity:0}}@media(prefers-reduced-motion:reduce){.iat-new-badge,.iat-new-badge:before{animation:none}}';
  document.head.appendChild(style);

  function readIds(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  }

  function cardsFor(id) {
    return Array.from(document.querySelectorAll('a[href*="pj=' + id + '"]'));
  }

  function paint(id, count) {
    cardsFor(id).forEach(function (card) {
      card.style.position = 'relative';
      card.classList.toggle('iat-has-new', count > 0);
      let badge = card.querySelector('.iat-new-badge');
      if (!count) {
        if (badge) badge.remove();
        return;
      }
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'iat-new-badge';
        badge.setAttribute('aria-label', count + ' nouvelle découverte');
        card.appendChild(badge);
      }
      badge.textContent = count > 9 ? '9+' : String(count);
    });
  }

  async function notify(id, handouts) {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator)) return;
    const notifiedKey = 'iat_notified_handouts_' + id;
    const notified = new Set(readIds(notifiedKey));
    const fresh = handouts.filter(function (item) { return !notified.has(item.id); });
    if (!fresh.length) return;
    const registration = await navigator.serviceWorker.register(workerUrl, { scope: new URL('../', scriptUrl).pathname });
    for (const item of fresh) {
      await registration.showNotification('Nouvelle découverte pour ' + names[id], {
        body: item.title,
        tag: 'iat-handout-' + item.id,
        icon: new URL('../assets/personnages/portraits/' + id + '.jpg', scriptUrl).toString(),
        badge: new URL('../assets/personnages/portraits/' + id + '.jpg', scriptUrl).toString(),
        data: { url: playerUrl(id) }
      });
      notified.add(item.id);
    }
    localStorage.setItem(notifiedKey, JSON.stringify(Array.from(notified).slice(-100)));
  }

  async function checkPlayer(id) {
    const token = localStorage.getItem('iat_player_handout_token_' + id) || '';
    if (!token) { paint(id, 0); return; }
    try {
      const data = await window.IAT_HANDOUTS.request('list', token, { query: { player: id } });
      const handouts = data.handouts || [];
      const seen = new Set(readIds('iat_seen_handouts_' + id));
      const unread = handouts.filter(function (item) { return !seen.has(item.id); });
      paint(id, unread.length);
      await notify(id, unread);
    } catch (error) {
      if (error.status === 401) localStorage.removeItem('iat_player_handout_token_' + id);
      paint(id, 0);
    }
  }

  async function checkAll() {
    await Promise.all(players.map(checkPlayer));
  }

  checkAll();
  setInterval(checkAll, 45000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkAll(); });
  window.addEventListener('storage', checkAll);
  window.IAT_HANDOUT_ALERTS = {
    refresh: checkAll,
    enable: async function () {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';
      const permission = await Notification.requestPermission();
      if (permission === 'granted') await navigator.serviceWorker.register(workerUrl, { scope: new URL('../', scriptUrl).pathname });
      return permission;
    }
  };
})();
