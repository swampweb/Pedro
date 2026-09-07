(() => {
  if (window.__pedroStableControlsV5) return;
  window.__pedroStableControlsV5 = true;
  const Game = window.PedroGameState;
  if (!Game) return;

  const seatNames = { south: 'South', west: 'West', north: 'North', east: 'East' };
  const suitNames = { '♥': 'Hearts', '♦': 'Diamonds', '♣': 'Clubs', '♠': 'Spades' };
  const isRed = suit => suit === '♥' || suit === '♦';
  const currentPlayer = () => document.querySelector('#user-name')?.textContent.trim() || 'Pedro Player';
  const currentSeat = state => Object.keys(state.seats || {}).find(seat => state.seats[seat] === currentPlayer()) || null;
  const gameVisible = () => document.querySelector('#game-view')?.classList.contains('active');

  function injectStyles() {
    if (document.querySelector('#pedro-stable-controls-v5')) return;
    const style = document.createElement('style');
    style.id = 'pedro-stable-controls-v5';
    style.textContent = `
      button:not(:disabled), .nav-button, [role="button"] { cursor:pointer!important; transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,transform .08s ease,filter .16s ease!important; }
      button:not(:disabled):hover, .nav-button:hover { background-color:#1d3b46!important; border-color:#78bdd8!important; filter:brightness(1.10)!important; box-shadow:0 0 0 2px rgba(120,189,216,.16),0 5px 14px rgba(0,0,0,.28)!important; }
      button:not(:disabled):active, .nav-button:active { transform:translateY(1px)!important; filter:brightness(.96)!important; }
      button:focus-visible, .nav-button:focus-visible { outline:2px solid #f0c457!important; outline-offset:2px!important; }
      button:disabled { cursor:not-allowed!important; opacity:.42!important; }
      #ready-button,#start-game,#deal-cards,#random-seat,#watch-table,#fill-demo-players { pointer-events:auto!important; position:relative!important; z-index:2!important; min-height:39px!important; padding:8px 12px!important; border:1px solid #4d6670!important; border-radius:7px!important; background:#142a32!important; color:#fff!important; font-size:11px!important; font-weight:900!important; line-height:1.2!important; box-shadow:none!important; }
      .center-status { min-width:255px!important; padding:8px 13px!important; }
      .center-status>span { font-size:10px!important; color:#f1cf70!important; }
      .center-status small { display:grid!important; grid-template-columns:1fr 1fr!important; gap:3px 10px!important; margin-top:5px!important; color:#d9e2e2!important; font-size:9px!important; line-height:1.35!important; white-space:normal!important; }
      .center-status small b { color:#fff7df!important; overflow-wrap:anywhere!important; }
      .stable-hand { position:absolute;z-index:28;left:50%;bottom:4px;transform:translateX(-50%);display:flex;justify-content:center;align-items:flex-end;max-width:82%; }
      .stable-card { position:relative;width:72px;height:104px;margin-left:-17px;border:1px solid #d0d0d0;border-radius:8px;background:linear-gradient(#fff,#eee9df);color:#111;box-shadow:0 8px 18px #0008;transform:rotate(var(--rot));transform-origin:bottom center; }
      .stable-card:first-child{margin-left:0}.stable-card.red{color:#c62c34}.stable-card b{position:absolute;left:7px;top:5px;font-size:17px}.stable-card i{position:absolute;inset:0;display:grid;place-items:center;font-size:33px;font-style:normal}
      .stable-bidding { margin:0 0 10px;padding:11px;border:1px solid #40565e;border-radius:9px;background:#091519; }
      .stable-bidding-title{display:flex;justify-content:space-between;color:#9fd9ef;font-size:10px;font-weight:900;letter-spacing:.1em}.stable-bid-list{display:grid;gap:5px;margin-top:8px}.stable-bid-row{display:flex;justify-content:space-between;padding:7px;border:1px solid #304249;border-radius:6px;color:#e7eeec;font-size:11px}.stable-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:9px}.stable-actions button{min-height:39px;border:1px solid #4d6670;border-radius:7px;background:#142a32;color:#fff;font-size:11px;font-weight:900}.stable-actions .shoot{border-color:#8c7134;background:#33280f;color:#f5d77e}.stable-trump{grid-template-columns:1fr 1fr}.stable-trump button{min-height:46px;background:#f1f4f4;color:#111}.stable-trump .red{color:#c62c34}
      #v3-game-status,#v4-status-panel,#v3-flow-panel,#v4-flow{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function renderTopStatus(state) {
    const phase = String(state.phase || 'waiting').replace('-', ' ').toUpperCase();
    const dealer = state.seats?.[state.dealer] || seatNames[state.dealer] || '—';
    const waiting = state.phase === 'bidding'
      ? (state.seats?.[state.currentBidder] || seatNames[state.currentBidder])
      : state.phase === 'trump'
        ? (state.seats?.[state.winner] || seatNames[state.winner])
        : state.phase === 'dealer-discard'
          ? dealer
          : 'Waiting for players';
    const highBid = state.highBid ? `${state.highBid.amount} by ${state.seats?.[state.highBid.seat] || seatNames[state.highBid.seat]}` : 'No bid';
    const trump = state.trump ? suitNames[state.trump] : 'Not selected';

    const phaseElement = document.querySelector('#center-phase');
    if (phaseElement) phaseElement.textContent = `${phase} · Waiting on ${waiting}`;
    const centerStatus = document.querySelector('.center-status small');
    if (centerStatus) {
      centerStatus.innerHTML = `<b>Dealer: ${dealer}</b><b>Waiting: ${waiting}</b><b>High bid: ${highBid}</b><b>Trump: ${trump}</b>`;
    }
    const phaseBadge = document.querySelector('#phase-badge');
    if (phaseBadge) phaseBadge.textContent = `${phase} · ${waiting}`;
  }

  function renderHand(state) {
    let hand = document.querySelector('#stable-hand');
    if (!hand) {
      hand = document.createElement('div');
      hand.id = 'stable-hand';
      hand.className = 'stable-hand';
      document.querySelector('.professional-table')?.appendChild(hand);
    }
    const seat = currentSeat(state);
    const cards = seat ? (state.hands?.[seat] || []) : [];
    hand.innerHTML = cards.map((card, index) => `<button class="stable-card ${isRed(card.suit) ? 'red' : ''}" style="--rot:${(index-(cards.length-1)/2)*2}deg"><b>${card.rank}<br>${card.suit}</b><i>${card.suit}</i></button>`).join('');
    hand.hidden = !cards.length;
  }

  function renderBidControls(state) {
    let panel = document.querySelector('#stable-bidding');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'stable-bidding';
      panel.className = 'stable-bidding';
      document.querySelector('#table-control-frame')?.prepend(panel);
    }
    const seat = currentSeat(state);
    let actions = '';
    if (state.phase === 'bidding') {
      actions = `<div class="stable-actions"><button data-stable-bid="pass" ${seat !== state.currentBidder ? 'disabled' : ''}>PASS</button>${Game.allowed(seat).map(bid => `<button class="${bid === 28 ? 'shoot' : ''}" data-stable-bid="${bid}">${bid}</button>`).join('')}</div>`;
    } else if (state.phase === 'trump' && seat === state.winner) {
      actions = `<div class="stable-actions stable-trump">${['♥','♠','♦','♣'].map(suit => `<button class="${isRed(suit) ? 'red' : ''}" data-stable-trump="${suit}">${suit} ${suitNames[suit]}</button>`).join('')}</div>`;
    }
    panel.innerHTML = `<div class="stable-bidding-title"><span>BIDDING HISTORY</span><b>${state.bids?.length || 0}</b></div><div class="stable-bid-list">${state.bids?.length ? state.bids.map(bid => `<div class="stable-bid-row"><span>${bid.player}</span><b>${bid.amount}</b></div>`).join('') : '<div class="stable-bid-row"><span>No bids yet</span><b>—</b></div>'}</div>${actions}`;
  }

  function render() {
    if (!gameVisible()) return;
    const state = Game.snap();
    renderTopStatus(state);
    renderHand(state);
    renderBidControls(state);
  }

  document.addEventListener('click', event => {
    const bid = event.target.closest('[data-stable-bid]');
    if (bid) {
      const state = Game.snap();
      const result = Game.bid(currentSeat(state), bid.dataset.stableBid === 'pass' ? 'pass' : Number(bid.dataset.stableBid));
      if (!result.ok) alert(result.message);
      render();
    }
    const trump = event.target.closest('[data-stable-trump]');
    if (trump) {
      Game.trump(trump.dataset.stableTrump);
      render();
    }
  }, true);

  window.addEventListener('pedro:state', render);
  window.addEventListener('focus', () => setTimeout(render, 50));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(render, 50); });
  injectStyles();
  setTimeout(render, 120);
})();
