/**
 * Open API 운영계정 신청 상세 — 인증키 보기/복사
 * 완료 `prod-detail.html` / 심사중 `prod-detail-review.html` / 반려 `prod-detail-rejected.html`
 */
(() => {
  const root = document.querySelector('[data-oa-prod-detail]');
  if (!root) return;

  const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';
  const MASK = '**********************************************************';

  const keyEl = root.querySelector('[data-oa-prod-api-key]');
  const toggleBtn = root.querySelector('[data-oa-prod-toggle-key]');
  const copyBtn = root.querySelector('[data-oa-prod-copy-key]');

  const setKeyVisible = (visible) => {
    if (!keyEl || !toggleBtn) return;
    keyEl.dataset.masked = visible ? 'false' : 'true';
    keyEl.textContent = visible ? API_KEY : MASK;
    toggleBtn.textContent = visible ? '숨기기' : '보기';
  };

  toggleBtn?.addEventListener('click', () => {
    setKeyVisible(keyEl?.dataset.masked !== 'false');
  });

  copyBtn?.addEventListener('click', async () => {
    await window.EgisClipboard?.copy(API_KEY);
    window.Toast?.show?.('인증키가 복사되었습니다.');
  });
})();
