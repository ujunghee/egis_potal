/** 환경 시각화 도구 — fragment 조립 후 페이지 기능 시작 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
      'https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js',
      '../../assets/js/common/header.js',
      '../../assets/js/visual-tool/treemap.js',
      '../../assets/js/visual-tool/step-cat-sync.js',
      '../../assets/js/visual-tool/relation-map.js',
      '../../assets/js/visual-tool/expand-map.js',
      '../../assets/js/visual-tool/tabs.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
