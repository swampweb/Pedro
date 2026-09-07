(async () => {
  if (window.__pedroAdminNavLoaded) return;
  window.__pedroAdminNavLoaded = true;

  function profileButton() {
    return [...document.querySelectorAll('.nav-button')]
      .find(item => item.textContent.trim().toLowerCase() === 'profile');
  }
  function remove() { document.querySelector('#nav-admin-link')?.remove(); }
  function add() {
    if (document.querySelector('#nav-admin-link')) return;
    const profile = profileButton();
    if (!profile) return;
    const link = document.createElement('a');
    link.id = 'nav-admin-link';
    link.className = 'nav-button';
    link.href = 'admin.html';
    link.textContent = 'Administration';
    link.style.cssText = 'display:flex;align-items:center;text-decoration:none';
    profile.insertAdjacentElement('afterend', link);
  }
  async function refresh() {
    try {
      const client = await PedroCore.getClient();
      const { data: session } = await client.auth.getSession();
      if (!session.session) return remove();
      const { data, error } = await client.schema('pedro').rpc('is_admin');
      if (error) throw error;
      data === true ? add() : remove();
    } catch (error) {
      remove();
      console.error('Pedro Admin navigation failed:', error);
    }
  }
  await refresh();
  const client = await PedroCore.getClient();
  client.auth.onAuthStateChange(() => setTimeout(refresh, 50));
  window.addEventListener('focus', refresh);
  window.pedroRefreshRoleNavigation = refresh;
})();
