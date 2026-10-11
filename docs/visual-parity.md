# Reusable UI comparison — 0.3.1

Compared the installed custom frontend resources, theme values, and unique card styling blocks on October 10, 2026. Household configuration and raw comparison snapshots remain outside this public repository.

| Area | Result |
| --- | --- |
| Persistent particles and animated aurora | Same live implementation; dashboard scope is configurable |
| Liquid view reveal | Same live geometry and native animation; duration configurable |
| Sculpted SVG icons | Same runtime shading; no replacement icon pack |
| Device and weather animation | Same state-aware effects and weather scenery |
| Weather scrolling fix | Included; scoped to selected dashboards |
| Large sky toggles and brightness sliders | CSS matches the live styling |
| Tile icon housing and entrance | Included; live layout-specific stagger timing is not copied |
| Fonts and theme | Included; exact static purple SVG background now embedded |
| Thermostat | Example updated to the latest dial strokes, handle depth and numeric typography; Mode/Preset/Fan controls retained |
| Standard button cards | Added missing raised icon housing and pressed state |
| Compact entity toggles | Added recessed track and raised thumb styling |
| Foldout controls | Added generic `nightwave-details`, collapsed by default, with configurable native entity rows |
| Button gleam, inset inputs, sliding tab indicator, completion feedback, reveal and mobile sheets | Extracted as opt-in CSS primitives for custom card authors; settings card uses the button/input primitives |
| Glance card system link | Configurable local path instead of the original household-specific link |
| Energy chart colors | Added generic theme colors; no account, meter or pricing configuration |

## Deliberately excluded

Household dashboards, view order, entity mappings, device-specific remote interfaces, meal planning, budgeting, presence, radio discovery, associated automations and backend services. Old unreferenced navigation bars, superseded backgrounds, and the discarded colorful icon pack are not part of the current visual baseline.

The reusable CSS extracted from those private components is included independently. It does not inject styles into or recreate those components. Optional third-party cards and card-mod remain separate dependencies; see the main README.

## Custom card primitives

Once Nightwave has loaded, `window.Nightwave.styles.surfaces` supplies CSS that can be included in a custom card's own shadow root. Source: `assets/styles/surfaces.css`.

Classes: `nw-button`, `nw-input`, `nw-inset`, `nw-foldout` (on `details`), `nw-dialog` (on a native `dialog`), `nw-tabs` and `nw-complete`. Set `--nw-tab-index` to the selected tab’s zero-based index; the tab strip uses equal widths controlled by `--nw-tab-width` (110px by default). These provide styling only. Your card still owns its actions, labels, dialog focus/dismissal, and data. The classes are opt-in so unrelated cards are not restyled unexpectedly.

```js
const style = document.createElement('style');
style.textContent = window.Nightwave.styles.surfaces;
this.shadowRoot.append(style);
// Apply class="nw-button" to your native button, etc.
```

The exact background and CSS are embedded in the integration's frontend bundle; no extra local asset paths or household URLs are required.
