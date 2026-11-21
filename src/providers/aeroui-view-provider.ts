import * as vscode from 'vscode';
import { PresetManager } from '../core/preset-manager';
import { StateManager } from '../core/state-manager';
import { SettingsManager } from '../core/settings-manager';
import { WebviewMessage, PresetName, AccentColorName } from '../types';

export class AeroUIViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly presetManager: PresetManager,
    private readonly stateManager: StateManager,
    private readonly settingsManager: SettingsManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
      try {
        switch (data.command) {
          case 'enable':
            await vscode.commands.executeCommand('aeroui.enable');
            this.sendState();
            break;
          case 'disable':
            await vscode.commands.executeCommand('aeroui.disable');
            this.sendState();
            break;
          case 'toggle':
            await vscode.commands.executeCommand('aeroui.toggle');
            this.sendState();
            break;
          case 'selectPreset':
            if (data.preset) {
              await this.presetManager.applyPreset(data.preset);
              this.sendState();
            }
            break;
          case 'setAccent':
            if (data.accent) {
              const state = this.stateManager.getState();
              await this.presetManager.applyPreset(state.activePreset, data.accent);
              this.sendState();
            }
            break;
          case 'restore':
            await vscode.commands.executeCommand('aeroui.restorePrevious');
            this.sendState();
            break;
          case 'updateSetting':
            if (data.key && data.value !== undefined) {
              await this.settingsManager.applySettings({ [data.key]: data.value });
              this.sendState();
            }
            break;
          case 'getState':
            this.sendState();
            break;
        }
      } catch (error) {
        console.error('[AeroUI] Webview message handling error:', error);
      }
    });
  }

  public sendState(): void {
    if (this._view) {
      const state = this.stateManager.getState();
      const currentCursorBlinking = this.settingsManager.getCurrentSetting('editor.cursorBlinking');
      const currentMinimap = this.settingsManager.getCurrentSetting('editor.minimap.enabled');
      const currentLigatures = this.settingsManager.getCurrentSetting('editor.fontLigatures');

      this._view.webview.postMessage({
        type: 'stateUpdate',
        state,
        settings: {
          cursorBlinking: currentCursorBlinking,
          minimap: currentMinimap,
          ligatures: currentLigatures
        }
      });
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AeroUI Control Center</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
      padding: 14px;
      margin: 0;
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-widget-border, #33333333);
    }
    .title {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.2px;
    }
    .badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-active {
      background: #34C75922;
      color: #34C759;
      border: 1px solid #34C75955;
    }
    .badge-inactive {
      background: #8E8E9322;
      color: #8E8E93;
      border: 1px solid #8E8E9355;
    }
    .section {
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border, #33333322);
      border-radius: 8px;
      padding: 10px;
    }
    .button-group {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      width: 100%;
      transition: opacity 0.15s ease;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground, #44444433);
      color: var(--vscode-button-secondaryForeground, inherit);
    }
    select {
      width: 100%;
      padding: 6px;
      border-radius: 6px;
      background: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      font-size: 12px;
      margin-top: 4px;
    }
    .accent-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-top: 8px;
    }
    .accent-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
    }
    .accent-btn.active {
      border-color: #FFFFFF;
      box-shadow: 0 0 0 1px #00000088;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">AeroUI macOS</div>
    <span id="statusBadge" class="badge badge-inactive">Inactive</span>
  </div>

  <div class="section">
    <div class="section-title">Quick Action</div>
    <div class="card">
      <button id="toggleBtn">Enable macOS Mode</button>
      <div class="button-group">
        <button id="restoreBtn" class="secondary">Restore Defaults</button>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Appearance Presets</div>
    <div class="card">
      <label for="presetSelect">Preset</label>
      <select id="presetSelect">
        <option value="macOS Dark">macOS Dark</option>
        <option value="macOS Light">macOS Light</option>
        <option value="macOS Midnight">macOS Midnight</option>
        <option value="Minimal">Minimal</option>
        <option value="Glass-inspired">Glass-inspired</option>
        <option value="Classic">Classic</option>
      </select>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Apple Accent Colors</div>
    <div class="card">
      <div class="accent-grid">
        <button class="accent-btn" data-color="appleBlue" style="background:#007AFF;" title="Blue"></button>
        <button class="accent-btn" data-color="applePurple" style="background:#AF52DE;" title="Purple"></button>
        <button class="accent-btn" data-color="applePink" style="background:#FF2D55;" title="Pink"></button>
        <button class="accent-btn" data-color="appleOrange" style="background:#FF9500;" title="Orange"></button>
        <button class="accent-btn" data-color="appleGreen" style="background:#34C759;" title="Green"></button>
        <button class="accent-btn" data-color="appleGraphite" style="background:#8E8E93;" title="Graphite"></button>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    const toggleBtn = document.getElementById('toggleBtn');
    const restoreBtn = document.getElementById('restoreBtn');
    const presetSelect = document.getElementById('presetSelect');
    const statusBadge = document.getElementById('statusBadge');
    const accentBtns = document.querySelectorAll('.accent-btn');

    toggleBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggle' });
    });

    restoreBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'restore' });
    });

    presetSelect.addEventListener('change', (e) => {
      vscode.postMessage({ command: 'selectPreset', preset: e.target.value });
    });

    accentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const accent = btn.getAttribute('data-color');
        vscode.postMessage({ command: 'setAccent', accent: accent });
      });
    });

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'stateUpdate') {
        const state = msg.state;
        if (state.enabled) {
          statusBadge.textContent = 'Active';
          statusBadge.className = 'badge badge-active';
          toggleBtn.textContent = 'Disable macOS Mode';
        } else {
          statusBadge.textContent = 'Inactive';
          statusBadge.className = 'badge badge-inactive';
          toggleBtn.textContent = 'Enable macOS Mode';
        }

        if (state.activePreset) {
          presetSelect.value = state.activePreset;
        }

        accentBtns.forEach(b => {
          if (b.getAttribute('data-color') === state.accentColor) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      }
    });

    // Request initial state on load
    vscode.postMessage({ command: 'getState' });
  </script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
