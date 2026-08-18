const nav = document.querySelector('.map-navigation');
const collapseBtn = document.querySelector('[data-nav-collapse]');

const updateCollapseState = () => {
  if (!nav || !collapseBtn) return;
  const collapsed = nav.classList.contains('is-collapsed');
  collapseBtn.setAttribute('aria-expanded', String(!collapsed));
  collapseBtn.setAttribute('aria-label', collapsed ? '메뉴 펼치기' : '메뉴 접기');
};

const setActiveNavItem = (btn) => {
  document.querySelectorAll('.map-navigation__item[aria-pressed]').forEach((el) => {
    el.classList.remove('active');
    el.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
};

document.querySelectorAll('.map-navigation__item[aria-pressed]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.spatialSearch !== undefined) {
      const willOpen = !window.SpatialSearchPanel?.isOpen?.();

      setActiveNavItem(btn);

      if (willOpen) {
        window.SpatialSearchPanel?.open();
      } else {
        window.SpatialSearchPanel?.close();
      }

      updateCollapseState();
      return;
    }

    window.SpatialSearchPanel?.close?.();
    setActiveNavItem(btn);

    if (btn.dataset.resultPanel !== undefined) {
      const viewId = btn.dataset.resultPanelView || 'integrated-search';
      window.ResultPanel?.show(viewId);
    } else {
      window.ResultPanel?.hide();
    }
  });
});

if (nav && collapseBtn) {
  collapseBtn.addEventListener('click', () => {
    nav.classList.toggle('is-collapsed');
    updateCollapseState();
    const hovered = nav.querySelector('.map-navigation__item:hover');
    window.dispatchEvent(new Event('resize'));
    if (nav.classList.contains('is-collapsed') && hovered) {
      hovered.dispatchEvent(new Event('mouseenter'));
    }
  });
  updateCollapseState();
}

nav?.querySelectorAll('.map-navigation__item').forEach((btn) => {
  window.initIntegratedSearchTooltip?.(btn);
});
