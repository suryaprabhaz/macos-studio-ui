import * as assert from 'assert';
import { StateManager } from '../../core/state-manager';
import { PresetManager } from '../../core/preset-manager';
import { SettingsManager } from '../../core/settings-manager';
import { PresetDefinition } from '../../types';

describe('AeroUI Core Tests', () => {
  it('PresetManager should have all 6 macOS presets loaded', () => {
    // Mock ExtensionContext globalState
    const storage = new Map<string, unknown>();
    const mockContext = {
      globalState: {
        get: <T>(key: string) => storage.get(key) as T,
        update: (key: string, value: unknown) => {
          storage.set(key, value);
          return Promise.resolve();
        }
      }
    } as any;

    const stateManager = new StateManager(mockContext);
    const settingsManager = new SettingsManager(stateManager);
    const presetManager = new PresetManager(settingsManager, stateManager);

    const presets = presetManager.getAllPresets();
    assert.strictEqual(presets.length, 6);
    const names = presets.map((p: PresetDefinition) => p.name);
    assert.ok(names.includes('macOS Dark'));
    assert.ok(names.includes('macOS Light'));
    assert.ok(names.includes('macOS Midnight'));
    assert.ok(names.includes('Minimal'));
    assert.ok(names.includes('Glass-inspired'));
    assert.ok(names.includes('Classic'));
  });

  it('StateManager backup integrity: enabling twice must preserve first backup', async () => {
    const storage = new Map<string, unknown>();
    const mockContext = {
      globalState: {
        get: <T>(key: string) => storage.get(key) as T,
        update: (key: string, value: unknown) => {
          storage.set(key, value);
          return Promise.resolve();
        }
      }
    } as any;

    const stateManager = new StateManager(mockContext);
    await stateManager.saveBackup({ 'workbench.colorTheme': 'Original Theme' });
    assert.strictEqual(stateManager.getState().backup?.['workbench.colorTheme'], 'Original Theme');

    // Second backup attempt should NOT overwrite the original
    await stateManager.saveBackup({ 'workbench.colorTheme': 'Overwritten Theme' });
    assert.strictEqual(stateManager.getState().backup?.['workbench.colorTheme'], 'Original Theme');
  });
});
