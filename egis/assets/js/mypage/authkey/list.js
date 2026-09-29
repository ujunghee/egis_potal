/** 인증키 발급현황 — 보기 · 복사 · 재발급 */
(() => {
  const list = document.querySelector('[data-ak-list]');
  if (!list) return;

  const MASK = '***********************************************************************************';

  const getKeyValue = (card) =>
    card.querySelector('[data-ak-key]')?.getAttribute('data-ak-key-value') || '';

  list.querySelectorAll('[data-ak-card]').forEach((card) => {
    const keyEl = card.querySelector('[data-ak-key]');
    const toggleBtn = card.querySelector('[data-ak-toggle]');
    const copyBtn = card.querySelector('[data-ak-copy]');
    const reissueBtn = card.querySelector('[data-ak-reissue]');

    const setVisible = (visible) => {
      if (!keyEl || !toggleBtn) return;
      const value = getKeyValue(card);
      keyEl.dataset.masked = visible ? 'false' : 'true';
      keyEl.textContent = visible ? value : MASK;
      toggleBtn.textContent = visible ? '숨기기' : '보기';
    };

    toggleBtn?.addEventListener('click', () => {
      setVisible(keyEl?.dataset.masked !== 'false');
    });

    copyBtn?.addEventListener('click', async () => {
      await window.EgisClipboard?.copy(getKeyValue(card));
      window.Toast?.show?.('인증키가 복사되었습니다.');
    });

    reissueBtn?.addEventListener('click', () => {
      window.ConfirmDialog?.show({
        title: '인증키를 재발급하시겠습니까?',
        description: '재발급 시 기존 인증키는 즉시 만료되며,\n새로운 인증키가 발급됩니다.',
        cancelText: '취소',
        confirmText: '재발급',
        confirmVariant: 'primary',
        onConfirm: () => {
          const next = `egis-auth-key-reissued-${Date.now().toString(36)}`;
          keyEl?.setAttribute('data-ak-key-value', next);
          setVisible(false);
          window.Toast?.show?.('인증키가 재발급되었습니다.');
        },
      });
    });
  });
})();
