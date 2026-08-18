document.querySelectorAll('[data-control-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
    btn.classList.toggle('active', !pressed);
    btn.querySelector('i')?.classList.toggle('active', !pressed);
  });
});

document.querySelectorAll('.map-view__control .map-control__btn').forEach((btn) => {
  window.initIntegratedSearchTooltip?.(btn);
});
