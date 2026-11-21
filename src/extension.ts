import * as vscode from 'vscode';
import { StateManager } from './core/state-manager';
import { SettingsManager } from './core/settings-manager';
import { PresetManager } from './core/preset-manager';
import { AeroUIViewProvider } from './providers/aeroui-view-provider';
import { registerCommands } from './commands';

export function activate(context: vscode.ExtensionContext): void {
  const stateManager = new StateManager(context);
  const settingsManager = new SettingsManager(stateManager);
  const presetManager = new PresetManager(settingsManager, stateManager);

  // Register commands
  registerCommands(context, presetManager, stateManager);

  // Register dashboard webview provider
  const provider = new AeroUIViewProvider(
    context.extensionUri,
    presetManager,
    stateManager,
    settingsManager
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('aeroui.dashboardView', provider)
  );
}

export function deactivate(): void {
  // Graceful cleanup if needed
}
