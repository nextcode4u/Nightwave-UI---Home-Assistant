"""Optional entities follow integration options; no separate state store."""
from homeassistant.helpers.entity import Entity, EntityCategory
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from .const import DEFAULTS, DOMAIN, SIGNAL
from . import update_settings

class NightwaveEntity(Entity):
    _attr_should_poll = False
    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_entity_registry_enabled_default = False

    def __init__(self, entry, key, name):
        self.entry, self.key = entry, key
        self._attr_name = name
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = {"identifiers": {(DOMAIN, entry.entry_id)}, "name": "Nightwave", "manufacturer": "Nightwave", "model": "UI preferences"}

    @property
    def value(self):
        return self.entry.options.get(self.key, DEFAULTS[self.key])

    async def async_added_to_hass(self):
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL, self.async_write_ha_state))

    def set_value(self, value):
        update_settings(self.hass, self.entry, {self.key: value})
        self.async_write_ha_state()
