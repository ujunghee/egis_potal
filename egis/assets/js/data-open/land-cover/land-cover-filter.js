/** 국가토지피복 통계 — 지역 필터 연동 */
(() => {
  const regionData = {
    seoul: {
      sigungu: [
        { value: 'all', label: '전체' },
        { value: 'gangnam', label: '강남구' },
        { value: 'seocho', label: '서초구' },
      ],
      eupmyeondong: {
        gangnam: [
          { value: 'all', label: '전체' },
          { value: 'yeoksam', label: '역삼동' },
        ],
        seocho: [
          { value: 'all', label: '전체' },
          { value: 'bangbae', label: '방배동' },
        ],
      },
    },
    gyeonggi: {
      sigungu: [
        { value: 'all', label: '전체' },
        { value: 'suwon', label: '수원시' },
        { value: 'seongnam', label: '성남시' },
      ],
      eupmyeondong: {
        suwon: [
          { value: 'all', label: '전체' },
          { value: 'paldal', label: '팔달구' },
        ],
        seongnam: [
          { value: 'all', label: '전체' },
          { value: 'bundang', label: '분당구' },
        ],
      },
    },
    busan: {
      sigungu: [
        { value: 'all', label: '전체' },
        { value: 'haeundae', label: '해운대구' },
      ],
      eupmyeondong: {
        haeundae: [
          { value: 'all', label: '전체' },
          { value: 'udong', label: '우동' },
        ],
      },
    },
  };

  const fillSelect = (select, options) => {
    select.innerHTML = options
      .map((option) => `<option value="${option.value}">${option.label}</option>`)
      .join('');
  };

  const initFilter = (filterRoot) => {
    const sidoSelect = filterRoot.querySelector('[data-land-cover-sido]');
    const sigunguSelect = filterRoot.querySelector('[data-land-cover-sigungu]');
    const eupmyeondongSelect = filterRoot.querySelector('[data-land-cover-eupmyeondong]');

    if (!sidoSelect || !sigunguSelect || !eupmyeondongSelect) return;

    const resetSigungu = () => {
      fillSelect(sigunguSelect, [{ value: 'all', label: '전체' }]);
      sigunguSelect.value = 'all';
      sigunguSelect.disabled = true;
    };

    const resetEupmyeondong = () => {
      fillSelect(eupmyeondongSelect, [{ value: 'all', label: '전체' }]);
      eupmyeondongSelect.value = 'all';
      eupmyeondongSelect.disabled = true;
    };

    const updateSigungu = () => {
      const sido = sidoSelect.value;

      resetEupmyeondong();

      if (sido === 'all') {
        resetSigungu();
        return;
      }

      const sigunguOptions = regionData[sido]?.sigungu ?? [{ value: 'all', label: '전체' }];
      fillSelect(sigunguSelect, sigunguOptions);
      sigunguSelect.disabled = false;
    };

    const updateEupmyeondong = () => {
      const sido = sidoSelect.value;
      const sigungu = sigunguSelect.value;

      if (sido === 'all' || sigungu === 'all') {
        resetEupmyeondong();
        return;
      }

      const eupmyeondongOptions = regionData[sido]?.eupmyeondong?.[sigungu] ?? [
        { value: 'all', label: '전체' },
      ];
      fillSelect(eupmyeondongSelect, eupmyeondongOptions);
      eupmyeondongSelect.disabled = false;
    };

    sidoSelect.addEventListener('change', updateSigungu);
    sigunguSelect.addEventListener('change', updateEupmyeondong);

    updateSigungu();
  };

  document.querySelectorAll('[data-land-cover-filter]').forEach(initFilter);
})();
