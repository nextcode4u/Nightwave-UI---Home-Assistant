"""Nightwave settings shared by the integration and its optional entities."""
DOMAIN = "nightwave"
VERSION = "0.3.2"
FEATURES = {
    "theme": "Theme", "fonts": "Fonts", "depth": "Card depth",
    "icons": "Sculpted icons", "particles": "Particles and aurora",
    "transitions": "Liquid transitions", "motion": "Animated device icons",
    "weather": "Animated weather", "controls": "Custom toggles",
    "sliders": "Custom sliders", "dial": "Thermostat dial details",
    "reduced_effects": "Reduced effects",
}
DEFAULTS = {**dict.fromkeys(FEATURES, True), "reduced_effects": False,
            "dashboard": "lovelace", "duration": 1000, "fan_entities": ""}
SIGNAL = f"{DOMAIN}_updated"
