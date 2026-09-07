(() => {
  if (window.PedroIdentity) return;
  let record = { id: null, email: '', displayName: '', role: 'user' };

  const ready = (async () => {
    const client = await PedroCore.getClient();
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return record;

    const { data: profile, error } = await client
      .schema('pedro')
      .from('profiles')
      .select('id,email,display_name,role')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (error) console.error('Pedro identity profile load failed:', error);
    record = {
      id: auth.user.id,
      email: profile?.email || auth.user.email || '',
      displayName: profile?.display_name || auth.user.email?.split('@')[0] || 'Player',
      role: profile?.role || 'user'
    };

    const name = document.querySelector('#user-name');
    if (name) name.textContent = record.displayName;
    const initials = document.querySelector('#user-initials');
    if (initials) initials.textContent = record.displayName.slice(0, 2).toUpperCase();
    window.dispatchEvent(new CustomEvent('pedro:identity', { detail: { ...record } }));
    return record;
  })();

  window.PedroIdentity = {
    ready,
    get: () => ({ ...record }),
    name: () => record.displayName,
    id: () => record.id,
    isAdmin: () => record.role === 'admin'
  };
})();
