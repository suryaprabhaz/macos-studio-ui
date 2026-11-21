import * as vscode from 'vscode';
import { PresetManager } from '../core/preset-manager';
import { StateManager } from '../core/state-manager';
import { PresetName, AccentColorName } from '../types';

export function registerCommands(
  context: vscode.ExtensionContext,
  presetManager: PresetManager,
  stateManager: StateManager
): void {
  // 1. Enable macOS Mode
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.enable', async () => {
      const state = stateManager.getState();
      const presetToApply = state.activePreset || 'macOS Dark';
      try {
        await presetManager.applyPreset(presetToApply, state.accentColor);
        vscode.window.showInformationMessage(`AeroUI: macOS Mode enabled (${presetToApply}).`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AeroUI: Failed to enable macOS mode: ${errorMsg}`);
      }
    })
  );

  // 2. Disable macOS Mode
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.disable', async () => {
      try {
        await presetManager.restore();
        vscode.window.showInformationMessage('AeroUI: macOS Mode disabled. Original settings restored.');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`AeroUI: Failed to restore settings: ${errorMsg}`);
      }
    })
  );

  // 3. Toggle macOS Mode
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.toggle', async () => {
      const state = stateManager.getState();
      if (state.enabled) {
        await vscode.commands.executeCommand('aeroui.disable');
      } else {
        await vscode.commands.executeCommand('aeroui.enable');
      }
    })
  );

  // 4. Select Preset
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.selectPreset', async () => {
      const presets = presetManager.getAllPresets();
      const items: (vscode.QuickPickItem & { presetName: PresetName })[] = presets.map((p) => ({
        label: p.name,
        description: p.themeLabel,
        detail: p.description,
        presetName: p.name
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select an AeroUI macOS Preset'
      });

      if (selected) {
        await presetManager.applyPreset(selected.presetName);
        vscode.window.showInformationMessage(`AeroUI: Switched to preset "${selected.presetName}".`);
      }
    })
  );

  // 5. Restore Previous Appearance
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.restorePrevious', async () => {
      await vscode.commands.executeCommand('aeroui.disable');
    })
  );

  // 6. Show Status
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.showStatus', async () => {
      const state = stateManager.getState();
      const statusText = state.enabled
        ? `AeroUI is ACTIVE (Preset: ${state.activePreset}, Accent: ${state.accentColor})`
        : 'AeroUI is INACTIVE (Original settings in use)';
      vscode.window.showInformationMessage(statusText);
    })
  );

  // 7. Open Settings / Dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand('aeroui.openSettings', async () => {
      await vscode.commands.executeCommand('aeroui.dashboardView.focus');
    })
  );
}
