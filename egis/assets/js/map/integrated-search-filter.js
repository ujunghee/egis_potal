/** 통합검색 상세 필터 처리 */

/** 필터 섹션 펼치기 */
function openIntegratedSearchFilterSection(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle], [data-integrated-search-filter-toggle]');
  if (!panel || !toggle) return;

  section.classList.add('active');
  toggle.setAttribute('aria-expanded', 'true');
  panel.classList.remove('is-open');
  panel.style.overflow = 'hidden';
  panel.style.height = 'auto';
  const targetHeight = panel.scrollHeight;
  panel.style.height = '0';
  panel.offsetHeight;

  requestAnimationFrame(() => {
    panel.style.height = `${targetHeight}px`;
  });

  // 펼침 모션이 끝나면 높이 제한 해제
  panel.addEventListener('transitionend', function onOpenEnd(e) {
    if (e.propertyName !== 'height' || !section.classList.contains('active')) return;
    panel.style.height = 'auto';
    panel.style.overflow = 'visible';
    panel.classList.add('is-open');
    panel.removeEventListener('transitionend', onOpenEnd);
  });
}

/** 필터 섹션 접기 */
function closeIntegratedSearchFilterSection(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle], [data-integrated-search-filter-toggle]');
  if (!panel || !toggle) return;

  panel.classList.remove('is-open');
  panel.style.overflow = 'hidden';
  panel.style.height = 'auto';
  const currentHeight = panel.scrollHeight;
  panel.style.height = `${currentHeight}px`;
  panel.offsetHeight;

  requestAnimationFrame(() => {
    panel.style.height = '0';
  });

  section.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
}

/** active 상태와 패널 높이 맞춤 */
function syncIntegratedSearchFilterSectionState(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle], [data-integrated-search-filter-toggle]');
  if (!panel || !toggle) return;

  if (section.classList.contains('active')) {
    panel.style.height = 'auto';
    panel.style.overflow = 'visible';
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  } else {
    panel.style.height = '0';
    panel.style.overflow = 'hidden';
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
}

/** 필터 제목에 접기·펼치기 연결 */
function initFilterSectionToggle(toggle) {
  if (toggle.dataset.filterSectionInit === 'true') return;
  toggle.dataset.filterSectionInit = 'true';

  const section = toggle.closest('.search-filter__section');
  if (!section) return;

  syncIntegratedSearchFilterSectionState(section);

  toggle.addEventListener('click', (event) => {
    event.preventDefault();

    const expanded = !section.classList.contains('active');
    const sectionId = section.dataset.integratedSearchFilterSection || '';

    if (expanded) {
      openIntegratedSearchFilterSection(section);
    } else {
      closeIntegratedSearchFilterSection(section);
    }

    window.dispatchEvent(
      new CustomEvent('integrated-search:filter-section-toggle', {
        detail: { sectionId, expanded, section, toggle },
      })
    );
  });
}

/** 상세 필터와 결과 목록 전환 */
function setIntegratedSearchFilterOpen(root, open) {
  const integratedSearch = root.querySelector('.integrated-search');
  const filterBtn = root.querySelector('[data-integrated-search-filter]');
  const filterPanel = root.querySelector('[data-integrated-search-filter-panel]');
  const catalog = root.querySelector('[data-integrated-search-catalog]');
  if (!integratedSearch || !filterPanel || !catalog) return;

  integratedSearch.classList.toggle('is-filter-open', open);
  filterBtn?.setAttribute('aria-pressed', String(open));
  filterPanel.style.display = open ? 'block' : 'none';
  catalog.style.display = open ? 'none' : 'block';

  if (open) {
    window.SearchFilter?.initPanels?.();
    filterPanel.querySelectorAll('.search-filter__section').forEach((section) => {
      if (section.dataset.searchFilterSection === 'mid' || section.dataset.integratedSearchFilterSection === 'mid') {
        return;
      }
      syncIntegratedSearchFilterSectionState(section);
    });
    syncIntegratedSearchFilterMidGroups(filterPanel);
    window.SearchFilter?.syncMidGroups?.(filterPanel);
    syncIntegratedSearchFilterChips(filterPanel);
    syncIntegratedSearchFilterCount(filterPanel);
  }

  if (window.IntegratedSearch) {
    window.IntegratedSearch.filterOpen = open;
  }

  window.dispatchEvent(
    new CustomEvent('integrated-search:filter-open', {
      detail: { open, filterPanel, catalog },
    })
  );
}

/** 필터 버튼에 상세 필터 연결 */
function initIntegratedSearchFilter(btn) {
  if (btn.dataset.filterBtnInit === 'true') return;
  btn.dataset.filterBtnInit = 'true';

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    const root = btn.closest('[data-result-panel-view="integrated-search"]');
    if (!root) return;

    const open = !root.querySelector('.integrated-search')?.classList.contains('is-filter-open');
    setIntegratedSearchFilterOpen(root, open);
  });
}

/** 체크박스 라벨 가져오기 */
function filterPanelLabel(input) {
  const id = input.getAttribute('id');
  if (!id) return '';
  return document.querySelector(`label[for="${id}"]`)?.textContent.trim() ?? '';
}

/** 대분류별 중분류 체크박스 생성 */
function createFilterMidGroup(major, midRoot) {
  const majorId = major.value;
  const title = filterPanelLabel(major);
  const group = document.createElement('div');
  group.className = 'search-filter__mid-group integrated-search__filter-mid-group';
  group.dataset.searchFilterMidFor = majorId;
  group.dataset.integratedSearchFilterMidFor = majorId;

  const heading = document.createElement('p');
  heading.className = 'search-filter__group-title body2-m-16 color-slate-900';
  heading.textContent = title;

  const list = document.createElement('ul');
  list.className = 'search-filter__list search-filter__list--cols-2';

  for (let i = 1; i <= 6; i += 1) {
    const itemId = `is-filter-mid-${majorId}-${i}`;
    const li = document.createElement('li');
    li.className = 'search-filter__item';
    li.innerHTML = `
      <div class="flex align-center gap-8">
        <input type="checkbox" class="checkbox-basic checkbox-basic-md" id="${itemId}" value="${majorId}-${i}" data-search-filter-mid data-search-filter-mid-parent="${majorId}" data-integrated-search-filter-mid data-integrated-search-filter-mid-parent="${majorId}">
        <label for="${itemId}" class="body2-r-16 color-slate-700">중분류 ${i}</label>
      </div>
    `;
    list.appendChild(li);
  }

  group.append(heading, list);
  midRoot.appendChild(group);

  return group;
}

/** 중분류 그룹이 없으면 생성 */
function ensureFilterMidGroup(major, midRoot) {
  let group = midRoot.querySelector(`[data-integrated-search-filter-mid-for="${major.value}"], [data-search-filter-mid-for="${major.value}"]`);
  if (!group) {
    group = createFilterMidGroup(major, midRoot);
  }
  return group;
}

/** 중분류 섹션 — 펼침 (높이 0 상태에서 scrollHeight 측정 이슈 방지) */
/** 중분류 영역 펼치기 */
function showIntegratedSearchMidSection(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle], [data-integrated-search-filter-toggle]');
  if (!panel || !toggle) return;

  section.classList.add('active', 'is-visible');
  toggle.setAttribute('aria-expanded', 'true');
  panel.classList.add('is-open');
  panel.style.height = 'auto';
  panel.style.overflow = 'visible';
}

/** 중분류 영역 접고 선택 해제 */
function hideIntegratedSearchMidSection(section) {
  section.classList.remove('active', 'is-visible');
  syncIntegratedSearchFilterSectionState(section);
}

/** 대분류 선택에 맞춰 중분류 갱신 */
function syncIntegratedSearchFilterMidGroups(filterPanel, options = {}) {
  const { dispatchEvent = false, changedMajor = null } = options;
  if (!filterPanel) return;

  const midRoot = filterPanel.querySelector('[data-integrated-search-filter-mid]');
  const midSection = filterPanel.querySelector('[data-integrated-search-filter-section="mid"]');
  if (!midRoot || !midSection) return;

  filterPanel.querySelectorAll('[data-integrated-search-filter-major]').forEach((major) => {
    let group = midRoot.querySelector(`[data-integrated-search-filter-mid-for="${major.value}"], [data-search-filter-mid-for="${major.value}"]`);

    if (major.checked) {
      group = ensureFilterMidGroup(major, midRoot);
    }

    if (!group) return;

    const wasVisible = group.classList.contains('is-visible');

    if (major.checked) {
      group.classList.add('is-visible');
    } else {
      group.classList.remove('is-visible');
      group.querySelectorAll('[data-integrated-search-filter-mid]').forEach((mid) => {
        mid.checked = false;
      });
    }

    const isVisible = group.classList.contains('is-visible');
    const isChangedMajor = !changedMajor || changedMajor === major;

    if (dispatchEvent && isChangedMajor && wasVisible !== isVisible) {
      window.dispatchEvent(
        new CustomEvent('integrated-search:filter-mid-group-toggle', {
          detail: {
            majorId: major.value,
            label: filterPanelLabel(major),
            visible: isVisible,
            checked: major.checked,
            major,
            group,
          },
        })
      );
    }
  });

  const hasVisibleGroup = [...midRoot.querySelectorAll('[data-integrated-search-filter-mid-for]')].some((group) =>
    group.classList.contains('is-visible')
  );

  if (hasVisibleGroup) {
    showIntegratedSearchMidSection(midSection);
  } else {
    hideIntegratedSearchMidSection(midSection);
  }
}

function escapeFilterChipText(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char]
  );
}

/** 체크된 필터 → 칩 렌더 (주제별 지도 applied 칩과 동일) */
function syncIntegratedSearchFilterChips(filterPanel) {
  if (!filterPanel) return;

  const chipsRoot = filterPanel.querySelector('[data-integrated-search-filter-chips]');
  if (!chipsRoot) return;

  chipsRoot.innerHTML = '';

  filterPanel.querySelectorAll('input[type="checkbox"]:checked').forEach((input) => {
    if (!input.id) return;
    const labelText = filterPanelLabel(input) || input.value;
    const safeLabel = escapeFilterChipText(labelText);
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="chip border-slate-500 border h-36 w-fit px-12 radius-md-6 gap-6 flex align-center justify-center bg-white">
        <span class="body2-r-16 color-slate-700">${safeLabel}</span>
        <button type="button" class="chips-close-icon" data-integrated-search-filter-chip-remove="${escapeFilterChipText(input.id)}">
          <span class="blind">${safeLabel} 필터 삭제</span>
        </button>
      </div>
    `;
    chipsRoot.appendChild(li);
  });
}

/** 선택된 필터 총개수 계산 */
function getIntegratedSearchFilterCheckedCount(filterPanel) {
  if (!filterPanel) return 0;
  return filterPanel.querySelectorAll('input[type="checkbox"]:checked').length;
}

/** 필터 버튼 옆 선택 개수 뱃지 */
/** 필터 개수 배지와 접근성 문구 갱신 */
function syncIntegratedSearchFilterCount(filterPanel) {
  if (!filterPanel) return;

  const root = filterPanel.closest('[data-result-panel-view="integrated-search"]');
  const filterBtn = root?.querySelector('[data-integrated-search-filter]');
  const countEl = filterBtn?.querySelector('[data-integrated-search-filter-count]');
  if (!filterBtn || !countEl) return;

  const count = getIntegratedSearchFilterCheckedCount(filterPanel);

  countEl.textContent = String(count);
  countEl.hidden = count === 0;
  countEl.setAttribute('aria-hidden', count === 0 ? 'true' : 'false');
  filterBtn.classList.toggle('has-filter-count', count > 0);
  filterBtn.setAttribute('aria-label', count > 0 ? `상세 필터 ${count}개 적용` : '상세 필터');
}

/** 대분류 변경 내용 반영 */
function handleMajorFilterCheckboxChange(checkbox) {
  const filterPanel = checkbox.closest('[data-integrated-search-filter-panel]');
  if (!filterPanel) return;

  const root = checkbox.closest('[data-result-panel-view="integrated-search"]');
  if (root && window.IntegratedSearch && !window.IntegratedSearch.root) {
    window.IntegratedSearch.root = root;
  }

  syncIntegratedSearchFilterMidGroups(filterPanel, { dispatchEvent: true, changedMajor: checkbox });
  syncIntegratedSearchFilterChips(filterPanel);
  syncIntegratedSearchFilterCount(filterPanel);

  window.IntegratedSearch?.dispatchFilterChange();
}

/** 중분류·기타 체크 변경 내용 반영 */
function handleFilterCheckboxChange(checkbox) {
  const filterPanel = checkbox.closest('[data-integrated-search-filter-panel]');
  if (!filterPanel) return;

  syncIntegratedSearchFilterChips(filterPanel);
  syncIntegratedSearchFilterCount(filterPanel);
  window.IntegratedSearch?.dispatchFilterChange();
}

let integratedSearchFilterEventsInitialized = false;

/** 동적 필터 이벤트 최초 1회 연결 */
function initIntegratedSearchFilterEvents() {
  if (integratedSearchFilterEventsInitialized) return;
  integratedSearchFilterEventsInitialized = true;

  document.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('[data-integrated-search-filter-chip-remove]');
    if (!removeBtn) return;

    const filterPanel = removeBtn.closest('[data-integrated-search-filter-panel]');
    if (!filterPanel) return;

    const inputId = removeBtn.dataset.integratedSearchFilterChipRemove;
    if (!inputId) return;
    const input = document.getElementById(inputId);
    if (!input || !filterPanel.contains(input)) return;

    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.closest('[data-integrated-search-filter-panel]')) return;

    if (target.matches('[data-integrated-search-filter-major], [data-search-filter-major]')) {
      handleMajorFilterCheckboxChange(target);
      return;
    }

    if (target.matches('input[type="checkbox"]')) {
      handleFilterCheckboxChange(target);
    }
  });
}

/** 필터 선택값과 중분류 초기화 */
function resetIntegratedSearchFilterPanel(filterPanel) {
  if (!filterPanel) return;

  filterPanel
    .querySelectorAll('input[type="checkbox"], input[type="radio"]')
    .forEach((input) => {
      if (input.type === 'radio') return;
      input.checked = false;
      input.indeterminate = false;
    });

  const periodAll = filterPanel.querySelector('#filter-period-all');
  if (periodAll) periodAll.checked = true;

  syncIntegratedSearchFilterMidGroups(filterPanel);
  window.SearchFilter?.syncMidGroups?.(filterPanel);
  syncIntegratedSearchFilterChips(filterPanel);
  syncIntegratedSearchFilterCount(filterPanel);

  const detail = { majors: [], mids: [] };
  window.dispatchEvent(new CustomEvent('integrated-search:filter-change', { detail }));
  window.dispatchEvent(new CustomEvent('integrated-search:filter-reset', { detail }));
}

/** 초기화 버튼 연결 */
function initIntegratedSearchFilterReset(btn) {
  if (btn.dataset.filterResetInit === 'true') return;
  btn.dataset.filterResetInit = 'true';

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    resetIntegratedSearchFilterPanel(btn.closest('[data-integrated-search-filter-panel]'));
  });
}

/** 상세 필터 기능 초기화 */
function bootIntegratedSearchFilter() {
  document.querySelectorAll('[data-integrated-search-filter]').forEach(initIntegratedSearchFilter);
  document.querySelectorAll('[data-integrated-search-filter-toggle]').forEach(initFilterSectionToggle);
  document.querySelectorAll('[data-integrated-search-filter-reset]').forEach(initIntegratedSearchFilterReset);
  initIntegratedSearchFilterEvents();
}

bootIntegratedSearchFilter();
