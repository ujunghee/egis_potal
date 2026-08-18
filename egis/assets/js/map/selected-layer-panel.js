/**
 * Selected Layer Panel — 선택한 레이어 우측 패널
 *
 * 커스텀 이벤트 (window):
 * - selected-layer-panel:open
 * - selected-layer-panel:close
 * - selected-layer-item:expand    detail: { expanded, item }
 * - selected-layer-item:visibility detail: { visible, item }
 * - selected-layer-item:remove     detail: { item }
 * - selected-layer-item:opacity    detail: { value, item }
 * - selected-layer:reorder         detail: { item, oldIndex, newIndex, method, order }
 */

const SelectedLayerPanel = {
  panel: null,
  mapView: null,
  list: null,
  countEl: null,
  openButtons: [],
  sortable: null,

  init() {
    this.panel = document.querySelector('[data-selected-layer-panel]');
    if (!this.panel) return;

    this.mapView = document.querySelector('.map-view');
    this.list = this.panel.querySelector('[data-selected-layer-list]');
    this.countEl = this.panel.querySelector('[data-selected-layer-count]');
    this.openButtons = Array.from(document.querySelectorAll('[data-selected-layer-panel-open]'));

    this.bindPanelToggle();
    this.bindItems();
    this.initSorting();
    this.initOpenButtonTooltips();
    this.updateCount();
    this.syncOpenButtonState();
  },

  bindPanelToggle() {
    this.openButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggle();
      });
    });

    this.panel.querySelectorAll('[data-selected-layer-panel-close]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        this.close();
      });
    });
  },

  initOpenButtonTooltips() {
    if (typeof window.initIntegratedSearchTooltip !== 'function') return;

    this.openButtons.forEach((btn) => {
      window.initIntegratedSearchTooltip(btn);
    });
  },

  syncOpenButtonState() {
    const isOpen = this.isOpen();

    this.openButtons.forEach((btn) => {
      btn.classList.toggle('is-active', isOpen);
      btn.setAttribute('aria-pressed', String(isOpen));
      btn.querySelector('.map-layer-plus-icon')?.classList.toggle('active', isOpen);
    });
  },

  bindItems() {
    this.panel.querySelectorAll('[data-selected-layer-item]').forEach((item) => {
      this.bindItem(item);
    });
  },

  initSorting() {
    if (!this.list || typeof window.Sortable !== 'function') return;

    this.sortable = window.Sortable.create(this.list, {
      animation: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      handle: '.selected-layer-item__drag',
      draggable: '[data-selected-layer-item]',
      dataIdAttr: 'data-selected-layer-item',
      direction: 'vertical',
      // 펼쳐진 카드는 네이티브 DnD가 버벅여서 transform 폴백 사용
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 4,
      swapThreshold: 0.65,
      chosenClass: 'selected-layer-item--chosen',
      ghostClass: 'selected-layer-item--ghost',
      dragClass: 'selected-layer-item--drag',
      onStart: () => {
        this.list.classList.add('is-sorting');
        document.body.classList.add('is-selected-layer-sorting');
      },
      onEnd: ({ item, oldIndex, newIndex }) => {
        this.list.classList.remove('is-sorting');
        document.body.classList.remove('is-selected-layer-sorting');
        this.notifyOrderChange(item, oldIndex, newIndex, 'drag');
      },
    });

    this.list.querySelectorAll('.selected-layer-item__drag').forEach((handle) => {
      handle.addEventListener('keydown', (event) => this.handleKeyboardSort(event, handle));
    });
  },

  handleKeyboardSort(event, handle) {
    if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;

    const item = handle.closest('[data-selected-layer-item]');
    if (!item) return;

    const items = this.getItems();
    const oldIndex = items.indexOf(item);
    const newIndex = event.key === 'ArrowUp' ? oldIndex - 1 : oldIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    event.preventDefault();
    if (event.key === 'ArrowUp') {
      this.list.insertBefore(item, items[newIndex]);
    } else {
      this.list.insertBefore(item, items[newIndex].nextSibling);
    }

    handle.focus();
    this.notifyOrderChange(item, oldIndex, newIndex, 'keyboard');
  },

  getItems() {
    return [...this.list.querySelectorAll('[data-selected-layer-item]')];
  },

  getOrder() {
    return this.getItems().map((item) => item.dataset.selectedLayerItem);
  },

  notifyOrderChange(item, oldIndex, newIndex, method) {
    if (oldIndex === newIndex) return;

    const name = item.querySelector('.selected-layer-item__name')?.textContent.trim() || '레이어';
    const status = this.panel.querySelector('[data-selected-layer-order-status]');
    if (status) status.textContent = `${name} 레이어가 ${newIndex + 1}번째로 이동했습니다.`;

    window.dispatchEvent(new CustomEvent('selected-layer:reorder', {
      detail: { item, oldIndex, newIndex, method, order: this.getOrder() },
    }));
  },

  bindItem(item) {
    const expandBtn = item.querySelector('[data-selected-layer-expand]');
    expandBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      const expanded = item.classList.toggle('is-expanded');
      expandBtn.setAttribute('aria-expanded', String(expanded));
      window.dispatchEvent(
        new CustomEvent('selected-layer-item:expand', {
          detail: { expanded, item },
        })
      );
    });

    const visibilityBtn = item.querySelector('[data-selected-layer-visibility]');
    visibilityBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      const hidden = item.classList.toggle('is-hidden-layer');
      const isVisible = !hidden;
      visibilityBtn.setAttribute('aria-pressed', String(isVisible));
      window.dispatchEvent(
        new CustomEvent('selected-layer-item:visibility', {
          detail: { visible: isVisible, item },
        })
      );
    });

    const removeBtn = item.querySelector('[data-selected-layer-remove]');
    removeBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      item.remove();
      this.updateCount();
      window.dispatchEvent(
        new CustomEvent('selected-layer-item:remove', {
          detail: { item },
        })
      );
    });

    item.querySelectorAll('[data-selected-layer-tab]').forEach((tab) => {
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        this.activateTab(item, tab.dataset.selectedLayerTab);
      });
    });

    item.querySelectorAll('[data-selected-layer-switch]').forEach((input) => {
      input.addEventListener('change', () => {
        const stateEl = input.closest('.selected-layer-item__setting-control')?.querySelector('[data-selected-layer-switch-state]');
        if (!stateEl) return;

        if (input.dataset.selectedLayerSwitch === 'attribute') {
          stateEl.textContent = input.checked ? '선택됨' : '미선택';
        } else if (input.dataset.selectedLayerSwitch === 'label') {
          stateEl.textContent = input.checked ? '표시' : '숨김';
        }
      });
    });

    const opacityInput = item.querySelector('[data-selected-layer-opacity]');
    const opacityValue = item.querySelector('[data-selected-layer-opacity-value]');
    opacityInput?.addEventListener('input', () => {
      if (opacityValue) opacityValue.textContent = `${opacityInput.value}%`;
      window.dispatchEvent(
        new CustomEvent('selected-layer-item:opacity', {
          detail: { value: Number(opacityInput.value), item },
        })
      );
    });

    item.querySelectorAll('.selected-layer-item__help').forEach((btn) => {
      if (typeof window.initIntegratedSearchTooltip === 'function') {
        window.initIntegratedSearchTooltip(btn);
      }
    });

    this.bindPaletteTooltips(item);

    item.querySelector('[data-selected-layer-legend-more]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!item.classList.contains('is-expanded')) {
        item.classList.add('is-expanded');
        const expandBtn = item.querySelector('[data-selected-layer-expand]');
        expandBtn?.setAttribute('aria-expanded', 'true');
      }
      this.activateTab(item, 'legend');
    });
  },

  /** 스와치는 개별 범례 툴팁, + 버튼은 전체 범례 목록 툴팁 */
  bindPaletteTooltips(item) {
    if (typeof window.initIntegratedSearchTooltip !== 'function') return;

    item.querySelectorAll('.selected-layer-item__palette').forEach((palette) => {
      const legends = [...palette.querySelectorAll('[data-legend-name]')];
      if (!legends.length) return;

      legends.forEach((legend) => {
        this.attachPaletteTooltip(legend, [legend], 'bottom-start', false);
      });

      const moreBtn = palette.querySelector('[data-selected-layer-legend-more]');
      if (moreBtn) {
        this.attachPaletteTooltip(moreBtn, legends, 'bottom-start', true);
      }
    });
  },

  attachPaletteTooltip(trigger, legends, placement, withSwatch) {
    if (trigger.querySelector('.selected-layer-item__palette-tooltip')) return;

    trigger.dataset.tooltipPlacement = placement;
    trigger.appendChild(this.createPaletteTooltip(legends, withSwatch));
    window.initIntegratedSearchTooltip(trigger);
  },

  /** data-legend-name / data-legend-value 값으로 툴팁 DOM 생성 */
  createPaletteTooltip(legends, withSwatch) {
    const tooltip = document.createElement('span');
    tooltip.className = 'selected-layer-item__palette-tooltip';
    tooltip.setAttribute('role', 'tooltip');

    legends.forEach((legend) => {
      const row = document.createElement('span');
      row.className = 'selected-layer-item__palette-tooltip-row';

      if (withSwatch) {
        const swatch = document.createElement('span');
        swatch.className = 'selected-layer-item__palette-tooltip-swatch';
        const colorClass = this.getLegendColorClass(legend);
        if (colorClass) swatch.classList.add(colorClass);
        row.appendChild(swatch);
      }

      const name = document.createElement('span');
      name.className = 'selected-layer-item__palette-tooltip-name';
      name.textContent = legend.dataset.legendName || '';

      const value = document.createElement('span');
      value.className = 'selected-layer-item__palette-tooltip-value';
      value.textContent = legend.dataset.legendValue || '';

      const text = document.createElement('span');
      text.className = 'selected-layer-item__palette-tooltip-text';
      text.append(name, value);

      row.appendChild(text);
      tooltip.appendChild(row);
    });

    return tooltip;
  },

  getLegendColorClass(legend) {
    const swatch = legend.querySelector('.selected-layer-item__palette-swatch');
    return [...(swatch?.classList ?? [])].find((name) => name.startsWith('bg-')) || '';
  },

  activateTab(item, tabId) {
    item.querySelectorAll('[data-selected-layer-tab]').forEach((tab) => {
      const isActive = tab.dataset.selectedLayerTab === tabId;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    item.querySelectorAll('[data-selected-layer-tab-panel]').forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.selectedLayerTabPanel === tabId);
    });
  },

  isOpen() {
    return this.panel?.classList.contains('is-open');
  },

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    window.BackgroundMapPanel?.close?.();

    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.mapView?.classList.add('is-selected-layer-open');
    this.syncOpenButtonState();
    window.dispatchEvent(new CustomEvent('selected-layer-panel:open', { detail: { panel: this.panel } }));
    window.dispatchEvent(new Event('resize'));
  },

  close() {
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.mapView?.classList.remove('is-selected-layer-open');
    this.syncOpenButtonState();
    window.dispatchEvent(new CustomEvent('selected-layer-panel:close', { detail: { panel: this.panel } }));
    window.dispatchEvent(new Event('resize'));
  },

  updateCount() {
    if (!this.list) return;

    const count = this.list.querySelectorAll('[data-selected-layer-item]').length;

    if (this.countEl) {
      this.countEl.textContent = String(count);
    }

    document.querySelectorAll('[data-selected-layer-badge]').forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count <= 0;
    });
  },
};

window.SelectedLayerPanel = SelectedLayerPanel;

function bootSelectedLayerPanel() {
  SelectedLayerPanel.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootSelectedLayerPanel);
} else {
  bootSelectedLayerPanel();
}
