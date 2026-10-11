"""UI setup and household defaults."""
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from .const import DEFAULTS, DOMAIN, FEATURES
from .settings import validate_patch

def schema(values, setup=False):
    fields = {vol.Required("dashboard", default=values["dashboard"]): str}
    if not setup:
        fields.update({vol.Required(key, default=values[key]): bool for key in FEATURES})
        fields[vol.Required("duration", default=values["duration"])] = vol.All(vol.Coerce(int), vol.Range(min=250, max=2500))
        fields[vol.Optional("fan_entities", default=values["fan_entities"])] = str
    return vol.Schema(fields)

class NightwaveConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        errors = {}
        if user_input is not None:
            try:
                options = validate_patch(user_input)
                return self.async_create_entry(title="Nightwave", data={}, options=options)
            except ValueError:
                errors["base"] = "invalid_settings"
        return self.async_show_form(step_id="user", data_schema=schema(DEFAULTS, True), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return NightwaveOptionsFlow()

class NightwaveOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        errors = {}
        if user_input is not None:
            try:
                return self.async_create_entry(title="", data=validate_patch(user_input))
            except ValueError:
                errors["base"] = "invalid_settings"
        return self.async_show_form(step_id="init", data_schema=schema({**DEFAULTS, **self.config_entry.options}), errors=errors)
