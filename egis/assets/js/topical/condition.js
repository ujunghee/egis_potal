/** 조건 검색 */
Topical.renderConditions = () => {
  const list = document.querySelector('[data-condition-list]');
  const count = document.querySelector('[data-condition-count]');
  if (!list || !count) return;

  count.textContent = Topical.state.conditions.length;
  list.innerHTML = Topical.state.conditions.map((c, i) => `
    <li class="tp-chip body2-m-16 color-slate-700">
      <span>${Topical.escape(c.operator)}: ${Topical.escape(c.keyword)}</span>
      <button type="button" class="tp-chip__remove chips-close-icon" data-condition-remove="${i}">
        <span class="blind">${Topical.escape(c.keyword)} 조건 삭제</span>
      </button>
    </li>`).join('');
};

Topical.notifyConditions = () => {
  window.dispatchEvent(new CustomEvent('tp:conditions-change', {
    detail: { conditions: Topical.state.conditions.map((c) => ({ ...c })) },
  }));
};

Topical.initCondition = () => {
  const toggle = document.querySelector('[data-condition-toggle]');
  const panel = document.querySelector('[data-condition-panel]');

  toggle?.addEventListener('click', () => {
    const open = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  const add = () => {
    const operator = document.querySelector('#condition-operator');
    const keyword = document.querySelector('#condition-keyword');
    const value = keyword?.value.trim() ?? '';
    if (!value) return;
    Topical.state.conditions.push({ operator: operator?.value ?? 'AND', keyword: value });
    keyword.value = '';
    Topical.renderConditions();
    Topical.notifyConditions();
    keyword.focus();
  };

  document.querySelector('[data-condition-add]')?.addEventListener('click', add);
  document.querySelector('#condition-keyword')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  });

  document.querySelector('[data-condition-list]')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-condition-remove]');
    if (!btn) return;
    Topical.state.conditions.splice(Number(btn.dataset.conditionRemove), 1);
    Topical.renderConditions();
    Topical.notifyConditions();
  });

  document.querySelector('[data-condition-reset]')?.addEventListener('click', () => {
    Topical.state.conditions = [];
    Topical.renderConditions();
    Topical.notifyConditions();
  });
};
