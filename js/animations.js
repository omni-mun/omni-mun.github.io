// ─────────────────────────────────────────
//  omni mun — animations.js
//  scroll reveal + misc page animations
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Scroll reveal ──────────────────────────────────────────
  // Watches every [data-reveal] and .reveal-pair element.
  // Adds .is-visible when >= 15% of the element is in view.

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal], .reveal-pair').forEach(el => {
    revealObserver.observe(el);
  });


  // ── 2. Auto-tag sections ───────────────────────────────────────
  // Automatically adds data-reveal and stagger delays to common
  // repeated elements so you don't have to hand-tag everything.

  // stat cards — stagger left-to-right
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.setAttribute('data-reveal', 'up');
    card.setAttribute('data-delay', String(Math.min(i + 1, 5)));
    revealObserver.observe(card);
  });

  // timeline rows
  document.querySelectorAll('.tl-row').forEach((row, i) => {
    row.setAttribute('data-reveal', 'left');
    row.setAttribute('data-delay', String(Math.min(i + 1, 4)));
    revealObserver.observe(row);
  });

  // conf card halves
  const confInfo = document.querySelector('.conf-info');
  const confReg  = document.querySelector('.conf-register');
  if (confInfo) { confInfo.setAttribute('data-reveal', 'left');  revealObserver.observe(confInfo); }
  if (confReg)  { confReg.setAttribute('data-reveal', 'right'); confReg.setAttribute('data-delay', '1'); revealObserver.observe(confReg); }

  // about grid halves
  const aboutText  = document.querySelector('.about-text');
  const aboutStats = document.querySelector('.about-stats');
  if (aboutText)  { aboutText.setAttribute('data-reveal', 'left');  revealObserver.observe(aboutText); }
  if (aboutStats) { aboutStats.setAttribute('data-reveal', 'right'); aboutStats.setAttribute('data-delay', '1'); revealObserver.observe(aboutStats); }

  // section header pairs
  document.querySelectorAll('section').forEach(sec => {
    const label    = sec.querySelector('.section-label');
    const title    = sec.querySelector('.section-title');
    const divider  = sec.querySelector('.section-divider');
    if (label && title) {
      const wrapper = label.closest('.container') || sec;
      wrapper.classList.add('reveal-pair');
      revealObserver.observe(wrapper);
    }
  });

  // instagram section
  const instaWrap = document.querySelector('.insta-wrap');
  if (instaWrap) { instaWrap.setAttribute('data-reveal', 'up'); revealObserver.observe(instaWrap); }


  // ── 3. Parallax hero logo ──────────────────────────────────────
  // Subtly moves the hero logo upward as you scroll down.
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroLogo.style.transform = `translateY(${scrolled * 0.18}px)`;
      }
    }, { passive: true });
  }


  // ── 4. Nav shrink on scroll ────────────────────────────────────
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.height = '54px';
        nav.style.borderBottomColor = 'rgba(240,236,228,.08)';
      } else {
        nav.style.height = '66px';
        nav.style.borderBottomColor = 'rgba(240,236,228,.14)';
      }
    }, { passive: true });
  }


  // ── 5. Ticker line ─────────────────────────────────────────────
  // Inserts a scrolling text ticker between hero and about sections.
  const about = document.getElementById('about');
  if (about) {
    const tickerText = 'omni mun &nbsp;·&nbsp; norcal independent delegation &nbsp;·&nbsp; stanford &nbsp;·&nbsp; ucla &nbsp;·&nbsp; uc berkeley &nbsp;·&nbsp; uc davis &nbsp;·&nbsp; uc san diego &nbsp;·&nbsp; uc santa barbara &nbsp;·&nbsp; ';
    const ticker = document.createElement('div');
    ticker.className = 'ticker-line';
    // duplicate the text so the loop is seamless
    ticker.innerHTML = `<span class="ticker-inner">${tickerText.repeat(6)}</span>`;
    about.parentNode.insertBefore(ticker, about);
  }


  // ── 6. Smooth counter animation on stat numbers ────────────────
  // (only fires for numeric values — skips "norcal", "indep.", etc.)
  const statNums = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw);
      if (isNaN(num)) return; // skip text-only stats
      const duration = 1000;
      const start = performance.now();
      const isInt = Number.isInteger(num);
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = isInt
          ? Math.round(eased * num).toString()
          : (eased * num).toFixed(1);
        if (progress < 1) requestAnimationFrame(animate);
        else el.textContent = raw; // restore original (e.g. trailing +)
      };
      requestAnimationFrame(animate);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObserver.observe(el));


  // ── 7. Cursor glow (desktop only) ─────────────────────────────
  // A very subtle chalk-colored glow that follows the cursor.
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:320px; height:320px; border-radius:50%;
      background: radial-gradient(circle, rgba(240,236,228,.045) 0%, transparent 70%);
      transform: translate(-50%,-50%);
      transition: left .12s ease, top .12s ease;
      top:0; left:0;
    `;
    document.body.appendChild(glow);
    window.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }


  // ── Steps sticky scroll (how it works) ───────────────────────
  const stepPanels = document.querySelectorAll('.step-panel');
  const stepNum    = document.getElementById('step-num');
  const stepBar    = document.getElementById('step-progress-bar');
  const stepRoman  = ['i.', 'ii.', 'iii.', 'iv.', 'v.'];

  if (stepPanels.length && stepNum) {
    const updateSteps = () => {
      let activeIdx = 0;
      stepPanels.forEach((panel, i) => {
        const rect = panel.getBoundingClientRect();
        if (rect.top + rect.height / 2 < window.innerHeight * 0.6) activeIdx = i;
        panel.classList.toggle('active', i === activeIdx);
      });
      const first = stepPanels[0].getBoundingClientRect().top + window.scrollY;
      const last  = stepPanels[stepPanels.length - 1].getBoundingClientRect().bottom + window.scrollY;
      const pos   = window.scrollY + window.innerHeight * 0.6 - first;
      const pct   = Math.min(Math.max(pos / (last - first), 0), 1) * 100;
      if (stepBar) stepBar.style.height = pct + '%';
      if (stepNum) stepNum.textContent = stepRoman[activeIdx] || stepRoman[stepRoman.length - 1];
    };
    window.addEventListener('scroll', updateSteps, { passive: true });
    updateSteps();
  }


  // ── 8. History sticky scroll (roman numerals) ──────────────────
  // Mirrors the steps-scroll logic but for .hist-panel elements.
  const histPanels = document.querySelectorAll('.hist-panel');
  const histNum    = document.getElementById('hist-num');
  const histBar    = document.getElementById('hist-progress-bar');

  const romanMap = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.'];

  if (histPanels.length && histNum) {
    const updateHist = () => {
      const scrollY  = window.scrollY;
      const winH     = window.innerHeight;
      let activeIdx  = 0;
      let totalProgress = 0;

      histPanels.forEach((panel, i) => {
        const rect = panel.getBoundingClientRect();
        const panelMid = rect.top + rect.height / 2;

        if (panelMid < winH * 0.6) {
          activeIdx = i;
        }

        panel.classList.toggle('active', i === activeIdx);
      });

      // progress bar: 0→100 across all panels
      const first = histPanels[0].getBoundingClientRect().top + scrollY;
      const last  = histPanels[histPanels.length - 1].getBoundingClientRect().bottom + scrollY;
      const range = last - first;
      const pos   = scrollY + winH * 0.6 - first;
      totalProgress = Math.min(Math.max(pos / range, 0), 1) * 100;

      if (histBar) histBar.style.height = totalProgress + '%';
      if (histNum) histNum.textContent = romanMap[activeIdx] || romanMap[romanMap.length - 1];
    };

    window.addEventListener('scroll', updateHist, { passive: true });
    updateHist(); // run once on load
  }


});
