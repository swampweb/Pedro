(() => {
  if (window.__pedroViewStateLoaded) return;
  window.__pedroViewStateLoaded = true;

  const KEY = 'pedro.active.view.v1';
  let restoring = false;

  function gameIsActive() {
    return document.querySelector('#game-view')?.classList.contains('active');
  }

  function rememberGame() {
    const title = document.querySelector('#game-table-name')?.textContent?.trim() || 'Pedro Table';
    const room = document.querySelector('#game-room-label')?.textContent?.trim() || '';
    sessionStorage.setItem(KEY, JSON.stringify({ view: 'game', title, room }));
  }

  function rememberLobby() {
    sessionStorage.setItem(KEY, JSON.stringify({ view: 'lobby' }));
  }

  function restoreView() {
    if (restoring) return;
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
    if (saved.view !== 'game' || !window.PedroGameState?.snap()?.tableId) return;

    const game = document.querySelector('#game-view');
    const app = document.querySelector('#app-view');
    if (!game || !app || game.classList.contains('active')) return;

    restoring = true;
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    game.classList.add('active');
    if (saved.title) document.querySelector('#game-table-name').textContent = saved.title;
    if (saved.room) document.querySelector('#game-room-label').textContent = saved.room;
    window.dispatchEvent(new CustomEvent('pedro:state', { detail: PedroGameState.snap() }));
    setTimeout(() => { restoring = false; }, 0);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-mod-live-table], [data-join-index], #start-game, #deal-cards')) {
      setTimeout(() => { if (gameIsActive()) rememberGame(); }, 80);
    }
    if (event.target.closest('#leave-table, #game-home')) rememberLobby();
  }, true);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (gameIsActive()) rememberGame();
    } else {
      setTimeout(restoreView, 60);
    }
  });
  window.addEventListener('blur', () => { if (gameIsActive()) rememberGame(); });
  window.addEventListener('focus', () => setTimeout(restoreView, 60));
  window.addEventListener('pageshow', () => setTimeout(restoreView, 60));

  setTimeout(restoreView, 150);
})();
