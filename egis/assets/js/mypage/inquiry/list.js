/** 나의 문의 목록 — 기간 프리셋 · 문의 유형 연동 · 날짜 선택 */
(() => {
  const form = document.querySelector('[data-mi-filter]');
  if (!form || typeof window.initPicker !== 'function') return;

  const startInput = document.getElementById('mi-filter-start');
  const endInput = document.getElementById('mi-filter-end');
  const presetSelect = form.querySelector('[data-mi-preset]');
  const categorySelect = form.querySelector('[data-mi-category]');
  const typeSelect = form.querySelector('[data-mi-type]');

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const today = () => startOfDay(new Date());

  const formatYmd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let startPicker = null;
  let endPicker = null;

  const applyPreset = (days) => {
    const end = today();
    const start = today();
    start.setDate(start.getDate() - (Number(days) || 7) + 1);
    startPicker?.setDate(start, false);
    endPicker?.setDate(end, false);
    if (startInput) startInput.value = formatYmd(start);
    if (endInput) endInput.value = formatYmd(end);
  };

  const todayDate = today();

  startPicker = window.initPicker('mi-filter-start', {
    defaultDate: todayDate,
  });

  endPicker = window.initPicker('mi-filter-end', {
    defaultDate: todayDate,
  });

  applyPreset(presetSelect?.value || '7');

  presetSelect?.addEventListener('change', () => {
    applyPreset(presetSelect.value);
  });

  if (window.EgisInquiryTypes?.bind) {
    window.EgisInquiryTypes.bind(categorySelect, typeSelect, { emptyLabel: '전체' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
})();
