/** 문의 구분 · 유형 옵션 공통 */
(() => {
  const inquiryTypes = {
    general: [
      { value: 'data-request', label: '데이터 추가 요청' },
      { value: 'usage', label: '데이터·기능 이용 문의' },
      { value: 'inconvenience', label: '불편사항' },
      { value: 'improvement', label: '개선 의견' },
      { value: 'outage', label: '서비스 장애' },
      { value: 'etc', label: '기타' },
    ],
    dataset: [
      { value: 'value-error', label: '데이터 값 오류' },
      { value: 'missing-data', label: '데이터 누락' },
      { value: 'file-error', label: '파일 오류' },
      { value: 'etc', label: '기타' },
    ],
    'open-api': [
      { value: 'call-fail', label: 'API 호출 실패' },
      { value: 'response-error', label: '응답 데이터 오류' },
      { value: 'auth', label: '인증·권한 문제' },
      { value: 'performance', label: '속도·성능 문제' },
      { value: 'etc', label: '기타' },
    ],
  };

  const bindInquiryTypeSelect = (
    categorySelect,
    typeSelect,
    { emptyLabel = '문의 유형 전체', hideEmptyOption = false } = {},
  ) => {
    if (!categorySelect || !typeSelect) return;

    const getTypeOptions = (category) => {
      if (category === 'all') {
        const seen = new Set();
        return Object.values(inquiryTypes)
          .flat()
          .filter((item) => {
            if (seen.has(item.label)) return false;
            seen.add(item.label);
            return true;
          });
      }
      return inquiryTypes[category];
    };

    const updateTypeOptions = (category) => {
      typeSelect.innerHTML = '';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = emptyLabel;
      if (hideEmptyOption) {
        defaultOption.selected = true;
        defaultOption.disabled = true;
        defaultOption.hidden = true;
      }
      typeSelect.appendChild(defaultOption);

      const options = getTypeOptions(category);
      if (!options) {
        typeSelect.disabled = hideEmptyOption;
        typeSelect.value = '';
        return;
      }

      typeSelect.disabled = false;

      if (hideEmptyOption) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        typeSelect.appendChild(allOption);
      }

      options.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        typeSelect.appendChild(option);
      });
      if (hideEmptyOption) typeSelect.value = '';
    };

    categorySelect.addEventListener('change', () => {
      updateTypeOptions(categorySelect.value);
    });

    updateTypeOptions(categorySelect.value);
  };

  window.EgisInquiryTypes = {
    bind: bindInquiryTypeSelect,
  };
})();
