/** 환경 시각화 도구 — 트리맵 드릴다운 (jQuery + ECharts) */
jQuery(function ($) {
  const $el = $('[data-vt-treemap]');
  const $chartWrap = $('[data-vt-chart]');
  const $tmLayout = $('[data-vt-tm-layout]');
  const $tmDetail = $('[data-vt-tm-detail]');
  const $tmDetailClose = $('[data-vt-tm-detail-close]');
  const $pathList = $('[data-vt-path-trail] .vt-path__list');
  if (!$el.length || typeof echarts === 'undefined') return;

  const el = $el[0];

  /** 소분류 → 데이터셋 상세(검색) */
  const DATASET_PAGE_URL = '../search/dataset.html';

  let selectedSmallId = null;

  const COLORS = {
    blue: '#186be8',
    green: '#288755',
    orange: '#e17e1a',
    teal: '#04748b',
  };

  /* 물환경 — 블루 */
  const COLORS_WATER = [
    '#0b326b',
    '#0e418c',
    '#1254b5',
    '#186be8',
    '#1a76ff',
    '#4891ff',
    '#021f4e',
    '#032966',
    '#043584',
    '#0543a9',
    '#054aba',
    '#376ec8',
    '#0b3d69',
    '#0e5089',
    '#1267b1',
    '#1784e3',
  ];

  /* 자연환경 — 그린 */
  const COLORS_NATURE = [
    '#023a27',
    '#024c34',
    '#036343',
    '#047e56',
    '#048b5e',
    '#36a27e',
    '#1a3a36',
    '#224c47',
    '#2b635c',
    '#387e75',
    '#3d8b81',
    '#64a29a',
    '#185032',
    '#1f6942',
    '#288755',
    '#33ad6d',
  ];

  /* 탄소중립/ dark-blue-teal) */
  const COLORS_CARBON = [
    '#02313a',
    '#02404c',
    '#035263',
    '#046a7e',
    '#04748b',
    '#3690a2',
    '#57a2b1',
    '#0d242f',
    '#122f3e',
    '#173c50',
    '#1d4d66',
    '#205570',
    '#4d778d',
    '#022d3a',
    '#023a4c',
    '#034b63',
  ];

  /* 에너지/ pink / mulberry) */
  const COLORS_ENERGY = [
    '#683a0c',
    '#884c10',
    '#af6215',
    '#e17e1a',
    '#f78a1d',
    '#682b0c',
    '#883810',
    '#af4815',
    '#e15d1a',
    '#651c22',
    '#84242d',
    '#aa2f3a',
    '#da3c4a',
    '#471c3a',
    '#5d244b',
    '#782f61',
  ];

  const FONT = "'Pretendard GOV', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  /** 타일 사이 2px 흰 간격 — 타일은 직각, 바깥 radius-md-8은 .vt-chart overflow clip */
  const TILE_GAP = 2;

  const createSmallNodes = (prefix, colors) =>
    colors.map((color, index) => ({
      id: `small-${prefix}-${index + 1}`,
      level: 'small',
      name: `${prefix} 소분류`,
      title: '소분류명',
      pathLabel: '소분류 제목',
      value: 1,
      percent: 62.5,
      datasets: 2350,
      share: 20.9,
      shareLabel: '중분류명 내 비율',
      actionLabel: '데이터셋 보기',
      actionType: 'dataset',
      itemStyle: { color },
    }));

  const createMidNodes = (prefix, colors) =>
    colors.map((color, index) => ({
      id: `mid-${prefix}-${index + 1}`,
      level: 'mid',
      name: `${prefix} 중분류`,
      title: '중분류명',
      pathLabel: '중분류 제목',
      value: 1,
      percent: 62.5,
      datasets: 2350,
      share: 20.9,
      shareLabel: `${prefix} 내 비율`,
      childCount: 6,
      actionLabel: '하위 분류 보기',
      actionType: 'drill',
      itemStyle: { color },
      children: createSmallNodes(prefix, colors),
    }));

  const rootData = [
    {
      id: 'major-1',
      level: 'major',
      name: '대분류',
      title: '대분류명',
      pathLabel: '대분류 제목',
      value: 50,
      percent: 45,
      datasets: 2350,
      share: 62.5,
      shareLabel: '전체 데이터',
      childCount: 16,
      actionLabel: '하위 분류 보기',
      actionType: 'drill',
      itemStyle: { color: COLORS.blue },
      children: createMidNodes('물환경', COLORS_WATER),
    },
    {
      id: 'major-2',
      level: 'major',
      name: '대분류',
      title: '대분류명',
      pathLabel: '대분류 제목',
      value: 29,
      percent: 28,
      datasets: 1480,
      share: 28.0,
      shareLabel: '전체 데이터',
      childCount: 16,
      actionLabel: '하위 분류 보기',
      actionType: 'drill',
      itemStyle: { color: COLORS.green },
      children: createMidNodes('자연환경', COLORS_NATURE),
    },
    {
      id: 'major-3',
      level: 'major',
      name: '대분류',
      title: '대분류명',
      pathLabel: '대분류 제목',
      value: 15,
      percent: 17,
      datasets: 920,
      share: 17.0,
      shareLabel: '전체 데이터',
      childCount: 16,
      actionLabel: '하위 분류 보기',
      actionType: 'drill',
      itemStyle: { color: COLORS.orange },
      children: createMidNodes('에너지', COLORS_ENERGY),
    },
    {
      id: 'major-4',
      level: 'major',
      name: '대분류',
      title: '대분류명',
      pathLabel: '대분류 제목',
      value: 6,
      percent: 10,
      datasets: 410,
      share: 10.0,
      shareLabel: '전체 데이터',
      childCount: 16,
      actionLabel: '하위 분류 보기',
      actionType: 'drill',
      itemStyle: { color: COLORS.teal },
      children: createMidNodes('탄소중립', COLORS_CARBON),
    },
  ];

  /** @type {{ level: 'root' | 'mid' | 'small', major: object | null, mid: object | null }} */
  let view = { level: 'root', major: null, mid: null };
  let hoverItem = null;

  const formatCount = (n) => `${Number(n).toLocaleString('ko-KR')}건`;
  const formatShare = (n) => `${Number(n)}%`;
  const formatChild = (n) => `${Number(n)}개`;

  const leafData = (nodes) => nodes.map(({ children, ...rest }) => rest);

  const isGridLevel = () => view.level === 'mid' || view.level === 'small';

  const currentLeaves = () => {
    let leaves;
    if (view.level === 'small' && view.mid?.children) {
      leaves = leafData(view.mid.children);
    } else if (view.level === 'mid' && view.major?.children) {
      leaves = leafData(view.major.children);
    } else {
      leaves = leafData(rootData);
    }
    if (view.level !== 'small' || !selectedSmallId) return leaves;
    return leaves.map((item) => {
      const base = item.itemStyle || {};
      const selected = item.id === selectedSmallId;
      return {
        ...item,
        itemStyle: {
          ...base,
          borderColor: '#fff',
          borderWidth: selected ? 4 : 0,
          gapWidth: TILE_GAP,
          borderRadius: 0,
        },
      };
    });
  };

  const clearSmallSelection = () => {
    selectedSmallId = null;
    setTmDetailOpen(false);
  };

  const setTmDetailOpen = (open) => {
    if (!$tmDetail.length) return;
    $tmDetail.prop('hidden', !open);
    $tmLayout.toggleClass('is-detail-open', open);
    window.requestAnimationFrame(() => chart.resize());
  };

  const goToDatasetPage = () => {
    window.location.href = DATASET_PAGE_URL;
  };

  const selectSmallCell = (data) => {
    if (!data?.id || view.level !== 'small') return;
    selectedSmallId = selectedSmallId === data.id ? null : data.id;
    setTmDetailOpen(false);
    renderChart();
  };

  const tooltipHtml = (item) => {
    const title = item.title || item.name || '대분류명';
    const datasets = formatCount(item.datasets ?? 0);
    const share = formatShare(item.share ?? item.percent ?? 0);
    const shareLabel = item.shareLabel || '전체 데이터';
    const actionLabel = item.actionLabel || '하위 분류 보기';
    const showChildren = item.level !== 'small' && item.childCount != null;

    const childRow = showChildren
      ? `<div class="vt-hover__row">
          <dt class="body3-r-14 color-slate-700">하위 분류</dt>
          <dd class="body3-m-14 color-slate-900">${formatChild(item.childCount)}</dd>
        </div>`
      : '';

    return `
      <div class="vt-hover">
        <p class="vt-hover__title body3-sb-14 color-slate-900">${title}</p>
        <div class="vt-hover__body">
          <dl class="vt-hover__rows">
            <div class="vt-hover__row">
              <dt class="body3-r-14 color-slate-700">데이터셋</dt>
              <dd class="body3-m-14 color-slate-900">${datasets}</dd>
            </div>
            <div class="vt-hover__row">
              <dt class="body3-r-14 color-slate-700">${shareLabel}</dt>
              <dd class="body3-m-14 color-slate-900">${share}</dd>
            </div>
            ${childRow}
          </dl>
          <div class="vt-hover__divider" aria-hidden="true"></div>
          <button type="button" class="vt-hover__action body3-m-14 color-slate-900" data-vt-hover-drill data-vt-action="${item.actionType || 'drill'}">
            <span>${actionLabel}</span>
            <i class="arrow-right-sm-slate-700" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  };

  const appendPathItem = (label, target, ariaLabel) => {
    const $btn = $('<button>', {
      type: 'button',
      class: 'vt-path__link body2-r-16 color-slate-700',
      text: label,
      'data-vt-path-up': target,
      'aria-label': ariaLabel,
    });
    $pathList.append($('<li>', { class: 'vt-path__item' }).append($btn));
  };

  const appendChevron = () => {
    $pathList.append(
      $('<li>', { class: 'vt-path__item', 'aria-hidden': 'true' }).html(
        '<i class="vt-path__chevron"></i>',
      ),
    );
  };

  const renderPath = () => {
    if (!$pathList.length) return;
    $pathList.empty();

    if (view.level === 'root' || !view.major) return;

    appendPathItem(
      view.major.pathLabel || '대분류 제목',
      'root',
      '대분류 목록으로 돌아가기'
    );

    if (view.level === 'small' && view.mid) {
      appendChevron();
      appendPathItem(
        view.mid.pathLabel || '중분류 제목',
        'mid',
        '중분류 목록으로 돌아가기'
      );
    }
  };

  const syncChrome = () => {
    const drilled = isGridLevel();
    $chartWrap.toggleClass('is-mid', drilled);
    $chartWrap.toggleClass('is-small', view.level === 'small');
    const labels = {
      root: '대분류 트리맵',
      mid: '중분류 트리맵',
      small: '소분류 트리맵',
    };
    $el.attr('aria-label', labels[view.level] || labels.root);
    renderPath();
  };

  const chart = echarts.init(el, null, { renderer: 'canvas' });

  /** 컨테이너(보더 박스) 비율 — squareRatio 1이면 정사각 타일만 그려 안쪽에 빈 여백 생김 */
  const tileSquareRatio = () => {
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    return w / h;
  };

  const buildOption = (data) => ({
    animation: false,
    tooltip: {
      show: true,
      trigger: 'item',
      triggerOn: 'mousemove',
      enterable: true,
      confine: false,
      appendToBody: true,
      className: 'vt-treemap-tooltip',
      borderWidth: 0,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      padding: 0,
      extraCssText: 'box-shadow: none; pointer-events: auto;',
      formatter: (params) => {
        if (!params?.data || params.data.children) return '';
        hoverItem = params.data;
        return tooltipHtml(params.data);
      },
    },
    series: [
      {
        type: 'treemap',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        squareRatio: tileSquareRatio(),
        sort: isGridLevel() ? null : 'desc',
        label: {
          show: true,
          position: 'insideTopLeft',
          distance: 0,
          padding: [18, 18, 18, 18],
          formatter: (params) => {
            const pct = params.data?.percent ?? params.value;
            return `{name|${params.name}}\n{pct|${pct}%}`;
          },
          rich: {
            name: {
              color: '#fff',
              fontSize: 22,
              fontWeight: 400,
              fontFamily: FONT,
              lineHeight: 35,
              letterSpacing: -0.2,
            },
            pct: {
              color: '#fff',
              fontSize: 22,
              fontWeight: 600,
              fontFamily: FONT,
              lineHeight: 35,
              letterSpacing: -0.2,
            },
          },
        },
        upperLabel: { show: false },
        itemStyle: {
          borderWidth: 0,
          gapWidth: TILE_GAP,
          borderRadius: 0,
        },
        emphasis: { disabled: true },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: TILE_GAP,
              borderRadius: 0,
              color: '#fff',
            },
          },
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: TILE_GAP,
              borderRadius: 0,
            },
          },
        ],
        data,
      },
    ],
  });

  const renderChart = () => {
    syncChrome();
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      chart.resize();
    }
    chart.setOption(buildOption(currentLeaves()), true);
    requestAnimationFrame(() => {
      chart.resize();
    });
  };

  const findMajor = (id) => rootData.find((item) => item.id === id) || null;

  const findMid = (major, id) =>
    major?.children?.find((item) => item.id === id) || null;

  const drillToMajor = (major) => {
    if (!major?.children?.length) return;
    const full = findMajor(major.id) || major;
    clearSmallSelection();
    view = { level: 'mid', major: full, mid: null };
    hoverItem = null;
    chart.dispatchAction({ type: 'hideTip' });
    renderChart();
  };

  const drillToMid = (mid) => {
    if (!mid?.children?.length || !view.major) return;
    const fullMid = findMid(view.major, mid.id) || mid;
    clearSmallSelection();
    view = { level: 'small', major: view.major, mid: fullMid };
    hoverItem = null;
    chart.dispatchAction({ type: 'hideTip' });
    renderChart();
  };

  const drillToRoot = () => {
    clearSmallSelection();
    view = { level: 'root', major: null, mid: null };
    hoverItem = null;
    chart.dispatchAction({ type: 'hideTip' });
    renderChart();
  };

  const drillUpToMid = () => {
    if (!view.major) {
      drillToRoot();
      return;
    }
    clearSmallSelection();
    view = { level: 'mid', major: view.major, mid: null };
    hoverItem = null;
    chart.dispatchAction({ type: 'hideTip' });
    renderChart();
  };

  chart.on('click', (params) => {
    const data = params?.data;
    if (!data) return;

    if (view.level === 'root' && data.level === 'major') {
      drillToMajor(findMajor(data.id) || data);
      return;
    }

    if (view.level === 'mid' && data.level === 'mid') {
      const mid = findMid(view.major, data.id) || data;
      drillToMid(mid);
      return;
    }

    if (view.level === 'small' && data.level === 'small') {
      selectSmallCell(data);
    }
  });

  $tmDetailClose.on('click', () => {
    setTmDetailOpen(false);
    window.requestAnimationFrame(() => chart.resize());
  });

  $(document).on('click', '[data-vt-path-up], [data-vt-hover-drill]', function (event) {
    const $target = $(event.target);
    const $up = $target.closest('[data-vt-path-up]');
    if ($up.length) {
      event.preventDefault();
      const upTarget = $up.attr('data-vt-path-up');
      if (upTarget === 'root') drillToRoot();
      else if (upTarget === 'mid') drillUpToMid();
      return;
    }

    const $btn = $target.closest('[data-vt-hover-drill]');
    if (!$btn.length) return;
    event.preventDefault();
    event.stopPropagation();

    const action = $btn.attr('data-vt-action') || hoverItem?.actionType;

    if (action === 'dataset') {
      chart.dispatchAction({ type: 'hideTip' });
      goToDatasetPage();
      return;
    }

    if (view.level === 'root' && hoverItem?.level === 'major') {
      drillToMajor(findMajor(hoverItem.id) || hoverItem);
      return;
    }

    if (view.level === 'mid' && hoverItem?.level === 'mid') {
      const mid = findMid(view.major, hoverItem.id) || hoverItem;
      drillToMid(mid);
    }
  });

  const $expandBtn = $('[data-vt-treemap-expand]');
  const $fsExitBtn = $('[data-vt-fullscreen-exit]');

  const setTmFullscreen = (open, options) => {
    const syncBody = !options || options.syncBody !== false;
    const focus = !options || options.focus !== false;
    if (syncBody) {
      $('body').toggleClass('is-vt-tm-fullscreen', open);
    }
    $expandBtn.attr('aria-expanded', String(open));
    if (syncBody) window.syncVtFullscreenExit?.();
    window.requestAnimationFrame(() => {
      chart.resize();
      if (!focus) return;
      if (open) $fsExitBtn.trigger('focus');
      else $expandBtn.trigger('focus');
    });
  };

  $expandBtn.on('click', () => setTmFullscreen(true));

  window.VtTreemap = {
    show() {
      window.requestAnimationFrame(() => chart.resize());
    },
    setFullscreenUI: (open) => {
      $expandBtn.attr('aria-expanded', String(open));
    },
    enterFullscreen: (options) => setTmFullscreen(true, options),
    exitFullscreen: (options) => setTmFullscreen(false, options),
  };

  const resize = () => {
    chart.resize();
  };
  $(window).on('resize', resize);

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(resize);
    ro.observe($el.parent()[0] || el);
  }

  renderChart();
});
