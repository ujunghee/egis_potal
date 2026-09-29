/** 환경 시각화 도구 — 맵 유형 탭 전환 (jQuery) */
jQuery(function ($) {
  const $tabs = $('[data-vt-tabs]');
  if (!$tabs.length) return;

  const $vtTool = $('.vt-tool');
  const $panels = $('[data-vt-panel]');
  const $search = $('[data-vt-relation-search]');
  const $fsExitBtn = $('[data-vt-fullscreen-exit]');

  const PANEL_FADE_MS = 280;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FS_BODY_CLASS = {
    treemap: 'is-vt-tm-fullscreen',
    relation: 'is-vt-relation-fullscreen',
    expand: 'is-vt-expand-fullscreen',
  };

  let panelSwitchLock = false;

  const isVtFullscreen = () =>
    $('body').hasClass('is-vt-tm-fullscreen') ||
    $('body').hasClass('is-vt-relation-fullscreen') ||
    $('body').hasClass('is-vt-expand-fullscreen');

  const getActivePanelName = () => {
    const $active = $panels.filter(function () {
      return !this.hidden;
    }).first();
    return $active.attr('data-vt-panel') || null;
  };

  const syncBodyFullscreenClass = (name) => {
    $('body').removeClass(
      `${FS_BODY_CLASS.treemap} ${FS_BODY_CLASS.relation} ${FS_BODY_CLASS.expand}`,
    );
    if (name && FS_BODY_CLASS[name]) {
      $('body').addClass(FS_BODY_CLASS[name]);
    }
  };

  const syncAllFullscreenUI = (activeName) => {
    window.VtTreemap?.setFullscreenUI?.(activeName === 'treemap');
    window.VtRelationMap?.setFullscreenUI?.(activeName === 'relation');
    window.VtExpandMap?.setFullscreenUI?.(activeName === 'expand');
    window.syncVtFullscreenExit?.();
  };

  const exitAllVtFullscreen = () => {
    window.VtTreemap?.exitFullscreen?.();
    window.VtRelationMap?.exitFullscreen?.();
    window.VtExpandMap?.exitFullscreen?.();
  };

  const refreshActiveMap = (name) => {
    if (name === 'treemap') window.VtTreemap?.show?.();
    if (name === 'relation') window.VtRelationMap?.show?.();
    if (name === 'expand') window.VtExpandMap?.show?.();
  };

  window.syncVtFullscreenExit = () => {
    if (!$fsExitBtn.length) return;
    $fsExitBtn.prop('hidden', !isVtFullscreen());
  };

  $fsExitBtn.on('click', () => {
    exitAllVtFullscreen();
  });

  $(document).on('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!isVtFullscreen()) return;
    exitAllVtFullscreen();
  });

  const applyPanelSwitch = (name, keepFullscreen) => {
    if (keepFullscreen) {
      syncBodyFullscreenClass(name);
      syncAllFullscreenUI(name);
    } else {
      syncBodyFullscreenClass(null);
      syncAllFullscreenUI(null);
    }

    $panels.each(function () {
      const $panel = $(this);
      $panel.prop('hidden', $panel.attr('data-vt-panel') !== name);
    });

    $search.prop('hidden', name !== 'relation' && name !== 'expand');
  };

  const fadeInPanel = ($panel, onDone) => {
    if (!$panel.length || reduceMotion) {
      onDone?.();
      return;
    }
    $panel.addClass('is-vt-panel-enter');
    window.requestAnimationFrame(() => {
      $panel.addClass('is-vt-panel-enter-active');
      window.setTimeout(() => {
        $panel.removeClass('is-vt-panel-enter is-vt-panel-enter-active');
        onDone?.();
      }, PANEL_FADE_MS);
    });
  };

  const showPanel = (name, options) => {
    const immediate = options && options.immediate;
    const prevName = getActivePanelName();
    if (prevName === name) return;

    const keepFullscreen = isVtFullscreen();
    const $fromPanel = prevName ? $(`[data-vt-panel="${prevName}"]`) : $();
    const $toPanel = $(`[data-vt-panel="${name}"]`);

    const commit = (skipFade) => {
      applyPanelSwitch(name, keepFullscreen);
      const afterFade = () => refreshActiveMap(name);
      if (skipFade || reduceMotion) {
        afterFade();
        return;
      }
      fadeInPanel($toPanel, afterFade);
    };

    if (immediate || reduceMotion || !$fromPanel.length || !$vtTool.length) {
      commit(true);
      return;
    }

    if (panelSwitchLock) return;
    panelSwitchLock = true;
    $vtTool.addClass('is-vt-panel-switching');
    $fromPanel.addClass('is-vt-panel-leave');

    window.setTimeout(() => {
      $fromPanel.removeClass('is-vt-panel-leave');
      commit(false);
      $vtTool.removeClass('is-vt-panel-switching');
      panelSwitchLock = false;
    }, PANEL_FADE_MS);
  };

  $tabs.on('change', 'input[name="vt-map-type"]', function () {
    showPanel($(this).val());
  });

  const $checked = $tabs.find('input[name="vt-map-type"]:checked');
  showPanel($checked.val() || 'treemap', { immediate: true });
});
