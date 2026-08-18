/** Open API 개발 계정 상세 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../../assets/js/common/header.js',
      '../../../assets/js/common/confirm-dialog.js',
      '../../../assets/js/mypage/lnb.js',
      '../../../assets/js/mypage/openapi/detail.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
