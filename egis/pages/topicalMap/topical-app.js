/** 주제별지도 목록 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../assets/js/common/datepicjer.js',
      '../../assets/js/common/header.js',
      '../../assets/js/common/search-filter.js',
      '../../assets/js/common/dataset-card.js',
      '../../assets/js/topical/state.js',
      '../../assets/js/topical/render.js',
      '../../assets/js/topical/condition.js',
      '../../assets/js/topical/filter.js',
      '../../assets/js/topical/pin.js',
      '../../assets/js/topical/results.js',
      '../../assets/js/topical/favorite.js',
      '../../assets/js/topical/recent.js',
      '../../assets/js/topical/quick-nav.js',
      '../../assets/js/topical/page.js',
    ]);
    initTopicalPage();
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
