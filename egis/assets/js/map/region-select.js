const tabs = document.querySelectorAll('.region-select__tab');
const panels = document.querySelectorAll('.region-select__panel');

function getPanel(tab) {
  return document.getElementById(tab.getAttribute('aria-controls'));
}

function closeAllPanels() {
  tabs.forEach((tab) => tab.setAttribute('aria-expanded', 'false'));
  panels.forEach((panel) => panel.classList.remove('active'));
}

tabs.forEach((tab) => {
  const panel = getPanel(tab);
  if (!panel) return;

  tab.addEventListener('click', () => {
    const isOpen = panel.classList.contains('active');
    closeAllPanels();
    if (!isOpen) {
      tab.setAttribute('aria-expanded', 'true');
      panel.classList.add('active');
    }
  });

  panel.querySelectorAll('.region-select__item').forEach((item) => {
    item.addEventListener('click', () => {
      panel.querySelectorAll('.region-select__item').forEach((el) => {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
      });
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');
      tab.querySelector('span').textContent = item.textContent;
      closeAllPanels();
    });
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.region-select')) closeAllPanels();
});
