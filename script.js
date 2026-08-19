(() => {
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const backToTop = document.querySelector('.back-to-top');
  const modal = document.querySelector('.video-modal');
  const modalTitle = document.querySelector('#modal-title');
  const videoFrame = document.querySelector('#video-frame');
  let lastFocusedElement = null;

  const closeMenu = () => {
    if (!menuButton || !mainNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menüyü aç');
    mainNav.classList.remove('open');
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Menüyü kapat' : 'Menüyü aç');
    mainNav.classList.toggle('open', willOpen);
  });

  mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;

      const label = trigger.querySelector('span:first-child');
      if (label && label.textContent.includes(' detaylarını ')) {
        label.textContent = label.textContent.replace(isOpen ? 'kapat' : 'aç', isOpen ? 'aç' : 'kapat');
      }
    });
  });

  const closeModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    videoFrame.replaceChildren();
    body.classList.remove('modal-open');
    lastFocusedElement?.focus();
  };

  document.querySelectorAll('[data-youtube]').forEach((button) => {
    button.addEventListener('click', () => {
      const videoId = button.dataset.youtube;
      const title = button.dataset.title || 'TELC A2 bilgilendirme videosu';
      if (!videoId || !modal) return;

      lastFocusedElement = button;
      modalTitle.textContent = title;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      videoFrame.replaceChildren(iframe);
      modal.hidden = false;
      body.classList.add('modal-open');
      modal.querySelector('.modal-close')?.focus();
    });
  });

  modal?.querySelectorAll('[data-modal-close]').forEach((control) => control.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      closeMenu();
    }

    if (event.key === 'Tab' && modal && !modal.hidden) {
      const focusable = [...modal.querySelectorAll('button, iframe, [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const onScroll = () => backToTop?.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -60%', threshold: [0, .15, .5] });
    observedSections.forEach((section) => observer.observe(section));
  }
})();
