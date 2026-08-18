/** 검색 필터 패널·적용된 필터 */

/** 대분류 → 중분류는 공용 search-filter.js (SearchFilter.syncMidGroups) */
OpenApi.syncFilterMidGroups = (panel) => {
  window.SearchFilter?.syncMidGroups(panel);
};

OpenApi.renderApplied = () => {
  const box = document.querySelector('[data-applied-filter]');
  const list = document.querySelector('[data-applied-list]');
  const count = document.querySelector('[data-applied-count]');
  if (!box || !list || !count) return;

  const checked = [...document.querySelectorAll('[data-filter-panel] input[type="checkbox"]:checked')];
  count.textContent = checked.length;
  box.hidden = checked.length === 0;
  list.innerHTML = checked
    .map((checkbox) => {
      const label = document.querySelector(`label[for="${checkbox.id}"]`)?.textContent.trim() || checkbox.value;
      return `
      <li>
        <div class="chip border-slate-500 border h-36 w-fit px-12 radius-md-6 gap-6 flex align-center justify-center bg-white">
          <span class="body2-m-16 color-slate-700">${OpenApi.escape(label)}</span>
          <button type="button" class="chips-close-icon" data-applied-remove="${OpenApi.escape(checkbox.id)}">
            <span class="blind">${OpenApi.escape(label)} 필터 삭제</span>
          </button>
        </div>
      </li>`;
    })
    .join('');
};

OpenApi.initFilter = (onLayoutChange) => {
  const toggle = document.querySelector('[data-filter-toggle]');
  const panel = document.querySelector('[data-filter-panel]');
  const content = document.querySelector('.tp-content');
  const filterPanel = document.querySelector('[data-filter-panel]');

  toggle?.addEventListener('click', () => {
    const open = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    content?.classList.toggle('grid-column-9', open);
    content?.classList.toggle('grid-column-12', !open);
    onLayoutChange?.();
  });

  filterPanel?.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      OpenApi.renderApplied();
    }
  });

  filterPanel?.querySelector('[data-search-filter-reset]')?.addEventListener('click', () => {
    queueMicrotask(() => {
      OpenApi.renderApplied();
    });
  });

  document.querySelector('[data-applied-list]')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-applied-remove]');
    if (!btn) return;
    const checkbox = document.getElementById(btn.dataset.appliedRemove);
    if (!checkbox) return;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  });

  document.querySelector('[data-applied-reset]')?.addEventListener('click', () => {
    filterPanel?.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });
    OpenApi.renderApplied();
  });

  OpenApi.syncFilterMidGroups(filterPanel);
};
