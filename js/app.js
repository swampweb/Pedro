const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const state = { visibility: "private", rule: "follow", selected: null, dragging: null };
const headings = { lobby: "Game Lobby", create: "Create Table", join: "Join Table", tournaments: "Tournaments", profile: "Player Profile" };
const cards = [
  { id:"h5", rank:"5", suit:"♥", label:"HIGH PEDRO", points:5, trump:true },
  { id:"d5", rank:"5", suit:"♦", label:"LOW PEDRO", points:5, trump:true },
  { id:"ha", rank:"A", suit:"♥", points:1, trump:true },
  { id:"hk", rank:"K", suit:"♥", trump:true },
  { id:"hq", rank:"Q", suit:"♥", trump:true },
  { id:"hj", rank:"J", suit:"♥", points:1, trump:true },
  { id:"h10", rank:"10", suit:"♥", points:1, trump:true },
  { id:"ca", rank:"A", suit:"♣", points:1 },
  { id:"ck", rank:"K", suit:"♣" }
];
let hand = [...cards];
let playedCount = 0;

function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2200); }
function activateView(id) { $$(".view").forEach(v => v.classList.remove("active")); $(id).classList.add("active"); window.scrollTo(0,0); }
function showScreen(name) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#screen-" + name).classList.add("active");
  $$(".nav-button").forEach(b => b.classList.toggle("active", b.dataset.screen === name));
  $("#page-heading").textContent = headings[name] || "Pedro Online";
}
function enterApp() { activateView("#app-view"); showScreen("lobby"); }

$("#login-form").addEventListener("submit", e => {
  e.preventDefault();
  const config = window.PEDRO_CONFIG || {};
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    toast("Supabase authentication is not connected yet.");
    return;
  }
  toast("Authentication setup is not active in this visual build.");
});
const createAccountButton = $("#create-account");
if (createAccountButton) createAccountButton.addEventListener("click", () => {
  toast("Account creation will be enabled with Supabase authentication.");
});
$("#sign-out").addEventListener("click", () => activateView("#login-view"));
$$('[data-screen]').forEach(b => b.addEventListener("click", () => showScreen(b.dataset.screen)));
$("#refresh-tables").addEventListener("click", () => toast("Table list refreshed"));

$$('[data-visibility]').forEach(b => b.addEventListener("click", () => {
  state.visibility = b.dataset.visibility;
  $$('[data-visibility]').forEach(x => x.classList.toggle("selected", x === b));
  $("#room-code-wrap").hidden = state.visibility !== "private";
}));
$$('[data-rule]').forEach(b => b.addEventListener("click", () => {
  state.rule = b.dataset.rule;
  $$('[data-rule]').forEach(x => x.classList.toggle("selected", x === b));
}));
function makeCode(){ return ["BAYOU","PEDRO","CAJUN","DELTA"][Math.floor(Math.random()*4)] + Math.floor(10+Math.random()*89); }
$("#new-code").addEventListener("click", () => $("#room-code").value = makeCode());
$("#create-table-form").addEventListener("submit", e => { e.preventDefault(); startGame(); });
$("#join-private").addEventListener("click", () => { if (!$("#join-code").value.trim()) return toast("Enter a private room code"); startGame(); });
$$(".play-demo").forEach(b => b.addEventListener("click", startGame));

function cardMarkup(card) {
  const red = card.suit === "♥" || card.suit === "♦";
  return `<button class="playing-card ${red ? "red" : "black"}" data-id="${card.id}" draggable="true"><span class="corner">${card.rank}<i>${card.suit}</i></span><strong>${card.suit}</strong>${card.label ? `<em>${card.label}</em>` : ""}${card.points ? `<b>${card.points} PT</b>` : ""}</button>`;
}
function renderHand(animate = false) {
  const area = $("#player-hand");
  area.innerHTML = hand.map((c,i) => `<div class="hand-card ${animate ? "dealt" : ""}" data-index="${i}" style="--i:${i};--r:${(i-(hand.length-1)/2)*2.2}deg">${cardMarkup(c)}</div>`).join("");
  $$(".hand-card", area).forEach(w => {
    const button = $(".playing-card", w);
    button.addEventListener("click", () => selectCard(button.dataset.id));
    button.addEventListener("dragstart", () => state.dragging = Number(w.dataset.index));
    w.addEventListener("dragover", e => e.preventDefault());
    w.addEventListener("drop", () => reorder(Number(w.dataset.index)));
  });
}
function renderOpponents() { $$(".opponent-hand").forEach(h => h.innerHTML = Array.from({length:Number(h.dataset.count)},(_,i)=>`<i class="card-back" style="--i:${i}"></i>`).join("")); }
function selectCard(id) { state.selected = state.selected === id ? null : id; $$(".playing-card").forEach(c => c.classList.toggle("selected", c.dataset.id === state.selected)); $("#play-card").disabled = !state.selected; const card=hand.find(c=>c.id===state.selected); $("#table-message").textContent = card ? `${card.rank}${card.suit} selected. Drag cards to change their order.` : "Drag cards to arrange your hand, or select a card to play."; }
function reorder(to) { if (state.dragging === null || state.dragging === to) return; const [moved] = hand.splice(state.dragging,1); hand.splice(to,0,moved); state.dragging=null; renderHand(); toast("Hand order updated"); }
function playSelected() { const index=hand.findIndex(c=>c.id===state.selected); if(index<0)return; const [card]=hand.splice(index,1); const holder=document.createElement("div"); holder.className=`played-card played-${Math.min(playedCount,3)}`; holder.innerHTML=cardMarkup(card); $("#trick-area").appendChild(holder); playedCount++; state.selected=null; renderHand(); $("#play-card").disabled=true; $("#table-message").textContent=`${card.rank}${card.suit} played to the trick.`; if(playedCount===4)setTimeout(clearTrick,1100); }
function clearTrick(){ $("#trick-area").classList.add("collecting"); setTimeout(()=>{ $("#trick-area").innerHTML=""; $("#trick-area").classList.remove("collecting"); playedCount=0; $("#table-message").textContent="Trick collected. Waiting for the next lead."; },650); }
function dealDemo(){ hand=[]; renderHand(); $("#trick-area").innerHTML=""; playedCount=0; $("#deal-deck").classList.add("show"); $("#table-message").textContent="Dealer is shuffling and dealing..."; setTimeout(()=>{ hand=[...cards]; renderHand(true); $("#deal-deck").classList.remove("show"); $("#table-message").textContent="Cards dealt. Drag cards to arrange your hand."; },800); }
function sortTrump(){ hand.sort((a,b)=>Number(Boolean(b.trump))-Number(Boolean(a.trump)) || b.points-a.points); renderHand(); toast("Trump cards moved together"); }
function startGame(){ $("#game-table-name").textContent=$("#table-name").value || "Bayou Good Times"; $("#game-room-code").textContent=$("#room-code").value || "BAYOU24"; $("#game-rule").textContent=state.rule==="follow"?"Follow Suit":"Cut-Throat"; hand=[...cards]; state.selected=null; playedCount=0; $("#trick-area").innerHTML=""; renderHand(true); renderOpponents(); activateView("#game-view"); }
$("#play-card").addEventListener("click", playSelected);
$("#deal-demo").addEventListener("click", dealDemo);
$("#sort-trump").addEventListener("click", sortTrump);
$("#leave-table").addEventListener("click", () => { activateView("#app-view"); showScreen("lobby"); });
$("#game-logo").addEventListener("click", () => { activateView("#app-view"); showScreen("lobby"); });
renderOpponents();
