/** 통합검색 트리와 툴팁 처리 */

/** 트리 접기/펼치기 — checkbox.js initCheckAll 과 동일하게 마크업 data 속성 기준 자동 바인딩 */
/** 트리 버튼 상태와 접근성 문구 맞춤 */
function updateExpandAriaLabel(btn, expanded) {
  const current = btn.getAttribute('aria-label') || '';
  const base = current.replace(/\s*(펼치기|접기)\s*$/, '').trim();
  if (base) {
    btn.setAttribute('aria-label', `${base} ${expanded ? '접기' : '펼치기'}`);
  }
}

/** 트리 노드 접기·펼치기 연결 */
function initTreeExpand(btn) {
  if (btn.dataset.treeExpandInit === 'true') return;
  btn.dataset.treeExpandInit = 'true';

  const node = btn.closest('[data-integrated-search-node]');
  if (!node) return;

  // 현재 펼침 상태를 접근성 속성에 반영
  const syncExpandState = () => {
    const expanded = node.classList.contains('is-expanded');
    btn.setAttribute('aria-expanded', String(expanded));
    updateExpandAriaLabel(btn, expanded);
  };

  syncExpandState();

  btn.addEventListener('click', (event) => {
    event.preventDefault();

    const expanded = node.classList.toggle('is-expanded');
    btn.setAttribute('aria-expanded', String(expanded));
    updateExpandAriaLabel(btn, expanded);

    window.dispatchEvent(
      new CustomEvent('integrated-search:node-toggle', {
        detail: {
          nodeId: node.dataset.integratedSearchNode,
          depth: Number(node.dataset.depth),
          expanded,
          node,
        },
      })
    );

    const tree = node.closest('.integrated-search__tree');
    if (tree) syncIntegratedSearchTreeToggleButtons(tree);
  });
}

/** 카탈로그 트리 펼침 버튼 */
function getIntegratedSearchExpandButtons(tree) {
  return tree ? [...tree.querySelectorAll('[data-integrated-search-expand]')] : [];
}

/** 트리 전체 펼침/접기 */
function setIntegratedSearchTreeExpanded(tree, expanded) {
  getIntegratedSearchExpandButtons(tree).forEach((btn) => {
    const node = btn.closest('[data-integrated-search-node]');
    if (!node) return;

    node.classList.toggle('is-expanded', expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    updateExpandAriaLabel(btn, expanded);
  });

  syncIntegratedSearchTreeToggleButtons(tree);
}

/** 전체 펼치기·접기 버튼 상태 */
function syncIntegratedSearchTreeToggleButtons(tree) {
  const catalog = tree?.closest('[data-integrated-search-catalog]');
  if (!catalog) return;

  const expandAllBtn = catalog.querySelector('[data-integrated-search-expand-all]');
  const collapseAllBtn = catalog.querySelector('[data-integrated-search-collapse-all]');
  const buttons = getIntegratedSearchExpandButtons(tree);

  if (!buttons.length) return;

  const expandedCount = buttons.filter((btn) =>
    btn.closest('[data-integrated-search-node]')?.classList.contains('is-expanded')
  ).length;
  const allExpanded = expandedCount === buttons.length;
  const allCollapsed = expandedCount === 0;

  expandAllBtn?.classList.toggle('color-slate-500', allExpanded);
  expandAllBtn?.classList.toggle('color-slate-900', !allExpanded);
  collapseAllBtn?.classList.toggle('color-slate-500', allCollapsed);
  collapseAllBtn?.classList.toggle('color-slate-900', !allCollapsed);
}

/** 카탈로그 전체 펼치기·접기 연결 */
function initIntegratedSearchTreeToggle(catalog) {
  if (!catalog || catalog.dataset.treeToggleInit === 'true') return;
  catalog.dataset.treeToggleInit = 'true';

  const tree = catalog.querySelector('.integrated-search__tree');
  const expandAllBtn = catalog.querySelector('[data-integrated-search-expand-all]');
  const collapseAllBtn = catalog.querySelector('[data-integrated-search-collapse-all]');

  expandAllBtn?.addEventListener('click', () => {
    setIntegratedSearchTreeExpanded(tree, true);
  });

  collapseAllBtn?.addEventListener('click', () => {
    setIntegratedSearchTreeExpanded(tree, false);
  });

  syncIntegratedSearchTreeToggleButtons(tree);
}

window.initIntegratedSearchTreeToggle = initIntegratedSearchTreeToggle;
window.syncIntegratedSearchTreeToggleButtons = syncIntegratedSearchTreeToggleButtons;

/** 버튼 위치에 툴팁 표시 (뷰포트 안으로 보정) */
function showIntegratedSearchTooltip(btn, tooltip) {
  if (btn.dataset.tooltipWhen === 'collapsed') {
    const host = btn.closest('.map-navigation');
    if (!host?.classList.contains('is-collapsed')) return;
  }

  const gap = 4;
  const margin = 8;
  const btnRect = btn.getBoundingClientRect();
  const placement = btn.dataset.tooltipPlacement || 'right';

  if (tooltip.parentElement !== document.body) {
    tooltip._tooltipOrigin = btn;
    document.body.appendChild(tooltip);
  }

  tooltip.style.position = 'fixed';
  tooltip.style.zIndex = '1100';
  tooltip.style.opacity = '1';
  tooltip.style.visibility = 'visible';
  tooltip.style.transform = 'none';
  tooltip.style.left = '0';
  tooltip.style.top = '0';

  const tipW = tooltip.offsetWidth;
  const tipH = tooltip.offsetHeight;
  let left = 0;
  let top = 0;

  if (placement === 'top') {
    left = btnRect.left + btnRect.width / 2 - tipW / 2;
    top = btnRect.top - gap - tipH;
  } else if (placement === 'top-end') {
    /* 도움말 등: 트리거 오른쪽 기준, 왼쪽으로 펼침 */
    left = btnRect.right - tipW;
    top = btnRect.top - gap - tipH;
  } else if (placement === 'bottom') {
    left = btnRect.left + btnRect.width / 2 - tipW / 2;
    top = btnRect.bottom + gap;
  } else if (placement === 'bottom-start') {
    left = btnRect.left;
    top = btnRect.bottom + gap;
  } else if (placement === 'left') {
    left = btnRect.left - gap - tipW;
    top = btnRect.top + btnRect.height / 2 - tipH / 2;
  } else {
    left = btnRect.right + gap;
    top = btnRect.top + btnRect.height / 2 - tipH / 2;
  }

  left = Math.min(Math.max(margin, left), window.innerWidth - tipW - margin);
  top = Math.min(Math.max(margin, top), window.innerHeight - tipH - margin);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

/** 열린 툴팁과 임시 좌표 초기화 */
function hideIntegratedSearchTooltip(tooltip) {
  tooltip.style.position = '';
  tooltip.style.left = '';
  tooltip.style.top = '';
  tooltip.style.zIndex = '';
  tooltip.style.opacity = '';
  tooltip.style.visibility = '';
  tooltip.style.transform = '';

  if (tooltip._tooltipOrigin) {
    tooltip._tooltipOrigin.appendChild(tooltip);
    tooltip._tooltipOrigin = null;
  }
}

/** 버튼에 마우스·키보드 툴팁 연결 */
function initIntegratedSearchTooltip(btn) {
  if (btn.dataset.searchTooltipInit === 'true') return;
  btn.dataset.searchTooltipInit = 'true';

  const tooltip = btn.querySelector('.integrated-search__tooltip, .selected-layer-item__palette-tooltip');
  if (!tooltip) return;

  btn.addEventListener('mouseenter', () => showIntegratedSearchTooltip(btn, tooltip));
  btn.addEventListener('focus', () => showIntegratedSearchTooltip(btn, tooltip));
  btn.addEventListener('mouseleave', () => hideIntegratedSearchTooltip(tooltip));
  btn.addEventListener('blur', () => hideIntegratedSearchTooltip(tooltip));

  btn.closest('.integrated-search__tree')?.addEventListener('scroll', () => hideIntegratedSearchTooltip(tooltip), {
    passive: true,
  });
  btn.closest('.selected-layer-panel__body')?.addEventListener('scroll', () => hideIntegratedSearchTooltip(tooltip), {
    passive: true,
  });
  window.addEventListener('resize', () => hideIntegratedSearchTooltip(tooltip), { passive: true });
}

window.initIntegratedSearchTooltip = initIntegratedSearchTooltip;

/** 트리 노드 바로 아래 자식 노드 */
function getIntegratedSearchChildNodes(node) {
  if (!node?.children) return [];
  const list = [...node.children].find((el) => el.classList.contains('integrated-search__children'));
  if (!list) return [];
  return [...list.children].filter((el) => el.hasAttribute('data-integrated-search-node'));
}

/** 트리 노드 행의 체크박스 */
function getIntegratedSearchNodeCheckbox(node) {
  if (!node?.children) return null;
  const row = [...node.children].find((el) => el.classList.contains('integrated-search__row'));
  return row?.querySelector('[data-integrated-search-layer]') ?? null;
}

/** 노드 하위 최하위 레이어 체크박스 */
function getIntegratedSearchLeafCheckboxes(rootNode) {
  const leaves = [];

  const walk = (node) => {
    const children = getIntegratedSearchChildNodes(node);
    if (children.length === 0) {
      const checkbox = getIntegratedSearchNodeCheckbox(node);
      if (checkbox) leaves.push(checkbox);
      return;
    }
    children.forEach(walk);
  };

  walk(rootNode);
  return leaves;
}

/** 노드 하위 체크된 레이어 개수 */
function getIntegratedSearchNodeSelectedCount(node) {
  return getIntegratedSearchLeafCheckboxes(node).filter((cb) => cb.checked).length;
}

window.getIntegratedSearchChildNodes = getIntegratedSearchChildNodes;
window.getIntegratedSearchNodeCheckbox = getIntegratedSearchNodeCheckbox;
window.getIntegratedSearchLeafCheckboxes = getIntegratedSearchLeafCheckboxes;
window.getIntegratedSearchNodeSelectedCount = getIntegratedSearchNodeSelectedCount;

/** 트리 노드 선택 개수 표시 — 선택 숫자만 1개 이상일 때 blue */
function updateIntegratedSearchNodeCount(badge, selected, total) {
  if (!badge) return;

  const resolvedTotal = total ?? badge.dataset.integratedSearchNodeTotal;
  let selectedEl = badge.querySelector('[data-integrated-search-node-count-selected]');

  if (!selectedEl) {
    badge.innerHTML = `<span data-integrated-search-node-count-selected>${selected}</span>/${resolvedTotal ?? ''}`;
    selectedEl = badge.querySelector('[data-integrated-search-node-count-selected]');
  } else {
    selectedEl.textContent = String(selected);
  }

  if (resolvedTotal != null) {
    badge.dataset.integratedSearchNodeTotal = String(resolvedTotal);
  }

  selectedEl.classList.toggle('color-blue-500', selected >= 1);
  selectedEl.classList.toggle('color-slate-900', selected < 1);
}

window.updateIntegratedSearchNodeCount = updateIntegratedSearchNodeCount;

/** 레이어 체크 변경 시 트리 카운트 실시간 동기화 */
function syncIntegratedSearchLayerCounts() {
  window.IntegratedSearch?.root && window.IntegratedSearch.updateCounts();
  window.BaseResourceMap?.root && window.BaseResourceMap.updateCounts();
}

if (!window.__integratedSearchLayerCountSyncBound) {
  window.__integratedSearchLayerCountSyncBound = true;

  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-integrated-search-layer]')) return;
    syncIntegratedSearchLayerCounts();
  });
}

window.syncIntegratedSearchLayerCounts = syncIntegratedSearchLayerCounts;

/** 트리 버튼과 정보 툴팁 초기화 */
function bootIntegratedSearchTree() {
  document.querySelectorAll('[data-integrated-search-expand]').forEach(initTreeExpand);
  document.querySelectorAll('[data-integrated-search-info]').forEach(initIntegratedSearchTooltip);
  document.querySelectorAll('[data-integrated-search-catalog]').forEach(initIntegratedSearchTreeToggle);
}

bootIntegratedSearchTree();
