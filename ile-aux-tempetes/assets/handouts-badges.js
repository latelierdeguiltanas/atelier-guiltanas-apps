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
  style.textContent = '.iat-new-badge{position:absolute;z-index:8;right:10px;top:10px;min-width:28px;height:28px;padding:0 8px;border:2px solid #fff3c8;border-radius:999px;display:grid;place-items:center;background:#e0ad43;color:#1b1306;font:900 .76rem system-ui;box-shadow:0 0 0 5px rgba(224,173,67,.18),0 0 24px rgba(255,204,100,.92);animation:iatPulse 1.8s ease-in-out infinite}.iat-new-badge:before{content:"";position:absolute;inset:-7px;border:1px solid rgba(255,218,139,.65);border-radius:inherit;animation:iatRing 1.8s ease-out infinite}.iat-has-new{border-color:rgba(255,210,116,.8)!important;box-shadow:0 0 0 2px rgba(224,173,67,.2),0 18px 48px rgba(224,173,67,.23)!important}.iat-toast-stack{position:fixed;z-index:2147483000;right:14px;bottom:14px;display:grid;gap:9px;width:min(380px,calc(100vw - 28px));pointer-events:none}.iat-toast{pointer-events:auto;display:grid;grid-template-columns:44px 1fr auto;gap:11px;align-items:center;border:1px solid rgba(240,194,103,.55);border-radius:17px;background:linear-gradient(135deg,rgba(31,28,23,.98),rgba(9,19,21,.98));color:#f6ead5;padding:12px;box-shadow:0 20px 60px #000b,0 0 28px rgba(224,173,67,.18);transform:translateY(18px);opacity:0;animation:iatToastIn .28s ease forwards}.iat-toast-icon{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:rgba(224,173,67,.16);color:#f0c56f;font-size:1.3rem}.iat-toast-copy{min-width:0}.iat-toast-copy b{display:block;font:700 1rem Georgia,serif}.iat-toast-copy span{display:block;margin-top:3px;color:#beb7aa;font:400 .78rem/1.35 system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.iat-toast-open,.iat-toast-close{border:0;color:#1b1306;background:#dfad4a;border-radius:10px;padding:9px 10px;font:900 .72rem system-ui;cursor:pointer}.iat-toast-close{position:absolute;right:5px;top:3px;background:transparent;color:#aaa;padding:5px}.iat-toast.leaving{animation:iatToastOut .22s ease forwards}@keyframes iatPulse{50%{transform:scale(1.08)}}@keyframes iatRing{to{inset:-15px;opacity:0}}@keyframes iatToastIn{to{transform:none;opacity:1}}@keyframes iatToastOut{to{transform:translateY(12px);opacity:0}}@media(max-width:520px){.iat-toast-stack{right:9px;bottom:9px;width:calc(100vw - 18px)}.iat-toast{grid-template-columns:40px 1fr auto}.iat-toast-icon{width:40px;height:40px}}@media(prefers-reduced-motion:reduce){.iat-new-badge,.iat-new-badge:before,.iat-toast{animation:none;transform:none;opacity:1}}';
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

  function showToast(id, handouts) {
    if (!handouts.length || document.querySelector('[data-iat-toast-player="' + id + '"]')) return;
    let stack = document.querySelector('.iat-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'iat-toast-stack';
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const toast = document.createElement('section');
    toast.className = 'iat-toast';
    toast.dataset.iatToastPlayer = id;
    const count = handouts.length;
    const title = count === 1 ? 'Nouvel objet pour ' + names[id] : count + ' nouveautés pour ' + names[id];
    const detail = count === 1 ? handouts[0].title : handouts.slice(0, 2).map(function (item) { return item.title; }).join(' • ');
    toast.innerHTML = '<div class="iat-toast-icon">✦</div><div class="iat-toast-copy"><b></b><span></span></div><button class="iat-toast-open" type="button">Voir</button><button class="iat-toast-close" type="button" aria-label="Fermer">×</button>';
    toast.querySelector('b').textContent = title;
    toast.querySelector('span').textContent = detail;
    const close = function () {
      if (!toast.isConnected) return;
      toast.classList.add('leaving');
      setTimeout(function () { toast.remove(); }, 240);
    };
    toast.querySelector('.iat-toast-open').onclick = function () { location.href = playerUrl(id); };
    toast.querySelector('.iat-toast-close').onclick = close;
    stack.appendChild(toast);
    setTimeout(close, 10000);
  }

  async function notify(id, handouts) {
    if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator)) return;
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
      const toastedKey = 'iat_toasted_handouts_' + id;
      const toasted = new Set(readIds(toastedKey));
      const freshForToast = unread.filter(function (item) { return !toasted.has(item.id); });
      showToast(id, freshForToast);
      freshForToast.forEach(function (item) { toasted.add(item.id); });
      if (freshForToast.length) localStorage.setItem(toastedKey, JSON.stringify(Array.from(toasted).slice(-100)));
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
