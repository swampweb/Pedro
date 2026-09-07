(() => {
  const VERSION = '4.1';
  if (window.PedroGameState?.version === VERSION) return;

  const KEY = 'pedro.game.v4.1';
  const OLD_KEYS = ['pedro.game.v2', 'pedro.game.v3', 'pedro.game.v4'];
  const SEATS = ['south', 'west', 'north', 'east'];
  const SUITS = ['♥', '♦', '♣', '♠'];
  const RANKS = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];

  const fresh = () => ({
    version: VERSION,
    tableId: null,
    tableName: 'Pedro Table',
    phase: 'waiting',
    identity: { id: null, name: '' },
    seats: { north: null, south: null, east: null, west: null },
    watchers: [],
    dealer: null,
    currentBidder: null,
    bidOrder: [],
    bidIndex: -1,
    bids: [],
    highBid: null,
    winner: null,
    trump: null,
    hands: { north: [], south: [], east: [], west: [] },
    kitty: [],
    dealerOriginalHand: [],
    dealerPickup: [],
    discards: [],
    scores: { team1: 0, team2: 0 }
  });

  OLD_KEYS.forEach(key => sessionStorage.removeItem(key));
  let state = fresh();
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved?.version === VERSION && saved.tableId) state = { ...fresh(), ...saved };
  } catch {}

  const snapshot = () => JSON.parse(JSON.stringify(state));
  function emit() {
    sessionStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: snapshot() }));
  }

  function setIdentity(identity) {
    state.identity = { id: identity.id || null, name: identity.displayName || identity.name || '' };
    emit();
  }

  function reset(table = {}) {
    const identity = state.identity;
    state = fresh();
    state.identity = identity;
    state.tableId = table.id || table.name || `local-${Date.now()}`;
    state.tableName = table.name || 'Pedro Table';
    emit();
  }

  function setTable(table = {}) {
    const id = table.id || table.name;
    if (!state.tableId || (id && state.tableId !== id)) reset(table);
    else {
      state.tableName = table.name || state.tableName;
      emit();
    }
  }

  function setSeats(seats) {
    state.seats = { ...state.seats, ...seats };
    state.watchers = state.watchers.filter(name => !Object.values(state.seats).includes(name));
    if (Object.values(state.seats).filter(Boolean).length < 4 && state.phase === 'waiting') state.dealer = null;
    emit();
  }

  function takeSeat(seat, name = state.identity.name) {
    if (!SEATS.includes(seat) || !name) return false;
    for (const key of SEATS) if (state.seats[key] === name) state.seats[key] = null;
    if (state.seats[seat] && state.seats[seat] !== name) return false;
    state.seats[seat] = name;
    state.watchers = state.watchers.filter(item => item !== name);
    emit();
    return true;
  }

  function enterWatcher(name = state.identity.name) {
    if (!name || Object.values(state.seats).includes(name) || state.watchers.includes(name)) return;
    state.watchers.push(name);
    emit();
  }

  function releasePlayer(name = state.identity.name) {
    for (const seat of SEATS) if (state.seats[seat] === name) state.seats[seat] = null;
    state.watchers = state.watchers.filter(item => item !== name);
    emit();
  }

  function createDeck() {
    const cards = [];
    for (const suit of SUITS) for (const rank of RANKS) cards.push({ id: `${suit}-${rank}`, suit, rank });
    for (let index = cards.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[swap]] = [cards[swap], cards[index]];
    }
    return cards;
  }

  function deal() {
    if (Object.values(state.seats).filter(Boolean).length !== 4) {
      return { ok: false, message: 'Four players must be seated before dealing.' };
    }
    state.dealer = state.dealer && state.seats[state.dealer] ? state.dealer : 'south';
    const deck = createDeck();
    state.hands = { north: [], south: [], east: [], west: [] };
    for (let round = 0; round < 9; round++) {
      for (const seat of SEATS) state.hands[seat].push(deck.shift());
    }
    state.kitty = deck;
    state.dealerOriginalHand = [];
    state.dealerPickup = [];
    state.discards = [];
    state.phase = 'bidding';
    state.bids = [];
    state.highBid = null;
    state.winner = null;
    state.trump = null;
    const dealerIndex = SEATS.indexOf(state.dealer);
    state.bidOrder = [1,2,3,4].map(offset => SEATS[(dealerIndex + offset) % 4]);
    state.bidIndex = 0;
    state.currentBidder = state.bidOrder[0];
    emit();
    return { ok: true };
  }

  function allowedBids(seat) {
    if (state.phase !== 'bidding' || seat !== state.currentBidder) return [];
    const dealerLast = seat === state.dealer && state.bidIndex === state.bidOrder.length - 1;
    if (dealerLast && !state.highBid) return [6, '14/28'];
    const high = Number(state.highBid?.numeric || 6);
    const bids = [];
    for (let value = Math.max(7, high + 1); value <= 14; value++) bids.push(value);
    if (high < 14) bids.push('14/28');
    return bids;
  }

  function bid(seat, value) {
    if (seat !== state.currentBidder) return { ok: false, message: 'It is not this player’s turn.' };
    const pass = value === 'pass';
    const dealerLast = seat === state.dealer && state.bidIndex === state.bidOrder.length - 1;
    if (pass && dealerLast && !state.highBid) return { ok: false, message: 'Dealer is forced to bid 6 or 14/28.' };
    const numeric = value === '14/28' ? 14 : Number(value);
    if (!pass && !allowedBids(seat).some(item => item === value || Number(item) === numeric)) {
      return { ok: false, message: 'That bid is not allowed.' };
    }
    const player = state.seats[seat];
    if (!player) return { ok: false, message: 'The bid seat has no player.' };
    state.bids.push({ seat, player, amount: pass ? 'PASS' : value, numeric });
    if (!pass) state.highBid = { seat, player, amount: value, numeric };
    state.bidIndex += 1;
    if (state.bidIndex >= state.bidOrder.length) {
      if (!state.highBid) {
        state.highBid = { seat: state.dealer, player: state.seats[state.dealer], amount: 6, numeric: 6 };
      }
      state.winner = state.highBid.seat;
      state.currentBidder = null;
      state.phase = 'trump';
    } else {
      state.currentBidder = state.bidOrder[state.bidIndex];
    }
    emit();
    return { ok: true };
  }

  function chooseTrump(suit) {
    if (state.phase !== 'trump' || !SUITS.includes(suit)) return false;
    state.trump = suit;
    state.phase = 'dealer-discard';
    state.dealerOriginalHand = state.hands[state.dealer].map(card => ({ ...card, source: 'original' }));
    state.dealerPickup = state.kitty.map(card => ({ ...card, source: 'pickup' }));
    state.hands[state.dealer] = [...state.dealerOriginalHand, ...state.dealerPickup];
    state.kitty = [];
    emit();
    return true;
  }

  function reorderHand(seat, orderedIds) {
    const hand = state.hands[seat];
    if (!hand) return;
    const lookup = new Map(hand.map(card => [card.id, card]));
    state.hands[seat] = orderedIds.map(id => lookup.get(id)).filter(Boolean);
    for (const card of hand) if (!orderedIds.includes(card.id)) state.hands[seat].push(card);
    emit();
  }

  function keepDealerCards(ids) {
    if (state.phase !== 'dealer-discard') return { ok: false, message: 'Dealer selection is not active.' };
    if (ids.length !== 6) return { ok: false, message: 'Select exactly 6 cards to keep.' };
    const chosen = new Set(ids);
    const dealerHand = state.hands[state.dealer];
    state.discards = dealerHand.filter(card => !chosen.has(card.id));
    state.hands[state.dealer] = dealerHand.filter(card => chosen.has(card.id));
    if (state.hands[state.dealer].length !== 6) return { ok: false, message: 'Dealer must keep exactly 6 cards.' };
    state.phase = 'playing';
    emit();
    return { ok: true };
  }

  function nextDealer() {
    state.dealer = SEATS[(SEATS.indexOf(state.dealer) + 1) % SEATS.length];
    emit();
  }

  function scoreContract(contract, completed) {
    return contract === '14/28' ? (completed ? 28 : -14) : (completed ? Number(contract) : -Number(contract));
  }

  window.PedroGameState = {
    version: VERSION,
    snap: snapshot,
    setIdentity,
    reset,
    setTable,
    setSeats,
    takeSeat,
    enterWatcher,
    releasePlayer,
    deal,
    allowedBids,
    bid,
    chooseTrump,
    reorderHand,
    keepDealerCards,
    nextDealer,
    scoreContract
  };

  PedroIdentity.ready.then(identity => setIdentity(identity));
})();
