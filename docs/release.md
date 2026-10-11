# Release checklist

- Initial release 0.3.1: full integration and frontend bundle in one repository.
- Repository and maintainer metadata point to `nextcode4u/Nightwave-UI---Home-Assistant`.
- Metadata helper: `node scripts/release-metadata.mjs OWNER/REPO @MAINTAINER`. It writes only the manifest; it does not create or publish a repository.
- Run `npm run build`, `npm run check`, Python validation tests, and all three browser test scripts.
- HACS category is **Integration**. Download includes the complete `custom_components/nightwave` folder and its bundled frontend. Do not register this release as a Dashboard repository.
- HACS validation skips only the `brands` check: the integration has not been submitted to the Home Assistant brands repository. This is separate from custom-repository installation.
- Confirm a clean HACS install/update/uninstall against the published GitHub repository before calling it a verified public release.
- Remove any previous standalone Nightwave dashboard resource before integration setup.
- After removal/unload, refresh clients to remove already-running frontend effects. Deleting the integration does not erase browser preference storage; use “Use defaults” first if desired.

Implementation references: [Home Assistant static paths](https://developers.home-assistant.io/blog/2024/06/18/async_register_static_paths/), [config flows](https://developers.home-assistant.io/docs/core/integration/config_flow/), [HACS integration packaging](https://hacs.dev/docs/publish/integration/).
