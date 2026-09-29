/** Open API 신청 현황 — 기간 검증 토스트 + 빈 상태 */
(() => {
  const form = document.querySelector('[data-oa-filter]');
  if (!form || typeof window.initPicker !== 'function') return;

  const startInput = document.getElementById('oa-filter-start');
  const endInput = document.getElementById('oa-filter-end');
  const table = document.querySelector('[data-oa-table]');
  const empty = document.querySelector('[data-oa-empty]');
  const pagination = document.querySelector('[data-oa-pagination]');
  const keywordInput = form.querySelector('[data-oa-keyword]');

  const MSG = {
    order: '시작일은 종료일보다 이전 날짜로 선택해 주세요.',
    maxYear: '조회 기간은 최대 1년까지 설정할 수 있습니다.',
    future: '오늘 이후의 날짜는 선택할 수 없습니다.',
  };

  let startPicker = null;
  let endPicker = null;

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const today = () => startOfDay(new Date());

  const parseYmd = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const warn = (message) => {
    window.Toast?.warning?.(message);
  };

  const isFuture = (date) => startOfDay(date).getTime() > today().getTime();

  const getStart = () => startPicker?.selectedDates[0] || parseYmd(startInput?.value);
  const getEnd = () => endPicker?.selectedDates[0] || parseYmd(endInput?.value);

  /** 잘못된 선택 시 오늘로 되돌리고, 달력 화면도 오늘 월로 유지 */
  const resetToToday = (picker) => {
    if (!picker) return;
    const day = today();
    picker.setDate(day, false);
    picker.jumpToDate(day);
  };

  /**
   * 달력에서 날짜를 고른 직후 검증.
   * 실패하면 토스트 + 해당 필드를 오늘 날짜로 복원.
   */
  const validateOnPick = (changedField) => {
    const start = getStart();
    const end = getEnd();
    const changed = changedField === 'end' ? end : start;
    const picker = changedField === 'end' ? endPicker : startPicker;

    if (!changed) return true;

    if (isFuture(changed)) {
      warn(MSG.future);
      resetToToday(picker);
      return false;
    }

    if (!start || !end) return true;

    const startDay = startOfDay(start);
    const endDay = startOfDay(end);

    if (startDay.getTime() > endDay.getTime()) {
      warn(MSG.order);
      resetToToday(picker);
      return false;
    }

    const nextYear = new Date(startDay);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (endDay.getTime() > nextYear.getTime()) {
      warn(MSG.maxYear);
      resetToToday(picker);
      return false;
    }

    return true;
  };

  const validateDates = () => {
    const start = getStart();
    const end = getEnd();
    if (!start || !end) return false;

    if (isFuture(start) || isFuture(end)) {
      warn(MSG.future);
      return false;
    }

    const startDay = startOfDay(start);
    const endDay = startOfDay(end);

    if (startDay.getTime() > endDay.getTime()) {
      warn(MSG.order);
      return false;
    }

    const nextYear = new Date(startDay);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (endDay.getTime() > nextYear.getTime()) {
      warn(MSG.maxYear);
      return false;
    }

    return true;
  };

  const todayDate = today();

  startPicker = window.initPicker('oa-filter-start', {
    defaultDate: todayDate,
    onChange() {
      validateOnPick('start');
    },
  });

  endPicker = window.initPicker('oa-filter-end', {
    defaultDate: todayDate,
    onChange() {
      validateOnPick('end');
    },
  });

  const setEmpty = (isEmpty) => {
    if (table) table.hidden = isEmpty;
    if (pagination) pagination.hidden = isEmpty;
    if (empty) empty.hidden = !isEmpty;
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get('empty') === '1') setEmpty(true);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateDates()) return;

    const keyword = (keywordInput?.value || '').trim();
    setEmpty(keyword === '없음');
  });
})();
