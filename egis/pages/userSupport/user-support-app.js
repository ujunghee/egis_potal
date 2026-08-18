/** 이용자 지원 — fragment 로드 후 페이지별 기능 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();

    const scripts = ['../../assets/js/common/header.js'];

    if (
      document.getElementById('inquiry-category') ||
      document.getElementById('inquiry-write-category')
    ) {
      scripts.push('../../assets/js/user-support/inquiry-types.js');
    }
    if (document.querySelector('[data-faq-list]')) {
      scripts.push('../../assets/js/user-support/faq.js');
    }
    if (document.getElementById('inquiry-category')) {
      scripts.push('../../assets/js/user-support/inquiry.js');
    }
    if (document.querySelector('[data-inquiry-write-form]')) {
      scripts.push('../../assets/js/user-support/inquiry-write.js');
    }

    await window.ScriptLoader.loadSequentially(scripts);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
