/**
 * 다운로드 내역 — 선택 영역 보기 팝업
 * Figma: 1762:3894 (전체) / 1762:3895 (지역 선택) / 1762:3953 (지도에서 선택)
 */
(() => {
  const regionsModal = document.querySelector('[data-dl-area-modal="regions"]');
  const mapModal = document.querySelector('[data-dl-area-modal="map"]');
  if (!regionsModal && !mapModal) return;

  const overviewView = regionsModal?.querySelector('[data-dl-area-view="overview"]');
  const focusView = regionsModal?.querySelector('[data-dl-area-view="focus"]');
  const items = regionsModal ? [...regionsModal.querySelectorAll('[data-dl-area-item]')] : [];

  const setRegionsMode = (mode, itemId = null) => {
    if (!regionsModal) return;
    const isFocus = mode === 'focus';
    if (overviewView) overviewView.hidden = isFocus;
    if (focusView) focusView.hidden = !isFocus;

    items.forEach((item) => {
      const active = isFocus && item.getAttribute('data-dl-area-item') === String(itemId);
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const openModal = (type) => {
    const modal = type === 'map' ? mapModal : regionsModal;
    if (!modal || typeof modal.showModal !== 'function') return;
    if (type === 'regions') setRegionsMode('overview');
    modal.showModal();
  };

  const closeModal = (modal) => {
    if (modal?.open) modal.close();
  };

  document.addEventListener('click', (event) => {
    const openBtn = event.target.closest('[data-dl-area-open]');
    if (openBtn) {
      openModal(openBtn.getAttribute('data-dl-area-open') || 'regions');
      return;
    }

    const closeBtn = event.target.closest('[data-dl-area-close]');
    if (closeBtn) {
      closeModal(closeBtn.closest('dialog'));
      return;
    }

    const allBtn = event.target.closest('[data-dl-area-all]');
    if (allBtn) {
      setRegionsMode('overview');
      return;
    }

    const itemBtn = event.target.closest('[data-dl-area-item]');
    if (itemBtn) {
      setRegionsMode('focus', itemBtn.getAttribute('data-dl-area-item'));
    }
  });

  [regionsModal, mapModal].forEach((modal) => {
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });
})();
