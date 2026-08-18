/**
 * 통합검색 구분별 화면(데이터셋·Open API·문의하기) 공용 동작.
 *
 *   SearchListing.init('[data-openapi-list]', items); // 카드 목록 + 적용 필터
 *   SearchListing.initApplied();                      // 적용 필터만 (문의하기처럼 마크업 목록)
 */
window.SearchListing = {
  escape(value) {
    return String(value).replace(/[&<>"']/g, (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char],
    );
  },

  /** 적용된 필터 칩 — 필터 패널의 체크박스만 반영한다 */
  initApplied() {
    const filterPanel = document.querySelector('[data-filter-panel]');
    const appliedBox = document.querySelector('[data-applied-filter]');
    const appliedList = document.querySelector('[data-applied-list]');
    const appliedCount = document.querySelector('[data-applied-count]');
    if (!filterPanel || !appliedBox || !appliedList || !appliedCount) return;

    const escape = this.escape;

    const renderApplied = () => {
      const checked = [...filterPanel.querySelectorAll('input[type="checkbox"]:checked')];
      appliedCount.textContent = String(checked.length);
      appliedBox.hidden = checked.length === 0;
      appliedList.innerHTML = checked
        .map((checkbox) => {
          const label =
            document.querySelector(`label[for="${checkbox.id}"]`)?.textContent.trim() || checkbox.value;
          return `
      <li>
        <div class="chip border-slate-500 border h-36 w-fit px-12 radius-md-6 gap-6 flex align-center justify-center bg-white">
          <span class="body2-m-16 color-slate-700">${escape(label)}</span>
          <button type="button" class="chips-close-icon" data-applied-remove="${escape(checkbox.id)}">
            <span class="blind">${escape(label)} 필터 삭제</span>
          </button>
        </div>
      </li>`;
        })
        .join('');
    };

    filterPanel.addEventListener('change', (event) => {
      if (event.target.matches('input[type="checkbox"]')) renderApplied();
    });

    appliedList.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-applied-remove]');
      if (!btn) return;

      const checkbox = document.getElementById(btn.dataset.appliedRemove);
      if (!checkbox) return;

      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      renderApplied();
    });

    document.querySelector('[data-applied-reset]')?.addEventListener('click', () => {
      filterPanel.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
      renderApplied();
    });

    // 필터 패널의 초기화는 search-filter.js 가 change 없이 비우므로 여기서 칩을 다시 그린다
    document.querySelector('[data-search-filter-reset]')?.addEventListener('click', renderApplied);

    renderApplied();
  },

  init(listSelector, items) {
    const list = document.querySelector(listSelector);
    if (!list || !window.DatasetCard) return;

    const cardOptions = { showCheckbox: false, showBookmark: false, pinAttr: false };
    let view = 'card';

    const renderList = () => {
      const isList = view === 'list';
      list.className = isList
        ? 'tp-cards tp-list flex flex-col border-t border-slate-200 mt-24'
        : 'tp-cards mt-24';
      list.innerHTML = items
        .map((item) =>
          isList
            ? DatasetCard.renderListRow(item, { ...cardOptions, showPortalLink: true })
            : DatasetCard.render(item, { ...cardOptions, showPortalLink: true }),
        )
        .join('');
    };

    document.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        view = btn.dataset.view;
        document.querySelectorAll('[data-view]').forEach((entry) => {
          const active = entry === btn;
          entry.classList.toggle('active', active);
          entry.setAttribute('aria-pressed', String(active));
        });
        renderList();
      });
    });

    this.initApplied();
    renderList();
  },
};
