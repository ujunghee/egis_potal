/**
 * Result Panel Core — 패널 표시/숨김, 뷰 전환, 접기/펼치기 (공통)
 *
 * 전역 API: window.ResultPanel
 * - show(viewId?)   : 패널 표시 (+ 선택적 뷰 전환)
 * - hide()          : 패널 숨김
 * - setView(viewId) : 활성 뷰 전환
 * - expand()        : 접힘 해제
 * - collapse()      : 패널 접기
 *
 * 커스텀 이벤트 (window):
 * - result-panel:show      detail: { viewId }
 * - result-panel:hide
 * - result-panel:view-change detail: { viewId }
 * - result-panel:collapse  detail: { collapsed: boolean }
 */
const ResultPanel = {
  wrap: document.getElementById('map-result-panel-wrap'),
  panel: document.getElementById('map-result-panel'),

  /** nav viewId → 실제 패널 view (주제별지도는 현재 기초자원지도 패널 공유) */
  viewAliases: {
    'topical-map': 'base-resource-map',
  },

  resolveViewId(viewId) {
    return this.viewAliases[viewId] ?? viewId;
  },

  get views() {
    return this.panel
      ? [...this.panel.querySelectorAll('[data-result-panel-view]')]
      : [];
  },

  get activeViewId() {
    const active = this.views.find((view) => !view.hidden);
    return active?.dataset.resultPanelView ?? null;
  },

  setView(viewId) {
    if (!this.panel || !viewId) return;

    const resolvedId = this.resolveViewId(viewId);

    this.views.forEach((view) => {
      const isActive = view.dataset.resultPanelView === resolvedId;
      view.hidden = !isActive;
    });

    if (this.wrap) {
      this.wrap.dataset.resultPanelView = resolvedId;
    }

    const activeView = this.panel.querySelector(`[data-result-panel-view="${resolvedId}"]`);
    const labelledBy = activeView?.querySelector('[id]')?.id;
    if (labelledBy) {
      this.panel.setAttribute('aria-labelledby', labelledBy);
    }

    window.dispatchEvent(
      new CustomEvent('result-panel:view-change', { detail: { viewId } })
    );
  },

  show(viewId) {
    if (!this.wrap) return;

    this.wrap.classList.remove('hidden', 'is-collapsed');
    this.updateToggleState();

    if (viewId) {
      this.setView(viewId);
    }

    window.dispatchEvent(
      new CustomEvent('result-panel:show', {
        detail: { viewId: viewId ?? this.activeViewId },
      })
    );
    window.dispatchEvent(new Event('resize'));
  },

  hide() {
    if (!this.wrap) return;

    this.wrap.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('result-panel:hide'));
    window.dispatchEvent(new Event('resize'));
  },

  expand() {
    if (!this.wrap) return;

    this.wrap.classList.remove('is-collapsed');
    this.updateToggleState();
    window.dispatchEvent(new Event('resize'));
  },

  collapse() {
    if (!this.wrap) return;

    this.wrap.classList.add('is-collapsed');
    this.updateToggleState();
    window.dispatchEvent(new Event('resize'));
  },

  updateToggleState() {
    if (!this.wrap) return;

    const collapsed = this.wrap.classList.contains('is-collapsed');
    const toggle = this.wrap.querySelector('[data-result-panel-toggle]');
    if (!toggle) return;

    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute(
      'aria-label',
      collapsed ? '결과 패널 펼치기' : '결과 패널 접기'
    );

    window.dispatchEvent(
      new CustomEvent('result-panel:collapse', { detail: { collapsed } })
    );
  },

  initToggle() {
    document.querySelectorAll('[data-result-panel-toggle]').forEach((btn) => {
      const wrap = btn.closest('.result-panel-wrap');
      if (!wrap) return;

      btn.addEventListener('click', () => {
        wrap.classList.toggle('is-collapsed');
        ResultPanel.updateToggleState();
        window.dispatchEvent(new Event('resize'));
      });
    });

    this.updateToggleState();
  },
};

window.ResultPanel = ResultPanel;

ResultPanel.initToggle();
