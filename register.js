// ─────────────────────────────────────────
//  omni mun — register.js
//  conference registration form handler
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reg-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // sb and currentUser are set globally by app.js
    const sb          = window.sb;
    const currentUser = window.currentUser;
    if (!currentUser) return;

    const instagram    = document.getElementById('r-instagram').value.trim();
    const exp          = document.getElementById('r-exp').value;
    const committee    = document.getElementById('r-committee').value;
    const notes        = document.getElementById('r-notes').value.trim();
    const advisor      = document.getElementById('r-advisor').value;
    const guardianName = document.getElementById('r-guardian-name').value.trim();
    const guardianEmail= document.getElementById('r-guardian-email').value.trim();
    const guardianPhone= document.getElementById('r-guardian-phone').value.trim();
    const hotel        = document.getElementById('r-hotel').value;
    const roommate     = document.getElementById('r-roommate').value.trim();
    const description  = document.getElementById('r-description').value.trim();

    const errEl = document.getElementById('reg-error');
    const btn   = document.getElementById('reg-submit');
    errEl.classList.remove('show');

    if (!exp || !committee || !advisor || !guardianName || !guardianEmail || !guardianPhone || !hotel) {
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
      conference:           'SMUNC XXX',
      name:                 profile?.full_name || currentUser.email,
      email:                currentUser.email,
      phone:                profile?.phone || '',
      grade:                profile?.grade || '',
      school:               profile?.school || '',
      instagram,
      mun_experience_years: exp,
      committee_preference: committee,
      notes,
      guardian_advisor:     advisor,
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
      errEl.textContent = 'error: ' + error.message + ' — email omni.model.un@gmail.com';
      errEl.classList.add('show');
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    localStorage.setItem('om_reg_smuncxxx_' + currentUser.id, '1');
    document.getElementById('reg-form').style.display  = 'none';
    document.getElementById('form-success').style.display = 'block';
  });
});
