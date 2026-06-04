// ─────────────────────────────────────────
//  omni mun — app.js
//  supabase auth + ui state
// ─────────────────────────────────────────

const SUPABASE_URL = 'https://fqdzvjguxjjhaahqyzws.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZHp2amd1eGpqaGFhaHF5endzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDM1MTgsImV4cCI6MjA5NjAxOTUxOH0.5qFUKd12rJJdzy3pJ7kgadZohmP7eTOeJTXyAdfkuJ0';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// expose globally so register.js can use it
window.sb = sb;

let currentUser = null;
window.currentUser = null;

// ── Handle OAuth redirect hash ──
(async () => {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace('#', ''));
    const at = params.get('access_token');
    const rt = params.get('refresh_token');
    if (at && rt) {
      await sb.auth.setSession({ access_token: at, refresh_token: rt });
      history.replaceState(null, '', window.location.pathname);
    }
  }
})();

// ── Profile helpers ──
async function profileComplete(userId) {
  const { data } = await sb.from('profiles').select('grade,school,phone').eq('id', userId).single();
  return data && data.grade && data.school && data.phone;
}

// ── Auth state ──
sb.auth.onAuthStateChange(async (event, session) => {
  currentUser = session?.user ?? null;
  window.currentUser = currentUser;
  if (currentUser) {
    const done = await profileComplete(currentUser.id);
    if (!done) { openProfileModal(); return; }
  }
  await updateUI();
});

// ── UI update ──
async function updateUI() {
  const signinBtn = document.getElementById('nav-signin-btn');
  const pill      = document.getElementById('user-pill');
  const avatarEl  = document.getElementById('user-avatar');
  const nameEl    = document.getElementById('user-name-pill');

  if (currentUser) {
    const { data: profile } = await sb.from('profiles').select('full_name').eq('id', currentUser.id).single();
    const fullName = profile?.full_name || currentUser.user_metadata?.full_name || currentUser.email;
    const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    if (signinBtn) signinBtn.style.display = 'none';
    pill.classList.add('visible');
    avatarEl.textContent = initials;
    nameEl.textContent = fullName.split(' ')[0].toLowerCase();

    if (typeof window.updateRegForms === 'function') window.updateRegForms();
  } else {
    if (signinBtn) signinBtn.style.display = '';
    pill.classList.remove('visible');
    if (typeof window.updateRegForms === 'function') window.updateRegForms();
  }
}

// ── Modal helpers ──
function openAuthModal(tab) {
  switchTab(tab || 'signin');
  document.getElementById('auth-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
}
function openProfileModal() {
  document.getElementById('profile-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function openAccountModal() {
  document.getElementById('account-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  loadAccountData();
}
function closeAccountModal() {
  document.getElementById('account-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// expose for inline onclick
window.openAuthModal    = openAuthModal;
window.closeAuthModal   = closeAuthModal;
window.switchTab        = switchTab;
window.closeAccountModal = closeAccountModal;

// ── Nav wiring ──
document.getElementById('nav-signin-btn').addEventListener('click', e => { e.preventDefault(); openAuthModal('signin'); });
document.getElementById('modal-close-btn').addEventListener('click', closeAuthModal);
document.getElementById('auth-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeAuthModal(); });
document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
document.getElementById('user-pill').addEventListener('click', openAccountModal);
document.getElementById('account-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeAccountModal(); });

// ── Google OAuth ──
async function signInWithGoogle() {
  await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
}
document.getElementById('google-signin-btn').addEventListener('click', signInWithGoogle);
document.getElementById('google-signup-btn').addEventListener('click', signInWithGoogle);

// ── Sign In ──
document.getElementById('signin-btn').addEventListener('click', async () => {
  const email = document.getElementById('si-email').value.trim();
  const pw    = document.getElementById('si-password').value;
  const errEl = document.getElementById('signin-error');
  const btn   = document.getElementById('signin-btn');
  errEl.classList.remove('show');
  if (!email || !pw) { errEl.textContent = 'please fill in all fields.'; errEl.classList.add('show'); return; }
  btn.disabled = true; btn.textContent = 'signing in...';
  const { error } = await sb.auth.signInWithPassword({ email, password: pw });
  btn.disabled = false; btn.textContent = 'sign in';
  if (error) { errEl.textContent = error.message; errEl.classList.add('show'); return; }
  closeAuthModal();
});

// ── Sign Up ──
document.getElementById('signup-btn').addEventListener('click', async () => {
  const first  = document.getElementById('su-first').value.trim();
  const last   = document.getElementById('su-last').value.trim();
  const grade  = document.getElementById('su-grade').value;
  const school = document.getElementById('su-school').value.trim();
  const email  = document.getElementById('su-email').value.trim();
  const phone  = document.getElementById('su-phone').value.trim();
  const pw     = document.getElementById('su-password').value;
  const pw2    = document.getElementById('su-confirm').value;
  const errEl  = document.getElementById('signup-error');
  const succEl = document.getElementById('signup-success');
  const btn    = document.getElementById('signup-btn');
  errEl.classList.remove('show'); succEl.classList.remove('show');

  if (!first || !last || !grade || !school || !email || !phone || !pw) {
    errEl.textContent = 'please fill in all fields.'; errEl.classList.add('show'); return;
  }
  if (pw !== pw2)  { errEl.textContent = 'passwords do not match.'; errEl.classList.add('show'); return; }
  if (pw.length < 6) { errEl.textContent = 'password must be at least 6 characters.'; errEl.classList.add('show'); return; }

  btn.disabled = true; btn.textContent = 'creating account...';
  const { data, error } = await sb.auth.signUp({
    email, password: pw,
    options: { data: { full_name: first + ' ' + last, grade, school, phone } }
  });
  if (error) {
    btn.disabled = false; btn.textContent = 'create account';
    errEl.textContent = error.message; errEl.classList.add('show'); return;
  }
  if (data.user) {
    await sb.from('profiles').upsert({ id: data.user.id, full_name: first + ' ' + last, grade, school, phone });
  }
  btn.disabled = false; btn.textContent = 'create account';
  if (data.session) { closeAuthModal(); }
  else { succEl.textContent = 'check your email to confirm your account, then sign in.'; succEl.classList.add('show'); }
});

// ── Profile completion (Google OAuth users) ──
document.getElementById('profile-save-btn').addEventListener('click', async () => {
  const grade  = document.getElementById('p-grade').value;
  const school = document.getElementById('p-school').value.trim();
  const phone  = document.getElementById('p-phone').value.trim();
  const errEl  = document.getElementById('profile-error');
  const btn    = document.getElementById('profile-save-btn');
  errEl.classList.remove('show');
  if (!grade || !school || !phone) { errEl.textContent = 'please fill in all fields.'; errEl.classList.add('show'); return; }
  btn.disabled = true; btn.textContent = 'saving...';
  const fullName = currentUser.user_metadata?.full_name || currentUser.email;
  await sb.from('profiles').upsert({ id: currentUser.id, full_name: fullName, grade, school, phone });
  btn.disabled = false; btn.textContent = 'save and continue';
  closeProfileModal();
  await updateUI();
});

// ── Account modal data ──
async function loadAccountData() {
  if (!currentUser) return;
  document.getElementById('account-email-sub').textContent = currentUser.email;
  const { data: profile } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  if (profile) {
    document.getElementById('acc-name').textContent   = profile.full_name || '—';
    document.getElementById('acc-grade').textContent  = profile.grade || '—';
    document.getElementById('acc-school').textContent = profile.school || '—';
    document.getElementById('acc-phone').textContent  = profile.phone || '—';
  }
  const { data: regs } = await sb.from('registrations').select('*').eq('user_id', currentUser.id);
  const container = document.getElementById('acc-registrations');
  if (!regs || regs.length === 0) {
    container.innerHTML = '<p class="conf-reg-none">no registrations yet.</p>';
  } else {
    container.innerHTML = regs.map(r => `
      <div class="conf-reg-card">
        <h5>${r.conference}</h5>
        <p>committee: ${r.committee_preference || '—'}</p>
        <p>experience: ${r.mun_experience_years || '—'} yr</p>
        <p>hotel: ${r.hotel_preference || '—'}</p>
        <p style="margin-top:.4rem;font-size:.7rem;opacity:.5">submitted ✓</p>
      </div>`).join('');
  }
}

// ── Sign out (via account modal button) ──
window.signOut = async () => { if (confirm('sign out?')) await sb.auth.signOut(); };

// ── Hamburger ──
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('open');
});
window.closeMobile = () => document.getElementById('mobile-menu').classList.remove('open');
