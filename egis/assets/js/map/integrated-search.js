/** 통합검색 화면 초기화와 외부 연동 */
// 개발 연동: window.IntegratedSearch와 integrated-search:* 이벤트 사용

const IntegratedSearch = {
  root: null,
  filterOpen: false,

  /** 통합검색 기능 최초 1회 초기화 */
  init() {
    this.root = document.querySelector('#result-panel-view-integrated-search');
    if (!this.root) return;

    initIntegratedSearchFilterEvents();
    initIntegratedSearchLayerInfoPanelControls(document);
    this.bindTreeExpand(this.root);
    this.bindInfoTooltip(this.root);
    this.bindLayerInfo(this.root);
    this.bindFilterPanel(this.root);
    this.initFilterPanel();
    setIntegratedSearchFilterOpen(this.root, false);
    this.bindSearch();
    this.bindLayerEvents();
    this.updateCounts();
  },

  /** 상세 필터 열림 상태 변경 */
  setFilterOpen(open) {
    if (!this.root) return;
    setIntegratedSearchFilterOpen(this.root, open);
  },

  /** 필터 초기 화면 설정 */
  initFilterPanel() {
    const filterPanel = this.getFilterPanel();
    if (!filterPanel) return;

    this.syncFilterMidGroups();
    this.syncFilterChips();
    this.syncFilterCount();
  },

  /** 선택 필터 개수 갱신 */
  syncFilterCount() {
    const filterPanel =
      this.getFilterPanel() || document.querySelector('[data-integrated-search-filter-panel]');
    syncIntegratedSearchFilterCount(filterPanel);
  },

  /** 대분류에 맞는 중분류 갱신 */
  syncFilterMidGroups(options = {}) {
    const filterPanel =
      this.getFilterPanel() || document.querySelector('[data-integrated-search-filter-panel]');
    syncIntegratedSearchFilterMidGroups(filterPanel, options);
  },

  /** 선택한 대분류 칩 갱신 */
  syncFilterChips() {
    const filterPanel =
      this.getFilterPanel() || document.querySelector('[data-integrated-search-filter-panel]');
    syncIntegratedSearchFilterChips(filterPanel);
  },

  /** 필터 전체 초기화 */
  resetFilterPanel() {
    resetIntegratedSearchFilterPanel(this.getFilterPanel());
  },

  /** API 연동용 필터값 반환 */
  getFilterState() {
    const filterPanel = this.getFilterPanel();
    if (!filterPanel) return { majors: [], mids: [] };

    return {
      majors: [...filterPanel.querySelectorAll('[data-integrated-search-filter-major]:checked')].map((el) => ({
        value: el.value,
        label: filterPanelLabel(el),
      })),
      mids: [...filterPanel.querySelectorAll('input[data-integrated-search-filter-mid]:checked')].map((el) => ({
        value: el.value,
        parent: el.dataset.integratedSearchFilterMidParent,
        label: filterPanelLabel(el),
      })),
    };
  },

  /** 필터 변경 이벤트 전달 */
  dispatchFilterChange() {
    window.dispatchEvent(
      new CustomEvent('integrated-search:filter-change', {
        detail: this.getFilterState(),
      })
    );
  },

  /** 검색 폼과 Enter 이벤트 연결 */
  bindSearch() {
    const input = this.root.querySelector('[data-integrated-search-input]');
    const form = this.root.querySelector('[data-integrated-search-form]');

    // 검색어 정리 후 연동 이벤트로 전달
    const dispatchSearch = () => {
      if (!input) return;
      window.dispatchEvent(
        new CustomEvent('integrated-search:search', {
          detail: { query: input.value.trim(), input },
        })
      );
    };

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      dispatchSearch();
    });

    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        dispatchSearch();
      }
    });
  },

  /** 레이어 체크와 전체 선택 연결 */
  bindLayerEvents() {
    if (this.layerEventsBound) return;
    this.layerEventsBound = true;

    this.root.addEventListener('change', (event) => {
      const checkbox = event.target;
      if (!checkbox.matches('[data-integrated-search-layer]')) return;

      const node = checkbox.closest('[data-integrated-search-node]');
      if (node && this.isLeafNode(node)) {
        this.dispatchLayerChange(checkbox);
      }
    });
  },

  /** 변경된 레이어 정보 전달 */
  dispatchLayerChange(checkbox) {
    const node = checkbox.closest('[data-integrated-search-node]');
    if (!node) return;

    window.dispatchEvent(
      new CustomEvent('integrated-search:layer-change', {
        detail: {
          layerId: checkbox.value,
          checked: checkbox.checked,
          checkbox,
          node,
        },
      })
    );
  },

  /** 바로 아래 자식 노드 찾기 */
  getChildNodes(node) {
    return getIntegratedSearchChildNodes(node);
  },

  /** 노드에 연결된 체크박스 찾기 */
  getNodeCheckbox(node) {
    return getIntegratedSearchNodeCheckbox(node);
  },

  /** 최하위 트리 노드 여부 확인 */
  isLeafNode(node) {
    return this.getChildNodes(node).length === 0;
  },

  /** 전체 최하위 레이어 체크박스 찾기 */
  getAllLeafCheckboxes() {
    return [...this.root.querySelectorAll('[data-integrated-search-node]')]
      .filter((node) => this.isLeafNode(node))
      .map((node) => this.getNodeCheckbox(node))
      .filter(Boolean);
  },

  /** 노드 아래 최하위 체크박스 수집 */
  getLeafCheckboxes(rootNode) {
    return getIntegratedSearchLeafCheckboxes(rootNode);
  },

  /** 전체·분류별 선택 개수 갱신 */
  updateCounts() {
    const catalogTotal = this.root.querySelector('[data-integrated-search-catalog-total]')?.dataset
      .integratedSearchCatalogTotal;
    this.setTotalCount(catalogTotal ?? this.getAllLeafCheckboxes().length);

    this.root.querySelectorAll('.integrated-search__count[data-integrated-search-node-count]').forEach((badge) => {
      const node = badge.closest('[data-integrated-search-node]');
      if (!node) return;

      const selected = getIntegratedSearchNodeSelectedCount(node);
      const leaves = this.getLeafCheckboxes(node);
      const nodeTotal = badge.dataset.integratedSearchNodeTotal;
      const total = nodeTotal ? Number(nodeTotal) : leaves.length;

      updateIntegratedSearchNodeCount(badge, selected, total || undefined);
    });
  },

  /** 전체 검색 결과 개수 표시 */
  setTotalCount(count) {
    const el = this.root?.querySelector('[data-integrated-search-total]');
    if (el) el.textContent = String(count);
  },

  /** 트리 노드 선택 개수 표시 */
  setNodeCount(nodeId, selected, total) {
    const badge = this.root?.querySelector(
      `[data-integrated-search-node="${nodeId}"] [data-integrated-search-node-count]`
    );
    if (badge) {
      updateIntegratedSearchNodeCount(badge, selected, total);
    }
  },

  /** 추가된 트리 노드에 펼침 버튼 연결 */
  bindTreeExpand(scope = document) {
    scope.querySelectorAll('[data-integrated-search-expand]').forEach((btn) => {
      initTreeExpand(btn);
    });
  },

  /** 현재 상세 필터 찾기 */
  getFilterPanel() {
    return this.root?.querySelector('[data-integrated-search-filter-panel]');
  },

  /** 현재 데이터 목록 찾기 */
  getCatalog() {
    return this.root?.querySelector('[data-integrated-search-catalog]');
  },

  /** 추가된 정보 버튼에 툴팁 연결 */
  bindInfoTooltip(scope = document) {
    scope.querySelectorAll('[data-integrated-search-info]').forEach((btn) => {
      initIntegratedSearchTooltip(btn);
    });
  },

  /** 추가된 정보 버튼에 상세 패널 연결 */
  bindLayerInfo(scope = document) {
    scope.querySelectorAll('[data-integrated-search-info]').forEach((btn) => {
      initIntegratedSearchLayerInfo(btn);
    });
  },

  /** 추가된 필터 버튼 연결 */
  bindFilterPanel(scope = document) {
    scope.querySelectorAll('[data-integrated-search-filter]').forEach((btn) => {
      initIntegratedSearchFilter(btn);
    });
    scope.querySelectorAll('[data-integrated-search-filter-toggle]').forEach((toggle) => {
      initFilterSectionToggle(toggle);
    });
  },
};

window.IntegratedSearch = IntegratedSearch;
window.initTreeExpand = initTreeExpand;
window.initIntegratedSearchFilter = initIntegratedSearchFilter;
window.initFilterSectionToggle = initFilterSectionToggle;
window.setIntegratedSearchFilterOpen = setIntegratedSearchFilterOpen;
window.openIntegratedSearchLayerInfoPanel = openIntegratedSearchLayerInfoPanel;
window.closeIntegratedSearchLayerInfoPanel = closeIntegratedSearchLayerInfoPanel;

/** DOM 준비 후 통합검색 실행 */
function bootIntegratedSearch() {
  IntegratedSearch.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootIntegratedSearch);
} else {
  bootIntegratedSearch();
}
