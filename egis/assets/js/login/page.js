/** 로그인 페이지 — 방식 선택(프로토타입). 실제 인증은 개발에서 붙입니다. */
function initLoginPage() {
  const root = document.querySelector('.login__card');
  if (!root) return;

  if (window.EgisPrototypeAuth?.isLoggedIn()) {
    const prefix = window.EgisPagesRoot?.getPagesPrefix?.() || '../';
    location.href = `${prefix}main/index.html`;
    return;
  }

  const goNext = () => {
    window.EgisPrototypeAuth?.setLoggedIn(true);

    const prefix = window.EgisPagesRoot?.getPagesPrefix?.() || '../';
    const next = new URLSearchParams(location.search).get('next');
    const safeNext = next && /^\.\/|^\.\.\//.test(next) ? next : `${prefix}main/index.html`;
    location.href = safeNext;
  };

  root.querySelectorAll('[data-login-method]').forEach((button) => {
    button.addEventListener('click', goNext);
  });

  const layer = document.getElementById('anyid_information');
  const backdrop = layer?.querySelector('.anyid-information-back');
  const openBtn = root.querySelector('[data-login-anyid-open]');
  const isOpen = () => layer?.classList.contains('shown');

  const openHelp = () => {
    if (!layer || isOpen()) return;
    layer.hidden = false;
    layer.classList.add('shown', 'in');
    backdrop?.classList.add('in');
    layer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    layer.querySelector('.anyid-information-content')?.focus();
  };

  const closeHelp = () => {
    if (!layer || !isOpen()) return;
    layer.classList.remove('shown', 'in');
    backdrop?.classList.remove('in');
    layer.setAttribute('aria-hidden', 'true');
    layer.hidden = true;
    document.body.style.overflow = '';
    openBtn?.focus();
  };

  openBtn?.addEventListener('click', openHelp);
  layer?.querySelectorAll('.close-anyid-information').forEach((button) => {
    button.addEventListener('click', closeHelp);
  });
  layer?.addEventListener('click', (event) => {
    if (event.target === layer || event.target === backdrop) closeHelp();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) closeHelp();
  });
}

window.initLoginPage = initLoginPage;
initLoginPage();
