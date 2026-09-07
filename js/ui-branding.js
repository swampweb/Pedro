(() => {
  if (window.__pedroIdentityTeamLogoFix502) return;
  window.__pedroIdentityTeamLogoFix502 = true;

  const TEAM_ONE = new Set(['north', 'south']);
  const TEAM_TWO = new Set(['east', 'west']);
  let scheduled = false;

  function initials(value) {
    const name = String(value || '').trim();
    if (!name) return '';
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length > 1) return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    const capitals = name.match(/[A-Z]/g);
    if (capitals?.length >= 2) return capitals.slice(0, 2).join('');
    return name.slice(0, 2).toUpperCase();
  }

  function authoritativeSeats() {
    return window.PedroGameState?.snap?.().seats || {};
  }

  function applySeat(seatElement) {
    const seat = seatElement.dataset.tableSeat;
    if (!seat) return;

    const seatName = seatElement.querySelector('.seat-label b');
    const avatar = seatElement.querySelector('.seat-avatar');
    const stateName = authoritativeSeats()[seat];
    const profileName = window.PedroIdentity?.name?.() || '';

    if (stateName && seatName && seatName.textContent.trim() !== stateName) {
      seatName.textContent = stateName;
    } else if (profileName && seatName && seatName.textContent.trim() === 'Pedro Player') {
      seatName.textContent = profileName;
    }

    const displayedName = seatName?.textContent.trim() || stateName || '';
    if (avatar && displayedName && displayedName !== 'Open Slot') {
      avatar.textContent = initials(displayedName);
    }

    const teamOne = TEAM_ONE.has(seat);
    const teamTwo = TEAM_TWO.has(seat);
    seatElement.classList.toggle('pedro-team-one-seat', teamOne);
    seatElement.classList.toggle('pedro-team-two-seat', teamTwo);

    if (avatar) {
      if (teamOne) {
        avatar.style.setProperty('background', 'linear-gradient(145deg,#a7372f,#5e1b17)', 'important');
        avatar.style.setProperty('border-color', '#e76559', 'important');
        avatar.style.setProperty('color', '#fff8f1', 'important');
        avatar.style.setProperty('box-shadow', '0 0 0 3px rgba(143,39,32,.52),0 7px 17px rgba(0,0,0,.48)', 'important');
      } else if (teamTwo) {
        avatar.style.setProperty('background', 'linear-gradient(145deg,#1f7098,#103e57)', 'important');
        avatar.style.setProperty('border-color', '#57b8e1', 'important');
        avatar.style.setProperty('color', '#f5fbff', 'important');
        avatar.style.setProperty('box-shadow', '0 0 0 3px rgba(20,88,122,.52),0 7px 17px rgba(0,0,0,.48)', 'important');
      }
    }
  }

  function restoreWatermark() {
    const table = document.querySelector('.professional-table');
    if (!table) return;

    let watermark = table.querySelector('.table-watermark');
    if (!watermark) {
      watermark = document.createElement('div');
      watermark.className = 'table-watermark';
      table.prepend(watermark);
    }

    watermark.textContent = '';
    watermark.setAttribute('aria-hidden', 'true');
  }

  function applyAll() {
    scheduled = false;
    document.querySelectorAll('[data-table-seat]').forEach(applySeat);
    restoreWatermark();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyAll);
  }

  const style = document.createElement('style');
  style.id = 'pedro-identity-team-logo-fix-502';
  style.textContent = `
    .professional-table .table-watermark{
      position:absolute!important;
      left:50%!important;
      top:47%!important;
      width:clamp(420px,48%,700px)!important;
      height:clamp(170px,34%,300px)!important;
      transform:translate(-50%,-50%)!important;
      display:block!important;
      background-image:url('assets/logo/pedro_logo.png')!important;
      background-position:center!important;
      background-repeat:no-repeat!important;
      background-size:contain!important;
      opacity:.14!important;
      filter:grayscale(1) sepia(.55) saturate(.72) contrast(1.08)!important;
      mix-blend-mode:soft-light!important;
      color:transparent!important;
      font-size:0!important;
      line-height:0!important;
      text-shadow:none!important;
      pointer-events:none!important;
      user-select:none!important;
      z-index:1!important;
    }
    .professional-table .pedro-team-one-seat .seat-label{
      border-left-color:#df5046!important;
    }
    .professional-table .pedro-team-two-seat .seat-label{
      border-left-color:#3da2cf!important;
    }
    .professional-table [data-table-seat],
    .professional-table .seat-label,
    .professional-table .seat-avatar{
      z-index:20!important;
    }
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true
  });

  window.addEventListener('pedro:identity', scheduleApply);
  window.addEventListener('pedro:state', scheduleApply);
  window.addEventListener('focus', scheduleApply);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleApply();
  });

  [0, 100, 300, 700, 1500].forEach(delay => setTimeout(scheduleApply, delay));
})();
