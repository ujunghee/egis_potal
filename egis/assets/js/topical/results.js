/** 검색 결과·보기 전환 */
Topical.initResults = () => {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      Topical.state.view = btn.dataset.view;
      document.querySelectorAll('[data-view]').forEach((item) => {
        const active = item === btn;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      Topical.renderResults();
    });
  });

  document.querySelector('[data-search-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('tp:search', {
      detail: {
        keyword: document.querySelector('#search-keyword')?.value.trim() ?? '',
        conditions: Topical.state.conditions.map((c) => ({ ...c })),
      },
    }));
  });
};
