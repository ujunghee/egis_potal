document.querySelectorAll('.map-search-wrapper').forEach((wrapper) => {
  const input = wrapper.querySelector('input[type="search"]');
  const result = wrapper.querySelector('.map-search-result');
  if (!input || !result) return;

  const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderHighlight = (keyword) => {
    result.querySelectorAll('.map-search-result__road, .map-search-result__jibun').forEach((p) => {
      const base = p.dataset.text || (p.dataset.text = p.textContent);
      if (!keyword) { p.textContent = base; return; }
      const re = new RegExp('(' + escapeReg(escapeHtml(keyword)) + ')', 'gi');
      p.innerHTML = escapeHtml(base).replace(re, '<span class="color-blue-500">$1</span>');
    });
  };
  renderHighlight('');

  const box = wrapper.querySelector('.map-header-search-40');
  const open = () => {
    result.classList.add('active');
    if (box) box.classList.add('active');
    input.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    result.classList.remove('active');
    if (box) box.classList.remove('active');
    input.setAttribute('aria-expanded', 'false');
  };

  /**
   * 헤더 드롭다운 주소 선택/검색 → 좌측 주소검색 결과 패널
   * 지도 이동은 패널 항목 클릭(address-search:select)에서만 수행
   */
  const showAddressSearchResults = (selectedItem = null) => {
    const query = input.value.trim();
    if (!query) return;

    window.SpatialSearchPanel?.close?.();
    window.MapSheetSearch?.hide?.();
    window.IntegratedSearchLayerInfo?.close?.();
    window.SpatialSearchResults?.hide?.();

    document.querySelectorAll('.map-navigation__item[aria-pressed]').forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });

    window.ResultPanel?.show('address-search');

    window.dispatchEvent(
      new CustomEvent('map-header-search:submit', {
        detail: {
          query,
          item: selectedItem,
          lat: selectedItem ? Number(selectedItem.dataset.lat) : null,
          lng: selectedItem ? Number(selectedItem.dataset.lng) : null,
        },
      })
    );
  };

  input.addEventListener('focus', open);
  input.addEventListener('input', () => {
    const keyword = input.value.trim();
    renderHighlight(keyword);
    keyword ? open() : close();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    showAddressSearchResults();
    close();
  });

  result.querySelectorAll('.map-search-result__item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      result.querySelectorAll('.map-search-result__item').forEach((el) => el.classList.remove('active'));
      item.classList.add('active');
      const name = item.querySelector('.map-search-result__road');
      if (name) input.value = name.textContent.trim();
      showAddressSearchResults(item);
      close();
    });
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.map-search-result.active').forEach((result) => {
      result.classList.remove('active');
      const wrapper = result.closest('.map-search-wrapper');
      if (!wrapper) return;
      const input = wrapper.querySelector('input[type="search"]');
      if (input) input.setAttribute('aria-expanded', 'false');
    });
  }
});
