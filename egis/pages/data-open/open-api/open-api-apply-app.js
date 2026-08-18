/** Open API 개발계정 신청 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../../assets/js/common/header.js',
      '../../../assets/js/common/checkbox.js',
      '../../../assets/js/data-open/open-api/apply.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
