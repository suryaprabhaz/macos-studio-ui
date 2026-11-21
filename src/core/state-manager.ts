import * as vscode from 'vscode';
import { AeroUIState, PresetName, AccentColorName, AeroUISettingsBackup } from '../types';

export class StateManager {
  private static readonly STATE_KEY = 'aeroui.state';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public getState(): AeroUIState {
    const raw = this.context.globalState.get<AeroUIState>(StateManager.STATE_KEY);
    return {
      enabled: raw?.enabled ?? false,
      activePreset: raw?.activePreset ?? 'macOS Dark',
      accentColor: raw?.accentColor ?? 'appleBlue',
      backup: raw?.backup ?? null,
      lastAppliedTimestamp: raw?.lastAppliedTimestamp
    };
  }

  public async setEnabled(enabled: boolean): Promise<void> {
    const state = this.getState();
    state.enabled = enabled;
    await this.context.globalState.update(StateManager.STATE_KEY, state);
  }

  public async setActivePreset(preset: PresetName): Promise<void> {
    const state = this.getState();
    state.activePreset = preset;
    await this.context.globalState.update(StateManager.STATE_KEY, state);
  }

  public async setAccentColor(accent: AccentColorName): Promise<void> {
    const state = this.getState();
    state.accentColor = accent;
    await this.context.globalState.update(StateManager.STATE_KEY, state);
  }

  public async saveBackup(backup: AeroUISettingsBackup): Promise<void> {
    const state = this.getState();
    // Only save backup if there is no existing backup to avoid overwriting original user configuration
    if (!state.backup || Object.keys(state.backup).length === 0) {
      state.backup = backup;
      await this.context.globalState.update(StateManager.STATE_KEY, state);
    }
  }

  public async clearBackup(): Promise<void> {
    const state = this.getState();
    state.backup = null;
    await this.context.globalState.update(StateManager.STATE_KEY, state);
  }
}
