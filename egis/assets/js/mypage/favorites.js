/** 마이페이지 — 관심 데이터 탭·카드/리스트 전환 */
(function () {
  const list = document.querySelector('[data-mypage-list]');
  const tabs = document.querySelectorAll('[data-mypage-tab]');
  const viewBtns = document.querySelectorAll('[data-mypage-view]');
  const master = document.getElementById('mypage-checkall');
  const deleteSelected = document.querySelector('[data-mypage-delete-selected]');
  if (!list || !window.DatasetCard) return;

  const items = [
    { id: 1, type: 'topical', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
    { id: 2, type: 'topical', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
    { id: 3, type: 'openapi', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
    { id: 4, type: 'topical', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
    { id: 5, type: 'openapi', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
    { id: 6, type: 'topical', title: '토지피복 시계열 변화량(1980-2010)', tags: ['토지피복', '시계열 변화', '토지피복 변화량'], views: 675, date: '2025.10.27', provider: '환경부 · 국립환경과학원', format: 'SHP, CSV' },
  ];

  const state = {
    tab: 'all',
    view: 'card',
  };

  const filteredItems = () =>
    items.filter((item) => state.tab === 'all' || item.type === state.tab);

  const getChecks = () => [...list.querySelectorAll('[data-mypage-check]')];

  const syncDeleteSelected = () => {
    if (!deleteSelected) return;
    const checkedCount = getChecks().filter((el) => el.checked).length;
    deleteSelected.hidden = checkedCount === 0;
  };

  const syncMaster = () => {
    if (!master) return;
    const checks = getChecks();
    const checkedCount = checks.filter((el) => el.checked).length;
    master.checked = checks.length > 0 && checkedCount === checks.length;
    master.indeterminate = checkedCount > 0 && checkedCount < checks.length;
    syncDeleteSelected();
  };

  const render = () => {
    const rows = filteredItems();
    const isList = state.view === 'list';

    list.className = isList
      ? 'tp-cards tp-list mypage__cards flex flex-col border-t border-slate-200'
      : 'tp-cards mypage__cards';

    list.innerHTML = rows
      .map((item) =>
        isList
          ? DatasetCard.renderListRow(item, {
              checkboxId: `mypage-item-${item.id}`,
              favorited: true,
              showCheckbox: true,
              showBookmark: true,
              pinAttr: false,
            })
          : DatasetCard.render(item, {
              checkboxId: `mypage-item-${item.id}`,
              favorited: true,
              showCheckbox: true,
              pinAttr: false,
            }),
      )
      .join('');

    if (master) {
      master.checked = false;
      master.indeterminate = false;
    }
    syncDeleteSelected();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.tab = tab.dataset.mypageTab;
      tabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle('active', active);
        btn.classList.toggle('color-slate-900', active);
        btn.classList.toggle('color-slate-500', !active);
        btn.setAttribute('aria-selected', String(active));
      });
      render();
    });
  });

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.mypageView;
      viewBtns.forEach((item) => {
        const active = item === btn;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });

  if (master) {
    master.addEventListener('change', () => {
      getChecks().forEach((el) => {
        el.checked = master.checked;
      });
      syncMaster();
    });
  }

  list.addEventListener('change', (event) => {
    if (event.target.matches('[data-mypage-check]')) syncMaster();
  });

  deleteSelected?.addEventListener('click', () => {
    const checked = getChecks().filter((el) => el.checked);
    if (!checked.length) return;

    window.ConfirmDialog?.show({
      title: '선택한 관심 데이터를 삭제하시겠습니까?',
      description: '삭제한 관심 데이터는 다시 복구할 수 없습니다.',
      cancelText: '취소',
      confirmText: '삭제하기',
      confirmVariant: 'danger',
      onConfirm: () => {
        const removeIds = new Set(
          checked.map((el) => Number(el.id.replace('mypage-item-', ''))),
        );
        for (let i = items.length - 1; i >= 0; i -= 1) {
          if (removeIds.has(items[i].id)) items.splice(i, 1);
        }
        render();
        window.Toast?.show?.('선택한 관심 데이터가 삭제되었습니다.');
      },
    });
  });

  render();
})();

