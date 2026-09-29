/**
 * 프로토타입용 로그인 전환 + 비로그인 안내 팝업.
 * 웹 헤더·지도 헤더 모두 [data-header-login] / [data-header-mypage] 를 쓴다.
 * 로그인 화면(`pages/login/`)에서 상태만 바꾸고, sessionStorage 로 유지한다.
 *
 * fragment-loader 가 모든 화면에서 자동으로 싣는다.
 */
window.EgisPrototypeAuth = (() => {
  const STORAGE_KEY = 'egis-prototype-logged-in';
  let loggedIn = false;

  const DEFAULT_DESC = '관심 데이터는 로그인 후 이용할 수 있습니다.';

  const loginBtn = document.querySelector('[data-header-login]');
  const mypage = document.querySelector('[data-header-mypage]');

  const closeMypageMenu = () => {
    const menu = document.getElementById('header-mypage-menu');
    const toggle = document.querySelector('[data-header-mypage-toggle]');
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
  };

  const setLoggedIn = (isLoggedIn) => {
    loggedIn = Boolean(isLoggedIn);
    try {
      if (loggedIn) sessionStorage.setItem(STORAGE_KEY, '1');
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sessionStorage 없는 환경 */
    }
    if (loginBtn) loginBtn.hidden = loggedIn;
    if (mypage) mypage.hidden = !loggedIn;
    if (!loggedIn) closeMypageMenu();
  };

  const isLoggedIn = () => loggedIn;

  /** 비로그인 안내 */
  const ensureModal = () => {
    let modal = document.querySelector('[data-login-required-modal]');
    if (modal) return modal;

    modal = document.createElement('dialog');
    modal.className = 'login-required-modal';
    modal.setAttribute('data-login-required-modal', '');
    modal.setAttribute('aria-labelledby', 'login-required-title');
    modal.setAttribute('aria-describedby', 'login-required-desc');
    modal.innerHTML = `
      <div class="flex flex-col gap-24 align-center">
        <div class="flex flex-col gap-12 align-center w-full">
          <i class="alert-icon-36" aria-hidden="true"></i>
          <div class="flex flex-col gap-4 align-center w-full text-center">
            <p id="login-required-title" class="body1-sb-18 color-slate-900">로그인이 필요합니다.</p>
            <p id="login-required-desc" class="body2-r-16 color-slate-700">${DEFAULT_DESC}</p>
          </div>
        </div>
        <div class="flex align-center justify-center gap-8 w-full">
          <button type="button" class="border-slate-button-40 login-required-modal__close" data-login-required-close>닫기</button>
          <button type="button" class="blue-button-40" data-login-required-submit>로그인 하기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('[data-login-required-close]')?.addEventListener('click', () => modal.close());
    modal.querySelector('[data-login-required-submit]')?.addEventListener('click', () => {
      modal.close();
      const prefix = window.EgisPagesRoot?.getPagesPrefix?.() || '../';
      location.href = `${prefix}login/index.html`;
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });

    return modal;
  };

  /**
   * @param {{ message?: string }} [options]
   */
  const showLoginRequired = (options = {}) => {
    const modal = ensureModal();
    const desc = modal.querySelector('#login-required-desc');
    if (desc) desc.textContent = options.message || DEFAULT_DESC;

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  };

  try {
    loggedIn = sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    loggedIn = false;
  }
  setLoggedIn(loggedIn);

  if (loginBtn || mypage) {
    document.querySelector('[data-header-logout]')?.addEventListener('click', () => {
      closeMypageMenu();
      setLoggedIn(false);
    });
  }

  // 관심(북마크) 클릭 — 비회원이면 즐겨찾기 대신 로그인 안내
  document.addEventListener(
    'click',
    (e) => {
      if (isLoggedIn()) return;
      const btn = e.target.closest('[data-fav-id]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      showLoginRequired();
    },
    true,
  );

  // data-require-login — 비로그인이면 팝업만 표시 (로그인 후 이동은 하지 않음)
  document.addEventListener(
    'click',
    (e) => {
      if (isLoggedIn()) return;
      const link = e.target.closest('[data-require-login]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      showLoginRequired({
        message: link.dataset.loginMessage || '로그인 후 이용할 수 있습니다.',
      });
    },
    true,
  );

  return { setLoggedIn, isLoggedIn, showLoginRequired };
})();
