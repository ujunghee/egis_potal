/**
 * Radius search settings popup.
 * UI state is stored in meters and exposed through spatial-search:* events.
 */
const RadiusSearchPopup = {
  popup: null,
  map: null,
  center: null,
  radiusMeters: 10000,
  isSyncing: false,

  init() {
    this.popup = document.querySelector('[data-radius-search-popup]');
    if (!this.popup) return;

    this.valueInput = this.popup.querySelector('[data-radius-value]');
    this.unitSelect = this.popup.querySelector('[data-radius-unit]');
    this.slider = this.popup.querySelector('[data-radius-slider]');
    this.coordinates = this.popup.querySelector('[data-radius-center-coordinates]');
    this.presets = [...this.popup.querySelectorAll('[data-radius-preset]')];

    this.bindControls();
    this.bindApplicationEvents();
    this.syncControls();
  },

  getMap() {
    return this.map || window.MapView?.map || null;
  },

  mount() {
    const map = this.getMap();
    if (!map) return false;

    this.map = map;
    const overlayPane = map.getPanes().overlayPane;
    if (this.popup.parentElement !== overlayPane) overlayPane.appendChild(this.popup);

    MapUi.disableMapPropagation(this.popup);
    this.bindMapEvents();
    return true;
  },

  bindMapEvents() {
    if (!this.map || this.map._radiusPopupBound) return;

    ['move', 'zoom', 'viewreset'].forEach((eventName) => {
      this.map.on(eventName, () => {
        if (!MapUi.isHidden(this.popup)) this.position();
      });
    });
    this.map._radiusPopupBound = true;
  },

  position() {
    if (!this.mount()) return;
    const point = this.map.containerPointToLayerPoint([16, 16]);
    this.popup.style.left = `${point.x}px`;
    this.popup.style.top = `${point.y}px`;
  },

  show() {
    const map = this.getMap();
    if (!map) return;

    this.center ||= map.getCenter();
    this.updateCenterText();
    MapUi.show(this.popup);
    this.position();
    this.popup.focus();
  },

  hide() {
    MapUi.hide(this.popup);
  },

  updateCenterText() {
    if (!this.center || !this.coordinates) return;
    this.coordinates.textContent = `${this.center.lat.toFixed(4)}, ${this.center.lng.toFixed(4)}`;
  },

  readMeters() {
    const value = Number(this.valueInput.value);
    if (!Number.isFinite(value) || value < 0) return null;
    return this.unitSelect.value === 'km' ? value * 1000 : value;
  },

  setRadius(meters, emit = true) {
    const maxMeters = Number(this.slider.max);
    this.radiusMeters = Math.max(0, Math.min(meters, maxMeters));
    this.syncControls();

    if (emit && this.center) {
      window.dispatchEvent(new CustomEvent('spatial-search:radius-settings-change', {
        detail: { center: this.center, radiusMeters: this.radiusMeters }
      }));
    }
  },

  syncControls() {
    this.isSyncing = true;
    const usesKilometers = this.unitSelect?.value === 'km';
    const displayValue = usesKilometers ? this.radiusMeters / 1000 : this.radiusMeters;

    if (this.valueInput) {
      this.valueInput.value = String(Number(displayValue.toFixed(usesKilometers ? 1 : 0)));
    }
    if (this.slider) this.slider.value = String(this.radiusMeters);

    this.presets.forEach((button) => {
      const multiplier = button.dataset.radiusPresetUnit === 'km' ? 1000 : 1;
      const selected = Number(button.dataset.radiusPreset) * multiplier === this.radiusMeters;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    this.isSyncing = false;
  },

  bindControls() {
    this.valueInput.addEventListener('input', () => {
      if (this.isSyncing) return;
      const meters = this.readMeters();
      if (meters !== null) this.setRadius(meters);
    });

    this.unitSelect.addEventListener('change', () => this.syncControls());
    this.slider.addEventListener('input', () => this.setRadius(Number(this.slider.value)));

    this.presets.forEach((button) => {
      button.addEventListener('click', () => {
        const usesKilometers = button.dataset.radiusPresetUnit === 'km';
        this.unitSelect.value = usesKilometers ? 'km' : 'm';
        this.setRadius(Number(button.dataset.radiusPreset) * (usesKilometers ? 1000 : 1));
      });
    });

    this.popup.querySelector('[data-radius-center-change]').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('spatial-search:radius-center-change'));
    });
    this.popup.querySelector('[data-radius-search-submit]').addEventListener('click', () => {
      document.querySelector('[data-spatial-search-search]')?.click();
    });
  },

  bindApplicationEvents() {
    // 반경 도구 선택 시에는 안내 토스트만 표시. 팝업은 지도 클릭(중심점) 이후.
    window.addEventListener('spatial-search:tool-change', () => this.hide());
    window.addEventListener('spatial-search:radius-center-change', () => this.hide());
    window.addEventListener('spatial-search:radius-drawn', (event) => {
      this.center = event.detail?.center || this.center;
      if (Number.isFinite(event.detail?.radiusMeters)) {
        this.setRadius(event.detail.radiusMeters, false);
      }
      this.show();
    });
    window.addEventListener('spatial-search:clear', () => {
      this.center = null;
      this.hide();
    });
    window.addEventListener('spatial-search-panel:close', () => this.hide());
    window.addEventListener('spatial-search:search', () => this.hide());
    window.addEventListener('resize', () => this.position());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !MapUi.isHidden(this.popup)) this.hide();
    });
  }
};

window.RadiusSearchPopup = RadiusSearchPopup;
MapUi.ready(() => RadiusSearchPopup.init());
