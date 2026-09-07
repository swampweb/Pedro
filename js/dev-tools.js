(() => {
  if (window.__pedroDevToolsLoaded) return;
  window.__pedroDevToolsLoaded = true;

  const Game = window.PedroGameState;
  const botNames = { west: 'Test Bot West', north: 'Test Bot North', east: 'Test Bot East' };
  let enabled = sessionStorage.getItem('pedro.solo.test') === 'true';

  function currentPlayer() {
    return document.querySelector('#user-name')?.textContent.trim() || 'Solo Tester';
  }

  function gameVisible() {
    return document.querySelector('#game-view')?.classList.contains('active');
  }

  function findSeat(seat) {
    return document.querySelector(`[data-table-seat="${seat}"]`);
  }

  function setSeatVisual(seat, name) {
    const element = findSeat(seat);
    if (!element) return;
    const label = element.querySelector('.seat-label b');
    const avatar = element.querySelector('.seat-avatar');
    if (label) label.textContent = name;
    if (avatar) avatar.textContent = name.split(/\s+/).map(part => part[0]).slice(-1).join('').toUpperCase();
    element.classList.add('occupied');
  }

  function syncSeats() {
    const state = Game.snap();
    Object.entries(state.seats).forEach(([seat, name]) => {
      if (name) setSeatVisual(seat, name);
    });
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: state }));
  }

  function fillBots() {
    const state = Game.snap();
    const player = currentPlayer();
    const playerSeat = Object.keys(state.seats).find(seat => state.seats[seat] === player) || 'south';
    const seats = { ...state.seats, [playerSeat]: player };
    for (const seat of ['south', 'west', 'north', 'east']) {
      if (!seats[seat]) seats[seat] = botNames[seat] || 'Test Bot South';
    }
    Game.seats(seats);
    syncSeats();
    status('Four test players are seated.');
  }

  function ensureGame() {
    let state = Game.snap();
    if (!state.tableId) {
      Game.reset({ name: document.querySelector('#game-table-name')?.textContent || 'Solo Test Table' });
      state = Game.snap();
    }
    fillBots();
    return Game.snap();
  }

  function dealTestHand() {
    ensureGame();
    Game.deal();
    status('Cards dealt. Bidding begins with the player left of the dealer.');
  }

  function botBid(value) {
    const state = Game.snap();
    if (state.phase !== 'bidding') return status('Deal cards before testing bids.', true);
    const result = Game.bid(state.currentBidder, value);
    status(result.ok ? `${state.seats[state.currentBidder]} selected ${value === 'pass' ? 'PASS' : value}.` : result.message, !result.ok);
  }

  function advanceBotBid() {
    const state = Game.snap();
    if (state.phase !== 'bidding') return status('Bidding is not active.', true);
    const playerSeat = Object.keys(state.seats).find(seat => state.seats[seat] === currentPlayer());
    if (state.currentBidder === playerSeat) return status('The current bidder is the solo player. Use the normal bid controls.', true);
    const allowed = Game.allowed(state.currentBidder);
    const value = allowed.length ? allowed[0] : 'pass';
    botBid(value);
  }

  function passBotsToDealer() {
    let guard = 0;
    while (Game.snap().phase === 'bidding' && guard < 4) {
      const state = Game.snap();
      if (state.currentBidder === state.dealer) break;
      const result = Game.bid(state.currentBidder, 'pass');
      if (!result.ok) break;
      guard += 1;
    }
    status('Earlier bidders passed. Dealer should now see forced 6, 14, or 28.');
  }

  function forceDealerBid(value) {
    const state = Game.snap();
    if (state.phase !== 'bidding') return status('Bidding is not active.', true);
    if (state.currentBidder !== state.dealer) return status('Use Pass Bots to Dealer first.', true);
    const result = Game.bid(state.dealer, Number(value));
    status(result.ok ? `Dealer bid ${value}.` : result.message, !result.ok);
  }

  function chooseTestTrump(suit) {
    const state = Game.snap();
    if (state.phase !== 'trump') return status('Complete bidding before choosing trump.', true);
    Game.trump(suit);
    status(`${suit} selected. Dealer pickup and discard phase is active.`);
  }

  function simulateRejoin() {
    const before = Game.snap();
    if (!before.tableId) return status('No active test game to restore.', true);
    const restored = Game.snap();
    syncSeats();
    status(`Restored ${restored.phase} phase, dealer ${restored.dealer}, and ${restored.bids.length} bids from session storage.`);
  }

  function resetTest() {
    sessionStorage.removeItem('pedro.game.v2');
    Game.reset({ name: 'Solo Test Table' });
    status('Solo test game reset.');
  }

  function status(message, error = false) {
    const target = document.querySelector('#dev-test-status');
    if (!target) return;
    target.textContent = message;
    target.style.color = error ? '#ff8c84' : '#83dda3';
  }

  function toggle(enabledNow) {
    enabled = enabledNow;
    sessionStorage.setItem('pedro.solo.test', String(enabled));
    document.querySelector('#dev-tools-body')?.classList.toggle('hidden', !enabled);
    document.querySelector('#dev-mode-toggle').textContent = enabled ? 'Disable Solo Test Mode' : 'Enable Solo Test Mode';
    status(enabled ? 'Solo Test Mode enabled. No additional accounts are required.' : 'Solo Test Mode disabled.');
  }

  function buildPanel() {
    if (document.querySelector('#pedro-dev-tools')) return;
    const panel = document.createElement('section');
    panel.id = 'pedro-dev-tools';
    panel.className = 'dev-tools-panel';
    panel.innerHTML = `
      <div class="dev-tools-heading"><span>SOLO TEST MODE</span><b>LOCAL ONLY</b></div>
      <button id="dev-mode-toggle" class="dev-main-button" type="button">${enabled ? 'Disable' : 'Enable'} Solo Test Mode</button>
      <div id="dev-tools-body" class="${enabled ? '' : 'hidden'}">
        <div class="dev-group"><span>Setup</span><button data-dev="fill">Fill 3 Bot Seats</button><button data-dev="deal">Deal Test Hand</button></div>
        <div class="dev-group"><span>Bidding</span><button data-dev="advance">Advance Bot Bid</button><button data-dev="pass-dealer">Pass Bots to Dealer</button></div>
        <div class="dev-three"><button data-dev-bid="6">Dealer 6</button><button data-dev-bid="14">Dealer 14</button><button data-dev-bid="28">Dealer 28</button></div>
        <div class="dev-group"><span>Trump</span><div class="dev-four"><button data-dev-trump="♥">♥</button><button data-dev-trump="♠">♠</button><button data-dev-trump="♦">♦</button><button data-dev-trump="♣">♣</button></div></div>
        <div class="dev-group"><span>Recovery</span><button data-dev="rejoin">Simulate Rejoin</button><button data-dev="reset" class="dev-danger">Reset Test Game</button></div>
      </div>
      <p id="dev-test-status">Solo Test Mode is local to this browser session.</p>`;
    const controls = document.querySelector('#table-control-frame') || document.querySelector('.table-info-panel');
    controls?.appendChild(panel);

    document.querySelector('#dev-mode-toggle').addEventListener('click', () => toggle(!enabled));
    document.querySelector('[data-dev="fill"]').addEventListener('click', fillBots);
    document.querySelector('[data-dev="deal"]').addEventListener('click', dealTestHand);
    document.querySelector('[data-dev="advance"]').addEventListener('click', advanceBotBid);
    document.querySelector('[data-dev="pass-dealer"]').addEventListener('click', passBotsToDealer);
    document.querySelector('[data-dev="rejoin"]').addEventListener('click', simulateRejoin);
    document.querySelector('[data-dev="reset"]').addEventListener('click', resetTest);
    document.querySelectorAll('[data-dev-bid]').forEach(button => button.addEventListener('click', () => forceDealerBid(button.dataset.devBid)));
    document.querySelectorAll('[data-dev-trump]').forEach(button => button.addEventListener('click', () => chooseTestTrump(button.dataset.devTrump)));
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .dev-tools-panel{margin-top:10px;padding:10px;border:1px solid #49606a;border-radius:9px;background:linear-gradient(145deg,#122027,#081014)}
      .dev-tools-heading{display:flex;justify-content:space-between;color:#8cd5f0;font-size:9px;font-weight:900;letter-spacing:.12em}
      .dev-tools-heading b{color:#f0c65e}.dev-main-button,.dev-tools-panel button{width:100%;min-height:34px;margin-top:7px;border:1px solid #3b525b;border-radius:6px;background:#12242b;color:white;font-size:9px;font-weight:900;letter-spacing:.04em}
      .dev-main-button{background:#174e68!important}.dev-group{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #293b42}.dev-group>span{grid-column:1/-1;color:#93a7ad;font-size:8px;font-weight:900;letter-spacing:.11em}.dev-three,.dev-four{display:grid;gap:5px;margin-top:7px}.dev-three{grid-template-columns:repeat(3,1fr)}.dev-four{grid-template-columns:repeat(4,1fr);grid-column:1/-1}.dev-danger{border-color:#9e3832!important;background:#54201d!important}.dev-tools-panel .hidden{display:none!important}#dev-test-status{margin:8px 0 0;color:#9dabad;font-size:9px;line-height:1.4}`;
    document.head.appendChild(style);
  }

  installStyles();
  const waitForGame = setInterval(() => {
    if (!gameVisible()) return;
    buildPanel();
    clearInterval(waitForGame);
  }, 250);
  setTimeout(() => clearInterval(waitForGame), 30000);

  document.addEventListener('click', event => {
    if (event.target.closest('[data-mod-live-table],#start-game')) setTimeout(buildPanel, 150);
  }, true);
})();
