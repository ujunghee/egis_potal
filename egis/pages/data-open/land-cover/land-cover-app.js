/** 국가토지피복 통계 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../../assets/js/common/header.js',
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
      '../../../assets/js/data-open/land-cover/land-cover-filter.js',
      '../../../assets/js/data-open/land-cover/land-cover-delta.js',
      '../../../assets/js/data-open/land-cover/land-cover-tabs.js',
      '../../../assets/js/data-open/land-cover/land-cover-green.js',
      '../../../assets/js/data-open/land-cover/land-cover-chart.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
