const SpatialSearchResults = {
  panel: null,
  init() {
    this.panel = document.querySelector('[data-spatial-search-results]');
    if (!this.panel) return;

    this.collapseButton = this.panel.querySelector('[data-spatial-results-collapse]');
    this.closeButton = this.panel.querySelector('[data-spatial-results-close]');
    this.tabs = [...this.panel.querySelectorAll('[data-spatial-results-tab]')];

    this.collapseButton?.addEventListener('click', () => this.toggle());
    this.closeButton?.addEventListener('click', () => this.hide());
    this.tabs.forEach((tab) => tab.addEventListener('click', () => this.selectTab(tab)));

    window.addEventListener('spatial-search:search', () => this.show());
    window.addEventListener('spatial-search:clear', () => this.hide());
  },
  show() {
    MapUi.show(this.panel);
    this.panel.classList.remove('is-collapsed');
    this.collapseButton?.setAttribute('aria-expanded', 'true');
  },
  hide() { MapUi.hide(this.panel); },
  toggle() {
    const collapsed = this.panel.classList.toggle('is-collapsed');
    this.collapseButton.setAttribute('aria-expanded', String(!collapsed));
    this.collapseButton.querySelector('.blind').textContent = collapsed ? '공간검색 결과 펼치기' : '공간검색 결과 접기';
  },
  selectTab(selectedTab) {
    this.tabs.forEach((tab) => {
      const selected = tab === selectedTab;
      tab.classList.toggle('active', selected);
      tab.classList.toggle('color-slate-600', !selected);
      tab.setAttribute('aria-selected', String(selected));
    });
  }
};

window.SpatialSearchResults = SpatialSearchResults;
MapUi.ready(() => SpatialSearchResults.init());
