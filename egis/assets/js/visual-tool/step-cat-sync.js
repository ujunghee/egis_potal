/** 단계별 확장(1~4) ↔ 분류 선택 트리 체크박스 동기화 (jQuery) */
jQuery(function ($) {
  /**
   * @param {Element|jQuery|null} catTree [data-vt-rel-tree]
   * @param {number|string} step 1=대분류 … 4=데이터셋
   * @param {string} activeCat data-vt-cat (water|nature|carbon|energy)
   */
  const syncVtCatTreeFromStep = (catTree, step, activeCat) => {
    const $tree = catTree instanceof jQuery ? catTree : $(catTree);
    if (!$tree.length) return;

    const maxDepth = Math.min(4, Math.max(1, Number(step) || 4));
    const cat = activeCat || 'water';

    $tree.find('.vt-relation__tree-item').each(function () {
      const $item = $(this);
      const $input = $item.find('input[type="checkbox"]');
      if (!$input.length) return;
      const depth = Number($item.attr('data-depth')) || 1;
      const itemCat = $item.attr('data-vt-cat');
      $input.prop('checked', itemCat === cat && depth <= maxDepth);
    });
  };

  window.syncVtCatTreeFromStep = syncVtCatTreeFromStep;
});
