(() => {
  if (window.__pedroGuidedDiscardV8) return;
  window.__pedroGuidedDiscardV8 = true;
  const Game = window.PedroGameState;
  if (!Game) return;

  const SEAT_LABELS = { north:'North', south:'South', east:'East', west:'West' };
  const SUIT_NAMES = { '♥':'Hearts', '♦':'Diamonds', '♣':'Clubs', '♠':'Spades' };
  const identityName = () => PedroIdentity.name();
  const playerSeat = state => Object.keys(state.seats).find(seat => state.seats[seat] === identityName()) || null;
  const active = () => document.querySelector('#game-view')?.classList.contains('active');
  const red = suit => suit === '♥' || suit === '♦';
  let draggingCard = null;
  let keepSelection = new Set();

  function removeLegacyUi() {
    for (const selector of ['#your-hand-wrap','#stable-hand','#v4-visible-hand','#v3-visible-hand','#fixed-hand-dock','#stable-bidding','#bidding-v6','#fixed-bidding','#v4-flow','#v3-flow-panel','#dealer-workbench']) {
      document.querySelector(selector)?.remove();
    }
  }

  function injectStyles() {
    if (document.querySelector('#guided-discard-v8')) return;
    const style = document.createElement('style');
    style.id = 'guided-discard-v8';
    style.textContent = `
      button:not(:disabled){cursor:pointer!important;transition:background-color .14s ease,border-color .14s ease,box-shadow .14s ease,transform .08s ease!important}
      button:not(:disabled):hover{background-color:#21404b!important;border-color:#77bdd7!important;box-shadow:0 0 0 2px rgba(119,189,215,.18)!important}
      button:not(:disabled):active{transform:translateY(1px)!important}button:disabled{cursor:not-allowed!important;opacity:.38!important}
      #ready-button,#start-game,#deal-cards,#random-seat,#watch-table,#fill-demo-players{min-height:34px!important;padding:6px 9px!important;border:1px solid #4a626c!important;border-radius:6px!important;background:#142830!important;color:#fff!important;box-shadow:none!important;font-size:10px!important;font-weight:900!important;line-height:1.15!important}.host-control-block,.stacked-controls{gap:5px!important}.host-control-block{grid-template-columns:1fr 1fr!important}.host-control-block #start-game,.host-control-block #deal-cards{grid-column:auto!important}
      .flow-status-v8{margin:0 0 9px;padding:11px;border:1px solid #4a626c;border-radius:8px;background:#0a171b}.flow-status-v8 header{display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;border-bottom:1px solid #31444b}.flow-status-v8 header span{color:#9edcf2;font-size:10px;font-weight:900;letter-spacing:.1em}.flow-status-v8 header b{padding:4px 8px;border:1px solid #806a35;border-radius:12px;color:#f5d470;font-size:9px}.flow-grid-v8{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.flow-item-v8{padding:7px;border:1px solid #304249;border-radius:6px;background:#091418}.flow-item-v8 span,.flow-item-v8 b{display:block}.flow-item-v8 span{color:#aebdc1;font-size:9px}.flow-item-v8 b{margin-top:3px;color:#fff4df;font-size:11px;overflow-wrap:anywhere}.flow-item-v8.waiting b{color:#f4d26d}
      .bidder-marker-v8{position:absolute;z-index:46;padding:3px 7px;border:1px solid #72c6e5;border-radius:12px;background:#09232d;color:#c4efff;font-size:8px;font-weight:900}.north-seat .bidder-marker-v8,.south-seat .bidder-marker-v8{left:-72px;top:3px}.west-seat .bidder-marker-v8{right:-72px;top:3px}.east-seat .bidder-marker-v8{left:-72px;top:3px}
      .dealer-marker-v8{position:absolute;z-index:46;padding:3px 7px;border:1px solid #d6aa49;border-radius:12px;background:#241a08;color:#f5d16c;font-size:8px;font-weight:900}.north-seat .dealer-marker-v8,.south-seat .dealer-marker-v8{right:-64px;top:3px}.west-seat .dealer-marker-v8{right:-64px;top:3px}.east-seat .dealer-marker-v8{left:-64px;top:3px}
      .regular-hand-v8{position:absolute;z-index:34;pointer-events:auto}.regular-hand-title-v8{display:block;margin-bottom:4px;padding:3px 7px;border:1px solid #d5a849;border-radius:11px;background:#171108;color:#f3d06b;font-size:8px;font-weight:900;text-align:center}.regular-cards-v8{display:flex;justify-content:center;align-items:flex-end}.regular-card-v8{position:relative;width:56px;height:82px;margin-left:-21px;border:1px solid #ccc;border-radius:7px;background:linear-gradient(#fff,#eee9df);color:#111;box-shadow:0 6px 14px #0008;transform:rotate(var(--rotation));transform-origin:bottom center}.regular-card-v8:first-child{margin-left:0}.regular-card-v8.red{color:#c62d34}.regular-card-v8 b{position:absolute;left:5px;top:4px;font-size:14px}.regular-card-v8 i{position:absolute;inset:0;display:grid;place-items:center;font-size:25px;font-style:normal}.regular-hand-v8[data-seat="south"]{left:50%;bottom:2px;transform:translateX(-50%)}.regular-hand-v8[data-seat="north"]{left:50%;top:102px;transform:translateX(-50%)}.regular-hand-v8[data-seat="west"]{left:130px;top:50%;transform:translateY(-50%) rotate(90deg)}.regular-hand-v8[data-seat="east"]{right:130px;top:50%;transform:translateY(-50%) rotate(-90deg)}
      .dealer-workbench-v8{position:absolute;z-index:70;inset:52px 42px 28px;padding:14px;border:1px solid #816b37;border-radius:12px;background:rgba(5,13,15,.95);box-shadow:0 18px 50px #000b;overflow:auto}.dealer-workbench-v8 header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.dealer-workbench-v8 h2{margin:0;font:700 24px Georgia;color:#f6e4b8}.dealer-workbench-v8 p{margin:6px 0 0;color:#c4cecf;font-size:11px;line-height:1.45}.dealer-summary-v8{display:grid;grid-template-columns:repeat(4,auto);gap:7px}.dealer-summary-v8 div{min-width:98px;padding:7px;border:1px solid #3a4d53;border-radius:6px;background:#0a171a}.dealer-summary-v8 span,.dealer-summary-v8 b{display:block}.dealer-summary-v8 span{color:#9dabad;font-size:8px}.dealer-summary-v8 b{margin-top:3px;color:#f3d16f;font-size:11px}.dealer-instruction-v8{margin-top:10px;padding:9px;border:1px solid #6f5b2e;border-radius:7px;background:#211908;color:#f5d474;font-size:11px;font-weight:900}.dealer-card-group-v8{margin-top:12px}.dealer-card-group-v8 h3{margin:0 0 7px;color:#9edcf2;font-size:10px;letter-spacing:.08em}.dealer-card-grid-v8{display:flex;flex-wrap:wrap;gap:7px}.dealer-choice-v8{position:relative;width:55px;height:79px;border:2px solid #cfd4d4;border-radius:7px;background:#fff;color:#111;box-shadow:0 5px 12px #0007;font-weight:900}.dealer-choice-v8.red{color:#c62d34}.dealer-choice-v8.selected{transform:translateY(-6px);border-color:#69c6e8!important;background:#dff5ff!important;box-shadow:0 0 0 3px rgba(105,198,232,.3)!important}.dealer-choice-v8.selected:after{content:'KEEP';position:absolute;left:50%;bottom:3px;transform:translateX(-50%);padding:2px 4px;border-radius:4px;background:#123a48;color:#fff;font-size:7px}.dealer-actions-v8{display:flex;justify-content:flex-end;align-items:center;gap:9px;margin-top:13px}.dealer-counter-v8{margin-right:auto;color:#d8e2e2;font-size:11px}.dealer-counter-v8 b{color:#f4d36f}.dealer-confirm-v8{min-height:38px;padding:0 14px;border:1px solid #477f58;border-radius:7px;background:#194e2d;color:#fff;font-size:10px;font-weight:900}.dealer-confirm-v8:disabled{background:#182226!important;border-color:#35474d!important}
      .bidding-panel-v8{margin:0 0 9px;padding:10px;border:1px solid #40565e;border-radius:8px;background:#091519}.bidding-title-v8{display:flex;justify-content:space-between;color:#9fd9ef;font-size:10px;font-weight:900}.bidding-list-v8{display:grid;gap:5px;margin-top:7px}.bidding-row-v8{display:flex;justify-content:space-between;padding:6px;border:1px solid #304249;border-radius:6px;color:#e7eeec;font-size:10px}.bidding-actions-v8{display:grid;grid-template-columns:repeat(4,minmax(40px,1fr));gap:5px;margin-top:8px}.bidding-actions-v8 button{min-height:35px;border:1px solid #4a626c;border-radius:6px;background:#142830;color:#fff;font-size:10px;font-weight:900}.bidding-actions-v8 .special{grid-column:span 2;border-color:#806a35;background:#2b230f;color:#f4d474}.trump-actions-v8{grid-template-columns:1fr 1fr}.trump-actions-v8 button{min-height:42px;background:#f2f4f4;color:#111}.trump-actions-v8 .red{color:#c62d34}
      #fixed-hand-dock,#fixed-bidding,#your-hand-wrap,#stable-hand,#stable-bidding,#v4-visible-hand,#v3-visible-hand{display:none!important}
      @media(max-width:1250px){.dealer-workbench-v8{inset:45px 28px 22px}.dealer-summary-v8{grid-template-columns:1fr 1fr}.dealer-choice-v8{width:49px;height:72px}.regular-hand-v8[data-seat="west"]{left:108px}.regular-hand-v8[data-seat="east"]{right:108px}}
    `;
    document.head.appendChild(style);
  }

  function removeLegacy() {
    ['#fixed-hand-dock','#fixed-bidding','#your-hand-wrap','#stable-hand','#stable-bidding','#v4-visible-hand','#v3-visible-hand'].forEach(selector => document.querySelector(selector)?.remove());
  }

  function currentSeat(state) {
    return Object.keys(state.seats).find(seat => state.seats[seat] === identityName()) || null;
  }

  function renderFlowStatus(state) {
    let panel = document.querySelector('#flow-status-v8');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'flow-status-v8';
      panel.className = 'flow-status-v8';
      document.querySelector('.table-info-panel')?.prepend(panel);
    }
    const dealer = state.dealer ? state.seats[state.dealer] : 'Not assigned';
    const waiting = state.phase === 'bidding' ? state.seats[state.currentBidder]
      : state.phase === 'trump' ? state.seats[state.winner]
      : state.phase === 'dealer-discard' ? dealer
      : state.phase === 'playing' ? 'First player'
      : 'Waiting for four players';
    const highBid = state.highBid ? `${state.highBid.amount} by ${state.highBid.player}` : 'No bid';
    const trump = state.trump ? SUIT_NAMES[state.trump] : 'Not selected';
    const phase = String(state.phase || 'waiting').replace('-',' ').toUpperCase();
    panel.innerHTML = `<header><span>GAME FLOW</span><b>${phase}</b></header><div class="flow-grid-v8"><div class="flow-item-v8"><span>Dealer</span><b>${dealer || 'Not assigned'}</b></div><div class="flow-item-v8 waiting"><span>Waiting On</span><b>${waiting || 'Waiting for player'}</b></div><div class="flow-item-v8"><span>Contract</span><b>${highBid}</b></div><div class="flow-item-v8"><span>Trump</span><b>${trump}</b></div></div>`;

    const phaseText = document.querySelector('#center-phase');
    if (phaseText) phaseText.textContent = `${phase} · ${waiting || 'Waiting for player'}`;
    const centerDetails = document.querySelector('.center-status small');
    if (centerDetails) centerDetails.innerHTML = `<b>Dealer: ${dealer || 'Not assigned'}</b><b>Waiting: ${waiting || 'Waiting for player'}</b><b>Contract: ${highBid}</b><b>Trump: ${trump}</b>`;
  }

  function renderSeatMarkers(state) {
    document.querySelectorAll('.bidder-marker-v8,.dealer-marker-v8').forEach(node => node.remove());
    if (state.dealer) {
      const dealerSeat = document.querySelector(`[data-table-seat="${state.dealer}"]`);
      if (dealerSeat) {
        const marker = document.createElement('span');
        marker.className = 'dealer-marker-v8';
        marker.textContent = 'DEALER';
        dealerSeat.appendChild(marker);
      }
    }
    if (state.phase === 'bidding' && state.currentBidder) {
      const bidSeat = document.querySelector(`[data-table-seat="${state.currentBidder}"]`);
      if (bidSeat) {
        const marker = document.createElement('span');
        marker.className = 'bidder-marker-v8';
        marker.textContent = 'BID NOW';
        bidSeat.appendChild(marker);
      }
    }
  }

  function renderRegularHand(state) {
    let dock = document.querySelector('#regular-hand-v8');
    if (!dock) {
      dock = document.createElement('section');
      dock.id = 'regular-hand-v8';
      dock.className = 'regular-hand-v8';
      dock.innerHTML = '<span id="regular-hand-title-v8" class="regular-hand-title-v8"></span><div id="regular-cards-v8" class="regular-cards-v8"></div>';
      document.querySelector('.professional-table')?.appendChild(dock);
    }
    const seat = currentSeat(state);
    const cards = seat ? state.hands[seat] || [] : [];
    dock.dataset.seat = seat || 'south';
    document.querySelector('#regular-hand-title-v8').textContent = seat ? `${identityName()} · ${SEAT_LABELS[seat]} HAND` : 'CHOOSE A SEAT';
    const target = document.querySelector('#regular-cards-v8');
    target.innerHTML = cards.map((card,index) => `<button draggable="true" class="regular-card-v8 ${red(card.suit)?'red':''}" data-order-card="${card.id}" style="--rotation:${(index-(cards.length-1)/2)*2}deg"><b>${card.rank}<br>${card.suit}</b><i>${card.suit}</i></button>`).join('');
    dock.hidden = !cards.length || state.phase === 'dealer-discard';

    target.querySelectorAll('[data-order-card]').forEach(card => {
      card.addEventListener('dragstart', () => { draggingCard = card.dataset.orderCard; });
      card.addEventListener('dragover', event => event.preventDefault());
      card.addEventListener('drop', event => {
        event.preventDefault();
        const to = card.dataset.orderCard;
        if (!seat || !draggingCard || draggingCard === to) return;
        const ids = cards.map(item => item.id);
        const fromIndex = ids.indexOf(draggingCard);
        const toIndex = ids.indexOf(to);
        const [moved] = ids.splice(fromIndex,1);
        ids.splice(toIndex,0,moved);
        Game.reorderHand(seat,ids);
      });
    });
  }

  function renderBidding(state) {
    let panel = document.querySelector('#bidding-panel-v8');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'bidding-panel-v8';
      panel.className = 'bidding-panel-v8';
      document.querySelector('#table-control-frame')?.prepend(panel);
    }
    const seat = currentSeat(state);
    let actions = '';
    if (state.phase === 'bidding') {
      actions = `<div class="bidding-actions-v8"><button data-bid-v8="pass" ${seat!==state.currentBidder?'disabled':''}>PASS</button>${Game.allowedBids(seat).map(value => `<button class="${value==='14/28'?'special':''}" data-bid-v8="${value}">${value}</button>`).join('')}</div>`;
    } else if (state.phase === 'trump' && seat === state.winner) {
      actions = `<div class="bidding-actions-v8 trump-actions-v8">${['♥','♠','♦','♣'].map(suit => `<button class="${red(suit)?'red':''}" data-trump-v8="${suit}">${suit} ${SUIT_NAMES[suit]}</button>`).join('')}</div>`;
    }
    panel.innerHTML = `<div class="bidding-title-v8"><span>BIDDING HISTORY</span><b>${state.bids.length}</b></div><div class="bidding-list-v8">${state.bids.length ? state.bids.map(item => `<div class="bidding-row-v8"><span>${item.player}</span><b>${item.amount}</b></div>`).join('') : '<div class="bidding-row-v8"><span>No bids yet</span><b>—</b></div>'}</div>${actions}`;
    panel.hidden = state.phase === 'dealer-discard' || state.phase === 'playing';
  }

  function renderDealerWorkbench(state) {
    let workbench = document.querySelector('#dealer-workbench-v8');
    const isDealer = currentSeat(state) === state.dealer;
    if (state.phase !== 'dealer-discard' || !isDealer) {
      workbench?.remove();
      keepSelection.clear();
      return;
    }

    if (!workbench) {
      workbench = document.createElement('section');
      workbench.id = 'dealer-workbench-v8';
      workbench.className = 'dealer-workbench-v8';
      document.querySelector('.professional-table')?.appendChild(workbench);
    }

    const original = state.dealerOriginalHand || [];
    const pickup = state.dealerPickup || [];
    const contract = state.highBid?.amount || '—';
    const trump = state.trump ? `${state.trump} ${SUIT_NAMES[state.trump]}` : 'Not selected';
    const cardButton = card => `<button class="dealer-choice-v8 ${red(card.suit)?'red':''} ${keepSelection.has(card.id)?'selected':''}" data-keep-card-v8="${card.id}">${card.rank}${card.suit}</button>`;

    workbench.innerHTML = `<header><div><h2>Dealer: Choose the Final Six</h2><p>The original hand and the cards left in the deck are separated below. Click exactly six cards to <strong>KEEP</strong>. Every other card will be discarded.</p></div><div class="dealer-summary-v8"><div><span>Contract</span><b>${contract}</b></div><div><span>Trump</span><b>${trump}</b></div><div><span>Total Cards</span><b>${original.length+pickup.length}</b></div><div><span>Keep</span><b>6</b></div></div></header><div class="dealer-instruction-v8">Select 6 cards to keep. Selected cards turn blue and display KEEP.</div><section class="dealer-card-group-v8"><h3>ORIGINAL DEALER HAND · ${original.length} CARDS</h3><div class="dealer-card-grid-v8">${original.map(cardButton).join('')}</div></section><section class="dealer-card-group-v8"><h3>CARDS LEFT IN THE DECK · ${pickup.length} CARDS</h3><div class="dealer-card-grid-v8">${pickup.map(cardButton).join('')}</div></section><div class="dealer-actions-v8"><span class="dealer-counter-v8">Selected to keep: <b>${keepSelection.size} / 6</b></span><button id="dealer-confirm-v8" class="dealer-confirm-v8" ${keepSelection.size!==6?'disabled':''}>KEEP 6 AND DISCARD THE REST</button></div>`;

    workbench.querySelectorAll('[data-keep-card-v8]').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.keepCardV8;
        if (keepSelection.has(id)) keepSelection.delete(id);
        else if (keepSelection.size < 6) keepSelection.add(id);
        renderDealerWorkbench(Game.snap());
      });
    });
    document.querySelector('#dealer-confirm-v8')?.addEventListener('click', () => {
      const result = Game.keepDealerCards([...keepSelection]);
      if (!result.ok) return alert(result.message);
      keepSelection.clear();
    });
  }

  function render() {
    if (!active()) return;
    removeLegacy();
    const state = Game.snap();
    renderFlowStatus(state);
    renderSeatMarkers(state);
    renderRegularHand(state);
    renderBidding(state);
    renderDealerWorkbench(state);
  }

  document.addEventListener('click', event => {
    const bid = event.target.closest('[data-bid-v8]');
    if (bid) {
      const value = bid.dataset.bidV8;
      const result = Game.bid(currentSeat(Game.snap()), value === 'pass' ? 'pass' : value);
      if (!result.ok) alert(result.message);
    }
    const trump = event.target.closest('[data-trump-v8]');
    if (trump) Game.chooseTrump(trump.dataset.trumpV8);
  }, true);

  window.addEventListener('pedro:state', render);
  window.addEventListener('focus', () => setTimeout(render,50));
  injectStyles();
  setTimeout(render,150);
})();
