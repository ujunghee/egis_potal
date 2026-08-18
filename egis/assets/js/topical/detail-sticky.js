/** 상세 sticky bar */
function initDetailSticky() {
  const title = document.querySelector('#dataset-title');
  const bar = document.querySelector('[data-detail-sticky]');
  const barTitle = document.querySelector('[data-detail-sticky-title]');
  if (!title || !bar) return;

  const update = () => {
    bar.hidden = title.getBoundingClientRect().top > 0;
    if (barTitle) barTitle.textContent = title.textContent;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

window.initDetailSticky = initDetailSticky;
