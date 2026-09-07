const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const config=window.PEDRO_CONFIG||{};let sb=null;let visibility="private",rule="follow";
const demoTables=[{name:"Bayou Table 1",host:"PoppaT",rule:"Follow Suit",score:52,players:"3 / 4"},{name:"Cajun Crew",host:"Lafitte",rule:"Cut-Throat",score:104,players:"2 / 4"},{name:"Golden Meadow",host:"TroutMan",rule:"Follow Suit",score:52,players:"4 / 4"},{name:"Thibodaux Kings",host:"RedFish",rule:"Cut-Throat",score:52,players:"1 / 4"}];
const titles={lobby:"Game Lobby",create:"Create Table",join:"Join Table",tournaments:"Tournaments",profile:"Profile"};
function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function setStatus(m,t="info"){const e=$("#auth-status");e.textContent=m;e.style.color=t==="error"?"#ff827a":t==="success"?"#76d99a":"#d8b45b"}
function friendly(e){const m=String(e?.message||"Something went wrong.");if(/invalid login credentials/i.test(m))return"Incorrect email address or password.";if(/email not confirmed/i.test(m))return"Confirm the account from the email sent by Pedro, then sign in.";return m}
async function client(){if(sb)return sb;if(!window.supabase?.createClient){await new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=ok;s.onerror=no;document.head.appendChild(s)})}sb=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return sb}
function showView(id){$$('.view').forEach(v=>v.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0)}
function showScreen(name){$$('.screen').forEach(s=>s.classList.remove('active'));$('#screen-'+name).classList.add('active');$$('.nav-button[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));$('#page-title').textContent=titles[name]||'Pedro Online'}
function enterLobby(email="Pedro Player"){showView('#app-view');showScreen('lobby');const label=email.split('@')[0]||'Pedro Player';$('#user-name').textContent=label;$('#profile-email').textContent=email;const i=label.slice(0,2).toUpperCase();$('#user-initials').textContent=i;$('#profile-initials').textContent=i;renderTables()}
function renderTables(){const body=$('#table-rows');body.innerHTML=demoTables.map((t,i)=>`<div class="table-row"><div><b>${t.name}</b><small>${t.players==='4 / 4'?'Spectators allowed':'Seat available'}</small></div><span>${t.host}</span><span><i class="rule-pill">${t.rule}</i></span><span>${t.score}</span><span>${t.players}</span><button class="${t.players==='4 / 4'?'secondary':'join-button'}" data-join-index="${i}" data-entry-mode="${t.players==='4 / 4'?'watch':'join'}">${t.players==='4 / 4'?'WATCH':'JOIN'}</button></div>`).join('');$('#empty-tables').hidden=demoTables.length>0;$$('[data-join-index]').forEach(b=>b.addEventListener('click',()=>openGame(demoTables[Number(b.dataset.joinIndex)],b.dataset.entryMode)))}
function code(){return ['BAYOU','PEDRO','CAJUN','DELTA'][Math.floor(Math.random()*4)]+Math.floor(10+Math.random()*90)}
function openGame(t,mode='join'){window.pedroGame.open(t,mode)}
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();const email=$('#login-email').value.trim(),password=$('#login-password').value;if(!email||!password)return setStatus('Enter both email and password.','error');setStatus('Signing in...');try{const c=await client();const{error}=await c.auth.signInWithPassword({email,password});if(error)throw error;setStatus('Sign-in successful.','success');enterLobby(email)}catch(x){setStatus(friendly(x),'error')}});
$('#create-account').addEventListener('click',async()=>{const email=$('#login-email').value.trim(),password=$('#login-password').value;if(!email||!password)return setStatus('Enter an email and password first.','error');try{const c=await client();const{data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(data.session)enterLobby(email);else setStatus('Account created. Check email to confirm it, then sign in.','success')}catch(x){setStatus(friendly(x),'error')}});
$('#forgot-password').addEventListener('click',async()=>{const email=$('#login-email').value.trim();if(!email)return setStatus('Enter the account email first.','error');try{const c=await client();const{error}=await c.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;setStatus('Password-reset email sent.','success')}catch(x){setStatus(friendly(x),'error')}});
$('#sign-out').addEventListener('click',async()=>{try{(await client()).auth.signOut()}finally{showView('#login-view')}});
$$('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));
$$('[data-visibility]').forEach(b=>b.addEventListener('click',()=>{visibility=b.dataset.visibility;$$('[data-visibility]').forEach(x=>x.classList.toggle('selected',x===b));$('#room-code-field').hidden=visibility==='public'}));
$$('[data-rule]').forEach(b=>b.addEventListener('click',()=>{rule=b.dataset.rule;$$('[data-rule]').forEach(x=>x.classList.toggle('selected',x===b))}));
$('#winning-score').addEventListener('change',e=>$('#custom-score-field').hidden=e.target.value!=='custom');
$('#new-room-code').addEventListener('click',()=>$('#room-code').value=code());
$('#create-table-form').addEventListener('submit',e=>{e.preventDefault();const score=$('#winning-score').value==='custom'?Number($('#custom-score').value):Number($('#winning-score').value);if(!score||score<1)return toast('Enter a valid winning score');const t={name:$('#table-name').value.trim()||'Pedro Table',host:$('#user-name').textContent,rule:rule==='follow'?'Follow Suit':'Cut-Throat',score,players:'1 / 4',room:visibility==='private'?$('#room-code').value:''};if(visibility==='public')demoTables.unshift(t);openGame(t)});
$('#join-table-form').addEventListener('submit',e=>{e.preventDefault();const room=$('#join-room-code').value.trim().toUpperCase();if(!room)return toast('Enter a room code');openGame({name:'Private Pedro Table',rule:'Follow Suit',score:52,room})});
$('#refresh-tables').addEventListener('click',()=>{renderTables();toast('Tables refreshed')});
(async()=>{$('#room-code').value=code();renderTables();try{const c=await client();const{data}=await c.auth.getSession();if(data.session)enterLobby(data.session.user.email);c.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session)enterLobby(session.user.email);if(event==='SIGNED_OUT')showView('#login-view')})}catch(e){setStatus(friendly(e),'error')}})();


/* ===== Professional game room controller ===== */
window.pedroGame=(()=>{
  const seats={north:null,west:null,east:null,south:null};
  const watchers=[];
  let currentTable=null,currentUser='Pedro Player',selectedSeat=null,isWatcher=false,ready=false,phase='waiting',selectedCard=null,trump=null;
  let hand=[];
  const seatTeam={north:1,south:1,west:2,east:2};
  const sampleNames=['BayouBritt','JFergo','PelicanAce'];
  const deckRanks=['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
  const deckSuits=['♥','♦','♣','♠'];
  const pointsFor=(rank,suit)=>rank==='5'?5:['A','J','10','2'].includes(rank)?1:0;

  function name(){return $('#user-name')?.textContent||'Pedro Player'}
  function initials(n){return n.split(/\s|@/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'P'}
  function setPhase(value,label){phase=value;$('#phase-badge').textContent=label;$('#center-phase').textContent=label.replace('WAITING FOR PLAYERS','WAITING');$('#control-phase-label').textContent=label.replace('WAITING FOR PLAYERS','WAITING');$('#table-status').textContent=label.replace('WAITING FOR ','')}
  function setMessage(m){$('#table-message').textContent=m}
  function controls(id){['#host-game-buttons','#bid-controls','#trump-controls','#play-controls'].forEach(x=>$(x).classList.add('hidden'));if(id)$(id).classList.remove('hidden');$('#waiting-actions').classList.toggle('hidden',phase!=='waiting');$('#host-controls').classList.toggle('hidden',phase!=='waiting')}
  function render(){
    const count=Object.values(seats).filter(Boolean).length;
    $('#player-count').textContent=`${count} / 4`;$('#spectator-count').textContent=watchers.length;$('#watcher-count').textContent=watchers.length;
    $('#watcher-list').innerHTML=watchers.length?watchers.map(w=>`<div class="watcher-row"><span>${w}</span><b>Watching</b></div>`).join(''):'<p class="muted">No spectators</p>';
    $('#player-roster').innerHTML=Object.entries(seats).map(([seat,n])=>`<div class="roster-row"><span><i></i> ${seat[0].toUpperCase()+seat.slice(1)}</span><b>${n||'Open Slot'}</b></div>`).join('');
    $('#team1-names').textContent=`${seats.south||'Open'} + ${seats.north||'Open'}`;$('#team2-names').textContent=`${seats.west||'Open'} + ${seats.east||'Open'}`;$('#center-team1-names').textContent=$('#team1-names').textContent;$('#center-team2-names').textContent=$('#team2-names').textContent;$('#center-team1-score').textContent=$('#team1-score').textContent;$('#center-team2-score').textContent=$('#team2-score').textContent;
    Object.entries(seats).forEach(([seat,n])=>{
      const el=$(`[data-table-seat="${seat}"]`);el.classList.toggle('occupied',Boolean(n));$('.seat-avatar',el).textContent=n?initials(n):seat[0].toUpperCase();$('.seat-label b',el).textContent=n||'Open Slot';
      const backs=$('.opponent-cards',el);if(backs)backs.innerHTML=n&&phase!=='waiting'&&n!==currentUser?'<i class="mini-back"></i><i class="mini-back"></i><i class="mini-back"></i><i class="mini-back"></i>':'';
      el.classList.toggle('selected',selectedSeat===seat);const action=$('.seat-action',el);if(action)action.textContent=n?'SEATED':'SELECT SEAT';
    });
    $('#ready-button').disabled=!selectedSeat||isWatcher;$('#ready-button').textContent=ready?'READY ✓':'READY';$('#start-game').disabled=count<4||!ready;$('#deal-cards').disabled=count<4;
  }
  function chooseSeat(seat){
    if(phase!=='waiting')return;if(seats[seat]&&seats[seat]!==currentUser)return toast('That seat is occupied');
    Object.keys(seats).forEach(s=>{if(seats[s]===currentUser)seats[s]=null});
    const wi=watchers.indexOf(currentUser);if(wi>=0)watchers.splice(wi,1);isWatcher=false;seats[seat]=currentUser;selectedSeat=seat;ready=false;setMessage(`${seat[0].toUpperCase()+seat.slice(1)} seat selected. Mark ready when prepared.`);render();
  }
  function watch(){Object.keys(seats).forEach(s=>{if(seats[s]===currentUser)seats[s]=null});if(!watchers.includes(currentUser))watchers.push(currentUser);selectedSeat=null;isWatcher=true;ready=false;setMessage('You are watching this table.');render()}
  function fillDemo(){let i=0;Object.keys(seats).forEach(s=>{if(!seats[s]&&sampleNames[i])seats[s]=sampleNames[i++]});render();setMessage('All seats are filled. Players can now ready up.')}
  function start(){if(Object.values(seats).filter(Boolean).length<4)return toast('Four players are required');setPhase('ready','READY TO DEAL');controls('#host-game-buttons');$('#deck-stack').classList.remove('hidden');setMessage('All players are seated. Host may deal the first hand.');render()}
  function buildHand(){const shuffled=[];for(const suit of deckSuits)for(const rank of deckRanks)shuffled.push({id:`${suit}${rank}`,rank,suit,points:pointsFor(rank,suit)});shuffled.sort(()=>Math.random()-.5);return shuffled.slice(0,9)}
  function renderHand(animate=false){$('#player-hand').innerHTML=hand.map((c,i)=>`<button class="hand-card ${(c.suit==='♥'||c.suit==='♦')?'red':''} ${animate?'dealt':''}" draggable="true" data-card="${c.id}" data-index="${i}" style="--rotation:${(i-(hand.length-1)/2)*2.2}deg;--index:${i}"><span class="card-corner">${c.rank}<br>${c.suit}</span><span class="card-suit">${c.suit}</span>${c.points?`<span class="point-badge">${c.points} PT</span>`:''}</button>`).join('');
    $$('.hand-card').forEach(card=>{card.addEventListener('click',()=>selectCard(card.dataset.card));card.addEventListener('dragstart',()=>card.dataset.dragging='1');card.addEventListener('dragover',e=>e.preventDefault());card.addEventListener('drop',()=>{const from=$('.hand-card[data-dragging="1"]');if(!from)return;const [item]=hand.splice(Number(from.dataset.index),1);hand.splice(Number(card.dataset.index),0,item);renderHand()})})
  }
  function deal(){if(!selectedSeat)return toast('Choose a seat before dealing');setPhase('bidding','BIDDING');$('#deck-stack').classList.add('hidden');hand=buildHand();renderHand(true);controls('#bid-controls');setMessage('Cards dealt. Bid 7–14 or pass.');render()}
  function bid(value){if(value==='pass'){setMessage('You passed. Demo advances you as the next bidder.');return}$('#winning-bid').textContent=value;$('#center-bid').textContent=`Bid ${value}`;setPhase('trump','CHOOSE TRUMP');controls('#trump-controls');setMessage(`Bid ${value} accepted. Choose the trump suit.`)}
  function chooseTrump(suit){trump=suit;$('#trump-label').textContent=suit;$('#center-trump').textContent=`Trump ${suit}`;setPhase('playing','PLAYING');controls('#play-controls');setMessage(`${suit} are trump. Arrange your hand and select a card to play.`);render()}
  function selectCard(id){selectedCard=selectedCard===id?null:id;$$('.hand-card').forEach(c=>c.classList.toggle('selected',c.dataset.card===selectedCard));$('#play-selected').disabled=!selectedCard}
  function play(){const idx=hand.findIndex(c=>c.id===selectedCard);if(idx<0)return;const [card]=hand.splice(idx,1);const pos=$$('#trick-zone .played-card').length%4;const el=document.createElement('div');el.className=`played-card ${(card.suit==='♥'||card.suit==='♦')?'red':''} pos-${pos}`;el.textContent=`${card.rank}${card.suit}`;$('#trick-zone').appendChild(el);selectedCard=null;renderHand();$('#play-selected').disabled=true;setMessage(`${card.rank}${card.suit} played. Waiting for the next player.`);$('#trick-number').textContent=`${Math.min(6,Math.ceil((9-hand.length)/4))} / 6`}
  function sort(){const order=trump==='Hearts'?'♥':trump==='Diamonds'?'♦':trump==='Clubs'?'♣':'♠';hand.sort((a,b)=>(b.suit===order)-(a.suit===order)||b.points-a.points);renderHand();toast('Hand sorted')}
  function leave(){Object.keys(seats).forEach(s=>seats[s]=null);watchers.length=0;hand=[];$('#player-hand').innerHTML='';$('#trick-zone').innerHTML='<div class="table-watermark">PEDRO</div>';controls('#host-game-buttons');showView('#app-view');showScreen('lobby')}
  function open(t,entryMode='join'){currentTable=t;currentUser=name();Object.keys(seats).forEach(s=>seats[s]=null);watchers.length=0;selectedSeat=null;isWatcher=false;ready=false;hand=[];trump=null;$('#player-hand').innerHTML='';$('#trick-zone').innerHTML='<div class="table-watermark">PEDRO</div>';$('#game-table-name').textContent=t.name;$('#game-room-label').textContent=t.room?`Private Room · ${t.room}`:'Public Table';$('#table-host').textContent=currentUser;$('#table-visibility').textContent=t.room?'Private':'Public';$('#game-rule').textContent=t.rule;$('#game-winning-score').textContent=t.score;$('#score-goal').textContent=`Race to ${t.score}`;$('#center-score-goal').textContent=`Race to ${t.score}`;$('#center-bid').textContent='Bid —';$('#center-trump').textContent='Trump —';setPhase('waiting','WAITING FOR PLAYERS');controls('#host-game-buttons');setMessage('Select an open seat directly on the table, choose Random Seat, or Watch.');showView('#game-view');if(entryMode==='watch'){watch()}else{render()}}
  document.addEventListener('DOMContentLoaded',()=>{
    $$('[data-table-seat]').forEach(b=>b.addEventListener('click',()=>chooseSeat(b.dataset.tableSeat)));$('#random-seat').addEventListener('click',()=>{const open=Object.keys(seats).filter(s=>!seats[s]);if(!open.length)return toast('No open seats');chooseSeat(open[Math.floor(Math.random()*open.length)])});$('#watch-table').addEventListener('click',watch);$('#ready-button').addEventListener('click',()=>{ready=!ready;render();setMessage(ready?'You are ready. Waiting for the host.':'Ready status removed.')});$('#fill-demo-players').addEventListener('click',fillDemo);$('#start-game').addEventListener('click',start);$('#deal-cards').addEventListener('click',deal);$$('.bid-button').forEach(b=>b.addEventListener('click',()=>bid(b.dataset.bid)));$$('.suit-button').forEach(b=>b.addEventListener('click',()=>chooseTrump(b.dataset.suit)));$('#play-selected').addEventListener('click',play);$('#sort-hand').addEventListener('click',sort);$('#leave-table').addEventListener('click',leave);$('#game-home').addEventListener('click',leave)
  });
  return{open};
})();
