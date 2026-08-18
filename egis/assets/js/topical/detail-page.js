/** 상세 페이지 */
function initTopicalDetail() {
  const list = document.querySelector('[data-detail-dataset-list]');

  initDetailSticky();
  const openDownload = initDetailDownload();

  document.querySelectorAll('[data-detail-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.detailTab;
      document.querySelectorAll('[data-detail-tab]').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.classList.toggle('color-slate-900', active);
        item.classList.toggle('color-slate-500', !active);
        item.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('[data-detail-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.detailPanel !== target;
      });
    });
  });

  const setDatasetExpanded = (article, expanded) => {
    list?.querySelectorAll('[data-detail-dataset].is-expanded').forEach((item) => {
      if (item === article) return;
      item.classList.remove('is-expanded');
      const otherBtn = item.querySelector('[data-detail-action="expand"]');
      const otherIcon = otherBtn?.querySelector('i');
      otherIcon?.classList.remove('minimise');
      otherIcon?.classList.add('expend');
      otherBtn?.setAttribute('aria-label', '전체 화면');
      otherBtn?.setAttribute('aria-pressed', 'false');
    });

    article.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('is-dataset-expanded', expanded);

    const expandBtn = article.querySelector('[data-detail-action="expand"]');
    const icon = expandBtn?.querySelector('i');
    icon?.classList.toggle('expend', !expanded);
    icon?.classList.toggle('minimise', expanded);
    expandBtn?.setAttribute('aria-label', expanded ? '화면 최소화' : '전체 화면');
    expandBtn?.setAttribute('aria-pressed', String(expanded));
  };

  list?.addEventListener('click', (e) => {
    const article = e.target.closest('[data-detail-dataset]');
    if (!article) return;

    const collapse = e.target.closest('[data-detail-collapse]');
    if (collapse) {
      const collapsed = article.classList.toggle('is-collapsed');
      collapse.setAttribute('aria-expanded', String(!collapsed));
      collapse.setAttribute('aria-label', collapsed ? '구성 데이터 펼치기' : '구성 데이터 접기');
      return;
    }

    const tab = e.target.closest('[data-dataset-tab]');
    if (tab) {
      const target = tab.dataset.datasetTab;
      article.querySelectorAll('[data-dataset-tab]').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.classList.toggle('color-slate-900', active);
        item.classList.toggle('color-slate-500', !active);
        item.setAttribute('aria-selected', String(active));
      });
      article.querySelectorAll('[data-dataset-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.datasetPanel !== target;
      });
      const criteria = article.querySelector('[data-preview-criteria]');
      if (criteria) criteria.hidden = target !== 'preview';
      return;
    }

    const action = e.target.closest('[data-detail-action]');
    if (action) {
      if (action.dataset.detailAction === 'download') openDownload({ flow: 'dataset' });
      else if (action.dataset.detailAction === 'expand') {
        setDatasetExpanded(article, !article.classList.contains('is-expanded'));
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const expanded = list?.querySelector('[data-detail-dataset].is-expanded');
    if (expanded) setDatasetExpanded(expanded, false);
  });

  document.querySelectorAll('[data-detail-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await window.EgisClipboard?.copy(location.href);
      window.Toast?.show('링크가 복사되었습니다.');
    });
  });
}

window.initTopicalDetail = initTopicalDetail;
