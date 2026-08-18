/** 관심 데이터 모달 */
Topical.initFavorite = () => {
  const modal = document.querySelector('[data-fav-modal]');

  document.querySelector('[data-fav-open]')?.addEventListener('click', () => {
    Topical.renderFavorites();
    modal?.showModal();
  });
  document.querySelector('[data-fav-close]')?.addEventListener('click', () => modal?.close());
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
    const btn = e.target.closest('[data-fav-id]');
    if (btn) Topical.setFavorite(Number(btn.dataset.favId), false);
  });

  document.querySelectorAll('[data-fav-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      Topical.state.favView = btn.dataset.favView;
      document.querySelectorAll('[data-fav-view]').forEach((item) => {
        const active = item === btn;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      Topical.renderFavorites();
    });
  });
};
