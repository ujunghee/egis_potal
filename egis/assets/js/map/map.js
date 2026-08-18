/**
 * 환경기초지도 — Leaflet 초기화
 * 배경지도: 국토정보플랫폼(NGII) WMTS — EPSG:5179
 */
(function () {
  if (typeof L === 'undefined' || typeof proj4 === 'undefined' || !L.Proj) return;

  const mainEl = document.getElementById('map-canvas');
  if (!mainEl) return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  /** 국토정보플랫폼 API 키 — eposMap.config.ngiiApiKey */
  window.eposMap = window.eposMap || { config: {} };
  window.eposMap.config = window.eposMap.config || {};
  window.eposMap.config.ngiiApiKey =
    window.eposMap.config.ngiiApiKey || '0C2B58AD19720A49E0531B94E770DB8C5063E14362';

  /** 브이월드 서비스키 (주소검색 등) — openMap.config.vworldServiceKey */
  window.eposMap.config.vworldServiceKey =
    window.eposMap.config.vworldServiceKey || '49FC8B86-D244-3DD9-8B59-F32D84065789';

  const NGII_API_KEY = window.eposMap.config.ngiiApiKey;
  const NGII_LAYER = 'korean_map';
  const NGII_RESOLUTIONS = [
    2088.96, 1044.48, 522.24, 261.12, 130.56, 65.28, 32.64, 16.32, 8.16, 4.08, 2.04, 1.02, 0.51, 0.255,
  ];
  const NGII_ORIGIN = [-200000, 4000000];
  const NGII_BOUNDS = L.bounds([-200000, -28024123.62], [31824123.62, 4000000]);

  const crs = new L.Proj.CRS(
    'EPSG:5179',
    '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs',
    {
      resolutions: NGII_RESOLUTIONS,
      origin: NGII_ORIGIN,
      bounds: NGII_BOUNDS,
    }
  );

  const DEFAULT_CENTER = [37.5665, 126.978];
  // NGII: Leaflet zoom 0 = L05 … zoom 13 = L18 (도시 스케일 ≈ 9~10)
  const DEFAULT_ZOOM = 9;
  const KOREA_BOUNDS = L.latLngBounds([33.0, 124.5], [38.7, 132.0]);

  const map = L.map('map-canvas', {
    crs,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 0,
    maxZoom: NGII_RESOLUTIONS.length - 1,
    maxBounds: KOREA_BOUNDS,
    maxBoundsViscosity: 1,
    zoomControl: false,
  });

  const NgiiTileLayer = L.TileLayer.extend({
    getTileUrl(coords) {
      const level = `L${String(coords.z + 5).padStart(2, '0')}`;
      return (
        `https://map.ngii.go.kr/openapi/Gettile.do?apikey=${encodeURIComponent(NGII_API_KEY)}` +
        `&service=WMTS&request=GetTile&version=1.0.0` +
        `&layer=${NGII_LAYER}&style=korean&format=image/png` +
        `&tilematrixset=korean` +
        `&tilematrix=${level}&tilerow=${coords.y}&tilecol=${coords.x}`
      );
    },
  });

  const baseLayer = new NgiiTileLayer('', {
    attribution:
      '&copy; <a href="https://map.ngii.go.kr/" target="_blank" rel="noopener">국토정보플랫폼</a>',
    minZoom: 0,
    maxZoom: NGII_RESOLUTIONS.length - 1,
    tileSize: 256,
    continuousWorld: true,
  }).addTo(map);

  let marker = L.marker(DEFAULT_CENTER).addTo(map);

  const flyTo = (latlng, zoom = 11) => {
    map.flyTo(latlng, zoom, { duration: 0.8 });
    marker.setLatLng(latlng);
  };

  // 주소 패널 항목 선택 시에만 이동 (헤더 드롭다운 클릭에서는 이동하지 않음)
  window.addEventListener('address-search:select', (e) => {
    const { lat, lng } = e.detail || {};
    if (Number.isFinite(lat) && Number.isFinite(lng)) flyTo([lat, lng], 11);
  });

  document.querySelectorAll('.map-control__btn').forEach((btn) => {
    if (btn.querySelector('.plus-icon')) btn.addEventListener('click', () => map.zoomIn());
    if (btn.querySelector('.minus-icon')) btn.addEventListener('click', () => map.zoomOut());
  });

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  window.MapView = {
    map,
    flyTo,
    marker,
    baseLayer,
    crs,
    ngiiApiKey: NGII_API_KEY,
    vworldApiKey: window.eposMap.config.vworldServiceKey,
  };
})();
