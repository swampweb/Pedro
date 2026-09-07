(() => {
  if (window.__pedroSingleStateViewV4) return;
  window.__pedroSingleStateViewV4 = true;
  const KEY='pedro.active.view.v1';
  const isGame=()=>document.querySelector('#game-view')?.classList.contains('active');
  function saveGame(){sessionStorage.setItem(KEY,JSON.stringify({view:'game',title:document.querySelector('#game-table-name')?.textContent||'Pedro Table',room:document.querySelector('#game-room-label')?.textContent||''}))}
  function saveLobby(){sessionStorage.setItem(KEY,JSON.stringify({view:'lobby'}))}
  function restore(){let saved={};try{saved=JSON.parse(sessionStorage.getItem(KEY)||'{}')}catch{}if(saved.view!=='game'||!PedroGameState.snap().tableId)return;const game=document.querySelector('#game-view');if(!game||game.classList.contains('active'))return;document.querySelectorAll('.view').forEach(view=>view.classList.remove('active'));game.classList.add('active');if(saved.title)document.querySelector('#game-table-name').textContent=saved.title;if(saved.room)document.querySelector('#game-room-label').textContent=saved.room;window.dispatchEvent(new CustomEvent('pedro:state',{detail:PedroGameState.snap()}))}
  document.addEventListener('click',event=>{if(event.target.closest('[data-single-table],[data-mod-live-table],[data-join-index],#start-game,#deal-cards'))setTimeout(()=>{if(isGame())saveGame()},80);if(event.target.closest('#leave-table,#game-home'))saveLobby()},true);document.addEventListener('visibilitychange',()=>{if(document.hidden&&isGame())saveGame();else if(!document.hidden)setTimeout(restore,60)});window.addEventListener('focus',()=>setTimeout(restore,60));window.addEventListener('pageshow',()=>setTimeout(restore,60));setTimeout(restore,180)
})();
