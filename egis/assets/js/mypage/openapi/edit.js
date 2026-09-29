/** Open API 개발계정 정보 수정 — 글자수 카운터 / 저장 */
(() => {
  const form = document.querySelector('[data-oa-edit-form]');
  if (!form) return;

  const purpose = form.querySelector('[data-oa-edit-purpose]');
  const count = form.querySelector('[data-oa-edit-count]');

  const syncCount = () => {
    if (!purpose || !count) return;
    count.textContent = String(purpose.value.length);
  };

  purpose?.addEventListener('input', syncCount);
  syncCount();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    window.Toast?.warning?.('변경사항을 저장했습니다.');
    window.setTimeout(() => {
      window.location.href = './detail.html';
    }, 1200);
  });
})();
