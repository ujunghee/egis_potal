/**
 * 공용 토스트
 *
 * 마크업: shared/fragments/toast.html (레이아웃 body 끝에 한 번)
 * 컨테이너(.toast-stack)가 있으면 그 안에 항목을 넣고, 없으면 body 끝에 만듭니다.
 *
 *   Toast.warning('변경사항을 저장했습니다.');                   // 노란 경고 아이콘 (Figma 1960:5238)
 *   Toast.error('파일을 첨부하지 못했습니다. 잠시 후 다시 시도해 주세요.'); // 빨간 에러 아이콘
 *   Toast.show('관심 데이터에 저장했습니다.');                    // 아이콘 없음
 *   Toast.show('메시지', { duration: 5000 });                    // 기본 3000ms
 *   Toast.show('메시지', { duration: Infinity });                // 자동으로 닫지 않음
 *   Toast.hide();                                               // 떠 있는 토스트 전부 닫기
 *
 * 같은 메시지가 이미 떠 있으면 새로 쌓지 않고 노출 시간만 다시 채웁니다.
 * 검증 실패처럼 연속으로 호출되는 상황에서 토스트가 겹치지 않습니다.
 *
 * 이 파일은 fragment-loader.js 가 모든 화면에서 자동으로 싣습니다.
 * 페이지 스크립트 목록에 따로 넣지 않아도 FragmentLoader.loadAll() 이후면 바로 호출할 수 있습니다.
 */
window.Toast = (() => {
  const DEFAULT_DURATION = 3000;
  const VARIANTS = ['default', 'warning', 'error'];
  // 화면마다 상단을 차지하는 요소가 다르다. 웹 헤더, 지도 헤더, 상세 페이지 sticky 바.
  // 높이도 반응형으로 바뀌므로 띄울 때마다 다시 잰다.
  const TOP_BAR_SELECTOR = '.header, .map-header, .tp-detail__sticky-bar';

  let stack = null;

  /** 상단 바 중 가장 아래쪽 좌표를 --toast-top 에 넣어 그 아래로 내려오게 한다. */
  const alignBelowHeader = (root) => {
    const bottom = [...document.querySelectorAll(TOP_BAR_SELECTOR)].reduce(
      (lowest, el) => Math.max(lowest, el.getBoundingClientRect().bottom),
      0,
    );
    root.style.setProperty('--toast-top', `${bottom}px`);
  };

  const getStack = () => {
    if (stack?.isConnected) {
      alignBelowHeader(stack);
      return stack;
    }

    stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }

    alignBelowHeader(stack);
    return stack;
  };

  const close = (toast) => {
    clearTimeout(toast._closeTimer);
    if (!toast.classList.contains('is-open')) {
      toast.remove();
      return;
    }

    toast.classList.remove('is-open');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  const scheduleClose = (toast, duration) => {
    clearTimeout(toast._closeTimer);
    if (duration === Infinity) return;

    toast._closeTimer = setTimeout(() => close(toast), duration);
  };

  const show = (message, { variant = 'default', duration = DEFAULT_DURATION } = {}) => {
    if (!message) return null;

    const kind = VARIANTS.includes(variant) ? variant : 'default';
    const root = getStack();

    // 같은 문구가 이미 떠 있으면 노출 시간만 갱신
    const opened = [...root.children].find((el) => el.dataset.message === message);
    if (opened) {
      scheduleClose(opened, duration);
      return opened;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${kind}`;
    toast.dataset.message = message;

    if (kind !== 'default') {
      toast.insertAdjacentHTML('beforeend', '<i class="toast__icon" aria-hidden="true"></i>');
    }

    const text = document.createElement('p');
    text.className = 'toast__text body1-m-18 color-white';
    text.textContent = message;
    toast.appendChild(text);

    root.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-open'));
    scheduleClose(toast, duration);

    return toast;
  };

  return {
    show,
    warning: (message, options) => show(message, { ...options, variant: 'warning' }),
    error: (message, options) => show(message, { ...options, variant: 'error' }),
    hide: () => {
      [...getStack().children].forEach(close);
    },
  };
})();
