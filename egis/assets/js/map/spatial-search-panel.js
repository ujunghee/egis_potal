/**

 * Spatial Search Panel — 공간검색 도구 패널

 *

 * 커스텀 이벤트 (window):

 * - spatial-search-panel:open

 * - spatial-search-panel:close

 * - spatial-search-panel:collapse  detail: { collapsed }

 * - spatial-search:tool-change       detail: { tool, button }

 * - spatial-search:clear             detail: { button }

 */



const SpatialSearchPanel = {

  wrap: null,

  panel: null,

  toggle: null,

  tools: [],

  drawTools: [],

  activeTool: null,



  init() {

    this.wrap = document.querySelector('.map-navigation-wrap');

    this.panel = document.querySelector('[data-spatial-search-panel]');

    this.toggle = document.querySelector('[data-spatial-search-toggle]');

    if (!this.panel) return;



    this.tools = Array.from(this.panel.querySelectorAll('[data-spatial-search-tool]'));

    this.drawTools = this.tools.filter((btn) => btn.dataset.spatialSearchTool !== 'eraser');

    this.bindTools();

    this.bindToggle();

    this.initTooltips();

  },



  initTooltips() {

    if (typeof window.initIntegratedSearchTooltip !== 'function') return;



    this.tools.forEach((btn) => {

      window.initIntegratedSearchTooltip(btn);

    });

  },



  bindTools() {

    this.tools.forEach((btn) => {

      btn.addEventListener('click', (event) => {

        event.preventDefault();

        const tool = btn.dataset.spatialSearchTool;

        if (!tool) return;



        if (tool === 'eraser') {

          this.clearSelection();

          window.dispatchEvent(

            new CustomEvent('spatial-search:clear', {

              detail: { button: btn },

            })

          );

          return;

        }



        this.selectTool(tool, btn);

      });

    });

  },



  bindToggle() {

    this.toggle?.addEventListener('click', () => {

      if (!this.isModeActive()) return;



      if (this.isCollapsed()) {

        this.expand();

      } else {

        this.collapse();

      }

    });

  },



  clearSelection() {

    this.activeTool = null;



    this.drawTools.forEach((item) => {

      item.classList.remove('is-active');

      item.setAttribute('aria-pressed', 'false');

    });



    window.dispatchEvent(

      new CustomEvent('spatial-search:tool-change', {

        detail: { tool: null, button: null },

      })

    );

  },



  selectTool(tool, button) {

    if (this.activeTool === tool) {

      this.clearSelection();

      return;

    }



    this.activeTool = tool;



    this.drawTools.forEach((item) => {

      const isActive = item === button;

      item.classList.toggle('is-active', isActive);

      item.setAttribute('aria-pressed', String(isActive));

    });



    window.dispatchEvent(

      new CustomEvent('spatial-search:tool-change', {

        detail: { tool, button },

      })

    );

  },



  isModeActive() {

    return this.wrap?.classList.contains('is-spatial-search-active');

  },



  isCollapsed() {

    return this.wrap?.classList.contains('is-spatial-search-collapsed');

  },



  isOpen() {

    return this.isModeActive();

  },



  updateToggleState() {

    if (!this.toggle) return;



    const collapsed = this.isCollapsed();

    this.toggle.setAttribute('aria-expanded', String(!collapsed));

    this.toggle.setAttribute(

      'aria-label',

      collapsed ? '공간검색 도구 패널 펼치기' : '공간검색 도구 패널 접기'

    );



    window.dispatchEvent(

      new CustomEvent('spatial-search-panel:collapse', {

        detail: { collapsed },

      })

    );

  },



  notifyLayoutChange() {

    requestAnimationFrame(() => {

      window.dispatchEvent(new Event('resize'));

    });

  },



  open() {

    if (!this.panel) return;



    this.wrap?.classList.add('is-spatial-search-active');



    window.ResultPanel?.hide?.();

    document.querySelector('[data-integrated-search-layer-info-panel]')?.setAttribute('hidden', '');

    window.ResultPanel?.wrap?.classList.remove('has-layer-info');



    this.clearSelection();

    this.wrap?.classList.remove('is-spatial-search-collapsed');

    this.panel.classList.add('is-open');

    this.panel.setAttribute('aria-hidden', 'false');

    this.toggle?.removeAttribute('hidden');

    this.updateToggleState();



    window.dispatchEvent(new CustomEvent('spatial-search-panel:open', { detail: { panel: this.panel } }));

    this.notifyLayoutChange();

  },



  close() {

    if (!this.panel) return;



    this.clearSelection();

    this.wrap?.classList.remove('is-spatial-search-active', 'is-spatial-search-collapsed');

    this.panel.classList.remove('is-open');

    this.panel.setAttribute('aria-hidden', 'true');

    this.toggle?.setAttribute('hidden', '');



    window.dispatchEvent(new CustomEvent('spatial-search-panel:close', { detail: { panel: this.panel } }));

    this.notifyLayoutChange();

  },



  collapse() {

    if (!this.isModeActive()) return;



    this.wrap?.classList.add('is-spatial-search-collapsed');

    this.updateToggleState();

    this.notifyLayoutChange();

  },



  expand() {

    if (!this.isModeActive()) return;



    this.wrap?.classList.remove('is-spatial-search-collapsed');

    this.updateToggleState();

    this.notifyLayoutChange();

  },



  toggle() {

    if (this.isModeActive()) {

      this.close();

    } else {

      this.open();

    }

  },

};



window.SpatialSearchPanel = SpatialSearchPanel;



function bootSpatialSearchPanel() {

  SpatialSearchPanel.init();

}



if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', bootSpatialSearchPanel);

} else {

  bootSpatialSearchPanel();

}

