/** 마이페이지 LNB — 현재 경로에 맞춰 활성 메뉴 표시 */
(() => {
  const path = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');

  let active = 'favorites';
  if (path.includes('/openapi/')) active = 'openapi';
  else if (path.includes('/inquiry/')) active = 'inquiry';
  else if (path.includes('/authkey/')) active = 'authkey';
  else if (path.includes('/download/')) active = 'download';

  document.querySelectorAll('[data-mypage-nav]').forEach((link) => {
    const isActive = link.getAttribute('data-mypage-nav') === active;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
})();
