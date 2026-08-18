/** 통합검색 자주 묻는 질문 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      '../../assets/js/common/header.js',
      '../../assets/js/search/search-head.js',
      '../../assets/js/user-support/faq.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
