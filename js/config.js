window.PEDRO_CONFIG = Object.freeze({
  supabaseUrl: "https://rjezpgaawtufrxxnibxf.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"
});

window.PedroCore = (() => {
  let libraryPromise;
  let client;

  function loadSupabase() {
    if (window.supabase?.createClient) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Unable to load Supabase.'));
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  async function getClient() {
    if (client) return client;
    await loadSupabase();
    client = window.pedroSupabase || window.supabase.createClient(
      window.PEDRO_CONFIG.supabaseUrl,
      window.PEDRO_CONFIG.supabaseAnonKey,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
    window.pedroSupabase = client;
    return client;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-pedro-module="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.dataset.pedroModule = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function loadModules() {
    const modules = [
      'js/ui-branding.js',
      'js/admin-nav.js',
      'js/profile.js',
      'js/create-table.js',
      'js/lobby.js'
    ];
    for (const module of modules) await loadScript(module);
  }

  return { getClient, loadModules };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.PedroCore.loadModules().catch(error => console.error('Pedro module load failed:', error));
}, { once: true });
