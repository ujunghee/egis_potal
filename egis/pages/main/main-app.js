/** 통합화면 fragment를 조립한 뒤 페이지 기능을 시작합니다. */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../assets/js/common/datepicjer.js',
      '../../assets/js/common/header.js',
      '../../assets/js/main/hero-mode.js',
      '../../assets/js/main/hero-ai-progress.js',
      '../../assets/js/main/hero-rank.js',
      '../../assets/js/main/detail-search.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
