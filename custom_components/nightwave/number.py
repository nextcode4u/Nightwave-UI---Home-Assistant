"""Optional household transition duration."""
from homeassistant.components.number import NumberEntity, NumberMode
from .entity import NightwaveEntity

async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([NightwaveDuration(entry, "duration", "Transition duration")])

class NightwaveDuration(NightwaveEntity, NumberEntity):
    _attr_native_min_value = 250
    _attr_native_max_value = 2500
    _attr_native_step = 50
    _attr_native_unit_of_measurement = "ms"
    _attr_mode = NumberMode.SLIDER
    _attr_icon = "mdi:timer-outline"

    @property
    def native_value(self):
        return self.value

    async def async_set_native_value(self, value):
        self.set_value(value)
