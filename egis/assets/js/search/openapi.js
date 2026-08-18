/** 통합검색 Open API — 결과 목록. 렌더·보기 전환·필터 칩은 공용 listing.js */
(() => {
  // API 붙이면 이 배열만 교체하면 됨
  const items = [
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
    {
      id: 'api-4',
      type: 'openapi',
      tags: ['토지피복', 'WFS', '공간'],
      title: '국가토지피복지도 피처 조회 WFS',
      date: '2025.06.18',
      provider: '환경부 · 국립환경과학원',
      format: 'WFS',
      views: 198,
    },
    {
      id: 'api-5',
      type: 'openapi',
      tags: ['토지피복', '면적', '시군구'],
      title: '시군구별 토지피복 면적 통계 API',
      date: '2025.05.09',
      provider: '환경부 · 한국환경공단',
      format: 'JSON, CSV',
      views: 412,
    },
    {
      id: 'api-6',
      type: 'openapi',
      tags: ['토지피복', '제작현황', '메타데이터'],
      title: '토지피복지도 제작 현황 조회 API',
      date: '2025.03.14',
      provider: '환경부',
      format: 'JSON, XML',
      views: 167,
    },
  ];

  window.SearchListing?.init('[data-openapi-list]', items);
})();
