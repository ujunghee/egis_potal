/** 고정(핀) 데이터셋 — 최대 6개 */
Topical.onPinChange = (e) => {
  const checkbox = e.target;
  if (!checkbox.matches('[data-pin]')) return;
  const itemId = Number(checkbox.dataset.id);

  if (checkbox.checked) {
    if (Topical.state.pinned.has(itemId)) return;
    if (Topical.state.pinned.size >= 6) {
      checkbox.checked = false;
      window.Toast?.warning('고정 데이터셋은 최대 6개까지 선택할 수 있습니다.');
      return;
    }
    Topical.state.pinned.add(itemId);
  } else {
    Topical.state.pinned.delete(itemId);
  }

  Topical.syncPin(itemId);
  Topical.renderPinPanel();
};

Topical.initPin = () => {
  const onListClick = (e) => {
    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn?.closest('.tp-card__bookmark')) {
      const id = Number(favBtn.dataset.favId);
      Topical.setFavorite(id, !Topical.state.favorites.has(id));
      return;
    }
    if (e.target.closest('input, label, button')) return;
    const item = e.target.closest('[data-item]');
    if (!item) return;
    const id = Number(item.dataset.item);
    Topical.addRecent(id);
    window.location.href = `./detail.html?id=${id}`;
  };

  document.querySelector('[data-result-list]')?.addEventListener('change', Topical.onPinChange);
  document.querySelector('[data-pin-list]')?.addEventListener('change', Topical.onPinChange);
  document.querySelector('[data-pin-reset]')?.addEventListener('click', () => {
    if (!Topical.state.pinned.size) return;
    window.ConfirmDialog?.show({
      title: '고정된 데이터셋을 모두 해제하시겠습니까?',
      cancelText: '취소',
      confirmText: '전체 해제',
      showIcon: true,
      onConfirm: () => {
        Topical.state.pinned.clear();
        Topical.renderResults();
      },
    });
  });
  document.querySelector('[data-result-list]')?.addEventListener('click', onListClick);
  document.querySelector('[data-pin-list]')?.addEventListener('click', onListClick);
};
