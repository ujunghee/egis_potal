/** 문의하기 — 문의 구분별 유형 연동 (목록) */
(() => {
  window.EgisInquiryTypes?.bind(
    document.getElementById('inquiry-category'),
    document.getElementById('inquiry-type'),
    { emptyLabel: '문의 유형 전체' }
  );
})();
