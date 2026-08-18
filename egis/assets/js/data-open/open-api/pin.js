/** 고정(핀) 데이터셋 — 최대 6개 */
OpenApi.onPinChange = (e) => {
  const checkbox = e.target;
  if (!checkbox.matches('[data-pin]')) return;
  const itemId = Number(checkbox.dataset.id);

  if (checkbox.checked) {
    if (OpenApi.state.pinned.has(itemId)) return;
    if (OpenApi.state.pinned.size >= 6) {
      checkbox.checked = false;
      window.Toast?.warning('고정 데이터셋은 최대 6개까지 선택할 수 있습니다.');
      return;
    }
    OpenApi.state.pinned.add(itemId);
  } else {
    OpenApi.state.pinned.delete(itemId);
  }

  OpenApi.syncPin(itemId);
  OpenApi.renderPinPanel();
};

OpenApi.initPin = () => {
  const onListClick = (e) => {
    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn?.closest('.tp-card__bookmark')) {
      const id = Number(favBtn.dataset.favId);
      OpenApi.setFavorite(id, !OpenApi.state.favorites.has(id));
      return;
    }
    if (e.target.closest('input, label, button')) return;
    const item = e.target.closest('[data-item]');
    if (!item) return;
    const id = Number(item.dataset.item);
    OpenApi.addRecent(id);
    window.location.href = `./detail.html?id=${id}`;
  };

  document.querySelector('[data-result-list]')?.addEventListener('change', OpenApi.onPinChange);
  document.querySelector('[data-pin-list]')?.addEventListener('change', OpenApi.onPinChange);
  document.querySelector('[data-pin-reset]')?.addEventListener('click', () => {
    if (!OpenApi.state.pinned.size) return;
    window.ConfirmDialog?.show({
      title: '고정된 데이터셋을 모두 해제하시겠습니까?',
      cancelText: '취소',
      confirmText: '전체 해제',
      showIcon: true,
      onConfirm: () => {
        OpenApi.state.pinned.clear();
        OpenApi.renderResults();
      },
    });
  });
  document.querySelector('[data-result-list]')?.addEventListener('click', onListClick);
  document.querySelector('[data-pin-list]')?.addEventListener('click', onListClick);
};
