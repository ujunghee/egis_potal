/** 국가토지피복 통계 — Chart.js 도넛 차트 */
(() => {
  const canvas = document.querySelector('[data-land-cover-donut]');
  const legendRoot = document.querySelector('[data-land-cover-legend]');
  const subLegend = document.querySelector('[data-land-cover-sub-legend]');
  const subList = document.querySelector('[data-land-cover-sub-list]');
  const subTitle = document.querySelector('[data-land-cover-sub-title]');

  if (!canvas || !legendRoot || typeof Chart === 'undefined') return;

  const categories = [
    {
      key: 'forest',
      label: '산림',
      value: 28.8,
      color: '#38BE78',
      children: [
        { label: '활엽수림', value: 4.9 },
        { label: '침엽수림', value: 21.7 },
        { label: '혼효림', value: 2.2 },
      ],
    },
    {
      key: 'agriculture',
      label: '농업',
      value: 20.6,
      color: '#F8C840',
      children: [
        { label: '경지정리가 된 논', value: 5.2 },
        { label: '경지정리가 안 된 논', value: 3.8 },
        { label: '경지정리가 된 밭', value: 3.4 },
        { label: '경지정리가 안 된 밭', value: 2.9 },
        { label: '시설재배지', value: 1.8 },
        { label: '과수원', value: 2.1 },
        { label: '기타재배지', value: 1.4 },
      ],
    },
    {
      key: 'grassland',
      label: '초지',
      value: 16.6,
      color: '#288755',
      children: [
        { label: '자연초지', value: 7.2 },
        { label: '골프장', value: 2.1 },
        { label: '묘지', value: 1.8 },
        { label: '기타초지', value: 5.5 },
      ],
    },
    {
      key: 'urban',
      label: '시가화-건조',
      value: 7.1,
      color: '#F78A1D',
      children: [
        { label: '단독주거시설', value: 0.8 },
        { label: '공동주거시설', value: 0.9 },
        { label: '공업시설', value: 0.7 },
        { label: '상업업무시설', value: 0.6 },
        { label: '혼합지역', value: 0.5 },
        { label: '문화체육휴양시설', value: 0.3 },
        { label: '공항', value: 0.2 },
        { label: '항만', value: 0.2 },
        { label: '철도', value: 0.3 },
        { label: '도로', value: 1.1 },
        { label: '기타교통통신시설', value: 0.3 },
        { label: '환경기초시설', value: 0.2 },
        { label: '기타공공시설', value: 0.3 },
        { label: '교육행정시설', value: 0.4 },
        { label: '목장양식장', value: 0.3 },
      ],
    },
    {
      key: 'water',
      label: '수역',
      value: 6.9,
      color: '#1A76FF',
      children: [
        { label: '하천', value: 2.8 },
        { label: '호소', value: 1.9 },
        { label: '해양수', value: 2.2 },
      ],
    },
    {
      key: 'wetland',
      label: '습지',
      value: 5.1,
      color: '#0B326B',
      children: [
        { label: '내륙습지', value: 1.8 },
        { label: '갯벌', value: 2.4 },
        { label: '염전', value: 0.9 },
      ],
    },
    {
      key: 'barren',
      label: '나지',
      value: 14.9,
      color: '#9C4CC5',
      children: [
        { label: '해변', value: 1.6 },
        { label: '강기슭', value: 2.4 },
        { label: '암벽바위', value: 3.1 },
        { label: '채광지역', value: 1.9 },
        { label: '운동장', value: 1.2 },
        { label: '기타나지', value: 4.7 },
      ],
    },
  ];

  let chart;
  let activeKey = categories[0].key;

  const hexToRgba = (hex, alpha) => {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getSegmentColors = (key) =>
    categories.map((item) => hexToRgba(item.color, item.key === key ? 1 : 0.2));

  const renderLegend = () => {
    legendRoot.innerHTML = categories
      .map(
        (item) => `
          <li class="land-cover__legend-item${item.key === activeKey ? ' is-active' : ''}" data-land-cover-legend-item="${item.key}">
            <span class="land-cover__legend-swatch" style="background-color:${item.color}" aria-hidden="true"></span>
            <span class="land-cover__legend-label body3-r-14 color-slate-700">${item.label}</span>
            <span class="land-cover__legend-value body3-r-14 color-slate-900">${item.value.toFixed(1)}%</span>
            <span class="land-cover__legend-bar" aria-hidden="true">
              <span class="land-cover__legend-bar-fill" style="width:${item.value}%;background-color:${item.color}"></span>
            </span>
          </li>
        `
      )
      .join('');
  };

  const renderSubLegend = (category) => {
    if (!category?.children?.length) {
      subLegend.hidden = true;
      subList.innerHTML = '';
      return;
    }

    subLegend.hidden = false;
    subTitle.textContent = category.label;
    subList.innerHTML = category.children
      .map(
        (child) => `
          <li class="land-cover__sub-item color-slate-700">
            <span class="land-cover__sub-swatch" style="background-color:${category.color}" aria-hidden="true"></span>
            <span class="land-cover__sub-text">
              <span class="land-cover__sub-label">${child.label}</span>
              <span class="land-cover__sub-value">${child.value.toFixed(1)}%</span>
            </span>
          </li>
        `
      )
      .join('');
  };

  const updateChartColors = (key) => {
    if (!chart) return;
    chart.data.datasets[0].backgroundColor = getSegmentColors(key);
    chart.update();
  };

  const setActiveCategory = (key) => {
    if (!key) return;

    activeKey = key;

    legendRoot.querySelectorAll('[data-land-cover-legend-item]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.landCoverLegendItem === key);
    });

    const category = categories.find((item) => item.key === key);
    renderSubLegend(category);
    updateChartColors(key);
  };

  chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: categories.map((item) => item.label),
      datasets: [
        {
          data: categories.map((item) => item.value),
          backgroundColor: getSegmentColors(activeKey),
          borderWidth: 2,
          borderColor: '#fff',
          spacing: 1,
          hoverOffset: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '52%',
      layout: {
        padding: 0,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1e23',
          titleFont: { size: 14, weight: '500' },
          bodyFont: { size: 14 },
          padding: 12,
          displayColors: true,
          callbacks: {
            label(context) {
              return ` ${context.label}: ${context.parsed}%`;
            },
          },
        },
      },
      onHover(_event, elements) {
        if (!elements.length) return;
        setActiveCategory(categories[elements[0].index].key);
      },
      onClick(_event, elements) {
        if (!elements.length) return;
        setActiveCategory(categories[elements[0].index].key);
      },
    },
  });

  renderLegend();
  renderSubLegend(categories[0]);

  legendRoot.addEventListener('mouseover', (event) => {
    const item = event.target.closest('[data-land-cover-legend-item]');
    if (!item) return;
    setActiveCategory(item.dataset.landCoverLegendItem);
  });

  legendRoot.addEventListener('click', (event) => {
    const item = event.target.closest('[data-land-cover-legend-item]');
    if (!item) return;
    setActiveCategory(item.dataset.landCoverLegendItem);
  });
})();
