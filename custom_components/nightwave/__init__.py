"""Nightwave: local presentation settings, never household device control."""
from pathlib import Path
import voluptuous as vol
from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from .const import DEFAULTS, DOMAIN, SIGNAL, VERSION
from .settings import validate_patch

PLATFORMS = ["switch", "number"]
URL = f"/nightwave/nightwave-ui.js?v={VERSION}&integration=true"

@callback
def update_settings(hass, entry, patch):
    """Apply a validated patch; preserve other settings on concurrent updates."""
    hass.config_entries.async_update_entry(entry, options={**entry.options, **validate_patch(patch)})

@callback
@websocket_api.websocket_command({vol.Required("type"): "nightwave/settings"})
def websocket_settings(hass, connection, msg):
    entry = hass.data.get(DOMAIN, {}).get("entry")
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Nightwave integration is not loaded")
        return
    connection.send_result(msg["id"], {"settings": {**DEFAULTS, **entry.options}})

@callback
@websocket_api.websocket_command({vol.Required("type"): "nightwave/settings/update", vol.Required("settings"): dict})
@websocket_api.require_admin
def websocket_update(hass, connection, msg):
    entry = hass.data.get(DOMAIN, {}).get("entry")
    if entry is None:
        connection.send_error(msg["id"], "not_loaded", "Nightwave integration is not loaded")
        return
    try:
        update_settings(hass, entry, msg["settings"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_settings", str(err))
        return
    connection.send_result(msg["id"], {"settings": {**DEFAULTS, **entry.options}})

async def async_setup(hass, config):
    hass.data.setdefault(DOMAIN, {})
    await hass.http.async_register_static_paths([
        StaticPathConfig("/nightwave/nightwave-ui.js", str(Path(__file__).parent / "www" / "nightwave-ui.js"), False)
    ])
    websocket_api.async_register_command(hass, websocket_settings)
    websocket_api.async_register_command(hass, websocket_update)
    return True

async def async_setup_entry(hass, entry):
    hass.data[DOMAIN]["entry"] = entry
    entry.async_on_unload(entry.add_update_listener(async_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    frontend.add_extra_js_url(hass, URL)
    return True

async def async_options_updated(hass, entry):
    async_dispatcher_send(hass, SIGNAL)

async def async_unload_entry(hass, entry):
    if await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        frontend.remove_extra_js_url(hass, URL)
        hass.data[DOMAIN].pop("entry", None)
        return True
    return False
