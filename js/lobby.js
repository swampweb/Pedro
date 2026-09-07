(() => {
  if (window.__pedroCleanLiveLobbyV51) return;
  window.__pedroCleanLiveLobbyV51 = true;

  const RESUME_ID = 'v5-resume';
  const TABLE_BODY_ID = 'table-rows';
  let liveRows = [];
  let rendering = false;
  let refreshTimer = null;

  const normalize = row => ({
    id: row.id,
    name: row.table_name || 'Pedro Table',
    host: row.host_display_name || row.host_email || 'Player',
    rule: row.play_style === 'cut' ? 'Cut-Throat' : 'Follow Suit',
    score: Number(row.winning_score || 52),
    players: `${Number(row.player_count || 1)} / 4`,
    room: row.room_code || '',
    status: row.status || 'open'
  });

  function clearResumeState() {
    sessionStorage.removeItem('pedro.active.view.v1');
    document.querySelector(`#${RESUME_ID}`)?.remove();
  }

  function currentIdentityName() {
    return window.PedroIdentity?.name?.() || '';
  }

  function validSavedGame() {
    const game = window.PedroGameState?.snap?.();
    const name = currentIdentityName();
    if (!game?.table || !name) return false;
    if (!game.phase || game.phase === 'waiting') return false;
    return Object.values(game.seats || {}).includes(name);
  }

  function openGame(table) {
    PedroGameState.setTable(table);
    sessionStorage.setItem('pedro.active.view.v1', JSON.stringify({
      view: 'game',
      title: table.name,
      room: table.room ? 'Private Room' : 'Public Table'
    }));
    window.pedroGame?.open(table, 'join');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('pedro:state', {
        detail: PedroGameState.snap()
      }));
    }, 100);
  }

  function renderResumeCard() {
    const existing = document.querySelector(`#${RESUME_ID}`);
    if (!validSavedGame()) {
      existing?.remove();
      return;
    }

    const game = PedroGameState.snap();
    let card = existing;
    if (!card) {
      card = document.createElement('section');
      card.id = RESUME_ID;
      card.className = 'pedro-resume-card';
      const lobby = document.querySelector('#screen-lobby .content, #screen-lobby');
      lobby?.prepend(card);
    }

    const dealer = game.dealer ? game.seats?.[game.dealer] : 'Not assigned';
    card.innerHTML = `
      <div>
        <b>GAME IN PROGRESS</b>
        <div>${game.table.name}</div>
        <small>Phase: ${game.phase} · Dealer: ${dealer}</small>
      </div>
      <button id="v5-resume-button" type="button">RESUME GAME</button>`;
    document.querySelector('#v5-resume-button')?.addEventListener('click', () => openGame(game.table));
  }

  function renderEmpty(body) {
    body.innerHTML = `
      <div class="pedro-no-live-tables">
        <b>No public tables are open.</b>
        <span>Create a table or use Refresh to check again.</span>
      </div>`;
  }

  function renderLiveTables() {
    const body = document.querySelector(`#${TABLE_BODY_ID}`);
    if (!body) return;
    rendering = true;

    if (!liveRows.length) {
      renderEmpty(body);
    } else {
      const tables = liveRows.map(normalize);
      body.innerHTML = tables.map((table, index) => {
        const saved = validSavedGame() && PedroGameState.snap().table?.id === table.id;
        const full = table.players === '4 / 4';
        return `
          <div class="table-row" data-live-table-id="${table.id}">
            <div>
              <b>${table.name}</b>
              <small>${saved ? 'Game in progress' : full ? 'Spectators allowed' : 'Seat available'}</small>
            </div>
            <span>${table.host}</span>
            <span><i class="rule-pill">${table.rule}</i></span>
            <span>${table.score}</span>
            <span>${table.players}</span>
            <button class="${full && !saved ? 'secondary' : 'join-button'}" data-live-table-index="${index}">
              ${saved ? 'REJOIN' : full ? 'WATCH' : 'JOIN'}
            </button>
          </div>`;
      }).join('');

      body.querySelectorAll('[data-live-table-index]').forEach(button => {
        button.addEventListener('click', () => {
          const table = tables[Number(button.dataset.liveTableIndex)];
          openGame(table);
        });
      });
    }

    requestAnimationFrame(() => { rendering = false; });
  }

  async function loadLiveTables() {
    const body = document.querySelector(`#${TABLE_BODY_ID}`);
    if (body) body.innerHTML = '<div class="pedro-loading-tables">Loading live public tables...</div>';

    try {
      const client = await PedroCore.getClient();
      const { data: auth } = await client.auth.getSession();

      if (!auth.session) {
        liveRows = [];
        clearResumeState();
        renderLiveTables();
        return;
      }

      const { data, error } = await client
        .schema('pedro')
        .from('public_tables')
        .select('id,table_name,host_email,host_display_name,visibility,room_code,play_style,winning_score,player_count,status,created_at')
        .eq('visibility', 'public')
        .in('status', ['open', 'playing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      liveRows = data || [];
      renderResumeCard();
      renderLiveTables();
    } catch (error) {
      liveRows = [];
      renderLiveTables();
      console.error('Live Lobby load failed:', error);
    }
  }

  function scheduleAuthoritativeRender() {
    if (rendering) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      renderResumeCard();
      renderLiveTables();
    }, 0);
  }

  const style = document.createElement('style');
  style.id = 'pedro-clean-live-lobby-v51';
  style.textContent = `
    .pedro-resume-card{margin:0 0 14px;padding:14px;border:1px solid #7d6634;border-radius:10px;background:#121a18;display:flex;align-items:center;justify-content:space-between;gap:15px}
    .pedro-resume-card b{color:#f3d16f}.pedro-resume-card div div{margin-top:4px;color:#fff}.pedro-resume-card small{color:#aebdc1}
    #v5-resume-button{min-height:40px;padding:0 15px;border:1px solid #4d6670;border-radius:7px;background:#15313b;color:#fff;font-weight:900;cursor:pointer}
    .pedro-no-live-tables,.pedro-loading-tables{padding:28px;text-align:center;color:#aebdc1}
    .pedro-no-live-tables b,.pedro-no-live-tables span{display:block}.pedro-no-live-tables b{color:#f0d38a;font-size:14px}.pedro-no-live-tables span{margin-top:6px;font-size:11px}
  `;
  document.head.appendChild(style);

  const tableObserver = new MutationObserver(scheduleAuthoritativeRender);
  const startObserver = () => {
    const body = document.querySelector(`#${TABLE_BODY_ID}`);
    if (!body) return false;
    tableObserver.observe(body, { childList: true });
    return true;
  };

  if (!startObserver()) {
    const observerTimer = setInterval(() => {
      if (startObserver()) clearInterval(observerTimer);
    }, 200);
    setTimeout(() => clearInterval(observerTimer), 10000);
  }

  document.querySelector('#refresh-tables')?.addEventListener('click', event => {
    event.stopImmediatePropagation();
    loadLiveTables();
  }, true);

  document.addEventListener('click', event => {
    if (event.target.closest('[data-screen="lobby"], #leave-table, #game-home')) {
      setTimeout(loadLiveTables, 80);
    }
  }, true);

  window.addEventListener('pedro:identity', loadLiveTables);
  window.addEventListener('pedro:state', renderResumeCard);

  PedroCore.getClient().then(client => {
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        liveRows = [];
        clearResumeState();
        renderLiveTables();
      } else {
        loadLiveTables();
      }
    });
  });

  const body = document.querySelector(`#${TABLE_BODY_ID}`);
  if (body) body.innerHTML = '';
  loadLiveTables();
})();
