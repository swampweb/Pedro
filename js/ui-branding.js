(() => {
  if (window.__pedroBrandingLoaded) return;
  window.__pedroBrandingLoaded = true;
  const style = document.createElement('style');
  style.id = 'pedro-table-branding';
  style.textContent = `
    .professional-table .table-watermark{position:absolute!important;left:50%!important;top:46%!important;width:clamp(430px,52%,760px)!important;height:clamp(180px,39%,360px)!important;transform:translate(-50%,-50%)!important;display:block!important;font-size:0!important;color:transparent!important;background:url('assets/logo/pedro_logo.png') center/contain no-repeat!important;opacity:.14!important;filter:grayscale(1) sepia(.62) saturate(.72) contrast(1.1)!important;mix-blend-mode:soft-light!important;pointer-events:none!important;z-index:1!important}
    .professional-table .team-one-seat .seat-avatar,.professional-table .team-one-seat.occupied .seat-avatar,.professional-table .team-one-seat.selected .seat-avatar{background:linear-gradient(145deg,#a3322a,#591a16)!important;border-color:#e95a4f!important;color:#fff!important}
    .professional-table .team-two-seat .seat-avatar,.professional-table .team-two-seat.occupied .seat-avatar,.professional-table .team-two-seat.selected .seat-avatar{background:linear-gradient(145deg,#1e6e96,#103b53)!important;border-color:#4eb1de!important;color:#fff!important}
    .professional-table .table-seat-button.selected .seat-avatar{outline:3px solid #efb746!important;outline-offset:3px!important}
    .professional-table .team-one-seat.selected .seat-avatar,.professional-table .team-one-seat.selected .seat-label{box-shadow:0 0 0 2px #efb746,0 0 24px rgba(222,77,61,.72)!important}
    .professional-table .team-two-seat.selected .seat-avatar,.professional-table .team-two-seat.selected .seat-label{box-shadow:0 0 0 2px #efb746,0 0 24px rgba(53,159,209,.72)!important}
    @media(max-width:1000px){.professional-table .table-watermark{width:56%!important;opacity:.12!important}}
  `;
  document.head.appendChild(style);
})();
