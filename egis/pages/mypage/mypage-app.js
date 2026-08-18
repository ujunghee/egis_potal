/** 마이페이지 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../assets/js/common/header.js',
      '../../assets/js/common/dataset-card.js',
      '../../assets/js/mypage/lnb.js',
      '../../assets/js/mypage/favorites.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
