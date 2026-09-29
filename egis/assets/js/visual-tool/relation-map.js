/** 환경 시각화 도구 — 관계도맵 (jQuery + ECharts) */
jQuery(function ($) {
  const $el = $('[data-vt-relation]');
  if (!$el.length || typeof echarts === 'undefined') return;
  const el = $el[0];

  const FONT = "'Pretendard GOV', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  const DIAMOND =
    'path://M48.5043 4.76344L4.76343 48.5044C-1.58781 54.8556 -1.58781 65.1486 4.76343 71.4956L48.5043 115.237C54.8556 121.588 65.1485 121.588 71.4956 115.237L115.237 71.4956C121.588 65.1444 121.588 54.8514 115.237 48.5044L71.4956 4.76344C65.1443 -1.58781 54.8514 -1.58781 48.5043 4.76344Z';
  const HEXAGON =
    'path://M92.5005 0H47.4995C38.5681 0 30.3155 4.741 25.8498 12.4323L3.34926 51.2017C-1.11642 58.8978 -1.11642 68.3749 3.34926 76.0711L25.8498 114.84C30.3155 122.537 38.5681 127.273 47.4995 127.273H92.5005C101.432 127.273 109.685 122.532 114.15 114.84L136.651 76.0711C141.116 68.3749 141.116 58.8978 136.651 51.2017L114.15 12.4323C109.685 4.73611 101.432 0 92.5005 0Z';
  const MAJOR_SIZE = [140, 127];
  const DS_CHIP_H = 34;
  const DS_PAD_X = 20;
  const ANIM_MS = 520;
  const POPOVER_GAP = 12;
  const DASH_CURVE = { 'ds-1': 0.22, 'ds-2': 0.1, 'ds-3': -0.1, 'ds-4': -0.22 };

  let measureCtx;
  const measureDsChipSize = (text) => {
    if (!measureCtx) {
      const canvas = document.createElement('canvas');
      measureCtx = canvas.getContext('2d');
    }
    if (measureCtx) {
      measureCtx.font = `500 13px ${FONT}`;
      const textW = measureCtx.measureText(text || '').width;
      return [Math.max(Math.ceil(textW + DS_PAD_X), 72), DS_CHIP_H];
    }
    return [108, DS_CHIP_H];
  };

  const COLORS = {
    major: '#186be8',
    mid: '#1254b5',
    small: '#0e418c',
    line: '#b8bfca',
    dash: '#97a2b1',
    dsFill: '#ffffff',
    dsBorder: '#b8bfca',
    dsActive: '#0e418c',
    dsText: '#1a1e23',
  };

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
      mid: '#1254B5',
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

  const ALL_NODES = [
    { id: 'major', name: '물관리', category: 0, x: 426, y: 465, symbolSize: MAJOR_SIZE, symbol: HEXAGON, level: 1 },
    { id: 'mid-1', name: '중분류', category: 1, x: 130, y: 465, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'mid-2', name: '중분류', category: 1, x: 302, y: 253, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'mid-3', name: '중분류', category: 1, x: 544, y: 253, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'mid-4', name: '중분류', category: 1, x: 302, y: 696, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'mid-5', name: '중분류', category: 1, x: 544, y: 696, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'mid-6', name: '중분류', category: 1, x: 717, y: 465, symbolSize: 120, symbol: DIAMOND, level: 2 },
    { id: 'small-1', name: '소분류', category: 2, x: 783, y: 213, symbolSize: 100, symbol: 'circle', level: 3, compose: COMPOSE_WATER },
    { id: 'small-2', name: '소분류', category: 2, x: 893, y: 329, symbolSize: 100, symbol: 'circle', level: 3, compose: COMPOSE_WATER },
    { id: 'small-3', name: '소분류', category: 2, x: 942, y: 507, symbolSize: 100, symbol: 'circle', level: 3, compose: COMPOSE_WATER },
    { id: 'small-4', name: '소분류', category: 2, x: 795, y: 664, symbolSize: 100, symbol: 'circle', level: 3, compose: COMPOSE_WATER },
    { id: 'ds-1', name: '데이터셋명', category: 3, x: 968, y: 168, level: 4 },
    { id: 'ds-2', name: '데이터셋명', category: 3, x: 1004, y: 238, level: 4 },
    { id: 'ds-3', name: '데이터셋명', category: 3, x: 1040, y: 308, level: 4 },
    { id: 'ds-4', name: '데이터셋명', category: 3, x: 1076, y: 378, level: 4 },
  ];

  const ALL_LINKS = [
    { source: 'major', target: 'mid-1', level: 2 },
    { source: 'major', target: 'mid-2', level: 2 },
    { source: 'major', target: 'mid-3', level: 2 },
    { source: 'major', target: 'mid-4', level: 2 },
    { source: 'major', target: 'mid-5', level: 2 },
    { source: 'major', target: 'mid-6', level: 2 },
    { source: 'mid-6', target: 'small-1', level: 3 },
    { source: 'mid-6', target: 'small-2', level: 3 },
    { source: 'mid-6', target: 'small-3', level: 3 },
    { source: 'mid-6', target: 'small-4', level: 3 },
    { source: 'small-2', target: 'ds-1', level: 4, dashed: true },
    { source: 'small-2', target: 'ds-2', level: 4, dashed: true },
    { source: 'small-2', target: 'ds-3', level: 4, dashed: true },
    { source: 'small-2', target: 'ds-4', level: 4, dashed: true },
  ];

  const STEP_HINT = {
    1: '대분류까지 표시',
    2: '중분류까지 표시',
    3: '소분류까지 표시',
    4: '데이터셋까지 표시',
  };

  const chart = echarts.init(el);
  let zoom = 1;
  let step = 4;
  let showDatasets = true;
  let selectedDs = null;
  let activeCat = 'water';

  const nodeColor = (category) => {
    if (category === 0) return COLORS.major;
    if (category === 1) return COLORS.mid;
    if (category === 2) return COLORS.small;
    return COLORS.dsFill;
  };

  const nodeShown = (n, maxLevel) => n.level <= maxLevel;

  const hiddenNodeShell = (n) => ({
    id: n.id,
    name: n.name,
    category: n.category,
    level: n.level,
    x: n.x,
    y: n.y,
    symbol: n.symbol,
    symbolSize: 0,
    draggable: false,
    cursor: 'default',
    label: { show: false },
    itemStyle: { opacity: 0, borderWidth: 0 },
    emphasis: { disabled: true },
  });

  const mapNode = (n, maxLevel) => {
    if (!nodeShown(n, maxLevel)) return hiddenNodeShell(n);

    const isDs = n.category === 3;
    const isMajor = n.category === 0;
    const dsActive = isDs && n.id === selectedDs;

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
        draggable: true,
        cursor: 'grab',
        label: {
          show: true,
          position: 'inside',
          formatter: n.name,
          color: '#fff',
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 600,
        },
        itemStyle: { color: COLORS.major, borderWidth: 0 },
      };
    }

    if (isDs) {
      const chipSize = measureDsChipSize(n.name);
      return {
        id: n.id,
        name: n.name,
        category: n.category,
        level: n.level,
        x: n.x,
        y: n.y,
        symbol: 'rect',
        symbolSize: chipSize,
        draggable: true,
        cursor: 'grab',
        label: {
          show: true,
          position: 'inside',
          formatter: n.name,
          color: dsActive ? COLORS.dsActive : COLORS.dsText,
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 22,
        },
        itemStyle: {
          color: '#ffffff',
          borderColor: dsActive ? COLORS.dsActive : COLORS.dsBorder,
          borderWidth: 1,
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
      symbol: n.symbol,
      symbolSize: n.symbolSize,
      compose: n.compose,
      draggable: true,
      cursor: 'grab',
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontFamily: FONT,
        fontSize: 14,
        fontWeight: 600,
      },
      itemStyle: { color: nodeColor(n.category), borderWidth: 0 },
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
    const dashed = Boolean(l.dashed);
    const curve = dashed && l.target ? DASH_CURVE[l.target] ?? 0.12 : 0;
    const base = dashed
      ? { type: [6, 5], color: COLORS.dash, width: 1, curveness: curve }
      : { type: 'solid', color: COLORS.line, width: 1.5, curveness: 0 };
    return {
      source: l.source,
      target: l.target,
      lineStyle: { ...base, opacity: visible ? 1 : 0 },
      emphasis: visible ? undefined : { disabled: true },
    };
  };

  const buildOption = () => {
    const maxLevel = showDatasets ? step : Math.min(step, 3);
    const nodes = ALL_NODES.map((n) => mapNode(n, maxLevel));
    const links = ALL_LINKS.map((l) => mapLink(l, maxLevel));

    return {
      animation: false,
      animationDurationUpdate: ANIM_MS,
      animationEasingUpdate: 'cubicInOut',
      backgroundColor: 'transparent',
      tooltip: { show: false },
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: true,
          draggable: true,
          cursor: 'grab',
          zoom,
          symbolKeepAspect: false,
          scaleLimit: { min: 0.5, max: 2 },
          categories: [
            { name: '대분류' },
            { name: '중분류' },
            { name: '소분류' },
            { name: '데이터셋' },
          ],
          label: { show: true },
          lineStyle: { color: COLORS.line, width: 1.5, curveness: 0 },
          edgeSymbol: ['none', 'none'],
          edgeSymbolSize: 0,
          emphasis: { focus: 'none', scale: false },
          animationDurationUpdate: ANIM_MS,
          animationEasingUpdate: 'cubicInOut',
          animationDelayUpdate: (idx) => {
            const lv = nodes[idx]?.level;
            return typeof lv === 'number' ? Math.max(0, lv - 1) * 55 : 0;
          },
          data: nodes,
          links,
        },
      ],
    };
  };

  let optionInitialized = false;

  const render = ({ reset = false } = {}) => {
    const notMerge = reset || !optionInitialized;
    chart.setOption(buildOption(), { notMerge, lazyUpdate: false });
    optionInitialized = !reset && true;
    requestAnimationFrame(syncOverlays);
  };

  const $layout = $('.vt-relation__layout');
  const $detail = $('[data-vt-rel-detail]');
  const $popover = $('[data-vt-rel-popover]');
  const $popoverList = $popover.find('.vt-relation__popover-list');
  const $closeBtn = $('[data-vt-rel-close]');
  const $stepInput = $('[data-vt-rel-step]');
  const $stepHint = $('[data-vt-rel-step-hint]');
  const $sliderEl = $('[data-vt-rel-slider]');
  const $canvasWrap = $('[data-vt-rel-canvas-wrap]');
  const layout = $layout[0];
  const detail = $detail[0];
  const popover = $popover[0];
  const popoverList = $popoverList[0];
  const closeBtn = $closeBtn[0];
  const stepInput = $stepInput[0];
  const stepHint = $stepHint[0];
  const sliderEl = $sliderEl[0];
  const canvasWrap = $canvasWrap[0];

  const maxLevelNow = () => (showDatasets ? step : Math.min(step, 3));

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
          const layout = graphData.getItemLayout(dataIndex);
          if (layout && Number.isFinite(layout[0]) && Number.isFinite(layout[1])) {
            gx = layout[0];
            gy = layout[1];
          }
        }
      }
    } catch {
      /* empty */
    }
    return toPixel(gx, gy);
  };

  const syncGraphPositionsFromChart = () => {
    const data = chart.getOption()?.series?.[0]?.data;
    if (!Array.isArray(data)) return;
    let changed = false;
    data.forEach((d) => {
      if (!d?.id || typeof d.x !== 'number' || typeof d.y !== 'number') return;
      const n = ALL_NODES.find((node) => node.id === d.id);
      if (!n || (n.x === d.x && n.y === d.y)) return;
      n.x = d.x;
      n.y = d.y;
      changed = true;
    });
    if (changed && selectedDs) placeComposePopover();
  };

  const dismissComposePopover = () => {
    if (!selectedDs && popover?.hidden !== false) return;
    selectedDs = null;
    if (popover) popover.hidden = true;
    setDetailOpen(false);
    render();
  };

  const syncOverlays = () => {
    placeComposePopover();
  };

  const placeComposePopover = () => {
    if (!popover || !canvasWrap) return;
    if (maxLevelNow() < 4 || !selectedDs) {
      popover.hidden = true;
      return;
    }

    const items = THEMES[activeCat]?.compose || COMPOSE_WATER;
    if (popoverList) {
      popoverList.innerHTML = items.map((text) => `<li>• ${text}</li>`).join('');
    }

    const dsNode = ALL_NODES.find((n) => n.id === selectedDs);
    if (!dsNode) {
      popover.hidden = true;
      return;
    }

    const [cx, cy] = getGraphNodePixel(dsNode.id, dsNode.x, dsNode.y);
    const [chipW, chipH] = measureDsChipSize(dsNode.name);
    const originX = el.offsetLeft;
    const originY = el.offsetTop;

    const chipRight = originX + cx + chipW / 2;
    const chipTop = originY + cy - chipH / 2;

    popover.hidden = false;
    popover.style.visibility = 'hidden';
    popover.style.left = '0';
    popover.style.top = '0';
    const popW = popover.offsetWidth;
    const popH = popover.offsetHeight;
    popover.style.visibility = '';

    const pad = 8;
    const maxW = canvasWrap.clientWidth;
    const maxH = canvasWrap.clientHeight;

    let left = chipRight + POPOVER_GAP;
    if (left + popW > maxW - pad) {
      left = originX + cx - chipW / 2 - POPOVER_GAP - popW;
    }
    left = Math.max(pad, Math.min(left, maxW - popW - pad));

    let top = chipTop + (chipH - popH) / 2;
    top = Math.max(pad, Math.min(top, maxH - popH - pad));

    popover.style.left = `${Math.round(left)}px`;
    popover.style.top = `${Math.round(top)}px`;
    popover.style.transform = 'none';
    popover.style.zIndex = '6';
  };

  const selectDataset = (dsId) => {
    if (!dsId) return;
    selectedDs = dsId;
    setDetailOpen(true);
    render();
    requestAnimationFrame(() => {
      placeComposePopover();
      if (chartPointerDown) startPopoverFollow();
    });
  };

  const setDetailOpen = (open) => {
    if (!detail) return;
    detail.hidden = !open;
    layout?.classList.toggle('is-detail-closed', !open);
    requestAnimationFrame(() => {
      chart.resize();
      syncOverlays();
    });
  };

  const DETAIL_MIN = 280;
  const DETAIL_MAX = 560;
  const $detailResize = $('[data-vt-rel-detail-resize]');
  const detailResize = $detailResize[0];
  let detailWidth = 360;

  const applyDetailWidth = (px) => {
    detailWidth = Math.min(DETAIL_MAX, Math.max(DETAIL_MIN, Math.round(px)));
    layout?.style.setProperty('--vt-detail-w', `${detailWidth / 10}rem`);
  };

  detailResize?.addEventListener('pointerdown', (event) => {
    if (!layout || detail?.hidden) return;
    event.preventDefault();
    const startX = event.clientX;
    const startW = detailWidth;
    $layout.addClass('is-detail-resizing');
    detailResize.setPointerCapture?.(event.pointerId);

    const onMove = (e) => {
      applyDetailWidth(startW + (startX - e.clientX));
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

  detailResize?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 16;
    applyDetailWidth(detailWidth + (event.key === 'ArrowLeft' ? step : -step));
    requestAnimationFrame(() => {
      chart.resize();
      syncOverlays();
    });
  });

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
      if (popover) popover.hidden = true;
      setDetailOpen(false);
    }
    window.syncVtCatTreeFromStep?.(catTree, val, activeCat);
  };

  let chartPointerDown = false;
  let popoverFollowRaf = 0;

  const tickPopoverFollow = () => {
    if (!chartPointerDown || !selectedDs || !popover || popover.hidden) {
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
      dismissComposePopover();
      return;
    }
    dismissComposePopover();
  });

  $(el).on('click', (event) => {
    event.stopPropagation();
  });

  chart.on('mouseup', () => {
    syncGraphPositionsFromChart();
    if (selectedDs && popover && !popover.hidden) placeComposePopover();
  });

  chart.getZr().on('mousemove', () => {
    if (!selectedDs || !popover || popover.hidden) return;
    placeComposePopover();
  });

  chart.on('rendered', () => {
    if (selectedDs && popover && !popover.hidden) placeComposePopover();
  });

  $canvasWrap.on('click', (event) => {
    if ($(event.target).closest('[data-vt-rel-popover]').length) return;
    if ($(event.target).closest('[data-vt-relation]').length) return;
    dismissComposePopover();
  });

  $closeBtn.on('click', () => {
    setDetailOpen(false);
  });

  $stepInput.on('input', () => {
    step = Number($stepInput.val()) || 4;
    updateRangeFill();
    render();
  });

  $('[data-vt-rel-zoom-in]').on('click', () => {
    zoom = Math.min(2, +(zoom + 0.2).toFixed(2));
    chart.setOption({ series: [{ zoom }] });
    window.requestAnimationFrame(syncOverlays);
  });

  $('[data-vt-rel-zoom-out]').on('click', () => {
    zoom = Math.max(0.5, +(zoom - 0.2).toFixed(2));
    chart.setOption({ series: [{ zoom }] });
    window.requestAnimationFrame(syncOverlays);
  });

  $('[data-vt-rel-reset]').on('click', () => {
    zoom = 1;
    render({ reset: false });
  });

  $('.vt-relation__chip').on('click', function () {
    $('.vt-relation__chip').removeClass('is-active');
    $(this).addClass('is-active');
  });

  chart.on('graphRoam', () => {
    const opt = chart.getOption();
    const seriesZoom = opt?.series?.[0]?.zoom;
    if (typeof seriesZoom === 'number') zoom = seriesZoom;
    syncOverlays();
  });

  const $catTree = $('[data-vt-rel-tree]');
  const catTree = $catTree[0];
  const syncCatTree = () => {
    if (!catTree) return;
    const items = [...catTree.querySelectorAll('.vt-relation__tree-item')];
    const collapsed = [];
    items.forEach((item) => {
      const depth = Number(item.getAttribute('data-depth')) || 1;
      while (collapsed.length && collapsed[collapsed.length - 1] >= depth) collapsed.pop();
      const hidden = collapsed.length > 0;
      item.hidden = hidden;
      const chevron = item.querySelector('.vt-relation__chevron');
      if (!hidden && chevron?.getAttribute('aria-expanded') === 'false') collapsed.push(depth);
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
    ALL_NODES.forEach((n) => {
      if (n.compose) n.compose = theme.compose;
    });
    canvasWrap?.style.setProperty('--vt-cat-major', theme.major);
    canvasWrap?.style.setProperty('--vt-cat-mid', theme.mid);
    canvasWrap?.style.setProperty('--vt-cat-small', theme.small);
    canvasWrap?.style.setProperty('--vt-cat-ds-active', theme.dsActive);
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

  $catTree.on('click', (event) => {
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

  $catTree.on('change', 'input[type="checkbox"]', function (event) {
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

  setDetailOpen(false);
  updateRangeFill();
  syncCatTree();
  render();

  const resize = () => {
    if (!el.offsetParent && el.getClientRects().length === 0) return;
    chart.resize();
    requestAnimationFrame(syncOverlays);
  };

  $(window).on('resize', resize);
  if (typeof ResizeObserver !== 'undefined' && canvasWrap) {
    new ResizeObserver(resize).observe(canvasWrap);
  }

  const $expandBtn = $('[data-vt-relation-expand]');
  const $fsExitBtn = $('[data-vt-fullscreen-exit]');
  const $toolbarLegend = $('.vt-relation__node-legend--toolbar');

  const syncRelationFullscreenUI = (open) => {
    $expandBtn.attr('aria-expanded', String(open));
    $toolbarLegend.prop('hidden', !open);
    $toolbarLegend.attr('aria-hidden', String(!open));
  };

  const setRelationFullscreen = (open, options) => {
    const syncBody = !options || options.syncBody !== false;
    const focus = !options || options.focus !== false;
    if (syncBody) {
      $('body').toggleClass('is-vt-relation-fullscreen', open);
    }
    syncRelationFullscreenUI(open);
    if (syncBody) window.syncVtFullscreenExit?.();
    window.requestAnimationFrame(() => {
      resize();
      if (!focus) return;
      if (open) $fsExitBtn.trigger('focus');
      else $expandBtn.trigger('focus');
    });
  };

  $expandBtn.on('click', () => setRelationFullscreen(true));

  window.VtRelationMap = {
    resize,
    show() {
      window.requestAnimationFrame(() => {
        resize();
        render();
      });
    },
    setFullscreenUI: (open) => syncRelationFullscreenUI(open),
    enterFullscreen: (options) => setRelationFullscreen(true, options),
    exitFullscreen: (options) => setRelationFullscreen(false, options),
  };
});
