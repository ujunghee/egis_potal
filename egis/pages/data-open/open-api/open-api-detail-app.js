/** Open API 상세 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../../assets/js/common/header.js',
      '../../../assets/js/data-open/open-api/detail-sticky.js',
      '../../../assets/js/data-open/open-api/detail-download.js',
      '../../../assets/js/data-open/open-api/detail-page.js',
    ]);
    initOpenApiDetail();
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
