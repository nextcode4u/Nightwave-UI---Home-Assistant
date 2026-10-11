# Reusable UI features

Nightwave includes the following reusable styles, animations, and controls.

| Area | Result |
| --- | --- |
| Persistent particles and animated aurora | Persistent animated background with configurable dashboard scope |
| Liquid view reveal | Organic reveal using native browser animation; configurable duration |
| Sculpted SVG icons | Runtime depth and shading for existing SVG icons |
| Device and weather animation | State-aware effects and animated weather scenery |
| Weather scrolling fix | Included; scoped to selected dashboards |
| Large sky toggles and brightness sliders | Dimensional controls with animated state changes |
| Tile icon housing and entrance | Raised icon housing and animated tile entrance |
| Fonts and theme | Bundled fonts, theme variables, and embedded purple SVG background |
| Thermostat | Example updated to the latest dial strokes, handle depth and numeric typography; Mode/Preset/Fan controls retained |
| Standard button cards | Added missing raised icon housing and pressed state |
| Compact entity toggles | Added recessed track and raised thumb styling |
| Foldout controls | Added generic `nightwave-details`, collapsed by default, with configurable native entity rows |
| Button gleam, inset inputs, sliding tab indicator, completion feedback, reveal and mobile sheets | Extracted as opt-in CSS primitives for custom card authors; settings card uses the button/input primitives |
| Glance card system link | Configurable local navigation path |
| Energy chart colors | Coordinated grid, solar, and return colors |

Optional third-party cards and card-mod remain separate dependencies; see the main README.

## Custom card primitives

Once Nightwave has loaded, `window.Nightwave.styles.surfaces` supplies CSS that can be included in a custom card's own shadow root. Source: `assets/styles/surfaces.css`.

Classes: `nw-button`, `nw-input`, `nw-inset`, `nw-foldout` (on `details`), `nw-dialog` (on a native `dialog`), `nw-tabs` and `nw-complete`. Set `--nw-tab-index` to the selected tab’s zero-based index; the tab strip uses equal widths controlled by `--nw-tab-width` (110px by default). These provide styling only. Your card still owns its actions, labels, dialog focus/dismissal, and data. The classes are opt-in so unrelated cards are not restyled unexpectedly.

```js
const style = document.createElement('style');
style.textContent = window.Nightwave.styles.surfaces;
this.shadowRoot.append(style);
// Apply class="nw-button" to your native button, etc.
```

The background and CSS are embedded in the integration’s frontend bundle.
