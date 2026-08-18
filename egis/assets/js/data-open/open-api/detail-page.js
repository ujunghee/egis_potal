/** Open API 상세 페이지 */
function initOpenApiDetail() {
  initDetailSticky();
  initDetailDownload();

  document.querySelectorAll('[data-api-copy-url]').forEach((btn) => {
    const label = btn.querySelector('span');
    const originalText = label?.textContent?.trim() || '복사';
    const originalAria = btn.getAttribute('aria-label') || originalText;
    let copiedTimer = 0;

    const markCopied = () => {
      if (label) label.textContent = '복사됨';
      btn.setAttribute('aria-label', originalAria.replace(/복사$/, '복사됨'));
      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => {
        if (label) label.textContent = originalText;
        btn.setAttribute('aria-label', originalAria);
      }, 4000);
    };

    btn.addEventListener('click', async () => {
      const url = btn.closest('li')?.querySelector('[data-api-url]')?.textContent?.trim();
      if (!url) return;
      await window.EgisClipboard?.copy(url);
      markCopied();
    });
  });

  document.querySelector('[data-api-test-run]')?.addEventListener('click', () => {
    const form = document.querySelector('[data-api-test-form]');
    const result = document.querySelector('[data-api-result-code]');
    if (!form || !result) return;

    const payload = {
      service: form.querySelector('#oa-test-service')?.value,
      version: form.querySelector('#oa-test-version')?.value,
      request: form.querySelector('#oa-test-request')?.value,
      layers: form.querySelector('#oa-test-layers')?.value,
      crs: form.querySelector('#oa-test-crs')?.value,
      bbox: form.querySelector('#oa-test-bbox')?.value,
      width: form.querySelector('#oa-test-width')?.value,
      height: form.querySelector('#oa-test-height')?.value,
      format: form.querySelector('#oa-test-format')?.value,
      transparent: form.querySelector('#oa-test-transparent')?.value,
      query_layers: form.querySelector('#oa-test-query-layers')?.value,
      i: form.querySelector('#oa-test-i')?.value,
      j: form.querySelector('#oa-test-j')?.value,
      status: 'success',
    };

    result.textContent = `<?xml version="1.0" encoding="UTF-8"?>
<FeatureCollection>
  <service>${payload.service}</service>
  <version>${payload.version}</version>
  <request>${payload.request}</request>
  <layers>${payload.layers}</layers>
  <status>${payload.status}</status>
</FeatureCollection>`;
    window.Toast?.show('테스트 요청을 실행했습니다.');
  });

  document.querySelectorAll('[data-api-result-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.apiResultTab;
      const body = document.querySelector('[data-api-result-view]');
      document.querySelectorAll('[data-api-result-tab]').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      body?.classList.toggle('is-image-only', view === 'image');
      body?.setAttribute('data-api-result-view', view);
    });
  });

  const fullscreen = document.querySelector('[data-api-map-fullscreen]');
  const expandBtn = document.querySelector('[data-api-result-expand]');
  const closeBtn = document.querySelector('[data-api-map-fullscreen-close]');

  const setMapFullscreen = (open) => {
    if (!fullscreen) return;
    fullscreen.hidden = !open;
    document.body.classList.toggle('is-oa-map-fullscreen', open);
    expandBtn?.setAttribute('aria-expanded', String(open));
    if (open) closeBtn?.focus();
    else expandBtn?.focus();
  };

  expandBtn?.addEventListener('click', () => setMapFullscreen(true));
  closeBtn?.addEventListener('click', () => setMapFullscreen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || fullscreen?.hidden) return;
    setMapFullscreen(false);
  });

  document.querySelectorAll('[data-detail-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await window.EgisClipboard?.copy(location.href);
      window.Toast?.show('링크가 복사되었습니다.');
    });
  });
}

window.initOpenApiDetail = initOpenApiDetail;
