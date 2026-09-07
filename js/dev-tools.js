(async () => {
  if (window.__pedroFloatingDevConsole) return;
  window.__pedroFloatingDevConsole = true;

  const Game = window.PedroGameState;
  if (!Game) return;

  let isAdmin = false;
  try {
    const client = await PedroCore.getClient();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return;
    const { data, error } = await client.schema('pedro').rpc('is_admin');
    if (error) throw error;
    isAdmin = data === true;
  } catch (error) {
    console.error('Developer Tools access check failed:', error);
  }
  if (!isAdmin) return;

  const $ = selector => document.querySelector(selector);
  const playerName = () => $('#user-name')?.textContent.trim() || 'Admin Tester';
  const gameState = () => Game.snap();

  function setMessage(text, error = false) {
    const target = $('#floating-dev-status');
    if (!target) return;
    target.textContent = text;
    target.className = error ? 'error' : 'success';
  }

  function updateSeatVisual(seat, name) {
    const element = document.querySelector(`[data-table-seat="${seat}"]`);
    if (!element) return;
    const label = element.querySelector('.seat-label b');
    const avatar = element.querySelector('.seat-avatar');
    if (label) label.textContent = name;
    if (avatar) avatar.textContent = seat.slice(0, 1).toUpperCase();
    element.classList.add('occupied');
  }

  function fillBotSeats() {
    let state = gameState();
    if (!state.tableId) {
      Game.reset({ name: $('#game-table-name')?.textContent || 'Admin Solo Test' });
      state = gameState();
    }

    const ownSeat = Object.keys(state.seats).find(seat => state.seats[seat] === playerName()) || 'south';
    const seats = { ...state.seats, [ownSeat]: playerName() };
    for (const seat of ['south', 'west', 'north', 'east']) {
      if (!seats[seat]) seats[seat] = `Test Bot ${seat[0].toUpperCase()}${seat.slice(1)}`;
    }

    Game.seats(seats);
    Object.entries(seats).forEach(([seat, name]) => updateSeatVisual(seat, name));
    setMessage('Four local test players are seated.');
  }

  function dealTestHand() {
    fillBotSeats();
    Game.deal();
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: gameState() }));
    setMessage('Cards dealt. The table remains visible while testing.');
  }

  function advanceBotBid() {
    const state = gameState();
    if (state.phase !== 'bidding') return setMessage('Bidding is not active.', true);
    const ownSeat = Object.keys(state.seats).find(seat => state.seats[seat] === playerName());
    if (state.currentBidder === ownSeat) return setMessage('The Admin test player is up. Use the normal table bid controls.', true);
    const result = Game.bid(state.currentBidder, 'pass');
    setMessage(result.ok ? 'Bot passed. Watch the Game Status panel update.' : result.message, !result.ok);
  }

  function passBotsToDealer() {
    let guard = 0;
    while (gameState().phase === 'bidding' && gameState().currentBidder !== gameState().dealer && guard < 4) {
      const state = gameState();
      const result = Game.bid(state.currentBidder, 'pass');
      if (!result.ok) break;
      guard += 1;
    }
    setMessage('Earlier bidders passed. The dealer is now forced to bid 6, 14, or 28.');
  }

  function dealerBid(value) {
    const state = gameState();
    if (state.currentBidder !== state.dealer) return setMessage('Pass bots to the dealer first.', true);
    const result = Game.bid(state.dealer, Number(value));
    setMessage(result.ok ? `Dealer bid ${value}.` : result.message, !result.ok);
  }

  function chooseTrump(suit) {
    if (gameState().phase !== 'trump') return setMessage('Complete bidding before choosing trump.', true);
    Game.trump(suit);
    setMessage(`${suit} selected. Dealer discard is active.`);
  }

  function simulateRejoin() {
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: gameState() }));
    setMessage(`Restored ${gameState().phase} from this browser session.`);
  }

  function resetTest() {
    sessionStorage.removeItem('pedro.game.v2');
    Game.reset({ name: 'Admin Solo Test' });
    setMessage('Solo test game reset.');
  }

  function openConsole() {
    $('#floating-dev-console')?.classList.add('open');
  }

  function closeConsole() {
    $('#floating-dev-console')?.classList.remove('open');
  }

  function toggleCollapse() {
    const consoleElement = $('#floating-dev-console');
    consoleElement?.classList.toggle('collapsed');
    const collapsed = consoleElement?.classList.contains('collapsed');
    $('#floating-dev-collapse').textContent = collapsed ? 'Expand' : 'Collapse';
  }

  function enableDragging(panel, handle) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      panel.setPointerCapture(event.pointerId);
      panel.classList.add('dragging');
    });

    handle.addEventListener('pointermove', event => {
      if (!dragging) return;
      const maxLeft = window.innerWidth - panel.offsetWidth - 8;
      const maxTop = window.innerHeight - panel.offsetHeight - 8;
      panel.style.left = `${Math.max(8, Math.min(maxLeft, event.clientX - offsetX))}px`;
      panel.style.top = `${Math.max(8, Math.min(maxTop, event.clientY - offsetY))}px`;
      panel.style.right = 'auto';
    });

    const stop = event => {
      if (!dragging) return;
      dragging = false;
      panel.releasePointerCapture?.(event.pointerId);
      panel.classList.remove('dragging');
    };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  function buildConsole() {
    if ($('#floating-dev-launch')) return;

    const launch = document.createElement('button');
    launch.id = 'floating-dev-launch';
    launch.type = 'button';
    launch.textContent = 'Developer Tools';
    const leave = $('#leave-table');
    leave?.insertAdjacentElement('beforebegin', launch);

    const panel = document.createElement('aside');
    panel.id = 'floating-dev-console';
    panel.innerHTML = `
      <header id="floating-dev-handle">
        <div><span>ADMIN ONLY</span><b>Solo Test Console</b></div>
        <div class="floating-dev-header-actions">
          <button id="floating-dev-collapse" type="button">Collapse</button>
          <button id="floating-dev-close" type="button">Close</button>
        </div>
      </header>
      <div class="floating-dev-body">
        <section><h3>Setup</h3><div class="floating-dev-grid"><button data-fdev="fill">Fill 3 Bot Seats</button><button data-fdev="deal">Deal Test Hand</button></div></section>
        <section><h3>Bidding</h3><div class="floating-dev-grid"><button data-fdev="advance">Advance Bot Bid</button><button data-fdev="pass">Pass Bots to Dealer</button></div><div class="floating-dev-three"><button data-fbid="6">Dealer 6</button><button data-fbid="14">Dealer 14</button><button data-fbid="28">Dealer 28</button></div></section>
        <section><h3>Trump</h3><div class="floating-dev-four"><button data-ftrump="♥">♥ Hearts</button><button data-ftrump="♠">♠ Spades</button><button data-ftrump="♦">♦ Diamonds</button><button data-ftrump="♣">♣ Clubs</button></div></section>
        <section><h3>Recovery</h3><div class="floating-dev-grid"><button data-fdev="rejoin">Simulate Rejoin</button><button data-fdev="reset" class="danger">Reset Test Game</button></div></section>
        <p id="floating-dev-status">The game remains visible behind this floating console.</p>
      </div>`;
    document.body.appendChild(panel);

    launch.addEventListener('click', openConsole);
    $('#floating-dev-close').addEventListener('click', closeConsole);
    $('#floating-dev-collapse').addEventListener('click', toggleCollapse);
    panel.querySelector('[data-fdev="fill"]').addEventListener('click', fillBotSeats);
    panel.querySelector('[data-fdev="deal"]').addEventListener('click', dealTestHand);
    panel.querySelector('[data-fdev="advance"]').addEventListener('click', advanceBotBid);
    panel.querySelector('[data-fdev="pass"]').addEventListener('click', passBotsToDealer);
    panel.querySelector('[data-fdev="rejoin"]').addEventListener('click', simulateRejoin);
    panel.querySelector('[data-fdev="reset"]').addEventListener('click', resetTest);
    panel.querySelectorAll('[data-fbid]').forEach(button => button.addEventListener('click', () => dealerBid(button.dataset.fbid)));
    panel.querySelectorAll('[data-ftrump]').forEach(button => button.addEventListener('click', () => chooseTrump(button.dataset.ftrump)));
    enableDragging(panel, $('#floating-dev-handle'));
  }

  const style = document.createElement('style');
  style.textContent = `
    #admin-dev-modal,#pedro-dev-tools{display:none!important}
    #floating-dev-launch{min-height:38px;padding:0 14px;margin-right:10px;border:1px solid #4f6872;border-radius:7px;background:#15313b;color:#e4f7ff;font-size:11px;font-weight:900}
    #floating-dev-console{position:fixed;z-index:650;top:88px;right:22px;width:min(430px,calc(100vw - 30px));max-height:calc(100vh - 110px);display:none;border:1px solid #5c747e;border-radius:12px;background:rgba(7,17,20,.96);box-shadow:0 20px 60px rgba(0,0,0,.55);color:#fff;overflow:hidden;resize:both}
    #floating-dev-console.open{display:block}
    #floating-dev-console.dragging{opacity:.94}
    #floating-dev-console header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 13px;border-bottom:1px solid #354a52;background:#102127;cursor:move;user-select:none;touch-action:none}
    #floating-dev-console header span,#floating-dev-console header b{display:block}
    #floating-dev-console header span{color:#f2cd68;font-size:8px;font-weight:900;letter-spacing:.13em}
    #floating-dev-console header b{margin-top:3px;font:700 19px Georgia}
    .floating-dev-header-actions{display:flex;gap:6px}.floating-dev-header-actions button{min-height:31px;padding:0 9px;border:1px solid #4d6570;border-radius:6px;background:#152c35;color:#fff;font-size:9px;font-weight:900;cursor:pointer}
    .floating-dev-body{max-height:calc(100vh - 175px);padding:12px;overflow:auto}.collapsed .floating-dev-body{display:none}.collapsed{height:auto!important;resize:none!important}
    .floating-dev-body section{padding:10px;border:1px solid #334850;border-radius:8px;background:#09161a}.floating-dev-body section+section{margin-top:8px}.floating-dev-body h3{margin:0 0 7px;color:#9fddf3;font-size:10px;letter-spacing:.09em}
    .floating-dev-grid,.floating-dev-three,.floating-dev-four{display:grid;gap:6px}.floating-dev-grid{grid-template-columns:1fr 1fr}.floating-dev-three{grid-template-columns:repeat(3,1fr);margin-top:6px}.floating-dev-four{grid-template-columns:1fr 1fr}
    .floating-dev-body button{min-height:36px;padding:6px 8px;border:1px solid #4d6570;border-radius:6px;background:#152c35;color:#fff;font-size:10px;font-weight:900;line-height:1.2;cursor:pointer}.floating-dev-body button:hover{background:#1b3945}.floating-dev-body .danger{border-color:#825651;background:#301f1e}
    #floating-dev-status{margin:10px 2px 0;color:#aebdc1;font-size:10px;line-height:1.4}#floating-dev-status.success{color:#82dda2}#floating-dev-status.error{color:#ff928b}
    @media(max-width:700px){#floating-dev-console{top:74px;right:8px;width:calc(100vw - 16px);resize:none}.floating-dev-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const timer = setInterval(() => {
    if (!$('#game-view')?.classList.contains('active')) return;
    buildConsole();
    clearInterval(timer);
  }, 200);
  setTimeout(() => clearInterval(timer), 30000);
})();
