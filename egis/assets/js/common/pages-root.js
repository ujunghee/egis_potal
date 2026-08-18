/** pages/ 기준 상대 경로 — 공유 fragment 링크·에셋 경로 보정
 *
 * Fragment 교차 링크 규칙:
 *   href="../section/page.html"  ← pages/ 기준 한 단계 (../ 하나만)
 *   resolveLinks가 현재 페이지 깊이에 맞게 ../ 개수를 보정한다.
 *
 * 에셋 링크:
 *   href/src 가 ../assets/ · ../../assets/ · ../../../assets/ 어느 깊이든
 *   현재 페이지 기준 assetsPrefix 로 다시 맞춘다.
 */
(() => {
  const getPagesPrefix = () => {
    const path = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
    const marker = '/pages/';
    const index = path.indexOf(marker);
    if (index === -1) return '../';

    const remainder = path.slice(index + marker.length);
    const segments = remainder.split('/').filter(Boolean);

    if (segments.length && segments[segments.length - 1].includes('.')) {
      segments.pop();
    }

    return segments.length ? '../'.repeat(segments.length) : './';
  };

  const getAssetsPrefix = () => `${getPagesPrefix()}../assets/`;

  const stripToAssets = (value) => {
    const match = String(value || '').match(/^(?:\.\.\/)+assets\/(.*)$/);
    return match ? match[1] : null;
  };

  const resolveLinks = (root = document) => {
    const pagesPrefix = getPagesPrefix();
    const assetsPrefix = getAssetsPrefix();

    root.querySelectorAll('a[href^="../"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const assetRest = stripToAssets(href);
      if (assetRest !== null) {
        link.setAttribute('href', assetsPrefix + assetRest);
        return;
      }

      // pages/ 기준 한 단계: ../section/...
      link.setAttribute('href', pagesPrefix + href.slice(3));
    });

    root.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      const assetRest = stripToAssets(src);
      if (assetRest === null) return;
      img.setAttribute('src', assetsPrefix + assetRest);
    });
  };

  const markCurrentNav = (root = document) => {
    const currentPath = window.location.pathname;

    root
      .querySelectorAll('.header-nav__link[href], .header-nav__sub-link[href], .header-mypage__link[href]')
      .forEach((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname;
      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  window.EgisPagesRoot = {
    getPagesPrefix,
    getAssetsPrefix,
    resolveLinks,
    markCurrentNav,
  };
})();
