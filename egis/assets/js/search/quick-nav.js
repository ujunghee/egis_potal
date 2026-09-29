/** 통합검색 — 빠른 메뉴 스크롤 고정 (jQuery) */
window.SearchQuick = window.SearchQuick || {};

SearchQuick.initQuickNav = () => {
  const $dock = jQuery('[data-quick-nav]');
  const $layout = jQuery('.search-listing.tp-layout, .search-ai-shell.tp-layout').first();
  const $content = $layout
    .find('.search-listing__content, .tp-content, .search-ai__quick-anchor')
    .first();
  const $header = jQuery('.header');
  if (!$dock.length || !$layout.length || !$content.length || !$header.length) return null;

  const dock = $dock[0];
  const layout = $layout[0];
  const content = $content[0];
  const header = $header[0];

  const TOP_GAP = 16;
  let anchorTop = 0;
  let fixedLeft = null;

  const clear = () => {
    $dock.removeClass('is-fixed').css({ top: '', left: '' });
    fixedLeft = null;
  };

  const measure = () => {
    clear();
    anchorTop = content.getBoundingClientRect().top + window.scrollY;
  };

  const update = () => {
    const headerH = header.getBoundingClientRect().height;
    if (window.scrollY + headerH + TOP_GAP < anchorTop) {
      clear();
      return;
    }

    const layoutRect = layout.getBoundingClientRect();
    const dockH = $dock.find('.tp-quick')[0]?.offsetHeight || dock.offsetHeight;
    let top = headerH + TOP_GAP;
    if (top + dockH > layoutRect.bottom) {
      top = Math.max(headerH + TOP_GAP, layoutRect.bottom - dockH);
    }

    if (!$dock.hasClass('is-fixed')) {
      fixedLeft = dock.getBoundingClientRect().left;
    }

    $dock.addClass('is-fixed').css({ left: `${fixedLeft}px`, top: `${top}px` });
  };

  measure();
  update();
  jQuery(window).on('scroll', update);
  jQuery(window).on('resize', () => {
    measure();
    update();
  });

  jQuery('[data-filter-panel]').on('click', () => {
    requestAnimationFrame(() => {
      measure();
      update();
    });
  });

  return {
    remeasure: () => {
      measure();
      update();
    },
  };
};
