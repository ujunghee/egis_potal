/** Open API 개발계정 정보 수정 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../../assets/js/common/header.js',
      '../../../assets/js/mypage/lnb.js',
      '../../../assets/js/mypage/openapi/edit.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
