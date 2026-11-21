import { StateManager } from './state-manager';
import { AeroUISettingsBackup } from '../types';
import { CompatibilityDetector } from './compatibility';
import { getVSCode } from './vscode-proxy';

export class SettingsManager {
  constructor(
    private readonly stateManager: StateManager
  ) {}

  public async applySettings(settings: Record<string, unknown>): Promise<void> {
    const vscode = getVSCode();
    if (!vscode) return;

    const existingBackup = this.stateManager.getState().backup;
    const backup: AeroUISettingsBackup = existingBackup ? { ...existingBackup } : {};

    for (const key of Object.keys(settings)) {
      if (!CompatibilityDetector.isSettingAvailable(key)) {
        continue;
      }

      const { section, child } = this.splitKey(key);
      const config = vscode.workspace.getConfiguration(section);
      const inspection = config.inspect(child);

      if (!(key in backup)) {
        backup[key] = inspection?.globalValue;
      }

      const targetValue = settings[key];
      try {
        await config.update(child, targetValue, vscode.ConfigurationTarget.Global);
      } catch (err) {
        console.warn(`[AeroUI] Could not update setting ${key}:`, err);
      }
    }

    await this.stateManager.saveBackup(backup);
  }

  public async restoreSettings(): Promise<void> {
    const vscode = getVSCode();
    if (!vscode) return;

    const state = this.stateManager.getState();
    const backup = state.backup;

    if (!backup || Object.keys(backup).length === 0) {
      return;
    }

    for (const [key, previousVal] of Object.entries(backup)) {
      if (!CompatibilityDetector.isSettingAvailable(key)) {
        continue;
      }
      const { section, child } = this.splitKey(key);
      const config = vscode.workspace.getConfiguration(section);
      try {
        await config.update(child, previousVal === undefined ? undefined : previousVal, vscode.ConfigurationTarget.Global);
      } catch (err) {
        console.warn(`[AeroUI] Could not restore setting ${key}:`, err);
      }
    }

    await this.stateManager.clearBackup();
  }

  public getCurrentSetting(key: string): unknown {
    const vscode = getVSCode();
    if (!vscode) return undefined;

    const { section, child } = this.splitKey(key);
    return vscode.workspace.getConfiguration(section).get(child);
  }

  private splitKey(key: string): { section: string; child: string } {
    const parts = key.split('.');
    if (parts.length === 1) {
      return { section: '', child: parts[0] };
    }
    return { section: parts[0], child: parts.slice(1).join('.') };
  }
}
