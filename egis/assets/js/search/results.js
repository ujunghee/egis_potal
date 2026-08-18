/** 통합검색 결과(전체) — 구분별 미리보기 카드 렌더와 섹션 노출 */
(() => {
  const sections = [...document.querySelectorAll('[data-search-section]')];
  if (!window.DatasetCard) return;

  // 미리보기 3건씩. API 붙이면 이 객체만 교체하면 됨
  const results = {
    dataset: [
      {
        id: 'ds-1',
        type: 'dataset',
        tags: ['토지피복', '시계열 변화', '토지피복 변화량'],
        title: '토지피복 시계열 변화량(1980-2010)',
        date: '2025.10.27',
        provider: '환경부 · 국립환경과학원',
        format: 'SHP, CSV',
        views: 675,
      },
      {
        id: 'ds-2',
        type: 'dataset',
        tags: ['토지피복', '세분류', '2023'],
        title: '세분류 토지피복지도(2023)',
        date: '2025.09.30',
        provider: '환경부 · 국립환경과학원',
        format: 'SHP',
        views: 412,
      },
      {
        id: 'ds-3',
        type: 'dataset',
        tags: ['토지피복', '대분류', '전국'],
        title: '대분류 토지피복지도(1980-2020)',
        date: '2025.08.14',
        provider: '환경부 · 국립환경과학원',
        format: 'SHP, GeoTIFF',
        views: 908,
      },
    ],
    openapi: [
      {
        id: 'api-1',
        type: 'openapi',
        tags: ['토지피복', 'WMS', '지도 서비스'],
        title: '국가토지피복지도 조회 WMS',
        date: '2025.10.27',
        provider: '환경부 · 국립환경과학원',
        format: 'WMS',
        views: 675,
      },
      {
        id: 'api-2',
        type: 'openapi',
        tags: ['토지피복', '변화량', '통계'],
        title: '토지피복 변화량 통계 조회 API',
        date: '2025.10.02',
        provider: '환경부 · 국립환경과학원',
        format: 'JSON, XML',
        views: 341,
      },
      {
        id: 'api-3',
        type: 'openapi',
        tags: ['토지피복', '분류코드', '코드 조회'],
        title: '토지피복 분류코드 조회 API',
        date: '2025.07.21',
        provider: '환경부 · 국립환경과학원',
        format: 'JSON',
        views: 256,
      },
    ],
  };

  const renderCards = () => {
    Object.entries(results).forEach(([type, items]) => {
      const list = document.querySelector(`[data-search-cards="${type}"]`);
      if (!list) return;

      list.innerHTML = items
        .map((item) =>
          DatasetCard.render(item, {
            showCheckbox: false,
            showBookmark: false,
            showPortalLink: true,
            pinAttr: false,
          }),
        )
        .join('');
    });
  };

  // 구분별 전용 화면이 있으므로, 여기서는 전체 탭 미리보기만 다룬다
  const showSectionsFor = (tab) => {
    sections.forEach((section) => {
      section.hidden = tab !== 'all' && section.dataset.searchSection !== tab;
    });
  };

  showSectionsFor(window.SearchHead?.tab || 'all');
  renderCards();
})();
