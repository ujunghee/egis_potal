/** 공통 데이터셋 카드 (카드형·리스트형 동일 마크업) */
window.DatasetCard = window.DatasetCard || {};

DatasetCard.escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    })[char],
  );

/** 카드에 마우스를 올렸을 때 제공 형식 자리에 대신 보여줄 안내 문구 */
DatasetCard.PORTAL_LABEL = '환경정보 융합 공유포털에서 보기';

DatasetCard.render = (
  item,
  {
    checkboxId = `item-${item.id}`,
    checked = false,
    favorited = false,
    showCheckbox = true,
    showBookmark = true,
    showPortalLink = false,
    className = '',
    pinAttr = true,
    infoGapClass = 'gap-4',
  } = {},
) => {
  const escape = DatasetCard.escape;
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const tagHtml = tags
    .map(
      (tag, i) =>
        `<li><span class="meta-tag${i === 0 ? ' meta-tag--active' : ''}" title="${escape(tag)}">${escape(tag)}</span></li>`,
    )
    .join('');
  const metaText = `${item.date} 업데이트 | ${item.provider}`;
  const checkboxHtml = showCheckbox
    ? `<input type="checkbox" class="checkbox-basic checkbox-basic-md" id="${checkboxId}"${pinAttr ? ` data-pin data-id="${item.id}"` : ' data-mypage-check'}${checked ? ' checked' : ''} />
              <label for="${checkboxId}" class="blind">${escape(item.title)} 선택</label>`
    : '';
  const classes = [
    'tp-card',
    'relative',
    'pt-24',
    'px-24',
    'pb-20',
    'rounded-md',
    'bg-white',
    'cursor-pointer',
    showPortalLink ? 'tp-card--portal' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const portalHtml = showPortalLink
    ? `<span class="tp-card__portal body2-m-16 color-blue-600">
            ${escape(DatasetCard.PORTAL_LABEL)}
            <i class="arrow-up-right-blue-600" aria-hidden="true"></i>
          </span>`
    : '';
  const bookmarkHtml = showBookmark
    ? `<button type="button" class="tp-card__bookmark${favorited ? ' is-active' : ''}" aria-pressed="${favorited}" data-fav-id="${item.id}">
            <i class="tp-book-icon" aria-hidden="true"></i>
            <span class="blind">${favorited ? '즐겨찾기 삭제' : '즐겨찾기 추가'}</span>
          </button>`
    : '';

  return `
    <li class="${classes}" data-item="${item.id}"${item.type ? ` data-type="${item.type}"` : ''}>
      <article class="tp-card__layout flex flex-col" itemscope itemtype="https://schema.org/Dataset">
        <div class="tp-card__top flex align-center justify-between gap-12">
          <div class="flex align-center gap-8">
            ${checkboxHtml}
            <ul class="meta-tag-list" title="${escape(tags.join(', '))}">${tagHtml}</ul>
          </div>
          <div class="flex align-center gap-6 flex-none">
            <i class="topical-eye-open-icon" aria-hidden="true"></i>
            <span class="blind">조회수</span>
            <span class="body3-r-14 color-slate-400">${escape(item.views)}</span>
          </div>
        </div>
        <div class="tp-card__info flex flex-col ${infoGapClass} pt-6">
          <h3 class="body1-sb-18 color-slate-900" itemprop="name" title="${escape(item.title)}">${escape(item.title)}</h3>
          <p class="tp-card__meta body3-r-14 color-slate-700" title="${escape(metaText)}">
            <time datetime="${escape(String(item.date).replace(/\./g, '-'))}" itemprop="dateModified">${escape(item.date)}</time>
            <span> 업데이트 </span><span class="color-slate-200" aria-hidden="true">|</span>
            <span itemprop="creator"> ${escape(item.provider)}</span>
          </p>
        </div>
        <div class="tp-card__footer flex align-end justify-between">
          <p class="tp-card__format body2-m-16 color-slate-900" title="${escape(item.format)}">
            <span class="blind">제공 형식</span><span itemprop="encodingFormat">${escape(item.format)}</span>
          </p>
          ${portalHtml}
          ${bookmarkHtml}
        </div>
      </article>
    </li>`;
};

/** 리스트형 행 마크업 — 레이아웃 Figma 1701:14674, 호버 시 포털 안내는 Figma 2162:2191 */
DatasetCard.renderListRow = (
  item,
  {
    checkboxId = `list-item-${item.id}`,
    checked = false,
    favorited = false,
    showCheckbox = true,
    showBookmark = true,
    showPortalLink = false,
    pinAttr = true,
  } = {},
) => {
  const escape = DatasetCard.escape;
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const tagHtml = tags
    .map(
      (tag, i) =>
        `<li><span class="meta-tag${i === 0 ? ' meta-tag--active' : ''}" title="${escape(tag)}">${escape(tag)}</span></li>`,
    )
    .join('');
  const metaFull = `${item.date} 업데이트 | ${item.provider} | ${item.format}`;
  const checkboxHtml = showCheckbox
    ? `<input type="checkbox" class="checkbox-basic checkbox-basic-md" id="${checkboxId}"${pinAttr ? ` data-pin data-id="${item.id}"` : ' data-mypage-check'}${checked ? ' checked' : ''} />
      <label for="${checkboxId}" class="blind">${escape(item.title)} 선택</label>`
    : '';
  const bookmarkHtml = showBookmark
    ? `<button type="button" class="tp-card__bookmark tp-fav-row__bookmark${favorited ? ' is-active' : ''}" aria-pressed="${favorited}" data-fav-id="${item.id}">
        <i class="tp-book-icon" aria-hidden="true"></i>
        <span class="blind">${favorited ? '즐겨찾기 삭제' : '즐겨찾기 추가'}</span>
      </button>`
    : '';
  const portalHtml = showPortalLink
    ? `<span class="tp-fav-row__portal body2-m-16 color-blue-600">
        ${escape(DatasetCard.PORTAL_LABEL)}
        <i class="arrow-up-right-blue-600" aria-hidden="true"></i>
      </span>`
    : '';
  const rowClass = [
    'tp-fav-row',
    'flex',
    'align-center',
    'gap-12',
    'border-b',
    'border-slate-200',
    showPortalLink ? 'tp-fav-row--portal' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const viewsHtml = `<div class="tp-fav-row__views flex align-center gap-6 flex-none">
        <i class="topical-eye-open-icon" aria-hidden="true"></i>
        <span class="blind">조회수</span>
        <span class="body3-m-14 color-slate-400">${escape(item.views)}</span>
      </div>`;
  const metaHtml = `<p class="tp-card__meta body3-m-14 color-slate-700" title="${escape(metaFull)}">
            <time class="color-slate-700" datetime="${escape(String(item.date).replace(/\./g, '-'))}" itemprop="dateModified">${escape(item.date)}</time>
            <span class="color-slate-700"> 업데이트 </span>
            <span class="color-slate-200" aria-hidden="true">|</span>
            <span class="color-slate-700" itemprop="creator"> ${escape(item.provider)}</span>
            <span class="color-slate-200" aria-hidden="true"> | </span>
            <span class="color-slate-900" itemprop="encodingFormat">${escape(item.format)}</span>
          </p>`;
  const titleHtml = `<div class="flex align-center gap-8 min-w-0">
          <ul class="meta-tag-list flex-none" title="${escape(tags.join(', '))}">${tagHtml}</ul>
          <h3 class="body1-sb-18 color-slate-900 tp-card__title" itemprop="name" title="${escape(item.title)}">${escape(item.title)}</h3>
        </div>`;

  if (showPortalLink) {
    return `
    <li class="${rowClass}" data-item="${item.id}"${item.type ? ` data-type="${item.type}"` : ''}>
      ${checkboxHtml}
      <a href="javascript:void(0);" class="tp-fav-row__link flex flex-1 flex-col gap-4 pt-16 pb-12" itemscope itemtype="https://schema.org/Dataset">
        <div class="tp-fav-row__top flex align-center justify-between gap-12">
          ${titleHtml}
          ${viewsHtml}
        </div>
        <div class="tp-fav-row__bottom flex align-center justify-between gap-12">
          ${metaHtml}
          ${portalHtml}
        </div>
      </a>
      ${bookmarkHtml}
    </li>`;
  }

  return `
    <li class="${rowClass}" data-item="${item.id}"${item.type ? ` data-type="${item.type}"` : ''}>
      ${checkboxHtml}
      <a href="javascript:void(0);" class="tp-fav-row__link flex flex-1 flex-col gap-4 py-16" itemscope itemtype="https://schema.org/Dataset">
        ${titleHtml}
        <div class="tp-fav-row__bottom flex align-center justify-between gap-12">
          ${metaHtml}
        </div>
      </a>
      <div class="tp-fav-row__aside flex align-center flex-none">
        ${viewsHtml}
        ${bookmarkHtml}
      </div>
    </li>`;
};
