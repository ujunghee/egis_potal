document.querySelectorAll('.applied-filter').forEach((appliedFilter) => {
  const countEl = appliedFilter.querySelector('.applied-filter__count');
  const list = appliedFilter.querySelector('.applied-filter__list ul');

  function updateAppliedFilterCount() {
    const count = list.querySelectorAll('li').length;
    countEl.textContent = count;
    appliedFilter.hidden = count === 0;
  }

  appliedFilter.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-applied-filter-remove]');
    if (removeBtn) {
      removeBtn.closest('li').remove();
      updateAppliedFilterCount();
    }
  });

  appliedFilter.querySelector('[data-applied-filter-reset]')?.addEventListener('click', () => {
    list.querySelectorAll('li').forEach((li) => li.remove());
    updateAppliedFilterCount();
  });
});
