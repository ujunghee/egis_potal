/** 메인 상세검색 모달 — 탭 전환 · 적용된 필터 · 기간/데이터피커 · 검색 (jQuery) */
jQuery(function ($) {
  const $modal = $('#main-detail-modal');
  const $openBtn = $('[data-main-detail-open]');
  if (!$modal.length || !$openBtn.length) return;

  const modal = $modal[0];
  const $form = $modal.find('[data-main-detail-form]');
  const $tabs = $modal.find('[data-md-tab]');
  const $panels = $modal.find('[data-md-panel]');
  const $checks = $modal.find('.main-detail__check .checkbox-basic');
  const $groups = $modal.find('[data-md-group]');
  const $midEmpty = $modal.find('[data-md-mid-empty]');
  const $appliedList = $modal.find('[data-md-applied-list]');
  const $appliedCount = $modal.find('[data-md-applied-count]');
  const $applied = $modal.find('[data-md-applied]');
  const $period = $modal.find('[data-md-period]');
  const $keyword = $('#md-keyword');
  const $start = $('#md-start');
  const $end = $('#md-end');

  /** 적용된 필터 칩 순서 = 체크한 순서 */
  let order = [];

  const escape = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

  const labelOf = (input) => $modal.find(`label[for="${input.id}"]`).text().trim() || input.value;

  /* ---------- 데이터피커 ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  /** 달력은 dialog(top layer) 안에 붙고, 입력 칸 바로 아래(공간 없으면 위)에 놓는다 */
  const placeCalendar = (inst) => {
    const cal = inst.calendarContainer;
    const anchor = inst.input.closest('.main-detail__date');
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
    const startDate = startPicker?.selectedDates[0] || null;
    const endDate = endPicker?.selectedDates[0] || null;
    endPicker?.set('minDate', startDate);
    startPicker?.set('maxDate', endDate);
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
    startPicker = window.initPicker('md-start', pickerOptions);
    endPicker = window.initPicker('md-end', pickerOptions);
  }

  const clearDates = () => {
    presetRange = { start: '', end: '' };
    if (startPicker && endPicker) {
      startPicker.clear(false);
      endPicker.clear(false);
      syncRange();
    } else {
      $start.val('');
      $end.val('');
    }
  };

  const applyPeriod = (value) => {
    if (!value) {
      clearDates();
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

    if (startPicker && endPicker) {
      startPicker.set('maxDate', null);
      endPicker.set('minDate', null);
      startPicker.setDate(start, false);
      endPicker.setDate(end, false);
      syncRange();
    } else {
      $start.val(formatDate(start));
      $end.val(formatDate(end));
    }
    presetRange = { start: $start.val(), end: $end.val() };
  };

  $period.on('change', function () {
    applyPeriod(this.value);
  });

  /* ---------- 탭 ---------- */
  const activateTab = (key) => {
    $tabs.each(function () {
      const active = $(this).data('mdTab') === key;
      $(this).toggleClass('is-active', active).attr('aria-selected', String(active));
      this.tabIndex = active ? 0 : -1;
    });
    $panels.each(function () {
      this.hidden = $(this).data('mdPanel') !== key;
    });
    closePickers();
  };

  $tabs.on('click', function () {
    activateTab($(this).data('mdTab'));
  });

  $tabs.on('keydown', function (event) {
    const index = $tabs.index(this);
    let next = null;
    if (event.key === 'ArrowRight') next = (index + 1) % $tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + $tabs.length) % $tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = $tabs.length - 1;
    if (next === null) return;

    event.preventDefault();
    const $target = $tabs.eq(next);
    activateTab($target.data('mdTab'));
    $target.trigger('focus');
  });

  /* ---------- 분류: 대분류 → 중분류 그룹 ---------- */
  const syncMidGroups = () => {
    let visible = 0;
    $groups.each(function () {
      const parent = document.getElementById($(this).data('mdGroup'));
      const show = Boolean(parent?.checked);
      this.hidden = !show;
      if (show) visible += 1;
      else $(this).find('.checkbox-basic').prop('checked', false);
    });
    $midEmpty.prop('hidden', visible > 0);
  };

  /* ---------- 적용된 필터 ---------- */
  const renderApplied = () => {
    order = order.filter((id) => document.getElementById(id)?.checked);

    const html = order
      .map((id) => {
        const label = escape(labelOf(document.getElementById(id)));
        return `
      <li>
        <div class="chip border-slate-500 border h-36 w-fit px-12 radius-md-6 gap-6 flex align-center justify-center bg-white">
          <span class="body2-m-16 color-slate-700">${label}</span>
          <button type="button" class="chips-close-icon" data-md-remove="${escape(id)}">
            <span class="blind">${label} 필터 삭제</span>
          </button>
        </div>
      </li>`;
      })
      .join('');

    $appliedList.html(html);
    $appliedCount.text(order.length);
    $applied.prop('hidden', order.length === 0);
  };

  $checks.on('change', function () {
    if (this.checked) {
      if (!order.includes(this.id)) order.push(this.id);
    } else {
      order = order.filter((id) => id !== this.id);
    }
    if (this.name === 'category') syncMidGroups();
    renderApplied();
  });

  $appliedList.on('click', '[data-md-remove]', function () {
    const input = document.getElementById($(this).data('mdRemove'));
    if (!input) return;
    input.checked = false;
    $(input).trigger('change');
  });

  $modal.find('[data-md-reset]').on('click', () => {
    $checks.prop('checked', false);
    order = [];
    syncMidGroups();
    $period.val('');
    clearDates();
    renderApplied();
  });

  /* ---------- 모달 열기/닫기 ---------- */
  const openModal = () => {
    if (!modal.open) modal.showModal();
    $('body').addClass('is-main-detail-open');
    $openBtn.attr('aria-expanded', 'true');
    requestAnimationFrame(() => $keyword.trigger('focus'));
  };

  const closeModal = () => {
    closePickers();
    if (modal.open) modal.close();
  };

  $modal.on('close', () => {
    $('body').removeClass('is-main-detail-open');
    $openBtn.attr('aria-expanded', 'false').trigger('focus');
  });

  $openBtn.on('click', openModal);
  $modal.find('[data-main-detail-close]').on('click', closeModal);

  /** 모달 바깥(딤) 클릭 시 닫기 */
  $modal.on('click', (event) => {
    if (event.target === modal) closeModal();
  });

  /** Esc: 달력이 열려 있으면 달력만 닫기 */
  $modal.on('cancel', (event) => {
    if (!anyPickerOpen()) return;
    event.preventDefault();
    closePickers();
  });

  /* ---------- 검색 ---------- */
  $form.on('submit', () => {
    closePickers();
    [$keyword, $period, $start, $end].forEach(($field) => {
      if (!String($field.val() || '').trim()) $field.prop('disabled', true);
    });
  });

  /** 뒤로가기(bfcache) 복귀 시 제출 때 비활성화한 필드 복구 */
  $(window).on('pageshow', () => {
    [$keyword, $period, $start, $end].forEach(($field) => $field.prop('disabled', false));
  });

  syncMidGroups();
  renderApplied();
});
