/**
 * Address Search — 주소 검색 결과 뷰 (헤더 검색 API 연동용)
 *
 * 커스텀 이벤트 (window):
 * - address-search:select  detail: { item, lat, lng }
 */
const AddressSearch = {
  root: document.querySelector('#result-panel-view-address-search'),

  init() {
    if (!this.root) return;

    this.root.querySelectorAll('.address-search__list').forEach((list) => {
      list.querySelectorAll('.address-search__item').forEach((item) => {
        item.addEventListener('click', () => {
          list.querySelectorAll('.address-search__item').forEach((el) => {
            el.classList.remove('active');
            el.setAttribute('aria-selected', 'false');
          });
          item.classList.add('active');
          item.setAttribute('aria-selected', 'true');

          window.dispatchEvent(
            new CustomEvent('address-search:select', {
              detail: {
                item,
                lat: parseFloat(item.dataset.lat),
                lng: parseFloat(item.dataset.lng),
              },
            })
          );
        });
      });
    });
  },

  /** 개발 연동: 결과 건수 갱신 */
  setCount(count) {
    const el = this.root?.querySelector('.address-search__count');
    if (el) el.textContent = String(count);
  },
};

window.AddressSearch = AddressSearch;

AddressSearch.init();
