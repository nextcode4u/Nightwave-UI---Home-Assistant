"""Optional household preference switches for automations."""
from homeassistant.components.switch import SwitchEntity
from .const import FEATURES
from .entity import NightwaveEntity

async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities(NightwaveSwitch(entry, key, label) for key, label in FEATURES.items())

class NightwaveSwitch(NightwaveEntity, SwitchEntity):
    _attr_icon = "mdi:palette-outline"

    @property
    def is_on(self):
        return self.value

    async def async_turn_on(self, **kwargs):
        self.set_value(True)

    async def async_turn_off(self, **kwargs):
        self.set_value(False)
