/** Open API 개발 계정 상세 — 정상/만료, 인증키 보기·복사, 계정 삭제 */
(() => {
  const root = document.querySelector('[data-oa-detail]');
  if (!root) return;

  const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';
  const MASK = '**********************************************************';

  const activeCard = root.querySelector('[data-oa-status-active]');
  const expiredCard = root.querySelector('[data-oa-status-expired]');
  const statusText = root.querySelector('[data-oa-account-status]');
  const serviceUrl = root.querySelector('[data-oa-service-url]');
  const keyEl = root.querySelector('[data-oa-api-key]');
  const toggleBtn = root.querySelector('[data-oa-toggle-key]');
  const copyBtn = root.querySelector('[data-oa-copy-key]');
  const deleteBtn = root.querySelector('[data-oa-delete]');
  const extendBtn = root.querySelector('[data-oa-extend]');

  const params = new URLSearchParams(window.location.search);
  const isExpired = params.get('status') === 'expired';

  root.dataset.oaStatus = isExpired ? 'expired' : 'active';

  // 만료되었을때: expiredCard.hidden 해제 / activeCard.hidden 처리
  if (isExpired) {
    if (activeCard) activeCard.hidden = true;
    if (expiredCard) expiredCard.hidden = false;
    if (statusText) statusText.textContent = '만료';
    if (serviceUrl) serviceUrl.textContent = 'www.nature.com';
  }

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

  
  deleteBtn?.addEventListener('click', () => {
    window.ConfirmDialog?.show({
      title: '삭제하시겠습니까?',
      description: '삭제 시 인증키 사용이 즉시 중단되며,\n이후 재신청이 필요합니다.',
      cancelText: '취소',
      confirmText: '삭제하기',
      confirmVariant: 'danger',
      onConfirm: () => {
        window.Toast?.show?.('계정이 삭제되었습니다.');
        window.location.href = './index.html';
      },
    });
  });

  
  extendBtn?.addEventListener('click', () => {
    window.ConfirmDialog?.show({
      title: '연장 신청하시겠습니까?',
      description: '승인 시 이용 기간이 00개월 연장되며,\n만료일은 2028-12-29로 변경됩니다.',
      cancelText: '취소',
      confirmText: '확인',
      confirmVariant: 'primary',
      showIcon: false,
      onConfirm: () => {
        window.Toast?.show?.('연장 신청이 완료되었습니다.');
      },
    });
  });
})();