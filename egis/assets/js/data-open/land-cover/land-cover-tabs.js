/** 국가토지피복 통계 — 탭 전환 */
(() => {
  const tabs = document.querySelectorAll('[data-land-cover-tab]');
  const panels = document.querySelectorAll('[data-land-cover-panel]');

  if (!tabs.length || !panels.length) return;

  const activateTab = (key) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.landCoverTab === key;
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('color-slate-900', isActive);
      tab.classList.toggle('color-slate-500', !isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.landCoverPanel !== key;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.landCoverTab));
  });
})();
