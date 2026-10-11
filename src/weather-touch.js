// Keep forecast rows horizontally scrollable without trapping vertical page gestures.
// Separate from HACS so weather-card updates do not overwrite this adjustment.
customElements.whenDefined('weather-forecast-extended-card').then(() => {
  const proto = customElements.get('weather-forecast-extended-card').prototype;
  if (proto.__nightwaveTouchFix) return;
  proto.__nightwaveTouchFix = true;
  const updated = proto.updated;
  proto.updated = function (...args) {
    updated?.apply(this, args);
    if (!nw.active()) return;
    const root = this.shadowRoot;
    if (!root || root.querySelector('#nightwave-weather-touch')) return;
    const style = document.createElement('style');
    style.id = 'nightwave-weather-touch';
    style.textContent = '.forecast-daily-container, .forecast-hourly-container { touch-action: auto !important; }';
    root.append(style);
  };
});
