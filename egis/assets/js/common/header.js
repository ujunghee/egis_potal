const headerNav = document.querySelector('.header-nav');
const headerDrawer = document.getElementById('header-drawer');
const searchPanel = document.getElementById('header-search-panel');
const searchOpenBtn = document.querySelector('[data-header-search-open]');
const searchInput = document.getElementById('header-search-input');
const searchEmpty = document.querySelector('[data-header-search-empty]');
const searchRecentList = document.querySelector('[data-header-search-recent-list]');
const drawerOpenBtn = document.querySelector('[data-header-drawer-open]');
const mypage = document.querySelector('[data-header-mypage]');
const mypageToggle = document.querySelector('[data-header-mypage-toggle]');
const mypageMenu = document.getElementById('header-mypage-menu');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

window.EgisPagesRoot?.markCurrentNav();

function closeNavItems() {
  document.querySelectorAll('.header-nav__item.active').forEach((item) => {
    item.classList.remove('active');
    item.querySelector('[data-header-nav-toggle]')?.setAttribute('aria-expanded', 'false');
  });
}

function openNavItem(item) {
  const trigger = item.querySelector('[data-header-nav-toggle]');
  if (!trigger) return;
  closeMypageMenu();
  document.querySelectorAll('.header-nav__item.active').forEach((other) => {
    if (other === item) return;
    other.classList.remove('active');
    other.querySelector('[data-header-nav-toggle]')?.setAttribute('aria-expanded', 'false');
  });
  item.classList.add('active');
  trigger.setAttribute('aria-expanded', 'true');
}

function closeNavItem(item) {
  item.classList.remove('active');
  item.querySelector('[data-header-nav-toggle]')?.setAttribute('aria-expanded', 'false');
}

// GNB — 데스크톱은 호버, 터치 등은 클릭
document.querySelectorAll('.header-nav__item').forEach((item) => {
  const trigger = item.querySelector('[data-header-nav-toggle]');
  if (!trigger) return;

  if (canHover) {
    item.addEventListener('mouseenter', () => openNavItem(item));
    item.addEventListener('mouseleave', () => closeNavItem(item));
    item.addEventListener('focusin', () => openNavItem(item));
    item.addEventListener('focusout', (e) => {
      if (item.contains(e.relatedTarget)) return;
      closeNavItem(item);
    });
    return;
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = item.classList.contains('active');
    closeNavItems();
    closeMypageMenu();
    if (!isOpen) openNavItem(item);
  });
});

// 마이페이지 드롭다운 — 클릭
function closeMypageMenu() {
  if (!mypageMenu || mypageMenu.hidden) return;
  mypageMenu.hidden = true;
  mypageToggle?.setAttribute('aria-expanded', 'false');
}

mypageToggle?.addEventListener('click', (e) => {
  e.stopPropagation();
  const willOpen = mypageMenu.hidden;
  closeNavItems();
  mypageMenu.hidden = !willOpen;
  mypageToggle.setAttribute('aria-expanded', String(willOpen));
});

// 통합검색
function openSearch() {
  closeNavItems();
  closeMypageMenu();
  searchPanel.hidden = false;
  searchOpenBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  searchInput.focus();
}

function closeSearch() {
  searchPanel.hidden = true;
  searchOpenBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  searchOpenBtn.focus();
}

searchOpenBtn?.addEventListener('click', openSearch);
document.querySelectorAll('[data-header-search-close]').forEach((btn) => btn.addEventListener('click', closeSearch));

function syncSearchEmpty() {
  const hasItems = searchRecentList?.children.length > 0;
  searchRecentList?.classList.toggle('hidden', !hasItems);
  searchEmpty?.classList.toggle('hidden', hasItems);
}

document.querySelector('[data-header-search-clear]')?.addEventListener('click', () => {
  searchRecentList.innerHTML = '';
  syncSearchEmpty();
});

searchRecentList?.addEventListener('click', (e) => {
  e.target.closest('[data-header-search-recent-remove]')?.closest('li')?.remove();
  syncSearchEmpty();
});

syncSearchEmpty();

// 드로어
function openDrawer() {
  headerDrawer.classList.add('active');
  drawerOpenBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  headerDrawer.classList.remove('active');
  drawerOpenBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

drawerOpenBtn?.addEventListener('click', openDrawer);
document.querySelectorAll('[data-header-drawer-close]').forEach((btn) => btn.addEventListener('click', closeDrawer));

document.querySelectorAll('.header-drawer__menu-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const item = toggle.closest('.header-drawer__menu-item');
    const isOpen = item.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

// 공통 — 마이페이지는 바깥 클릭으로 닫기 / GNB는 터치(클릭) 모드에서만
document.addEventListener('click', (e) => {
  if (!canHover && headerNav && !headerNav.contains(e.target)) closeNavItems();
  if (mypage && !mypage.contains(e.target)) closeMypageMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (searchPanel && !searchPanel.hidden) { closeSearch(); return; }
  if (headerDrawer?.classList.contains('active')) { closeDrawer(); return; }
  if (mypageMenu && !mypageMenu.hidden) { closeMypageMenu(); mypageToggle?.focus(); return; }
  closeNavItems();
});
