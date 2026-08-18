/**
 * 통합검색 공통 헤드 — 검색어 반영과 결과 구분 탭 처리.
 * index.html / dataset.html / openapi.html / faq.html / inquiry.html 이 같이 쓴다.
 *
 * 활성 탭은 body[data-search-tab] 을 먼저 보고, 없으면 ?tab= 값을 쓴다.
 * 뒤에 오는 스크립트는 window.SearchHead.{keyword, tab} 으로 결과를 받는다.
 */
(() => {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('q')?.trim() || '';
  const tabs = [...document.querySelectorAll('[data-search-tab]')];

  if (keyword) {
    const input = document.getElementById('search-keyword');
    if (input) input.value = keyword;

    document.querySelectorAll('[data-search-keyword]').forEach((el) => {
      el.textContent = keyword;
    });

    // 탭으로 이동해도 검색어가 유지되도록 링크에 다시 붙인다
    tabs.forEach((tab) => {
      const url = new URL(tab.getAttribute('href'), window.location.href);
      url.searchParams.set('q', keyword);
      tab.setAttribute('href', `${url.pathname}${url.search}`);
    });
  }

  // 섹션 '전체보기'는 같은 구분의 탭과 같은 곳으로 간다.
  // 주소가 두 군데로 갈라지지 않도록 탭 링크(검색어까지 붙은 상태)를 그대로 따른다
  document.querySelectorAll('[data-search-more]').forEach((more) => {
    const tab = tabs.find((el) => el.dataset.searchTab === more.dataset.searchMore);
    if (tab) more.setAttribute('href', tab.getAttribute('href'));
  });

  const current = document.body.dataset.searchTab || params.get('tab') || 'all';

  tabs.forEach((tab) => {
    const isActive = tab.dataset.searchTab === current;
    tab.classList.toggle('is-active', isActive);

    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });

  window.SearchHead = { keyword, tab: current };
})();
