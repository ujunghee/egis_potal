/** 주제별지도 목록 페이지 초기화 */
function initTopicalPage() {
  Topical.renderResults();
  Topical.renderConditions();
  Topical.renderApplied();
  Topical.renderFavorites();
  Topical.renderRecent();
  Topical.renderPinPanel();

  const quickNav = Topical.initQuickNav();
  Topical.initFilter(() => quickNav?.remeasure?.());
  Topical.initCondition();
  Topical.initResults();
  Topical.initPin();
  Topical.initFavorite();
  Topical.initRecent();
}

window.initTopicalPage = initTopicalPage;
