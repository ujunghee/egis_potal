/** 통합검색 문의하기 — 적용된 필터 칩. 목록 마크업은 fragment */
(() => {
  window.SearchListing?.initApplied();

  // 필터 초기화 시 답변 여부도 기본값(전체)으로 되돌린다
  document.querySelector('[data-search-filter-reset]')?.addEventListener('click', () => {
    const answerAll = document.getElementById('iq-answer-all');
    if (answerAll) answerAll.checked = true;
  });
})();
