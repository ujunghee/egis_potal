/** 다운로드 모달 — full(5단계) / dataset(구성데이터 3단계) */
function initDetailDownload() {
  const modal = document.querySelector('[data-dl-modal]');
  if (!modal) return;

  const FLOWS = {
    full: [1, 2, 3, 4, 5],
    dataset: [3, 4, 5],
  };

  let flow = 'full';
  let stepIndex = 0;

  const flowSteps = () => FLOWS[flow] || FLOWS.full;
  const currentPanel = () => flowSteps()[stepIndex];
  const isFinal = () => stepIndex >= flowSteps().length - 1;

  const setStep = (index) => {
    const steps = flowSteps();
    stepIndex = Math.max(0, Math.min(index, steps.length - 1));
    const panelId = steps[stepIndex];
    const navIndex = stepIndex + 1;

    modal.querySelectorAll('[data-dl-step]').forEach((panel) => {
      panel.hidden = Number(panel.dataset.dlStep) !== panelId;
    });

    const navList = modal.querySelector(`[data-dl-nav-list="${flow}"]`);
    navList?.querySelectorAll('[data-dl-nav]').forEach((item) => {
      const active = Number(item.dataset.dlNav) === navIndex;
      item.classList.toggle('active', active);
      item.classList.toggle('bg-white', active);
      item.classList.toggle('radius-md-8', active);
      item.querySelector('.tp-dl__step-num')?.classList.toggle('bg-blue-500', active);
      item.querySelector('.tp-dl__step-num')?.classList.toggle('bg-slate-200', !active);
      const label = item.querySelector('strong, span:last-child');
      label?.classList.toggle('color-slate-900', active);
      label?.classList.toggle('color-slate-500', !active);
    });

    const prevBtn = modal.querySelector('[data-dl-prev]');
    const nextBtn = modal.querySelector('[data-dl-next]');
    const nextIcon = nextBtn?.querySelector('.tp-dl__next-icon');
    const nextLabel = nextBtn?.querySelector('.tp-dl__next-label');
    if (prevBtn) prevBtn.hidden = stepIndex === 0;
    if (nextBtn) nextBtn.classList.toggle('is-final', isFinal());
    if (nextIcon) nextIcon.hidden = !isFinal();
    if (nextLabel) nextLabel.textContent = isFinal() ? '동의하고 다운로드' : '다음';
  };

  const setFlow = (nextFlow) => {
    flow = FLOWS[nextFlow] ? nextFlow : 'full';
    modal.dataset.dlFlow = flow;
    modal.querySelectorAll('[data-dl-nav-list]').forEach((list) => {
      list.hidden = list.dataset.dlNavList !== flow;
    });
    modal.querySelectorAll('[data-dl-full-only]').forEach((el) => {
      el.hidden = flow === 'dataset';
    });
  };

  const setSurveyError = (key, show) => {
    const group = modal.querySelector(`[data-dl-survey="${key}"]`);
    const err = group?.querySelector('[data-dl-survey-error]');
    if (err) err.hidden = !show;
    group?.classList.toggle('is-error', show);
  };

  const clearSurveyErrors = () => {
    modal.querySelectorAll('[data-dl-survey]').forEach((group) => {
      group.classList.remove('is-error');
      const err = group.querySelector('[data-dl-survey-error]');
      if (err) err.hidden = true;
    });
  };

  const validateSurvey = () => {
    const jobOk = !!modal.querySelector('input[name="download-job"]:checked');
    const purposeOk = !!modal.querySelector('input[name="download-purpose"]:checked');
    const fieldOk = modal.querySelectorAll('input[name="download-field"]:checked').length > 0;
    const agreeOk = !!modal.querySelector('#download-agree-license')?.checked;

    setSurveyError('job', !jobOk);
    setSurveyError('purpose', !purposeOk);
    setSurveyError('field', !fieldOk);
    setSurveyError('agree', !agreeOk);

    return jobOk && purposeOk && fieldOk && agreeOk;
  };

  const open = (options = {}) => {
    if (modal.open) return;
    clearSurveyErrors();
    setFlow(options.flow || 'full');
    setStep(0);
    modal.showModal();
  };

  document.querySelectorAll('[data-dl-open]').forEach((btn) => {
    btn.addEventListener('click', () => open({ flow: 'full' }));
  });
  modal.querySelector('[data-dl-close]')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  modal.querySelector('[data-dl-next]')?.addEventListener('click', () => {
    if (!isFinal()) {
      setStep(stepIndex + 1);
      return;
    }
    if (currentPanel() === 5 && !validateSurvey()) return;
    modal.close();
  });
  modal.querySelector('[data-dl-prev]')?.addEventListener('click', () => {
    if (stepIndex > 0) setStep(stepIndex - 1);
  });

  modal.querySelector('[data-dl-step="5"]')?.addEventListener('change', (e) => {
    const group = e.target.closest('[data-dl-survey]');
    if (!group) return;
    setSurveyError(group.dataset.dlSurvey, false);
  });

  modal.querySelector('.tp-dl__range-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    tab.parentElement.querySelectorAll('[role="tab"]').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.classList.toggle('bg-white', active);
      item.classList.toggle('radius-md-8', active);
      item.setAttribute('aria-selected', String(active));
    });
    modal.querySelectorAll('[data-dl-range]').forEach((panel) => {
      panel.hidden = panel.dataset.dlRange !== tab.dataset.dlRangeTab;
    });
  });

  const mapScale = modal.querySelector('[data-dl-map-scale]');
  modal.querySelector('.tp-dl__map-tools')?.addEventListener('click', (e) => {
    const tool = e.target.closest('[data-dl-map-tool]');
    if (!tool) return;
    modal.querySelectorAll('[data-dl-map-tool]').forEach((btn) => {
      const active = btn === tool;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (mapScale) mapScale.hidden = tool.dataset.dlMapTool !== 'sheet';
  });

  const regionSelects = modal.querySelectorAll('.tp-dl__address .select-48');
  regionSelects[0]?.addEventListener('change', () => { if (regionSelects[0].value) regionSelects[1].disabled = false; });
  regionSelects[1]?.addEventListener('change', () => { if (regionSelects[1].value) regionSelects[2].disabled = false; });

  const regionPanel = modal.querySelector('[data-dl-region-panel]');
  const regionList = modal.querySelector('[data-dl-region-list]');
  const regionHead = modal.querySelector('[data-dl-region-head]');

  const updateRegionCount = () => {
    const count = regionList?.querySelectorAll('li').length ?? 0;
    const output = modal.querySelector('[data-dl-region-count]');
    const empty = count === 0;
    if (output) output.textContent = String(count);
    regionPanel?.classList.toggle('is-empty', empty);
    if (regionHead) regionHead.hidden = empty;
  };

  modal.querySelector('[data-dl-region-add]')?.addEventListener('click', () => {
    const parts = [...regionSelects]
      .map((select) => select.value.trim())
      .filter(Boolean);
    if (!parts.length || !regionList) return;

    const li = document.createElement('li');
    li.className = 'flex align-center justify-between';
    li.innerHTML = `<span class="body2-m-16 color-slate-900"></span><button type="button" class="close-icon-32" aria-label="선택 영역 삭제"></button>`;
    li.querySelector('span').textContent = parts.join(' ');
    regionList.appendChild(li);
    updateRegionCount();
  });

  regionList?.addEventListener('click', (e) => {
    e.target.closest('button')?.closest('li')?.remove();
    updateRegionCount();
  });
  modal.querySelector('[data-dl-region-clear]')?.addEventListener('click', () => {
    regionList?.replaceChildren();
    updateRegionCount();
  });
  updateRegionCount();

  const attrPanel = modal.querySelector('[data-dl-step="3"]');
  if (attrPanel) {
    const countEl = attrPanel.querySelector('[data-dl-attr-count]');
    const totalEl = attrPanel.querySelector('[data-dl-attr-total]');
    const allEl = attrPanel.querySelector('[data-dl-attr-all]');
    const items = [...attrPanel.querySelectorAll('[data-dl-attr]')];
    const updateAttr = () => {
      const checked = items.filter((item) => item.checked).length;
      if (countEl) countEl.textContent = String(checked);
      if (totalEl) totalEl.textContent = String(items.length);
      if (allEl) {
        allEl.checked = checked === items.length && items.length > 0;
        allEl.indeterminate = checked > 0 && checked < items.length;
      }
    };
    allEl?.addEventListener('change', () => {
      items.forEach((item) => { item.checked = allEl.checked; });
      updateAttr();
    });
    items.forEach((item) => item.addEventListener('change', updateAttr));
    updateAttr();
  }

  return open;
}

window.initDetailDownload = initDetailDownload;
