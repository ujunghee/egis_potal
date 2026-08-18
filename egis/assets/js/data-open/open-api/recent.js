/** 최근 본 데이터 패널 — 빠른 메뉴와 같은 래퍼에서 함께 이동 */
OpenApi.initRecent = () => {
  const toggle = document.querySelector('[data-recent-open]');
  const panel = document.querySelector('[data-recent-panel]');

  const openPanel = () => {
    if (!panel || !toggle) return;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    OpenApi.renderRecent();
    requestAnimationFrame(() => panel.classList.add('is-open'));
  };

  const close = () => {
    if (!panel || !toggle) return;
    panel.classList.remove('is-open');
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!panel) return;
    if (panel.hidden) openPanel();
    else close();
  });

  document.querySelector('[data-recent-close]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  panel?.addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.target.closest('[data-fav-id]');
    if (!btn) return;
    OpenApi.setFavorite(Number(btn.dataset.favId), !OpenApi.state.favorites.has(Number(btn.dataset.favId)));
  });

  // X 외 바깥(결과 목록·필터 등)을 누르면 닫기
  document.addEventListener('click', (e) => {
    if (!panel || panel.hidden) return;
    if (panel.contains(e.target) || toggle?.contains(e.target)) return;
    close();
  });
};
