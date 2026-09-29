/** 메인 히어로 — AI 질문 / 통합검색 탭 전환 + 슬라이딩 토글 + 추천 질문 (jQuery) */
jQuery(function ($) {
  const $tablist = $('.main-hero-mode[role="tablist"]');
  const $thumb = $tablist.find('.main-hero-mode__thumb');
  const $heroStack = $('.main-hero__stack');
  const $panelsWrap = $('.main-hero-panels');
  const $modeButtons = $tablist.find('[data-hero-mode]');
  const $panels = $('[data-hero-panel]');
  if (
    !$tablist.length ||
    !$thumb.length ||
    !$heroStack.length ||
    !$panelsWrap.length ||
    !$modeButtons.length ||
    !$panels.length
  ) {
    return;
  }

  const $inputByMode = {
    ai: $('#main-ai-input'),
    search: $('#main-search-input'),
  };

  const moveThumb = (mode, { animate = true } = {}) => {
    const $activeBtn = $modeButtons.filter(`[data-hero-mode="${mode}"]`).first();
    if (!$activeBtn.length) return;

    const tablistRect = $tablist[0].getBoundingClientRect();
    const btnRect = $activeBtn[0].getBoundingClientRect();
    const left = btnRect.left - tablistRect.left;
    const width = btnRect.width;

    if (!animate) {
      $thumb.css('transition', 'none');
    }

    $thumb.css({ width: `${width}px`, transform: `translateX(${left}px)` });
    $tablist.addClass('is-thumb-ready');

    if (!animate) {
      void $thumb[0].offsetWidth;
      $thumb.css('transition', '');
    }
  };

  const setMode = (mode, { focus = true, animate = true } = {}) => {
    if (!$modeButtons.filter(`[data-hero-mode="${mode}"]`).length) return;

    $modeButtons.each(function () {
      const $btn = $(this);
      const active = $btn.data('heroMode') === mode;
      $btn.toggleClass('main-hero-mode__btn--active', active);
      $btn.attr('aria-selected', String(active));
      this.tabIndex = active ? 0 : -1;
    });

    $heroStack.attr('data-hero-active', mode);
    $panelsWrap.attr('data-hero-active', mode);

    $panels.each(function () {
      const $panel = $(this);
      const show = $panel.data('heroPanel') === mode;
      $panel.toggleClass('is-active', show);
      $panel.attr('aria-hidden', String(!show));
    });

    moveThumb(mode, { animate });

    if (focus) {
      requestAnimationFrame(() => {
        $inputByMode[mode]?.[0]?.focus({ preventScroll: true });
      });
    }
  };

  $modeButtons.each(function (index) {
    const $btn = $(this);
    $btn.on('click', () => setMode($btn.data('heroMode')));

    $btn.on('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        next = (index + 1) % $modeButtons.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        next = (index - 1 + $modeButtons.length) % $modeButtons.length;
      } else if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = $modeButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const $target = $modeButtons.eq(next);
      setMode($target.data('heroMode'));
      $target.trigger('focus');
    });
  });

  $('[data-ai-suggest-q]').on('click', function () {
    const text = $(this).data('aiSuggestQ');
    const $input = $inputByMode.ai;
    if (!text || !$input.length) return;
    $input.val(text);
    setMode('ai');
    $input.trigger('focus');
  });

  const syncLayout = ({ animate = false } = {}) => {
    const current = $heroStack.attr('data-hero-active') || 'ai';
    moveThumb(current, { animate });
  };

  $(window).on('resize', () => syncLayout({ animate: false }));

  const initial =
    $modeButtons.filter('[aria-selected="true"]').first().data('heroMode') || 'ai';

  setMode(initial, { focus: false, animate: false });
  requestAnimationFrame(() => syncLayout({ animate: false }));

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => syncLayout({ animate: false }));
  }

  $(window).on('load', () => syncLayout({ animate: false }));

  /* 텍스트 입력은 클릭해도 :focus-visible이 걸리므로, Tab 키로 들어왔을 때만 검색창 포커스 링을 켠다 */
  let viaTab = false;
  document.addEventListener('keydown', (event) => { viaTab = event.key === 'Tab'; }, true);
  document.addEventListener('pointerdown', () => { viaTab = false; }, true);

  $('.main-hero-ai, .main-hero-search')
    .on('focusin', function () {
      $(this).toggleClass('is-tab-focus', viaTab);
    })
    .on('focusout', function (event) {
      if (!this.contains(event.relatedTarget)) $(this).removeClass('is-tab-focus');
    });
});
