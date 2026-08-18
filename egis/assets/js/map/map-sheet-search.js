/**
 * 도엽검색 — 결과 패널 뷰 연동
 *
 * 커스텀 이벤트 (window):
 * - map-sheet-search:select  detail: { item, sheetNumber }
 */
const MapSheetSearch = {
  VIEW_ID: 'map-sheet-search',

  init() {
    this.form = document.querySelector('[data-map-sheet-number-form]');
    this.input = document.querySelector('[data-map-sheet-number]');
    this.result = document.querySelector('[data-map-sheet-result]');
    this.list = document.querySelector('[data-map-sheet-list]');
    this.countEl = document.querySelector('[data-map-sheet-result-count]');

    /* 입력 중에는 조회하지 않고 엔터(submit)로만 검색합니다. */
    this.form?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.search(this.input?.value);
    });

    this.getItems().forEach((item) => {
      item.addEventListener('click', () => this.select(item));
    });
  },

  getItems() {
    return [...(this.list?.querySelectorAll('[data-map-sheet-item]') ?? [])];
  },

  /**
   * 개발 연동: 지금은 마크업의 목록을 도엽번호로 걸러 보여줍니다.
   * 실제 API 연동 시 이 메서드에서 조회 결과로 목록을 그리세요.
   */
  search(rawQuery) {
    if (!this.result) return;

    const query = (rawQuery ?? '').trim();
    this.clearSelection();

    if (!query) {
      this.result.hidden = true;
      this.result.classList.remove('is-empty');
      this.getItems().forEach((item) => {
        item.parentElement.hidden = false;
      });
      this.setCount(0);
      return;
    }

    let matched = 0;
    this.getItems().forEach((item) => {
      const isMatch = (item.dataset.sheetNumber ?? '').includes(query);
      item.parentElement.hidden = !isMatch;
      if (isMatch) matched += 1;
    });

    this.setCount(matched);
    this.result.classList.toggle('is-empty', matched === 0);
    this.result.hidden = false;
  },

  select(item) {
    this.getItems().forEach((el) => {
      const isTarget = el === item;
      el.classList.toggle('active', isTarget);
      el.setAttribute('aria-selected', String(isTarget));
    });

    window.dispatchEvent(
      new CustomEvent('map-sheet-search:select', {
        detail: { item, sheetNumber: item.dataset.sheetNumber },
      })
    );
  },

  clearSelection() {
    this.getItems().forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
  },

  /** 개발 연동: 결과 건수 갱신 */
  setCount(count) {
    if (this.countEl) this.countEl.textContent = String(count);
  },

  isOpen() {
    const wrap = window.ResultPanel?.wrap;
    return (
      !!wrap &&
      !wrap.classList.contains('hidden') &&
      window.ResultPanel.activeViewId === this.VIEW_ID
    );
  },

  show() {
    window.ResultPanel?.show(this.VIEW_ID);
  },

  hide() {
    if (this.isOpen()) window.ResultPanel?.hide();
  },

  toggle() {
    if (this.isOpen()) this.hide();
    else this.show();
  },
};

window.MapSheetSearch = MapSheetSearch;
MapUi.ready(() => MapSheetSearch.init());
