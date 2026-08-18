/** 로그인 — fragment 로드 후 페이지 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../assets/js/common/header.js',
      '../../assets/js/login/page.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
