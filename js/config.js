/* Pedro Supabase authentication connector.
   This file is safe for GitHub Pages because it uses only the public anon key.
   NEVER place a service_role key in browser code. */
window.PEDRO_CONFIG = {
  supabaseUrl: "https://rjezpgaawtufrxxnibxf.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZXpwZ2Fhd3R1ZnJ4eG5pYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDM5ODEsImV4cCI6MjEwNDMxOTk4MX0.tDMRuV6_Ov0WCPVeoHkaDAGwTKoRrIak4I7cwA7zIIU"
};

(() => {
  let client = null;
  let loadingPromise = null;

  function loadSupabase() {
    if (window.supabase?.createClient) return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    loadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load the Supabase browser library."));
      document.head.appendChild(script);
    });
    return loadingPromise;
  }

  function statusElement() {
    return document.querySelector("#auth-status") || document.querySelector(".login-panel .tiny");
  }

  function setStatus(message, type = "info") {
    const element = statusElement();
    if (!element) return;
    element.textContent = message;
    element.dataset.type = type;
    element.style.color = type === "error" ? "#ff827a" : type === "success" ? "#76d99a" : "#d8b45b";
  }

  function toastMessage(message) {
    if (typeof window.toast === "function") window.toast(message);
    else setStatus(message);
  }

  function friendlyError(error) {
    const message = String(error?.message || "Authentication failed.");
    if (/invalid login credentials/i.test(message)) return "Incorrect email address or password.";
    if (/email not confirmed/i.test(message)) return "Confirm the account from the email sent by Pedro, then sign in.";
    if (/user already registered/i.test(message)) return "An account already exists for this email address.";
    return message;
  }

  async function getClient() {
    if (client) return client;
    await loadSupabase();
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

  function getCredentials() {
    return {
      email: document.querySelector("#login-email")?.value.trim() || "",
      password: document.querySelector("#login-password")?.value || ""
    };
  }

  function setBusy(busy) {
    const submit = document.querySelector('#login-form button[type="submit"]');
    if (submit) {
      submit.disabled = busy;
      submit.textContent = busy ? "PLEASE WAIT..." : "SIGN IN";
    }
    const create = document.querySelector("#create-account");
    if (create) create.disabled = busy;
  }

  function enterLobby() {
    if (typeof window.enterApp === "function") window.enterApp();
    else {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.querySelector("#app-view")?.classList.add("active");
    }
  }

  async function signIn(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { email, password } = getCredentials();
    if (!email || !password) return setStatus("Enter both an email address and password.", "error");
    setBusy(true);
    setStatus("Signing in...");
    try {
      const supabase = await getClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setStatus("Sign-in successful.", "success");
      toastMessage("Welcome to Pedro");
      enterLobby();
    } catch (error) {
      setStatus(friendlyError(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const { email, password } = getCredentials();
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
      if (data.session) enterLobby();
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
    const email = getCredentials().email;
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
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      const supabase = await getClient();
      await supabase.auth.signOut();
    } finally {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.querySelector("#login-view")?.classList.add("active");
      setStatus("Signed out.", "success");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    document.querySelector("#login-form")?.addEventListener("submit", signIn, true);
    document.querySelector("#create-account")?.addEventListener("click", createAccount, true);
    const forgot = document.querySelector("#forgot-password") || document.querySelector(".login-panel .text-button");
    forgot?.addEventListener("click", resetPassword, true);
    document.querySelector("#sign-out")?.addEventListener("click", signOut, true);

    try {
      const supabase = await getClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) enterLobby();
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) enterLobby();
      });
      setStatus("Enter your account information to continue.");
    } catch (error) {
      setStatus(friendlyError(error), "error");
    }
  });
})();
