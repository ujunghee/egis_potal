/** 통합검색 — 관심·최근 본 (빠른 메뉴, jQuery) */
window.SearchQuick = window.SearchQuick || {};

jQuery(function ($) {
  const loadRecentIds = (key) => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  SearchQuick.state = SearchQuick.state || {
    favorites: new Set(),
    recent: [],
    favView: 'card',
    recentStorageKey: 'egis-search-recent-ids',
    onListChange: null,
  };

  SearchQuick.items = SearchQuick.items || [];

  SearchQuick.configure = ({ items, recentStorageKey, onListChange }) => {
    SearchQuick.items = items || [];
    if (recentStorageKey) SearchQuick.state.recentStorageKey = recentStorageKey;
    SearchQuick.state.onListChange = onListChange || null;
    SearchQuick.state.recent = loadRecentIds(SearchQuick.state.recentStorageKey)
      .map((id) => SearchQuick.items.find((item) => String(item.id) === String(id)))
      .filter(Boolean);
  };

  SearchQuick.renderFavCard = (item) =>
    DatasetCard.render(item, {
      showCheckbox: false,
      favorited: true,
      className: 'tp-fav-card',
    });

  SearchQuick.renderFavRow = (item) => {
    const escape = DatasetCard.escape;
    const tags = item.tags || [];
    const tagHtml = tags
      .map(
        (tag, i) =>
          `<li><span class="meta-tag${i === 0 ? ' meta-tag--active' : ''}" title="${escape(tag)}">${escape(tag)}</span></li>`,
      )
      .join('');
    return `
    <li class="tp-fav-row flex align-center gap-16 border-b border-slate-200" data-item="${item.id}">
      <a href="javascript:void(0);" class="flex flex-1 justify-between align-center gap-16 py-16">
        <div class="flex flex-col gap-10">
          <div class="flex align-center gap-8"><ul class="meta-tag-list flex-none" title="${escape(tags.join(', '))}">${tagHtml}</ul><h3 class="body1-sb-18 color-slate-900 tp-card__title" title="${escape(item.title)}">${escape(item.title)}</h3></div>
          <p class="tp-card__meta body3-m-14 color-slate-700" title="${escape(`${item.date} 업데이트 | ${item.provider} | ${item.format}`)}"><time>${item.date}</time><span> 업데이트 </span><span class="color-slate-200">|</span><span> ${item.provider}</span><span class="color-slate-200"> | </span><span class="color-slate-900">${item.format}</span></p>
        </div>
        <div class="flex align-center gap-6 flex-none"><i class="topical-eye-open-icon" aria-hidden="true"></i><span class="blind">조회수</span><span class="body3-r-14 color-slate-400">${item.views}</span></div>
      </a>
      <button type="button" class="tp-card__bookmark tp-fav-row__bookmark is-active" aria-pressed="true" data-fav-id="${item.id}"><i class="tp-book-icon" aria-hidden="true"></i><span class="blind">즐겨찾기 삭제</span></button>
    </li>`;
  };

  SearchQuick.renderRecentCard = (item) =>
    DatasetCard.render(item, {
      showCheckbox: false,
      favorited: SearchQuick.state.favorites.has(item.id),
      className: 'tp-recent-card',
      infoGapClass: 'gap-4',
    });

  SearchQuick.renderFavorites = () => {
    const { state, items } = SearchQuick;
    const favItems = items.filter((item) => state.favorites.has(item.id));
    $('[data-fav-count], [data-fav-modal-count]').text(favItems.length);
    const $list = $('[data-fav-list]');
    if (!$list.length) return;
    $list.toggleClass('is-list', state.favView === 'list');
    $list.html(
      favItems.length
        ? favItems.map(state.favView === 'list' ? SearchQuick.renderFavRow : SearchQuick.renderFavCard).join('')
        : '<li class="tp-fav-empty"><p class="heading9-sb-22 color-slate-500">등록된 관심 데이터가 없습니다.</p></li>',
    );
  };

  SearchQuick.renderRecent = () => {
    const { state } = SearchQuick;
    const $panel = $('[data-recent-panel]');
    const $list = $('[data-recent-list]');
    const $count = $('[data-recent-count]');
    if ($count.length) $count.text(state.recent.length);
    $panel.toggleClass('is-empty', state.recent.length === 0);
    if (!$list.length) return;
    $list.html(
      state.recent.length
        ? state.recent.map(SearchQuick.renderRecentCard).join('')
        : '<li class="tp-recent-empty"><p class="heading9-sb-22 color-slate-500">최근 본 데이터가 없습니다.</p></li>',
    );
  };

  SearchQuick.addRecent = (itemId) => {
    const item = SearchQuick.items.find((entry) => String(entry.id) === String(itemId));
    if (!item) return;
    const { state } = SearchQuick;
    state.recent = [item, ...state.recent.filter((entry) => entry.id !== item.id)].slice(0, 8);
    try {
      sessionStorage.setItem(
        state.recentStorageKey,
        JSON.stringify(state.recent.map((entry) => entry.id)),
      );
    } catch {
      /* ignore */
    }
    SearchQuick.renderRecent();
  };

  SearchQuick.setFavorite = (itemId, active) => {
    const id = itemId;
    const { state } = SearchQuick;
    if (active) {
      if (state.favorites.has(id)) return;
      if (state.favorites.size >= 10) {
        window.Toast?.warning(
          '관심 데이터는 최대 10개까지 등록할 수 있습니다. 기존 항목을 삭제한 후 다시 시도해 주세요.',
        );
        return;
      }
      state.favorites.add(id);
    } else {
      state.favorites.delete(id);
    }
    SearchQuick.renderFavorites();
    SearchQuick.renderRecent();
    state.onListChange?.();
  };

  SearchQuick.initFavorite = () => {
    const $modal = $('[data-fav-modal]');
    $('[data-fav-open]').on('click', () => {
      SearchQuick.renderFavorites();
      $modal[0]?.showModal();
    });
    $('[data-fav-close]').on('click', () => $modal[0]?.close());
    $modal.on('click', (e) => {
      if (e.target === $modal[0]) $modal[0].close();
      const $btn = $(e.target).closest('[data-fav-id]');
      if ($btn.length) SearchQuick.setFavorite($btn.data('favId'), false);
    });

    $('[data-fav-view]').on('click', function () {
      const $btn = $(this);
      SearchQuick.state.favView = $btn.data('favView');
      $('[data-fav-view]').each(function () {
        const $item = $(this);
        const isActive = $item.is($btn);
        $item.toggleClass('active', isActive);
        $item.attr('aria-pressed', String(isActive));
      });
      SearchQuick.renderFavorites();
    });
  };

  SearchQuick.initRecent = () => {
    const $toggle = $('[data-recent-open]');
    const $panel = $('[data-recent-panel]');

    const openPanel = () => {
      if (!$panel.length || !$toggle.length) return;
      $panel.prop('hidden', false);
      $toggle.attr('aria-expanded', 'true');
      SearchQuick.renderRecent();
      requestAnimationFrame(() => $panel.addClass('is-open'));
    };

    const close = () => {
      if (!$panel.length || !$toggle.length) return;
      $panel.removeClass('is-open').prop('hidden', true);
      $toggle.attr('aria-expanded', 'false');
    };

    $toggle.on('click', (e) => {
      e.stopPropagation();
      if (!$panel.length) return;
      if ($panel.prop('hidden')) openPanel();
      else close();
    });

    $('[data-recent-close]').on('click', (e) => {
      e.stopPropagation();
      close();
    });

    $panel.on('click', (e) => {
      e.stopPropagation();
      const $btn = $(e.target).closest('[data-fav-id]');
      if (!$btn.length) return;
      const id = $btn.data('favId');
      SearchQuick.setFavorite(id, !SearchQuick.state.favorites.has(id));
    });

    $(document).on('click', (e) => {
      if (!$panel.length || $panel.prop('hidden')) return;
      if ($panel[0].contains(e.target) || $toggle[0]?.contains(e.target)) return;
      close();
    });
  };

  SearchQuick.initMenu = (options) => {
    SearchQuick.configure(options);
    SearchQuick.renderFavorites();
    SearchQuick.renderRecent();
    const quickNav = SearchQuick.initQuickNav?.();
    SearchQuick.initFavorite();
    SearchQuick.initRecent();
    return quickNav;
  };
});
