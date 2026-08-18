/** 자주 묻는 질문 — 아코디언 (한 번에 하나만 열림) */
(() => {
  const list = document.querySelector('[data-faq-list]');
  if (!list) return;

  const items = [...list.querySelectorAll('[data-faq-item]')];

  const closeFaqItem = (item) => {
    const panel = item.querySelector('[data-faq-panel]');
    const toggle = item.querySelector('[data-faq-toggle]');
    if (!panel || !item.classList.contains('is-open')) return;

    item.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');

    panel.classList.remove('is-open');
    panel.style.overflow = 'hidden';
    panel.style.height = `${panel.scrollHeight}px`;
    panel.offsetHeight;

    requestAnimationFrame(() => {
      panel.style.height = '0';
    });
  };

  const openFaqItem = (item) => {
    const panel = item.querySelector('[data-faq-panel]');
    const toggle = item.querySelector('[data-faq-toggle]');
    if (!panel || item.classList.contains('is-open')) return;

    item.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');

    panel.classList.remove('is-open');
    panel.style.overflow = 'hidden';
    panel.style.height = 'auto';
    const targetHeight = panel.scrollHeight;
    panel.style.height = '0';
    panel.offsetHeight;

    requestAnimationFrame(() => {
      panel.style.height = `${targetHeight}px`;
    });

    panel.addEventListener('transitionend', function onOpenEnd(event) {
      if (event.propertyName !== 'height' || !item.classList.contains('is-open')) return;
      panel.style.height = 'auto';
      panel.style.overflow = 'visible';
      panel.classList.add('is-open');
      panel.removeEventListener('transitionend', onOpenEnd);
    });
  };

  const activateFaqItem = (item) => {
    items.forEach((entry) => {
      if (entry !== item) closeFaqItem(entry);
    });
    openFaqItem(item);
  };

  const initFaqPanels = () => {
    let hasOpenItem = false;

    items.forEach((item) => {
      const panel = item.querySelector('[data-faq-panel]');
      if (!panel) return;

      panel.removeAttribute('hidden');

      if (item.classList.contains('is-open') && !hasOpenItem) {
        hasOpenItem = true;
        panel.style.height = 'auto';
        panel.style.overflow = 'visible';
        panel.classList.add('is-open');
        item.querySelector('[data-faq-toggle]')?.setAttribute('aria-expanded', 'true');
        return;
      }

      item.classList.remove('is-open');
      item.querySelector('[data-faq-toggle]')?.setAttribute('aria-expanded', 'false');
      panel.style.height = '0';
      panel.style.overflow = 'hidden';
      panel.classList.remove('is-open');
    });

    if (!hasOpenItem && items[0]) {
      const firstPanel = items[0].querySelector('[data-faq-panel]');
      items[0].classList.add('is-open');
      items[0].querySelector('[data-faq-toggle]')?.setAttribute('aria-expanded', 'true');
      if (firstPanel) {
        firstPanel.style.height = 'auto';
        firstPanel.style.overflow = 'visible';
        firstPanel.classList.add('is-open');
      }
    }
  };

  list.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-faq-toggle]');
    if (!toggle) return;

    const item = toggle.closest('[data-faq-item]');
    if (!item || item.classList.contains('is-open')) return;

    activateFaqItem(item);
  });

  initFaqPanels();
})();
