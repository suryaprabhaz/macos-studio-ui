import * as vscode from 'vscode';
import { PresetName, PresetDefinition, AccentColorName } from '../types';
import { SettingsManager } from './settings-manager';
import { StateManager } from './state-manager';
import { ACCENT_PALETTES, MAC_FONTS_FALLBACK } from './constants';

export class PresetManager {
  private readonly presets: Map<PresetName, PresetDefinition> = new Map();

  constructor(
    private readonly settingsManager: SettingsManager,
    private readonly stateManager: StateManager
  ) {
    this.registerPresets();
  }

  private registerPresets(): void {
    const commonMacSettings = {
      'editor.cursorBlinking': 'smooth',
      'editor.cursorSmoothCaretAnimation': 'on',
      'editor.smoothScrolling': 'true' as unknown as boolean,
      'workbench.list.smoothScrolling': true,
      'editor.lineNumbers': 'on',
      'editor.renderLineHighlight': 'all',
      'editor.fontLigatures': true,
      'editor.fontFamily': MAC_FONTS_FALLBACK,
      'workbench.tree.indent': 16,
      'workbench.tree.renderIndentGuides': 'always',
      'workbench.iconTheme': 'aeroui-icons',
      'window.density.editorTabHeight': 'compact',
      'workbench.editor.showTabs': 'multiple',
      'workbench.editor.tabSizing': 'shrink',
      'editor.minimap.enabled': false,
      'editor.scrollbar.horizontal': 'auto',
      'editor.scrollbar.vertical': 'auto',
      'editor.scrollbar.verticalScrollbarSize': 10
    };

    this.presets.set('macOS Dark', {
      name: 'macOS Dark',
      description: 'Refined Apple dark palette with deep graphite background and crisp accents',
      themeLabel: 'macOS Studio Dark',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Dark'
      }
    });

    this.presets.set('macOS Light', {
      name: 'macOS Light',
      description: 'Clean Apple light aesthetic with subtle platinum borders and soft shadows',
      themeLabel: 'macOS Studio Light',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Light'
      }
    });

    this.presets.set('macOS Midnight', {
      name: 'macOS Midnight',
      description: 'Ultra-deep space black finish inspired by modern dark room macOS mode',
      themeLabel: 'macOS Studio Midnight',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Midnight'
      }
    });

    this.presets.set('Minimal', {
      name: 'Minimal',
      description: 'Distraction-free macOS layout hiding unnecessary editor clutter',
      themeLabel: 'macOS Studio Minimal',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Minimal',
        'workbench.activityBar.location': 'top',
        'workbench.statusBar.visible': true,
        'breadcrumbs.enabled': false,
        'editor.glyphMargin': false,
        'editor.folding': true
      }
    });

    this.presets.set('Glass-inspired', {
      name: 'Glass-inspired',
      description: 'Translucent feel using layered tones, high contrast, and refined borders',
      themeLabel: 'macOS Studio Glass',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Glass',
        'editor.renderLineHighlight': 'line'
      }
    });

    this.presets.set('Classic', {
      name: 'Classic',
      description: 'Nostalgic Mac OS X Aqua-inspired color balance and refined code styling',
      themeLabel: 'macOS Studio Classic',
      settings: {
        ...commonMacSettings,
        'workbench.colorTheme': 'macOS Studio Classic'
      }
    });
  }

  public getPreset(name: PresetName): PresetDefinition | undefined {
    return this.presets.get(name);
  }

  public getAllPresets(): PresetDefinition[] {
    return Array.from(this.presets.values());
  }

  public async applyPreset(presetName: PresetName, accentColor?: AccentColorName): Promise<void> {
    const preset = this.presets.get(presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found.`);
    }

    const state = this.stateManager.getState();
    const activeAccent = accentColor || state.accentColor || 'appleBlue';

    // Generate color customizations for the accent color
    const palette = ACCENT_PALETTES[activeAccent] || ACCENT_PALETTES.appleBlue;
    const accentSettings: Record<string, unknown> = {
      'workbench.colorCustomizations': {
        'activityBarBadge.background': palette.main,
        'activityBarBadge.foreground': '#FFFFFF',
        'badge.background': palette.main,
        'badge.foreground': '#FFFFFF',
        'button.background': palette.main,
        'button.hoverBackground': palette.hover,
        'focusBorder': palette.main,
        'progressBar.background': palette.main,
        'textLink.foreground': palette.main,
        'textLink.activeForeground': palette.hover
      }
    };

    const mergedSettings = {
      ...preset.settings,
      ...accentSettings
    };

    await this.settingsManager.applySettings(mergedSettings);
    await this.stateManager.setActivePreset(presetName);
    await this.stateManager.setAccentColor(activeAccent);
    await this.stateManager.setEnabled(true);
  }

  public async restore(): Promise<void> {
    await this.settingsManager.restoreSettings();
    await this.stateManager.setEnabled(false);
  }
}
