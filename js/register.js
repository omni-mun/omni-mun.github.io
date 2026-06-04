// ─────────────────────────────────────────
//  omni mun — register.js
//  handles all conference registration forms
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Conference tab switching ──────────────────────────────────
  document.querySelectorAll('.conf-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.conf-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.conf-panel').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
      });
      tab.classList.add('active');
      const panel = document.getElementById('conf-' + tab.dataset.conf);
      if (panel) { panel.style.display = 'block'; panel.classList.add('active'); }
    });
  });

  // ── Update all reg forms based on auth state ──────────────────
  window.updateRegForms = () => {
    const user = window.currentUser;
    document.querySelectorAll('.reg-logged-out').forEach(el => {
      el.style.display = user ? 'none' : 'block';
    });
    document.querySelectorAll('.reg-form').forEach(form => {
      const confKey = form.dataset.conf.toLowerCase().replace(/\s+/g, '');
      const submitted = user && localStorage.getItem('om_reg_' + confKey + '_' + user.id);
      form.style.display = (user && !submitted) ? 'flex' : 'none';
      const successId = 'form-success-' + form.id.replace('reg-form-', '');
      const succEl = document.getElementById(successId);
      if (succEl) succEl.style.display = (user && submitted) ? 'block' : 'none';
    });
  };

  // ── Wire up each form ─────────────────────────────────────────
  document.querySelectorAll('.reg-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const sb          = window.sb;
      const currentUser = window.currentUser;
      if (!currentUser) return;

      const confName    = form.dataset.conf;
      const confKey     = confName.toLowerCase().replace(/\s+/g, '');
      const errEl       = form.querySelector('.reg-error');
      const btn         = form.querySelector('.reg-submit');

      const get = cls => (form.querySelector('.' + cls) || {}).value?.trim() || '';

      const instagram    = get('r-instagram');
      const exp          = get('r-exp');
      const committee    = get('r-committee');
      const notes        = get('r-notes');
      const guardianName = get('r-guardian-name');
      const guardianEmail= get('r-guardian-email');
      const guardianPhone= get('r-guardian-phone');
      const hotel        = get('r-hotel');
      const roommate     = get('r-roommate');
      const description  = get('r-description');

      errEl.classList.remove('show');

      if (!exp || !committee || !guardianName || !guardianEmail || !guardianPhone || !hotel) {
        errEl.textContent = 'please fill in all required fields.';
        errEl.classList.add('show');
        errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      btn.disabled = true;
      btn.textContent = 'submitting...';

      const { data: profile } = await sb
        .from('profiles')
        .select('full_name,grade,school,phone')
        .eq('id', currentUser.id)
        .single();

      const payload = {
        user_id:              currentUser.id,
        conference:           confName,
        name:                 profile?.full_name || currentUser.email,
        email:                currentUser.email,
        phone:                profile?.phone || '',
        grade:                profile?.grade || '',
        school:               profile?.school || '',
        instagram,
        mun_experience_years: exp,
        committee_preference: committee,
        notes,
        guardian_name:        guardianName,
        guardian_email:       guardianEmail,
        guardian_phone:       guardianPhone,
        hotel_preference:     hotel,
        roommate_preference:  roommate,
        description,
      };

      const { error } = await sb.from('registrations').insert(payload);

      btn.disabled = false;
      btn.textContent = 'submit registration →';

      if (error) {
        errEl.textContent = 'error: ' + error.message + ' — dm @omni.mun or call/text (916) 692-0802';
        errEl.classList.add('show');
        errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      localStorage.setItem('om_reg_' + confKey + '_' + currentUser.id, '1');
      form.style.display = 'none';
      const successId = 'form-success-' + form.id.replace('reg-form-', '');
      const succEl = document.getElementById(successId);
      if (succEl) succEl.style.display = 'block';
    });
  });

});
