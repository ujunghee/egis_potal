/** AI 질문 검색 — 전체 화면 딤 + 프로그레스 모달 (jQuery) */
jQuery(function ($) {
  const $form = $('[data-main-ai-form]');
  const $input = $('#main-ai-input');
  const $overlay = $('#main-ai-overlay');
  const $progress = $('[data-main-ai-progress]');
  const $headEl = $('[data-main-ai-progress-head]');
  const $titleEl = $('[data-main-ai-progress-title]');
  const $descEl = $('[data-main-ai-progress-desc]');
  const $stopBtn = $('[data-main-ai-progress-stop]');

  if (
    !$form.length ||
    !$input.length ||
    !$overlay.length ||
    !$progress.length ||
    !$headEl.length ||
    !$titleEl.length ||
    !$descEl.length ||
    !$stopBtn.length
  ) {
    return;
  }

  const ARC_PATH =
    'M24.8377 0C25.7895 0 26.5689 0.77306 26.4869 1.72138C26.2591 4.35914 25.5091 6.93142 24.2745 9.28642C22.7725 12.1514 20.5979 14.6093 17.9374 16.4494C15.2768 18.2894 12.2097 19.4566 8.99892 19.8509C6.35974 20.175 3.6883 19.9689 1.13984 19.2512C0.223625 18.9932 -0.224663 17.9912 0.11125 17.1006C0.447163 16.21 1.44011 15.7697 2.3608 16.0113C4.38325 16.5418 6.49318 16.6857 8.57878 16.4296C11.2361 16.1033 13.7747 15.1372 15.9767 13.6143C18.1787 12.0915 19.9785 10.0572 21.2216 7.68593C22.1973 5.82491 22.8072 3.79994 23.0246 1.72038C23.1235 0.773691 23.8858 0 24.8377 0Z';

  /* 조각 HTML에 svg 닫는 태그를 두면 Live Server가 스크립트를 끼워 넣으며 응답 끝을 잘라내므로 여기서 생성 */
  const RING_SVG = `<svg class="main-ai-progress__ring" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle class="main-ai-progress__ring-track" cx="20" cy="20" r="18" pathLength="100" />
    <g class="main-ai-progress__ring-spinner">
      <g class="main-ai-progress__arc-slot">
        <svg width="26.5" height="20" viewBox="0 0 27 20"><path d="${ARC_PATH}" fill="#1A76FF" /></svg>
      </g>
      <circle class="main-ai-progress__ring-fill" cx="20" cy="20" r="18" pathLength="100" />
    </g>
  </svg>`;

  $progress.find('[data-node-shell]').each((_, shell) => {
    if (!shell.querySelector('.main-ai-progress__ring')) shell.insertAdjacentHTML('afterbegin', RING_SVG);
  });

  const overlay = $overlay[0];
  const progress = $progress[0];
  const headEl = $headEl[0];
  const titleEl = $titleEl[0];
  const descEl = $descEl[0];

  const PHASES = [
    {
      step: 1,
      title: '질문의 의도를 분석하고 있어요',
      desc: '분석 목적과 핵심 주제, 지역·기간 조건을 확인하는 중',
      duration: 2800,
    },
    {
      step: 2,
      title: '관련 데이터를 찾고 있어요',
      desc: '질문과 관련된 포털 데이터셋을 검색하는 중',
      duration: 2800,
    },
    {
      step: 3,
      title: '분석에 적합한 데이터를 선별하고 있어요',
      desc: '관련성·최신성·활용 가능성을 기준으로 데이터를 확인하는 중',
      duration: 2800,
    },
    {
      step: 4,
      title: '검색 결과를 바탕으로 답변을 만들고 있어요',
      desc: '선별된 데이터를 정리해 AI 답변을 생성하는 중',
      duration: 2800,
    },
    {
      step: 5,
      title: 'AI 검색이 완료되었어요',
      desc: '질문에 대한 답변과 관련 데이터셋을 준비했습니다',
      duration: 1400,
    },
  ];

  const WORK_STEPS = 4;
  const RING_FULL_MS = 240;
  const STEP_HANDOFF_MS = 200;
  const COPY_OUT_MS = 260;
  const COPY_IN_MS = 320;
  let timers = [];
  let running = false;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  };

  const resetShells = () => {
    $progress.find('[data-node-shell]').removeClass('is-loading is-ring-full');
    $progress.find('.main-ai-progress__node.is-complete-pop').removeClass('is-complete-pop');
    $progress.removeClass('is-step-running');
    $headEl.removeClass('is-copy-out is-copy-in');
  };

  const setPhaseCopy = async (phase, { animate = true } = {}) => {
    const same = titleEl.textContent === phase.title && descEl.textContent === phase.desc;
    if (same) return;

    if (!animate || prefersReducedMotion()) {
      $titleEl.text(phase.title);
      $descEl.text(phase.desc);
      return;
    }

    $headEl.removeClass('is-copy-in').addClass('is-copy-out');
    await delay(COPY_OUT_MS);
    if (!running && animate) return;

    $titleEl.text(phase.title);
    $descEl.text(phase.desc);

    $headEl.removeClass('is-copy-out').addClass('is-copy-in');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        $headEl.removeClass('is-copy-in');
      });
    });
    await delay(COPY_IN_MS);
  };

  const closeOverlay = () => {
    clearTimers();
    running = false;
    resetShells();
    $progress.removeClass('is-stopped');
    if (overlay.open) overlay.close();
    $('body').removeClass('is-main-ai-progress');
  };

  const finishSearch = (query) => {
    closeOverlay();
    const url = new URL('../search/ai.html', window.location.href);
    url.searchParams.set('q', query);
    window.location.assign(url.toString());
  };

  const delay = (ms) =>
    new Promise((resolve) => {
      const id = window.setTimeout(resolve, ms);
      timers.push(id);
    });

  const runStepLoading = async (step, duration) => {
    const shell = $progress.find(`[data-step="${step}"] [data-node-shell]`)[0];
    if (!shell || !running) return;

    $progress.addClass('is-step-running');
    $(shell).removeClass('is-ring-full').addClass('is-loading');
    await delay(duration);
    if (!running) return;

    $(shell).removeClass('is-loading').addClass('is-ring-full');
    await delay(RING_FULL_MS);
    if (!running) return;

    $(shell).removeClass('is-ring-full');
    $progress.removeClass('is-step-running');
  };

  const playCompletePop = (step) => {
    const node = $progress.find(`[data-step="${step}"] .main-ai-progress__node`)[0];
    if (!node || !running) return Promise.resolve();

    if (prefersReducedMotion()) return delay(120);

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        node.classList.remove('is-complete-pop');
        resolve();
      };

      node.classList.remove('is-complete-pop');
      void node.offsetWidth;
      node.classList.add('is-complete-pop');
      node.addEventListener('animationend', finish, { once: true });
      timers.push(window.setTimeout(finish, 480));
    });
  };

  const runProgress = async (query) => {
    if (running) return;
    running = true;
    $progress.removeClass('is-stopped');
    $('body').addClass('is-main-ai-progress');
    resetShells();

    if (!overlay.open) overlay.showModal();

    if (prefersReducedMotion()) {
      $titleEl.text(PHASES[PHASES.length - 1].title);
      $descEl.text(PHASES[PHASES.length - 1].desc);
      $progress.attr('data-active-step', '5');
      await delay(PHASES[PHASES.length - 1].duration);
      if (running) finishSearch(query);
      return;
    }

    await setPhaseCopy(PHASES[0], { animate: false });
    $progress.attr('data-active-step', '1');

    for (let step = 1; step <= WORK_STEPS; step += 1) {
      if (!running) return;

      if (step > 1) {
        await delay(STEP_HANDOFF_MS);
        if (!running) return;
        await setPhaseCopy(PHASES[step - 1]);
        if (!running) return;
      }

      $progress.attr('data-active-step', String(step));
      await runStepLoading(step, PHASES[step - 1].duration);
      if (!running) return;

      $progress.attr('data-active-step', String(step + 1));
      await playCompletePop(step);
    }

    if (!running) return;

    await delay(STEP_HANDOFF_MS);
    if (!running) return;
    await setPhaseCopy(PHASES[4]);
    $progress.attr('data-active-step', '5');
    $progress.addClass('is-step-running');
    await delay(PHASES[4].duration);
    $progress.removeClass('is-step-running');

    if (running) finishSearch(query);
  };

  $form.on('submit', (event) => {
    const query = $input.val().trim();
    if (!query) {
      event.preventDefault();
      $input.trigger('focus');
      return;
    }
    event.preventDefault();
    runProgress(query);
  });

  $stopBtn.on('click', () => {
    closeOverlay();
  });

  $overlay.on('cancel', (event) => {
    event.preventDefault();
    closeOverlay();
  });
});
