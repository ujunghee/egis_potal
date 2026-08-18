/** 국가토지피복 통계 — 증감(+ 빨강 / - 파랑) */
(() => {
  const syncDelta = (el) => {
    const text = el.textContent.trim();
    const isMinus = text.startsWith('-');
    const isPlus = text.startsWith('+');

    el.classList.toggle('color-red-500', isPlus);
    el.classList.toggle('color-blue-500', isMinus);
    el.classList.toggle('color-slate-900', !isPlus && !isMinus);
  };

  const syncAll = (root = document) => {
    root.querySelectorAll('[data-land-cover-delta]').forEach(syncDelta);
  };

  syncAll();
  window.syncLandCoverDeltas = syncAll;
})();
