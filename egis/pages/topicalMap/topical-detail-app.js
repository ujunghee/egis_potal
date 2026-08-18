/** 주제별지도 상세 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../assets/js/common/header.js',
      '../../assets/js/topical/detail-sticky.js',
      '../../assets/js/topical/detail-download.js',
      '../../assets/js/topical/detail-page.js',
    ]);
    initTopicalDetail();
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
