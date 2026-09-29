/** AI 검색 결과 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../assets/js/common/datepicjer.js',
      '../../assets/js/common/header.js',
      '../../assets/js/common/dataset-card.js',
      '../../assets/js/search/quick-nav.js',
      '../../assets/js/search/favorites-recent.js',
      '../../assets/js/search/listing.js',
      '../../assets/js/search/ai-results.js',
      '../../assets/js/search/ai-condition.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
