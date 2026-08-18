function initCheckAll(masterId, itemSelector) {
  const master = document.getElementById(masterId);
  const items = document.querySelectorAll(itemSelector);
  if (!master) return;

  function syncMaster() {
    const checkedCount = [...items].filter((i) => i.checked).length;
    master.checked = checkedCount === items.length;
    master.indeterminate = checkedCount > 0 && checkedCount < items.length;
  }

  master.addEventListener('change', () => {
    items.forEach((item) => {
      item.checked = master.checked;
      item.dispatchEvent(new Event('change', { bubbles: true }));
    });
    syncMaster();
  });

  items.forEach((item) => item.addEventListener('change', syncMaster));
  syncMaster();
}

document.querySelectorAll('[data-checkall-target]').forEach((master) => {
  initCheckAll(master.id, master.dataset.checkallTarget);
});
