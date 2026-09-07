window.PEDRO_CONFIG={supabaseUrl:"https://rjezpgaawtufrxxnibxf.supabase.co",supabaseAnonKey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"};
(()=>{let libraryPromise=null,roleRefreshTimer=null;
function applyTableBranding(){if(document.querySelector('#pedro-table-branding'))return;const style=document.createElement('style');style.id='pedro-table-branding';style.textContent=`
.professional-table .table-watermark{position:absolute!important;left:50%!important;top:46%!important;width:clamp(430px,52%,760px)!important;height:clamp(180px,39%,360px)!important;transform:translate(-50%,-50%)!important;display:block!important;overflow:hidden!important;font-size:0!important;line-height:0!important;color:transparent!important;text-shadow:none!important;background-image:url('assets/logo/pedro_logo.png')!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;opacity:.14!important;filter:grayscale(1) sepia(.62) saturate(.72) contrast(1.1)!important;mix-blend-mode:soft-light!important;pointer-events:none!important;user-select:none!important;z-index:1!important}
.professional-table::before{background:linear-gradient(90deg,rgba(116,25,22,.075) 0%,transparent 34%,transparent 66%,rgba(18,71,106,.075) 100%),radial-gradient(ellipse at 50% 2%,rgba(255,255,255,.065),transparent 31%),repeating-linear-gradient(22deg,rgba(255,255,255,.011) 0 1px,transparent 1px 5px)!important}
.professional-table .team-one-seat .seat-avatar,.professional-table .team-one-seat.occupied .seat-avatar,.professional-table .team-one-seat.selected .seat-avatar{background:linear-gradient(145deg,#a3322a,#591a16)!important;border-color:#e95a4f!important;color:#fff6ed!important;box-shadow:0 0 0 3px rgba(137,34,28,.58),0 7px 17px rgba(0,0,0,.5)!important}
.professional-table .team-one-seat .seat-label,.professional-table .team-one-seat.occupied .seat-label{border:1px solid rgba(213,75,63,.62)!important;border-left:4px solid #dc493d!important;background:linear-gradient(90deg,rgba(91,27,23,.97),rgba(6,14,15,.96) 74%)!important}
.professional-table .team-two-seat .seat-avatar,.professional-table .team-two-seat.occupied .seat-avatar,.professional-table .team-two-seat.selected .seat-avatar{background:linear-gradient(145deg,#1e6e96,#103b53)!important;border-color:#4eb1de!important;color:#f4fbff!important;box-shadow:0 0 0 3px rgba(19,86,120,.58),0 7px 17px rgba(0,0,0,.5)!important}
.professional-table .team-two-seat .seat-label,.professional-table .team-two-seat.occupied .seat-label{border:1px solid rgba(47,147,190,.62)!important;border-left:4px solid #2f96c3!important;background:linear-gradient(90deg,rgba(13,61,84,.97),rgba(6,14,15,.96) 74%)!important}
.professional-table .table-seat-button.selected .seat-avatar{outline:3px solid #efb746!important;outline-offset:3px!important}
.professional-table .team-one-seat.selected .seat-avatar,.professional-table .team-one-seat.selected .seat-label{box-shadow:0 0 0 2px #efb746,0 0 24px rgba(222,77,61,.72)!important}
.professional-table .team-two-seat.selected .seat-avatar,.professional-table .team-two-seat.selected .seat-label{box-shadow:0 0 0 2px #efb746,0 0 24px rgba(53,159,209,.72)!important}
.professional-table .team-one-seat .seat-label b{color:#ffd0ca!important}.professional-table .team-two-seat .seat-label b{color:#c9ecff!important}.professional-table .seat-label{min-width:92px!important;padding:7px 10px!important}.professional-table .seat-label small{font-size:8px!important;letter-spacing:.025em!important}
@media(max-width:1000px){.professional-table .table-watermark{width:56%!important;opacity:.12!important}}
`;document.head.appendChild(style)}
function loadLibrary(){if(window.supabase?.createClient)return Promise.resolve();if(libraryPromise)return libraryPromise;libraryPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});return libraryPromise}
async function getClient(){await loadLibrary();if(window.pedroSupabase)return window.pedroSupabase;window.pedroSupabase=window.supabase.createClient(PEDRO_CONFIG.supabaseUrl,PEDRO_CONFIG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return window.pedroSupabase}
function profileNav(){return[...document.querySelectorAll('.nav-button')].find(e=>e.textContent.trim().toLowerCase()==='profile')}
function removeAdmin(){document.querySelector('#nav-admin-link')?.remove()}
function addAdmin(){if(document.querySelector('#nav-admin-link'))return true;const p=profileNav();if(!p)return false;const a=document.createElement('a');a.id='nav-admin-link';a.className='nav-button';a.href='admin.html';a.textContent='Administration';a.style.cssText='display:flex;align-items:center;text-decoration:none';p.insertAdjacentElement('afterend',a);return true}
async function refreshRole(){clearTimeout(roleRefreshTimer);try{const c=await getClient();const{data:s,error:se}=await c.auth.getSession();if(se)throw se;if(!s.session?.user){removeAdmin();return}const{data,error}=await c.schema('pedro').rpc('is_admin');if(error)throw error;if(data===true){if(!addAdmin())roleRefreshTimer=setTimeout(refreshRole,250)}else removeAdmin()}catch(e){removeAdmin();console.error('Pedro Admin navigation failed:',e)}}

function applyProfileDashboardStyles(){if(document.querySelector('#pedro-profile-dashboard-styles'))return;const style=document.createElement('style');style.id='pedro-profile-dashboard-styles';style.textContent=`
.profile-dashboard{display:grid;gap:16px}.profile-account-grid{display:grid;grid-template-columns:260px 1fr;gap:16px}.profile-summary-card,.profile-edit-card,.profile-stats-card,.profile-history-card{border:1px solid var(--line);border-radius:13px;background:linear-gradient(145deg,var(--surface2,#111c20),#080e10);box-shadow:0 18px 50px #0007}.profile-summary-card{padding:28px;text-align:center}.profile-dashboard-avatar{width:96px;height:96px;margin:auto;border:3px solid var(--gold,#d9aa4d);border-radius:50%;display:grid;place-items:center;background:#17445c;color:white;font-size:27px;font-weight:900}.profile-summary-card h2{margin:14px 0 5px;font:700 24px Georgia}.profile-email-line{color:var(--muted,#92a0a3);font-size:12px}.profile-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px;text-align:left}.profile-meta>div{padding:10px;border:1px solid var(--line);border-radius:7px;background:#081012}.profile-meta span,.profile-meta b{display:block}.profile-meta span{color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.12em}.profile-meta b{margin-top:4px;color:var(--gold2,#f0d38a);font-size:11px}.profile-role{display:inline-flex;margin-top:13px;padding:6px 11px;border:1px solid #6e5a2d;border-radius:20px;color:var(--gold2);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.profile-edit-card{padding:26px}.profile-card-heading p,.profile-section-heading p{margin:0 0 6px;color:var(--gold2,#f0d38a);font-size:9px;font-weight:900;letter-spacing:.18em}.profile-card-heading h2,.profile-section-heading h2{margin:0;font:700 24px Georgia}.profile-edit-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}.profile-edit-form label{display:grid;gap:7px;color:#d4d0c7;font-size:11px}.profile-edit-form label:first-child{grid-column:1/-1}.profile-edit-form input{min-height:43px;padding:9px 11px;border:1px solid var(--line);border-radius:7px;background:#eef3fb;color:#111}.profile-edit-form input[readonly]{background:#aeb8c4;color:#293239}.profile-form-actions{grid-column:1/-1;display:flex;gap:9px;flex-wrap:wrap}.profile-form-actions button{min-height:41px;padding:0 14px;border-radius:7px;font-weight:800}.profile-save-button{border:1px solid #b63d33;background:linear-gradient(#ba3a30,#87231d);color:white}.profile-secondary-button{border:1px solid var(--line);background:#10191c;color:white}.profile-status{grid-column:1/-1;min-height:16px;margin:0;font-size:11px}.profile-status.success{color:#76d99a}.profile-status.error{color:#ff827a}.profile-stats-card,.profile-history-card{padding:22px}.profile-section-heading{display:flex;align-items:end;justify-content:space-between}.profile-stats-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:16px}.profile-stat{padding:15px 12px;border:1px solid var(--line);border-radius:8px;background:#081012}.profile-stat span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.profile-stat b{display:block;margin-top:6px;color:var(--gold2);font:700 24px Georgia}.profile-history-wrap{margin-top:15px;overflow-x:auto;border:1px solid var(--line);border-radius:8px}.profile-history-table{width:100%;border-collapse:collapse;min-width:720px}.profile-history-table th,.profile-history-table td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left}.profile-history-table th{background:#081012;color:#849296;font-size:9px;letter-spacing:.12em}.profile-history-table td{font-size:11px}.result-win{color:#76d99a;font-weight:900}.result-loss{color:#ff827a;font-weight:900}.profile-empty{padding:26px;text-align:center;color:var(--muted)}@media(max-width:1000px){.profile-account-grid{grid-template-columns:1fr}.profile-stats-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){.profile-edit-form{grid-template-columns:1fr}.profile-edit-form label:first-child{grid-column:auto}.profile-form-actions{grid-column:auto}.profile-stats-grid{grid-template-columns:repeat(2,1fr)}}
`;document.head.appendChild(style)}
function profileInitials(value='P'){return String(value).split(/\s|@/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'P'}
function profileDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString()}
function profilePercent(wins,games){return games?`${((wins/games)*100).toFixed(1)}%`:'0.0%'}
function profileStatus(message,type=''){const e=document.querySelector('#profile-dashboard-status');if(!e)return;e.textContent=message;e.className=`profile-status ${type}`}
async function ensureProfileDashboard(){
  const original=document.querySelector('#screen-profile');if(!original||original.dataset.dashboardReady==='true')return;
  original.dataset.dashboardReady='true';applyProfileDashboardStyles();
  original.innerHTML=`<div class="profile-dashboard"><div class="profile-account-grid"><section class="profile-summary-card"><div id="profile-dashboard-avatar" class="profile-dashboard-avatar">P</div><h2 id="profile-dashboard-name">Pedro Player</h2><div id="profile-dashboard-email" class="profile-email-line"></div><span id="profile-dashboard-role" class="profile-role">User</span><div class="profile-meta"><div><span>Member Since</span><b id="profile-dashboard-member">—</b></div><div><span>Last Updated</span><b id="profile-dashboard-updated">—</b></div></div></section><section class="profile-edit-card"><div class="profile-card-heading"><p>ACCOUNT INFORMATION</p><h2>Edit Profile</h2></div><div class="profile-edit-form"><label>Display name<input id="profile-dashboard-display-name" type="text" maxlength="40"></label><label>Email address<input id="profile-dashboard-email-readonly" type="email" readonly></label><label>Role<input id="profile-dashboard-role-readonly" type="text" readonly></label><div class="profile-form-actions"><button id="profile-dashboard-save" class="profile-save-button" type="button">SAVE CHANGES</button><button id="profile-dashboard-password" class="profile-secondary-button" type="button">SEND PASSWORD RESET</button></div><p id="profile-dashboard-status" class="profile-status"></p></div></section></div><section class="profile-stats-card"><div class="profile-section-heading"><div><p>PLAYER STATISTICS</p><h2>Career Summary</h2></div></div><div class="profile-stats-grid"><div class="profile-stat"><span>Games Played</span><b id="stat-games">0</b></div><div class="profile-stat"><span>Wins</span><b id="stat-wins">0</b></div><div class="profile-stat"><span>Losses</span><b id="stat-losses">0</b></div><div class="profile-stat"><span>Win Rate</span><b id="stat-rate">0.0%</b></div><div class="profile-stat"><span>Points For</span><b id="stat-for">0</b></div><div class="profile-stat"><span>Points Against</span><b id="stat-against">0</b></div></div></section><section class="profile-history-card"><div class="profile-section-heading"><div><p>MATCH HISTORY</p><h2>Recent Games</h2></div><button id="profile-dashboard-refresh" class="profile-secondary-button" type="button">REFRESH</button></div><div id="profile-history-content" class="profile-empty">No completed games yet.</div></section></div>`;
  document.querySelector('#profile-dashboard-save').addEventListener('click',saveProfileDashboard);
  document.querySelector('#profile-dashboard-password').addEventListener('click',sendProfilePasswordReset);
  document.querySelector('#profile-dashboard-refresh').addEventListener('click',loadProfileDashboard);
}
async function loadProfileDashboard(){
  await ensureProfileDashboard();const client=await getClient();const {data:{session}}=await client.auth.getSession();if(!session)return;
  const {data:profile,error}=await client.schema('pedro').from('profiles').select('id,email,display_name,role,created_at,updated_at').eq('id',session.user.id).maybeSingle();
  if(error){profileStatus(error.message,'error');return}
  const row=profile||{id:session.user.id,email:session.user.email,display_name:session.user.email?.split('@')[0],role:'user'};window.pedroCurrentProfile=row;
  const name=row.display_name||row.email?.split('@')[0]||'Pedro Player';document.querySelector('#profile-dashboard-avatar').textContent=profileInitials(name);document.querySelector('#profile-dashboard-name').textContent=name;document.querySelector('#profile-dashboard-email').textContent=row.email||session.user.email||'';document.querySelector('#profile-dashboard-role').textContent=row.role==='admin'?'Administrator':'User';document.querySelector('#profile-dashboard-member').textContent=profileDate(row.created_at);document.querySelector('#profile-dashboard-updated').textContent=profileDate(row.updated_at);document.querySelector('#profile-dashboard-display-name').value=name;document.querySelector('#profile-dashboard-email-readonly').value=row.email||session.user.email||'';document.querySelector('#profile-dashboard-role-readonly').value=row.role==='admin'?'Administrator':'User';
  const {data:games,error:gamesError}=await client.schema('pedro').from('game_history').select('id,played_at,result,partner_name,opponents,score_for,score_against,table_name').eq('player_id',session.user.id).order('played_at',{ascending:false}).limit(20);
  if(gamesError){if(gamesError.code==='42P01'){renderProfileGames([]);return}profileStatus(gamesError.message,'error');return}renderProfileGames(games||[]);
}
function renderProfileGames(games){const wins=games.filter(g=>g.result==='win').length,losses=games.filter(g=>g.result==='loss').length,pointsFor=games.reduce((t,g)=>t+Number(g.score_for||0),0),pointsAgainst=games.reduce((t,g)=>t+Number(g.score_against||0),0);document.querySelector('#stat-games').textContent=games.length;document.querySelector('#stat-wins').textContent=wins;document.querySelector('#stat-losses').textContent=losses;document.querySelector('#stat-rate').textContent=profilePercent(wins,games.length);document.querySelector('#stat-for').textContent=pointsFor;document.querySelector('#stat-against').textContent=pointsAgainst;const target=document.querySelector('#profile-history-content');if(!games.length){target.className='profile-empty';target.textContent='No completed games yet.';return}target.className='profile-history-wrap';target.innerHTML=`<table class="profile-history-table"><thead><tr><th>Date</th><th>Table</th><th>Partner</th><th>Opponents</th><th>Result</th><th>Score</th></tr></thead><tbody>${games.map(g=>`<tr><td>${profileDate(g.played_at)}</td><td>${g.table_name||'Pedro Table'}</td><td>${g.partner_name||'—'}</td><td>${g.opponents||'—'}</td><td class="${g.result==='win'?'result-win':'result-loss'}">${String(g.result||'—').toUpperCase()}</td><td>${g.score_for??0} – ${g.score_against??0}</td></tr>`).join('')}</tbody></table>`}
async function saveProfileDashboard(){const client=await getClient(),profile=window.pedroCurrentProfile;if(!profile)return;const name=document.querySelector('#profile-dashboard-display-name').value.trim();if(!name){profileStatus('Enter a display name.','error');return}const {error}=await client.schema('pedro').from('profiles').update({display_name:name,updated_at:new Date().toISOString()}).eq('id',profile.id);if(error){profileStatus(error.message,'error');return}profileStatus('Profile updated.','success');window.pedroCurrentProfile.display_name=name;document.querySelector('#profile-dashboard-name').textContent=name;document.querySelector('#profile-dashboard-avatar').textContent=profileInitials(name);document.querySelector('#user-name')&&(document.querySelector('#user-name').textContent=name);document.querySelector('#user-initials')&&(document.querySelector('#user-initials').textContent=profileInitials(name))}
async function sendProfilePasswordReset(){const client=await getClient();const email=document.querySelector('#profile-dashboard-email-readonly').value;if(!email)return;const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});profileStatus(error?error.message:'Password-reset email sent. Check the inbox.',error?'error':'success')}
function watchProfileNavigation(){document.addEventListener('click',event=>{const target=event.target.closest('[data-screen="profile"],#nav-profile');if(target)setTimeout(loadProfileDashboard,0)},true)}


function applyCreateTableCleanup(){
  if(document.querySelector('#pedro-create-table-cleanup'))return;
  const style=document.createElement('style');
  style.id='pedro-create-table-cleanup';
  style.textContent=`
    #screen-create [hidden],
    #room-code-field[hidden],
    #custom-score-field[hidden]{display:none!important}
    #screen-create .form-panel{max-width:760px!important;padding:25px 30px!important}
    #screen-create .form-panel>h2{margin:3px 0 5px!important;font-size:27px!important}
    #screen-create .form-panel>.muted{margin:0 0 16px!important;font-size:12px!important}
    #screen-create .form-panel>label{margin:13px 0!important;gap:6px!important}
    #screen-create .form-panel fieldset{margin:15px 0!important}
    #screen-create .form-panel legend{margin-bottom:7px!important}
    #screen-create .choice-grid{gap:9px!important}
    #screen-create .choice{padding:11px 13px!important}
    #screen-create .choice small{margin-top:3px!important}
    #screen-create .form-panel input,
    #screen-create .form-panel select{min-height:42px!important}
    #screen-create .code-line{grid-template-columns:minmax(0,1fr) auto!important}
    #screen-create .code-line button{min-height:42px!important}
    #screen-create .toggle-line{margin-top:15px!important;padding:13px 0!important}
    #screen-create .form-actions{margin-top:18px!important}
    #screen-create .form-actions button{min-height:41px!important}
    @media(max-width:650px){
      #screen-create .form-panel{padding:20px 16px!important}
      #screen-create .choice-grid{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(style);

  const createScreen=document.querySelector('#screen-create');
  if(!createScreen)return;
  const publicChoice=createScreen.querySelector('[data-visibility="public"]');
  const privateChoice=createScreen.querySelector('[data-visibility="private"]');
  const roomCodeField=document.querySelector('#room-code-field');
  const scoreSelect=document.querySelector('#winning-score');
  const customScoreField=document.querySelector('#custom-score-field');

  function setVisibility(type,triggerExisting=true){
    const isPrivate=type==='private';
    publicChoice?.classList.toggle('selected',!isPrivate);
    privateChoice?.classList.toggle('selected',isPrivate);
    if(roomCodeField)roomCodeField.hidden=!isPrivate;
    if(triggerExisting){
      const target=isPrivate?privateChoice:publicChoice;
      if(target&&!target.dataset.visibilityCleanupDispatch){
        target.dataset.visibilityCleanupDispatch='1';
        target.click();
        delete target.dataset.visibilityCleanupDispatch;
      }
    }
  }

  function syncCustomScore(){
    if(customScoreField)customScoreField.hidden=scoreSelect?.value!=='custom';
  }

  publicChoice?.addEventListener('click',()=>setVisibility('public',false));
  privateChoice?.addEventListener('click',()=>setVisibility('private',false));
  scoreSelect?.addEventListener('change',syncCustomScore);

  setTimeout(()=>{
    setVisibility('public',true);
    if(scoreSelect&&scoreSelect.value==='custom')scoreSelect.value='52';
    syncCustomScore();
  },0);

  document.addEventListener('click',event=>{
    const openCreate=event.target.closest('[data-screen="create"]');
    if(!openCreate)return;
    setTimeout(()=>{
      setVisibility('public',true);
      if(scoreSelect)scoreSelect.value='52';
      syncCustomScore();
    },0);
  },true);
}


const PEDRO_PUBLIC_TABLES={rows:[],loaded:false};
function publicTableStatus(message,type=''){let e=document.querySelector('#live-table-status');if(!e){e=document.createElement('p');e.id='live-table-status';e.style.cssText='margin:8px 4px;color:#92a0a3;font-size:11px';const list=document.querySelector('#table-rows')?.parentElement;list?.insertAdjacentElement('beforebegin',e)}if(e){e.textContent=message;e.style.color=type==='error'?'#ff827a':type==='success'?'#76d99a':'#92a0a3'}}
function normalizeTable(row){return{id:row.id,name:row.table_name||'Pedro Table',host:row.host_display_name||row.host_email||'Pedro Player',rule:row.play_style==='cut'?'Cut-Throat':'Follow Suit',score:Number(row.winning_score||52),players:`${Number(row.player_count||0)} / 4`,visibility:row.visibility||'public',room:row.room_code||'',created_at:row.created_at}}
function renderLivePublicTables(){const body=document.querySelector('#table-rows');if(!body)return;const rows=PEDRO_PUBLIC_TABLES.rows.map(normalizeTable);body.innerHTML=rows.map((t,i)=>`<div class="table-row" data-live-table-row="${t.id}"><div><b>${t.name}</b><small>${t.players==='4 / 4'?'Spectators allowed':'Seat available'}</small></div><span>${t.host}</span><span><i class="rule-pill">${t.rule}</i></span><span>${t.score}</span><span>${t.players}</span><button class="${t.players==='4 / 4'?'secondary':'join-button'}" data-live-table-index="${i}">${t.players==='4 / 4'?'WATCH':'JOIN'}</button></div>`).join('');const empty=document.querySelector('#empty-tables');if(empty)empty.hidden=rows.length>0;document.querySelectorAll('[data-live-table-index]').forEach(button=>button.addEventListener('click',()=>{const table=rows[Number(button.dataset.liveTableIndex)];if(window.pedroGame?.open)window.pedroGame.open(table,table.players==='4 / 4'?'watch':'join')}));publicTableStatus(rows.length?`${rows.length} live public table${rows.length===1?'':'s'}.`:'No public tables are open.')}
async function loadLivePublicTables(){try{const client=await getClient();publicTableStatus('Loading public tables...');const{data,error}=await client.schema('pedro').from('public_tables').select('id,table_name,host_id,host_email,host_display_name,visibility,room_code,play_style,winning_score,lead_trump,player_count,status,created_at,updated_at').eq('visibility','public').eq('status','open').order('created_at',{ascending:false});if(error)throw error;PEDRO_PUBLIC_TABLES.rows=data||[];PEDRO_PUBLIC_TABLES.loaded=true;renderLivePublicTables()}catch(error){publicTableStatus(error.message,'error');console.error('Public table load failed:',error)}}
async function saveCreatedPublicTable(){const createForm=document.querySelector('#create-table-form');if(!createForm)return;const publicChoice=document.querySelector('[data-visibility="public"]');if(!publicChoice?.classList.contains('selected'))return;try{const client=await getClient();const{data:{session}}=await client.auth.getSession();if(!session)return;const tableName=document.querySelector('#table-name')?.value.trim()||'Pedro Table';const scoreSelect=document.querySelector('#winning-score');const winningScore=scoreSelect?.value==='custom'?Number(document.querySelector('#custom-score')?.value||52):Number(scoreSelect?.value||52);const selectedRule=document.querySelector('[data-rule].selected')?.dataset.rule||'follow';const displayName=document.querySelector('#user-name')?.textContent.trim()||session.user.email?.split('@')[0]||'Pedro Player';const payload={table_name:tableName,host_id:session.user.id,host_email:session.user.email,host_display_name:displayName,visibility:'public',room_code:null,play_style:selectedRule,winning_score:winningScore,lead_trump:Boolean(document.querySelector('#lead-trump')?.checked),player_count:1,status:'open',updated_at:new Date().toISOString()};const{data,error}=await client.schema('pedro').from('public_tables').insert(payload).select().single();if(error)throw error;if(data){PEDRO_PUBLIC_TABLES.rows=[data,...PEDRO_PUBLIC_TABLES.rows.filter(row=>row.id!==data.id)];publicTableStatus(`${tableName} was added to Public Tables.`,'success')}}catch(error){publicTableStatus(error.message,'error');console.error('Public table save failed:',error)}}
function installPublicTableSync(){const form=document.querySelector('#create-table-form');if(form&&!form.dataset.publicSync){form.dataset.publicSync='true';form.addEventListener('submit',()=>{setTimeout(saveCreatedPublicTable,0)},true)}const refresh=document.querySelector('#refresh-tables');if(refresh&&!refresh.dataset.liveSync){refresh.dataset.liveSync='true';refresh.addEventListener('click',event=>{event.stopImmediatePropagation();loadLivePublicTables()},true)}document.addEventListener('click',event=>{const lobby=event.target.closest('[data-screen="lobby"],#leave-table,#game-home');if(lobby)setTimeout(loadLivePublicTables,60)},true);loadLivePublicTables()}

async function start(){applyTableBranding();await ensureProfileDashboard();watchProfileNavigation();applyCreateTableCleanup();installPublicTableSync();await refreshRole();const c=await getClient();c.auth.onAuthStateChange(()=>{roleRefreshTimer=setTimeout(refreshRole,50)});window.addEventListener('focus',refreshRole);window.pedroRefreshRoleNavigation=refreshRole}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()})();
