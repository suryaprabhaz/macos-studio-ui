import { getVSCode } from './vscode-proxy';

export interface HostInfo {
  name: string;
  isVSCode: boolean;
  isCursor: boolean;
  isWindsurf: boolean;
  isAntigravity: boolean;
  isCodeOSS: boolean;
  appHost: string;
  supportsSmoothCursor: boolean;
  supportsColorCustomizations: boolean;
}

export class CompatibilityDetector {
  public static getHostInfo(): HostInfo {
    const vscode = getVSCode();
    const appName = (vscode?.env?.appName || 'vscode').toLowerCase();
    const isCursor = appName.includes('cursor');
    const isWindsurf = appName.includes('windsurf');
    const isAntigravity = appName.includes('antigravity');
    const isCodeOSS = appName.includes('code - oss') || appName.includes('code-oss');
    const isVSCode = !isCursor && !isWindsurf && !isAntigravity && !isCodeOSS;

    return {
      name: vscode?.env?.appName || 'Visual Studio Code',
      isVSCode,
      isCursor,
      isWindsurf,
      isAntigravity,
      isCodeOSS,
      appHost: vscode?.env?.appHost || 'desktop',
      supportsSmoothCursor: true,
      supportsColorCustomizations: true
    };
  }

  public static isSettingAvailable(settingKey: string): boolean {
    const vscode = getVSCode();
    if (!vscode) return true;

    try {
      const parts = settingKey.split('.');
      const section = parts.length > 1 ? parts[0] : '';
      const child = parts.length > 1 ? parts.slice(1).join('.') : settingKey;
      const config = vscode.workspace.getConfiguration(section);
      const inspection = config.inspect(child);
      return inspection !== undefined;
    } catch {
      return false;
    }
  }
}
