export type PresetName =
  | 'macOS Dark'
  | 'macOS Light'
  | 'macOS Midnight'
  | 'Minimal'
  | 'Glass-inspired'
  | 'Classic'
  | 'Default / Restore';

export type AccentColorName =
  | 'appleBlue'
  | 'applePurple'
  | 'applePink'
  | 'appleOrange'
  | 'appleGreen'
  | 'appleGraphite';

export interface AeroUISettingsBackup {
  [key: string]: unknown;
}

export interface PresetDefinition {
  name: PresetName;
  description: string;
  themeLabel: string;
  settings: Record<string, unknown>;
}

export interface AeroUIState {
  enabled: boolean;
  activePreset: PresetName;
  accentColor: AccentColorName;
  backup: AeroUISettingsBackup | null;
  lastAppliedTimestamp?: number;
}

export interface WebviewMessage {
  command:
    | 'enable'
    | 'disable'
    | 'toggle'
    | 'selectPreset'
    | 'restore'
    | 'setAccent'
    | 'getState'
    | 'updateSetting';
  preset?: PresetName;
  accent?: AccentColorName;
  key?: string;
  value?: unknown;
}
