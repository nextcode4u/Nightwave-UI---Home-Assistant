"""Validate settings independently of HA (no third-party requirements)."""
import importlib.util
import sys
import types
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]/'custom_components/nightwave'
package=types.ModuleType('nightwave_test');package.__path__=[str(ROOT)];sys.modules['nightwave_test']=package
from nightwave_test.settings import validate_patch
from nightwave_test.const import DEFAULTS
class SettingsTests(unittest.TestCase):
    def test_defaults_and_normalization(self):
        self.assertEqual(validate_patch(DEFAULTS),DEFAULTS)
        self.assertEqual(validate_patch({'dashboard':' /lovelace/, dashboard-tablet,lovelace '}),{'dashboard':'lovelace,dashboard-tablet'})
    def test_reject_invalid_input(self):
        for patch in [{'theme':'false'},{'duration':True},{'duration':float('nan')},{'duration':249},{'duration':2501},{'dashboard':''},{'dashboard':'../config'},{'dashboard':'lovelace?x=y'},{'fan_entities':'light.demo'},{'unknown':True},None,[]]:
            with self.subTest(patch=patch),self.assertRaises(ValueError):validate_patch(patch)
    def test_partial_update(self):
        patch=validate_patch({'particles':False})
        self.assertEqual(patch,{'particles':False})
        self.assertTrue(DEFAULTS['particles'])
if __name__=='__main__':unittest.main()
