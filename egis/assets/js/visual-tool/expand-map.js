/** 환경 시각화 도구 — 확장맵 (jQuery + ECharts) */
jQuery(function ($) {
  const $expandPanel = $('[data-vt-panel="expand"]');
  const $el = $expandPanel.find('[data-vt-expand-chart]');
  const $wrap = $expandPanel.find('[data-vt-expand-wrap]');
  const $relationPanel = $('[data-vt-panel="relation"]');
  const $layout = $expandPanel.find('[data-vt-expand-layout]');
  if (!$expandPanel.length || !$el.length || !$wrap.length || !$layout.length || typeof echarts === 'undefined') {
    return;
  }
  const expandPanel = $expandPanel[0];
  const el = $el[0];
  const wrap = $wrap[0];
  const relationPanel = $relationPanel[0];
  const layout = $layout[0];

  const FONT = "'Pretendard GOV', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";

  const HEXAGON =
    'path://M20.4823 0H10.5177C8.54008 0 6.71271 1.04302 5.72388 2.7351L0.741621 11.2644C-0.247207 12.9575 -0.247207 15.0425 0.741621 16.7356L5.72388 25.2649C6.71271 26.9581 8.54008 28 10.5177 28H20.4823C22.4599 28 24.2873 26.957 25.2761 25.2649L30.2584 16.7356C31.2472 15.0425 31.2472 12.9575 30.2584 11.2644L25.2761 2.7351C24.2873 1.04194 22.4599 0 20.4823 0Z';
  const DIAMOND =
    'path://M11.3177 1.11147L1.11147 11.3177C-0.370489 12.7996 -0.370489 15.2013 1.11147 16.6823L11.3177 26.8885C12.7996 28.3705 15.2013 28.3705 16.6823 26.8885L26.8885 16.6823C28.3705 15.2004 28.3705 12.7987 26.8885 11.3177L16.6823 1.11147C15.2003 -0.37049 12.7987 -0.37049 11.3177 1.11147Z';
  const TRIANGLE =
    'path://M12.7223 1.04C13.5124 -0.346668 15.4876 -0.346666 16.2777 1.04L28.7219 22.88C29.512 24.2667 28.5244 26 26.9442 26H2.05582C0.475605 26 -0.512027 24.2667 0.27808 22.88L12.7223 1.04Z';

  const iconSymbol = (file) => {
    const link = document.createElement('a');
    link.href = `../../assets/image/icon/web/visual-tool/${file}`;
    return `image://${link.href}`;
  };

  const SYM = {
    ds: iconSymbol('expand-ds.svg'),
    dsActive: iconSymbol('expand-ds-active.svg'),
  };

  /* ECharts graph: symbolSize 배열 [w,h]는 path를 박스에 맞춰 찌그러뜨림 → 단일 값 + keepAspect */
  const MAJOR_SIZE = 31;
  const MID_SIZE = 28;
  const SMALL_SIZE = 29;
  const DS_SIZE = 26;
  const LABEL_GAP = 8;
  const ANIM_MS = 520;
  const POPOVER_GAP = 18;

  const COMPOSE_WATER = [
    '시도별 수질오염사고 발생 통계',
    '연도별 수질오염사고 발생 추이',
    '사고 원인별 수질오염 현황',
    '수계별 수질오염사고 발생 현황',
  ];

  const COMPOSE_THEME = [
    '지역별 에너지 소비 현황',
    '에너지원별 사용량 통계',
    '부문별 온실가스 배출량',
    '신재생에너지 발전량 현황',
  ];

  const THEMES = {
    water: {
      majorName: '물관리',
      major: '#186BE8',
      mid: '#33AD6D',
      small: '#0E418C',
      dsActive: '#0E418C',
      compose: COMPOSE_WATER,
    },
    nature: {
      majorName: '자연환경',
      major: '#33AD6D',
      mid: '#288755',
      small: '#1F6942',
      dsActive: '#1F6942',
      compose: COMPOSE_THEME,
    },
    carbon: {
      majorName: '탄소중립',
      major: '#04748B',
      mid: '#035263',
      small: '#02404C',
      dsActive: '#02404C',
      compose: COMPOSE_THEME,
    },
    energy: {
      majorName: '에너지',
      major: '#F78A1D',
      mid: '#AF6215',
      small: '#884C10',
      dsActive: '#884C10',
      compose: COMPOSE_THEME,
    },
  };

  const COLORS = {
    major: '#186be8',
    mid: '#33ad6d',
    small: '#97a2b1',
    line: '#b8bfca',
    dsFill: '#ffffff',
    dsBorder: '#b8bfca',
    dsActive: '#0e418c',
    dsText: '#1a1e23',
    label: '#1a1e23',
  };

  const ALL_NODES = [
    { id: 'major', name: '물관리', category: 0, x: 96, y: 380, level: 1 },
    { id: 'mid-1', name: '중분류', category: 1, x: 296, y: 200, level: 2 },
    { id: 'mid-2', name: '중분류', category: 1, x: 296, y: 380, level: 2 },
    { id: 'mid-3', name: '중분류', category: 1, x: 296, y: 560, level: 2 },
    { id: 'small-1', name: '소분류', category: 2, x: 501, y: 140, level: 3 },
    { id: 'small-2', name: '소분류', category: 2, x: 501, y: 240, level: 3 },
    { id: 'small-3', name: '소분류', category: 2, x: 501, y: 320, level: 3 },
    { id: 'small-4', name: '소분류', category: 2, x: 501, y: 420, level: 3 },
    { id: 'small-5', name: '소분류', category: 2, x: 501, y: 500, level: 3 },
    { id: 'small-6', name: '소분류', category: 2, x: 501, y: 600, level: 3 },
    { id: 'ds-1', name: '데이터셋', category: 3, x: 681, y: 120, level: 4 },
    { id: 'ds-2', name: '데이터셋', category: 3, x: 681, y: 159, level: 4 },
    { id: 'ds-3', name: '데이터셋', category: 3, x: 681, y: 220, level: 4 },
    { id: 'ds-4', name: '데이터셋', category: 3, x: 681, y: 259, level: 4 },
    { id: 'ds-5', name: '데이터셋', category: 3, x: 681, y: 300, level: 4 },
    { id: 'ds-6', name: '데이터셋', category: 3, x: 681, y: 339, level: 4 },
    { id: 'ds-7', name: '데이터셋', category: 3, x: 681, y: 400, level: 4 },
    { id: 'ds-8', name: '데이터셋', category: 3, x: 681, y: 439, level: 4 },
    { id: 'ds-9', name: '데이터셋', category: 3, x: 681, y: 480, level: 4 },
    { id: 'ds-10', name: '데이터셋', category: 3, x: 681, y: 519, level: 4 },
    { id: 'ds-11', name: '데이터셋', category: 3, x: 681, y: 580, level: 4 },
    { id: 'ds-12', name: '데이터셋', category: 3, x: 681, y: 619, level: 4 },
  ];

  const ALL_LINKS = [
    { source: 'major', target: 'mid-1', level: 2, curveness: 0.22 },
    { source: 'major', target: 'mid-2', level: 2, curveness: 0 },
    { source: 'major', target: 'mid-3', level: 2, curveness: -0.22 },
    { source: 'mid-1', target: 'small-1', level: 3, curveness: 0.15 },
    { source: 'mid-1', target: 'small-2', level: 3, curveness: 0.12 },
    { source: 'mid-2', target: 'small-3', level: 3, curveness: 0.12 },
    { source: 'mid-2', target: 'small-4', level: 3, curveness: 0.1 },
    { source: 'mid-3', target: 'small-5', level: 3, curveness: -0.1 },
    { source: 'mid-3', target: 'small-6', level: 3, curveness: -0.12 },
    { source: 'small-1', target: 'ds-1', level: 4, curveness: 0.08 },
    { source: 'small-1', target: 'ds-2', level: 4, curveness: 0.06 },
    { source: 'small-2', target: 'ds-3', level: 4, curveness: 0.06 },
    { source: 'small-2', target: 'ds-4', level: 4, curveness: 0.04 },
    { source: 'small-3', target: 'ds-5', level: 4, curveness: 0.04 },
    { source: 'small-3', target: 'ds-6', level: 4, curveness: 0.02 },
    { source: 'small-4', target: 'ds-7', level: 4, curveness: 0.02 },
    { source: 'small-4', target: 'ds-8', level: 4, curveness: 0 },
    { source: 'small-5', target: 'ds-9', level: 4, curveness: 0 },
    { source: 'small-5', target: 'ds-10', level: 4, curveness: -0.02 },
    { source: 'small-6', target: 'ds-11', level: 4, curveness: -0.04 },
    { source: 'small-6', target: 'ds-12', level: 4, curveness: -0.06 },
  ];

  const STEP_HINT = {
    1: '대분류까지 표시',
    2: '중분류까지 표시',
    3: '소분류까지 표시',
    4: '데이터셋까지 표시',
  };

  const remapClone = (root) => {
    root.querySelectorAll('[id]').forEach((node) => {
      node.id = `exp-${node.id}`;
    });
    root.querySelectorAll('[for]').forEach((node) => {
      const value = node.getAttribute('for');
      if (value) node.setAttribute('for', `exp-${value}`);
    });
    root.querySelectorAll('[aria-describedby]').forEach((node) => {
      const value = node.getAttribute('aria-describedby');
      if (value) node.setAttribute('aria-describedby', `exp-${value}`);
    });
    root.querySelectorAll('[aria-controls]').forEach((node) => {
      const value = node.getAttribute('aria-controls');
      if (value) node.setAttribute('aria-controls', `exp-${value}`);
    });
    return root;
  };

  const sideSrc = relationPanel?.querySelector('.vt-relation__side');
  const detailSrc = relationPanel?.querySelector('[data-vt-rel-detail]');
  if (sideSrc && !layout.querySelector('.vt-relation__side')) {
    const side = remapClone(sideSrc.cloneNode(true));
    side.setAttribute('aria-label', '확장맵 필터');
    layout.insertBefore(side, wrap);
  }
  if (detailSrc && !layout.querySelector('[data-vt-exp-detail]')) {
    const detailClone = remapClone(detailSrc.cloneNode(true));
    detailClone.hidden = true;
    detailClone.setAttribute('data-vt-exp-detail', '');
    layout.appendChild(detailClone);
  }

  const detail = layout.querySelector('[data-vt-exp-detail]');
  const popover = wrap.querySelector('[data-vt-expand-popover]');
  const popoverList = popover?.querySelector('.vt-expand__popover-list');
  const stepInput = layout.querySelector('[data-vt-rel-step]');
  const stepHint = layout.querySelector('[data-vt-rel-step-hint]');
  const sliderEl = layout.querySelector('[data-vt-rel-slider]');
  const catTree = layout.querySelector('[data-vt-rel-tree]');
  const closeBtn = layout.querySelector('[data-vt-rel-close]');
  const detailResize = layout.querySelector('[data-vt-rel-detail-resize]');

  let measureCtx;
  const measureLabel = (text, fontSize, fontWeight = 600) => {
    if (!measureCtx) {
      measureCtx = document.createElement('canvas').getContext('2d');
    }
    if (!measureCtx) return 48;
    measureCtx.font = `${fontWeight} ${fontSize}px ${FONT}`;
    return Math.ceil(measureCtx.measureText(text || '').width);
  };

  const chart = echarts.init(el);
  let zoom = 1;
  let step = 4;
  let showDatasets = true;
  let selectedDs = null;
  let selectedSmall = null;
  let activeCat = 'water';
  let detailWidth = 360;
  const DETAIL_MIN = 280;
  const DETAIL_MAX = 560;

  const nodeShown = (n, maxLevel) => n.level <= maxLevel;
  const maxLevelNow = () => (showDatasets ? step : Math.min(step, 3));

  const hiddenNodeShell = (n) => ({
    id: n.id,
    name: n.name,
    category: n.category,
    level: n.level,
    x: n.x,
    y: n.y,
    symbolSize: 0,
    draggable: false,
    label: { show: false },
    itemStyle: { opacity: 0, borderWidth: 0 },
    emphasis: { disabled: true },
  });

  const rightLabel = (name, fontSize, color = COLORS.label, weight = 600) => ({
    show: true,
    position: 'right',
    distance: LABEL_GAP,
    formatter: name,
    color,
    fontFamily: FONT,
    fontSize,
    fontWeight: weight,
  });

  const mapNode = (n, maxLevel) => {
    if (!nodeShown(n, maxLevel)) return hiddenNodeShell(n);

    const isMajor = n.category === 0;
    const isMid = n.category === 1;
    const isSmall = n.category === 2;
    const isDs = n.category === 3;
    const dsActive = isDs && n.id === selectedDs;
    const smallActive = isSmall && n.id === selectedSmall;

    if (isMajor) {
      return {
        id: n.id,
        name: n.name,
        category: n.category,
        level: n.level,
        x: n.x,
        y: n.y,
        symbol: HEXAGON,
        symbolSize: MAJOR_SIZE,
        symbolKeepAspect: true,
        draggable: true,
        cursor: 'grab',
        label: rightLabel(n.name, 20),
        itemStyle: { color: COLORS.major, borderWidth: 0 },
        emphasis: { scale: false },
      };
    }

    if (isMid) {
      return {
        id: n.id,
        name: n.name,
        category: n.category,
        level: n.level,
        x: n.x,
        y: n.y,
        symbol: DIAMOND,
        symbolSize: MID_SIZE,
        symbolKeepAspect: true,
        draggable: true,
        cursor: 'grab',
        label: rightLabel('중분류', 20),
        itemStyle: { color: COLORS.mid, borderWidth: 0 },
        emphasis: { scale: false },
      };
    }

    if (isSmall) {
      return {
        id: n.id,
        name: n.name,
        category: n.category,
        level: n.level,
        x: n.x,
        y: n.y,
        symbol: TRIANGLE,
        symbolSize: SMALL_SIZE,
        symbolKeepAspect: true,
        draggable: true,
        cursor: 'grab',
        label: rightLabel('소분류', 20, smallActive ? COLORS.small : '#475263'),
        itemStyle: {
          color: '#475263',
          borderWidth: 0,
          opacity: smallActive ? 1 : 0.92,
        },
        emphasis: { scale: false },
      };
    }

    return {
      id: n.id,
      name: n.name,
      category: n.category,
      level: n.level,
      x: n.x,
      y: n.y,
      symbol: dsActive ? SYM.dsActive : SYM.ds,
      symbolSize: DS_SIZE,
      symbolKeepAspect: true,
      draggable: true,
      cursor: 'grab',
      label: rightLabel('데이터셋', 16, COLORS.dsText, 400),
      itemStyle: { opacity: 1, borderWidth: 0 },
      emphasis: { scale: false },
    };
  };

  const linkShown = (l, maxLevel) => {
    if (l.level > maxLevel) return false;
    const src = ALL_NODES.find((node) => node.id === l.source);
    const tgt = ALL_NODES.find((node) => node.id === l.target);
    return Boolean(src && tgt && nodeShown(src, maxLevel) && nodeShown(tgt, maxLevel));
  };

  const mapLink = (l, maxLevel) => {
    const visible = linkShown(l, maxLevel);
    return {
      source: l.source,
      target: l.target,
      lineStyle: {
        color: COLORS.line,
        width: 1.5,
        curveness: l.curveness ?? 0,
        opacity: visible ? 1 : 0,
      },
      emphasis: visible ? undefined : { disabled: true },
    };
  };

  const buildOption = () => {
    const maxLevel = maxLevelNow();
    return {
      animation: false,
      animationDurationUpdate: ANIM_MS,
      animationEasingUpdate: 'cubicInOut',
      tooltip: { show: false },
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: true,
          draggable: true,
          cursor: 'grab',
          zoom,
          symbolKeepAspect: true,
          scaleLimit: { min: 0.5, max: 2 },
          categories: [{ name: '대분류' }, { name: '중분류' }, { name: '소분류' }, { name: '데이터셋' }],
          edgeSymbol: ['none', 'none'],
          emphasis: { focus: 'none', scale: false },
          animationDurationUpdate: ANIM_MS,
          animationEasingUpdate: 'cubicInOut',
          animationDelayUpdate: (idx, params) => {
            const lv = params?.data?.level;
            return typeof lv === 'number' ? Math.max(0, lv - 1) * 45 : 0;
          },
          data: ALL_NODES.map((n) => mapNode(n, maxLevel)),
          links: ALL_LINKS.map((l) => mapLink(l, maxLevel)),
        },
      ],
    };
  };

  let optionInitialized = false;
  const render = ({ reset = false } = {}) => {
    chart.setOption(buildOption(), { notMerge: reset || !optionInitialized, lazyUpdate: false });
    optionInitialized = !reset && true;
    requestAnimationFrame(syncOverlays);
  };

  const toPixel = (x, y) => {
    try {
      const converted = chart.convertToPixel({ seriesIndex: 0 }, [x, y]);
      if (Array.isArray(converted)) return converted;
    } catch {
      /* empty */
    }
    return [x, y];
  };

  const getGraphNodePixel = (nodeId, dataX, dataY) => {
    let gx = dataX;
    let gy = dataY;
    try {
      const live = chart.getOption()?.series?.[0]?.data?.find((d) => d?.id === nodeId);
      if (live && typeof live.x === 'number' && typeof live.y === 'number') {
        gx = live.x;
        gy = live.y;
      }
      const series = chart.getModel()?.getSeriesByIndex(0);
      const graphData = series?.getData();
      if (graphData) {
        let dataIndex = -1;
        graphData.each((idx) => {
          if (graphData.getId(idx) === nodeId) dataIndex = idx;
        });
        if (dataIndex >= 0) {
          const layoutPos = graphData.getItemLayout(dataIndex);
          if (layoutPos && Number.isFinite(layoutPos[0]) && Number.isFinite(layoutPos[1])) {
            gx = layoutPos[0];
            gy = layoutPos[1];
          }
        }
      }
    } catch {
      /* empty */
    }
    return toPixel(gx, gy);
  };

  const syncOverlays = () => {
    placeComposePopover();
  };

  const hidePopover = () => {
    if (!popover) return;
    popover.hidden = true;
    popover.setAttribute('hidden', '');
    popover.style.left = '';
    popover.style.top = '';
    wrap.classList.remove('is-compose-popover-open');
  };

  const placeComposePopover = () => {
    if (!popover || !wrap) return;
    if (maxLevelNow() < 4 || !selectedDs) {
      hidePopover();
      return;
    }

    const items = THEMES[activeCat]?.compose || COMPOSE_WATER;
    if (popoverList) {
      popoverList.innerHTML = items.map((text) => `<li>• ${text}</li>`).join('');
    }

    const dsNode = ALL_NODES.find((n) => n.id === selectedDs);
    if (!dsNode) {
      hidePopover();
      return;
    }

    const [cx, cy] = getGraphNodePixel(dsNode.id, dsNode.x, dsNode.y);
    const originX = el.offsetLeft;
    const originY = el.offsetTop;
    const labelW = measureLabel('데이터셋', 16, 400);
    const anchorRight = originX + cx + DS_SIZE / 2 + LABEL_GAP + labelW;

    popover.hidden = false;
    popover.removeAttribute('hidden');
    wrap.classList.add('is-compose-popover-open');
    popover.style.visibility = 'hidden';
    popover.style.left = '0';
    popover.style.top = '0';
    const popW = popover.offsetWidth;
    const popH = popover.offsetHeight;
    popover.style.visibility = '';

    const pad = 8;
    const maxW = wrap.clientWidth;
    const maxH = wrap.clientHeight;

    let left = anchorRight + POPOVER_GAP;
    if (left + popW > maxW - pad) {
      left = originX + cx - DS_SIZE / 2 - POPOVER_GAP - popW;
    }
    left = Math.max(pad, Math.min(left, maxW - popW - pad));

    let top = originY + cy - popH / 2;
    top = Math.max(pad, Math.min(top, maxH - popH - pad));

    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
    popover.style.transform = 'none';
    popover.style.zIndex = '5';
  };

  const dismissComposePopover = () => {
    if (!selectedDs && popover?.hidden !== false) return;
    selectedDs = null;
    hidePopover();
    setDetailOpen(false);
    render();
  };

  const selectDataset = (dsId) => {
    if (!dsId || maxLevelNow() < 4) return;
    if (selectedDs === dsId && popover && !popover.hidden) {
      dismissComposePopover();
      return;
    }
    selectedSmall = null;
    selectedDs = dsId;
    setDetailOpen(true);
    render();
    requestAnimationFrame(() => {
      placeComposePopover();
      if (chartPointerDown) startPopoverFollow();
    });
  };

  const selectSmall = (smallId) => {
    if (!smallId || maxLevelNow() < 4) return;
    selectedSmall = selectedSmall === smallId ? null : smallId;
    render();
  };

  const setDetailOpen = (open) => {
    if (!detail) return;
    detail.hidden = !open;
    layout.classList.toggle('is-detail-closed', !open);
    requestAnimationFrame(() => {
      chart.resize();
      syncOverlays();
    });
  };

  const applyDetailWidth = (px) => {
    detailWidth = Math.min(DETAIL_MAX, Math.max(DETAIL_MIN, Math.round(px)));
    layout.style.setProperty('--vt-detail-w', `${detailWidth / 10}rem`);
  };

  const updateRangeFill = () => {
    const input = stepInput || sliderEl?.querySelector('.vt-relation__range');
    if (!input) return;
    const min = Number(input.min) || 1;
    const max = Number(input.max) || 4;
    const val = Number(input.value) || 4;
    step = val;
    const t = (val - min) / (max - min);
    sliderEl?.style.setProperty('--vt-range-t', String(t));
    showDatasets = val >= 4;
    if (stepHint) stepHint.textContent = STEP_HINT[val] || STEP_HINT[4];
    if (val < 4 && selectedDs) {
      selectedDs = null;
      hidePopover();
      setDetailOpen(false);
    }
    window.syncVtCatTreeFromStep?.(catTree, val, activeCat);
  };

  let chartPointerDown = false;
  let popoverFollowRaf = 0;

  const tickPopoverFollow = () => {
    if (!chartPointerDown || !selectedDs || popover?.hidden) {
      popoverFollowRaf = 0;
      return;
    }
    placeComposePopover();
    popoverFollowRaf = requestAnimationFrame(tickPopoverFollow);
  };

  const startPopoverFollow = () => {
    if (popoverFollowRaf || !selectedDs || popover?.hidden) return;
    popoverFollowRaf = requestAnimationFrame(tickPopoverFollow);
  };

  const stopPopoverFollow = () => {
    if (popoverFollowRaf) {
      cancelAnimationFrame(popoverFollowRaf);
      popoverFollowRaf = 0;
    }
  };

  $(el).on('pointerdown', () => {
    chartPointerDown = true;
    startPopoverFollow();
  });
  $(window).on('pointerup', () => {
    chartPointerDown = false;
    stopPopoverFollow();
    if (selectedDs && popover && !popover.hidden) placeComposePopover();
  });

  chart.on('click', (params) => {
    if (params.dataType === 'node') {
      const data = params.data;
      if (data?.category === 3 && data.id) {
        selectDataset(data.id);
        return;
      }
      if (data?.category === 2 && data.id) {
        selectSmall(data.id);
        dismissComposePopover();
        return;
      }
      dismissComposePopover();
      return;
    }
    dismissComposePopover();
  });

  $(el).on('click', (event) => {
    event.stopPropagation();
  });

  chart.on('mouseup', () => {
    if (selectedDs && popover && !popover.hidden) placeComposePopover();
  });

  chart.getZr().on('mousemove', () => {
    if (!selectedDs || popover?.hidden) return;
    placeComposePopover();
  });

  chart.on('rendered', () => {
    if (selectedDs && popover && !popover.hidden) placeComposePopover();
  });

  chart.on('graphRoam', () => {
    const opt = chart.getOption();
    const seriesZoom = opt?.series?.[0]?.zoom;
    if (typeof seriesZoom === 'number') zoom = seriesZoom;
    syncOverlays();
  });

  $($wrap).on('click', (event) => {
    if ($(event.target).closest('[data-vt-expand-popover]').length) return;
    if ($(event.target).closest('[data-vt-expand-chart]').length) return;
    if (!$(event.target).closest('[data-vt-expand-wrap]').length) return;
    dismissComposePopover();
  });

  $expandPanel.find('[data-vt-expand-zoom-in]').on('click', () => {
    zoom = Math.min(2, +(zoom + 0.2).toFixed(2));
    chart.setOption({ series: [{ zoom }] });
    window.requestAnimationFrame(syncOverlays);
  });

  $expandPanel.find('[data-vt-expand-zoom-out]').on('click', () => {
    zoom = Math.max(0.5, +(zoom - 0.2).toFixed(2));
    chart.setOption({ series: [{ zoom }] });
    window.requestAnimationFrame(syncOverlays);
  });

  $expandPanel.find('[data-vt-expand-fit]').on('click', () => {
    zoom = 1;
    render({ reset: false });
  });

  $(closeBtn).on('click', () => setDetailOpen(false));

  $(stepInput).on('input', () => {
    updateRangeFill();
    render();
  });

  $(detailResize).on('pointerdown', (event) => {
    if (!detail || detail.hidden) return;
    event.preventDefault();
    const startClientX = event.clientX;
    const startW = detailWidth;
    $layout.addClass('is-detail-resizing');
    detailResize.setPointerCapture?.(event.pointerId);
    const onMove = (e) => {
      applyDetailWidth(startW + (startClientX - e.clientX));
      chart.resize();
      syncOverlays();
    };
    const onUp = () => {
      $layout.removeClass('is-detail-resizing');
      $(window).off('pointermove', onMove);
      $(window).off('pointerup', onUp);
      window.requestAnimationFrame(() => {
        chart.resize();
        syncOverlays();
      });
    };
    $(window).on('pointermove', onMove);
    $(window).on('pointerup', onUp);
  });

  $layout.find('.vt-relation__chip').on('click', function () {
    $layout.find('.vt-relation__chip').removeClass('is-active');
    $(this).addClass('is-active');
  });

  const syncCatTree = () => {
    if (!catTree) return;
    const items = [...catTree.querySelectorAll('.vt-relation__tree-item')];
    const collapsed = [];
    items.forEach((item) => {
      const depth = Number(item.getAttribute('data-depth')) || 1;
      while (collapsed.length && collapsed[collapsed.length - 1] >= depth) collapsed.pop();
      item.hidden = collapsed.length > 0;
      const chevron = item.querySelector('.vt-relation__chevron');
      if (!item.hidden && chevron?.getAttribute('aria-expanded') === 'false') collapsed.push(depth);
    });
  };

  const applyTheme = (id) => {
    const theme = THEMES[id];
    if (!theme) return;
    activeCat = id;
    COLORS.major = theme.major;
    COLORS.mid = theme.mid;
    COLORS.small = theme.small;
    COLORS.dsActive = theme.dsActive;
    const major = ALL_NODES.find((n) => n.id === 'major');
    if (major) major.name = theme.majorName;
    wrap.style.setProperty('--vt-cat-major', theme.major);
    wrap.style.setProperty('--vt-cat-mid', theme.mid);
    wrap.style.setProperty('--vt-cat-small', theme.small);
    wrap.style.setProperty('--vt-cat-ds-active', theme.dsActive);
    catTree?.querySelectorAll('.vt-relation__tree-item[data-depth="1"]').forEach((item) => {
      const isActive = item.getAttribute('data-vt-cat') === id;
      const input = item.querySelector('input[type="checkbox"]');
      const chevron = item.querySelector('.vt-relation__chevron');
      if (input) input.checked = isActive;
      if (chevron) {
        chevron.setAttribute('aria-expanded', String(isActive));
        chevron.setAttribute('aria-label', isActive ? '접기' : '펼치기');
      }
    });
    syncCatTree();
    window.syncVtCatTreeFromStep?.(catTree, stepInput?.value ?? step, activeCat);
    render();
  };

  $(catTree).on('click', (event) => {
    const $chevron = $(event.target).closest('.vt-relation__chevron');
    if (!$chevron.length) return;
    event.preventDefault();
    const $item = $chevron.closest('.vt-relation__tree-item');
    const expanded = $chevron.attr('aria-expanded') !== 'false';
    if ($item.attr('data-depth') === '1' && expanded === false) {
      applyTheme($item.attr('data-vt-cat'));
      return;
    }
    $chevron.attr('aria-expanded', String(!expanded));
    $chevron.attr('aria-label', expanded ? '펼치기' : '접기');
    syncCatTree();
  });

  $(catTree).on('change', 'input[type="checkbox"]', function (event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox') return;
    const $item = $(input).closest('.vt-relation__tree-item');
    if ($item.attr('data-depth') !== '1') return;
    const cat = $item.attr('data-vt-cat');
    if (!input.checked) {
      input.checked = true;
      return;
    }
    applyTheme(cat);
  });

  updateRangeFill();
  syncCatTree();
  applyTheme(activeCat);
  setDetailOpen(false);
  hidePopover();
  render({ reset: true });

  const resize = () => {
    if (!el.offsetParent && el.getClientRects().length === 0) return;
    chart.resize();
    requestAnimationFrame(syncOverlays);
  };

  $(window).on('resize', resize);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(wrap);
  }

  const $expandBtn = $expandPanel.find('[data-vt-expand-expand]');
  const $fsExitBtn = $('[data-vt-fullscreen-exit]');
  const $toolbarLegend = $('.vt-expand__node-legend--toolbar');

  const syncExpandFullscreenUI = (open) => {
    $expandBtn.attr('aria-expanded', String(open));
    $toolbarLegend.prop('hidden', !open);
    $toolbarLegend.attr('aria-hidden', String(!open));
  };

  const setExpandFullscreen = (open, options) => {
    const syncBody = !options || options.syncBody !== false;
    const focus = !options || options.focus !== false;
    if (syncBody) {
      $('body').toggleClass('is-vt-expand-fullscreen', open);
    }
    syncExpandFullscreenUI(open);
    if (syncBody) window.syncVtFullscreenExit?.();
    window.requestAnimationFrame(() => {
      resize();
      if (!focus) return;
      if (open) $fsExitBtn.trigger('focus');
      else $expandBtn.trigger('focus');
    });
  };

  $expandBtn.on('click', () => setExpandFullscreen(true));

  window.VtExpandMap = {
    resize,
    show() {
      window.requestAnimationFrame(() => {
        resize();
        render();
      });
    },
    setFullscreenUI: (open) => syncExpandFullscreenUI(open),
    enterFullscreen: (options) => setExpandFullscreen(true, options),
    exitFullscreen: (options) => setExpandFullscreen(false, options),
  };
});
