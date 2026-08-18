/**
 * Base Resource Map — 기초자원지도 패널 (검색 + 레이어 목록, 필터 없음)
 *
 * 트리·툴팁·정보 보기: integrated-search-tree.js와 integrated-search-layer-info.js의 공통 data 속성 사용
 * 체크 Indeterminate      : checkbox.js (data-checkall-target)
 *
 * 커스텀 이벤트 (window):
 * - base-resource-map:search        detail: { query, input }
 * - base-resource-map:layer-change  detail: { layerId, checked, checkbox, node }
 */

const BaseResourceMap = {
  root: null,

  init() {
    this.root = document.querySelector('#result-panel-view-base-resource-map');
    if (!this.root) return;

    this.bindSearch();
    this.bindLayerEvents();
    this.updateCounts();
  },

  bindSearch() {
    const input = this.root.querySelector('[data-integrated-search-input]');
    const form = this.root.querySelector('[data-integrated-search-form]');

    const dispatchSearch = () => {
      if (!input) return;
      window.dispatchEvent(
        new CustomEvent('base-resource-map:search', {
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

  dispatchLayerChange(checkbox) {
    const node = checkbox.closest('[data-integrated-search-node]');
    if (!node) return;

    window.dispatchEvent(
      new CustomEvent('base-resource-map:layer-change', {
        detail: {
          layerId: checkbox.value,
          checked: checkbox.checked,
          checkbox,
          node,
        },
      })
    );
  },

  getChildNodes(node) {
    return getIntegratedSearchChildNodes(node);
  },

  getNodeCheckbox(node) {
    return getIntegratedSearchNodeCheckbox(node);
  },

  isLeafNode(node) {
    return this.getChildNodes(node).length === 0;
  },

  getAllLeafCheckboxes() {
    return [...this.root.querySelectorAll('[data-integrated-search-node]')]
      .filter((node) => this.isLeafNode(node))
      .map((node) => this.getNodeCheckbox(node))
      .filter(Boolean);
  },

  getLeafCheckboxes(rootNode) {
    return getIntegratedSearchLeafCheckboxes(rootNode);
  },

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

  setTotalCount(count) {
    const el = this.root?.querySelector('[data-integrated-search-total]');
    if (el) el.textContent = String(count);
  },
};

window.BaseResourceMap = BaseResourceMap;

function bootBaseResourceMap() {
  BaseResourceMap.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootBaseResourceMap);
} else {
  bootBaseResourceMap();
}
