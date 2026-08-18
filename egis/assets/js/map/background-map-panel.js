/**
 * Background Map Panel — 배경지도 우측 패널
 *
 * 커스텀 이벤트 (window):
 * - background-map-panel:open
 * - background-map-panel:close
 * - background-map:change  detail: { type, option }
 */

const BackgroundMapPanel = {
  panel: null,
  mapView: null,
  openButtons: [],
  options: [],

  init() {
    this.panel = document.querySelector('[data-background-map-panel]');
    if (!this.panel) return;

    this.mapView = document.querySelector('.map-view');
    this.openButtons = Array.from(document.querySelectorAll('[data-background-map-panel-open]'));
    this.options = Array.from(this.panel.querySelectorAll('[data-background-map-option]'));

    this.bindPanelToggle();
    this.bindOptions();
    this.initOpenButtonTooltips();
    this.syncOpenButtonState();
  },

  bindPanelToggle() {
    this.openButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggle();
      });
    });

    this.panel.querySelectorAll('[data-background-map-panel-close]').forEach((btn) => {
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
      btn.querySelector('.map-gps-map-icon')?.classList.toggle('active', isOpen);
    });
  },

  bindOptions() {
    this.options.forEach((option) => {
      option.addEventListener('click', (event) => {
        event.preventDefault();
        this.selectOption(option);
      });
    });
  },

  selectOption(option) {
    const type = option.dataset.backgroundMapOption;
    if (!type) return;

    this.options.forEach((item) => {
      const isSelected = item === option;
      item.classList.toggle('is-selected', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });

    window.dispatchEvent(
      new CustomEvent('background-map:change', {
        detail: { type, option },
      })
    );
  },

  getSelectedType() {
    return this.options.find((option) => option.classList.contains('is-selected'))?.dataset.backgroundMapOption ?? null;
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
    window.SelectedLayerPanel?.close?.();

    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.mapView?.classList.add('is-background-map-open');
    this.syncOpenButtonState();
    window.dispatchEvent(new CustomEvent('background-map-panel:open', { detail: { panel: this.panel } }));
    window.dispatchEvent(new Event('resize'));
  },

  close() {
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.mapView?.classList.remove('is-background-map-open');
    this.syncOpenButtonState();
    window.dispatchEvent(new CustomEvent('background-map-panel:close', { detail: { panel: this.panel } }));
    window.dispatchEvent(new Event('resize'));
  },
};

window.BackgroundMapPanel = BackgroundMapPanel;

function bootBackgroundMapPanel() {
  BackgroundMapPanel.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootBackgroundMapPanel);
} else {
  bootBackgroundMapPanel();
}
