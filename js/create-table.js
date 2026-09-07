(() => {
  if (window.__pedroCreateTableLoaded) return;
  window.__pedroCreateTableLoaded = true;
  const screen = document.querySelector('#screen-create');
  if (!screen) return;
  const publicButton = screen.querySelector('[data-visibility="public"]');
  const privateButton = screen.querySelector('[data-visibility="private"]');
  const roomCode = document.querySelector('#room-code-field');
  const winningScore = document.querySelector('#winning-score');
  const customScore = document.querySelector('#custom-score-field');

  function setVisibility(type) {
    const privateMode = type === 'private';
    publicButton?.classList.toggle('selected', !privateMode);
    privateButton?.classList.toggle('selected', privateMode);
    if (roomCode) roomCode.hidden = !privateMode;
  }
  function setScoreVisibility() {
    if (customScore) customScore.hidden = winningScore?.value !== 'custom';
  }
  function reset() {
    publicButton?.click();
    setVisibility('public');
    if (winningScore) winningScore.value = '52';
    setScoreVisibility();
  }
  publicButton?.addEventListener('click', () => setVisibility('public'));
  privateButton?.addEventListener('click', () => setVisibility('private'));
  winningScore?.addEventListener('change', setScoreVisibility);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-screen="create"]')) setTimeout(reset, 0);
  }, true);
  reset();
})();
