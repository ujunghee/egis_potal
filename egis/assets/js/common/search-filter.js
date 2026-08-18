const searchFilter = document.querySelector('.search-filter');
const filterPanel = document.querySelector('[data-filter-panel]');
let periodStartPicker = null;
let periodEndPicker = null;
let periodRangePicker = null;

const PERIOD_MESSAGE = {
  end: '종료일은 시작일 이후 날짜로 선택해 주세요.',
  start: '시작일은 종료일 이전 날짜로 선택해 주세요.',
  invalid: '날짜 형식을 확인해 주세요.',
};

function notifyPeriodError(message) {
  if (window.Toast) {
    window.Toast.warning(message);
    return;
  }
  console.warn(message);
}

/**
 * 시작일·종료일 순서 검증.
 * 두 날짜가 같거나 뒤집혀 있으면 토스트로 알리고 방금 고른 쪽을 비운다.
 */
function validatePeriodOrder(changedField) {
  const start = periodStartPicker?.selectedDates[0];
  const end = periodEndPicker?.selectedDates[0];
  if (!start || !end) return true;

  const invalid = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime());
  if (!invalid && end.getTime() > start.getTime()) return true;

  notifyPeriodError(invalid ? PERIOD_MESSAGE.invalid : PERIOD_MESSAGE[changedField]);
  // clear(false): onChange를 다시 태우지 않도록 이벤트 없이 비운다
  (changedField === 'end' ? periodEndPicker : periodStartPicker)?.clear(false);
  return false;
}

function selectPeriodCustomRadio() {
  const custom = document.getElementById('filter-period-custom');
  if (custom && !custom.checked) {
    custom.checked = true;
  }
}

function clearPeriodDates() {
  periodStartPicker?.clear();
  periodEndPicker?.clear();
}

function clearPeriodRange() {
  periodRangePicker?.clear();
}

function bindPeriodCustomRadio(inputId) {
  const input = document.getElementById(inputId);
  const trigger = document.querySelector(`[data-datepicker-for="${inputId}"]`);

  trigger?.addEventListener('click', selectPeriodCustomRadio);
  input?.addEventListener('change', selectPeriodCustomRadio);
}

function openFilterPanel(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle]');

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

  panel.addEventListener('transitionend', function onOpenEnd(e) {
    if (e.propertyName !== 'height' || !section.classList.contains('active')) return;
    panel.style.height = 'auto';
    panel.style.overflow = 'visible';
    panel.classList.add('is-open');
    panel.removeEventListener('transitionend', onOpenEnd);
  });
}

function closeFilterPanel(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle]');

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

function initFilterPanels() {
  if (!searchFilter) return;
  searchFilter.querySelectorAll('.search-filter__section').forEach((section) => {
    const panel = section.querySelector('.search-filter__panel');

    if (section.classList.contains('active')) {
      panel.style.height = 'auto';
      panel.style.overflow = 'visible';
      panel.classList.add('is-open');
    } else {
      panel.style.height = '0';
      panel.style.overflow = 'hidden';
      panel.classList.remove('is-open');
    }
  });
}

function showMidSection(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle]');
  if (!panel || !toggle) return;

  section.classList.add('active', 'is-visible');
  toggle.setAttribute('aria-expanded', 'true');
  panel.classList.add('is-open');
  panel.style.height = 'auto';
  panel.style.overflow = 'visible';
}

function hideMidSection(section) {
  const panel = section.querySelector('.search-filter__panel');
  const toggle = section.querySelector('[data-search-filter-toggle]');
  if (!panel || !toggle) return;

  section.classList.remove('active', 'is-visible');
  toggle.setAttribute('aria-expanded', 'false');
  panel.classList.remove('is-open');
  panel.style.height = '0';
  panel.style.overflow = 'hidden';
}

/**
 * 대분류 체크에 맞춰 중분류 그룹을 보여 준다.
 * 주제별지도·Open API·통합검색이 같은 data 속성을 쓴다.
 *
 *   [data-search-filter-major]           — 대분류 체크박스 (value = 그룹 키)
 *   [data-search-filter-section="mid"]   — 중분류 섹션(선택 전에는 숨김)
 *   [data-search-filter-mid]             — 중분류 그룹 루트
 *   [data-search-filter-mid-for="키"]    — 대분류별 그룹
 */
function syncFilterMidGroups(panel = filterPanel) {
  if (!panel) return;

  const midRoot = panel.querySelector('[data-search-filter-mid]');
  const midSection = panel.querySelector('[data-search-filter-section="mid"]');
  if (!midRoot || !midSection) return;

  panel.querySelectorAll('[data-search-filter-major]').forEach((major) => {
    const group = midRoot.querySelector(`[data-search-filter-mid-for="${major.value}"]`);
    if (!group) return;

    if (major.checked) {
      group.classList.add('is-visible');
    } else {
      group.classList.remove('is-visible');
      group.querySelectorAll('[data-search-filter-mid]').forEach((mid) => {
        mid.checked = false;
      });
    }
  });

  const hasVisibleGroup = [...midRoot.querySelectorAll('[data-search-filter-mid-for]')].some((group) =>
    group.classList.contains('is-visible'),
  );

  if (hasVisibleGroup) {
    showMidSection(midSection);
  } else {
    hideMidSection(midSection);
  }
}

window.SearchFilter = {
  syncMidGroups: syncFilterMidGroups,
  initPanels: initFilterPanels,
};

document.querySelectorAll('[data-search-filter-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const section = toggle.closest('.search-filter__section');
    if (section.classList.contains('active')) {
      closeFilterPanel(section);
    } else {
      openFilterPanel(section);
    }
  });
});

document.querySelector('[data-search-filter-reset]')?.addEventListener('click', () => {
  if (!searchFilter) return;
  searchFilter.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  searchFilter.querySelectorAll('select').forEach((select) => {
    select.selectedIndex = 0;
  });
  const periodAll = document.getElementById('filter-period-all');
  if (periodAll) {
    periodAll.checked = true;
    clearPeriodDates();
  }
  const period2All = document.getElementById('filter-period-2-all');
  if (period2All) {
    period2All.checked = true;
    clearPeriodRange();
  }
  // 중분류 섹션은 체크 해제 후 다시 맞춰야 한다
  queueMicrotask(() => syncFilterMidGroups(filterPanel));
});

if (searchFilter) {
  searchFilter.querySelectorAll('[name="filter-period"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked && radio.value !== 'custom') {
        clearPeriodDates();
      }
    });
  });

  searchFilter.querySelectorAll('[name="filter-period-2"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked && radio.value !== 'custom') {
        clearPeriodRange();
      }
    });
  });
}

filterPanel?.addEventListener('change', (event) => {
  if (event.target.matches('[data-search-filter-major]')) {
    syncFilterMidGroups(filterPanel);
  }
});

if (typeof initPicker === 'function') {
  periodStartPicker = initPicker('filter-period-start', {
    onChange: () => {
      selectPeriodCustomRadio();
      validatePeriodOrder('start');
    },
  });
  periodEndPicker = initPicker('filter-period-end', {
    onChange: () => {
      selectPeriodCustomRadio();
      validatePeriodOrder('end');
    },
  });
  periodRangePicker = initPicker('filter-period-range', { mode: 'range' });

  bindPeriodCustomRadio('filter-period-start');
  bindPeriodCustomRadio('filter-period-end');
}

initFilterPanels();
syncFilterMidGroups(filterPanel);
