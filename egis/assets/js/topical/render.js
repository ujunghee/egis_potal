/** 주제별지도 카드·목록 렌더 — 카드는 DatasetCard, 리스트형은 기존 행 마크업 */
(function () {
  const { items, state, escape } = Topical;

  const tagHtml = (tags) =>
    tags
      .map(
        (tag, i) =>
          `<li><span class="meta-tag${i === 0 ? ' meta-tag--active' : ''}" title="${escape(tag)}">${tag}</span></li>`,
      )
      .join('');

  Topical.renderCard = (item, { inPin = false } = {}) =>
    DatasetCard.render(item, {
      checkboxId: inPin ? `pin-item-${item.id}` : `item-${item.id}`,
      checked: state.pinned.has(item.id),
      favorited: state.favorites.has(item.id),
      showCheckbox: true,
      pinAttr: true,
    });

  Topical.renderListRow = (item, { inPin = false } = {}) =>
    DatasetCard.renderListRow(item, {
      checkboxId: inPin ? `pin-list-item-${item.id}` : `list-item-${item.id}`,
      checked: state.pinned.has(item.id),
      favorited: state.favorites.has(item.id),
      showCheckbox: true,
      showBookmark: true,
      pinAttr: true,
    });

  Topical.renderFavCard = (item) =>
    DatasetCard.render(item, {
      showCheckbox: false,
      favorited: true,
      className: 'tp-fav-card',
    });

  Topical.renderFavRow = (item) => `
    <li class="tp-fav-row flex align-center gap-16 border-b border-slate-200" data-item="${item.id}">
      <a href="javascript:void(0);" class="flex flex-1 justify-between align-center gap-16 py-16">
        <div class="flex flex-col gap-10">
          <div class="flex align-center gap-8"><ul class="meta-tag-list flex-none" title="${escape(item.tags.join(', '))}">${tagHtml(item.tags)}</ul><h3 class="body1-sb-18 color-slate-900 tp-card__title" title="${escape(item.title)}">${item.title}</h3></div>
          <p class="tp-card__meta body3-m-14 color-slate-700" title="${escape(`${item.date} 업데이트 | ${item.provider} | ${item.format}`)}"><time>${item.date}</time><span> 업데이트 </span><span class="color-slate-200">|</span><span> ${item.provider}</span><span class="color-slate-200"> | </span><span class="color-slate-900">${item.format}</span></p>
        </div>
        <div class="flex align-center gap-6 flex-none"><i class="topical-eye-open-icon" aria-hidden="true"></i><span class="blind">조회수</span><span class="body3-r-14 color-slate-400">${item.views}</span></div>
      </a>
      <button type="button" class="tp-card__bookmark tp-fav-row__bookmark is-active" aria-pressed="true" data-fav-id="${item.id}"><i class="tp-book-icon" aria-hidden="true"></i><span class="blind">즐겨찾기 삭제</span></button>
    </li>`;

  Topical.renderRecentCard = (item) =>
    DatasetCard.render(item, {
      showCheckbox: false,
      favorited: state.favorites.has(item.id),
      className: 'tp-recent-card',
      infoGapClass: 'gap-4',
    });

  Topical.renderResults = () => {
    const list = document.querySelector('[data-result-list]');
    if (!list) return;
    const isList = state.view === 'list';
    list.className = isList ? 'tp-cards tp-list flex flex-col border-t border-slate-200' : 'tp-cards';
    list.innerHTML = items.map(isList ? Topical.renderListRow : Topical.renderCard).join('');
    Topical.renderPinPanel();
  };

  Topical.renderPinPanel = () => {
    const panel = document.querySelector('[data-pin-panel]');
    const list = document.querySelector('[data-pin-list]');
    const count = document.querySelector('[data-pin-count]');
    const pinned = items.filter((item) => state.pinned.has(item.id));
    const isList = state.view === 'list';
    if (count) count.textContent = pinned.length;
    if (panel) panel.hidden = pinned.length === 0;
    if (!list) return;
    list.className = isList
      ? 'tp-pin__list tp-list flex flex-col border-t border-slate-200'
      : 'tp-pin__list';
    list.innerHTML = pinned
      .map((item) =>
        isList ? Topical.renderListRow(item, { inPin: true }) : Topical.renderCard(item, { inPin: true }),
      )
      .join('');
  };

  Topical.renderFavorites = () => {
    const favItems = items.filter((item) => state.favorites.has(item.id));
    document.querySelectorAll('[data-fav-count], [data-fav-modal-count]').forEach((el) => {
      el.textContent = favItems.length;
    });
    const list = document.querySelector('[data-fav-list]');
    if (!list) return;
    list.classList.toggle('is-list', state.favView === 'list');
    list.innerHTML = favItems.length
      ? favItems.map(state.favView === 'list' ? Topical.renderFavRow : Topical.renderFavCard).join('')
      : '<li class="tp-fav-empty"><p class="heading9-sb-22 color-slate-500">등록된 관심 데이터가 없습니다.</p></li>';
  };

  Topical.renderRecent = () => {
    const panel = document.querySelector('[data-recent-panel]');
    const list = document.querySelector('[data-recent-list]');
    const count = document.querySelector('[data-recent-count]');
    if (count) count.textContent = state.recent.length;
    panel?.classList.toggle('is-empty', state.recent.length === 0);
    if (!list) return;
    list.innerHTML = state.recent.length
      ? state.recent.map(Topical.renderRecentCard).join('')
      : '<li class="tp-recent-empty"><p class="heading9-sb-22 color-slate-500">최근 본 데이터가 없습니다.</p></li>';
  };

  Topical.addRecent = (itemId) => {
    const item = items.find((entry) => entry.id === Number(itemId));
    if (!item) return;
    state.recent = [item, ...state.recent.filter((entry) => entry.id !== item.id)].slice(0, 8);
    try {
      sessionStorage.setItem(
        'egis-topical-recent-ids',
        JSON.stringify(state.recent.map((entry) => entry.id)),
      );
    } catch {
      /* ignore */
    }
    Topical.renderRecent();
  };

  Topical.setFavorite = (itemId, active) => {
    if (active) {
      if (state.favorites.has(itemId)) return;
      if (state.favorites.size >= 10) {
        window.Toast?.warning(
          '관심 데이터는 최대 10개까지 등록할 수 있습니다. 기존 항목을 삭제한 후 다시 시도해 주세요.',
        );
        return;
      }
      state.favorites.add(itemId);
    } else {
      state.favorites.delete(itemId);
    }
    Topical.renderResults();
    Topical.renderFavorites();
    Topical.renderRecent();
  };

  Topical.syncPin = (itemId) => {
    const checked = state.pinned.has(itemId);
    [`item-${itemId}`, `list-item-${itemId}`, `pin-item-${itemId}`, `pin-list-item-${itemId}`].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    });
  };
})();
