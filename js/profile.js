(() => {
  if (window.__pedroProfileLoaded) return;
  window.__pedroProfileLoaded = true;
  function initials(value='P'){return String(value).split(/\s|@/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'P'}
  async function load() {
    const screen = document.querySelector('#screen-profile');
    if (!screen) return;
    const client = await PedroCore.getClient();
    const { data: auth } = await client.auth.getSession();
    const user = auth.session?.user;
    if (!user) return;
    const { data: profile } = await client.schema('pedro').from('profiles').select('id,email,display_name,role,created_at,updated_at').eq('id',user.id).maybeSingle();
    const row = profile || { id:user.id, email:user.email, display_name:user.email?.split('@')[0], role:'user' };
    screen.innerHTML = `<div class="panel" style="padding:28px;max-width:900px;margin:auto"><h2 style="font-family:Georgia">Profile</h2><div style="display:grid;grid-template-columns:120px 1fr;gap:22px"><div style="width:96px;height:96px;border:3px solid #d9aa4d;border-radius:50%;display:grid;place-items:center;background:#17445c;font-size:28px;font-weight:900">${initials(row.display_name)}</div><div><label style="display:grid;gap:7px;margin-bottom:14px">Display name<input id="mod-profile-name" value="${row.display_name||''}" style="min-height:43px;padding:9px"></label><p>${row.email||user.email}</p><p>Role: ${row.role==='admin'?'Administrator':'User'}</p><button id="mod-profile-save" class="primary">SAVE CHANGES</button> <button id="mod-profile-reset" class="secondary">SEND PASSWORD RESET</button><p id="mod-profile-status"></p></div></div></div>`;
    document.querySelector('#mod-profile-save').onclick=async()=>{const name=document.querySelector('#mod-profile-name').value.trim();const {error}=await client.schema('pedro').from('profiles').update({display_name:name,updated_at:new Date().toISOString()}).eq('id',user.id);document.querySelector('#mod-profile-status').textContent=error?error.message:'Profile updated.'};
    document.querySelector('#mod-profile-reset').onclick=async()=>{const {error}=await client.auth.resetPasswordForEmail(user.email,{redirectTo:location.origin+location.pathname});document.querySelector('#mod-profile-status').textContent=error?error.message:'Password-reset email sent.'};
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-screen="profile"]')) setTimeout(load, 0);
  }, true);
})();
