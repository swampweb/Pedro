/* Pedro public browser configuration and admin navigation loader.
   This file uses only the browser-safe public anon key. */
window.PEDRO_CONFIG = {
  supabaseUrl: "https://rjezpgaawtufrxxnibxf.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"
};

(() => {
  let loadPromise;
  function loadSupabase() {
    if (window.supabase?.createClient) return Promise.resolve();
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Supabase library failed to load.'));
      document.head.appendChild(script);
    });
    return loadPromise;
  }

  function addAdminNavigation() {
    if (document.querySelector('#nav-admin-link')) return;
    const profileButton = [...document.querySelectorAll('.nav-button')]
      .find(button => button.textContent.trim().toLowerCase() === 'profile');
    if (!profileButton) return;
    const adminLink = document.createElement('a');
    adminLink.id = 'nav-admin-link';
    adminLink.className = 'nav-button';
    adminLink.href = 'admin.html';
    adminLink.textContent = 'Administration';
    adminLink.style.display = 'flex';
    adminLink.style.alignItems = 'center';
    adminLink.style.textDecoration = 'none';
    profileButton.insertAdjacentElement('afterend', adminLink);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadSupabase();
      const client = window.pedroSupabase || window.supabase.createClient(
        window.PEDRO_CONFIG.supabaseUrl,
        window.PEDRO_CONFIG.supabaseAnonKey,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
      );
      window.pedroSupabase = client;
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;
      const { data: profile } = await client.schema('pedro').from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') addAdminNavigation();
    } catch (error) {
      console.error('Admin navigation check failed:', error);
    }
  });
})();
