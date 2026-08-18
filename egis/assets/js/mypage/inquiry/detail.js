/**
 * 나의 문의 상세 — type 쿼리로 데이터셋 메타 / 태그 분기
 * Figma: 1234:2462 (dataset) · 1234:2864 (general)
 * ?type=dataset|general|openapi
 */
(() => {
  const root = document.querySelector('[data-mi-detail]');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const type = (params.get('type') || 'dataset').toLowerCase();

  const tag = root.querySelector('[data-mi-tag]');
  const meta = root.querySelector('[data-mi-meta]');

  const TAG = {
    dataset: { label: '데이터셋', className: 'meta-tag meta-tag--dataset' },
    general: { label: '일반 문의', className: 'meta-tag meta-tag--general' },
    openapi: { label: 'Open API', className: 'meta-tag meta-tag--openapi' },
    'open-api': { label: 'Open API', className: 'meta-tag meta-tag--openapi' },
  };

  const config = TAG[type] || TAG.dataset;

  if (tag) {
    tag.className = config.className;
    tag.textContent = config.label;
  }

  if (meta) {
    const showMeta = type === 'dataset';
    meta.hidden = !showMeta;
  }
})();
