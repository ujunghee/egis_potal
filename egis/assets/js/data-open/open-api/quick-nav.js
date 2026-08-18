/** 빠른 메뉴 고정 위치 — 래퍼(관심·최근 본 패널 포함)를 함께 이동 */
OpenApi.initQuickNav = () => {
  const dock = document.querySelector('[data-quick-nav]');
  const layout = document.querySelector('.tp-layout');
  const content = document.querySelector('.tp-content');
  const header = document.querySelector('.header');
  if (!dock || !layout || !content || !header) return null;

  const TOP_GAP = 16;
  let anchorTop = 0;
  let fixedLeft = null;

  const clear = () => {
    dock.classList.remove('is-fixed');
    dock.style.top = '';
    dock.style.left = '';
    fixedLeft = null;
  };

  const measure = () => {
    clear();
    anchorTop = content.getBoundingClientRect().top + window.scrollY;
  };

  const update = () => {
    const headerH = header.getBoundingClientRect().height;
    if (window.scrollY + headerH + TOP_GAP < anchorTop) {
      clear();
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const dockH = dock.querySelector('.tp-quick')?.offsetHeight || dock.offsetHeight;
    let top = headerH + TOP_GAP;
    if (top + dockH > layoutRect.bottom) {
      top = Math.max(headerH + TOP_GAP, layoutRect.bottom - dockH);
    }

    if (!dock.classList.contains('is-fixed')) {
      fixedLeft = dock.getBoundingClientRect().left;
    }

    dock.classList.add('is-fixed');
    dock.style.left = `${fixedLeft}px`;
    dock.style.top = `${top}px`;
  };

  measure();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); });

  return { remeasure: () => { measure(); update(); } };
};
