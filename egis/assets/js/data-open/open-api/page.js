/** Open API 목록 페이지 초기화 */
function initOpenApiPage() {
  OpenApi.renderResults();
  OpenApi.renderConditions();
  OpenApi.renderApplied();
  OpenApi.renderFavorites();
  OpenApi.renderRecent();
  OpenApi.renderPinPanel();

  const quickNav = OpenApi.initQuickNav();
  OpenApi.initFilter(() => quickNav?.remeasure?.());
  OpenApi.initCondition();
  OpenApi.initResults();
  OpenApi.initPin();
  OpenApi.initFavorite();
  OpenApi.initRecent();
}

window.initOpenApiPage = initOpenApiPage;
