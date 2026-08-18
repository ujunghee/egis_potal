/**
 * 푸터 관련사이트 패널
 * 트리거 클릭 시 위쪽으로 링크 목록을 열고, 바깥 클릭·Escape·다른 항목 클릭 시 닫습니다.
 * fragment-loader.js 가 모든 화면에서 자동으로 싣습니다.
 */
(() => {
  const SELECTOR_TOGGLE = '[data-footer-related-toggle]';
  const SELECTOR_ITEM = '.footer__quick-item';

  const getItems = () => [...document.querySelectorAll(SELECTOR_ITEM)];

  const closeItem = (item) => {
    if (!item?.classList.contains('is-open')) return;
    item.classList.remove('is-open');
    const toggle = item.querySelector(SELECTOR_TOGGLE);
    const panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      const blind = toggle.querySelector('.blind');
      if (blind) blind.textContent = '메뉴 열기';
    }
    if (panel) panel.hidden = true;
  };

  const closeAll = (except) => {
    getItems().forEach((item) => {
      if (item !== except) closeItem(item);
    });
  };

  const openItem = (item) => {
    const toggle = item.querySelector(SELECTOR_TOGGLE);
    const panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (!toggle || !panel) return;

    closeAll(item);
    item.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    const blind = toggle.querySelector('.blind');
    if (blind) blind.textContent = '메뉴 닫기';
  };

  const toggleItem = (item) => {
    if (item.classList.contains('is-open')) closeItem(item);
    else openItem(item);
  };

  const bind = () => {
    const root = document.querySelector('.footer__quick');
    if (!root || root.dataset.footerRelatedBound === 'true') return;
    root.dataset.footerRelatedBound = 'true';

    root.addEventListener('click', (e) => {
      const toggle = e.target.closest(SELECTOR_TOGGLE);
      if (!toggle || !root.contains(toggle)) return;
      e.preventDefault();
      e.stopPropagation();
      const item = toggle.closest(SELECTOR_ITEM);
      if (item) toggleItem(item);
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest(SELECTOR_ITEM)) return;
      closeAll();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.addEventListener('egis:fragments-loaded', bind);
})();
