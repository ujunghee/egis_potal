/** AI 검색 결과 — 질문 조건 수정 팝업 (jQuery) */
jQuery(function ($) {
  const $modal = $('#ai-cond-modal');
  const $form = $('[data-ai-cond-form]');
  const $openBtn = $('[data-ai-cond-open]');
  if (!$modal.length || !$form.length) return;

  const modal = $modal[0];
  const form = $form[0];
  const $sido = $('[data-ai-cond-sido]');
  const $sigungu = $('[data-ai-cond-sigungu]');
  const $period = $('[data-ai-cond-period]');
  const $start = $('#ai-cond-start');
  const $end = $('#ai-cond-end');
  const $conditions = $('[data-ai-conditions]');

  const SIGUNGU = {
    서울특별시: ['종로구', '중구', '용산구', '성동구', '강남구', '송파구'],
    부산광역시: ['중구', '해운대구', '사하구', '강서구'],
    경기도: ['수원시', '성남시', '고양시', '용인시', '화성시'],
    강원특별자치도: ['춘천시', '원주시', '강릉시'],
    제주특별자치도: ['제주시', '서귀포시'],
  };

  const PERIOD_LABEL = {
    '': '기간 미지정',
    '1w': '최근 1주일',
    '1m': '최근 1개월',
    '3m': '최근 3개월',
    '6m': '최근 6개월',
    '1y': '최근 1년',
  };

  const escape = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  /* ---------- 대상 지역 ---------- */
  const fillSigungu = (sido, selected = '') => {
    const list = SIGUNGU[sido] || [];
    $sigungu.html(
      ['<option value="">전체</option>']
        .concat(list.map((name) => `<option value="${escape(name)}"${name === selected ? ' selected' : ''}>${escape(name)}</option>`))
        .join(''),
    );
    $sigungu.prop('disabled', !sido);
  };

  $sido.on('change', function () {
    fillSigungu(this.value);
  });

  /* ---------- 직접 입력 ---------- */
  const syncCustom = (name, { focus = false } = {}) => {
    const $radio = $form.find(`input[name="${name}"][data-ai-cond-custom]`);
    const $input = $radio.closest('li').find('[data-ai-cond-custom-input]');
    const on = $radio.prop('checked');
    $input.prop({ hidden: !on, disabled: !on });
    if (on && focus) $input.trigger('focus');
  };

  $form.on('change', 'input[type="radio"]', function () {
    syncCustom(this.name, { focus: this.hasAttribute('data-ai-cond-custom') });
  });

  /* ---------- 데이터피커 ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  /** 달력은 dialog(top layer) 안에 붙고, 입력 칸 바로 아래(공간 없으면 위)에 놓는다 */
  const placeCalendar = (inst) => {
    const cal = inst.calendarContainer;
    const anchor = inst.input.closest('.ai-cond__date');
    if (!cal || !anchor) return;

    const box = modal.getBoundingClientRect();
    const rect = anchor.getBoundingClientRect();
    const gap = 4;
    const edge = 16;
    const calW = cal.offsetWidth;
    const calH = cal.offsetHeight;

    let left = rect.left - box.left;
    if (left + calW > box.width - edge) left = rect.right - box.left - calW;
    left = Math.max(edge, left);

    let top = rect.bottom - box.top + gap;
    const fitsBelow = rect.bottom + gap + calH <= window.innerHeight - edge;
    const fitsAbove = rect.top - gap - calH >= edge;
    if (!fitsBelow && fitsAbove) top = rect.top - box.top - gap - calH;

    cal.style.right = 'auto';
    cal.style.left = `${left + modal.scrollLeft}px`;
    cal.style.top = `${top + modal.scrollTop}px`;
  };

  let startPicker = null;
  let endPicker = null;

  const closePickers = () => {
    startPicker?.close();
    endPicker?.close();
  };

  const anyPickerOpen = () => Boolean(startPicker?.isOpen || endPicker?.isOpen);

  const syncRange = () => {
    endPicker?.set('minDate', startPicker?.selectedDates[0] || null);
    startPicker?.set('maxDate', endPicker?.selectedDates[0] || null);
  };

  /** 기간 프리셋이 채운 날짜 — 이 값과 달라지면 '직접 설정' */
  let presetRange = { start: '', end: '' };

  const markCustomPeriod = () => {
    const start = $start.val();
    const end = $end.val();
    if (start === presetRange.start && end === presetRange.end) return;
    presetRange = { start: '', end: '' };
    $period.val(start || end ? 'custom' : '');
  };

  const pickerOptions = {
    position: placeCalendar,
    onChange: () => {
      markCustomPeriod();
      syncRange();
    },
    onClose: () => {
      markCustomPeriod();
      syncRange();
    },
  };

  if (typeof window.initPicker === 'function') {
    startPicker = window.initPicker('ai-cond-start', pickerOptions);
    endPicker = window.initPicker('ai-cond-end', pickerOptions);
  }

  const setDates = (start, end) => {
    if (startPicker && endPicker) {
      startPicker.set('maxDate', null);
      endPicker.set('minDate', null);
      if (start) startPicker.setDate(start, false);
      else startPicker.clear(false);
      if (end) endPicker.setDate(end, false);
      else endPicker.clear(false);
      syncRange();
    } else {
      $start.val(start ? (typeof start === 'string' ? start : formatDate(start)) : '');
      $end.val(end ? (typeof end === 'string' ? end : formatDate(end)) : '');
    }
  };

  const applyPeriod = (value) => {
    if (!value) {
      presetRange = { start: '', end: '' };
      setDates(null, null);
      return;
    }
    if (value === 'custom') {
      startPicker?.open();
      return;
    }

    const amount = parseInt(value, 10);
    const unit = value.slice(-1);
    const end = new Date();
    const start = new Date();
    if (unit === 'w') start.setDate(start.getDate() - amount * 7);
    if (unit === 'm') start.setMonth(start.getMonth() - amount);
    if (unit === 'y') start.setFullYear(start.getFullYear() - amount);

    setDates(start, end);
    presetRange = { start: $start.val(), end: $end.val() };
  };

  $period.on('change', function () {
    applyPeriod(this.value);
  });

  /* ---------- 상태 저장·복원 ---------- */
  const readState = () => ({
    purpose: $form.find('input[name="purpose"]:checked').val() || '',
    purposeText: $('#ai-cond-purpose-custom').val(),
    topic: $form.find('input[name="topic"]:checked').val() || '',
    topicText: $('#ai-cond-topic-custom').val(),
    sido: $sido.val(),
    sigungu: $sigungu.val(),
    period: $period.val(),
    start: $start.val(),
    end: $end.val(),
  });

  const writeState = (state) => {
    ['purpose', 'topic'].forEach((name) => {
      const $radios = $form.find(`input[name="${name}"]`);
      let $target = $radios.filter((_, el) => el.value === state[name]);
      if (!$target.length) $target = $radios.first();
      $target.prop('checked', true);
      $(`#ai-cond-${name}-custom`).val(state[`${name}Text`] || '');
      syncCustom(name);
    });
    $sido.val(state.sido);
    fillSigungu(state.sido, state.sigungu);
    $period.val(state.period);
    setDates(state.start || null, state.end || null);
    presetRange = state.period && state.period !== 'custom' ? { start: $start.val(), end: $end.val() } : { start: '', end: '' };
  };

  /** 마크업 기본값 = AI가 추출·추천한 조건 */
  const AI_STATE = readState();
  let openState = AI_STATE;

  /* ---------- URL 조건 → 폼·조건 칩 ---------- */
  const params = new URLSearchParams(window.location.search);
  const CONDITION_KEYS = ['purpose', 'purposeText', 'topic', 'topicText', 'sido', 'sigungu', 'period', 'start', 'end'];
  const hasUrlConditions = CONDITION_KEYS.some((key) => params.has(key));

  if (hasUrlConditions) {
    writeState({
      ...AI_STATE,
      ...Object.fromEntries(CONDITION_KEYS.map((key) => [key, params.get(key) || ''])),
    });
  }

  const choiceLabel = (state, name) => (state[name] === 'custom' ? state[`${name}Text`] || '직접 입력' : state[name]);

  const periodLabel = (state) => {
    if (state.period && state.period !== 'custom') return PERIOD_LABEL[state.period];
    if (state.start || state.end) return `${state.start || '…'} ~ ${state.end || '…'}`;
    return PERIOD_LABEL[''];
  };

  const renderConditions = (state) => {
    if (!$conditions.length) return;
    const region = state.sido ? [state.sido, state.sigungu].filter(Boolean).join(' ') : '전국';
    const items = [
      { label: '분석 목적', value: choiceLabel(state, 'purpose') },
      { label: '대상지역', value: region },
      { label: '핵심주제', value: choiceLabel(state, 'topic') },
      { label: '분석 기간', value: periodLabel(state) },
    ];
    $conditions.html(
      items
        .map(
          (item) => `
      <li class="search-ai__condition body3-r-14 color-slate-700">
        <span>${escape(item.label)}</span>
        <span class="body3-m-14 color-slate-900">${escape(item.value)}</span>
      </li>`,
        )
        .join(''),
    );
  };

  if (hasUrlConditions) renderConditions(readState());

  /* ---------- 열기·닫기 ---------- */
  const open = () => {
    if (modal.open) return;
    openState = readState();
    modal.showModal();
    $('body').addClass('is-ai-cond-open');
    $openBtn.attr('aria-expanded', 'true');
    $modal.find('.modal__content').scrollTop(0);
    $form.find('input[name="purpose"]:checked').trigger('focus');
  };

  const close = ({ restore = true } = {}) => {
    closePickers();
    if (restore) writeState(openState);
    if (modal.open) modal.close();
  };

  $openBtn.on('click', open);
  $modal.on('click', '[data-ai-cond-close]', () => close());

  $modal.on('click', (event) => {
    if (event.target === modal) close();
  });

  $modal.on('cancel', (event) => {
    event.preventDefault();
    if (anyPickerOpen()) {
      closePickers();
      return;
    }
    close();
  });

  $modal.on('close', () => {
    $('body').removeClass('is-ai-cond-open');
    $openBtn.attr('aria-expanded', 'false');
    $openBtn.trigger('focus');
  });

  $modal.on('click', '[data-ai-cond-reset]', () => {
    closePickers();
    writeState(AI_STATE);
  });

  /* ---------- 조건 적용 후 다시 검색 ---------- */
  $form.on('submit', (event) => {
    const state = readState();
    const invalid = ['purpose', 'topic'].find((name) => state[name] === 'custom' && !state[`${name}Text`].trim());
    if (invalid) {
      event.preventDefault();
      $(`#ai-cond-${invalid}-custom`).trigger('focus');
      return;
    }

    closePickers();
    $form.find('[data-ai-cond-query]').val(params.get('q') || $('[data-ai-query-bubble]').text().trim());
    /* 비활성 select는 전송되지 않아 '전국'을 고르면 AI 기본값으로 되돌아가므로 전송 직전 풀어 둔다 */
    $sigungu.prop('disabled', false);
  });

  window.addEventListener('pageshow', () => {
    $sigungu.prop('disabled', !$sido.val());
  });
});
