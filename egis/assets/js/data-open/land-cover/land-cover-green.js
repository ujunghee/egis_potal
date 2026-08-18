/** 녹지(녹피)/불투수면 통계 — 이벤트·렌더 */
(() => {
  const panel = document.querySelector('[data-land-cover-panel="green"]');
  const listRoot = panel?.querySelector('[data-land-cover-rank-list]');
  const compareRoot = panel?.querySelector('[data-land-cover-compare-list]');
  const sortSelect = panel?.querySelector('[data-land-cover-rank-sort]');
  const tabsRoot = panel?.querySelector('[data-land-cover-rank-tabs]');
  const searchButton = panel?.querySelector('[data-land-cover-search]');
  const sidoSelect = panel?.querySelector('[data-land-cover-sido]');
  const sigunguSelect = panel?.querySelector('[data-land-cover-sigungu]');

  if (!panel || !listRoot) return;

  const scopeBadges = panel.querySelectorAll('[data-land-cover-scope-badge]');
  const greenRate = panel.querySelector('[data-land-cover-green-rate]');
  const greenDesc = panel.querySelector('[data-land-cover-green-desc]');
  const greenBar = panel.querySelector('[data-land-cover-green-bar]');
  const imperviousRate = panel.querySelector('[data-land-cover-impervious-rate]');
  const imperviousDesc = panel.querySelector('[data-land-cover-impervious-desc]');
  const imperviousBar = panel.querySelector('[data-land-cover-impervious-bar]');

  const nationalScope = {
    label: '전국',
    green: { value: 69.2, desc: '식생이 있는 면적(산림·초지·농업 등)은 69,851.4 km²' },
    impervious: { value: 8.9, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 8,991.4 km²' },
  };

  const regionDetails = {
    '강원특별자치도': {
      label: '강원특별자치도',
      green: { value: 86.1, desc: '식생이 있는 면적(산림·초지·농업 등)은 8,642.3 km²' },
      impervious: { value: 3.5, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 351.2 km²' },
    },
    '경상북도': {
      label: '경상북도',
      green: { value: 76.3, desc: '식생이 있는 면적(산림·초지·농업 등)은 7,612.8 km²' },
      impervious: { value: 5.8, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 578.4 km²' },
    },
    '경상남도': {
      label: '경상남도',
      green: { value: 72.5, desc: '식생이 있는 면적(산림·초지·농업 등)은 4,821.6 km²' },
      impervious: { value: 6.2, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 412.5 km²' },
    },
    '충청북도': {
      label: '충청북도',
      green: { value: 72.4, desc: '식생이 있는 면적(산림·초지·농업 등)은 5,432.1 km²' },
      impervious: { value: 6.9, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 517.8 km²' },
    },
    '대구광역시': {
      label: '대구광역시',
      green: { value: 70.2, desc: '식생이 있는 면적(산림·초지·농업 등)은 612.4 km²' },
      impervious: { value: 14.6, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 127.5 km²' },
    },
    '울산광역시': {
      label: '울산광역시',
      green: { value: 68.9, desc: '식생이 있는 면적(산림·초지·농업 등)은 742.8 km²' },
      impervious: { value: 13.9, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 149.9 km²' },
    },
    '대전광역시': {
      label: '대전광역시',
      green: { value: 62.4, desc: '식생이 있는 면적(산림·초지·농업 등)은 328.5 km²' },
      impervious: { value: 12.4, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 65.3 km²' },
    },
    '전라남도': {
      label: '전라남도',
      green: { value: 62.3, desc: '식생이 있는 면적(산림·초지·농업 등)은 7,421.5 km²' },
      impervious: { value: 5.1, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 607.6 km²' },
    },
    '세종특별자치시': {
      label: '세종특별자치시',
      green: { value: 61.5, desc: '식생이 있는 면적(산림·초지·농업 등)은 186.2 km²' },
      impervious: { value: 10.8, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 32.7 km²' },
    },
    '경기도': {
      label: '경기도',
      green: { value: 60.8, desc: '식생이 있는 면적(산림·초지·농업 등)은 6,382.4 km²' },
      impervious: { value: 18.3, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 1,923.6 km²' },
    },
    '전북특별자치도': {
      label: '전북특별자치도',
      green: { value: 60.1, desc: '식생이 있는 면적(산림·초지·농업 등)은 4,912.7 km²' },
      impervious: { value: 4.7, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 384.2 km²' },
    },
    '충청남도': {
      label: '충청남도',
      green: { value: 55.4, desc: '식생이 있는 면적(산림·초지·농업 등)은 4,218.9 km²' },
      impervious: { value: 7.6, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 578.9 km²' },
    },
    '부산광역시': {
      label: '부산광역시',
      green: { value: 52.3, desc: '식생이 있는 면적(산림·초지·농업 등)은 382.4 km²' },
      impervious: { value: 15.2, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 111.3 km²' },
    },
    '제주특별자치도': {
      label: '제주특별자치도',
      green: { value: 51.6, desc: '식생이 있는 면적(산림·초지·농업 등)은 982.5 km²' },
      impervious: { value: 4.2, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 79.9 km²' },
    },
    '광주광역시': {
      label: '광주광역시',
      green: { value: 48.3, desc: '식생이 있는 면적(산림·초지·농업 등)은 241.6 km²' },
      impervious: { value: 11.7, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 58.6 km²' },
    },
    '인천광역시': {
      label: '인천광역시',
      green: { value: 45.0, desc: '식생이 있는 면적(산림·초지·농업 등)은 482.1 km²' },
      impervious: { value: 16.8, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 180.0 km²' },
    },
    '서울특별시': {
      label: '서울특별시',
      green: { value: 35.4, desc: '식생이 있는 면적(산림·초지·농업 등)은 357.2 km²' },
      impervious: { value: 22.5, desc: '빗물이 스며들지 않는 면적(도로·건물 등)은 226.8 km²' },
    },
  };

  const datasets = {
    green: {
      barClass: 'land-cover__rank-bar-fill',
      regions: Object.entries(regionDetails).map(([name, detail]) => ({
        name,
        value: detail.green.value,
      })),
    },
    impervious: {
      barClass: 'land-cover__rank-bar-fill land-cover__rank-bar-fill--impervious',
      regions: Object.entries(regionDetails).map(([name, detail]) => ({
        name,
        value: detail.impervious.value,
      })),
    },
  };

  const compareRegionOrder = [
    '강원특별자치도',
    '경상북도',
    '경상남도',
    '충청북도',
    '대구광역시',
    '울산광역시',
    '대전광역시',
    '전라남도',
    '세종특별자치시',
    '경기도',
    '전북특별자치도',
    '충청남도',
    '부산광역시',
    '제주특별자치도',
    '광주광역시',
    '인천광역시',
    '서울특별시',
  ];

  let activeMetric = 'green';
  let activeScope = nationalScope;

  const updateSummary = () => {
    const green = activeScope.green;
    const impervious = activeScope.impervious;

    scopeBadges.forEach((badge) => {
      badge.textContent = activeScope.label;
    });

    if (greenRate) greenRate.textContent = green.value.toFixed(1);
    if (greenDesc) greenDesc.textContent = green.desc;
    if (greenBar) greenBar.style.width = `${green.value}%`;

    if (imperviousRate) imperviousRate.textContent = impervious.value.toFixed(1);
    if (imperviousDesc) imperviousDesc.textContent = impervious.desc;
    if (imperviousBar) imperviousBar.style.width = `${impervious.value}%`;
  };

  const renderItem = (item, barClass) => {
    if (item.isBaseline) {
      return `
        <li class="land-cover__rank-item is-baseline body2-r-16 color-slate-700">
          <span class="land-cover__rank-no body2-r-16 color-slate-500">-</span>
          <span class="land-cover__rank-name is-baseline body2-m-16">${item.name}</span>
          <span class="land-cover__rank-bar" aria-hidden="true">
            <span class="${barClass}" style="width:${item.value}%"></span>
          </span>
          <span class="land-cover__rank-value body2-m-16 color-slate-900">${item.value.toFixed(1)}%</span>
        </li>
      `;
    }

    return `
      <li class="land-cover__rank-item body2-r-16 color-slate-700">
        <span class="land-cover__rank-no body2-r-16 color-slate-500">${item.rank}</span>
        <span class="land-cover__rank-name body2-r-16 color-slate-900">${item.name}</span>
        <span class="land-cover__rank-bar" aria-hidden="true">
          <span class="${barClass}" style="width:${item.value}%"></span>
        </span>
        <span class="land-cover__rank-value body2-m-16 color-slate-900">${item.value.toFixed(1)}%</span>
      </li>
    `;
  };

  const renderRanking = () => {
    const dataset = datasets[activeMetric];
    const order = sortSelect?.value === 'asc' ? 'asc' : 'desc';
    const baseline = {
      name: '전국 기준',
      value: nationalScope[activeMetric].value,
      isBaseline: true,
    };
    const sorted = [...dataset.regions].sort((a, b) =>
      order === 'asc' ? a.value - b.value : b.value - a.value
    );

    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    listRoot.setAttribute(
      'aria-label',
      `시도별 ${activeMetric === 'green' ? '녹지(녹피)' : '불투수면'} 순위`
    );

    listRoot.innerHTML =
      renderItem(baseline, dataset.barClass) + sorted.map((item) => renderItem(item, dataset.barClass)).join('');
  };

  const renderCompare = () => {
    if (!compareRoot) return;

    compareRoot.innerHTML = compareRegionOrder
      .map((name) => {
        const region = regionDetails[name];
        if (!region) return '';

        const greenValue = region.green.value;
        const imperviousValue = region.impervious.value;

        return `
          <li class="land-cover__compare-item body2-r-16 color-slate-700">
            <span class="land-cover__compare-name body2-r-16 color-slate-900">${name}</span>
            <span class="land-cover__compare-bars" aria-hidden="true">
              <span class="land-cover__compare-bar">
                <span class="land-cover__compare-bar-fill land-cover__compare-bar-fill--green" style="width:${greenValue}%"></span>
              </span>
              <span class="land-cover__compare-bar">
                <span class="land-cover__compare-bar-fill land-cover__compare-bar-fill--impervious" style="width:${imperviousValue}%"></span>
              </span>
            </span>
            <span class="land-cover__compare-values">
              <span class="body2-m-16 color-green-600">${greenValue.toFixed(1)}%</span>
              <span class="body2-m-16 color-slate-900">${imperviousValue.toFixed(1)}%</span>
            </span>
          </li>
        `;
      })
      .join('');
  };

  const setScope = (scope) => {
    activeScope = scope;
    updateSummary();
  };

  const setMetric = (metric) => {
    if (!datasets[metric]) return;
    activeMetric = metric;

    tabsRoot?.querySelectorAll('[data-land-cover-metric]').forEach((tab) => {
      const isActive = tab.dataset.landCoverMetric === metric;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    renderRanking();
  };

  const applySearch = () => {
    const sido = sidoSelect?.value ?? 'all';
    const sigungu = sigunguSelect?.value ?? 'all';
    const sidoLabel = sidoSelect?.selectedOptions[0]?.textContent?.trim() ?? '전국';

    if (sido === 'all') {
      setScope(nationalScope);
      return;
    }

    if (sigungu !== 'all') {
      setScope({
        label: `${sidoLabel} ${sigunguSelect.selectedOptions[0]?.textContent?.trim()}`,
        green: nationalScope.green,
        impervious: nationalScope.impervious,
      });
      return;
    }

    const matchedRegion = Object.values(regionDetails).find((item) => item.label === sidoLabel);
    if (matchedRegion) {
      setScope(matchedRegion);
      return;
    }

    setScope({
      label: sidoLabel,
      green: nationalScope.green,
      impervious: nationalScope.impervious,
    });
  };

  tabsRoot?.querySelectorAll('[data-land-cover-metric]').forEach((tab) => {
    tab.addEventListener('click', () => setMetric(tab.dataset.landCoverMetric));
  });

  sortSelect?.addEventListener('change', renderRanking);
  searchButton?.addEventListener('click', applySearch);

  updateSummary();
  renderRanking();
  renderCompare();
})();
