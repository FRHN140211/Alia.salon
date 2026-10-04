/**
 * ALIA SALON MUSLIMAH — Professional Interactive Engine
 * Separated + Enhanced Effects (Zero-Bug Production Grade)
 * Features: Custom Cursor, Scroll Reveals, Sticky Header,
 * Smooth Wizard, Magnetic Buttons, Page Loader, Parallax
 */

(function () {
  'use strict';

  /* ========================================================
     UTILS
     ======================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================
     1. PAGE LOADER
     ======================================================== */
  function initLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-logo" aria-hidden="true"></div>';
    document.body.prepend(loader);

    window.addEventListener('load', () => {
      // Small delay for polish
      setTimeout(() => {
        loader.classList.add('is-done');
        setTimeout(() => loader.remove(), 800);
      }, 400);
    });
  }

  /* ========================================================
     2. CUSTOM CURSOR (Bulletproof GPU Version)
     - transform only (no left/top layout thrashing)
     - scale for hover (no width/height conflict)
     - hide until first move + leave window
     - pause rAF when tab hidden
     ======================================================== */
  function initCursor() {
    // Skip on touch devices only; keep custom cursor enabled for desktop users.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = $('#cursorDot');
    const follower = $('#cursorFollower');
    if (!dot || !follower) return;

    let mouseX = -100;
    let mouseY = -100;
    let folX = -100;
    let folY = -100;
    let isHover = false;
    let isVisible = false;
    let rafId = null;
    let isRunning = false;

    const LERP = prefersReducedMotion ? 1 : 0.14;
    let isClicked = false;

    // Apply position via transform (GPU)
    function setPos(el, x, y, scale) {
      const s = scale != null ? scale : 1;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    }

    function tick() {
      if (!isRunning) return;

      folX += (mouseX - folX) * LERP;
      folY += (mouseY - folY) * LERP;

      // Snap when very close to avoid micro-jitter
      if (Math.abs(mouseX - folX) < 0.1) folX = mouseX;
      if (Math.abs(mouseY - folY) < 0.1) folY = mouseY;

      setPos(dot, mouseX, mouseY, isHover ? 0 : (isClicked ? 0.55 : 1));
      setPos(follower, folX, folY, isHover ? 2 : 1); // scale 2 = 72px from 36px

      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (isRunning) return;
      isRunning = true;
      rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    // First move → show + start loop
    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        folX = mouseX;
        folY = mouseY;
        dot.classList.remove('hidden');
        follower.classList.remove('hidden');
        dot.classList.add('is-active');
        follower.classList.add('is-active');
        setPos(dot, mouseX, mouseY, 1);
        setPos(follower, mouseX, mouseY, 1);
        startLoop();
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    // Hover targets (data-cursor)
    function bindHoverTargets() {
      $$('[data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          const text = el.getAttribute('data-cursor') || 'VIEW';
          follower.setAttribute('data-cursor-text', text);
          follower.classList.add('is-hover');
          isHover = true;
        });
        el.addEventListener('mouseleave', () => {
          follower.classList.remove('is-hover');
          follower.setAttribute('data-cursor-text', '');
          isHover = false;
        });
      });
    }
    bindHoverTargets();

    // Click feedback
    window.addEventListener('mousedown', () => {
      isClicked = true;
      dot.classList.add('is-click');
    }, { passive: true });
    window.addEventListener('mouseup', () => {
      isClicked = false;
      dot.classList.remove('is-click');
    }, { passive: true });

    // Hide when pointer leaves the document
    document.addEventListener('mouseleave', () => {
      dot.classList.add('is-hidden');
      follower.classList.add('is-hidden');
    });
    document.addEventListener('mouseenter', () => {
      if (isVisible) {
        dot.classList.remove('is-hidden');
        follower.classList.remove('is-hidden');
      }
    });

    // Pause when tab is hidden (battery + no bugs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisible) {
        startLoop();
      }
    });
  }

  /* ========================================================
     3. STICKY HEADER + SCROLL EFFECTS
     ======================================================== */
  function initHeader() {
    const header = $('header');
    if (!header) return;

    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      if (y > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      lastScroll = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
  }

  /* ========================================================
     4. SCROLL REVEAL (Intersection Observer)
     ======================================================== */
  function initReveals() {
    if (prefersReducedMotion) {
      $$('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Optional: unobserve after reveal for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    $$('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach((el) => {
      observer.observe(el);
    });
  }

  /* ========================================================
     5. BOOKING WIZARD (Enhanced Transitions)
     ======================================================== */
  function syncServiceSelectionStyles() {
    $$('input[name="services"]').forEach((input) => {
      const label = input.closest('label');
      if (!label) return;
      label.classList.toggle('is-selected', Boolean(input.checked));
    });
  }

  function initWizard() {
    const dateInput = $('#wizDate');
    if (dateInput) {
      const toLocalDateInput = (date) => {
        const local = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return local.toISOString().split('T')[0];
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowValue = toLocalDateInput(tomorrow);
      dateInput.value = tomorrowValue;
      dateInput.min = tomorrowValue;
    }

    $$('input[name="services"]').forEach((input) => {
      input.addEventListener('change', syncServiceSelectionStyles);
    });

    // Expose globally for inline onclick (legacy support)
    window.goToStep = goToStep;
    window.updateSummary = updateSummary;
    window.submitBooking = submitBooking;

    // Initial summary
    syncServiceSelectionStyles();
    updateSummary();

    // Keyboard support for wizard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // optional: reset or close
      }
    });
  }

  function goToStep(stepNum) {
    const steps = [
      $('#wizardStep1'),
      $('#wizardStep2'),
      $('#wizardStep3'),
    ];
    const progress = $('#stepProgress');
    const indicators = [
      $('#stepIndicator1'),
      $('#stepIndicator2'),
      $('#stepIndicator3'),
    ];

    if (!steps[0] || !progress) return;

    // Validate before advancing
    if (stepNum === 2) {
      const checked = $$('input[name="services"]:checked');
      if (checked.length === 0) {
        const firstServiceInput = $('input[name="services"]');
        const firstLabel = firstServiceInput?.closest('label');
        if (firstLabel) {
          firstLabel.classList.remove('service-choice-invalid');
          void firstLabel.offsetWidth;
          firstLabel.classList.add('service-choice-invalid');
          firstServiceInput.focus();
        }
        return;
      }
    }

    if (stepNum === 3) {
      const date = $('#wizDate')?.value;
      if (!date) {
        $('#wizDate')?.focus();
        return;
      }
    }

    steps.forEach((s) => {
      if (s) {
        s.classList.add('hidden');
        s.classList.remove('is-active');
      }
    });

    indicators.forEach((ind) => {
      if (ind) ind.className = 'text-text-muted/60';
    });

    const widths = ['33.3%', '66.6%', '100%'];
    const activeClasses = [
      'text-forest-deep font-bold',
      'text-forest-deep font-bold',
      'text-forest-deep font-bold',
    ];

    if (stepNum >= 1 && stepNum <= 3) {
      const idx = stepNum - 1;
      if (steps[idx]) {
        steps[idx].classList.remove('hidden');
        // Force reflow then activate for transition
        requestAnimationFrame(() => {
          steps[idx].classList.add('is-active');
        });
      }
      progress.style.width = widths[idx];

      for (let i = 0; i <= idx; i++) {
        if (indicators[i]) {
          indicators[i].className = i === idx
            ? activeClasses[i]
            : 'text-text-main font-medium';
        }
      }

      if (stepNum === 3) updateSummary();

      // Smooth scroll to top of wizard if needed
      const wizard = $('#reservasi');
      if (wizard && window.innerWidth < 768) {
        wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function updateSummary() {
    syncServiceSelectionStyles();

    const checkedBoxes = $$('input[name="services"]:checked');
    let total = 0;
    checkedBoxes.forEach((box) => {
      total += parseInt(box.getAttribute('data-price') || '0', 10);
    });

    const countEl = $('#summaryServicesCount');
    const totalEl = $('#summaryTotalPrice');

    if (countEl) {
      countEl.textContent = `${checkedBoxes.length} Layanan Dipilih`;
    }
    if (totalEl) {
      totalEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
      totalEl.style.transform = 'scale(1.05)';
      setTimeout(() => {
        totalEl.style.transform = 'scale(1)';
      }, 180);
    }
  }

  function submitBooking() {
    const nameEl = $('#wizName');
    const phoneEl = $('#wizPhone');
    const dateEl = $('#wizDate');
    const notesEl = $('#wizNotes');

    const name = (nameEl?.value || '').trim() || 'Tamu Terhormat';
    const phone = (phoneEl?.value || '').trim() || '-';
    const date = dateEl?.value || 'Fleksibel';
    const time = $('input[name="wizTime"]:checked')?.value || '08:30 WIB (Pagi)';
    const notes = (notesEl?.value || '').trim() || '-';

    // Basic validation
    if (!nameEl?.value.trim()) {
      nameEl?.focus();
      nameEl?.classList.add('ring-2', 'ring-antique-gold');
      setTimeout(() => nameEl?.classList.remove('ring-2', 'ring-antique-gold'), 2000);
      return;
    }
    if (!phoneEl?.value.trim() || phoneEl.value.replace(/\D/g, '').length < 10) {
      phoneEl?.focus();
      phoneEl?.classList.add('ring-2', 'ring-antique-gold');
      setTimeout(() => phoneEl?.classList.remove('ring-2', 'ring-antique-gold'), 2000);
      return;
    }

    const checkedBoxes = $$('input[name="services"]:checked');
    if (checkedBoxes.length === 0) {
      const firstServiceInput = $('input[name="services"]');
      const firstLabel = firstServiceInput?.closest('label');
      if (firstLabel) {
        firstLabel.classList.remove('service-choice-invalid');
        void firstLabel.offsetWidth;
        firstLabel.classList.add('service-choice-invalid');
      }
      firstServiceInput?.focus();
      return;
    }

    const services = [];
    let total = 0;
    checkedBoxes.forEach((b) => {
      services.push(b.value);
      total += parseInt(b.getAttribute('data-price') || '0', 10);
    });

    const servicesStr = services.join('%0A• ');
    const formattedTotal = 'Rp ' + total.toLocaleString('id-ID');

    const message =
      `Bismillah,%20Halo%20VIP%20Concierge%20Alia%20Salon%20Muslimah,%0A%0A` +
      `Saya%20ingin%20mengonfirmasi%20reservasi%20perawatan:%0A%0A` +
      `•%20Nama%20Tamu:%20${encodeURIComponent(name)}%0A` +
      `•%20WhatsApp:%20${encodeURIComponent(phone)}%0A` +
      `•%20Tanggal%20Kunjungan:%20${encodeURIComponent(date)}%0A` +
      `•%20Sesi%20Waktu:%20${encodeURIComponent(time)}%0A%0A` +
      `*Layanan%20Terpilih:*%0A•%20${servicesStr}%0A%0A` +
      `*Estimasi%20Biaya:*%20${encodeURIComponent(formattedTotal)}%0A` +
      `*Catatan%20Khusus:*%20${encodeURIComponent(notes)}%0A%0A` +
      `Mohon%20bantuan%20konfirmasi%20ketersediaan%20slot%20dan%20ruangannya.%20Terima%20kasih!`;

    const waUrl = `https://wa.me/6281280612377?text=${message}`;
    const popup = window.open(waUrl, '_blank', 'noopener');
    if (!popup) {
      window.location.href = waUrl;
    }
  }

  /* ========================================================
     6. MAGNETIC / RIPPLE BUTTONS
     ======================================================== */
  function initButtons() {
    $$('.btn-luxe, a[href="#reservasi"], a[data-cursor="RESERVE"]').forEach((btn) => {
      btn.classList.add('btn-luxe');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--x', `${x}%`);
        btn.style.setProperty('--y', `${y}%`);
      });
    });
  }

  function initImageFallbacks() {
    $$('img').forEach((img) => {
      const fallback = () => {
        const wrapper = img.parentElement;
        img.style.display = 'none';
        if (wrapper) {
          wrapper.style.background = 'linear-gradient(135deg, rgba(184,147,62,0.28), rgba(29,56,43,0.2))';
          wrapper.style.border = '1px solid rgba(184,147,62,0.26)';
          wrapper.style.display = 'flex';
          wrapper.style.alignItems = 'center';
          wrapper.style.justifyContent = 'center';
          wrapper.style.color = '#1D382B';
          wrapper.style.fontFamily = 'Georgia, serif';
          wrapper.style.fontSize = '0.8rem';
          wrapper.style.letterSpacing = '0.14em';
          wrapper.style.textTransform = 'uppercase';
          wrapper.setAttribute('data-image-fallback', 'true');
          if (!wrapper.querySelector('.image-fallback-label')) {
            const label = document.createElement('span');
            label.className = 'image-fallback-label';
            label.textContent = 'Alia Salon';
            wrapper.appendChild(label);
          }
        }
      };

      img.addEventListener('error', fallback, { once: true });
      img.dataset.fallbackBound = 'true';
    });
  }

  /* ========================================================
     7. SERVICE ROW HOVER + CHECKBOX VISUAL
     ======================================================== */
  function initServiceRows() {
    // Add classes for enhanced hover (already in CSS)
    $$('#layanan .divide-y > div').forEach((row) => {
      row.classList.add('service-row');
    });

    $$('#filosofi .grid > div').forEach((card) => {
      card.classList.add('pillar-card');
    });
  }

  /* ========================================================
     8. SMOOTH ANCHOR SCROLL
     ======================================================== */
  function initSmoothAnchors() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#' || !id) return;
        const target = $(id);
        if (target) {
          e.preventDefault();
          const headerOffset = 90;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
      });
    });
  }

  /* ========================================================
     9. LIVE STATUS (Optional subtle update)
     ======================================================== */
  function initLiveStatus() {
    const status = $('#headerLiveStatus');
    if (!status) return;
    // Keep as is — already accurate
  }

  /* ========================================================
     10. KEYFRAME SHAKE (for validation feedback)
     ======================================================== */
  function injectShakeKeyframes() {
    if (document.getElementById('alia-extra-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'alia-extra-keyframes';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ========================================================
     BOOTSTRAP
     ======================================================== */
  function bootstrap() {
    injectShakeKeyframes();
    initLoader();
    initCursor();
    initHeader();
    initReveals();
    initWizard();
    initButtons();
    initImageFallbacks();
    initServiceRows();
    initSmoothAnchors();
    initLiveStatus();

    // Add reveal classes to major sections for animation
    const sections = [
      '#beranda .lg\\:col-span-7',
      '#beranda .lg\\:col-span-5',
      '#filosofi .lg\\:col-span-5',
      '#filosofi .lg\\:col-span-7 > div',
      '#layanan .space-y-12 > div',
      '#akademi .lg\\:col-span-6',
      '#reservasi .bg-surface-card',
      '#lokasi .lg\\:col-span-5',
      '#lokasi .lg\\:col-span-7',
    ];

    sections.forEach((sel, i) => {
      $$(sel).forEach((el, j) => {
        if (!el.classList.contains('reveal') &&
            !el.classList.contains('reveal-scale') &&
            !el.classList.contains('reveal-left') &&
            !el.classList.contains('reveal-right')) {
          el.classList.add('reveal');
          if ((i + j) % 3 === 1) el.classList.add('reveal-delay-1');
          if ((i + j) % 3 === 2) el.classList.add('reveal-delay-2');
        }
      });
    });

    // Re-init reveals after adding classes
    setTimeout(initReveals, 50);
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();