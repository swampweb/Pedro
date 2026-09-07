(() => {
  if (window.__pedroFixedSeatLayoutV7) return;
  window.__pedroFixedSeatLayoutV7 = true;
  const Game = window.PedroGameState;
  if (!Game) return;

  const SEAT_LABELS = { north:'North', south:'South', east:'East', west:'West' };
  const SUIT_NAMES = { '♥':'Hearts', '♦':'Diamonds', '♣':'Clubs', '♠':'Spades' };
  const identityName = () => PedroIdentity.name();
  const playerSeat = state => Object.keys(state.seats).find(seat => state.seats[seat] === identityName()) || null;
  const active = () => document.querySelector('#game-view')?.classList.contains('active');
  const red = suit => suit === '♥' || suit === '♦';
  let draggingCard = null;

  function removeLegacyUi() {
    for (const selector of ['#your-hand-wrap','#stable-hand','#v4-visible-hand','#v3-visible-hand','#stable-bidding','#bidding-v6','#v4-flow','#v3-flow-panel']) {
      document.querySelector(selector)?.remove();
    }
  }

  function injectStyles() {
    if (document.querySelector('#fixed-seat-layout-v7')) return;
    const style = document.createElement('style');
    style.id = 'fixed-seat-layout-v7';
    style.textContent = `
      .fixed-hand-dock{position:absolute;z-index:34;pointer-events:auto}.fixed-hand-title{display:block;margin-bottom:5px;padding:4px 8px;border:1px solid #d8aa48;border-radius:12px;background:#171108;color:#f4d06b;font-size:9px;font-weight:900;text-align:center}.fixed-hand-cards{display:flex;justify-content:center;align-items:flex-end}.fixed-hand-card{position:relative;width:62px;height:90px;margin-left:-22px;border:1px solid #d0d0d0;border-radius:8px;background:linear-gradient(#fff,#eee9df);color:#111;box-shadow:0 7px 16px #0008;cursor:grab;transform:rotate(var(--rotation));transform-origin:bottom center}.fixed-hand-card:first-child{margin-left:0}.fixed-hand-card.red{color:#c62d34}.fixed-hand-card b{position:absolute;left:6px;top:4px;font-size:15px}.fixed-hand-card i{position:absolute;inset:0;display:grid;place-items:center;font-size:28px;font-style:normal}.fixed-hand-card.dragging{opacity:.42}.fixed-hand-card.drop-target{outline:3px solid #efbc4e;transform:translateY(-7px) rotate(var(--rotation))}
      .fixed-hand-dock[data-seat="south"]{left:50%;bottom:2px;transform:translateX(-50%)}.fixed-hand-dock[data-seat="north"]{left:50%;top:104px;transform:translateX(-50%)}
      .fixed-hand-dock[data-seat="west"]{left:155px;top:50%;transform:translateY(-50%) rotate(90deg);transform-origin:center}.fixed-hand-dock[data-seat="west"] .fixed-hand-card{transform:rotate(calc(var(--rotation) - 90deg))}
      .fixed-hand-dock[data-seat="east"]{right:155px;top:50%;transform:translateY(-50%) rotate(-90deg);transform-origin:center}.fixed-hand-dock[data-seat="east"] .fixed-hand-card{transform:rotate(calc(var(--rotation) + 90deg))}
      .fixed-me-badge{position:absolute;z-index:45;padding:3px 7px;border:1px solid #69c5e6;border-radius:12px;background:#09202a;color:#bfefff;font-size:8px;font-weight:900}.north-seat .fixed-me-badge,.south-seat .fixed-me-badge{left:-42px;top:4px}.east-seat .fixed-me-badge{right:-42px;top:4px}.west-seat .fixed-me-badge{left:-42px;top:4px}
      .fixed-dealer-badge{position:absolute;z-index:45;padding:3px 7px;border:1px solid #d7aa49;border-radius:12px;background:#241a08;color:#f5d16c;font-size:8px;font-weight:900}.north-seat .fixed-dealer-badge,.south-seat .fixed-dealer-badge{right:-64px;top:4px}.west-seat .fixed-dealer-badge{right:-64px;top:4px}.east-seat .fixed-dealer-badge{left:-64px;top:4px}
      .fixed-bidding{margin:0 0 10px;padding:11px;border:1px solid #40565e;border-radius:9px;background:#091519}.fixed-bidding-title{display:flex;justify-content:space-between;color:#9fd9ef;font-size:10px;font-weight:900}.fixed-bid-list{display:grid;gap:5px;margin-top:8px}.fixed-bid-row{display:flex;justify-content:space-between;padding:7px;border:1px solid #304249;border-radius:6px;color:#e7eeec;font-size:11px}.fixed-actions{display:grid;grid-template-columns:repeat(4,minmax(42px,1fr));gap:6px;margin-top:9px}.fixed-actions button{min-height:39px;border:1px solid #4d6670;border-radius:7px;background:#142a32;color:#fff;font-size:11px;font-weight:900}.fixed-actions .special{grid-column:span 2;border-color:#8c7134;background:#33280f;color:#f5d77e}.fixed-trump{grid-template-columns:1fr 1fr}.fixed-trump button{min-height:46px;background:#f1f4f4;color:#111}.fixed-trump .red{color:#c62d34}
      .south-seat{bottom:118px!important}.north-seat{top:18px!important}.west-seat{left:34px!important}.east-seat{right:34px!important}
      @media(max-width:1250px){.fixed-hand-dock[data-seat="west"]{left:125px}.fixed-hand-dock[data-seat="east"]{right:125px}.fixed-hand-card{width:56px;height:82px;margin-left:-24px}}
    `;
    document.head.appendChild(style);
  }

  function syncSeatClick() {
    document.addEventListener('click', event => {
      const seatElement = event.target.closest('[data-table-seat]');
      if (!seatElement) return;
      setTimeout(() => {
        const name = identityName();
        if (!name) return;
        if (Game.takeSeat(seatElement.dataset.tableSeat, name)) render();
      }, 0);
    }, true);
  }

  function renderSeatBadges(state) {
    document.querySelectorAll('.fixed-me-badge,.fixed-dealer-badge').forEach(node => node.remove());
    const mySeat = playerSeat(state);
    if (mySeat) {
      const element = document.querySelector(`[data-table-seat="${mySeat}"]`);
      if (element) {
        const badge = document.createElement('span');
        badge.className = 'fixed-me-badge';
        badge.textContent = 'YOU';
        element.appendChild(badge);
      }
    }
    if (state.dealer) {
      const element = document.querySelector(`[data-table-seat="${state.dealer}"]`);
      if (element) {
        const badge = document.createElement('span');
        badge.className = 'fixed-dealer-badge';
        badge.textContent = 'DEALER';
        element.appendChild(badge);
      }
    }
  }

  function renderHand(state) {
    let dock = document.querySelector('#fixed-hand-dock');
    if (!dock) {
      dock = document.createElement('section');
      dock.id = 'fixed-hand-dock';
      dock.className = 'fixed-hand-dock';
      dock.innerHTML = '<span id="fixed-hand-title" class="fixed-hand-title"></span><div id="fixed-hand-cards" class="fixed-hand-cards"></div>';
      document.querySelector('.professional-table')?.appendChild(dock);
    }
    const seat = playerSeat(state);
    const cards = seat ? state.hands[seat] || [] : [];
    dock.dataset.seat = seat || 'south';
    document.querySelector('#fixed-hand-title').textContent = seat ? `${identityName()} · ${SEAT_LABELS[seat]} HAND` : 'CHOOSE A SEAT';
    const target = document.querySelector('#fixed-hand-cards');
    target.innerHTML = cards.map((card,index) => `<button draggable="true" class="fixed-hand-card ${red(card.suit)?'red':''}" data-card-id="${card.id}" style="--rotation:${(index-(cards.length-1)/2)*2}deg"><b>${card.rank}<br>${card.suit}</b><i>${card.suit}</i></button>`).join('');
    dock.hidden = !cards.length;

    target.querySelectorAll('.fixed-hand-card').forEach(card => {
      card.addEventListener('dragstart', () => { draggingCard = card.dataset.cardId; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { draggingCard = null; target.querySelectorAll('.fixed-hand-card').forEach(item => item.classList.remove('dragging','drop-target')); });
      card.addEventListener('dragover', event => { event.preventDefault(); card.classList.add('drop-target'); });
      card.addEventListener('dragleave', () => card.classList.remove('drop-target'));
      card.addEventListener('drop', event => {
        event.preventDefault();
        const to = card.dataset.cardId;
        if (!draggingCard || draggingCard === to || !seat) return;
        const ids = cards.map(item => item.id);
        const fromIndex = ids.indexOf(draggingCard);
        const toIndex = ids.indexOf(to);
        const [moved] = ids.splice(fromIndex,1);
        ids.splice(toIndex,0,moved);
        Game.reorderHand(seat,ids);
      });
    });
  }

  function renderStatus(state) {
    const dealer = state.dealer ? state.seats[state.dealer] : 'Not assigned';
    const waiting = state.phase === 'bidding' ? state.seats[state.currentBidder] : state.phase === 'trump' ? state.seats[state.winner] : state.phase === 'dealer-discard' ? dealer : 'Waiting for players';
    const high = state.highBid ? `${state.highBid.amount} by ${state.highBid.player}` : 'No bid';
    const trump = state.trump ? SUIT_NAMES[state.trump] : 'Not selected';
    const phase = String(state.phase || 'waiting').replace('-',' ').toUpperCase();
    const center = document.querySelector('#center-phase');
    if (center) center.textContent = `${phase} · ${waiting || 'Waiting for player'}`;
    const details = document.querySelector('.center-status small');
    if (details) details.innerHTML = `<b>Dealer: ${dealer || 'Not assigned'}</b><b>Waiting: ${waiting || 'Waiting for player'}</b><b>High bid: ${high}</b><b>Trump: ${trump}</b>`;
  }

  function renderBidding(state) {
    let panel = document.querySelector('#fixed-bidding');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'fixed-bidding';
      panel.className = 'fixed-bidding';
      document.querySelector('#table-control-frame')?.prepend(panel);
    }
    const seat = playerSeat(state);
    let actions = '';
    if (state.phase === 'bidding') {
      actions = `<div class="fixed-actions"><button data-fixed-bid="pass" ${seat !== state.currentBidder ? 'disabled' : ''}>PASS</button>${Game.allowedBids(seat).map(value => `<button class="${value==='14/28'?'special':''}" data-fixed-bid="${value}">${value}</button>`).join('')}</div>`;
    } else if (state.phase === 'trump' && seat === state.winner) {
      actions = `<div class="fixed-actions fixed-trump">${['♥','♠','♦','♣'].map(suit => `<button class="${red(suit)?'red':''}" data-fixed-trump="${suit}">${suit} ${SUIT_NAMES[suit]}</button>`).join('')}</div>`;
    }
    panel.innerHTML = `<div class="fixed-bidding-title"><span>BIDDING HISTORY</span><b>${state.bids.length}</b></div><div class="fixed-bid-list">${state.bids.length ? state.bids.map(item => `<div class="fixed-bid-row"><span>${item.player}</span><b>${item.amount}</b></div>`).join('') : '<div class="fixed-bid-row"><span>No bids yet</span><b>—</b></div>'}</div>${actions}`;
  }

  function render() {
    if (!active()) return;
    removeLegacyUi();
    const state = Game.snap();
    renderSeatBadges(state);
    renderHand(state);
    renderStatus(state);
    renderBidding(state);
  }

  document.addEventListener('click', event => {
    const bid = event.target.closest('[data-fixed-bid]');
    if (bid) {
      const state = Game.snap();
      const value = bid.dataset.fixedBid;
      const result = Game.bid(playerSeat(state), value === 'pass' ? 'pass' : value);
      if (!result.ok) alert(result.message);
    }
    const trump = event.target.closest('[data-fixed-trump]');
    if (trump) Game.chooseTrump(trump.dataset.fixedTrump);
  }, true);

  window.addEventListener('pedro:identity', () => render());
  window.addEventListener('pedro:state', render);
  window.addEventListener('focus', () => setTimeout(render,50));
  injectStyles();
  syncSeatClick();
  setTimeout(render,150);
})();
