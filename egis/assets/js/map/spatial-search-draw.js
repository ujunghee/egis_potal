/**
 * Spatial Search Draw — 공간검색 도형 그리기 (Leaflet)
 *
 * 반경: 좌클릭 중심 → 이동 추적 → 우클릭으로 반경 확정 → 검색 안내 팝업
 * 기타 도구 우클릭: 현재 그리기 취소 및 공간검색 도구 종료
 */

(function () {
  if (typeof L === 'undefined') return;

  const VIOLET = '#831fb7';
  const BLUE = '#1A76FF';

  const DRAW_STYLE = {
    color: BLUE,
    weight: 2,
    fillColor: BLUE,
    fillOpacity: 0.15,
  };

  const RADIUS_DRAW_STYLE = {
    color: VIOLET,
    weight: 2,
    fillColor: VIOLET,
    fillOpacity: 0.15,
  };

  const RADIUS_MARKER_STYLE = {
    radius: 7,
    color: VIOLET,
    weight: 2,
    fillColor: '#ffffff',
    fillOpacity: 1,
  };

  const RADIUS_LINE_STYLE = {
    color: VIOLET,
    weight: 2,
  };

  const MIN_DRAG_METERS = 5;
  const HINT_OFFSET = 12;
  const EARTH_RADIUS = 6378137;

  let map = null;
  let shapes = null;
  let hintEl = null;
  let searchBtn = null;
  let mode = null;
  let preview = null;
  let startLatLng = null;
  let lastMouseLatLng = null;
  let polygonPoints = [];
  let isDragging = false;
  let radiusTracking = false;
  let pendingSearch = false;
  let hintAnchorLatLng = null;

  let radiusOverlay = null;
  let radiusCircle = null;
  let radiusCenterMarker = null;
  let radiusEdgeMarker = null;
  let radiusLine = null;

  const getMap = () => window.MapView?.map ?? null;

  function getDrawStyle(tool = mode) {
    return tool === 'radius' ? RADIUS_DRAW_STYLE : DRAW_STYLE;
  }

  function getEdgePoint(center, toward, radius) {
    const lat1 = (center.lat * Math.PI) / 180;
    const lon1 = (center.lng * Math.PI) / 180;
    const lat2 = (toward.lat * Math.PI) / 180;
    const lon2 = (toward.lng * Math.PI) / 180;
    const bearing = Math.atan2(
      Math.sin(lon2 - lon1) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
    );
    const angularDistance = radius / EARTH_RADIUS;
    const lat3 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const lon3 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat3)
      );

    return L.latLng((lat3 * 180) / Math.PI, (lon3 * 180) / Math.PI);
  }

  function setCursor(active) {
    map?.getContainer()?.classList.toggle('is-spatial-drawing', active);
  }

  function mountHintOnMap() {
    if (!hintEl || !map) return;

    const pane = map.getPanes().overlayPane;
    if (hintEl.parentElement !== pane) {
      pane.appendChild(hintEl);
    }
  }

  function updateHintPosition(latlng) {
    if (!hintEl || !map || !latlng) return;

    mountHintOnMap();
    const point = map.latLngToLayerPoint(latlng);
    hintEl.style.left = `${point.x + HINT_OFFSET}px`;
    hintEl.style.top = `${point.y + HINT_OFFSET}px`;
  }

  function hideShapeHint() {
    hintAnchorLatLng = null;
    hintEl?.setAttribute('hidden', '');
  }

  function resetHintState() {
    pendingSearch = false;
    radiusTracking = false;
    hideShapeHint();
  }

  function showShapeHint(latlng) {
    if (!hintEl || !latlng) return;

    hintAnchorLatLng = latlng;
    hintEl.removeAttribute('hidden');
    updateHintPosition(latlng);
  }

  function refreshHintPosition() {
    if (!hintAnchorLatLng || hintEl?.hasAttribute('hidden')) return;
    updateHintPosition(hintAnchorLatLng);
  }

  function clearRadiusOverlay() {
    if (radiusOverlay) {
      map.removeLayer(radiusOverlay);
      radiusOverlay = null;
      radiusCircle = null;
      radiusCenterMarker = null;
      radiusEdgeMarker = null;
      radiusLine = null;
    }
  }

  function resetPreview() {
    if (preview && preview !== radiusOverlay) {
      map.removeLayer(preview);
    }
    clearRadiusOverlay();
    preview = null;
    startLatLng = null;
    isDragging = false;
    polygonPoints = [];
  }

  function stopMode() {
    mode = null;
    resetPreview();
    resetHintState();
    map?.dragging.enable();
    map?.doubleClickZoom.enable();
    setCursor(false);
  }

  function finishShape(layer) {
    if (!layer || !shapes) return;

    shapes.addLayer(layer);
    resetPreview();
    pendingSearch = true;
    showShapeHint(lastMouseLatLng || map.getCenter());

    window.dispatchEvent(
      new CustomEvent('spatial-search:shape-drawn', {
        detail: {
          tool: mode,
          layer,
          geojson: layer.toGeoJSON?.(),
        },
      })
    );
  }

  function hasMinDistance(endLatLng) {
    return startLatLng && startLatLng.distanceTo(endLatLng) >= MIN_DRAG_METERS;
  }

  function updateRadiusOverlay(center, cursorLatLng) {
    const radius = Math.max(center.distanceTo(cursorLatLng), 0);
    const edge = radius > 0 ? getEdgePoint(center, cursorLatLng, radius) : center;

    if (!radiusOverlay) {
      radiusOverlay = L.layerGroup();
      radiusCircle = L.circle(center, { radius, ...RADIUS_DRAW_STYLE });
      radiusCenterMarker = L.circleMarker(center, RADIUS_MARKER_STYLE);
      radiusLine = L.polyline([center, edge], RADIUS_LINE_STYLE);
      radiusEdgeMarker = L.circleMarker(edge, RADIUS_MARKER_STYLE);

      radiusOverlay.addLayer(radiusCircle);
      radiusOverlay.addLayer(radiusLine);
      radiusOverlay.addLayer(radiusCenterMarker);
      radiusOverlay.addLayer(radiusEdgeMarker);
      radiusOverlay.addTo(map);
      preview = radiusOverlay;
      return;
    }

    radiusCircle.setLatLng(center);
    radiusCircle.setRadius(radius);
    radiusCenterMarker.setLatLng(center);
    radiusLine.setLatLngs([center, edge]);
    radiusEdgeMarker.setLatLng(edge);
  }

  function finalizeRadiusAt(latlng) {
    if (mode !== 'radius' || !radiusTracking || !radiusOverlay || !startLatLng) return false;

    const center = startLatLng;
    let edgeLatLng = latlng || lastMouseLatLng;
    let radius = edgeLatLng ? center.distanceTo(edgeLatLng) : 0;

    // 마우스와 중심이 너무 가까우면 팝업에 설정된 반경으로 확정
    if (radius < MIN_DRAG_METERS) {
      const fallback = Number(window.RadiusSearchPopup?.radiusMeters);
      if (!Number.isFinite(fallback) || fallback < MIN_DRAG_METERS) return false;
      const toward =
        edgeLatLng && center.distanceTo(edgeLatLng) > 0
          ? edgeLatLng
          : L.latLng(center.lat, center.lng + 0.01);
      edgeLatLng = getEdgePoint(center, toward, fallback);
      radius = fallback;
    }

    updateRadiusOverlay(center, edgeLatLng);
    radiusTracking = false;

    const finishedGroup = radiusOverlay;
    radiusOverlay = null;
    radiusCircle = null;
    radiusCenterMarker = null;
    radiusEdgeMarker = null;
    radiusLine = null;
    preview = null;
    startLatLng = null;

    shapes.addLayer(finishedGroup);
    pendingSearch = true;
    showShapeHint(edgeLatLng);

    window.dispatchEvent(
      new CustomEvent('spatial-search:radius-drawn', {
        detail: { center, radiusMeters: radius },
      })
    );

    window.dispatchEvent(
      new CustomEvent('spatial-search:shape-drawn', {
        detail: {
          tool: 'radius',
          layer: finishedGroup,
          geojson: finishedGroup.toGeoJSON?.(),
        },
      })
    );

    return true;
  }

  function runSearch() {
    if (!mode) return;

    if (mode === 'radius') {
      if (radiusTracking && lastMouseLatLng) {
        if (!finalizeRadiusAt(lastMouseLatLng)) return;
      }
      if (shapes.getLayers().length === 0) return;
    } else if (!pendingSearch && shapes.getLayers().length === 0) {
      return;
    }

    const layers = shapes.getLayers();
    const lastLayer = layers[layers.length - 1];

    window.dispatchEvent(
      new CustomEvent('spatial-search:search', {
        detail: {
          tool: mode,
          layer: lastLayer,
          geojson: lastLayer?.toGeoJSON?.(),
          layers,
        },
      })
    );

    pendingSearch = false;
    hideShapeHint();
  }

  function onMouseDown(event) {
    if (!mode || mode === 'random' || mode === 'radius') return;

    L.DomEvent.stopPropagation(event);
    L.DomEvent.preventDefault(event);

    startLatLng = event.latlng;
    isDragging = true;
    map.dragging.disable();

    if (mode === 'square') {
      preview = L.rectangle([startLatLng, startLatLng], getDrawStyle()).addTo(map);
      return;
    }

    if (mode === 'circle') {
      preview = L.circle(startLatLng, { radius: 0, ...getDrawStyle() }).addTo(map);
    }
  }

  function onMouseMove(event) {
    lastMouseLatLng = event.latlng;

    if (mode === 'radius' && radiusTracking && startLatLng) {
      updateRadiusOverlay(startLatLng, event.latlng);
      return;
    }

    if (!isDragging || !preview || !startLatLng) return;

    if (mode === 'square') {
      preview.setBounds(L.latLngBounds(startLatLng, event.latlng));
      return;
    }

    if (mode === 'circle') {
      preview.setRadius(startLatLng.distanceTo(event.latlng));
    }
  }

  function onMouseUp(event) {
    if (!isDragging || !preview || !startLatLng || mode === 'radius') return;

    map.dragging.enable();
    isDragging = false;

    if (mode === 'square') {
      if (hasMinDistance(event.latlng)) {
        finishShape(L.rectangle(L.latLngBounds(startLatLng, event.latlng), getDrawStyle()));
      } else {
        resetPreview();
      }
      return;
    }

    if (mode === 'circle') {
      const radius = startLatLng.distanceTo(event.latlng);
      if (radius >= MIN_DRAG_METERS) {
        finishShape(L.circle(startLatLng, { radius, ...getDrawStyle() }));
      } else {
        resetPreview();
      }
    }
  }

  function updatePolygonPreview() {
    if (preview) map.removeLayer(preview);

    if (polygonPoints.length === 0) {
      preview = null;
      return;
    }

    if (polygonPoints.length < 3) {
      preview = L.polyline(polygonPoints, { color: DRAW_STYLE.color, weight: DRAW_STYLE.weight }).addTo(map);
      return;
    }

    preview = L.polygon(polygonPoints, DRAW_STYLE).addTo(map);
  }

  function finishPolygon() {
    if (polygonPoints.length < 3) {
      resetPreview();
      return;
    }

    finishShape(L.polygon(polygonPoints, DRAW_STYLE));
  }

  function onMapClick(event) {
    if (mode === 'radius') {
      if (event.originalEvent.button !== 0) return;

      L.DomEvent.stopPropagation(event);

      if (!radiusTracking) {
        startLatLng = event.latlng;
        radiusTracking = true;
        updateRadiusOverlay(startLatLng, startLatLng);
        // 중심점 지정 시점 → 안내 토스트 닫고 중심점/반경 팝업 오픈
        window.dispatchEvent(
          new CustomEvent('spatial-search:radius-drawn', {
            detail: {
              center: startLatLng,
              radiusMeters: window.RadiusSearchPopup?.radiusMeters,
            },
          })
        );
      }
      return;
    }

    if (mode !== 'random') return;

    L.DomEvent.stopPropagation(event);

    if (polygonPoints.length >= 3) {
      const first = polygonPoints[0];
      const clickPoint = map.latLngToContainerPoint(event.latlng);
      const firstPoint = map.latLngToContainerPoint(first);
      const closeEnough = clickPoint.distanceTo(firstPoint) <= 12;

      if (closeEnough) {
        finishPolygon();
        return;
      }
    }

    polygonPoints.push(event.latlng);
    updatePolygonPreview();
  }

  function onMapDblClick(event) {
    if (mode !== 'random') return;

    L.DomEvent.stopPropagation(event);
    L.DomEvent.preventDefault(event);
    finishPolygon();
  }

  function onContextMenu(event) {
    if (!mode) return;

    L.DomEvent.preventDefault(event);
    L.DomEvent.stopPropagation(event);

    // 반경: 우클릭으로 반경 확정 → 다른 도형과 동일한 검색 안내 팝업
    if (mode === 'radius' && radiusTracking) {
      finalizeRadiusAt(lastMouseLatLng || event.latlng);
      return;
    }

    // 기타 도구 / 중심점 미지정: 그리기 취소 후 선택 도구 해제
    if (typeof window.SpatialSearchPanel?.clearSelection === 'function') {
      window.SpatialSearchPanel.clearSelection();
    } else {
      stopMode();
    }
  }

  function onDocumentKeyDown(event) {
    if (event.key !== 'Enter' || !mode) return;

    // 반경 추적 중 Enter → 반경 확정 후 검색 안내 팝업
    if (mode === 'radius' && radiusTracking) {
      event.preventDefault();
      finalizeRadiusAt(lastMouseLatLng);
      return;
    }

    if (hintEl?.hasAttribute('hidden')) return;

    event.preventDefault();
    runSearch();
  }

  function bindMapEvents() {
    if (!map) return;

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
    map.on('click', onMapClick);
    map.on('dblclick', onMapDblClick);
    map.on('contextmenu', onContextMenu);
    map.on('move', refreshHintPosition);
    map.on('zoom', refreshHintPosition);
    map.on('viewreset', refreshHintPosition);
  }

  function setDrawMode(tool) {
    resetPreview();
    resetHintState();
    mode = tool || null;

    if (!mode) {
      stopMode();
      return;
    }

    setCursor(true);

    if (mode === 'random') {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }

  function clearShapes() {
    shapes?.clearLayers();
    resetPreview();
    resetHintState();
  }

  function init() {
    map = getMap();
    if (!map) return;

    hintEl = document.querySelector('[data-spatial-search-hint]');
    searchBtn = document.querySelector('[data-spatial-search-search]');

    shapes = L.featureGroup().addTo(map);
    bindMapEvents();

    searchBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      runSearch();
    });

    document.addEventListener('keydown', onDocumentKeyDown);

    window.addEventListener('spatial-search:tool-change', (event) => {
      setDrawMode(event.detail?.tool ?? null);
    });

    // 중심점 변경: 추적 초기화 후 지도 재클릭으로 새 중심 지정
    window.addEventListener('spatial-search:radius-center-change', () => {
      if (mode !== 'radius') return;
      radiusTracking = false;
      startLatLng = null;
      clearRadiusOverlay();
      preview = null;
      resetHintState();
    });

    window.addEventListener('spatial-search:clear', () => {
      clearShapes();
    });

    window.addEventListener('spatial-search-panel:close', () => {
      clearShapes();
      stopMode();
    });

    window.addEventListener('resize', () => {
      map.invalidateSize();
      refreshHintPosition();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SpatialSearchDraw = {
    clear: clearShapes,
    getLayers: () => (shapes ? shapes.getLayers() : []),
    runSearch,
  };
})();
