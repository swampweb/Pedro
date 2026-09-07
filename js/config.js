/* Pedro public browser configuration and role-aware navigation.
   Browser-safe public anon key only. Never use service_role here. */
window.PEDRO_CONFIG = {
  supabaseUrl: "https://rjezpgaawtufrxxnibxf.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"
};

(() => {
  let libraryPromise = null;
  let roleRefreshTimer = null;

  function loadSupabaseLibrary() {
    if (window.supabase?.createClient) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load the Supabase browser library.'));
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  async function getSupabaseClient() {
    await loadSupabaseLibrary();
    if (window.pedroSupabase) return window.pedroSupabase;
    window.pedroSupabase = window.supabase.createClient(
      window.PEDRO_CONFIG.supabaseUrl,
      window.PEDRO_CONFIG.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
    return window.pedroSupabase;
  }

  function findProfileNavigation() {
    return [...document.querySelectorAll('.nav-button')]
      .find(element => element.textContent.trim().toLowerCase() === 'profile');
  }

  function removeAdministrationNavigation() {
    document.querySelector('#nav-admin-link')?.remove();
  }

  function addAdministrationNavigation() {
    if (document.querySelector('#nav-admin-link')) return true;
    const profileButton = findProfileNavigation();
    if (!profileButton) return false;

    const adminLink = document.createElement('a');
    adminLink.id = 'nav-admin-link';
    adminLink.className = 'nav-button';
    adminLink.href = 'admin.html';
    adminLink.textContent = 'Administration';
    adminLink.setAttribute('aria-label', 'Open Pedro Administration');
    adminLink.style.display = 'flex';
    adminLink.style.alignItems = 'center';
    adminLink.style.textDecoration = 'none';
    profileButton.insertAdjacentElement('afterend', adminLink);
    return true;
  }

  async function databaseSaysAdmin(client) {
    const { data, error } = await client
      .schema('pedro')
      .rpc('is_admin');

    if (error) throw error;
    return data === true;
  }

  async function refreshRoleNavigation() {
    clearTimeout(roleRefreshTimer);
    try {
      const client = await getSupabaseClient();
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        removeAdministrationNavigation();
        return;
      }

      const isAdmin = await databaseSaysAdmin(client);
      if (!isAdmin) {
        removeAdministrationNavigation();
        return;
      }

      if (!addAdministrationNavigation()) {
        roleRefreshTimer = setTimeout(refreshRoleNavigation, 250);
      }
    } catch (error) {
      removeAdministrationNavigation();
      console.error('Pedro Admin navigation failed:', error);
    }
  }

  async function startRoleNavigation() {
    await refreshRoleNavigation();
    const client = await getSupabaseClient();
    client.auth.onAuthStateChange(() => {
      roleRefreshTimer = setTimeout(refreshRoleNavigation, 50);
    });
    window.addEventListener('focus', refreshRoleNavigation);
    window.pedroRefreshRoleNavigation = refreshRoleNavigation;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRoleNavigation, { once: true });
  } else {
    startRoleNavigation();
  }
})();
