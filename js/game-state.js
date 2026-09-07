(() => {
  if (window.PedroGameState?.version === '3.1') return;
  const KEY = 'pedro.game.v3';
  const seatOrder = ['south', 'west', 'north', 'east'];
  const suits = ['♥', '♦', '♣', '♠'];
  const ranks = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];

  const fresh = () => ({
    version:'3.1', tableId:null, tableName:'Pedro Table', phase:'waiting', dealer:'south',
    currentBidder:null, bidOrder:[], bidIndex:-1, bids:[], highBid:null, winner:null,
    trump:null, hands:{north:[],south:[],east:[],west:[]}, handOrder:{}, kitty:[], discards:[],
    seats:{north:null,south:null,east:null,west:null}, watchers:[], scores:{team1:0,team2:0}
  });

  let state = fresh();
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved?.tableId) state = {...fresh(), ...saved, version:'3.1'};
  } catch {}

  const snap = () => JSON.parse(JSON.stringify(state));
  function emit() {
    sessionStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('pedro:state', {detail:snap()}));
  }
  function reset(table={}) {
    state = fresh();
    state.tableId = table.id || table.name || `local-${Date.now()}`;
    state.tableName = table.name || 'Pedro Table';
    emit();
  }
  function setTable(table={}) {
    const id = table.id || table.name;
    if (!state.tableId || (id && state.tableId !== id)) reset(table);
    else { state.tableName = table.name || state.tableName; emit(); }
  }
  function seats(value) { state.seats = {...state.seats, ...value}; emit(); }
  function releasePlayer(name) {
    for (const seat of seatOrder) if (state.seats[seat] === name) state.seats[seat] = null;
    state.watchers = state.watchers.filter(item => item !== name);
    emit();
  }
  function enterWatcher(name) {
    if (!name || Object.values(state.seats).includes(name) || state.watchers.includes(name)) return;
    state.watchers.push(name); emit();
  }
  function takeSeat(seat,name) {
    if (!seatOrder.includes(seat) || !name) return false;
    for (const key of seatOrder) if (state.seats[key] === name) state.seats[key] = null;
    if (state.seats[seat] && state.seats[seat] !== name) return false;
    state.seats[seat] = name;
    state.watchers = state.watchers.filter(item => item !== name);
    emit(); return true;
  }
  function deck() {
    const cards=[];
    for (const suit of suits) for (const rank of ranks) cards.push({id:`${suit}-${rank}`,suit,rank});
    for (let i=cards.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [cards[i],cards[j]]=[cards[j],cards[i]]; }
    return cards;
  }
  function deal() {
    const cards=deck(); state.hands={north:[],south:[],east:[],west:[]}; state.handOrder={};
    for(let round=0;round<9;round++) for(const seat of seatOrder) state.hands[seat].push(cards.shift());
    state.kitty=cards; state.phase='bidding'; state.bids=[]; state.highBid=null; state.winner=null; state.trump=null;
    const dealerIndex=seatOrder.indexOf(state.dealer);
    state.bidOrder=[1,2,3,4].map(offset=>seatOrder[(dealerIndex+offset)%4]);
    state.bidIndex=0; state.currentBidder=state.bidOrder[0]; emit();
  }
  function allowed(seat) {
    if(state.phase!=='bidding'||seat!==state.currentBidder)return[];
    const dealerLast=seat===state.dealer&&state.bidIndex===state.bidOrder.length-1;
    if(dealerLast&&!state.highBid)return[6,'14/28'];
    const high=Number(state.highBid?.amount||6), values=[];
    for(let bid=Math.max(7,high+1);bid<=14;bid++)values.push(bid);
    if(high<14)values.push('14/28');
    return values;
  }
  function bid(seat,value) {
    if(seat!==state.currentBidder)return{ok:false,message:'It is not this player’s turn.'};
    const pass=value==='pass';
    const dealerLast=seat===state.dealer&&state.bidIndex===state.bidOrder.length-1;
    if(pass&&dealerLast&&!state.highBid)return{ok:false,message:'Dealer is forced to bid 6 or 14/28.'};
    const normalized=value==='14/28'?14:Number(value);
    if(!pass&&!allowed(seat).some(item=>item===value||Number(item)===normalized))return{ok:false,message:'That bid is not allowed.'};
    const player=state.seats[seat]||seat;
    state.bids.push({seat,player,amount:pass?'PASS':value,contract:value==='14/28'?'14/28':normalized});
    if(!pass)state.highBid={seat,amount:value,contract:value==='14/28'?'14/28':normalized};
    state.bidIndex++;
    if(state.bidIndex>=state.bidOrder.length){
      if(!state.highBid)state.highBid={seat:state.dealer,amount:6,contract:6};
      state.winner=state.highBid.seat; state.currentBidder=null; state.phase='trump';
    } else state.currentBidder=state.bidOrder[state.bidIndex];
    emit(); return{ok:true};
  }
  function trump(suit){if(state.phase!=='trump')return false;state.trump=suit;state.phase='dealer-discard';state.hands[state.dealer]=state.hands[state.dealer].concat(state.kitty);state.kitty=[];emit();return true}
  function reorderHand(seat, orderedIds){
    if(!state.hands[seat])return;
    const lookup=new Map(state.hands[seat].map(card=>[card.id,card]));
    const ordered=orderedIds.map(id=>lookup.get(id)).filter(Boolean);
    state.hands[seat].forEach(card=>{if(!orderedIds.includes(card.id))ordered.push(card)});
    state.hands[seat]=ordered; emit();
  }
  function discard(ids){const hand=state.hands[state.dealer],need=hand.length-6;if(ids.length!==need)return{ok:false,message:`Select exactly ${need} cards.`};const selected=new Set(ids);state.discards=hand.filter(card=>selected.has(card.id));state.hands[state.dealer]=hand.filter(card=>!selected.has(card.id));state.phase='playing';emit();return{ok:true}}
  function nextDealer(){state.dealer=seatOrder[(seatOrder.indexOf(state.dealer)+1)%4];emit()}
  function score(contract,madeAll){return contract==='14/28'?(madeAll?28:-14):(madeAll?Number(contract):-Number(contract))}

  window.PedroGameState={version:'3.1',snap,reset,setTable,seats,releasePlayer,enterWatcher,takeSeat,deal,allowed,bid,trump,reorderHand,discard,nextDealer,score};
})();
