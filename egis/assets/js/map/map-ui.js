/**
 * Map UI shared helpers.
 * Feature scripts depend on this file for lifecycle and common state handling.
 */
const MapUi = {
  ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  },

  show(element) {
    element?.removeAttribute('hidden');
  },

  hide(element) {
    element?.setAttribute('hidden', '');
  },

  isHidden(element) {
    return !element || element.hasAttribute('hidden');
  },

  setExpanded(element, expanded) {
    element?.setAttribute('aria-expanded', String(expanded));
  },

  disableMapPropagation(element) {
    if (!element || element.dataset.mapPropagationDisabled === 'true' || typeof L === 'undefined') return;
    L.DomEvent.disableClickPropagation(element);
    L.DomEvent.disableScrollPropagation(element);
    L.DomEvent.on(element, 'pointerdown pointerup', L.DomEvent.stopPropagation);
    element.dataset.mapPropagationDisabled = 'true';
  }
};

window.MapUi = MapUi;
