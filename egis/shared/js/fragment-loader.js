/** HTML 껍데기의 data-fragment 위치에 분리된 마크업을 삽입합니다. */
window.FragmentLoader = {
  getAssetsBase() {
    const link = document.querySelector('link[href*="assets/css/"]');
    if (!link) return null;

    const href = link.getAttribute('href');
    const index = href.indexOf('assets/');
    return index >= 0 ? href.slice(0, index + 'assets/'.length) : null;
  },

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
      document.body.appendChild(script);
    });
  },

  async ensurePagesRoot() {
    if (window.EgisPagesRoot) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/pages-root.js`);
  },

  getSharedFragmentUrl(name) {
    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return null;

    return `${assetsBase.replace(/assets\/?$/, 'shared/fragments/')}${name}`;
  },

  /** 토스트 마크업 — 레이아웃에 없으면 공통 fragment를 넣는다. */
  async ensureToastMarkup() {
    if (document.querySelector('.toast-stack')) return;

    const url = this.getSharedFragmentUrl('toast.html');
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok) return;

    const template = document.createElement('template');
    template.innerHTML = (await response.text()).trim();
    document.body.append(template.content);
  },

  /** 토스트는 모든 화면에서 바로 호출할 수 있어야 하므로 여기서 미리 싣는다. */
  async ensureToast() {
    await this.ensureToastMarkup();
    if (window.Toast) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/toast.js`);
  },

  /** 인증키·링크 복사 버튼이 여러 화면에 있으므로 토스트와 함께 미리 싣는다. */
  async ensureClipboard() {
    if (window.EgisClipboard) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/clipboard.js`);
  },

  /** 푸터 관련사이트 패널 — 푸터가 있는 모든 화면에서 동작 */
  async ensureFooter() {
    if (window.EgisFooterReady) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/footer.js`);
    window.EgisFooterReady = true;
  },

  /** 확인 팝업 — login-required-modal 스타일 공유 */
  async ensureConfirmDialog() {
    if (window.ConfirmDialog) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/confirm-dialog.js`);
  },

  /** 프로토타입 로그인 전환 — 웹·지도 헤더 공통 */
  async ensurePrototypeAuth() {
    if (window.EgisPrototypeAuth) return;

    const assetsBase = this.getAssetsBase();
    if (!assetsBase) return;

    await this.loadScript(`${assetsBase}js/common/prototype-auth.js`);
  },

  async loadAll(root = document) {
    let slots = [...root.querySelectorAll('[data-fragment]')];

    while (slots.length) {
      await Promise.all(slots.map(async (slot) => {
        const url = slot.dataset.fragment;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fragment를 불러오지 못했습니다: ${url}`);

        const template = document.createElement('template');
        template.innerHTML = (await response.text()).trim();
        slot.replaceWith(template.content);
      }));

      slots = [...root.querySelectorAll('[data-fragment]')];
    }

    await this.ensurePagesRoot();
    await this.ensureToast();
    await this.ensureClipboard();
    await this.ensureConfirmDialog();
    await this.ensurePrototypeAuth();
    await this.ensureFooter();
    window.EgisPagesRoot?.resolveLinks();
    window.dispatchEvent(new CustomEvent('egis:fragments-loaded'));
  },
};
