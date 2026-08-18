/**
 * 반경검색 중심점 안내 — SweetAlert2 toast
 *
 * 반경 도구 선택 시 고정 표시, 지도에서 중심점 지정(또는 도구 변경) 시 닫힘
 */
const SpatialSearchToast = {
  init() {
    window.addEventListener('spatial-search:tool-change', (event) => {
      if (event.detail?.tool === 'radius') this.show();
      else this.hide();
    });
    window.addEventListener('spatial-search:radius-center-change', () => this.show());
    window.addEventListener('spatial-search:radius-drawn', () => this.hide());
    window.addEventListener('spatial-search:search', () => this.hide());
    window.addEventListener('spatial-search:clear', () => this.hide());
    window.addEventListener('spatial-search-panel:close', () => this.hide());
  },

  show() {
    if (typeof window.Swal === 'undefined') {
      console.error('SweetAlert2가 로드되지 않아 공간검색 안내를 표시할 수 없습니다.');
      return;
    }

    window.Swal.fire({
      toast: true,
      position: 'top',
      html: `
        <div class="spatial-search-swal-toast__message flex align-center justify-center gap-10">
          <i class="spatial-search-toast__icon" aria-hidden="true"></i>
          <p class="body1-m-18 color-black">지도를 클릭해 중심점을 지정하세요</p>
        </div>
      `,
      showConfirmButton: false,
      timer: undefined,
      timerProgressBar: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      customClass: {
        container: 'spatial-search-swal-toast-container',
        popup: 'spatial-search-swal-toast',
        htmlContainer: 'spatial-search-swal-toast__content',
      },
      showClass: {
        popup: 'spatial-search-swal-toast--show',
      },
      hideClass: {
        popup: 'spatial-search-swal-toast--hide',
      },
    });
  },

  hide() {
    const popup = window.Swal?.getPopup?.();
    if (popup?.classList.contains('spatial-search-swal-toast')) {
      window.Swal.close();
    }
  },
};

window.SpatialSearchToast = SpatialSearchToast;
MapUi.ready(() => SpatialSearchToast.init());
