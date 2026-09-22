(function () {
  'use strict';
  const API = window.IAT_HANDOUTS;
  const tokenKey = 'iat_mj_handout_token';
  let token = API.captureToken(tokenKey);
  let state = { players: [], handouts: [], assignments: [] };

  const gate = document.getElementById('gate');
  const app = document.getElementById('app');
  const gateForm = document.getElementById('gateForm');
  const gateStatus = document.getElementById('gateStatus');
  const createForm = document.getElementById('createForm');
  const createStatus = document.getElementById('createStatus');
  const createButton = document.getElementById('createButton');
  const inventory = document.getElementById('inventory');
  const playerLinks = document.getElementById('playerLinks');
  const linkResult = document.getElementById('linkResult');
  const linkResultValue = document.getElementById('linkResultValue');
  const preparedTemplates = {
    'runara-map': { kind: 'image', title: 'Carte de l’île confiée par Runara', content: '', fileUrl: '../../../assets/cartes/ile-runara-joueurs.png' },
    compass: { kind: 'object', title: 'Boussole ornée de la Rose des Vents', content: 'Une boussole ouvragée, récupérée dans les quartiers du capitaine. Malgré les années et l’eau salée, son aiguille cherche toujours le nord. Valeur estimée : 25 po.' },
    portrait: { kind: 'text', title: 'Portrait d’Aleitha et Brastos', content: 'CE QUE VOUS VOYEZ\n\nUn portrait délavé par l’humidité représente une jeune femme en uniforme de capitaine auprès d’un homme vêtu comme un marchand. Tous deux se tiennent enlacés et sourient.\n\nINSCRIPTION AU DOS — À LIRE À VOIX HAUTE\n\n« À mon Aleitha,\n\nQue cette image te rappelle que, quelle que soit la mer qui nous sépare, je t’attendrai toujours à la maison.\n\nReviens-moi.\n\nBrastos »' },
    'captain-log': { kind: 'text', title: 'Dernière page du journal du capitaine', content: 'PAGE DU JOURNAL DU CAPITAINE — À LIRE À VOIX HAUTE\n\n« La Rose des Vents s’est éventrée sur les récifs. L’eau gagne la cale et les blessés sont trop nombreux. Aleitha est parmi les plus gravement touchés. Elle serre contre elle le portrait de Brastos et répète qu’elle doit retourner auprès de lui.\n\nCe soir, je l’ai trouvée seule, penchée sur un vieux texte. Elle avait tressé deux mèches de cheveux, l’une blonde et l’autre noire, autour de petits os. Elle m’a affirmé que ces cheveux étaient les leurs. Elle murmurait un nom : Orcus.\n\nJ’ai voulu lui arracher ce talisman, mais elle m’a supplié de la laisser achever le rite. Elle prétend qu’une puissance peut encore la ramener à son époux, quel qu’en soit le prix.\n\nIl y a quelques instants, sa prière s’est interrompue. Aleitha ne respire plus. Pourtant, quelque chose gratte maintenant contre les cloisons de la cale… »\n\nL’écriture devient tremblante sur les dernières lignes. La page s’arrête ici.' },
    talisman: { kind: 'object', title: 'Talisman d’Aleitha', content: 'De longues mèches de cheveux blonds et noirs, tressées et nouées autour de deux os de doigt. Une magie de nécromancie en émane. Ce talisman est le foyer de la malédiction de la Rose des Vents.' }
  };

  function setStatus(node, message, kind) {
    node.textContent = message || '';
    node.className = 'status' + (kind ? ' ' + kind : '');
  }

  function kindLabel(kind) {
    return kind === 'image' ? 'Carte ou image' : kind === 'object' ? 'Objet' : 'Texte ou indice';
  }

  function activeAssignments(handoutId) {
    return new Map(state.assignments.filter(function (row) {
      return row.handout_id === handoutId && !row.revoked_at;
    }).map(function (row) { return [row.player_id, row]; }));
  }

  function statusFor(assignment) {
    if (assignment.viewed_at) return { label: 'Consulté', className: 'viewed', at: assignment.viewed_at };
    if (assignment.delivered_at) return { label: 'Livré', className: 'delivered', at: assignment.delivered_at };
    return { label: 'Attribué', className: 'assigned', at: assignment.assigned_at };
  }

  function formatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  function renderRecipients() {
    const recipients = document.getElementById('recipients');
    recipients.textContent = '';
    const all = document.createElement('label');
    all.className = 'choice allChoice';
    all.innerHTML = '<input type="checkbox" id="allRecipients"><span>Tout le groupe</span>';
    recipients.appendChild(all);
    state.players.forEach(function (player) {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'recipient';
      input.value = player.id;
      const span = document.createElement('span');
      span.textContent = player.display_name;
      label.append(input, span);
      recipients.appendChild(label);
    });
    document.getElementById('allRecipients').onchange = function (event) {
      recipients.querySelectorAll('input[name="recipient"]').forEach(function (input) { input.checked = event.target.checked; });
    };
  }

  function renderPlayerLinks() {
    playerLinks.textContent = '';
    state.players.forEach(function (player) {
      const row = document.createElement('div');
      row.className = 'playerLink';
      const name = document.createElement('b');
      name.textContent = player.display_name;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn';
      button.textContent = 'Créer / remplacer';
      button.onclick = function () { resetPlayerLink(player, button); };
      row.append(name, button);
      playerLinks.appendChild(row);
    });
  }

  function renderInventory() {
    inventory.textContent = '';
    if (!state.handouts.length) {
      inventory.innerHTML = '<div class="empty">Aucun objet créé. Commence avec la carte de Runara ou un premier fragment de la malédiction.</div>';
      return;
    }
    state.handouts.forEach(function (handout) {
      const active = activeAssignments(handout.id);
      const card = document.createElement('article');
      card.className = 'card' + (handout.image_url ? '' : ' noImage');
      if (handout.image_url) {
        const image = document.createElement('img');
        image.src = handout.image_url;
        image.alt = '';
        image.loading = 'lazy';
        card.appendChild(image);
      }
      const body = document.createElement('div');
      body.className = 'cardBody';
      const kind = document.createElement('div');
      kind.className = 'kind';
      kind.textContent = kindLabel(handout.kind);
      const title = document.createElement('h3');
      title.textContent = handout.title;
      body.append(kind, title);
      if (handout.content_text) {
        const excerpt = document.createElement('div');
        excerpt.className = 'excerpt';
        excerpt.textContent = handout.content_text;
        body.appendChild(excerpt);
      }
      const assignments = document.createElement('div');
      assignments.className = 'assignmentRow';
      state.players.forEach(function (player) {
        const button = document.createElement('button');
        button.type = 'button';
        const assignment = active.get(player.id);
        const status = assignment ? statusFor(assignment) : null;
        button.className = 'assignment' + (status ? ' active ' + status.className : '');
        button.textContent = status ? status.label + ' · ' + player.display_name : '+ ' + player.display_name;
        button.title = status
          ? status.label + ' le ' + formatDate(status.at) + ' — cliquer pour retirer à ' + player.display_name
          : 'Attribuer à ' + player.display_name;
        button.onclick = function () { toggleAssignment(handout.id, player.id, active.has(player.id), button); };
        assignments.appendChild(button);
      });
      body.appendChild(assignments);
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn danger';
      deleteButton.style.marginTop = '10px';
      deleteButton.textContent = 'Supprimer définitivement';
      deleteButton.onclick = function () { deleteHandout(handout, deleteButton); };
      body.appendChild(deleteButton);
      card.appendChild(body);
      inventory.appendChild(card);
    });
  }

  async function loadDashboard() {
    const data = await API.request('dashboard', token);
    state = data;
    renderRecipients();
    renderPlayerLinks();
    renderInventory();
  }

  async function unlock(candidate) {
    token = candidate;
    await API.request('verify', token, { method: 'POST', body: {} });
    localStorage.setItem(tokenKey, token);
    gate.classList.add('hidden');
    app.classList.remove('hidden');
    await loadDashboard();
  }

  gateForm.onsubmit = async function (event) {
    event.preventDefault();
    setStatus(gateStatus, 'Vérification…');
    try {
      await unlock(document.getElementById('adminKey').value.trim());
    } catch (error) {
      setStatus(gateStatus, error.message, 'error');
    }
  };

  document.querySelectorAll('input[name="kind"]').forEach(function (input) {
    input.onchange = function () {
      const isImage = document.querySelector('input[name="kind"]:checked').value === 'image';
      document.getElementById('imageField').classList.toggle('hidden', !isImage);
      document.getElementById('textField').classList.toggle('hidden', isImage);
      document.getElementById('imageFile').required = isImage;
      document.getElementById('contentText').required = !isImage;
    };
  });

  document.getElementById('preparedTemplate').onchange = function (event) {
    const template = preparedTemplates[event.target.value];
    const preparedImage = document.getElementById('preparedImage');
    const customImagePicker = document.getElementById('customImagePicker');
    if (!template) {
      preparedImage.classList.add('hidden');
      customImagePicker.classList.remove('hidden');
      return;
    }
    const kindInput = document.querySelector('input[name="kind"][value="' + template.kind + '"]');
    kindInput.checked = true;
    kindInput.dispatchEvent(new Event('change'));
    document.getElementById('title').value = template.title;
    document.getElementById('contentText').value = template.content;
    document.getElementById('imageFile').required = template.kind === 'image' && !template.fileUrl;
    preparedImage.classList.toggle('hidden', !template.fileUrl);
    customImagePicker.classList.toggle('hidden', !!template.fileUrl);
    if (template.fileUrl) document.getElementById('preparedImagePreview').src = template.fileUrl;
    document.getElementById('title').focus();
  };

  createForm.onsubmit = async function (event) {
    event.preventDefault();
    const kind = document.querySelector('input[name="kind"]:checked').value;
    const recipients = Array.from(document.querySelectorAll('input[name="recipient"]:checked')).map(function (input) { return input.value; });
    if (!recipients.length) {
      setStatus(createStatus, 'Choisis au moins un destinataire.', 'error');
      return;
    }
    createButton.disabled = true;
    setStatus(createStatus, 'Envoi en cours…');
    try {
      if (kind === 'image') {
        const form = new FormData();
        form.append('title', document.getElementById('title').value.trim());
        form.append('recipients', JSON.stringify(recipients));
        let imageFile = document.getElementById('imageFile').files[0];
        const selectedTemplate = preparedTemplates[document.getElementById('preparedTemplate').value];
        if (!imageFile && selectedTemplate && selectedTemplate.fileUrl) {
          const response = await fetch(selectedTemplate.fileUrl);
          if (!response.ok) throw new Error('La carte préparée est indisponible.');
          imageFile = new File([await response.blob()], 'carte-ile-runara.png', { type: 'image/png' });
        }
        if (!imageFile) throw new Error('Choisis une image à envoyer.');
        form.append('file', imageFile);
        await API.request('create', token, { method: 'POST', body: form });
      } else {
        await API.request('create', token, { method: 'POST', body: {
          kind: kind,
          title: document.getElementById('title').value.trim(),
          content_text: document.getElementById('contentText').value.trim(),
          recipients: recipients
        }});
      }
      createForm.reset();
      document.querySelector('input[name="kind"][value="image"]').checked = true;
      document.querySelector('input[name="kind"][value="image"]').dispatchEvent(new Event('change'));
      setStatus(createStatus, '✓ Découverte envoyée.', 'ok');
      await loadDashboard();
    } catch (error) {
      setStatus(createStatus, error.message, 'error');
    } finally {
      createButton.disabled = false;
    }
  };

  async function toggleAssignment(handoutId, playerId, isActive, button) {
    button.disabled = true;
    try {
      await API.request(isActive ? 'revoke' : 'assign', token, {
        method: 'POST',
        body: isActive ? { handout_id: handoutId, player_id: playerId } : { handout_id: handoutId, recipients: [playerId] }
      });
      await loadDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  }

  async function deleteHandout(handout, button) {
    if (!confirm('Supprimer définitivement « ' + handout.title + ' » et toutes ses attributions ?')) return;
    button.disabled = true;
    try {
      await API.request('delete', token, { method: 'POST', body: { handout_id: handout.id } });
      await loadDashboard();
    } catch (error) {
      alert(error.message);
      button.disabled = false;
    }
  }

  async function resetPlayerLink(player, button) {
    if (!confirm('Créer un nouveau lien pour ' + player.display_name + ' ? Son ancien lien cessera de fonctionner.')) return;
    button.disabled = true;
    try {
      const data = await API.request('reset-player-link', token, { method: 'POST', body: { player_id: player.id } });
      const url = new URL('../../../joueurs/aventurier.html', location.href);
      url.searchParams.set('pj', player.id);
      url.hash = 'key=' + data.token;
      linkResult.classList.remove('hidden');
      document.getElementById('linkResultTitle').textContent = 'Lien de ' + player.display_name;
      linkResultValue.value = url.toString();
      linkResultValue.select();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  }

  document.getElementById('copyLink').onclick = async function () {
    await navigator.clipboard.writeText(linkResultValue.value);
    this.textContent = '✓ Copié';
    setTimeout(() => { this.textContent = 'Copier le lien'; }, 1200);
  };
  document.getElementById('shareLink').onclick = async function () {
    if (navigator.share) await navigator.share({ title: document.getElementById('linkResultTitle').textContent, url: linkResultValue.value });
    else await navigator.clipboard.writeText(linkResultValue.value);
  };
  document.getElementById('refreshButton').onclick = function () { loadDashboard().catch(function (error) { alert(error.message); }); };

  if (token) unlock(token).catch(function () {
    localStorage.removeItem(tokenKey);
    token = '';
    setStatus(gateStatus, 'Le lien enregistré n’est plus valable. Colle ta nouvelle clé MJ.', 'error');
  });
})();
