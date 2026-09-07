/* Pedro Supabase authentication and view controller.
   Browser-safe public anon key only. Never use a service_role key here. */
window.PEDRO_CONFIG = {
  supabaseUrl: "https://rjezpgaawtufrxxnibxf.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"
};

(() => {
  let client = null;
  let libraryPromise = null;

  const get = selector => document.querySelector(selector);

  function setStatus(message, type = "info") {
    const element = get("#auth-status") || get(".login-panel .tiny");
    if (!element) return;
    element.textContent = message;
    element.dataset.type = type;
    element.style.color = type === "error"
      ? "#ff827a"
      : type === "success"
        ? "#76d99a"
        : "#d8b45b";
  }

  function friendlyError(error) {
    const message = String(error?.message || "Authentication failed.");
    if (/invalid login credentials/i.test(message)) return "Incorrect email address or password.";
    if (/email not confirmed/i.test(message)) return "Confirm the account from the email sent by Pedro, then sign in.";
    if (/user already registered/i.test(message)) return "An account already exists for this email address.";
    return message;
  }

  function loadLibrary() {
    if (window.supabase?.createClient) return Promise.resolve();
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load the Supabase browser library."));
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  async function getClient() {
    if (client) return client;
    await loadLibrary();
    client = window.supabase.createClient(
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
    window.pedroSupabase = client;
    return client;
  }

  function showLobby() {
    const loginView = get("#login-view");
    const appView = get("#app-view");
    const gameView = get("#game-view");

    loginView?.classList.remove("active");
    appView?.classList.add("active");
    gameView?.classList.remove("active");

    /* These inline display values override the earlier login CSS rule that
       incorrectly kept the inactive login screen visible. */
    if (loginView) loginView.style.display = "none";
    if (appView) appView.style.display = "block";
    if (gameView) gameView.style.display = "none";

    const lobby = get("#screen-lobby");
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    lobby?.classList.add("active");
    window.scrollTo(0, 0);
  }

  function showLogin() {
    const loginView = get("#login-view");
    const appView = get("#app-view");
    const gameView = get("#game-view");

    loginView?.classList.add("active");
    appView?.classList.remove("active");
    gameView?.classList.remove("active");

    if (loginView) loginView.style.display = "grid";
    if (appView) appView.style.display = "none";
    if (gameView) gameView.style.display = "none";
    window.scrollTo(0, 0);
  }

  function credentials() {
    return {
      email: get("#login-email")?.value.trim() || "",
      password: get("#login-password")?.value || ""
    };
  }

  function setBusy(busy) {
    const submit = get('#login-form button[type="submit"]');
    const create = get("#create-account");
    if (submit) {
      submit.disabled = busy;
      submit.textContent = busy ? "PLEASE WAIT..." : "SIGN IN";
    }
    if (create) create.disabled = busy;
  }

  async function signIn(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { email, password } = credentials();
    if (!email || !password) return setStatus("Enter both an email address and password.", "error");

    setBusy(true);
    setStatus("Signing in...");
    try {
      const supabase = await getClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("Sign-in successful.", "success");
      showLobby();
    } catch (error) {
      setStatus(friendlyError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { email, password } = credentials();
    if (!email || !password) return setStatus("Enter an email address and password first.", "error");

    setBusy(true);
    setStatus("Creating account...");
    try {
      const supabase = await getClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
      if (data.session) showLobby();
      else setStatus("Account created. Check email to confirm the account, then sign in.", "success");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { email } = credentials();
    if (!email) return setStatus("Enter the account email address first.", "error");

    setStatus("Sending password-reset email...");
    try {
      const supabase = await getClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      setStatus("Password-reset email sent.", "success");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  }

  async function signOut(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    try {
      const supabase = await getClient();
      await supabase.auth.signOut();
    } finally {
      showLogin();
      setStatus("Signed out.", "success");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    get("#login-form")?.addEventListener("submit", signIn, true);
    get("#create-account")?.addEventListener("click", createAccount, true);
    (get("#forgot-password") || get(".login-panel .text-button"))
      ?.addEventListener("click", resetPassword, true);
    get("#sign-out")?.addEventListener("click", signOut, true);

    try {
      const supabase = await getClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) showLobby();
      else showLogin();

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) showLobby();
        if (event === "SIGNED_OUT") showLogin();
      });
    } catch (error) {
      showLogin();
      setStatus(friendlyError(error), "error");
    }
  });
})();
