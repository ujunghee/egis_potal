/** 메인 — 인기검색어 카드 (jQuery) */
jQuery(function ($) {
  const $heroRank = $('.main-hero-rank');
  const $heroRankClose = $heroRank.find('.main-hero-rank__card-head');

  const closeHeroRank = () => {
    if (!$heroRank.length || !$heroRank[0].open) return;
    $heroRank.removeAttr('open');
  };

  $heroRankClose.on('click', (event) => {
    event.preventDefault();
    closeHeroRank();
  });

  /** summary 클릭 직후 document click이 바깥 클릭으로 처리되지 않도록 */
  let ignoreNextOutsideClose = false;

  $heroRank.on('toggle', () => {
    if (!$heroRank[0].open) return;
    ignoreNextOutsideClose = true;
    requestAnimationFrame(() => {
      ignoreNextOutsideClose = false;
    });
  });

  $(document).on('click', (event) => {
    if (!$heroRank.length || !$heroRank[0].open || ignoreNextOutsideClose) return;
    if ($heroRank[0].contains(event.target)) return;
    closeHeroRank();
  });

  $(document).on('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeHeroRank();
  });
});
