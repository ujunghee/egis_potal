/** AI 데이터셋 — fragment 로드 후 공통 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially(['../../../assets/js/common/header.js']);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
