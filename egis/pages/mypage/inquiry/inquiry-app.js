/** 나의 문의 목록 — fragment 로드 후 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../../assets/js/common/datepicjer.js',
      '../../../assets/js/common/header.js',
      '../../../assets/js/user-support/inquiry-types.js',
      '../../../assets/js/mypage/lnb.js',
      '../../../assets/js/mypage/inquiry/list.js',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
