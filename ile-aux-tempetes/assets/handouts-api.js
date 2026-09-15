(function () {
  'use strict';
  const endpoint = 'https://jitatmdbipjkvjstcgdc.supabase.co/functions/v1/campaign-handouts';

  function captureToken(storageKey) {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    const token = (params.get('key') || '').trim();
    if (token) {
      localStorage.setItem(storageKey, token);
      history.replaceState(null, '', location.pathname + location.search);
      return token;
    }
    return localStorage.getItem(storageKey) || '';
  }

  async function request(action, token, options) {
    const config = options || {};
    const query = new URLSearchParams({ action: action });
    if (config.query) Object.keys(config.query).forEach(function (key) {
      query.set(key, config.query[key]);
    });
    const headers = Object.assign({ 'x-campaign-token': token }, config.headers || {});
    let body = config.body;
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const response = await fetch(endpoint + '?' + query.toString(), {
      method: config.method || 'GET',
      headers: headers,
      body: body
    });
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      const error = new Error(payload.error || 'La connexion à la campagne a échoué.');
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  window.IAT_HANDOUTS = {
    endpoint: endpoint,
    captureToken: captureToken,
    request: request
  };
})();
