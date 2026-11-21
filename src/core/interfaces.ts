export interface ConfigWorkspaceLike {
  getConfiguration(section?: string): {
    inspect<T>(section: string): { globalValue?: T } | undefined;
    get<T>(section: string): T | undefined;
    update(section: string, value: any, target: any): Promise<void>;
  };
}

export interface StateManagerLike {
  getState(): any;
  saveBackup(backup: any): Promise<void>;
  clearBackup(): Promise<void>;
  setActivePreset(preset: any): Promise<void>;
  setAccentColor(accent: any): Promise<void>;
  setEnabled(enabled: boolean): Promise<void>;
}
