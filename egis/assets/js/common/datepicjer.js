(function () {
  if (typeof flatpickr === 'undefined') return;

  // ko locale에 month/year aria 키가 없어 검사기에서 label 누락으로 잡힘
  var koLocale = Object.assign({}, (flatpickr.l10ns && flatpickr.l10ns.ko) || {}, {
    monthAriaLabel: '월 선택',
    yearAriaLabel: '연도 선택',
    hourAriaLabel: '시 선택',
    minuteAriaLabel: '분 선택',
    scrollTitle: '스크롤하여 변경',
    toggleTitle: '클릭하여 전환',
    weekAbbreviation: '주',
  });

  var a11yIdSeq = 0;
  var DP_CLASS = [
    ['.flatpickr-months', 'dp-head'],
    ['.flatpickr-innerContainer', 'dp-body'],
    ['.flatpickr-rContainer', 'dp-grid'],
    ['.flatpickr-days', 'dp-days'],
    ['.flatpickr-weekdays', 'dp-dow'],
  ];

  function labelControl(el, text) {
    if (!el) return;
    if (!el.id) el.id = 'fp-a11y-' + (++a11yIdSeq);
    if (!document.querySelector('label[for="' + el.id + '"]')) {
      var label = document.createElement('label');
      label.className = 'blind';
      label.htmlFor = el.id;
      label.textContent = text;
      el.parentNode.insertBefore(label, el);
    }
    if (!el.getAttribute('aria-label') || el.getAttribute('aria-label') === 'undefined') {
      el.setAttribute('aria-label', text);
    }
  }

  function nameControl(el, label) {
    if (!el) return;
    el.setAttribute('role', 'button');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
  }

  function monthLabels(inst) {
    var longhand = (inst.l10n && inst.l10n.months && inst.l10n.months.longhand) || [];
    if (longhand.length === 12) return longhand;
    return ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  }

  function closeMonthCombo(combo) {
    if (!combo) return;
    var list = combo.querySelector('.dp-month-combo__list');
    var trigger = combo.querySelector('.dp-month-combo__trigger');
    if (list) list.hidden = true;
    combo.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  /** SolveK select 스타일 월 콤보 (트리거 + 목록) */
  function ensureMonthCombo(inst) {
    var root = inst.calendarContainer;
    if (!root) return;

    var nativeSelect = root.querySelector('select.flatpickr-monthDropdown-months');
    var current = root.querySelector('.flatpickr-current-month');
    if (!nativeSelect || !current) return;

    nativeSelect.classList.add('dp-month-native');
    nativeSelect.setAttribute('tabindex', '-1');
    nativeSelect.setAttribute('aria-hidden', 'true');

    var combo = root.querySelector('.dp-month-combo');
    if (!combo) {
      combo = document.createElement('div');
      combo.className = 'dp-month-combo';
      combo.innerHTML =
        '<button type="button" class="dp-month-combo__trigger" aria-haspopup="listbox" aria-expanded="false">' +
        '<span class="dp-month-combo__label"></span>' +
        '</button>' +
        '<ul class="dp-month-combo__list" role="listbox" hidden></ul>';
      current.insertBefore(combo, nativeSelect.nextSibling);

      var list = combo.querySelector('.dp-month-combo__list');
      var trigger = combo.querySelector('.dp-month-combo__trigger');
      var labels = monthLabels(inst);

      labels.forEach(function (name, index) {
        var option = document.createElement('li');
        option.className = 'dp-month-combo__option';
        option.setAttribute('role', 'option');
        option.dataset.month = String(index);
        option.textContent = name;
        option.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var month = parseInt(option.dataset.month, 10);
          closeMonthCombo(combo);
          // 두 번째 인자가 false면 해당 월로 바로 이동 (offset이 아님)
          // onMonthChange가 돌아야 콤보 라벨·달력이 같이 갱신된다
          inst.changeMonth(month, false);
        });
        list.appendChild(option);
      });

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var willOpen = list.hidden;
        root.querySelectorAll('.dp-month-combo').forEach(closeMonthCombo);
        if (willOpen) {
          list.hidden = false;
          combo.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      if (!root.dataset.dpMonthOutside) {
        root.dataset.dpMonthOutside = 'true';
        document.addEventListener('click', function (event) {
          if (!combo.contains(event.target)) closeMonthCombo(combo);
        });
        root.addEventListener('click', function (event) {
          if (!combo.contains(event.target)) closeMonthCombo(combo);
        });
      }
    }

    var labelEl = combo.querySelector('.dp-month-combo__label');
    var labels = monthLabels(inst);
    if (labelEl) labelEl.textContent = labels[inst.currentMonth] || '';

    combo.querySelectorAll('.dp-month-combo__option').forEach(function (option) {
      var selected = parseInt(option.dataset.month, 10) === inst.currentMonth;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', String(selected));
    });
  }

  function decorateCalendar(inst) {
    var root = inst.calendarContainer;
    if (!root) return;

    root.classList.add('dp');
    root.classList.toggle('dp-range', inst.config.mode === 'range');
    DP_CLASS.forEach(function (pair) {
      var el = root.querySelector(pair[0]);
      if (el) el.classList.add(pair[1]);
    });

    ensureMonthCombo(inst);

    if (root.dataset.dpA11yLabeled === 'true') return;

    var l10n = inst.l10n || {};
    var monthTrigger = root.querySelector('.dp-month-combo__trigger');
    if (monthTrigger && !monthTrigger.getAttribute('aria-label')) {
      monthTrigger.setAttribute('aria-label', l10n.monthAriaLabel || '월 선택');
    }
    labelControl(root.querySelector('input.cur-year'), l10n.yearAriaLabel || '연도 선택');
    nameControl(root.querySelector('.numInputWrapper .arrowUp'), '연도 증가');
    nameControl(root.querySelector('.numInputWrapper .arrowDown'), '연도 감소');
    nameControl(root.querySelector('.flatpickr-prev-month'), '이전 달');
    nameControl(root.querySelector('.flatpickr-next-month'), '다음 달');
    if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', '달력');
    root.dataset.dpA11yLabeled = 'true';
  }

  function injectFooter(inst) {
    var root = inst.calendarContainer;
    if (!root || root.querySelector('.dp-foot')) return;

    var foot = document.createElement('div');
    foot.className = 'dp-foot';
    foot.innerHTML =
      '<button type="button" class="dp-fbtn dp-fbtn--today">오늘</button>' +
      '<button type="button" class="dp-fbtn dp-fbtn--line">취소</button>' +
      '<button type="button" class="dp-fbtn dp-fbtn--fill">확인</button>';
    root.appendChild(foot);

    foot.querySelector('.dp-fbtn--today').onclick = function () {
      var today = new Date();
      inst.setDate(inst.config.mode === 'range' ? [today, today] : today, false);
      inst.jumpToDate(today);
    };
    foot.querySelector('.dp-fbtn--line').onclick = function () {
      var backup = inst._dpOpenBackup || [];
      if (!backup.length) inst.clear(false);
      else if (inst.config.mode === 'range') inst.setDate(backup.length > 1 ? [backup[0], backup[1]] : backup[0], false);
      else inst.setDate(backup[0], false);
      inst.close();
    };
    foot.querySelector('.dp-fbtn--fill').onclick = function () {
      inst.close();
    };
  }

  function initPicker(inputId, extra) {
    var input = document.getElementById(inputId);
    var trigger = document.querySelector('[data-datepicker-for="' + inputId + '"]');
    if (!input || !trigger) return null;

    var options = Object.assign({}, extra || {});
    var skipTriggerListeners = options.skipTriggerListeners === true;
    delete options.skipTriggerListeners;

    var dialogLayer = input.closest('dialog.modal-container');
    if (dialogLayer) {
      if (!options.positionElement) {
        options.positionElement = trigger.parentElement || input;
      }
      if (options.appendTo === undefined) {
        options.appendTo = dialogLayer;
      }
    }

    var refresh = function (_, __, inst) { decorateCalendar(inst); };

    function canOpen() {
      if (input.disabled) return false;
      return true;
    }

    function liftCalendarForModal(inst) {
      if (!dialogLayer || !inst.calendarContainer) return;
      inst.calendarContainer.style.zIndex = '1000';
    }

    var picker = flatpickr(input, Object.assign({
      locale: koLocale,
      dateFormat: 'Y-m-d',
      allowInput: false,
      clickOpens: true,
      disableMobile: true,
      closeOnSelect: false,
      onOpen: function (_, __, inst) {
        if (!canOpen()) {
          inst.close();
          return;
        }
        inst._dpOpenBackup = inst.selectedDates.map(function (d) { return new Date(d.getTime()); });
        decorateCalendar(inst);
        liftCalendarForModal(inst);
        requestAnimationFrame(function () {
          inst._positionCalendar();
        });
      },
      onMonthChange: refresh,
      onYearChange: refresh,
      onReady: function (_, __, inst) {
        decorateCalendar(inst);
        injectFooter(inst);
      },
    }, options));

    if (!skipTriggerListeners) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        if (!canOpen()) return;
        picker.toggle();
      });
    }

    return picker;
  }

  window.initPicker = initPicker;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('input-datepicker')) initPicker('input-datepicker');
    if (document.getElementById('input-datepicker-range')) {
      initPicker('input-datepicker-range', { mode: 'range', defaultDate: ['2024-12-12', '2024-12-21'] });
    }
  });
})();
