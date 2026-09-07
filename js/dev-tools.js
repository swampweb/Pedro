(async () => {
  if (window.__pedroStableFloatingDev) return;
  window.__pedroStableFloatingDev = true;
  const Game = window.PedroGameState;
  if (!Game) return;

  try {
    const client = await PedroCore.getClient();
    const { data: session } = await client.auth.getSession();
    if (!session.session) return;
    const { data, error } = await client.schema('pedro').rpc('is_admin');
    if (error || data !== true) return;
  } catch (error) {
    console.error('Developer access check failed:', error);
    return;
  }

  const $ = selector => document.querySelector(selector);
  const currentPlayer = () => $('#user-name')?.textContent.trim() || 'Admin Tester';
  const state = () => Game.snap();
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let panelX = 0;
  let panelY = 0;

  function message(text, error = false) {
    const target = $('#stable-dev-status');
    if (!target) return;
    target.textContent = text;
    target.className = error ? 'error' : 'success';
  }

  function seatVisual(seat, name) {
    const element = document.querySelector(`[data-table-seat="${seat}"]`);
    if (!element) return;
    element.querySelector('.seat-label b').textContent = name;
    element.querySelector('.seat-avatar').textContent = seat[0].toUpperCase();
    element.classList.add('occupied');
  }

  function fillSeats() {
    let current = state();
    if (!current.tableId) Game.reset({ name: $('#game-table-name')?.textContent || 'Admin Test' });
    current = state();
    const ownSeat = Object.keys(current.seats).find(seat => current.seats[seat] === currentPlayer()) || 'south';
    const seats = { ...current.seats, [ownSeat]: currentPlayer() };
    for (const seat of ['south','west','north','east']) if (!seats[seat]) seats[seat] = `Test Bot ${seat[0].toUpperCase()}${seat.slice(1)}`;
    Game.seats(seats);
    Object.entries(seats).forEach(([seat,name]) => seatVisual(seat,name));

    /* Update the original app's local seat model without replacing its buttons. */
    const originalFill = $('#fill-demo-players');
    if (originalFill && !originalFill.disabled) originalFill.click();
    message('Four local test players are seated.');
  }

  function deal() {
    fillSeats();
    Game.deal();
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: state() }));
    message('Cards dealt. Bidding begins left of the dealer.');
  }

  function advance() {
    const current = state();
    if (current.phase !== 'bidding') return message('Bidding is not active.', true);
    const ownSeat = Object.keys(current.seats).find(seat => current.seats[seat] === currentPlayer());
    if (current.currentBidder === ownSeat) return message('The Admin test player is waiting. Use the normal bid controls.', true);
    const result = Game.bid(current.currentBidder, 'pass');
    message(result.ok ? 'Bot passed.' : result.message, !result.ok);
  }

  function passToDealer() {
    let guard = 0;
    while (state().phase === 'bidding' && state().currentBidder !== state().dealer && guard < 4) {
      const result = Game.bid(state().currentBidder, 'pass');
      if (!result.ok) break;
      guard += 1;
    }
    message('Earlier bidders passed. Dealer is forced to bid 6, 14, or 28.');
  }

  function dealerBid(value) {
    const current = state();
    if (current.currentBidder !== current.dealer) return message('Pass bots to the dealer first.', true);
    const result = Game.bid(current.dealer, Number(value));
    message(result.ok ? `Dealer bid ${value}.` : result.message, !result.ok);
  }

  function chooseTrump(suit) {
    if (state().phase !== 'trump') return message('Complete bidding before choosing trump.', true);
    Game.trump(suit);
    message(`${suit} selected. Dealer discard is active.`);
  }

  function stopDragging() {
    dragging = false;
    $('#stable-dev-console')?.classList.remove('dragging');
  }

  function startDragging(event) {
    if (event.target.closest('button')) return;
    const panel = $('#stable-dev-console');
    const rect = panel.getBoundingClientRect();
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    panelX = rect.left;
    panelY = rect.top;
    panel.style.right = 'auto';
    panel.classList.add('dragging');
    event.preventDefault();
  }

  function moveDragging(event) {
    if (!dragging) return;
    const panel = $('#stable-dev-console');
    const maxX = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
    const maxY = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
    panel.style.left = `${Math.max(8, Math.min(maxX, panelX + event.clientX - startX))}px`;
    panel.style.top = `${Math.max(8, Math.min(maxY, panelY + event.clientY - startY))}px`;
  }

  function build() {
    if ($('#stable-dev-launch')) return;
    const launch = document.createElement('button');
    launch.id = 'stable-dev-launch';
    launch.textContent = 'Developer Tools';
    launch.type = 'button';
    $('#leave-table')?.insertAdjacentElement('beforebegin', launch);

    const panel = document.createElement('aside');
    panel.id = 'stable-dev-console';
    panel.innerHTML = `<header id="stable-dev-handle"><div><span>ADMIN ONLY</span><b>Solo Test Console</b></div><div><button id="stable-dev-collapse">Collapse</button><button id="stable-dev-close">Close</button></div></header><main><section><h3>Setup</h3><div class="stable-dev-grid"><button data-sdev="fill">Fill 3 Bot Seats</button><button data-sdev="deal">Deal Test Hand</button></div></section><section><h3>Bidding</h3><div class="stable-dev-grid"><button data-sdev="advance">Advance Bot Bid</button><button data-sdev="pass">Pass Bots to Dealer</button></div><div class="stable-dev-three"><button data-sbid="6">Dealer 6</button><button data-sbid="14">Dealer 14</button><button data-sbid="28">Dealer 28</button></div></section><section><h3>Trump</h3><div class="stable-dev-grid"><button data-strump="♥">♥ Hearts</button><button data-strump="♠">♠ Spades</button><button data-strump="♦">♦ Diamonds</button><button data-strump="♣">♣ Clubs</button></div></section><section><h3>Recovery</h3><div class="stable-dev-grid"><button data-sdev="rejoin">Simulate Rejoin</button><button data-sdev="reset" class="danger">Reset Test Game</button></div></section><p id="stable-dev-status">Game remains visible while testing.</p></main>`;
    document.body.appendChild(panel);

    launch.onclick = () => panel.classList.add('open');
    $('#stable-dev-close').onclick = () => { stopDragging(); panel.classList.remove('open'); };
    $('#stable-dev-collapse').onclick = () => { stopDragging(); panel.classList.toggle('collapsed'); $('#stable-dev-collapse').textContent = panel.classList.contains('collapsed') ? 'Expand' : 'Collapse'; };
    $('#stable-dev-handle').addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', moveDragging);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('mouseleave', stopDragging);
    window.addEventListener('blur', stopDragging);
    window.addEventListener('mouseup', stopDragging);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopDragging(); });
    window.addEventListener('keydown', event => { if (event.key === 'Escape') stopDragging(); });

    panel.querySelector('[data-sdev="fill"]').onclick = fillSeats;
    panel.querySelector('[data-sdev="deal"]').onclick = deal;
    panel.querySelector('[data-sdev="advance"]').onclick = advance;
    panel.querySelector('[data-sdev="pass"]').onclick = passToDealer;
    panel.querySelector('[data-sdev="rejoin"]').onclick = () => { window.dispatchEvent(new CustomEvent('pedro:state',{detail:state()})); message(`Restored ${state().phase}.`); };
    panel.querySelector('[data-sdev="reset"]').onclick = () => { sessionStorage.removeItem('pedro.game.v2'); Game.reset({name:'Admin Test'}); message('Test game reset.'); };
    panel.querySelectorAll('[data-sbid]').forEach(button => button.onclick = () => dealerBid(button.dataset.sbid));
    panel.querySelectorAll('[data-strump]').forEach(button => button.onclick = () => chooseTrump(button.dataset.strump));
  }

  const style = document.createElement('style');
  style.textContent = `
    #admin-dev-modal,#floating-dev-console,#pedro-dev-tools{display:none!important}
    #stable-dev-launch{min-height:38px;padding:0 14px;margin-right:10px;border:1px solid #4d6670;border-radius:7px;background:#15313b;color:#e5f7ff;font-size:11px;font-weight:900;cursor:pointer}
    #stable-dev-console{position:fixed;z-index:700;top:82px;right:18px;width:min(430px,calc(100vw - 28px));display:none;border:1px solid #5c747e;border-radius:12px;background:rgba(7,17,20,.97);box-shadow:0 20px 60px #0009;color:#fff;overflow:hidden}
    #stable-dev-console.open{display:block}#stable-dev-console.dragging{opacity:.95}
    #stable-dev-console header{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border-bottom:1px solid #354a52;background:#102127;cursor:move;user-select:none}
    #stable-dev-console header span,#stable-dev-console header b{display:block}#stable-dev-console header span{color:#f1cc68;font-size:8px;font-weight:900}#stable-dev-console header b{margin-top:3px;font:700 18px Georgia}
    #stable-dev-console header button{min-height:30px;padding:0 9px;margin-left:5px;border:1px solid #4d6670;border-radius:6px;background:#15313b;color:#fff;font-size:9px;font-weight:900;cursor:pointer}
    #stable-dev-console main{max-height:calc(100vh - 160px);padding:11px;overflow:auto}#stable-dev-console.collapsed main{display:none}
    #stable-dev-console section{padding:9px;border:1px solid #344950;border-radius:8px;background:#09161a}#stable-dev-console section+section{margin-top:7px}#stable-dev-console h3{margin:0 0 7px;color:#9fdcf2;font-size:10px}
    .stable-dev-grid,.stable-dev-three{display:grid;gap:6px}.stable-dev-grid{grid-template-columns:1fr 1fr}.stable-dev-three{grid-template-columns:repeat(3,1fr);margin-top:6px}
    #stable-dev-console main button{min-height:36px;padding:6px;border:1px solid #4d6670;border-radius:6px;background:#15313b;color:#fff;font-size:10px;font-weight:900;cursor:pointer}#stable-dev-console main button:hover{background:#1d3b46;border-color:#78bdd8;box-shadow:0 0 0 2px rgba(120,189,216,.16)}#stable-dev-console main button:active{transform:translateY(1px)}#stable-dev-console .danger{border-color:#825651;background:#301f1e}
    #stable-dev-status{margin:9px 1px 0;color:#aebdc1;font-size:10px}#stable-dev-status.success{color:#82dda2}#stable-dev-status.error{color:#ff928b}
  `;
  document.head.appendChild(style);

  const timer = setInterval(() => {
    if (!$('#game-view')?.classList.contains('active')) return;
    build();
    clearInterval(timer);
  }, 200);
  setTimeout(() => clearInterval(timer), 30000);
})();
