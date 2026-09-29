/** 다운로드 내역 — 기간 프리셋 · 탭 필터 · 다운로드 토스트 */
(() => {
  const form = document.querySelector('[data-dl-filter]');
  const list = document.querySelector('[data-dl-list]');
  const empty = document.querySelector('[data-dl-empty]');
  const tabs = document.querySelectorAll('[data-dl-tab]');
  const cards = list ? [...list.querySelectorAll('[data-dl-card]')] : [];

  let activeTab = 'all';

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

  const applyPreset = (days) => {
    const end = today();
    const start = today();
    start.setDate(start.getDate() - (Number(days) || 7) + 1);
    startPicker?.setDate(start, false);
    endPicker?.setDate(end, false);
    const startInput = document.getElementById('dl-filter-start');
    const endInput = document.getElementById('dl-filter-end');
    if (startInput) startInput.value = formatYmd(start);
    if (endInput) endInput.value = formatYmd(end);
  };

  let startPicker = null;
  let endPicker = null;

  if (form && typeof window.initPicker === 'function') {
    const todayDate = today();
    startPicker = window.initPicker('dl-filter-start', { defaultDate: todayDate });
    endPicker = window.initPicker('dl-filter-end', { defaultDate: todayDate });

    const preset = form.querySelector('[data-dl-preset]');
    applyPreset(preset?.value || '7');

    preset?.addEventListener('change', () => {
      applyPreset(preset.value);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  }

  const syncList = () => {
    let visible = 0;
    cards.forEach((card) => {
      const status = card.getAttribute('data-dl-status');
      const match =
        activeTab === 'all' ||
        (activeTab === 'expired' && status === 'expired') ||
        (activeTab === 'done' && status === 'done');
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
    if (list) list.hidden = visible === 0;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTab = tab.getAttribute('data-dl-tab') || 'all';
      tabs.forEach((item) => {
        const on = item === tab;
        item.classList.toggle('active', on);
        item.classList.toggle('color-slate-900', on);
        item.classList.toggle('color-slate-500', !on);
        item.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      syncList();
    });
  });

  list?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-dl-download]');
    if (!btn) return;
    window.Toast?.show?.('다운로드를 시작합니다.');
  });

  syncList();
})();
