/** 지도 조각을 불러온 뒤 관련 기능 순서대로 실행 */
(async () => {
  try {
    await window.FragmentLoader.loadAll();
    await window.ScriptLoader.loadSequentially([
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
      'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js',
      '../../assets/js/common/datepicjer.js',
      '../../assets/js/common/search-filter.js',
      '../../assets/js/common/checkbox.js?v=20260723-1',
      '../../assets/js/map/result-panel-core.js',
      '../../assets/js/map/map-ui.js',
      '../../assets/js/map/integrated-search-tree.js?v=20260723-6',
      '../../assets/js/map/integrated-search-layer-info.js?v=20260722-2',
      '../../assets/js/map/integrated-search-filter.js?v=20260813-2',
      '../../assets/js/map/integrated-search.js?v=20260723-5',
      '../../assets/js/map/base-resource-map.js?v=20260723-5',
      '../../assets/js/map/address-search.js',
      '../../assets/js/map/spatial-search-panel.js',
      '../../assets/js/map/radius-search-popup.js',
      '../../assets/js/map/spatial-search-toast.js',
      '../../assets/js/map/map-sheet-search.js',
      '../../assets/js/map/spatial-search-results.js',
      '../../assets/js/map/navigation.js',
      '../../assets/js/map/region-select.js',
      '../../assets/js/map/control-panel.js',
      '../../assets/js/vendor/sortable-1.15.7.min.js',
      '../../assets/js/map/selected-layer-panel.js',
      '../../assets/js/map/background-map-panel.js',
      '../../assets/js/map/map-header-search.js',
      '../../assets/js/map/map.js',
      '../../assets/js/map/spatial-search-draw.js?v=20260721-1',
    ]);
  } catch (error) {
    console.error(error);
    document.body.dataset.loadError = 'true';
  }
})();
