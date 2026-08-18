/** Open API 목록 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../../assets/js/common/datepicjer.js',
      '../../../assets/js/common/header.js',
      '../../../assets/js/common/search-filter.js',
      '../../../assets/js/common/dataset-card.js',
      '../../../assets/js/data-open/open-api/state.js',
      '../../../assets/js/data-open/open-api/render.js',
      '../../../assets/js/data-open/open-api/condition.js',
      '../../../assets/js/data-open/open-api/filter.js',
      '../../../assets/js/data-open/open-api/pin.js',
      '../../../assets/js/data-open/open-api/results.js',
      '../../../assets/js/data-open/open-api/favorite.js',
      '../../../assets/js/data-open/open-api/recent.js',
      '../../../assets/js/data-open/open-api/quick-nav.js',
      '../../../assets/js/data-open/open-api/page.js',
    ]);
    initOpenApiPage();
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
