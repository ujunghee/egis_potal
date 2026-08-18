/** 통합검색 레이어 정보 패널 처리 */

/** 선택 레이어의 상위 분류 수집 */
function getIntegratedSearchNodeAncestors(node) {
  const ancestors = [];
  let current = node.parentElement?.closest('[data-integrated-search-node]');

  while (current) {
    const label = current.querySelector('.integrated-search__label')?.textContent.trim();
    if (label) {
      ancestors.unshift({
        node: current,
        label,
        depth: Number(current.dataset.depth),
      });
    }
    current = current.parentElement?.closest('[data-integrated-search-node]');
  }

  return ancestors;
}

/** 레이어 분류 태그를 배열로 변환 */
function getIntegratedSearchNodeMetaTags(node) {
  const tagsAttr = node?.dataset.integratedSearchMetaTags;
  if (!tagsAttr) return null;

  const tags = tagsAttr
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const activeLabel = node.dataset.integratedSearchMetaTagActive?.trim();

  return tags.map((label) => ({
    label,
    active: activeLabel ? label === activeLabel : false,
  }));
}

/** 선택한 트리 정보를 상세 패널에 입력 */
function populateIntegratedSearchLayerInfoPanel(panel, node) {
  const titleEl = panel.querySelector('[data-integrated-search-layer-info-title]');
  const chipsRoot = panel.querySelector('[data-integrated-search-layer-info-chips]');
  const layerNameEl = panel.querySelector('[data-integrated-search-layer-info-layer-name]');
  const leafLabel = node.querySelector('.integrated-search__label')?.textContent.trim() ?? '주제도명';

  if (titleEl) titleEl.textContent = leafLabel;
  if (layerNameEl) layerNameEl.textContent = node.dataset.integratedSearchNode ?? '—';
  if (!chipsRoot) return;

  chipsRoot.innerHTML = '';

  const metaTags = getIntegratedSearchNodeMetaTags(node);
  if (metaTags?.length) {
    metaTags.forEach(({ label, active }) => {
      const li = document.createElement('li');
      const tagClass = active ? 'meta-tag meta-tag--active' : 'meta-tag';

      li.innerHTML = `<span class="${tagClass}">${label}</span>`;
      chipsRoot.appendChild(li);
    });
    return;
  }

  getIntegratedSearchNodeAncestors(node).forEach((item, index) => {
    const li = document.createElement('li');
    const tagClass = index === 0 ? 'meta-tag meta-tag--active' : 'meta-tag';

    li.innerHTML = `<span class="${tagClass}">${item.label}</span>`;
    chipsRoot.appendChild(li);
  });
}

/** 레이어 상세 패널 찾기 */
function getIntegratedSearchLayerInfoPanel() {
  return document.querySelector('[data-integrated-search-layer-info-panel]');
}

/** 선택 레이어 정보를 넣고 상세 패널 열기 */
function openIntegratedSearchLayerInfoPanel(node) {
  const wrap = document.getElementById('map-result-panel-wrap');
  const panel = getIntegratedSearchLayerInfoPanel();
  if (!wrap || !panel || !node) return;

  populateIntegratedSearchLayerInfoPanel(panel, node);
  panel.hidden = false;
  wrap.classList.add('has-layer-info');
  window.ResultPanel?.expand?.();
  window.dispatchEvent(new Event('resize'));
}

/** 레이어 상세 패널 닫기 */
function closeIntegratedSearchLayerInfoPanel() {
  const wrap = document.getElementById('map-result-panel-wrap');
  const panel = getIntegratedSearchLayerInfoPanel();
  if (!wrap || !panel) return;

  panel.hidden = true;
  wrap.classList.remove('has-layer-info');
  window.dispatchEvent(
    new CustomEvent('integrated-search:layer-info-close', {
      detail: { panel },
    })
  );
  window.dispatchEvent(new Event('resize'));
}

/** 상세 패널을 열고 공통 이벤트 전송 */
function activateIntegratedSearchLayerInfo(node, trigger) {
  if (!node) return;
  openIntegratedSearchLayerInfoPanel(node);

  const detail = {
    layerId: node.dataset.integratedSearchNode,
    node,
    panel: getIntegratedSearchLayerInfoPanel(),
    trigger,
  };

  window.dispatchEvent(new CustomEvent('integrated-search:layer-info', { detail }));
  window.dispatchEvent(new CustomEvent('integrated-search:layer-info-open', { detail }));
}

// 다른 검색 화면에서도 쓸 수 있는 닫기 함수
window.IntegratedSearchLayerInfo = {
  open: openIntegratedSearchLayerInfoPanel,
  close: closeIntegratedSearchLayerInfoPanel,
};

/** 정보 보기 버튼에 상세 패널 연결 */
function initIntegratedSearchLayerInfo(btn) {
  if (btn.dataset.layerInfoInit === 'true') return;
  btn.dataset.layerInfoInit = 'true';

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const tooltip = btn.querySelector('.integrated-search__tooltip');
    if (tooltip) hideIntegratedSearchTooltip(tooltip);

    const node = btn.closest('[data-integrated-search-node]');
    if (!node) return;

    activateIntegratedSearchLayerInfo(node, btn);
  });
}

/** 항목명 클릭은 체크가 아니라 해당 노드 펼침/접기로 처리 */
function initIntegratedSearchLayerLabel(label) {
  if (label.dataset.layerLabelInit === 'true') return;
  label.dataset.layerLabelInit = 'true';
  const node = label.closest('[data-integrated-search-node]');
  const expandButton = node?.querySelector(':scope > .integrated-search__row [data-integrated-search-expand]');

  if (expandButton) {
    label.setAttribute('role', 'button');
    label.setAttribute('tabindex', '0');
    label.setAttribute('aria-expanded', expandButton.getAttribute('aria-expanded') || 'false');
  }

  const toggleFromLabel = (event) => {
    // label의 기본 동작(연결된 checkbox 토글)을 차단한다.
    event.preventDefault();
    event.stopPropagation();

    if (!expandButton) return;
    expandButton.click();
    label.setAttribute('aria-expanded', expandButton.getAttribute('aria-expanded') || 'false');
  };

  label.addEventListener('click', toggleFromLabel);
  label.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') toggleFromLabel(event);
  });
}

/** 상세 패널 버튼 최초 1회 연결 */
function initIntegratedSearchLayerInfoPanelControls(scope = document) {
  scope.querySelectorAll('[data-integrated-search-layer-info-close]').forEach((btn) => {
    if (btn.dataset.layerInfoCloseInit === 'true') return;
    btn.dataset.layerInfoCloseInit = 'true';

    btn.addEventListener('click', (event) => {
      event.preventDefault();
      closeIntegratedSearchLayerInfoPanel();
    });
  });

  scope.querySelectorAll('[data-integrated-search-layer-info-detail]').forEach((btn) => {
    if (btn.dataset.layerInfoDetailInit === 'true') return;
    btn.dataset.layerInfoDetailInit = 'true';

    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const panel = getIntegratedSearchLayerInfoPanel();
      const nodeId = panel?.querySelector('[data-integrated-search-layer-info-layer-name]')?.textContent;

      window.dispatchEvent(
        new CustomEvent('integrated-search:layer-info-detail', {
          detail: { layerId: nodeId, panel },
        })
      );
    });
  });
}

/** 정보 보기와 상세 패널 버튼 초기화 */
function bootIntegratedSearchLayerInfo() {
  document.querySelectorAll('[data-integrated-search-info]').forEach(initIntegratedSearchLayerInfo);
  document
    .querySelectorAll('[data-integrated-search-node] > .integrated-search__row .integrated-search__label')
    .forEach(initIntegratedSearchLayerLabel);
  initIntegratedSearchLayerInfoPanelControls(document);
}

bootIntegratedSearchLayerInfo();
