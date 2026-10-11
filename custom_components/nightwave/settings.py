"""Strict, independently testable settings validation."""
import re
from .const import DEFAULTS, FEATURES

def validate_patch(values):
    if not isinstance(values, dict) or values.keys() - DEFAULTS.keys():
        raise ValueError("Unknown Nightwave setting")
    result = {}
    for key, value in values.items():
        if key in FEATURES:
            if type(value) is not bool:
                raise ValueError(f"{key} must be true or false")
        elif key == "duration":
            if type(value) not in (int, float) or not 250 <= value <= 2500:
                raise ValueError("Duration must be between 250 and 2500 ms")
            value = round(value)
        elif key == "dashboard":
            if not isinstance(value, str) or len(value) > 500:
                raise ValueError("Enter dashboard URL prefixes separated by commas")
            parts = [p.strip().strip("/") for p in value.split(",")]
            if not parts or any(not re.fullmatch(r"[A-Za-z0-9_-]+", p) for p in parts):
                raise ValueError("Use URL prefixes such as lovelace,dashboard-tablet")
            value = ",".join(dict.fromkeys(parts))
        elif key == "fan_entities":
            if not isinstance(value, str) or len(value) > 2000:
                raise ValueError("Enter fan entity IDs separated by commas")
            parts = [p.strip() for p in value.split(",") if p.strip()]
            if any(not re.fullmatch(r"(?:fan|switch)\.[a-z0-9_]+", p) for p in parts):
                raise ValueError("Fan entities must be fan.* or switch.* IDs")
            value = ",".join(dict.fromkeys(parts))
        result[key] = value
    return result
