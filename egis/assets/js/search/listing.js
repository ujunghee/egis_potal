/**
 * 통합검색 구분별 화면(데이터셋·Open API·문의하기·AI) 공용 동작 (jQuery).
 *
 *   SearchListing.init('[data-openapi-list]', items);
 *   SearchListing.initApplied();
 */
window.SearchListing = {
  escape(value) {
    return String(value).replace(/[&<>"']/g, (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char],
    );
  },

  initApplied() {
    const $filterPanel = jQuery('[data-filter-panel]');
    const $appliedBox = jQuery('[data-applied-filter]');
    const $appliedList = jQuery('[data-applied-list]');
    const $appliedCount = jQuery('[data-applied-count]');
    if (
      !$filterPanel.length ||
      !$appliedBox.length ||
      !$appliedList.length ||
      !$appliedCount.length
    ) {
      return;
    }

    const escape = this.escape;

    const renderApplied = () => {
      const checked = $filterPanel.find('input[type="checkbox"]:checked').get();
      $appliedCount.text(String(checked.length));
      $appliedBox.prop('hidden', checked.length === 0);
      $appliedList.html(
        checked
          .map((checkbox) => {
            const label =
              jQuery(`label[for="${checkbox.id}"]`).text().trim() || checkbox.value;
            return `
      <li>
        <div class="chip border-slate-500 border h-36 w-fit px-12 radius-md-6 gap-6 flex align-center justify-center bg-white">
          <span class="body2-m-16 color-slate-700">${escape(label)}</span>
          <button type="button" class="chips-close-icon" data-applied-remove="${escape(checkbox.id)}">
            <span class="blind">${escape(label)} 필터 삭제</span>
          </button>
        </div>
      </li>`;
          })
          .join(''),
      );
    };

    $filterPanel.on('change', (event) => {
      if (jQuery(event.target).is('input[type="checkbox"]')) renderApplied();
    });

    $appliedList.on('click', (event) => {
      const $btn = jQuery(event.target).closest('[data-applied-remove]');
      if (!$btn.length) return;

      const $checkbox = jQuery(`#${$btn.data('appliedRemove')}`);
      if (!$checkbox.length) return;

      $checkbox.prop('checked', false);
      $checkbox.trigger('change');
      renderApplied();
    });

    jQuery('[data-applied-reset]').on('click', () => {
      $filterPanel.find('input[type="checkbox"]:checked').each(function () {
        jQuery(this).prop('checked', false).trigger('change');
      });
      renderApplied();
    });

    jQuery('[data-search-filter-reset]').on('click', renderApplied);

    renderApplied();
  },

  init(listSelector, items, options = {}) {
    const $list = jQuery(listSelector);
    if (!$list.length || !window.DatasetCard) return;

    const enableQuickMenu =
      options.quickMenu !== false && jQuery('[data-quick-nav]').length;
    const cardOptions = {
      showCheckbox: false,
      showBookmark: enableQuickMenu,
      pinAttr: false,
    };
    let view = 'card';

    const isFavorited = (id) =>
      enableQuickMenu && window.SearchQuick?.state?.favorites?.has(id);

    const renderList = () => {
      const isList = view === 'list';
      $list.attr(
        'class',
        isList
          ? 'tp-cards tp-list flex flex-col border-t border-slate-200 mt-24'
          : 'tp-cards mt-24',
      );
      $list.html(
        items
          .map((item) =>
            isList
              ? DatasetCard.renderListRow(item, {
                  ...cardOptions,
                  favorited: isFavorited(item.id),
                  showPortalLink: true,
                })
              : DatasetCard.render(item, {
                  ...cardOptions,
                  favorited: isFavorited(item.id),
                  showPortalLink: true,
                }),
          )
          .join(''),
      );
    };

    if (enableQuickMenu && window.SearchQuick) {
      const tab = document.body.dataset.searchTab || 'dataset';
      window.SearchQuickNav = SearchQuick.initMenu({
        items,
        recentStorageKey: `egis-search-${tab}-recent-ids`,
        onListChange: renderList,
      });
    }

    $list.on('click', (event) => {
      const $favBtn = jQuery(event.target).closest('[data-fav-id]');
      if ($favBtn.length && enableQuickMenu && window.SearchQuick) {
        event.preventDefault();
        event.stopPropagation();
        const id = $favBtn.data('favId');
        SearchQuick.setFavorite(id, !SearchQuick.state.favorites.has(id));
        return;
      }
      const $card = jQuery(event.target).closest('[data-item]');
      if (
        $card.length &&
        enableQuickMenu &&
        window.SearchQuick &&
        !jQuery(event.target).closest('.tp-card__bookmark').length
      ) {
        SearchQuick.addRecent($card.data('item'));
      }
    });

    jQuery('[data-view]').on('click', function () {
      const $btn = jQuery(this);
      view = $btn.data('view');
      jQuery('[data-view]').each(function () {
        const $entry = jQuery(this);
        const active = $entry.is($btn);
        $entry.toggleClass('active', active);
        $entry.attr('aria-pressed', String(active));
      });
      renderList();
    });

    this.initApplied();
    renderList();
  },
};
